export class CustomDataVector {
  output = { vectors: [], values: {}, metadata: { types: {} } };

  public addVectorValues(
    vector: number[][],
    values: any[],
    config: { type: string; storageIndex: number }
  ) {
    this.output.metadata.types[vector.length] = {
      type: config.type,
      storageIndex: config.storageIndex,
      index: vector.length,
    };

    const storage = this.output.values[config.storageIndex] || {};
    this.output.values[config.storageIndex] = storage;

    const out = [];
    for (const value of values) {
      if (value === null || value === undefined) {
        out.push(-1);
      } else {
        const valueIndex = storage[value] || Object.keys(storage).length + 1;
        storage[value] = valueIndex;
        out.push(valueIndex);
      }
    }

    vector.push(out);
  }

  public invertRelations() {
    this.output.values = this.invertMapRelations(this.output.values);
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
