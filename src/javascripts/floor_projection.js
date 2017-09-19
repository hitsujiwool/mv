import { BLOCK, BLOCK_TOP, VACANCY } from './world';
import { matrix, resize, transpose, add, zeros } from 'mathjs';

function rotate(m, dir = 1) {
  let res = m;
  const n = dir > 0 ? 4 - dir % 4 : -dir % 4;
  for (let i = 0; i < n; i++) {
    res = matrix(transpose(res).toArray().map((row) => row.reverse()));
  }
  return res;
};

function expand(m, size) {
  const [a, b] = m.size();
  const [c, d] = size;
  return resize(m, [a + c, b + d]);
};

export default class FloorProjection {
  constructor(world, direction) {
    this.data = {};
    this.direction = direction;
    this.height = world.height;
    this.m = this.flatten(world, direction);
    this.buildTiles();
  }

  get tiles() {
    return Object.keys(this.checked).map((id) => this.checked[id]);
  }

  flatten(world, dir) {
    dir = 4 - dir;
    const max = world.height;
    const m = world.floors.reduce((acc, floor, i) => {
      const mat = matrix(floor.map((rows) => rows.map((token) => token === BLOCK_TOP ? i + 1 : 0)));
      const n = rotate(rotate(expand(rotate(expand(rotate(mat, -dir), [i, i]), 2), [max - (i + 1), max - (i + 1)]), -2), dir);
      return add(acc, n);
    }, zeros([world.nRows + max - 1, world.nCols + max - 1]));
    return m;
  }

  buildTiles() {
    const [nRows, nCols] = this.m.size();
    const arr = this.m.toArray();
    const checked = {};
    this.checked = checked;
    const trace = (tile) => {
      const { row, col, projectionRow, projectionCol } = tile;
      const [offsetRow, offsetCol] = this.offset;
      if (nRows === projectionRow || projectionCol < 0) return;
      if (nCols === projectionCol || projectionCol < 0) return;
      checked[`${row}-${col}`] = tile;
      [
        [projectionRow - 1, projectionCol],
        [projectionRow, projectionCol + 1],
        [projectionRow + 1, projectionCol],
        [projectionRow, projectionCol - 1]
      ].forEach(([i, j]) => {
        if (arr[i] && arr[i][j]) {
          const val = arr[i][j];
          const [projectionRow, projectionCol] = this.projectionNorm;
          const row = i - offsetRow + (val - 1) * -projectionRow;
          const col = j - offsetCol + (val - 1) * -projectionCol;
          const neighborhood = checked[`${row}-${col}`];
          if (neighborhood) {
            tile.neighborhoods.push(neighborhood);
          } else {
            const t = {
              id: `${row}-${col}`,
              row,
              col,
              height: val,
              projectionRow: i,
              projectionCol: j,
              neighborhoods: []
            };
            tile.neighborhoods.push(t);
            trace(t);
          }
        }
      });
    };

    const tilesSeparated = [];
    this.m.forEach((val, [i, j]) => {
      if (!val) return;
      const [offsetRow, offsetCol] = this.offset;
      const [projectionRow, projectionCol] = this.projectionNorm;
      const row = i - offsetRow + (val - 1) * -projectionRow;
      const col = j - offsetCol + (val - 1) * -projectionCol;

      if (checked[`${row}-${col}`]) return;
      const tile = {
        id: `${row}-${col}`,
        row,
        col,
        height: val,
        projectionRow: i,
        projectionCol: j,
        neighborhoods: []
      };
      trace(tile);
      tilesSeparated.push(tile);
    });

    this.tilesSeparated = tilesSeparated;
  }

  get projectionNorm() {
    switch (this.direction) {
      case 1:
        return [-1, 1];
      case 2:
        return [1, 1];
      case 3:
        return [1, -1];
      case 4:
        return [-1, -1];
      default:
        throw new Error(`invalid direction: ${this.direction}`);
    }
  }

  get offset() {
    switch (this.direction) {
      case 1:
        return [this.height - 1, 0];
      case 2:
        return [0, 0];
      case 3:
        return [0, this.height - 1];
      case 4:
        return [this.height - 1, this.height - 1];
      default:
        throw new Error(`invalid direction: ${this.direction}`);
    }
  }

  at(i, j) {
    return this.checked[`${i}-${j}`] || null;
  }

  byId(id) {
    return this.tiles.find((tile) => tile.id === id);
  }
}

