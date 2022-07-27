import { NestedStack, Duration, aws_lambda_nodejs as lambdajs } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';

export class ApiStack extends NestedStack {
  public readonly apiGateway: apigatewayv2.CfnApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // lambda
    const lambdaPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
        'execute-api:ManageConnections'
      ],
    });
    const lambdaRole = new iam.Role(this, 'WebSocketLambdaRole', {
      roleName: 'websocket-lambdarole',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess')
      ],
    });
    lambdaRole.addToPolicy(lambdaPolicy)

    const commonLambdaParam = {
      runtime: lambda.Runtime.NODEJS_16_X,
      // code: lambda.Code.fromAsset('src/lambda'),
      role: lambdaRole,
      timeout: Duration.minutes(2),
      memorySize: 1024
    };

    // lambda function
    const lambdaConnect = new lambdajs.NodejsFunction(this, 'WebSocketLambdaFunctionConnect', {
      functionName: 'websocket-lambdaconnect',
      entry: 'src/lambda/connect.ts',
      ...commonLambdaParam
    });
    const lambdaDisconnect = new lambdajs.NodejsFunction(this, 'WebSocketLambdaFunctionDisconnect', {
      functionName: 'websocket-lambdadisconnect',
      entry: 'src/lambda/disconnect.ts',
      ...commonLambdaParam
    });
    const lambdaJoin = new lambdajs.NodejsFunction(this, 'WebSocketLambdaFunctionJoin', {
      functionName: 'websocket-lambdajoin',
      entry: 'src/lambda/join.ts',
      ...commonLambdaParam
    });
    const lambdaSendMessage = new lambdajs.NodejsFunction(this, 'WebSocketLambdaFunctionSendMessage', {
      functionName: 'websocket-lambdasendmessage',
      entry: 'src/lambda/sendmessage.ts',
      ...commonLambdaParam
    });
    const lambdaLeave = new lambdajs.NodejsFunction(this, 'WebSocketLambdaFunctionLeave', {
      functionName: 'websocket-lambdaleave',
      entry: 'src/lambda/leave.ts',
      ...commonLambdaParam
    });
    const lambdaDefault = new lambdajs.NodejsFunction(this, 'WebSocketLambdaFunctionDefault', {
      functionName: 'websocket-lambdadefault',
      entry: 'src/lambda/default.ts',
      ...commonLambdaParam
    });

    // API Gateway
    const apigwPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [
        lambdaConnect.functionArn,
        lambdaDisconnect.functionArn,
        lambdaJoin.functionArn,
        lambdaSendMessage.functionArn,
        lambdaLeave.functionArn,
        lambdaDefault.functionArn
      ],
      actions: [
        'lambda:InvokeFunction'
      ],
    });
    const apigwRole = new iam.Role(this, 'WebSocketApiRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });
    apigwRole.addToPolicy(apigwPolicy)

    const webSocketApi = new apigatewayv2.CfnApi(this, 'WebSocketApiGateway', {
      name: 'websocket-restapi-test',
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '${request.body.action}',
      disableSchemaValidation: true
    });

    // integrations
    const integrationConnect = new apigatewayv2.CfnIntegration(scope, 'WebSocketApiGatewayLambdaIntegrationConnect', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/${lambdaConnect.functionArn}/invocations`,
      credentialsArn: apigwRole.roleArn,
    });
    const routeConnect = new apigatewayv2.CfnRoute(scope, 'WebSocketApiGatewayRouteConnect', {
      apiId: webSocketApi.ref,
      routeKey: '$connect',
      authorizationType: 'NONE',
      target: 'integrations/' + integrationConnect.ref,
    });

    const integrationDisconnect = new apigatewayv2.CfnIntegration(scope, 'WebSocketApiGatewayLambdaIntegrationDisconnect', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/${lambdaDisconnect.functionArn}/invocations`,
      credentialsArn: apigwRole.roleArn,
    });
    const routeDisconnect = new apigatewayv2.CfnRoute(scope, 'WebSocketApiGatewayRouteDisonnect', {
      apiId: webSocketApi.ref,
      routeKey: '$disconnect',
      authorizationType: 'NONE',
      target: 'integrations/' + integrationDisconnect.ref,
    });

    const integrationJoin = new apigatewayv2.CfnIntegration(scope, 'WebSocketApiGatewayLambdaIntegrationJoin', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/${lambdaJoin.functionArn}/invocations`,
      credentialsArn: apigwRole.roleArn,
    });
    const routeJoin = new apigatewayv2.CfnRoute(scope, 'WebSocketApiGatewayRouteJoin', {
      apiId: webSocketApi.ref,
      routeKey: 'join',
      authorizationType: 'NONE',
      target: 'integrations/' + integrationJoin.ref,
    });

    const integrationSendMessage = new apigatewayv2.CfnIntegration(scope, 'WebSocketApiGatewayLambdaIntegrationSendMessage', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/${lambdaSendMessage.functionArn}/invocations`,
      credentialsArn: apigwRole.roleArn,
    });
    const routeSendMessage = new apigatewayv2.CfnRoute(scope, 'WebSocketApiGatewayRouteSendMessage', {
      apiId: webSocketApi.ref,
      routeKey: 'sendmessage',
      authorizationType: 'NONE',
      target: 'integrations/' + integrationSendMessage.ref,
    });

    const integrationLeave = new apigatewayv2.CfnIntegration(scope, 'WebSocketApiGatewayLambdaIntegrationLeave', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/${lambdaLeave.functionArn}/invocations`,
      credentialsArn: apigwRole.roleArn,
    });
    const routeLeave = new apigatewayv2.CfnRoute(scope, 'WebSocketApiGatewayRouteLeave', {
      apiId: webSocketApi.ref,
      routeKey: 'leave',
      authorizationType: 'NONE',
      target: 'integrations/' + integrationLeave.ref,
    });

    const integrationDefault = new apigatewayv2.CfnIntegration(scope, 'WebSocketApiGatewayLambdaIntegrationDefault', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:ap-northeast-1:lambda:path/2015-03-31/functions/${lambdaDefault.functionArn}/invocations`,
      credentialsArn: apigwRole.roleArn,
    });
    const routeDefault = new apigatewayv2.CfnRoute(scope, 'WebSocketApiGatewayRouteDefault', {
      apiId: webSocketApi.ref,
      routeKey: '$default',
      authorizationType: 'NONE',
      target: 'integrations/' + integrationDefault.ref,
    });

    // TODO At first, you need to commentout the following two resources. and then, uncomment it and deploy again.
    const webSocketApiId =  webSocketApi.ref; // Fn.ref(webSocketApi.logicalId);
    const webSocketStageName = 'dev';
    const webSocketApiDeployment = new apigatewayv2.CfnDeployment(this, 'WebSocketApiGatewayDeployment', {
      apiId: webSocketApiId,
      // stageName: webSocketStageName,
      description: 'initial deployment',
    });
    
    const webSocketApiStage = new apigatewayv2.CfnStage(this, 'WebSocketApiGatewayStage', {
      apiId: webSocketApiId,
      stageName: webSocketStageName,
      deploymentId: webSocketApiDeployment.ref,
      autoDeploy: true,
    });

    this.apiGateway = webSocketApi;
  }
}
