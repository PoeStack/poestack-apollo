export default class StopWatch {
  public static readonly DEFAULT_TIMER_NAME: string = "default";
  private readonly starts: Map<string, number> = new Map<string, number>();
  private readonly ends: Map<string, number> = new Map<string, number>();

  constructor(autoStartDefault = false) {
    if (autoStartDefault) {
      this.start();
    }
  }

  public start(name: string = StopWatch.DEFAULT_TIMER_NAME): number {
    const now: number = new Date().getTime();
    this.starts.set(name, now);
    return now;
  }

  public stop(name: string = StopWatch.DEFAULT_TIMER_NAME): number {
    const now: number = new Date().getTime();
    this.ends.set(name, now);
    return now;
  }

  public reset(name: string = StopWatch.DEFAULT_TIMER_NAME): void {
    this.starts.delete(name);
    this.ends.delete(name);
  }

  public static formatMsDuration(ms: number, includeMS = false): string {
    const rem_ms = Math.floor(ms % 1000);
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const f = StopWatch.leadingZeros;
    let rval = f(hours, 2) + "h" + f(minutes, 2) + "m";
    rval += includeMS
      ? f(seconds, 2) + "." + f(rem_ms, 3) + "s"
      : f(seconds, 2) + "s";
    if (days > 0) {
      rval = days + "d" + rval;
    }
    return rval;
  }

  public static leadingZeros(val: any, size: number): string {
    const sVal = String(val);
    if (sVal.length < size) {
      let pad = "0000";
      if (size > 1000) {
        throw "Cannot format number that large (max length is " + 1000 + ")";
      }
      while (pad.length < size) {
        pad = pad + pad; // It won't take that long to get there
      }

      return (pad + sVal).slice(-1 * size);
    } else {
      return sVal;
    }
  }

  public dump(
    name: string = StopWatch.DEFAULT_TIMER_NAME,
    includeMS = true
  ): string {
    let rval: string = "No timer set for " + name;
    const start: number = this.starts.get(name);
    const end: number = this.ends.get(name);
    if (!!start && !!end) {
      rval =
        "completed in " + StopWatch.formatMsDuration(end - start, includeMS);
    } else if (start) {
      rval =
        "running for " +
        StopWatch.formatMsDuration(new Date().getTime() - start, includeMS);
    }
    return rval;
  }

  public dumpExpected(
    pctComplete: number,
    name: string = StopWatch.DEFAULT_TIMER_NAME,
    includeMS = true
  ): string {
    let rval: string = "No timer set for " + name;
    if (!pctComplete || pctComplete <= 0) {
      rval = "Cannot generate output for 0 percent complete";
    } else if (pctComplete > 1) {
      rval = "Cannot generate output for percent > 1";
    } else {
      const start: number = this.starts.get(name);
      const end: number = this.ends.get(name);
      if (!!start && !!end) {
        rval =
          name +
          " completed in " +
          StopWatch.formatMsDuration(end - start, includeMS);
      } else if (start) {
        const now: number = new Date().getTime();
        const elapsedMS: number = now - start;
        const expectedTotalMS: number = elapsedMS / pctComplete;
        const remainMS: number = expectedTotalMS - elapsedMS;
        rval =
          name +
          " running for " +
          StopWatch.formatMsDuration(elapsedMS, includeMS) +
          " approx " +
          StopWatch.formatMsDuration(remainMS, includeMS) +
          " remaining";
      }
    }
    return rval;
  }

  public elapsedMS(name: string = StopWatch.DEFAULT_TIMER_NAME): number {
    const start: number = this.starts.get(name);
    const end: number = this.ends.get(name);
    if (!!start && !!end) {
      return end - start;
    } else if (start) {
      return new Date().getTime() - start;
    } else {
      return 0;
    }
  }
}
