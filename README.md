# my-wstest
project for test web socket

# cdk setup

## for pioneer

```bash
npm install -g aws-cdk
mkdir cdk && cd cdk
cdk bootstrap
npx cdk init --language typescript
```

## for ordinary deploy

```bash
npm install -g aws-cdk # if not installed.
cd cdk
yarn install # only first time.
npx cdk deploy # you need to comment out some part of cdk/lib/sub/api-stack.ts and then, deploy again with uncomment the part.
```

# test

## connect

```bash
wscat -c wss://y5ucuka917.execute-api.ap-northeast-1.amazonaws.com/dev
```

## add

```json
{"action": "add", "roomid": "testroomid", "roomname": "testroomname"}
```

## join

```json
{"action": "join", "roomid": "testroomid"}
```

## sendmessage

```json
{"action": "sendmessage", "roomid": "testroomid", "data": "hello world"}
```

## leave

```json
{"action": "leave", "roomid": "testroomid"}
```

## delete

```json
{"action": "delete", "roomid": "testroomid"}
```
