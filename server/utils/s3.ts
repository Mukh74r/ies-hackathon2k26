import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";

export const s3Client = new S3Client({
    region,
    // In ECS use the IAM task role (auto-discovered). Only pass credentials locally.
    ...(process.env.AWS_ACCESS_KEY_ID && {
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        }
    }),
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET || "deephub-neural-storage";
