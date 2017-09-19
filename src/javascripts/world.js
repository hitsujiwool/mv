export const BLOCK = 'x';
export const BLOCK_TOP = 't';
export const VACANCY = '-';

export default class World {
  constructor(data) {
    this.data = data;
  }

  get floors() {
    return this.data;
  }

  get nRows() {
    return this.data[0].length;
  }

  get nCols() {
    return this.data[0][0].length;
  }

  get height() {
    return this.data.length;
  }

  forEach(fn) {
    this.data.forEach((floor, k) => {
      floor.forEach((row, i) => {
        row.forEach((val, j) => {
          fn(val, [i, j, k]);
        });
      });
    });
    return this;
  }

  forEachFloor(fn) {
    this.data.forEach((floor, k) => {
      fn(floor, k);
    });
    return this;
  }

  at(i, j, k) {
    if (i < 0 || this.nRows - 1 < i) throw new Error(`out of bound row index: ${i}`);
    if (j < 0 || this.nCols - 1 < j) throw new Error(`out of bound col index: ${j}`);
    if (k < 0 || this.height - 1 < k) throw new Error(`out of bound height index: ${k}`);
    return this.data[i][j][k];
  }
}
