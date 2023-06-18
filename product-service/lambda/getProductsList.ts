import { Handler } from 'aws-lambda';
import { getProducts } from '../db/rds_utils';

export const productsListHandler: Handler = async function(event) {
  console.log('productsListHandler', event);

  try {
    const products = await getProducts();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(products)
    };
  } catch(err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
}
