import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const scanTable = async (tableName: string): Promise<any[]> => {
  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: tableName }));
    return data.Items || [];
  } catch (err) {
    console.error(`Error scanning table ${tableName}:`, err);
    return [];
  }
};

const joinTables = async (table1: string, table2: string) => {
  const itemsFromProductTable = await scanTable(table1);
  const itemsFromStockTable = await scanTable(table2);

  const result = itemsFromProductTable?.map(item => {
    const stocks = { ...itemsFromStockTable?.find(stockItem => stockItem.product_id === item.id) };
    const { product_id: _, ...stocksWithoutId } = stocks;

    return { ...item, ...stocksWithoutId };
  });
  return result;
};

const getRecord = async (tableName: string, key: string, id: string) => {
  const params = {
    TableName: tableName,
    Key: {
      [key]: id,
    },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    return data.Item;
  } catch (err) {
    console.error('Error getting record:', err);
    return null;
  }
};

interface ICreatedProduct {
  id: string;
  description: string;
  price: number;
  title: string;
  count: number;
};
interface IProduct {
  id: string;
  description: string;
  price: number;
  title: string;
};

interface IStock {
  product_id: string;
  count: number;
};

const createProduct = async (product: IProduct, tableName: string) => {
  try {
    await ddbDocClient.send(new PutCommand({ TableName: tableName,
      Item: product
    }));
  } catch (err) {
    console.error(`Error creating product in table ${tableName}:`, err);
    throw err;
  }
};

const createProductStock = async (product: IStock, tableName: string) => {
  try {
    await ddbDocClient.send(new PutCommand({ TableName: tableName, Item: product}));
  } catch (err) {
    console.error(`Error creating product in table ${tableName}:`, err);
    throw err;
  }
};

export { ICreatedProduct, IProduct, IStock, scanTable, joinTables, getRecord, createProduct, createProductStock };
