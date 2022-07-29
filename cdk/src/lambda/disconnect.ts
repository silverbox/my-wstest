import * as AWS from 'aws-sdk';
import * as broadcastlayer from './broadcastlayer';

exports.handler = async (event: any) => {
  const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
  const socketKey = broadcastlayer.CONNECT_KEY;
  const connectionId = event.requestContext.connectionId;

  const deleteParams = {
    TableName: 'websocket-sessioninfo-test',
    Key: {
      socketkey: socketKey,
      connectionid: connectionId,
    }
  };

  try {
    await ddb.delete(deleteParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(err) };
  }

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });

  try {
    await apigwManagementApi.deleteConnection({ ConnectionId: connectionId }).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'Disconnected.' };
};
