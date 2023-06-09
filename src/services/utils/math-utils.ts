export default class MathUtils {
  public static q(sorted, q): number {
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  }

  public static filterOutliers(someArray: number[]): number[] {
    // Copy the values, rather than operating on references to existing values
    const values = someArray.concat();

    // Then sort
    values.sort(function (a, b) {
      return a - b;
    });

    /* Then find a generous IQR. This is generous because if (values.length / 4)
     * is not an int, then really you should average the two elements on either
     * side to find q1.
     */
    const q1 = values[Math.floor(values.length / 4)];
    // Likewise for q3.
    const q3 = values[Math.ceil(values.length * (3 / 4))];
    const iqr = q3 - q1;

    // Then find min and max values
    const maxValue = q3 + iqr * 1.5;
    const minValue = q1 - iqr * 1.5;

    // Then filter anything beyond or beneath these values.
    const filteredValues = values.filter(function (x) {
      return x <= maxValue && x >= minValue;
    });

    // Then return
    return filteredValues;
  }
}
