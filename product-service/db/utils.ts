import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
export const ddbDocClient = DynamoDBDocumentClient.from(client);

export const scanTable = async (tableName: string): Promise<any[]> => {
  try {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: tableName }));
    return data.Items || [];
  } catch (err) {
    console.error(`Error scanning table ${tableName}:`, err);
    return [];
  }
};

export const joinTables = async (table1: string, table2: string) => {
  const itemsFromProductTable = await scanTable(table1);
  const itemsFromStockTable = await scanTable(table2);

  const result = itemsFromProductTable?.map(item => {
    const stocks = { ...itemsFromStockTable?.find(stockItem => stockItem.product_id === item.id) };
    const { product_id: _, ...stocksWithoutId } = stocks;

    return { ...item, ...stocksWithoutId };
  });
  return result;
};

export const getRecord = async (tableName: string, key: string, id: string) => {
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
