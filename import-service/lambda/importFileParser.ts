import { Handler, S3Event} from 'aws-lambda';
import { GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from './utils';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

export const importFileParserHandler: Handler = async (event: S3Event) => {
  try {
    console.log('importFileParser S3 event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
      const bucketName = record.s3.bucket.name;
      const objectKey = record.s3.object.key;

      const getObjectCommand = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
      const response = await s3.send(getObjectCommand);

      if (!(response.Body instanceof Readable)) {
        throw new Error('Failed to read the file');
      }

      const readableStream = response.Body;

      const parser = readableStream.pipe(csvParser());
      parser.on('data', (row) => {
        console.log('Parsed row data:', row);
      });

        const processingPromise = new Promise<void>((resolve, reject) => {
          parser.on('end', async () => {
            console.log('Finished parsing the CSV file.');

            resolve();
          });
          parser.on('error', (error) => {
            console.error('Error by parsing the CSV file:', error);
            reject(error);
          });
        })

        await processingPromise;
        const newObjectKey = objectKey.replace('uploaded/', 'parsed/');
        const copyCommand = new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: `${bucketName}/${objectKey}`,
          Key: newObjectKey,
        });
        await s3.send(copyCommand);
        await s3.send(new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey }));

        console.log(`Moved the file from '${objectKey}' to '${newObjectKey}'`);
    }
  } catch (err: any) {
    console.error('Error by processing S3 object:', err);
  }
}
