import { RemovalPolicy } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import { BaseConstruct } from './index';

// inherit environment, account, and region from BaseConstruct
export class NetworkConstruct extends BaseConstruct {
  vpc: ec2.Vpc;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    interface BucketProps {
      autoDeleteObjects?: boolean;
      removalPolicy?: RemovalPolicy;
    }

    const bucketProps: BucketProps =
      this.environment === 'production'
        ? {}
        : {
            autoDeleteObjects: true,
            removalPolicy: RemovalPolicy.DESTROY,
          };

    // Create a VPC with 9 subnets divided over 3 AZ's (3 public, 3 private, 3 isolated)
    this.vpc = new ec2.Vpc(this, 'Vpc', {
      // Set the VPC's IP range based on the environment
      ipAddresses: ec2.IpAddresses.cidr(
        this.environment === 'dev' ? '172.16.0.0/16' : this.environment === 'test' ? '172.17.0.0/16' : '172.18.0.0/16',
      ),
      natGateways: this.environment === 'production' ? 3 : 1,
      maxAzs: 3,
      gatewayEndpoints: {
        s3Endpoint: {
          service: ec2.GatewayVpcEndpointAwsService.S3,
        },
        dynamoDBEndpoint: {
          service: ec2.GatewayVpcEndpointAwsService.DYNAMODB,
        },
      },
      flowLogs: {
        s3: {
          destination: ec2.FlowLogDestination.toS3(
            new s3.Bucket(this, 'VpcFlowLogBucket', {
              // Create a unique bucket name for the VPC flow logs (works for branch based deploys)
              bucketName: this.unique(`vpc-flow-logs-${this.account}`),
              encryption: s3.BucketEncryption.S3_MANAGED,
              blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
              ...bucketProps,
            }),
          ),
          trafficType: ec2.FlowLogTrafficType.REJECT,
        },
      },
      subnetConfiguration: [
        {
          cidrMask: 20,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 20,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 20,
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });
  }
}
