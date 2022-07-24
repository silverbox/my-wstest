import * as AWS from "aws-sdk";

exports.handler = async (event: any) => {
  const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
  const socketKey = 'testkey'; // event['queryStringParameters']['socketkey']
  // const socketKey = event['queryStringParameters']['socketkey']
  const deleteParams = {
    TableName: 'websocket-sessioninfo-test',
    Key: {
      socketkey: socketKey,
      id: event.requestContext.connectionId,
    }
  };

  try {
    await ddb.delete(deleteParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'Disconnected.' };
};
