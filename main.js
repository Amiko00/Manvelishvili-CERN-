// ვქმნით სცენას
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

//  ვქმნით კამერას
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

//კამერას ვწევთ უკან, რომ კუბი დავინახოთ
camera.position.z = 4;

// ვქმნით რენდერერს
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// რენდერერის canvas-ს ვამატებთ გვერდზე
document.body.appendChild(renderer.domElement);

// ვქმნით კუბის გეომეტრიას
const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

//ვქმნით მასალას
const material = new THREE.MeshNormalMaterial();

// გეომეტრიასა და მასალას ვაერთიანებთ კუბში
const cube = new THREE.Mesh(geometry, material);

//კუბს ვამატებთ სცენაში
scene.add(cube);

//საწყისი დახრა, რათა რამდენიმე მხარე ჩანდეს
cube.rotation.x = 0.4;
cube.rotation.y = 0.6;

//ანიმაციის შექმანა
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();

  cube.rotation.x = 0.4 + elapsedTime * 0.4;
  cube.rotation.y = 0.6 + elapsedTime * 0.6;

  renderer.render(scene, camera);
}

animate();

//ფანჯრის ზომის ცვლილებას ვარგებთ
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});