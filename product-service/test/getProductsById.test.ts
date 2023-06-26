import { productsIdHandler } from '../lambda/getProductsById';
import { products } from './mocks/products';
import { context, createEvent } from './mocks/lambda-mocks';
import * as rdsUtils from '../db/rds_utils';

jest.mock('../db/rds_utils', () => {
  return {
    getProductById: jest.fn(),
  };
});

describe('getProductsById handler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns the product data as JSON for an existing product', async () => {
    const id = products[0].id;
    const event = createEvent(id);

    (rdsUtils.getProductById as jest.Mock).mockResolvedValue(products[0]);
    const response = (await productsIdHandler(event, context, () => {}));
    expect(JSON.parse(response.body!)).toEqual(products[0]);
  });

  test('returns a 404 status code for a non-existing product', async () => {
    const event = createEvent('custom-id');

    (rdsUtils.getProductById as jest.Mock).mockResolvedValue(null);
    const response = (await productsIdHandler(event, context, () => {}));
    expect(response.statusCode).toBe(404);
  });

  test('returns a "Product not found" message for a non-existing product', async () => {
    const event = createEvent('345');
    (rdsUtils.getProductById as jest.Mock).mockResolvedValue(null);
    const response = (await productsIdHandler(event, context, () => {}));
    expect(JSON.parse(response.body!).message).toBe('Product not found');
  });
});
