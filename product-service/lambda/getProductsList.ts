import { Handler } from 'aws-lambda';
import { products } from '../mocks/products';

export const productsListHandler: Handler = async function(event) {
  try {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(products)
    };
  } catch(err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err }),
    };
  }
}
