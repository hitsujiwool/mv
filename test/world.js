import test from 'ava';
import fs from 'fs';
import path from 'path';

import parse from '../src/javascripts/parser';

test((t) => {
  const str = fs.readFileSync(path.join(__dirname, './fixtures/world_1.txt'), { encoding: 'utf8' });
  t.deepEqual(
    parse(str).data,
    [
      [ ['-', '-', 'x', '-'], ['t', '-', '-', '-'] ],
      [ ['-', '-', 'x', '-'], ['-', '-', '-', '-'] ],
      [ ['-', '-', 't', '-'], ['-', '-', '-', '-'] ]
    ]
  );
});
