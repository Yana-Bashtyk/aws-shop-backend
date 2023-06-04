import { Context, APIGatewayProxyEvent, Handler } from 'aws-lambda';

const event: APIGatewayProxyEvent = {
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  path: '',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  resource: '',
};

const context: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: '',
  functionVersion: '',
  invokedFunctionArn: '',
  memoryLimitInMB: '',
  awsRequestId: '',
  logGroupName: '',
  logStreamName: '',
  getRemainingTimeInMillis: function (): number {
    throw new Error('Function not implemented.');
  },
  done: function (error?: Error | undefined, result?: any): void {
    throw new Error('Function not implemented.');
  },
  fail: function (error: string | Error): void {
    throw new Error('Function not implemented.');
  },
  succeed: function (messageOrObject: any): void {
    throw new Error('Function not implemented.');
  }
};

const createEvent = (productId: string): APIGatewayProxyEvent => ({
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  path: '',
  pathParameters: { productId },
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  resource: '',
});

const handlerWithError: Handler = async function (event) {
  try {
    throw new Error('Test error');
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: err }),
    };
  }
};

export { event, context, createEvent, handlerWithError };
