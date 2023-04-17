import { singleton } from "tsyringe";

@singleton()
export default class TftRateLimitService {
  private rateLimitCache = {};

  public async fetchLimitMs(resource: string, accessKey: string) {
    const resourceLimitTimestamp: number =
      this.rateLimitCache[`${resource}__${accessKey}`];
    if (!resourceLimitTimestamp) {
      return 0;
    }
    const diffMs = resourceLimitTimestamp - Date.now();
    return Math.max(diffMs, 0);
  }

  public async updateLimit(
    resource: string,
    accessKey: string,
    expiresAfterSeconds: number
  ) {
    this.rateLimitCache[`${resource}__${accessKey}`] =
      Date.now() + expiresAfterSeconds * 1000;
  }
}
