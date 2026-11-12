// სცენა, კამერა
const scena = new THREE.Scene();
scena.background = new THREE.Color(0x111827);


const kamera = new THREE.PerspectiveCamera(
  55, window.innerWidth / window.innerHeight, 0.1, 1000
);
const mandzili = window.innerWidth < 600 ? 34 : 19;
kamera.position.set(0.35, 0.4, 0.85).normalize().multiplyScalar(mandzili);


const rendereri = new THREE.WebGLRenderer({ antialias: true });
rendereri.setPixelRatio(Math.min(window.devicePixelRatio, 2));
rendereri.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(rendereri.domElement);

// კამერის მართვა: ბრუნვა, მიახლოება და ხედის შეცვლა 
const kontroli = new THREE.OrbitControls(kamera, rendereri.domElement);
kontroli.target.set(0, 0.85, 0);
kontroli.enableDamping = true;
kontroli.dampingFactor = 0.05;
kontroli.minDistance = 5;
kontroli.maxDistance = 60;
kontroli.maxPolarAngle = Math.PI / 2;
kontroli.update();

// განათება და დამხმარე ბადე
scena.add(new THREE.AmbientLight(0xffffff, 0.7));
const sinatle = new THREE.DirectionalLight(0xffffff, 0.9);
sinatle.position.set(5, 10, 7);
scena.add(sinatle);

const bade = new THREE.GridHelper(22, 22, 0x475569, 0x273449);
scena.add(bade);

// თითოეულ კუბს თავისი მასალა აქვს, ამიტომ ფერი ცალ-ცალკე იცვლება
const kubebi = [];
const ferebi = [0x60a5fa, 0xf472b6, 0x2dd4bf];

for (let nomeri = 0; nomeri < 3; nomeri++) {
  const geometria = new THREE.BoxGeometry(1.7, 1.7, 1.7);
  const masala = new THREE.MeshStandardMaterial({
    color: ferebi[nomeri],
    roughness: 0.45
  });
  const kubi = new THREE.Mesh(geometria, masala);
  kubi.name = 'კუბი ' + (nomeri + 1);
  kubi.position.set((nomeri - 1) * 3.8, 0.85, 0);

  // საწყისი ფერი მონიშვნის მოხსნისას დაგვჭირდება
  kubi.userData.sawyisiFeri = masala.color.clone();

  kubebi.push(kubi);
  scena.add(kubi);
}

// HTML ში არსებული საინფორმაციო ფანჯარა და მისი ველები
const fanjara = document.getElementById('fanjara');
const saxeli = document.getElementById('saxeli');
const zoma = document.getElementById('zoma');
const mdebareoba = document.getElementById('mdebareoba');
const samkutxedebi = document.getElementById('samkutxedebi');
const mdgomareoba = document.getElementById('mdgomareoba');
const daxurva = document.getElementById('daxurva');
let monishnuliKubi = null;



function monishvnisMoxsna() {
  if (monishnuliKubi) {
    monishnuliKubi.material.color.copy(monishnuliKubi.userData.sawyisiFeri);
  }
  monishnuliKubi = null;
  fanjara.hidden = true;
  mdgomareoba.textContent = 'მონიშნული კუბი: არცერთი';
}


function kubisMonishvna(kubi) {
  monishvnisMoxsna();
  monishnuliKubi = kubi;
  kubi.material.color.set(0xa78bfa);

  const geometria = kubi.geometry;
  const parametrebi = geometria.parameters;


  // ინდექსირებული გეომეტრიის თითოეული სამი ინდექსი ერთ სამკუთხედს ქმნის
  const samkutxedisRaodenoba = geometria.index
    ? geometria.index.count / 3
    : geometria.attributes.position.count / 3;

  saxeli.textContent = kubi.name;
  zoma.textContent = parametrebi.width + ' × ' + parametrebi.height + ' × ' + parametrebi.depth;
  mdebareoba.textContent = kubi.position.x.toFixed(2) + ', '
    + kubi.position.y.toFixed(2) + ', ' + kubi.position.z.toFixed(2);
  samkutxedebi.textContent = samkutxedisRaodenoba;
  mdgomareoba.textContent = 'მონიშნულია: ' + kubi.name;
  fanjara.hidden = false;
}


// Raycaster კამერიდან მაუსისკენ სხივს უშვებს და ადგენს, რომელ კუბს ვაჭერთ
const sxivi = new THREE.Raycaster();
const mausisPozicia = new THREE.Vector2();

function kubisPovna(movlena) {
  const sazgvrebi = rendereri.domElement.getBoundingClientRect();
  mausisPozicia.x = ((movlena.clientX - sazgvrebi.left) / sazgvrebi.width) * 2 - 1;
  mausisPozicia.y = -((movlena.clientY - sazgvrebi.top) / sazgvrebi.height) * 2 + 1;

  if (Math.abs(mausisPozicia.x) > 1 || Math.abs(mausisPozicia.y) > 1) {
    return null;
  }



  // კამერისა და კუბების მიმდინარე მდებარეობა სხივის შემოწმებამდე განახლდეს
  scena.updateMatrixWorld(true);
  kamera.updateMatrixWorld();
  sxivi.setFromCamera(mausisPozicia, kamera);
  const shejaxebebi = sxivi.intersectObjects(kubebi, false);
  return shejaxebebi.length > 0 ? shejaxebebi[0].object : null;
}

// გადათრევა და რამდენიმე თითით შეხება ჩვეულებრივ დაჭერად არ ჩაითვალოს
let dacherisDasawyisi = null;
const aqtiuriTitebi = new Set();
const gadatrevisZgvari = 6;

rendereri.domElement.addEventListener('pointerdown', function (movlena) {
  aqtiuriTitebi.add(movlena.pointerId);
  if (aqtiuriTitebi.size !== 1 || movlena.button !== 0
      || movlena.ctrlKey || movlena.metaKey || movlena.shiftKey) {
    dacherisDasawyisi = null;
    return;
  }

  dacherisDasawyisi = {
    nomeri: movlena.pointerId,
    x: movlena.clientX,
    y: movlena.clientY,
    kubi: kubisPovna(movlena),
    gadatreulia: false
  };

});

window.addEventListener('pointermove', function (movlena) {
  if (!dacherisDasawyisi || dacherisDasawyisi.nomeri !== movlena.pointerId) return;

  const gadadgileba = Math.hypot(
    movlena.clientX - dacherisDasawyisi.x,

    movlena.clientY - dacherisDasawyisi.y
  );

  if (gadadgileba > gadatrevisZgvari) dacherisDasawyisi.gadatreulia = true;
});

window.addEventListener('pointerup', function (movlena) {
  aqtiuriTitebi.delete(movlena.pointerId);
  if (!dacherisDasawyisi || dacherisDasawyisi.nomeri !== movlena.pointerId) return;

  const dachera = dacherisDasawyisi;
  dacherisDasawyisi = null;
  if (dachera.gadatreulia || movlena.button !== 0
      || movlena.target !== rendereri.domElement) return;

  const gadadgileba = Math.hypot(movlena.clientX - dachera.x, movlena.clientY - dachera.y);
  if (gadadgileba > gadatrevisZgvari) return;

  const kubi = kubisPovna(movlena);
  if (kubi !== dachera.kubi) return;
  if (kubi) kubisMonishvna(kubi);
  else monishvnisMoxsna();
});

window.addEventListener('pointercancel', function (movlena) {
  aqtiuriTitebi.delete(movlena.pointerId);
  dacherisDasawyisi = null;
});

window.addEventListener('blur', function () {
  aqtiuriTitebi.clear();
  dacherisDasawyisi = null;
});


window.addEventListener('keydown', function (movlena) {
  if (movlena.key === 'Escape') {
    dacherisDasawyisi = null;
    monishvnisMoxsna();
  }
});
daxurva.addEventListener('click', monishvnisMoxsna);

// ზომის ცვლილებისას კამერის პროპორციებიც და გამოსახულებაც განახლდეს
window.addEventListener('resize', function () {
  kamera.aspect = window.innerWidth / window.innerHeight;
  kamera.updateProjectionMatrix();
  rendereri.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  rendereri.setSize(window.innerWidth, window.innerHeight);
});


function animacia() {
  requestAnimationFrame(animacia);
  kontroli.update();
  rendereri.render(scena, kamera);
}

animacia();
