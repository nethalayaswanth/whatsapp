
import { S3Client } from "@aws-sdk/client-s3";
// Set the AWS Region.
const REGION = "ap-south-1";

const s3Client = new S3Client({ region: REGION });
export { s3Client };