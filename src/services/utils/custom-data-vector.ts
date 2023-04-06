export class CustomDataVector {
  output = { vectors: [], types: {}, values: {} };

  public addVectorValues(
    vector: number[][],
    type: string,
    values: any[],
    storageType: string = null
  ) {
    const typeIndex =
      this.output.types[type] || Object.keys(this.output.types).length + 1;
    this.output.types[type] = typeIndex;

    if (!storageType && !this.output.values[typeIndex]) {
      this.output.values[typeIndex] = {};
    }

    const out = [typeIndex];

    const storageIndex = storageType
      ? this.output.types[storageType]
      : typeIndex;
    for (const value of values) {
      const valueIndex =
        this.output.values[storageIndex][value] ||
        Object.keys(this.output.values[storageIndex]).length + 1;
      this.output.values[storageIndex][value] = valueIndex;
      out.push(valueIndex);
    }

    vector.push(out);
  }

  public invertRelations() {
    this.output.values = this.invertMapRelations(this.output.values);

    const invertedTypes = {};
    for (const [key, value] of Object.entries(this.output.types)) {
      invertedTypes[value as any] = key;
    }
    this.output.types = invertedTypes;
  }

  private invertMapRelations(map): any {
    const inverted = {};
    for (const k of Object.keys(map)) {
      inverted[k] = {};
      for (const [key, value] of Object.entries(map[k])) {
        inverted[k][value] = key;
      }
    }
    return inverted;
  }
}
