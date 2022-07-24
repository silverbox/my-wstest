import { NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';

export class DynamoDBStack extends NestedStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const webSocketSessionInfo = new Table(this, 'WebSocketSessionInfoTable', {
      tableName: 'websocket-sessioninfo-test',
      partitionKey: { name: 'socketkey', type: AttributeType.STRING },
      sortKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: false,
      removalPolicy: RemovalPolicy.DESTROY
    });
  }
}