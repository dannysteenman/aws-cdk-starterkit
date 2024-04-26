import * as cdk from 'aws-cdk-lib';
import { ToolkitCleaner } from 'cloudstructs/lib/toolkit-cleaner';
import type { Construct } from 'constructs';

export class ToolkitCleanerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ToolkitCleaner(this, 'ToolkitCleaner');
  }
}
