import { singleton } from "tsyringe";
import AWS from "aws-sdk";

@singleton()
export class S3Service {
  private readonly s3: AWS.S3;

  constructor() {
    const config = {
      endpoint: process.env.DO_SPACES_ENDPOINT,
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET,
    };
    this.s3 = new AWS.S3(config);
  }

  public async deleteItem(bucket: string, key: string) {
    await this.s3
      .deleteObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();
  }

  public async putJson(bucket: string, key: string, json: any) {
    await this.s3
      .putObject({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(json, (key, value) =>
          typeof value === "bigint" ? Number(value) : value
        ),
        ACL: "public-read",
      })
      .promise();
  }

  public async getJson(bucket: string, key: string) {
    const resp = await this.s3
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();
    const body = resp?.Body?.toString();
    return JSON.parse(body);
  }
}
