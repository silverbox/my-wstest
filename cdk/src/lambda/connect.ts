import * as AWS from "aws-sdk";

export async function handler(event: any): Promise<any> {
  console.log(`onConnect ${JSON.stringify(event)}`);

  const client = new AWS.DynamoDB.DocumentClient();
  const socketKey = event['queryStringParameters']['socketkey']

  const result = await client
    .put({
      TableName: 'websocket-sessioninfo-test',
      Item: {
        socketkey: socketKey,
        id: event.requestContext.connectionId,
        date: new Date().toISOString()
      },
    })
    .promise();

  console.log(`put result ${JSON.stringify(result)}`);

  return {
    statusCode: 200,
    body: "onConnect.",
  };
}