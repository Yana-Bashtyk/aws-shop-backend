import { importProductsFileHandler } from '../lambda/importProductsFile';
import { Context, APIGatewayProxyEvent } from 'aws-lambda';
import { mockEvent } from './test-mocks';

const mockedSignedUrl = 'https://example-bucket.s3.example.amazonaws.com/mocked-signed-url';

jest.mock('@aws-sdk/s3-request-presigner', () => {
  const originalModule = jest.requireActual('@aws-sdk/s3-request-presigner');
  return {
    ...originalModule,
    getSignedUrl: jest.fn(() => Promise.resolve(mockedSignedUrl)),
  };
});

describe('importProductsFile handler', () => {
  process.env.AWS_REGION = 'default';
  process.env.IMPORT_S3_BUCKET_NAME = 'example-bucket';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a signed URL', async () => {
    const event: APIGatewayProxyEvent = {
      ...mockEvent,
      queryStringParameters: {
        name: 'products-import.csv',
      },
    };

    const response = await importProductsFileHandler(event, {} as Context, () => {});
    console.log(response.body);
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body).message).toEqual(mockedSignedUrl);
  });

  it('should return a 400 error when the file name is not passed', async () => {
    const event: APIGatewayProxyEvent = {
      ...mockEvent,
      queryStringParameters: {},
    };

    const response = await importProductsFileHandler(event, {} as Context, () => {});

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body).message).toEqual('Invalid request, query string parameter expected');
  });

  it('should return 500 error when an unexpected error occurs', async () => {
    const errorMsg = 'Test error';
    const event: APIGatewayProxyEvent = {
      ...mockEvent,
      queryStringParameters: {
        name: 'products-import.csv',
      },
    };

    const getSignedUrlMock = jest.spyOn(require('@aws-sdk/s3-request-presigner'), 'getSignedUrl');
    getSignedUrlMock.mockImplementation(() => {
      throw new Error(errorMsg);
    });

    const response = await importProductsFileHandler(event, {} as Context, () => {});

    expect(response.statusCode).toEqual(500);
    expect(JSON.parse(response.body).message).toEqual(errorMsg);
  
  })
});
