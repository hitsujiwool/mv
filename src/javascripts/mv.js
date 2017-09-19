import {
  Scene,
  Color,
  Group,
  Mesh,
  MeshLambertMaterial,
  MeshBasicMaterial,
  BoxGeometry,
  SphereGeometry,
  OrthographicCamera,
  WebGLRenderer,
  GridHelper,
  DirectionalLight,
  HemisphereLight,
  Vector2,
  Raycaster,
  Math as M
} from 'three';

import T, { Tween, Easing } from '@tweenjs/tween.js';
import Stats from 'stats.js';

import parse from './parser';
import { BLOCK, BLOCK_TOP, VACANCY } from './world';
import Driver from './driver';
import ProjectionFloor from './floor_projection';

function calcRotation(deg) {
  if (deg > 0) {
    return (deg - 45) / 90 % 4 + 1;
  } else {
    return (deg + 45) / 90 % 4 + 4;
  }
}

const dev = process.env.NODE_ENV !== 'production';

export default (data, opts = {}) => {
  const aspect = window.innerWidth / window.innerHeight;
  const { boxSize = 50 } = opts;

  let deg = 45;

  const world = parse(data);
  const scene = new Scene();

  const geometry = new BoxGeometry(boxSize, boxSize, boxSize);
  const material = new MeshLambertMaterial({ color: 0xffffff });

  const cubes = new Group();

  world.forEach((token, [i, j, k]) => {
    if (token === VACANCY) return;
    const cube = new Mesh(geometry, material);
    cube.position.x = boxSize * j + boxSize / 2;
    cube.position.y = boxSize * k + boxSize / 2;
    cube.position.z = boxSize * i + boxSize / 2;
    cube.address = [i, j, k];
    cube.blockType = token;
    cubes.add(cube);
  });

  const persona = new Mesh(
    new SphereGeometry(boxSize / 2),
    new MeshBasicMaterial({ color: 0xff0000, wireframe: true })
  );

  cubes.add(persona);
  const camera = new OrthographicCamera(-500 * aspect, 500 * aspect, 500, -500, 1, 10000);
  camera.position.x = 0;
  camera.position.y = 1000;
  camera.position.z = 1000 * Math.sqrt(2);
  camera.lookAt(scene.position);

  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.getElementById('container').appendChild(renderer.domElement);
  renderer.render(scene, camera);

  const hemisphereLight = new HemisphereLight(0xf5d17b, 0xf5d17b, 0.3);
  scene.add(hemisphereLight);

  const directionalLight = new DirectionalLight(0xffffff);
  directionalLight.position.set(-1, 3, 1).normalize();
  scene.add(directionalLight);

  const pivot = new Group();
  pivot.add(cubes);

  cubes.position.x = -(world.nCols / 2) * boxSize;
  cubes.position.z = -(world.nRows / 2) * boxSize;

  scene.add(pivot);

  const gridHelper = new GridHelper(boxSize * world.nRows, world.nRows);
  if (dev) pivot.add(gridHelper);
  pivot.rotation.y = M.degToRad(deg);

  let easing = false;
  let crossing = false;
  let floor = new ProjectionFloor(world, calcRotation(deg));
  let driver = new Driver(floor, [1, 6]);

  function update() {
    requestAnimationFrame(update);
    stats.begin();
    T.update();
    render();
    stats.end();
  }

  function render() {
    pivot.rotation.y = M.degToRad(deg);

    const rot = 0.05;
    switch (driver.direction) {
      case 'e':
        persona.rotation.z -= rot;
        break;
      case 'w':
        persona.rotation.z += rot;
        break;
      case 'n':
        persona.rotation.x -= rot;
        break;
      case 's':
        persona.rotation.x += rot;
        break;
    }

    const [row, col, height] = driver.next();

    persona.position.set(
      boxSize * col + boxSize / 2,
      boxSize * height + boxSize / 2,
      boxSize * row + boxSize / 2
    );

    renderer.render(scene, camera);
  }

  const stats = new Stats();

  update();

  if (dev) {
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  }

  document.body.addEventListener('click', (e) => {
    const rc = new Raycaster();
    const mouse = new Vector2();

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
    rc.setFromCamera(mouse, camera);
    const intersects = rc.intersectObjects(cubes.children);
    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      if (!mesh.address || mesh.blockType !== BLOCK_TOP) return;
      const [i, j] = intersects[0].object.address;
      driver.goTo(i, j);
      return;
    }
    if (easing || crossing) return;
    const s = { deg };
    const delta = e.pageX < window.innerWidth / 2 ? 90 : -90;
    const t = new Tween(s).to({ deg: deg + delta }, 600);
    t.easing(Easing.Quadratic.InOut);
    t.onStart(() => {
      easing = true;
    });
    t.onUpdate(() => {
      deg = s.deg;
    });
    t.onComplete(() => {
      easing = false;
      const floor = new ProjectionFloor(world, calcRotation(deg));
      driver = new Driver(floor, [driver.dist.row, driver.dist.col]);
    });
    t.start();
  });

  window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = - 500 * aspect;
    camera.right = 500 * aspect;
    camera.top = 500;
    camera.bottom = - 500;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
