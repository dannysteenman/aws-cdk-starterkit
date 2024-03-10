# [![AWS CDK Starterkit header](https://raw.githubusercontent.com/dannysteenman/aws-cdk-starterkit/main/icons/github-header-image.png)](https://towardsthecloud.com)

# AWS CDK Starterkit

> The perfect starter kit to create and deploy an AWS CDK app on your AWS account in less than 5 minutes using GitHub actions!

[![Build Status](https://github.com/dannysteenman/aws-cdk-starterkit/actions/workflows/build.yml/badge.svg)](https://github.com/dannysteenman/aws-cdk-starterkit/actions/workflows/build.yml) [![ESLint Code Formatting](https://img.shields.io/badge/code_style-eslint-brightgreen.svg)](https://eslint.org)

## Intro

Welcome to the starting line of your next AWS CDK project. This repository is crafted to supercharge your project's setup with AWS CDK TypeScript, [projen](https://github.com/projen/projen), and GitHub actions, ensuring a smooth and efficient deployment to your AWS account.

## Features

- Rapid Setup: Jumpstart your project within minutes by tweaking a [single configuration file](./.projenrc.ts). Spend less time on boilerplate and more on building.
- Multi-Account Flexibility: Ready for enterprises, this starter kit supports multi-account setups right from the start, enabling scalable and segregated cloud environments.
- Automated Deploy Pipelines: Embrace CI/CD with out-of-the-box GitHub Actions workflows, automating your deployment processes for efficiency and reliability.
- Seamless Security: Leverage OpenID Connect for secure AWS deployments. Authenticate your GitHub Actions workflows directly with AWS, eliminating the need for stored credentials or long-lived secrets.
- Preconfigured TypeScript Excellence: Hit the ground running with pre-set compiler options in [tsconfig.json](./tsconfig.json), ensuring your code is clean, efficient, and error-free from the start.
- Best Practice Linting: Adopt coding best practices effortlessly with a pre-configured ESLint setup [.eslintrc.json](./.eslintrc.json), maintaining high code quality and consistency.
- Enhanced Pull Requests: Benefit from a built-in, fancy pull request template, making code reviews more structured and informative.
Optimized .gitignore: Start with an optimal .gitignore setup, focusing on what matters by filtering out unnecessary files and folders.

## Setup Guide

This project requires a atleast **Node.js version 20**.

All the config that is needed to personalise the CDK App to your environment is defined in the [.projenrc.ts file](./.projenrc.ts).

**To get started, follow these steps:**

1. Fork / clone this repo

2. Add a Personal Access Token to the repository settings on GitHub, follow these [instructions for setting up a fine-grained personal access token](https://projen.io/docs/integrations/github/#fine-grained-personal-access-token-beta).

3. Install the projects dependencies using: `npm ci`

4. Customize the AWS Region and Account IDs in the [.projenrc.ts](./.projenrc.ts) file to match your AWS setup:

```ts
// Define the AWS Region for the CDK app
project.tasks.addEnvironment('CDK_DEFAULT_REGION', 'us-east-1');

// Define the target AWS accounts for the different environments
type Environment = 'dev' | 'test' | 'staging' | 'production';
const targetAccounts: Record<Environment, string | undefined> = {
  dev: '987654321012',
  test: '123456789012',
  staging: undefined,
  production: undefined,
};
```

5. Run `npx projen` to generate the github actions workflow files.

6. AWS CLI Authentication: Ensure you're logged into an AWS Account (one of the ones you configured in step 4) via the AWS CLI. If you haven't set up the AWS CLI, [then follow this guide](https://towardsthecloud.com/set-up-aws-cli-aws-sso))

7. Deploy the CDK toolkit stack to your AWS environment with `cdk bootstrap` if it's not already set up.

8. Deploy the GitHub OIDC Stack to enable GitHub Actions workflow permissions for AWS deployments. For instance, if you set up a `dev` environment, execute `npm run dev:deploy`.

9. Commit and push your changes to the `main` branch to trigger the CDK deploy pipeline in GitHub.

Congratulations 🎉! You've successfully set up your project.

## Acknowledgements

A heartfelt thank you to the creators of [projen](https://github.com/projen/projen). This starter kit stands on the shoulders of giants, made possible by their pioneering work in simplifying cloud infrastructure projects!
