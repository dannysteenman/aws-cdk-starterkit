import { awscdk } from 'projen';
import { DependabotScheduleInterval } from 'projen/lib/github';
import { NodePackageManager } from 'projen/lib/javascript';
import { YamlFile } from 'projen/lib/yaml';
import { createCdkDeploymentWorkflows } from './src/bin/cicd-helper';
import { addCdkActionTask } from './src/bin/env-helper';

// Set the minimum node version for AWS CDK and the GitHub actions workflow
const nodeVersion = '20.0.0';

/* Define the AWS region for the CDK app and github workflows
Default to us-east-1 if AWS_REGION is not set in your environment variables */
const awsRegion = process.env.AWS_REGION || 'us-east-1';

/**
 * Define the name of the GitHub deploy role that will be created by the GitHubOIDCStack.
 * Set this as an environment variable for the projen tasks, so other parts of the project
 * can reference the role name.
 * The default role name is 'GitHubDeployRole'.
 */
const githubRole = 'GitHubDeployRole';

/**
 * Creates a new AWS CDK TypeScript application project.
 */
const project = new awscdk.AwsCdkTypeScriptApp({
  authorName: 'Danny Steenman',
  authorUrl: 'https://towardsthecloud.com',
  authorEmail: 'danny@towardsthecloud.com',
  authorOrganization: true,
  name: 'aws-cdk-starterkit',
  description: 'Create and deploy an AWS CDK app on your AWS account in less than 5 minutes using GitHub actions!',
  cdkVersion: '2.150.0', // Find the latest CDK version here: https://www.npmjs.com/package/aws-cdk-lib
  cdkVersionPinning: true,
  defaultReleaseBranch: 'main',
  packageManager: NodePackageManager.NPM,
  minNodeVersion: nodeVersion,
  projenVersion: '0.84.8', // Find the latest projen version here: https://www.npmjs.com/package/projen
  projenrcTs: true,
  release: true,
  deps: ['aws-cdk-github-oidc', 'cloudstructs'] /* Runtime dependencies of this module. */,
  autoApproveOptions: {
    allowedUsernames: ['dependabot', 'dependabot[bot]', 'github-bot', 'github-actions[bot]'],
  },
  dependabot: true,
  dependabotOptions: {
    scheduleInterval: DependabotScheduleInterval.WEEKLY,
    labels: ['dependencies', 'auto-approve'],
    groups: {
      default: {
        patterns: ['*'],
        excludePatterns: ['aws-cdk*', 'projen'],
      },
    },
    ignore: [{ dependencyName: 'aws-cdk-lib' }, { dependencyName: 'aws-cdk' }],
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

// Override auto-approve workflow to use the new version when autoApproveOptions is set
const autoApproveWorkflow = project.tryFindObjectFile('.github/workflows/auto-approve.yml');
if (autoApproveWorkflow && autoApproveWorkflow instanceof YamlFile) {
  autoApproveWorkflow.addOverride('jobs.approve.steps.0.uses', 'hmarr/auto-approve-action@v4');
}

// Define the target AWS accounts for the different environments
type Environment = 'dev' | 'test' | 'staging' | 'production';
const targetAwsAccounts: Record<Environment, string | undefined> = {
  dev: '987654321012',
  test: '123456789012',
  staging: undefined,
  production: undefined,
};

/* Add npm run commands that you can use to deploy to each environment
The environment variables are passed to the CDK CLI to deploy to the correct account and region
The `cdkDeploymentTask` function is defined in the `src/bin/helper.ts` file
You can now run a command like: `npm run dev:synth` to synthesize your aws cdk dev stacks */
const github = project.github;
if (github) {
  for (const [env, awsAccount] of Object.entries(targetAwsAccounts)) {
    if (awsAccount) {
      // Adds customized 'npm run' commands for executing cdk synth, test, deploy and diff for each environment
      addCdkActionTask(project, {
        CDK_DEFAULT_ACCOUNT: awsAccount,
        CDK_DEFAULT_REGION: awsRegion,
        ENVIRONMENT: env,
        GITHUB_DEPLOY_ROLE: githubRole,
      });

      // Adds GitHub action workflows for deploying the CDK stacks to the target AWS account
      createCdkDeploymentWorkflows(github, awsAccount, awsRegion, env, githubRole, nodeVersion);

      // Adds a separate task with the GIT_BRANCH_REF env variable for the dev environment
      if (env === 'dev') {
        addCdkActionTask(project, {
          CDK_DEFAULT_ACCOUNT: awsAccount,
          CDK_DEFAULT_REGION: awsRegion,
          ENVIRONMENT: env,
          GITHUB_DEPLOY_ROLE: githubRole,
          GIT_BRANCH_REF: '$(git rev-parse --abbrev-ref HEAD)',
        });
        const isBranchDeployment = true;
        createCdkDeploymentWorkflows(github, awsAccount, awsRegion, env, githubRole, nodeVersion, isBranchDeployment);
      }
    }
  }
}

project.synth();
