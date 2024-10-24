import * as cdk from 'aws-cdk-lib';
import { generateUniqueResourceName } from './bin/env-helper';
import { BaseStack, GitHubOIDCStack, ToolkitCleanerStack } from './stacks';

// Inherit environment variables from npm run commands (displayed in .projen/tasks.json)
const environment = process.env.ENVIRONMENT || 'dev';
const awsEnvironment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// Instantiate the CDK app
const app = new cdk.App();

/**
 * These stacks should only be deployed a single time for each AWS account,
 * and never deployed via branch-based deployments.
 */
if (!process.env.GIT_BRANCH_REF) {
  /**
   * The ToolkitCleaner construct creates a state machine that runs every day
   * and removes unused S3 and ECR assets from your CDK Toolkit.
   * The state machine outputs the number of deleted assets and the total reclaimed size in bytes.
   */
  new ToolkitCleanerStack(app, generateUniqueResourceName('ToolkitCleanerStack'), {
    env: awsEnvironment,
  });
  /**
   * Add GitHub OpenID Connect support and create an IAM role for GitHub Actions deployments.
   * This stack is only created once per AWS environment, as the GitHub OIDC provider and
   * deployment role can be reused across all deployments for that environment.
   */
  new GitHubOIDCStack(app, generateUniqueResourceName('GitHubOIDCStack'), {
    env: awsEnvironment,
    environment: environment,
  });
}

// Create a new stack with your resources
new BaseStack(app, generateUniqueResourceName('BaseStack'), {
  env: awsEnvironment,
  environment: environment,
});

// Tag all resources in CloudFormation with the environment name
cdk.Tags.of(app).add('environment', `${environment}`);

app.synth();
