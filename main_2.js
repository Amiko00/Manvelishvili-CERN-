
//  სცენა
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

// კამერა შორს დგას რომ ყველა ფიგურა გამოჩნდეს
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const distance = window.innerWidth < 600 ? 20 : 12;
camera.position.set(0, distance * 0.5, distance);

// რენდერერი
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// OrbitControls მაუსით გამოყენებით კამერის მართვა
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true; // მოძრაობა რბილად ჩერდება
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 50;
controls.update();

// განათება — MeshStandardMaterial-ს სინათლე სჭირდება
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 8, 6);
scene.add(directionalLight);

// ბადე სივრცეში ორიენტაციისთვის
const grid = new THREE.GridHelper(16, 16, 0x475569, 0x273449);
scene.add(grid);

// კუბი — სიგანე, სიმაღლე, სიღრმე
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1.5, 1.5),
  new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.4 })
);
cube.position.set(-3, 1.4, -1.8);
scene.add(cube);

// სფერო — რადიუსი, ჰორიზონტალური და ვერტიკალური სეგმენტები
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 24),
  new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 })
);
sphere.position.set(0, 1, -1.8);
scene.add(sphere);

//კონუსი მისი რადიუსი, სიმაღლე, გარშემოწერილობის სეგმენტები
const cone = new THREE.Mesh(
  new THREE.ConeGeometry(1, 2, 32),
  new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 })
);
cone.position.set(3, 1, -1.8);
scene.add(cone);

// ცილინდრი 
const cylinder = new THREE.Mesh(
  new THREE.CylinderGeometry(0.8, 0.8, 2, 32),
  new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.4 })
);
cylinder.position.set(-1.6, 1, 1.8);
scene.add(cylinder);

//ტორუსი, დონატი
//პარამეტრები ძირითადი რადიუსი, მილის რადიუსი და სეგმენტების რაოდენობები
const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.8, 0.3, 16, 64),
  new THREE.MeshStandardMaterial({ color: 0xa78bfa, roughness: 0.4 })
);
torus.position.set(1.6, 1.1, 1.8);
scene.add(torus);

//ანიმაცია, კუბი თავის ღერძებზე ბრუნავს
// OrbitControls დამოუკიდებლად ცვლის კამერის პოზიციასა და მიმართულებას
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();
  cube.rotation.x = 0.4 + elapsedTime * 0.4;
  cube.rotation.y = 0.6 + elapsedTime * 0.6;

  //enableDamping-ის დროს კონტროლი ყოველ კადრზე უნდა განახლდეს
  controls.update();
  renderer.render(scene, camera);
}

animate();

//ბრაუზერის ზომის ცვლილება.
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
