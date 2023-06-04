import { productsListHandler } from '../lambda/getProductsList';
import { products } from '../mocks/products';
import { event, context, handlerWithError } from './test-mocks';

describe('getProductsList handler', () => {
  test('returns a 200 status code', async () => {
    const response = await productsListHandler(event, context, () => {});
    expect(response.statusCode).toBe(200);
  });

  test('returns the correct Content-Type header', async () => {
    const response = await productsListHandler(event, context, () => {});
    expect(response.headers['Content-Type']).toBe('text/plain');
  });

  test('returns the products array as JSON', async () => {
    const response = await productsListHandler(event, context, () => {});
    expect(JSON.parse(response.body)).toEqual(products);
  });

  test('returns a 500 status code on error', async () => {
    const error = new Error('Test error');
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const response = (await handlerWithError(event, context, () => {}));
    expect(response.statusCode).toBe(500);

    console.error = originalConsoleError;
  });
});
