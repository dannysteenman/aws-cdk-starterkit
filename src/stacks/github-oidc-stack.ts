import { GithubActionsIdentityProvider, GithubActionsRole } from 'aws-cdk-github-oidc';
import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';
import { getGitRepositoryDetails } from '../bin/git-helper';

interface GitHubOIDCStackProps extends StackProps {}

/**
 * A CDK stack that sets up a GitHub Actions OIDC provider and a deployment role.
 * The deployment role is granted the 'AdministratorAccess' managed policy.
 */
export class GitHubOIDCStack extends Stack {
  constructor(scope: Construct, id: string, props: GitHubOIDCStackProps) {
    super(scope, id, props);

    // Retrieve the Git repository owner and name
    const { gitOwner, gitRepoName } = getGitRepositoryDetails();

    // Create a GitHub Actions OIDC provider
    const provider = GithubActionsIdentityProvider.fromAccount(this, 'GithubProvider');

    // Create a GitHub Actions deployment role
    const deployRole = new GithubActionsRole(this, 'GitHubDeployRole', {
      provider: provider,
      owner: gitOwner,
      repo: gitRepoName,
      roleName: `${process.env.GITHUB_DEPLOY_ROLE}`,
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
    });

    // Output the deployment role ARN
    new CfnOutput(this, 'DeployRole', {
      value: deployRole.roleArn,
    });
  }
}
