//სცენა კამერა და რენდერერი
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const distance = window.innerWidth < 600 ? 38 : 24;
camera.position.set(0.55, 0.45, 0.7).normalize().multiplyScalar(distance);
camera.position.y += 2;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//OrbitControls სცენის სხვადასხვა მხრიდან დათვალიერებისთვის
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 65;
controls.maxPolarAngle = Math.PI / 2;
controls.update();

//განათება, ბადე და კოორდინატების ღერძები
scene.add(new THREE.AmbientLight(0xffffff, 0.65));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 12, 8);
scene.add(light);
scene.add(new THREE.GridHelper(24, 24, 0x475569, 0x273449));

// X — წითელი, Y — მწვანე, Z — ლურჯი. ღერძების სიგრძე 8 ერთეულია
const axes = new THREE.AxesHelper(8);
scene.add(axes);

// სამი განსხვავებული ფიგურა
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.3, 1.3, 1.3),
  new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.4 })
);
scene.add(cube);

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.8, 32, 24),
  new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 })
);
scene.add(sphere);

const cone = new THREE.Mesh(
  new THREE.ConeGeometry(0.8, 1.6, 32),
  new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 })
);
scene.add(cone);

//მოძრაობის საზღვრები და სიჩქარეები
const lineHalfLength = 6.5;
const lineHeight = 1;
const lineZ = 5;
const lineSpeed = 0.8;

const circleCenter = new THREE.Vector3(-4, 1.1, -2);
const circleRadius = 2.2;
const circleSpeed = 0.75;

const spiralCenter = new THREE.Vector3(4, 1.1, -2);
const spiralRadius = 2;
const spiralHeight = 5;
const spiralTurns = 2;
const spiralSpeed = 0.35;

//progress = 0 ნიშნავს სპირალის დასაწყისს, progress = 1მის ზედა ბოლოს
//ამავე ფორმულით ვხატავთ ტრაექტორიას და ვამოძრავებთ კონუსს
function setSpiralPosition(position, progress) {
  const angle = progress * Math.PI * 2 * spiralTurns;
  position.set(
    spiralCenter.x + spiralRadius * Math.cos(angle),
    spiralCenter.y + spiralHeight * progress,
    spiralCenter.z + spiralRadius * Math.sin(angle)
  );
}

//ფერადი ხაზები გვიჩვენებს თითოეული ფიგურის მოძრაობის გზას
function addTrajectory(points, color) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5
  });
  scene.add(new THREE.Line(geometry, material));
}

addTrajectory([
  new THREE.Vector3(-lineHalfLength, lineHeight, lineZ),
  new THREE.Vector3(lineHalfLength, lineHeight, lineZ)
], 0x60a5fa);

const circlePoints = [];
const spiralPoints = [];
const segments = 200;
for (let i = 0; i <= segments; i += 1) {
  const progress = i / segments;
  const angle = progress * Math.PI * 2;
  circlePoints.push(new THREE.Vector3(
    circleCenter.x + circleRadius * Math.cos(angle),
    circleCenter.y,
    circleCenter.z + circleRadius * Math.sin(angle)
  ));

  const point = new THREE.Vector3();
  setSpiralPosition(point, progress);
  spiralPoints.push(point);
}
addTrajectory(circlePoints, 0xf472b6);
addTrajectory(spiralPoints, 0xfbbf24);

//პოზიციებს ვანგარიშობთ გასული დროით (წამებში)
function updatePositions(time) {
  //siიცვლება -1-დან 1-მდე კუბი X-ზე მიდის წინ და უკან
  //Y და Z უცვლელია, ამიტომ მოძრაობის გზა სწორი ხაზია
  cube.position.set(
    Math.sin(time * lineSpeed) * lineHalfLength,
    lineHeight,
    lineZ
  );

  //cos და sin ერთად წრიულ მოძრაობას ქმნის XZ სიბრტყეში
  const circleAngle = time * circleSpeed;
  sphere.position.set(
    circleCenter.x + circleRadius * Math.cos(circleAngle),
    circleCenter.y,
    circleCenter.z + circleRadius * Math.sin(circleAngle)
  );

  //progress რბილად იცვლება 0-დან 1მდე და უკან
  //კონუსი იმავე სპირალს აუყვება და ჩამოუყვება, ადგილზე გადახტომის გარეშე
  const spiralProgress = (1 - Math.cos(time * spiralSpeed)) / 2;
  setSpiralPosition(cone.position, spiralProgress);
}

//requestAnimationFrame გვაძლევს დროს მილიწამებში
//დროის გამოყენებით მოძრაობის სიჩქარე კადრების რაოდენობაზე დამოკიდებული არ არის
let startTime = null;

function animate(timestamp) {
  if (startTime === null) startTime = timestamp;
  const time = (timestamp - startTime) / 1000;

  updatePositions(time);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

//ფანჯრის ზომის ცვლილება.
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
});