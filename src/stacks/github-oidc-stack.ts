import { GithubActionsRole } from 'aws-cdk-github-oidc';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';
import { getGitRepositoryDetails } from '../bin/git-helper';

export interface GitHubOIDCStackProps extends cdk.StackProps {
  /**
   * Determine the stage to which you want to deploy the stack
   *
   * @default - If not given, it will throw out an error
   */
  readonly environment: string;
}

/**
 * A CDK stack that sets up a GitHub Actions OIDC provider and a deployment role.
 * The deployment role is granted the 'AdministratorAccess' managed policy.
 */
export class GitHubOIDCStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GitHubOIDCStackProps) {
    super(scope, id, props);

    // Retrieve the Git repository owner and name
    const { gitOwner, gitRepoName } = getGitRepositoryDetails();

    // Create a GitHub Actions OIDC provider
    const openIdConnectProvider = new iam.OpenIdConnectProvider(this, 'GithubProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    // Create a GitHub Actions deployment role
    const deployRole = new GithubActionsRole(this, 'GitHubDeployRole', {
      provider: openIdConnectProvider,
      owner: gitOwner,
      repo: gitRepoName,
      filter: `environment:${props.environment}`,
      roleName: `${process.env.GITHUB_DEPLOY_ROLE}`,
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
      description: 'This role is used via GitHub Actions to deploy your AWS CDK stacks on your AWS account',
      maxSessionDuration: cdk.Duration.hours(2),
    });

    // Output the deployment role ARN
    new cdk.CfnOutput(this, 'DeployRole', {
      value: deployRole.roleArn,
    });
  }
}
