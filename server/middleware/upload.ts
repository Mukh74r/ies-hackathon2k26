import multer from "multer";
import { s3Client, BUCKET_NAME } from "../utils/s3.ts";
// @ts-ignore
import multerS3 from "multer-s3";
import path from "path";

const useS3 = process.env.USE_AWS_S3 === 'true';

const getStorage = (targetFolder: string) => {
    if (useS3) {
        return (multerS3 as any)({
            s3: s3Client,
            bucket: BUCKET_NAME,
            metadata: function (req: any, file: any, cb: any) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req: any, file: any, cb: any) {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `${targetFolder}/${uniqueSuffix}${path.extname(file.originalname)}`);
            }
        });
    }
    
    // Fallback to local disk storage
    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `uploads/${targetFolder}`);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    });
};

export const upload = multer({ 
    storage: getStorage("general") 
});

export const qpUpload = multer({
    storage: getStorage("question-papers"),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const memoryUpload = multer({ storage: multer.memoryStorage() });
