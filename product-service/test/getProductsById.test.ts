import { productsIdHandler } from '../lambda/getProductsById';
import { products } from '../mocks/products';
import { context, createEvent, handlerWithError } from './test-mocks';

describe('getProductsById handler', () => {
  test('returns the product data as JSON for an existing product', async () => {
    const event = createEvent('7567ec4b-b10c-48c5-9345-fc73c48a80aa');
    const response = (await productsIdHandler(event, context, () => {}));
    expect(JSON.parse(response.body!)).toEqual(products[0]);
  });

  test('returns a 404 status code for a non-existing product', async () => {
    const event = createEvent('123');
    const response = (await productsIdHandler(event, context, () => {}));
    expect(response.statusCode).toBe(404);
  });

  test('returns a "Product not found" message for a non-existing product', async () => {
    const event = createEvent('345');
    const response = (await productsIdHandler(event, context, () => {}));
    expect(JSON.parse(response.body!).message).toBe('Product not found');
  });

  test('returns a 500 status code on error', async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const event = createEvent('1');
    const response = (await handlerWithError(event, context, () => {}));
    expect(response.statusCode).toBe(500);

    console.error = originalConsoleError;
  });
});
