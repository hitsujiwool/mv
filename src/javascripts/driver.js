import findPath from './path_finder';

export default class Driver {
  constructor(floor, initialPos, opts = {}) {
    const { speed = 8 } = opts;
    const startTile = floor.at.apply(floor, initialPos);
    this.progress = 0;
    this.dist = startTile;
    this.dept = startTile;
    this.speed = speed;
    this.floor = floor;
    this.path = [];
  }

  get direction() {
    if (this.dist.projectionRow - this.dept.projectionRow > 0) {
      return 's';
    } else if (this.dist.projectionRow - this.dept.projectionRow < 0) {
      return 'n';
    }
    if (this.dist.projectionCol - this.dept.projectionCol > 0) {
      return 'e';
    } else if (this.dist.projectionCol - this.dept.projectionCol < 0) {
      return 'w';
    }
    return null;
  }

  get currentPos() {
    switch (this.direction) {
      case 'n': {
        if (this.dist.height > this.dept.height) {
          return [this.dist.row + ((100 - this.progress) / 100), this.dist.col, this.dist.height];
        } else {
          return [this.dept.row - (this.progress / 100), this.dept.col, this.dept.height];
        }
      }
      case 'e': {
        if (this.dist.height > this.dept.height) {
          return [this.dist.row, this.dist.col - ((100 - this.progress) / 100), this.dist.height];
        } else {
          return [this.dept.row, this.dept.col + (this.progress / 100), this.dept.height];
        }
      }
      case 's': {
        if (this.dist.height > this.dept.height) {
          return [this.dist.row - ((100 - this.progress) / 100), this.dist.col, this.dist.height];
        } else {
          return [this.dept.row + (this.progress / 100), this.dept.col, this.dept.height];
        }
      }
      case 'w': {
        if (this.dist.height > this.dept.height) {
          return [this.dist.row, this.dist.col + ((100 - this.progress) / 100), this.dist.height];
        } else {
          return [this.dept.row, this.dept.col - (this.progress / 100), this.dept.height];
        }
      }
      default: {
        return [this.dept.row, this.dept.col, this.dept.height];
      }
    }
  }

  goTo(i, j) {
    const path = findPath(this.floor, this.dist, this.floor.at(i, j));
    if (path) {
      this.path = path;
    }
    return this;
  }

  changeRoute(floor) {
    this.dept = floor.at(this.dept.row, this.dept.col);
    this.dist = floor.at(this.dist.row, this.dist.col);
  }

  next() {
    if (this.progress === 0 && this.path.length > 0) {
      this.dist = this.path.shift();
    }

    if (this.progress >= 100) {
      const nextDist = this.path.shift();
      if (nextDist) {
        this.dept = this.dist;
        this.dist = nextDist;
      } else {
        this.dept = this.dist;
      }
      this.progress = 0;
    }

    if (this.dept === this.dist) {
      this.progress = 0;
    } else {
      this.progress += this.speed;
    }

    return this.currentPos;
  }
}
