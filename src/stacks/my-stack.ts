import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';

export interface MyStackProps extends cdk.StackProps {
  /**
   * Determine the stage to which you want to deploy the stack
   *
   * @default - If not given, it will throw out an error
   */
  readonly environment?: string;
}

export class MyStack extends cdk.Stack {
  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor(scope: Construct, id: string, props: MyStackProps) {
    super(scope, id, props);

    // define resources here...
  }
}
