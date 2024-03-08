import { awscdk } from 'projen';
import { NodePackageManager } from 'projen/lib/javascript';
import { cdkActionTask } from './src/bin/env-helper';

const project = new awscdk.AwsCdkTypeScriptApp({
  authorName: 'Danny Steenman',
  authorUrl: 'https://towardsthecloud.com',
  authorEmail: 'danny@towardsthecloud.com',
  authorOrganization: true,
  name: 'aws-cdk-starterkit',
  description: 'Create and deploy an AWS CDK app on your AWS account in less than 5 minutes using GitHub actions!',
  cdkVersion: '2.131.0', // Find the latest CDK version here: https://www.npmjs.com/package/aws-cdk-lib
  defaultReleaseBranch: 'main',
  packageManager: NodePackageManager.NPM,
  projenrcTs: true,
  deps: ['aws-cdk-github-oidc'] /* Runtime dependencies of this module. */,
  // devDeps: []                /* Build dependencies for this module. */,
});

/* Add npm run commands that you can use to deploy to each environment
The environment variables are passed to the CDK CLI to deploy to the correct account and region
The `cdkDeploymentTask` function is defined in the `src/bin/helper.ts` file
You can now run a command like: `npm run dev:synth` to synthesize your aws cdk dev stacks */
cdkActionTask(project, {
  CDK_DEFAULT_ACCOUNT: '987654321012', // Replace with your AWS account number
  CDK_DEFAULT_REGION: 'us-east-1', // Replace with your AWS region
  ENVIRONMENT: 'dev', // Replace with your environment
});

cdkActionTask(project, {
  CDK_DEFAULT_ACCOUNT: '123456789012',
  CDK_DEFAULT_REGION: 'us-east-1',
  ENVIRONMENT: 'test',
});

project.synth();
