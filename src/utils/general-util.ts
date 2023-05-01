export class GeneralUtils {
  public static compactNumberFormat(number: number): string {
    let formatter = Intl.NumberFormat("en", { notation: "compact" });
    return formatter.format(number);
  }

  public static roundToFirstNoneZeroN(number: number): number {
    return +number.toFixed(
      Math.max(Math.min(1 - Math.floor(Math.log(number) / Math.log(10)), 99), 0)
    );
  }

  public static capitalize(
    str: string | undefined | null
  ): string | undefined | null {
    if (!str) return str;

    return str
      ?.split(" ")
      .map((w) => {
        return w[0].toUpperCase() + w.slice(1);
      })
      .join(" ");
  }

  public static extractNumber(
    line: string,
    prefixes: string[] | null,
    suffixes: string[] | null
  ): string | null {
    if (prefixes) {
      for (const prefix of prefixes) {
        const match = line.match(
          new RegExp(String.raw`${prefix}[s*,\s]+\s*([+-]?([0-9]*[.\/])?[0-9])`)
        );
        const selection = match?.[1];
        if (selection) {
          return selection;
        }
      }
    } else if (suffixes) {
      for (const suffix of suffixes) {
        const match = line.match(
          new RegExp(
            String.raw`([+-]?([0-9]*[.\/])?[0-9]+)\s*${suffix}[s*,\s]*`
          )
        );
        const selection = match?.[1];
        if (selection) {
          return selection;
        }
      }
    }

    return null;
  }
}
