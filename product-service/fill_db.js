const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');
require('dotenv').config();

const client = new DynamoDBClient({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.PRODUCT_AWS_REGION,
});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.argv[2] || process.env.DYNAMODB_TABLE_NAME;

const data = JSON.parse(fs.readFileSync(`./data/${tableName}.json`, 'utf8'));

const putItem = async (item) => {
  const params = {
    TableName: tableName,
    Item: item,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    console.log(`Inserted item: ${JSON.stringify(item)}`);
  } catch (err) {
    console.error('Error inserting item:', err);
  }
};

(async () => {
  for (const item of data) {
    await putItem(item);
  }
  console.log('All items inserted successfully.');
})();
