// eslint-disable-next-line import/no-extraneous-dependencies
import type { awscdk } from 'projen';

export interface Environment {
  [key: string]: string;
  /**
  * Choose the environment you want to deploy your CDK stacks to
  *
  * Usage example:
    ENVIRONMENT: 'dev'
  */
  ENVIRONMENT: 'dev' | 'test' | 'staging' | 'production';
}

export function cdkActionTask(cdkProject: awscdk.AwsCdkTypeScriptApp, environment: Environment) {
  const { ENVIRONMENT: stage } = environment;
  const taskActions = ['synth', 'diff', 'deploy', 'destroy'];
  const stackNamePattern = `*Stack-${stage}`;

  for (const action of taskActions) {
    const taskName = `${stage}:${action}`;
    const taskDescription = `${
      action.charAt(0).toUpperCase() + action.slice(1)
    } the stacks on the ${stage.toUpperCase()} account`;

    let execCommand = `cdk ${action} --require-approval never ${stackNamePattern}`;
    if (action === 'destroy') execCommand = `cdk destroy --force ${stackNamePattern}`;
    if (action === 'synth') execCommand = 'cdk synth';

    cdkProject.addTask(taskName, {
      description: taskDescription,
      env: environment,
      exec: execCommand,
    });
  }
}
