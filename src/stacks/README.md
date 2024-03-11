# AWS CDK Stacks: BaseStack and GitHubOIDCStack

This documentation details the structure and functionality of two pivotal stacks within our AWS CDK TypeScript project: `BaseStack` and `GitHubOIDCStack`. These stacks lay the groundwork for deploying AWS resources with specific configurations and capabilities, tailored to different deployment stages and integration with GitHub Actions for CI/CD processes.

## BaseStack

The `BaseStack` serves as a foundational stack that you can use to start instantiation your custom and cdk-lib constructs.

### Properties

- `environment`: Optional. Specifies the deployment stage (e.g., `dev`, `test`, `staging`, `production`). It's crucial for tailoring the stack configuration to the target environment.

### Example Usage

```typescript
import { BaseStack, BaseStackProps } from './base-stack';

const baseStackProps: BaseStackProps = {
  environment: 'dev',
  /* other AWS CDK StackProps */
};

const myStack = new BaseStack(app, `BaseStack-${environment}`, {
  env: awsEnvironment,
  environment: environment,
});
```

## GitHubOIDCStack

The GitHubOIDCStack is designed to facilitate secure CI/CD workflows by integrating AWS resources with GitHub Actions via OpenID Connect (OIDC). This allows for a more secure and streamlined deployment process directly from GitHub Actions.

### Features

- GitHub Actions OIDC Provider: Sets up the OIDC provider for GitHub Actions within the AWS account, enabling trust relationships between GitHub and AWS.
- GitHub Deploy Role: Creates an IAM role with AdministratorAccess managed policy. This role is assumable by GitHub Actions workflows, granting them the permissions needed to deploy resources.

### Configuration

The stack automatically retrieves GitHub repository details (owner and repository name) using a helper function, ensuring that the OIDC provider and IAM roles are correctly configured for the specific GitHub repository.

### Example Usage

```typescript
import { GitHubOIDCStack } from './github-oidc-stack';

const gitHubOIDCStack = new GitHubOIDCStack(app, `GitHubOIDCStack-${environment}`, {
  env: awsEnvironment,
});
```
