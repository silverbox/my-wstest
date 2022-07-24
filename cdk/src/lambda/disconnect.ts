import * as AWS from "aws-sdk";

export async function handler(event: any): Promise<any> {
  console.log(`onDisconnect ${JSON.stringify(event)}`);

  const client = new AWS.DynamoDB.DocumentClient();
  const socketKey = event['queryStringParameters']['socketkey']

  const result = await client
    .delete({
      TableName: 'websocket-sessioninfo-test',
      Key: { 
        socketkey: socketKey,
        id: event.requestContext.connectionId,
      },
    })
    .promise();
  console.log(`delete result ${JSON.stringify(result)}`);

  return {
    statusCode: 200,
    body: "onDisconnect.",
  };
}