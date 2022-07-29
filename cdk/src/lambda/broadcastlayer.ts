import * as AWS from 'aws-sdk';

export const CONNECT_KEY = '$connect';

export async function getSessionItems(socketKey: string): Promise<any> {
  const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

  const params = {
    TableName: 'websocket-sessioninfo-test',
    KeyConditionExpression: 'socketkey = :socketkey',
    ExpressionAttributeValues: {
      ':socketkey': socketKey
    }
  }

  return await ddb.query(params, (err: any, data: any) => {
      if (err) console.log(JSON.stringify(err, null, 2));
      return data;
    }).promise();
}

export async function clearSessionItems(socketKey: string): Promise<any> {
  const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
  const sessionItems = await getSessionItems(socketKey);
  const connectionIdList = sessionItems.Items.map((sessionItem: any) => sessionItem['connectionid']);
  let leftItems = connectionIdList.length;
  let group = [];
  let groupNumber = 0;
  for (const connectionId of connectionIdList) {
    const deleteReq = {
        DeleteRequest: {
            Key: {
              socketkey: socketKey,
              connectionid: connectionId,
            },
        },
    };
    group.push(deleteReq);
    leftItems--;

    if (group.length === 25 || leftItems < 1) {
        groupNumber++;
        console.log(`Batch ${groupNumber} to be deleted.`);
        const params = {
            RequestItems: {
              'websocket-sessioninfo-test': group,
            },
        };
        console.log(JSON.stringify(params, null, 2))
        await ddb.batchWrite(params).promise();
        console.log(
            `Batch ${groupNumber} processed. Left items: ${leftItems}`
        );
        // reset
        group = [];
    }
  }
}

export async function broadcastToAll(event: any, postData: object): Promise<any> {
  return await broadcastToRoom(event, '$connect', postData);
}

export async function broadcastToRoom(event: any, roomid: string, postData: object): Promise<any> {
  let connectionData;
  try {
    connectionData = await getSessionItems(roomid);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  
  const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });
  const postCalls = connectionData.Items.map(async (connectionItem: any) => {
    const connectionId = connectionItem['connectionid'];
    const postString = JSON.stringify(postData, null, 2);
    console.log(`connectionId = ${connectionId}`);
    try {
      await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: postString }).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await ddb.delete({ TableName: 'websocket-sessioninfo-test', Key: {
            socketkey: roomid,
            connectionid: connectionId
          }
        }).promise();
      } else {
        throw e;
      }
    }
  });

  try {
    await Promise.all(postCalls);
  } catch (e) {
    console.log(e);
    return { statusCode: 500, body: e.stack };
  }
}