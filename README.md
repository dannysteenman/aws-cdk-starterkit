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

## Acknowledgements

A heartfelt thank you to the creators of [projen](https://github.com/projen/projen). This starter kit stands on the shoulders of giants, made possible by their pioneering work in simplifying cloud infrastructure projects!
