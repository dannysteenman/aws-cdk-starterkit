// eslint-disable-next-line import/no-extraneous-dependencies
import type { awscdk } from 'projen';

/**
 * Adds customized 'npm run' commands for executing AWS CDK actions (synth, diff, deploy, destroy)
 * for a specific environment and branch (if applicable).
 * @param cdkProject - The `AwsCdkTypeScriptApp` instance.
 * @param targetEnvironment - An object containing the environment-specific configuration,
 * including the AWS account ID and the environment name.
 */
export function addCdkActionTask(cdkProject: awscdk.AwsCdkTypeScriptApp, targetAccount: { [name: string]: string }) {
  const taskActions = ['synth', 'diff', 'deploy', 'destroy'];
  const stackNamePattern = '*Stack*';

  for (const action of taskActions) {
    const taskName = targetAccount.GIT_BRANCH_REF
      ? `branch:${targetAccount.ENVIRONMENT}:${action}`
      : `${targetAccount.ENVIRONMENT}:${action}`;

    const taskDescription = `${
      action.charAt(0).toUpperCase() + action.slice(1)
    } the stacks on the ${targetAccount.ENVIRONMENT.toUpperCase()} account`;

    let execCommand = `cdk ${action} --require-approval never ${stackNamePattern}`;
    if (action === 'destroy') execCommand = `cdk destroy --force ${stackNamePattern}`;
    if (action === 'synth') execCommand = 'cdk synth';

    cdkProject.addTask(taskName, {
      description: taskDescription,
      env: targetAccount,
      exec: execCommand,
    });
  }
}

/**
 * Extracts the branch name from the Git branch reference, excluding certain branches.
 * The extracted branch name is cleaned and truncated to a maximum of 25 characters.
 * @param gitBranchRef - The Git branch reference.
 * @returns The cleaned and truncated branch name, or `undefined` if the branch should be excluded.
 */
export function extractCleanedBranchName(gitBranchRef: string | undefined): string | undefined {
  if (!gitBranchRef) {
    return undefined;
  }

  const gitTagRegex = /v\d+\.\d+\.\d+$/;
  if (gitTagRegex.test(gitBranchRef)) {
    return undefined;
  }

  const lowerCaseBranchName = gitBranchRef.toLowerCase();
  const parts = lowerCaseBranchName.split('/');
  const lastPart = parts[parts.length - 1];

  // Exclude main and development branches from the branch-based naming
  if (lastPart === 'main' || lastPart === 'develop' || lastPart === 'development') {
    return undefined;
  }

  // Filter out all characters except a-Z and hyphen
  const branchNameWithoutSpecialCharacters = lastPart.replace(/[^a-zA-Z0-9-]/g, '').replace(/-+$/, '');
  // Limit to 25 characters
  return branchNameWithoutSpecialCharacters.substring(0, 25);
}

/**
 * Generates a unique resource name that includes a branch suffix, if available, or an environment suffix.
 * The generated name has a maximum length of 64 characters.
 * @param baseName - The base name for the resource.
 * @returns A unique resource name with a branch or environment suffix.
 */
export function generateUniqueResourceName(baseName: string): string {
  const branchName = extractCleanedBranchName(process.env.GIT_BRANCH_REF);
  const environment = process.env.ENVIRONMENT || 'dev';
  const resourceName = branchName ? `${baseName}-${branchName}` : `${baseName}-${environment}`;

  if (resourceName.length <= 64) {
    return resourceName;
  }

  // Truncate the resource name to 64 characters, preserving alphanumeric characters at the end
  return resourceName.slice(0, 64).replace(/[^a-zA-Z0-9]+$/, '');
}
