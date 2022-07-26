import * as AWS from 'aws-sdk';
import * as broadcastlayer from './broadcastlayer';

exports.handler = async (event: any) => {
  console.log(`onConnect ${JSON.stringify(event)}`);
  const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
  const socketKey = broadcastlayer.CONNECT_KEY;

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
    return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'Connected.' };
};