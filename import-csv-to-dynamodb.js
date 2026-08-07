import fs from 'fs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import csv from 'csv-parser';
import 'dotenv/config';

// Load credentials and region from .env
const client = new DynamoDBClient({ 
  region: process.env.VITE_AWS_REGION || process.env.AWS_REGION || 'us-east-1' 
});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = "DeepHub_NeuralLessons";
const filePath = 'C:\\Users\\Muhammed Naif\\Downloads\\results (2).csv';

const results = [];

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log(`Parsed ${results.length} rows. Starting import to ${tableName}...`);
    let successCount = 0;
    let errorCount = 0;

    for (const row of results) {
      const item = {};
      
      for (const key of Object.keys(row)) {
        if (row[key] !== "") {
           item[key] = row[key];
        }
      }

      if (!item.userId || !item.lessonId) {
         console.log("Skipping row due to missing partition or sort key", item);
         continue;
      }

      try {
        await ddbDocClient.send(new PutCommand({
          TableName: tableName,
          Item: item,
        }));
        successCount++;
        console.log(`Successfully inserted lessonId: ${item.lessonId}`);
      } catch (err) {
        console.error(`Error inserting lessonId: ${item.lessonId}`, err.message);
        errorCount++;
      }
    }
    
    console.log(`Import complete! Success: ${successCount}, Errors: ${errorCount}`);
    process.exit(0);
  });
