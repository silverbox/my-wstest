import * as AWS from 'aws-sdk';
import * as broadcastlayer from './broadcastlayer';

exports.handler = async (event: any) => {
  const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
  const body = JSON.parse(event.body);

  const deleteParams = {
    TableName: 'websocket-roominfo-test',
    Key: {
      roomid: body.roomid,
    }
  };

  try {
    await ddb.delete(deleteParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to delete: ' + JSON.stringify(err) };
  }

  await broadcastlayer.broadcastToAll(event, body);

  await broadcastlayer.clearSessionItems(body.roomid);

  return { statusCode: 200, body: 'Delete succeeded.' };
};