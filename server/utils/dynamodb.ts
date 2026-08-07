import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";

const client = new DynamoDBClient({
    region,
    // In ECS, use IAM task role (auto-discovered). Only pass credentials locally.
    ...(process.env.AWS_ACCESS_KEY_ID && {
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        }
    }),
});

const marshallOptions = {
    convertEmptyValues: false,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
};

const unmarshallOptions = {
    wrapNumbers: false,
};

export const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions,
    unmarshallOptions,
});

// ===========================
// TABLE NAME CONSTANTS
// (these must be declared BEFORE any class that references them)
// ===========================
export const USERS_TABLE          = process.env.DYNAMODB_USERS_TABLE          || "DeepHub_Users";
export const LESSONS_TABLE        = process.env.DYNAMODB_LESSONS_TABLE        || "DeepHub_NeuralLessons";
export const ACTIVITY_LOGS_TABLE  = process.env.DYNAMODB_ACTIVITY_LOGS_TABLE  || "DeepHub_ActivityLogs";
export const CATALOG_TABLE        = process.env.DYNAMODB_CATALOG_TABLE        || "DeepHub_Catalog";
export const SETTINGS_TABLE       = process.env.DYNAMODB_SETTINGS_TABLE       || "DeepHub_Settings";
