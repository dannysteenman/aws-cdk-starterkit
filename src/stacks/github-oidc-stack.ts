import { GithubActionsIdentityProvider, GithubActionsRole } from 'aws-cdk-github-oidc';
import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';
import { getGitRepoDetails } from '../bin/git-helper';

interface GitHubOIDCStackProps extends StackProps {}

export class GitHubOIDCStack extends Stack {
  constructor(scope: Construct, id: string, props: GitHubOIDCStackProps) {
    super(scope, id, props);

    const { gitOwner, repoName } = getGitRepoDetails();

    const provider = GithubActionsIdentityProvider.fromAccount(this, 'GithubProvider');

    const deployRole = new GithubActionsRole(this, 'GitHubDeployRole', {
      provider: provider,
      owner: gitOwner,
      repo: repoName,
      roleName: 'GitHubDeployRole',
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
    });

    new CfnOutput(this, 'DeployRole', {
      value: deployRole.roleArn,
    });
  }
}
