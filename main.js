//სცენა, კამერა და რენდერერი.
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const distance = window.innerWidth < 600 ? 24 : 16;
camera.position.set(distance * 0.6, distance * 0.55, distance);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//OrbitControls კამერას მართავს. ფიგურის გადაადგილებისას კამერა თავის ადგილას რჩება.
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 45;
controls.maxPolarAngle = Math.PI / 2;
controls.update();

//განათება და ბადე სივრცეში ორიენტაციისთვის.
scene.add(new THREE.AmbientLight(0xffffff, 0.65));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.GridHelper(16, 16, 0x475569, 0x273449));

//ექვსი შესაძლო ფორმა. გეომეტრიებს ერთხელ ვქმნით და შემდეგ ხელახლა ვიყენებთ.
const shapes = [
  { name: "კუბი", geometry: new THREE.BoxGeometry(1.7, 1.7, 1.7) },
  { name: "სფერო", geometry: new THREE.SphereGeometry(1, 32, 24) },
  { name: "კონუსი", geometry: new THREE.ConeGeometry(1, 2, 32) },
  { name: "ცილინდრი", geometry: new THREE.CylinderGeometry(0.85, 0.85, 2, 32) },
  { name: "ტორუსი (დონატი)", geometry: new THREE.TorusGeometry(0.8, 0.3, 16, 64) },
  { name: "ოქტაედრი", geometry: new THREE.OctahedronGeometry(1.1) }
];
let shapeIndex = 0;
let hue = 0.58;
let clickCount = 0;

const material = new THREE.MeshStandardMaterial({ roughness: 0.35 });
material.color.setHSL(hue, 0.8, 0.6);
const figure = new THREE.Mesh(shapes[shapeIndex].geometry, material);
figure.position.set(0, 1.5, 0);
scene.add(figure);

const shapeName = document.getElementById("shape-name");
const clickCounter = document.getElementById("click-count");

//ყოველ დაჭერაზე ფორმა, ფერი და პოზიცია იცვლება.
const positionLimit = 5;
const nextPosition = new THREE.Vector3();

function changeFigure() {
  //წინა ნაბიჯებით ვირჩევთ სხვა ფორმას, ამიტომ იგივე ფორმა ზედიზედ არ მეორდება.
  const shapeStep = 1 + Math.floor(Math.random() * (shapes.length - 1));
  shapeIndex = (shapeIndex + shapeStep) % shapes.length;
  figure.geometry = shapes[shapeIndex].geometry;

  // ფერის ტონს შესამჩნევი ნაბიჯით ვცვლით და 0–1 დიაპაზონში ვაბრუნებთ.
  hue = (hue + 0.2 + Math.random() * 0.6) % 1;
  material.color.setHSL(hue, 0.8, 0.6);

  // X და Z -5-დან 5-მდე. Y 1.3-დან 3.5-მდე, რომ ფიგურა ბადის ზემოთ იყოს.
  // ახალსა და ძველ ადგილს შორის მინიმუმ 2 ერთეულს ვტოვებთ.
  do {
    nextPosition.set(
      THREE.MathUtils.randFloat(-positionLimit, positionLimit),
      THREE.MathUtils.randFloat(1.3, 3.5),
      THREE.MathUtils.randFloat(-positionLimit, positionLimit)
    );
  } while (nextPosition.distanceTo(figure.position) < 2);
  figure.position.copy(nextPosition);
  figure.updateMatrixWorld();

  clickCount += 1;
  shapeName.textContent = shapes[shapeIndex].name;
  clickCounter.textContent = clickCount;
}

//Raycaster ამოწმებს, ხვდება თუ არა ეკრანზე დაჭერა უშუალოდ ფიგურას.
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function hitsFigure(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  if (Math.abs(pointer.x) > 1 || Math.abs(pointer.y) > 1) return false;

  camera.updateMatrixWorld();
  figure.updateMatrixWorld();
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObject(figure, false).length > 0;
}

//დაჭერასა და გადათრევას ვარჩევთ. ორი თითით ჟესტიც მხოლოდ კამერას მართავს.
let press = null;
const activePointers = new Set();
const dragThreshold = 6;

renderer.domElement.addEventListener("pointerdown", (event) => {
  activePointers.add(event.pointerId);
  if (activePointers.size !== 1 || event.button !== 0 ||
      event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
    press = null;
    return;
  }

  press = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    onFigure: hitsFigure(event),
    dragged: false
  };
});

window.addEventListener("pointermove", (event) => {
  if (press && event.pointerId === press.pointerId) {
    const moved = Math.hypot(event.clientX - press.x, event.clientY - press.y);
    // ერთხელ დაწყებული გადათრევა დაჭერად აღარ ითვლება, უკან დაბრუნების შემთხვევაშიც.
    press.dragged = press.dragged || moved > dragThreshold;
  }
});

window.addEventListener("pointerup", (event) => {
  activePointers.delete(event.pointerId);
  if (!press || event.pointerId !== press.pointerId) return;

  const releasedPress = press;
  press = null;
  const moved = Math.hypot(event.clientX - releasedPress.x, event.clientY - releasedPress.y);
  if (event.button === 0 && releasedPress.onFigure && !releasedPress.dragged &&
      moved <= dragThreshold && hitsFigure(event)) {
    changeFigure();
  }
});

window.addEventListener("pointercancel", (event) => {
  activePointers.delete(event.pointerId);
  press = null;
});
window.addEventListener("blur", () => {
  activePointers.clear();
  press = null;
});

//კადრის განახლება საჭიროა OrbitControls ის მოძრაობისთვის
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

//ფანჯრის ზომის შეცვლისას კამერასა და რენდერერს ვაახლებთ
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
});