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
}
