import * as AWS from "aws-sdk";

export async function handler(event: any): Promise<any> {
  console.log(`onDefault ${JSON.stringify(event)}`);

  return {
    statusCode: 200,
    body: "onDefault.",
  };
}