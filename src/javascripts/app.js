import mv from './mv';

fetch('/world.txt')
  .then((res) => res.text())
  .then(mv);
