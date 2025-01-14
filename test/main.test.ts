import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { StarterStack } from '../src/stacks';

test('Snapshot', () => {
  const app = new App();
  const stack = new StarterStack(app, 'test', {});

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
