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
npx cdk deploy
```