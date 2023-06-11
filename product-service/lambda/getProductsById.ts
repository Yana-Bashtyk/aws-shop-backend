import { Handler } from 'aws-lambda';
import { products } from '../mocks/products';

export const productsIdHandler: Handler = async function(event) {
  try {
    const product = products.find((el) => el.id === event.pathParameters?.productId);

    if (!product) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: err }),
    };
  }
}
