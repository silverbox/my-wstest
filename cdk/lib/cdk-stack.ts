import { Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamoDBStack } from './sub/ddb-stack';
import { ApiStack } from './sub/api-stack';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const ddbStack = new DynamoDBStack(this, 'DynamoDBStack');
    const apiStack = new ApiStack(this, 'ApiStack');

    Tags.of(scope).add('Group', 'ws-test');
  }
}
