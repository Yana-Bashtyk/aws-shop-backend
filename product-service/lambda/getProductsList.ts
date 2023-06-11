import { Handler } from 'aws-lambda';
import { joinTables } from '../db/utils';

export const productsListHandler: Handler = async function(event) {
  const tableProduct = process.env.TABLE_NAME_PRODUCT;
  const tableStock = process.env.TABLE_NAME_STOCK;
  if (!tableProduct || !tableStock) {
    return {
      statusCode: 500,
      body: 'TABLE_NAME_PRODUCT and TABLE_NAME_STOCK environment variables are not set',
    };
  }

  const products = await joinTables(tableProduct, tableStock);

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
