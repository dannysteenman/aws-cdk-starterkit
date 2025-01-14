import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ToolkitCleaner } from 'cloudstructs/lib/toolkit-cleaner';
import type { Construct } from 'constructs';
import { getGitRepositoryDetails } from '../bin/git-helper';

export interface FoundationStackProps extends cdk.StackProps {
  /**
   * Determine the stage to which you want to deploy the stack
   *
   * @default - If not given, it will throw out an error
   */
  readonly environment: string;
}

/**
 * FoundationStack
 *
 * This stack sets up fundamental infrastructure components for AWS deployments via GitHub Actions.
 * It includes the creation of an OpenID Connect (OIDC) provider for GitHub and an IAM role for
 * GitHub Actions deployments.
 *
 * @extends cdk.Stack
 *
 * @remarks
 * - Creates a GitHub OIDC provider
 * - Sets up an IAM role for GitHub Actions with necessary permissions
 * - Implements a ToolkitCleaner for managing CDK toolkit resources
 *
 * @param scope - The scope in which to define this construct
 * @param id - The scoped construct ID
 * @param props - Stack properties
 */
export class FoundationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FoundationStackProps) {
    super(scope, id, props);

    ////////////////////////////////
    // Setup GitHub OIDC support //
    //////////////////////////////
    const { gitOwner, gitRepoName } = getGitRepositoryDetails();

    const githubDomain = 'token.actions.githubusercontent.com';

    const openIdConnectProvider = new iam.OpenIdConnectProvider(this, 'GithubProvider', {
      url: `https://${githubDomain}`,
      clientIds: ['sts.amazonaws.com'],
    });

    const conditions: iam.Conditions = {
      StringLike: {
        [`${githubDomain}:sub`]: `repo:${gitOwner}/${gitRepoName}:environment:${props.environment}`,
      },
      StringEquals: {
        [`${githubDomain}:aud`]: 'sts.amazonaws.com',
      },
    };

    new iam.Role(this, 'GitHubActionsServiceRole', {
      assumedBy: new iam.WebIdentityPrincipal(openIdConnectProvider.openIdConnectProviderArn, conditions),
      description: 'This role is used via GitHub Actions to deploy with AWS CDK or Terraform on the target AWS account',
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
      maxSessionDuration: cdk.Duration.hours(2),
      roleName: process.env.GITHUB_DEPLOY_ROLE ?? 'GitHubActionsServiceRole',
    });

    ////////////////////////////////
    // Setup CDK Toolkit Cleaner //
    //////////////////////////////
    new ToolkitCleaner(this, 'ToolkitCleaner');
  }
}
