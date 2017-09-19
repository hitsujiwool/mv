import World, { BLOCK, BLOCK_TOP, VACANCY } from './world';

class Parser {
  constructor(str) {
    this.p = 0;
    this.str = str;
  }
  
  get c() {
    return this.str.charAt(this.p);
  }
  
  parse() {
    this.ws();
    const data = this.world();
    this.ws();
    return new World(data);
  }

  world() {
    const tmp = [];
    tmp.push(this.floor());
    while (this.c !== '') {
      this.sep();
      if (this.c === '') break;
      tmp.push(this.floor());
    }
    return tmp;
  }

  sep() {
    this.match("\n");
    while (this.c === "\n") {
      this.consume();
    }
  }
  
  floor() {
    const tmp = [];
    tmp.push(this.row());
    while (this.c === "\n") {
      this.consume();
      if (this.c === BLOCK || this.c === BLOCK_TOP || this.c === VACANCY) {
        tmp.push(this.row());
      } else {
        break;
      }
    }
    return tmp;
  }
  
  row() {
    const tmp = [];
    while (this.c !== "\n") {
      if (this.c === BLOCK || this.c === BLOCK_TOP || this.c === VACANCY) {
        tmp.push(this.c);
        this.consume();
        continue;
      }
      throw new Error(`invalid token: \`${this.c}\``);
    }
    return tmp;
  }

  match(c) {
    if (this.c === c) {
      this.consume();
      return;
    }
    throw new Error(`expected: ${c}, found: ${this.c}`);
  }
  
  consume() {
    this.p++;
  }

  ws() {
    while (this.c == ' ' || this.c == "\t" || this.c == "\n" || this.c == "\r" ) this.consume();
  }  
}

export default (str) => {
  return new Parser(str).parse();
};
