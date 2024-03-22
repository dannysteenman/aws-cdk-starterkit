# AWS CDK Constructs: BaseConstruct and NetworkConstruct

This README provides a comprehensive guide to understanding and utilizing the `BaseConstruct` and `NetworkConstruct` within your AWS CDK project, emphasizing the importance of environment-aware configurations.

## BaseConstruct

The `BaseConstruct` serves as a foundational construct from which other constructs can inherit. It provides essential properties that are common across different environments, such as development (`dev`), testing (`test`), staging (`staging`), and production (`production`).

### Properties

- `environment`: Determines the environment context (`dev`, `test`, `staging`, `production`). Defaults to `dev` if not specified.
- `account`: The AWS account ID where resources will be deployed.
- `region`: The AWS region where resources will be deployed.

### Usage

When creating a new construct that requires environment-specific logic, you can extend `BaseConstruct` to inherit these properties. This approach streamlines the process of applying conditional logic based on the environment.

```typescript
import { BaseConstruct } from './base-construct';

class MyConstruct extends BaseConstruct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    // Your construct logic here, with access to this.environment, this.account, this.region
  }
}
```

## NetworkConstruct

The NetworkConstruct extends BaseConstruct and showcases how to leverage inherited properties to configure resources differently across environments. It focuses on deploying a Virtual Private Cloud (VPC) with environment-specific settings.

### Features

- VPC Configuration: Deploys a VPC with a varying number of NAT gateways and IP ranges based on the environment.
- S3 Flow Logs: Configures VPC Flow Logs, stored in an S3 bucket with environment-specific policies for object deletion and removal.

**Environment-Specific Logic**

- **IP Ranges**: Sets the VPC's CIDR block based on the environment:
  - dev: 172.16.0.0/16
  - test: 172.17.0.0/16
  - production: 172.18.0.0/16
- **NAT Gateways**: Deploys a single NAT gateway for non-production environments and three for production, optimizing cost and high availability.
- **S3 Bucket Policies**: For non-production environments, automatically enables object deletion and bucket removal upon stack deletion. Production environments use default settings for manual management.

Example to enable this construct in your stack:

```typescript
import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { NetworkConstruct } from '../constructs';

export interface BaseStackProps extends cdk.StackProps {
  /**
   * Determine the stage to which you want to deploy the stack
   *
   * @default - If not given, it will throw out an error
   */
  readonly environment?: string;
}

export class BaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    // ↓↓ instantiate your constructs here ↓↓
    new NetworkConstruct(this, 'NetworkConstruct'); // sample construct that creates a VPC
  }
}
```
