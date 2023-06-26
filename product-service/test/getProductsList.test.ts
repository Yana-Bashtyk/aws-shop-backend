import { productsListHandler } from '../lambda/getProductsList';
import { products } from './mocks/products';
import { event, context } from './mocks/lambda-mocks';
import * as rdsUtils from '../db/rds_utils';

jest.mock('../db/rds_utils', () => {
  return {
    getProducts: jest.fn(),
  };
});

describe('getProductsList handler', () => {
  test('returns a 200 status code', async () => {
    (rdsUtils.getProducts as jest.Mock).mockResolvedValue(products);
    const response = await productsListHandler(event, context, () => {});
    expect(response.statusCode).toBe(200);
  });

  test('returns the correct Content-Type header', async () => {
    (rdsUtils.getProducts as jest.Mock).mockResolvedValue(products);
    const response = await productsListHandler(event, context, () => {});
    expect(response.headers['Content-Type']).toBe('text/plain');
  });

  test('returns the products array as JSON', async () => {
    (rdsUtils.getProducts as jest.Mock).mockResolvedValue(products);
    const response = await productsListHandler(event, context, () => {});
    expect(JSON.parse(response.body)).toEqual(products);
  });
});
