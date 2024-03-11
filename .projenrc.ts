import { awscdk, github } from 'projen';
import { NodePackageManager } from 'projen/lib/javascript';
import { githubCICD } from './src/bin/cicd-helper';
import { cdkActionTask } from './src/bin/env-helper';

// Set the minimum node version for AWS CDK and the GitHub actions workflow
const nodeVersion = '20.0.0';

const project = new awscdk.AwsCdkTypeScriptApp({
  authorName: 'Danny Steenman',
  authorUrl: 'https://towardsthecloud.com',
  authorEmail: 'danny@towardsthecloud.com',
  authorOrganization: true,
  name: 'aws-cdk-starterkit',
  description: 'Create and deploy an AWS CDK app on your AWS account in less than 5 minutes using GitHub actions!',
  cdkVersion: '2.131.0', // Find the latest CDK version here: https://www.npmjs.com/package/aws-cdk-lib
  cdkVersionPinning: true,
  defaultReleaseBranch: 'main',
  packageManager: NodePackageManager.NPM,
  minNodeVersion: nodeVersion,
  projenrcTs: true,
  deps: ['aws-cdk-github-oidc'] /* Runtime dependencies of this module. */,
  // devDeps: []                /* Build dependencies for this module. */,
  githubOptions: {
    pullRequestLint: false,
  },
  pullRequestTemplateContents: [
    '## Pull request checklist\n',
    'Please check if your PR fulfills the following requirements:\n',
    '- [ ] Docstrings or comments have been reviewed and added/updated if needed.',
    '- [ ] The change has been tested and confirmed working.\n',
    '## Pull request type\n',
    '<!-- Please do not submit updates to dependencies unless it fixes an issue. -->\n',
    '<!-- Please try to limit your pull request to one type, submit multiple pull requests if needed. -->\n',
    'Please check the type of change your PR introduces:\n',
    '- [ ] Bugfix (if its an open issue, please add the issue number).',
    '- [ ] Feature (e.g., new script).',
    '- [ ] Code style update (formatting, renaming).',
    '- [ ] Refactoring (no functional changes, no API changes).',
    '- [ ] Build related changes (build scripts, build configs, etc.).',
    '- [ ] Documentation content changes.',
    '- [ ] Other (please describe):\n',
    '## Pull request description\n',
    '<!-- Please describe your changes here. -->\n',
    '## Related issues\n',
    '<!-- If this PR addresses an existing issue, please provide the issue number here -->\n',
  ],
  gitignore: [
    '__pycache__',
    '__pycache__/',
    '!.eslintrc.js',
    '.cache',
    '.coverage.*',
    '.coverage',
    '.DS_Store',
    '.env',
    '.mypy_cache',
    '.pytest_cache',
    '.Python',
    '.venv/',
    '.vscode',
    '*.js',
    '*.log',
    '*.manifest',
    '*.pyc',
    '*.spec',
    '*.zip',
    '**/cdk-test-report.xml',
    '*node_modules*',
    'build/',
    'coverage/',
    'dist/',
    'downloads/',
    'env/',
    'ENV/',
    'htmlcov/',
    'sdist/',
    'var/',
    'venv/',
  ],
});

// Define the AWS Region for the CDK app
project.tasks.addEnvironment('CDK_DEFAULT_REGION', 'us-east-1');

// Define the target AWS accounts for the different environments
type Environment = 'dev' | 'test' | 'staging' | 'production';
const targetAccounts: Record<Environment, string | undefined> = {
  dev: '987654321012',
  test: '123456789012',
  staging: undefined,
  production: undefined,
};

/* Add npm run commands that you can use to deploy to each environment
The environment variables are passed to the CDK CLI to deploy to the correct account and region
The `cdkDeploymentTask` function is defined in the `src/bin/helper.ts` file
You can now run a command like: `npm run dev:synth` to synthesize your aws cdk dev stacks */
const gh = new github.GitHub(project);
for (const [env, account] of Object.entries(targetAccounts)) {
  if (account) {
    // Adds customized 'npm run' commands for executing cdk synth, test, deploy and diff for each environment
    cdkActionTask(project, {
      CDK_DEFAULT_ACCOUNT: account,
      ENVIRONMENT: env,
    });

    // Adds GitHub action workflows for deploying the CDK stacks to the target AWS account
    githubCICD(gh, account, env, nodeVersion);
  }
}

project.synth();
