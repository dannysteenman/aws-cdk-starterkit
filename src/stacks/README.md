# AWS CDK Stacks: StarterStack and FoundationStack

This documentation details the structure and functionality of three pivotal stacks within our AWS CDK TypeScript project: `StarterStack` and `FoundationStack`. These stacks lay the groundwork for deploying AWS resources with specific configurations and capabilities, tailored to different deployment stages and integration with GitHub Actions for CI/CD processes.

## StarterStack

The `StarterStack` serves as a foundation for building your AWS infrastructure using CDK. It provides a starting point for adding and organizing your AWS resources and constructs.

### Properties

- `environment`: Optional. Specifies the deployment stage (e.g., `dev`, `test`, `staging`, `production`). If not provided, an error will be thrown.

### Features

- Includes a `NetworkConstruct` that creates a secure VPC.
- Designed to be easily extendable with additional AWS resources and constructs.

### Usage

The `StarterStack` is intended to be customized and extended based on your specific infrastructure needs. You can add new constructs and resources within the constructor of this class.

### Example Usage

```typescript
import * as cdk from 'aws-cdk-lib';
import { StarterStack } from './stacks';

const environment = process.env.ENVIRONMENT || 'dev';
const awsEnvironment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

new StarterStack(app, `StarterStack-${environment}`, {
  env: awsEnvironment,
  environment: environment,
});
```

### Extending the Stack

To add new resources to the `StarterStack`, you can modify the constructor. For example, to add a new S3 bucket:

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';

// In the constructor:
new s3.Bucket(this, 'MyBucket', {
  bucketName: 'my-unique-bucket-name',
  versioned: true,
  encryption: s3.BucketEncryption.S3_MANAGED,
});
```

### Best Practices

- Organize your constructs logically within this stack.
- For complex infrastructures, consider creating additional stacks for different components.
- Remember to import necessary modules at the top of the file.
- Customize and extend the stack based on your specific infrastructure requirements.

The `StarterStack` provides a flexible foundation for your AWS CDK project, allowing you to incrementally build and organize your infrastructure as code.


## FoundationStack

The `FoundationStack` sets up fundamental infrastructure components for AWS deployments via GitHub Actions. It combines the functionality of the GitHubOIDCStack with additional features.

### Features

- GitHub Actions OIDC Provider: Sets up the OIDC provider for GitHub Actions within the AWS account.
- GitHub Deploy Role: Creates an IAM role with AdministratorAccess managed policy, assumable by GitHub Actions workflows.
- CDK Toolkit Cleaner: Implements a ToolkitCleaner for managing CDK toolkit resources.

### Properties

- `environment`: Required. Specifies the deployment stage (e.g., `dev`, `test`, `staging`, `production`).

### Example Usage

```typescript
import * as cdk from 'aws-cdk-lib';
import { FoundationStack } from './stacks';

const environment = process.env.ENVIRONMENT || 'dev';
const awsEnvironment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

new FoundationStack(app, `FoundationStack-${environment}`, {
  env: awsEnvironment,
  environment: environment,
});
```

The `FoundationStack` provides a more comprehensive setup for GitHub Actions integration and CDK resource management, making it suitable for projects that require both OIDC-based deployments and CDK toolkit cleaning.
