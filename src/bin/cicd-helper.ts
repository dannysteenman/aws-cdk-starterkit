// eslint-disable-next-line import/no-extraneous-dependencies
import { github } from 'projen';

/**
 * Creates GitHub workflows for deploying and destroying AWS CDK stacks.
 * @param gh - An instance of the `github.GitHub` class, used to create the GitHub workflows.
 * @param account - The AWS account ID to which the CDK stacks will be deployed.
 * @param env - The environment (e.g., "test", "staging", "production") for which the CDK stacks will be deployed.
 * @param nodeVersion - The version of Node.js to be used for the deployment.
 * @param deployForBranch - A boolean flag that determines whether the deployment should be done for a feature branch or the main branch.
 */
export function createCdkDeploymentWorkflows(
  gh: github.GitHub,
  account: string,
  env: string,
  nodeVersion: string,
  deployForBranch = false,
) {
  createCdkDeploymentWorkflow(gh, account, env, nodeVersion, deployForBranch);

  if (deployForBranch) {
    createCdkDestroyWorkflow(gh, env);
  }
}

/**
 * Creates a GitHub workflow for deploying the CDK stacks to the AWS account.
 * @param gh - An instance of the `github.GitHub` class, used to create the GitHub workflow.
 * @param account - The AWS account ID to which the CDK stacks will be deployed.
 * @param env - The environment (e.g., "test", "staging", "production") for which the CDK stacks will be deployed.
 * @param nodeVersion - The version of Node.js to be used for the deployment.
 * @param deployForBranch - A boolean flag that determines whether the deployment should be done for a feature branch or the main branch.
 * @returns The created `github.GithubWorkflow` instance.
 */
function createCdkDeploymentWorkflow(
  gh: github.GitHub,
  account: string,
  env: string,
  nodeVersion: string,
  deployForBranch: boolean,
): github.GithubWorkflow {
  const cdkDeploymentWorkflow = new github.GithubWorkflow(gh, `cdk-deploy-${env}${deployForBranch ? '-branch' : ''}`);
  cdkDeploymentWorkflow.on({
    push: deployForBranch
      ? { branches: ['**', '!main', '!hotfix/*'] }
      : env !== 'production'
        ? { branches: ['main'] }
        : undefined,
    workflowDispatch: {},
  });

  const commonWorkflowSteps = getCommonWorkflowSteps(account, nodeVersion);

  cdkDeploymentWorkflow.addJobs({
    deploy: {
      name: `Deploy CDK stacks to ${env} AWS account${deployForBranch ? ' (Branch)' : ''}`,
      runsOn: ['ubuntu-latest'],
      permissions: {
        actions: github.workflows.JobPermission.WRITE,
        contents: github.workflows.JobPermission.READ,
        idToken: github.workflows.JobPermission.WRITE,
      },
      steps: commonWorkflowSteps.concat([
        {
          name: `Run CDK synth for the ${env.toUpperCase()} environment`,
          run: deployForBranch ? `npm run branch:${env}:synth` : `npm run ${env}:synth`,
        },
        {
          name: `Deploy CDK to the ${env.toUpperCase()} environment on AWS account ${account}`,
          run: deployForBranch ? `npm run branch:${env}:deploy` : `npm run ${env}:deploy`,
        },
      ]),
    },
  });

  return cdkDeploymentWorkflow;
}

/**
 * Creates a GitHub workflow for destroying the CDK stacks deployed for feature branches.
 * @param gh - An instance of the `github.GitHub` class, used to create the GitHub workflow.
 * @param env - The environment (e.g., "test", "staging", "production") for which the CDK stacks were deployed.
 * @returns The created `github.GithubWorkflow` instance.
 */
function createCdkDestroyWorkflow(gh: github.GitHub, env: string): github.GithubWorkflow {
  const cdkDestroyWorkflow = new github.GithubWorkflow(gh, `cdk-destroy-${env}-branch`);
  cdkDestroyWorkflow.on({
    workflowDispatch: {},
    delete: {},
  });

  const commonWorkflowSteps = getCommonWorkflowSteps(undefined, undefined);

  cdkDestroyWorkflow.addJobs({
    destroy: {
      name: 'Remove deployment of feature branch',
      if: "github.head_ref != 'main' || (github.event.ref_type == 'branch' && github.event_name == 'delete') || github.event_name == 'workflow_dispatch'",
      runsOn: ['ubuntu-latest'],
      permissions: {
        idToken: github.workflows.JobPermission.WRITE,
        contents: github.workflows.JobPermission.READ,
        packages: github.workflows.JobPermission.READ,
      },
      steps: commonWorkflowSteps.concat([
        {
          name: 'Set destroyed branch name',
          id: 'destroy-branch',
          if: "github.event.ref_type == 'branch' && github.event_name == 'delete'",
          run: 'BRANCH=$(cat ${{ github.event_path }} | jq --raw-output \'.ref\'); echo "${{ github.repository }} has ${BRANCH} branch"; echo "DESTROY_BRANCH_NAME=$BRANCH" >> $GITHUB_OUTPUT',
        },
        {
          name: 'CDK destroy manually, current branch',
          if: "github.event_name == 'workflow_dispatch'",
          run: 'npm run branch:test:destroy',
          env: {
            GIT_BRANCH_REF: '${{ github.ref_name }}',
          },
        },
        {
          name: 'CDK destroy after deleting feature branch',
          if: "github.event.ref_type == 'branch' && github.event_name == 'delete'",
          run: 'npm run branch:test:destroy',
          env: {
            GIT_BRANCH_REF: '${{ steps.destroy-branch.outputs.DESTROY_BRANCH_NAME }}',
          },
        },
        {
          name: 'CDK destroy after closing PR',
          if: "github.event_name == 'pull_request'",
          run: 'npm run branch:test:destroy',
          env: {
            GIT_BRANCH_REF: '${{ github.head_ref }}',
          },
        },
      ]),
    },
  });

  return cdkDestroyWorkflow;
}

/**
 * Retrieves the common workflow steps for both the deployment and destruction workflows.
 * @param account - The AWS account ID to which the CDK stacks will be deployed.
 * @param nodeVersion - The version of Node.js to be used for the deployment.
 * @returns An array of common workflow steps.
 */
function getCommonWorkflowSteps(account: string | undefined, nodeVersion: string | undefined): github.workflows.Step[] {
  return [
    {
      name: 'Checkout repository',
      uses: 'actions/checkout@v4',
    },
    {
      name: 'Setup nodejs environment',
      uses: 'actions/setup-node@v4',
      with: {
        'node-version': nodeVersion ? `>=${nodeVersion}` : undefined,
        cache: 'npm',
      },
    },
    {
      name: 'Configure AWS credentials',
      uses: 'aws-actions/configure-aws-credentials@v4',
      with: {
        'role-to-assume': account ? `arn:aws:iam::${account}:role/GitHubDeployRole` : undefined,
        'aws-region': process.env.CDK_DEFAULT_REGION,
      },
    },
    {
      name: 'Install dependencies',
      run: 'npm ci',
    },
  ];
}
