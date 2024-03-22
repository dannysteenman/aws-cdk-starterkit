import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
// import { NetworkConstruct } from '../constructs';

export interface BaseStackProps extends cdk.StackProps {
  /**
   * Determine the stage to which you want to deploy the stack
   *
   * @default - If not given, it will throw out an error
   */
  readonly environment?: string;
}

export class BaseStack extends cdk.Stack {
  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    // ↓↓ instantiate your constructs here ↓↓
    // new NetworkConstruct(this, 'NetworkConstruct'); // sample construct that creates a VPC
  }
}
