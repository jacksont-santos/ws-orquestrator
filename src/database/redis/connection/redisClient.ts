import { createClient } from "redis";

export default class RedisInstance {
  private client;

  constructor() {
    this.client = createClient({url: process.env.REDIS_STRING_CONNECTION});
    this.connect();
  }

  private async connect() {
    await this.client.connect()
      .then(() => console.log("Redis Client Connected"))
      .catch((err) => console.log("Redis Client Error", err));
  };

  async getAll() {
    return await this.client.json.all();
  }

  async get(key: string, field?: string): Promise<any> {
    return await this.client.json.get(key, {path: field ? `$${field}` : '$'});
  };

  async set(key: string, value): Promise<Buffer | string> {
    return await this.client.json.set(key, '$', value);
  };

  async del(key: string): Promise<number | string> {
    return await this.client.json.del(key);
  };
}
