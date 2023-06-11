import { Handler } from 'aws-lambda';
import { createProductTransaction, IProduct, ICreatedProduct, IStock } from '../db/utils';
import { v4 as uuidv4 } from 'uuid';

export const createProductHandler: Handler = async (event) => {
  console.log('createProductHandler', event);
  const tableProduct = process.env.TABLE_NAME_PRODUCT;
  const tableStock = process.env.TABLE_NAME_STOCK;
  if (!tableProduct || !tableStock) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 
        'TABLE_NAME_PRODUCT and TABLE_NAME_STOCK environment variables are not set'
      }),
    };
  }

  try {
    if(event.body) {
      const body: ICreatedProduct = JSON.parse(event.body);
      const { description, title, price, count } = body;
      if (!title || !description || typeof price !== 'number' || isNaN(Number(price)) || typeof count !== 'number' || isNaN(Number(count))) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message:
            'Invalid parameters'
          }),
        };
      }

      const id = uuidv4();
      const product: IProduct = { description, id, title, price };
      const stock: IStock = { product_id: id, count };

      await createProductTransaction(product, stock, tableProduct, tableStock);

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: {id, description, title, price, count}}),
      };
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message:'Missing required body'}),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Error creating product: ${err.message}`}),
    };
  }
}