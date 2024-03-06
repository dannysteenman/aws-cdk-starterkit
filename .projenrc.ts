import { awscdk } from 'projen';
import { NodePackageManager } from 'projen/lib/javascript';

const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.130.0',
  defaultReleaseBranch: 'main',
  name: 'aws-cdk-starterkit',
  description: 'Create and deploy an AWS CDK app on your AWS account in less than 5 minutes!',
  projenrcTs: true,
  packageManager: NodePackageManager.NPM,

  // deps: [],                /* Runtime dependencies of this module. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
