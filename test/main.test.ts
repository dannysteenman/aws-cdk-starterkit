import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BaseStack } from '../src/stacks';

test('Snapshot', () => {
  const app = new App();
  const stack = new BaseStack(app, 'test', {});

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
