import { createClient, RedisClientType } from "redis";

export class RedisClient {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({url: process.env.REDIS_STRING_CONNECTION});
    this.connect();
  }

  private async connect() {
    await this.client.connect()
      .then(() => console.log("Redis Client Connected"))
      .catch((err) => console.log("Redis Client Error", err));
  };

  async get(key: string, field: string): Promise<any> {
    let response = await this.client.hGet(key, field);
    return typeof response === 'string' ? JSON.parse(response) : response;
  };

  async set(key: string, field: string, value: object): Promise<{} | string> {
    const json = JSON.stringify(value);
    return await this.client.hSet(key, field, json);
  };

  async del(key: string, field: string): Promise<number | string> {
    return await this.client.hDel(key, field);
  };

  async keys(): Promise<string[]> {
    return await this.client.keys('*');
  };
}
