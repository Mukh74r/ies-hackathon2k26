import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "./s3.ts";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export interface FileItem {
    name: string;
    type: "file" | "dir";
    path: string;
    size?: number;
    lastModified?: Date;
    children?: FileItem[];
    code?: string;
}

export const scanDirectory = (dirPath: string, baseSrcPath: string): FileItem[] => {
    if (!fs.existsSync(dirPath)) return [];

    return fs.readdirSync(dirPath).map(item => {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        const relative = path.relative(baseSrcPath, fullPath).replace(/\\/g, "/");

        if (stats.isDirectory()) {
            return { name: item, type: "dir", path: `src/${relative}`, children: scanDirectory(fullPath, baseSrcPath) };
        }
        return { name: item, type: "file", path: `src/${relative}`, size: stats.size, lastModified: stats.mtime, code: "// BINARY_DATA_LOCKED" };
    });
};

/**
 * Get file as Buffer — supports local disk, memory buffer, S3 key, and S3 public URL.
 */
const getFileBuffer = async (file: any): Promise<Buffer> => {
    if (file.path && fs.existsSync(file.path)) return fs.readFileSync(file.path);
    if (file.buffer) return file.buffer;

    if (file.key) {
        try {
            console.log(`[FileScanner] Fetching from S3: ${file.key}`);
            const resp = await s3Client.send(new GetObjectCommand({ Bucket: file.bucket || BUCKET_NAME, Key: file.key }));
            const chunks: Buffer[] = [];
            for await (const chunk of resp.Body as any) chunks.push(Buffer.from(chunk));
            return Buffer.concat(chunks);
        } catch (err) {
            console.error(`[FileScanner] S3 key fetch failed:`, err);
        }
    }

    if (file.location) {
        console.log(`[FileScanner] Downloading from S3 URL: ${file.location}`);
        const fetch = (await import('node-fetch')).default;
        const res = await fetch(file.location);
        if (!res.ok) throw new Error(`S3 URL fetch failed: ${res.statusText}`);
        return Buffer.from(await res.arrayBuffer());
    }

    throw new Error(`Cannot read file — no path, buffer, key, or location for "${file.originalname}"`);
};

/**
 * Extract text from PDF buffer.
 * Strategy:
 *   1. pdfjs-dist  — handles complex fonts, CJK, and CBSE-style PDFs better
 *   2. pdf-parse   — fallback for any edge case pdfjs can't handle
 */
const parsePDFBuffer = async (buffer: Buffer, filename: string): Promise<string> => {
    let text = '';

    // ── Method 1: pdfjs-dist ──────────────────────────────────────────────────
    try {
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdfDoc = await loadingTask.promise;
        const numPages = pdfDoc.numPages;
        const pageTexts: string[] = [];

        for (let p = 1; p <= numPages; p++) {
            const page = await pdfDoc.getPage(p);
            const content = await page.getTextContent();
            const pageText = content.items
                .map((item: any) => item.str || '')
                .join(' ');
            pageTexts.push(pageText);
        }

        text = pageTexts.join('\n');
        console.log(`[FileScanner] pdfjs-dist: ${text.trim().length} chars, ${numPages} pages from "${filename}"`);
    } catch (pdfjsErr: any) {
        console.warn(`[FileScanner] pdfjs-dist failed for "${filename}":`, pdfjsErr.message);
    }

    // ── Method 2: pdf-parse fallback ──────────────────────────────────────────
    if (text.trim().length < 50) {
        try {
            const data = await pdfParse(buffer, { max: 0 });
            const fallbackText = typeof data.text === 'string' ? data.text : String(data.text || '');
            if (fallbackText.trim().length > text.trim().length) {
                console.log(`[FileScanner] pdf-parse fallback: ${fallbackText.trim().length} chars from "${filename}"`);
                text = fallbackText;
            }
        } catch (parseErr: any) {
            console.warn(`[FileScanner] pdf-parse fallback also failed:`, parseErr.message);
        }
    }

    if (text.trim().length < 50) {
        console.warn(`[FileScanner] Both parsers got <50 chars from "${filename}" — likely a scanned/image PDF.`);
    }

    return text;
};

export const extractPDFContent = async (file: any): Promise<string> => {
    const buffer = await getFileBuffer(file);
    return parsePDFBuffer(buffer, file.originalname || 'document.pdf');
};

export const processDocument = async (file: any): Promise<string> => {
    if (!file) return "";
    const ext = path.extname(file.originalname || '').toLowerCase();

    if (ext === ".pdf") return await extractPDFContent(file);

    if (ext === ".txt") {
        try {
            return (await getFileBuffer(file)).toString("utf-8");
        } catch (e) {
            console.error("Text read error:", e);
            return "";
        }
    }

    return `(Unsupported format: ${ext})`;
};
