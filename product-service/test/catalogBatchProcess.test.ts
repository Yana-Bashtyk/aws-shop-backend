import { catalogBatchProcessHandler } from '../lambda/catalogBatchProcess';
import { PublishCommand } from '@aws-sdk/client-sns';
import * as createProduct from '../lambda/createProduct';
import { Context } from 'aws-lambda';

const ProductMock = { title: 'Test Product', count: 5, description: 'New product', price: 10 };
type MockedSNSClient = {
  send: (command: PublishCommand) => Promise<any>;
};

const mockPromiseSns = jest.fn();
jest.mock('@aws-sdk/client-sns', () => {
  return {
    SNSClient: jest.fn().mockImplementation(function (this: MockedSNSClient) {
      this.send = jest.fn(() => mockPromiseSns());
    }),
    PublishCommand: jest.fn(),
  };
});

jest.mock('../lambda/createProduct', () => {
  const actualModule = jest.requireActual('../lambda/createProduct');
  return {
    ...actualModule,
    createProductHandler: jest.fn(),
  };
});

describe('catalogBatchProcessHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process records, create products, and send SNS events', async () => {
    const event = {
      Records: [
        {
          "body": JSON.stringify(ProductMock),
        },
      ],
    };

    const newProductResponse = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: ProductMock }),
    };

    (createProduct.createProductHandler as jest.Mock).mockResolvedValue(newProductResponse);
    const response = await catalogBatchProcessHandler(event, {} as Context, () => {});

    mockPromiseSns.mockResolvedValue({ MessageId: '12345' });
    expect(createProduct.createProductHandler).toHaveBeenCalledTimes(1);
    expect(createProduct.createProductHandler).toHaveBeenCalledWith(
      { body: event.Records[0].body },
      expect.any(Object),
      expect.any(Function)
    );
    expect(mockPromiseSns).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(200);
  });

  it('should handle errors', async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify(ProductMock),
        },
      ],
    };

    (createProduct.createProductHandler as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });

    const response = await catalogBatchProcessHandler(event, {} as Context, () => {});

    expect((createProduct.createProductHandler as jest.Mock)).toHaveBeenCalledTimes(1);
    expect(mockPromiseSns).toHaveBeenCalledTimes(0);
    expect(PublishCommand).toHaveBeenCalledTimes(0);
    expect(response.statusCode).toBe(500);
  });
});