import "server-only";

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.B2_ENDPOINT;
const region = process.env.B2_REGION;
const accessKeyId = process.env.B2_KEY_ID;
const secretAccessKey = process.env.B2_APPLICATION_KEY;
const bucketName = process.env.B2_BUCKET_NAME;

if (!endpoint || !region || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Missing Backblaze B2 environment variables");
}

export const b2Client = new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

function validateObjectKey(objectKey: string) {
    if (
        !objectKey ||
        objectKey.startsWith("/") ||
        objectKey.includes("..") ||
        !/^(audio|artwork)\/[a-zA-Z0-9._-]+$/.test(objectKey)
    ) {
        throw new Error("Invalid B2 object key");
    }
}

export function createObjectKey(
    folder: "audio" | "artwork",
    filename: string
) {
    const safeFilename = filename
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-");

    return `${folder}/${crypto.randomUUID()}-${safeFilename}`;
}

export async function createPresignedUploadUrl(
    objectKey: string,
    contentType: string
) {
    validateObjectKey(objectKey);

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(b2Client, command, {
        expiresIn: 300,
    });

    return { uploadUrl, objectKey };
}

export async function createSignedDownloadUrl(
    objectKey: string,
    expiresIn = 3600
) {
    validateObjectKey(objectKey);

    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
    });

    return getSignedUrl(b2Client, command, { expiresIn });
}

export async function objectExists(objectKey: string) {
    validateObjectKey(objectKey);

    try {
        await b2Client.send(
            new HeadObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
            })
        );

        return true;
    } catch (error) {
        const status = (error as { $metadata?: { httpStatusCode?: number } })
            .$metadata?.httpStatusCode;

        if (status === 404) return false;

        throw error;
    }
}

export async function deleteB2Object(objectKey: string) {
    validateObjectKey(objectKey);

    await b2Client.send(
        new DeleteObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        })
    );
}
