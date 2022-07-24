import { NestedStack, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { aws_lambda_nodejs as lambdajs } from "aws-cdk-lib"

export class ApiStack extends NestedStack {
  public readonly apiGateway: apigatewayv2.CfnApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // lambda
    const lambdaRole = new iam.Role(this, 'WebSocketLambdaRole', {
      roleName: 'websocket-lambdarole',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess')
      ]
    });
    const commonLambdaParam = {
      runtime: lambda.Runtime.NODEJS_16_X,
      // code: lambda.Code.fromAsset('src/lambda'),
      role: lambdaRole,
      timeout: Duration.minutes(2),
      memorySize: 1024
    };

    // connect
    const lambdaConnect = new lambdajs.NodejsFunction(this, 'WebSocketLambdaFunctionConnect', {
      functionName: 'websockcet-lambdaconnect',
      entry: 'src/lambda/connect.ts',
      ...commonLambdaParam
    });
    const lambdaDisconnect = new lambdajs.NodejsFunction(this, 'WebSocketLambdaFunctionDisconnect', {
      functionName: 'websockcet-lambdadisconnect',
      entry: 'src/lambda/disconnect.ts',
      ...commonLambdaParam
    });
    const lambdaDefault = new lambdajs.NodejsFunction(this, 'WebSocketLambdaFunctionDefault', {
      functionName: 'websockcet-lambdadefault',
      entry: 'src/lambda/default.ts',
      ...commonLambdaParam
    });

    // API Gateway
    const apigwRole = new iam.Role(this, 'WebSocketApiRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    })
    const webSocketApi = new apigatewayv2.CfnApi(this, 'WebSocketApiGateway', {
      name: 'websocket-restapi-test',
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '${request.body.action}'
    });

    // integrations
    const integrationConnect = new apigatewayv2.CfnIntegration(scope, 'WebSocketApiGatewayLambdaIntegrationConnect', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/${lambdaConnect.functionArn}/invocations`,
      credentialsArn: apigwRole.roleArn,
    })
    const routeConnect = new apigatewayv2.CfnRoute(scope, `WebSocketApiGatewayRouteConnect`, {
      apiId: webSocketApi.ref,
      routeKey: "$connect",
      authorizationType: 'NONE',
      target: 'integrations/' + integrationConnect.ref,
    })

    const integrationDisconnect = new apigatewayv2.CfnIntegration(scope, 'WebSocketApiGatewayLambdaIntegrationDisconnect', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/${lambdaDisconnect.functionArn}/invocations`,
      credentialsArn: apigwRole.roleArn,
    })
    const routeDisconnect = new apigatewayv2.CfnRoute(scope, `WebSocketApiGatewayRouteDisonnect`, {
      apiId: webSocketApi.ref,
      routeKey: "$disconnect",
      authorizationType: 'NONE',
      target: 'integrations/' + integrationDisconnect.ref,
    })

    const integrationDefault = new apigatewayv2.CfnIntegration(scope, 'WebSocketApiGatewayLambdaIntegrationDefault', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/${lambdaDefault.functionArn}/invocations`,
      credentialsArn: apigwRole.roleArn,
    })
    const routeDefault = new apigatewayv2.CfnRoute(scope, `WebSocketApiGatewayRouteDefault`, {
      apiId: webSocketApi.ref,
      routeKey: "$default",
      authorizationType: 'NONE',
      target: 'integrations/' + integrationDefault.ref,
    })

    this.apiGateway = webSocketApi;
  }
}
