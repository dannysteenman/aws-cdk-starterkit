import * as cdk from 'aws-cdk-lib';
import { generateUniqueResourceName } from './bin/env-helper';
import { BaseStack, GitHubOIDCStack } from './stacks';

// Inherit environment variables from npm run commands (displayed in .projen/tasks.json)
const environment = process.env.ENVIRONMENT || 'dev';
const awsEnvironment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

// Instantiate the CDK app
const app = new cdk.App();

/**
 * Add GitHub OpenID Connect support and create an IAM role for GitHub Actions deployments.
 * This stack is only created once per AWS environment, as the GitHub OIDC provider and
 * deployment role can be reused across all deployments for that environment.
 */
if (!process.env.GIT_BRANCH_REF) {
  new GitHubOIDCStack(app, generateUniqueResourceName('GitHubOIDCStack'), {
    env: awsEnvironment,
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
