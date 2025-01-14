import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createEnvResourceName, extractCleanedBranchName } from '../bin/env-helper';

export class BaseConstruct extends Construct {
  /**
   * The name of the current branch, if available.
   */
  public readonly branch: string | undefined;

  /**
   * The name of the current environment e.g. dev, test, staging, production.
   */
  public readonly environment: string;

  /**
   * The AWS account ID of the current stack.
   */
  public readonly account: string;

  /**
   * The AWS region of the current stack.
   */
  public readonly region: string;

  /**
   * Creates a new instance of the BaseConstruct.
   * @param scope - The parent construct.
   * @param id - The unique ID of the construct within the parent.
   */
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.branch = extractCleanedBranchName(process.env.GIT_BRANCH_REF);
    this.account = cdk.Stack.of(this).account;
    this.environment = process.env.ENVIRONMENT || 'dev';
    this.region = cdk.Stack.of(this).region;
  }

  /**
   * Generates a unique resource name that includes an optional branch suffix.
   * The generated name has a maximum length of 64 characters.
   * @param name - The base name for the resource.
   * @returns A unique resource name with an optional branch suffix.
   */
  unique(name: string): string {
    return createEnvResourceName(name);
  }
}
