import * as AWS from 'aws-sdk';

exports.handler = async (event: any) => {
  const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
  const body = JSON.parse(event.body);
  const socketKey = body.roomid;

  const deleteParams = {
    TableName: 'websocket-sessioninfo-test',
    Key: {
      socketkey: socketKey,
      connectionid: event.requestContext.connectionId,
    }
  };

  try {
    await ddb.delete(deleteParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to leave: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'left succeeded.' };
};
