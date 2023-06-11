import { Handler } from 'aws-lambda';
import { getRecord } from '../db/utils';

export const productsIdHandler: Handler = async function(event) {
  console.log('productsIdHandler', event);
  const tableProduct = process.env.TABLE_NAME_PRODUCT;
  const tableStock = process.env.TABLE_NAME_STOCK;
  if (!tableProduct || !tableStock) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 
        'TABLE_NAME_PRODUCT and TABLE_NAME_STOCK environment variables are not set'})
    };
  }

  try {
    const productItem = await getRecord(tableProduct, 'id', event.pathParameters?.productId);
    const stockItem = await getRecord(tableStock, 'product_id', event.pathParameters?.productId);
    const { product_id: _, ...stockItemWithoutId } = stockItem as Record<string, any>;
    const product = { ...productItem, ...stockItemWithoutId };

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
