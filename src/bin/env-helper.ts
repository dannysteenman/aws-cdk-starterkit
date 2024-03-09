// eslint-disable-next-line import/no-extraneous-dependencies
import type { awscdk } from 'projen';

export function cdkActionTask(cdkProject: awscdk.AwsCdkTypeScriptApp, targetAccount: { [name: string]: string }) {
  const taskActions = ['synth', 'diff', 'deploy', 'destroy'];
  const stackNamePattern = `*Stack-${targetAccount.ENVIRONMENT}`;

  for (const action of taskActions) {
    const taskName = `${targetAccount.ENVIRONMENT}:${action}`;
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
