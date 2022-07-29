import * as broadcastlayer from './broadcastlayer';

exports.handler = async (event: any) => {
  const body = JSON.parse(event.body);
  const socketKey = body.roomid;

  await broadcastlayer.broadcastToRoom(event, socketKey, body);

  // let connectionData;

  // const params = {
  //   TableName: 'websocket-sessioninfo-test',
  //   KeyConditionExpression: 'socketkey = :socketkey',
  //   ExpressionAttributeValues: {
  //     ':socketkey': socketKey
  //   }
  // }

  // try {
  //   connectionData = await ddb.query(params, (err: any, data: any) => {
  //     if (err) console.log(JSON.stringify(err, null, 2))
  //     else console.log(JSON.stringify(data, null, 2))
  //   }).promise();
  // } catch (e) {
  //   return { statusCode: 500, body: e.stack };
  // }

  // const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  //   apiVersion: '2018-11-29',
  //   endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  // });
  
  // const postData = body.data;
  
  // const postCalls = connectionData.Items.map(async (connectionItem: any) => {
  //   const connectionId = connectionItem['connectionid'];
  //   console.log(`connectionId = ${connectionId}`);
  //   try {
  //     await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: postData }).promise();
  //   } catch (e) {
  //     if (e.statusCode === 410) {
  //       console.log(`Found stale connection, deleting ${connectionId}`);
  //       await ddb.delete({ TableName: 'websocket-sessioninfo-test', Key: {
  //           socketkey: socketKey,
  //           connectionid: connectionId
  //         }
  //       }).promise();
  //     } else {
  //       throw e;
  //     }
  //   }
  // });
  
  // try {
  //   await Promise.all(postCalls);
  // } catch (e) {
  //   console.log(e);
  //   return { statusCode: 500, body: e.stack };
  // }

  return { statusCode: 200, body: 'Data sent.' };
};