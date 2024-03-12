// eslint-disable-next-line import/no-extraneous-dependencies
import { github } from 'projen';

export function githubCICD(gh: github.GitHub, account: string, env: string, nodeVersion: string) {
  // Add a GitHub workflow for deploying the CDK stacks to the AWS accountde .
  const cdkDeploymentWorkFlow = new github.GithubWorkflow(gh, `cdk-deploy-${env}`);
  cdkDeploymentWorkFlow.on({
    push: {
      branches: ['main'],
    },
    workflowDispatch: {},
  });

  cdkDeploymentWorkFlow.addJobs({
    deploy: {
      name: `Deploy CDK stacks to ${env} AWS account`,
      runsOn: ['ubuntu-latest'],
      permissions: {
        actions: github.workflows.JobPermission.WRITE,
        contents: github.workflows.JobPermission.READ,
        idToken: github.workflows.JobPermission.WRITE,
      },
      steps: [
        {
          name: 'Checkout repository',
          uses: 'actions/checkout@v4',
        },
        {
          name: 'Setup nodejs environment',
          uses: 'actions/setup-node@v4',
          with: {
            'node-version': `>=${nodeVersion}`,
            'cache': 'npm',
          },
        },
        {
          name: 'Configure AWS credentials',
          uses: 'aws-actions/configure-aws-credentials@v4',
          with: {
            'role-to-assume': `arn:aws:iam::${account}:role/GitHubDeployRole`,
            'aws-region': process.env.CDK_DEFAULT_REGION,
          },
        },
        {
          name: 'Install dependencies',
          run: 'npm ci',
        },
        {
          name: `Run CDK synth for the ${env.toUpperCase()} environment`,
          run: `npm run ${env}:synth`,
        },
        {
          name: `Deploy CDK to the ${env.toUpperCase()} environment on AWS account ${account}`,
          run: `npm run ${env}:deploy`,
        },
      ],
    },
  });
}
