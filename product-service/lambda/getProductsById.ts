import { Handler } from 'aws-lambda';
import { getProductById } from '../db/rds_utils';

export const productsIdHandler: Handler = async function(event) {
  console.log('productsIdHandler', event);
  const { productId } = event.pathParameters;

  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Product ID is required' }),
    };
  }

  try {
    const product = await getProductById(productId);

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
  } catch(err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: err.message }),
    };
  }
}
