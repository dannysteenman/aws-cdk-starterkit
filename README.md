# [![AWS CDK Starterkit header](https://raw.githubusercontent.com/dannysteenman/aws-cdk-starterkit/main/icons/github-header-image.png)](https://towardsthecloud.com)

# AWS CDK Starterkit

> The perfect starter kit to create and deploy an AWS CDK App using TypeScript on your AWS account in less than 5 minutes using GitHub actions!

[![Build Status](https://github.com/dannysteenman/aws-cdk-starterkit/actions/workflows/build.yml/badge.svg)](https://github.com/dannysteenman/aws-cdk-starterkit/actions/workflows/build.yml)
[![ESLint Code Formatting](https://img.shields.io/badge/code_style-eslint-brightgreen.svg)](https://eslint.org)
[![Latest release](https://img.shields.io/github/release/dannysteenman/aws-cdk-starterkit.svg)](https://github.com/dannysteenman/aws-cdk-starterkit/releases)

## Intro

Welcome to the starting line of your next AWS CDK project. This repository is crafted to supercharge your project's setup with AWS CDK TypeScript, projen, and GitHub actions, ensuring a smooth and efficient deployment to your AWS account.

> [!TIP]
> [Need help with your AWS CDK project? Hire us!](#need-help-with-your-aws-cdk-project-hire-us)

## Features

- ⚡ Rapid Setup: Jumpstart your project within minutes by tweaking a [single configuration file](./.projenrc.ts). Spend less time on boilerplate and more on building.
- 🤹‍♂️ Multi-Account Flexibility: Ready for enterprises, this starter kit supports multi-account setups right from the start, enabling scalable and segregated cloud environments.
- 🤖 Automated Deploy Pipelines: Embrace CI/CD with out-of-the-box GitHub Actions workflows, automating your deployment processes for efficiency and reliability.
- 🏗️ Project structure: The [project is structured](#project-structure) in a clean and intuitive way that allows you to easily manage your constructs and stacks for this CDK App.
- 🛡️ Seamless Security: Leverage OpenID Connect for secure AWS deployments. Authenticate your GitHub Actions workflows directly with AWS, eliminating the need for stored credentials or long-lived secrets.
- 🧹 Preconfigured TypeScript Excellence: Hit the ground running with pre-set compiler options in [tsconfig.json](./tsconfig.json), ensuring your code is clean, efficient, and error-free from the start.
- 📏 Best Practice Linting: Adopt coding best practices effortlessly with a pre-configured ESLint setup [.eslintrc.json](./.eslintrc.json), maintaining high code quality and consistency.
- 🚀 Enhanced Pull Requests: Benefit from a built-in, fancy pull request template, making code reviews more structured and informative.

## Setup Guide

This project requires a atleast **Node.js version 20**.

All the config that is needed to personalise the CDK App to your environment is defined in the [.projenrc.ts file](./.projenrc.ts).

**To get started, follow these steps:**

1. Fork / clone this repo

2. Add a Personal Access Token to the repository settings on GitHub, follow these [instructions for setting up a fine-grained personal access token](https://projen.io/docs/integrations/github/#fine-grained-personal-access-token-beta).

3. Install the projects dependencies using: `npm ci`

4. Customize the AWS Region and Account IDs in the [.projenrc.ts](./.projenrc.ts) file to match your AWS setup:

```typescript
/* Define the AWS region for the CDK app and github workflows
Default to us-east-1 if AWS_REGION is not set in your environment variables */
const awsRegion = process.env.AWS_REGION || 'us-east-1';

/* Set the CDK_DEFAULT_REGION environment variable for the projen tasks,
so the CDK CLI knows which region to use */
project.tasks.addEnvironment('CDK_DEFAULT_REGION', awsRegion);

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

## Project Structure

When working on smaller projects using infrastructure as code, where you deploy single applications that don’t demand extensive maintenance or collaboration from multiple teams, it’s recommended to structure your AWS CDK project in a way that enables you to deploy both the application and infrastructure using a single stack.

However, as projects evolve to encompass multiple microservices and a variety of stateful resources (e.g., databases), the complexity inherently increases.

In such cases, adopting a more sophisticated AWS CDK project organization becomes critical. This ensures not only the ease of extensibility but also the smooth deployment of each component, thereby supporting a more robust development lifecycle and facilitating greater operational efficiency.

To cater to these advanced needs, your AWS CDK project should adopt a modular structure. This is where the **AWS CDK starterkit** shines ✨.

Here’s a closer look at how this structure enhances maintainability and scalability:

```bash
.
├── cdk.context.json
├── cdk.json
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── src
│  ├── assets
│  │  ├── ecs
│  │  │  └── hello-world
│  │  │     └── Dockerfile
│  │  └── lambda
│  │     └── hello-world
│  │        └── lambda_function.py
│  ├── bin
│  │  ├── cicd-helper.ts
│  │  ├── env-helper.ts
│  │  └── git-helper.ts
│  ├── constructs
│  │  ├── base-construct.ts
│  │  ├── index.ts
│  │  └── network-construct.ts
│  ├── main.ts
│  └── stacks
│     ├── base-stack.ts
│     ├── github-oidc-stack.ts
│     └── index.ts
├── test
│  ├── __snapshots__
│  │  └── main.test.ts.snap
│  └── main.test.ts
├── tsconfig.dev.json
└── tsconfig.json
```

As you can see in the above tree diagram, the way this project is setup it tries to segment it into logical units, such as **constructs** for reusable infrastructure patterns, **stacks** for deploying groups of resources and **assets** for managing source code of containers and lambda functions.

Here is a brief explanation of what each section does:

- `src/assets`: Organizes the assets for your Lambda functions and ECS services, ensuring that the application code is neatly encapsulated with the infrastructure code.
- `src/bin`: Contains utility scripts (e.g., `cicd-helper.ts`, `env-helper.ts`, `git-helper.ts`) that streamline environment setup and integration with CI/CD pipelines.
- `src/constructs`: Houses the core building blocks of your infrastructure. These constructs can be composed into higher-level abstractions, promoting reusability across different parts of your infrastructure. Check out the [README in the constructs folder](./src/constructs/README.md) to read how you can utilize environment-aware configurations.
- `src/stacks`: Dedicated to defining stacks that represent collections of AWS resources (constructs). This allows for logical grouping of related resources, making it simpler to manage deployments and resource dependencies. Check out the [README in the stacks folder](./src/stacks/README.md) to read how you can instantiate new stacks.
- `src/lib/main.ts`: This is where the CDK app is instantiated.
- `test`: Is the location to store your unit or integration tests (powered by jest)

## Need help with your AWS CDK project? Hire us!

> [!TIP]
> #### Elevate your Cloud Infrastructure with our Expert AWS CDK Solutions

>
> In today’s dynamic cloud landscape, transcending from mere operational functionality to achieving peak operational excellence is pivotal and largely dependent on the robustness, scalability, and efficiency of your cloud infrastructure.<br/><br/>
> At **Towards the Cloud**, we excel in developing customized AWS infrastructure solutions tailored not just to satisfy immediate requirements but also to proactively address future challenges.
>
> ✅ **Collaborative Innovation**: We don’t just build for you; we build with you, ensuring solutions are perfectly aligned with your vision.<br/>
> ✅ **Full Ownership**: Everything we create for you is yours - full transparency, no strings attached.<br/>
> ✅ **Empowering Your Team**: We equip your team for success, turning your infrastructure into a winning advantage.<br/>
>
> <a href="https://towardsthecloud.com/contact"><img alt="Request Quote" src="https://img.shields.io/badge/request%20quote-success.svg?style=for-the-badge"/></a>
> <details><summary>📚 <strong>Discover more about us</strong></summary>
>
> <br/>
>
> Towards the Cloud is a one-person agency with over 9 years of extensive hands-on experience in architecting and building highly scalable distributed systems on AWS Cloud using Infrastructure as Code for startups and enterprises.
>
> *Maximize your development speed by harnessing our expertise in crafting high-performance Cloud infrastructures.*
>
> #### Why Choose Towards the Cloud?
>
> - **Expertise in AWS CDK**: Leverage the full power of AWS Cloud Development Kit (AWS CDK) with our deep expertise. We architect and build infrastructure as code (IaC) solutions that are maintainable, scalable, and fully automated.
> - **Tailored Solutions**: Your business is unique, and so are your cloud needs. We provide personalized consultations and solutions tailored to perfectly align with your project requirements and business goals.
> - **Cost-Effective and Efficient**: Benefit from our streamlined processes and deep AWS knowledge to optimize costs without compromising on performance or security.
> - **One-on-One Attention**: As a one-person agency, Towards the Cloud guarantees you receive dedicated support and expertise directly from an AWS Cloud Engineer. This ensures high-quality deliverables and swift decision-making.<br/>
> - **Seamless CI/CD**: Empower your team to manage infrastructure changes confidently and efficiently through Pull Requests, leveraging the full power of GitHub Actions.
>
> <a href="https://towardsthecloud.com/contact"><img alt="Request Quote" src="https://img.shields.io/badge/request%20quote-success.svg?style=for-the-badge"/></a>
> </details>

## AWS CDK Starterkit for Python Users

> **Looking for the Python version of this AWS CDK starter kit?** Check out the [AWS CDK Python Starterkit](https://github.com/dannysteenman/aws-cdk-python-starterkit) for a tailored experience that leverages the full power of AWS CDK with Python.

## Acknowledgements

A heartfelt thank you to the creators of [projen](https://github.com/projen/projen). This starter kit stands on the shoulders of giants, made possible by their pioneering work in simplifying cloud infrastructure projects!
