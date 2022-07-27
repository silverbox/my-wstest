import * as AWS from 'aws-sdk';

exports.handler = async (event: any) => {
  const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
  const body = JSON.parse(event.body);
  const socketKey = body.roomid;
  
  const putParams = {
    TableName: 'websocket-sessioninfo-test',
    Item: {
      socketkey: socketKey,
      connectionid: event.requestContext.connectionId,
      date: new Date().toISOString()
    }
  };

  try {
    await ddb.put(putParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to join: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'Join succeeded.' };
};