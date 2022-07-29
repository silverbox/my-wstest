import * as AWS from 'aws-sdk';
import * as broadcastlayer from './broadcastlayer';

exports.handler = async (event: any) => {
  const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
  const body = JSON.parse(event.body);

  const putParams = {
    TableName: 'websocket-roominfo-test',
    Item: {
      roomid: body.roomid,
      roomname: body.roomname,
      date: new Date().toISOString()
    }
  };

  try {
    await ddb.put(putParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to add: ' + JSON.stringify(err) };
  }

  await broadcastlayer.broadcastToAll(event, body);

  return { statusCode: 200, body: 'Add succeeded.' };
};