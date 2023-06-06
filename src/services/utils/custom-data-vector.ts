export class CustomDataVector {
  output = { vectors: [], types: {}, values: {}, vectorMetadata: {} };

  public addVectorValues(
    vector: number[][],
    values: any[],
    config: { type: string; storageIndex: number }
  ) {
    this.output.vectorMetadata[vector.length] = {
      type: config.type,
      storageIndex: config.storageIndex,
      index: vector.length,
    };

    const out = [];
    for (const value of values) {
      const valueIndex =
        this.output.values[config.storageIndex][value] ||
        Object.keys(this.output.values[config.storageIndex]).length + 1;
      this.output.values[config.storageIndex][value] = valueIndex;
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
