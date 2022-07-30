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
# you need to get actual URL of API Gateway
wscat -c wss://hogefuga.execute-api.ap-northeast-1.amazonaws.com/dev
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

# vue setup

一時的コンテナで作業
```bash
docker run -it --entrypoint bash --rm -v "$(pwd):/vue" -w /vue -p 8080:8080 node:18.7 -c bash
```

コンテナ内
```bash
yarn global add @vue/cli
vue create vuefront # vue3, yarnを選択
cd vuefront
yarn add vue3-beautiful-chat
```