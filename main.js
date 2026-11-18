// სცენა და კამერა გახსნილი კუბის გარედან დასათვალიერებლად
const mdgomareoba = document.getElementById('mdgomareoba');
const scena = new THREE.Scene();
scena.background = new THREE.Color(0x111827);


const kamera = new THREE.PerspectiveCamera(
  50, window.innerWidth / window.innerHeight, 0.1, 100
);

const dashoreba = window.innerWidth < 600 ? 1.5 : 1;
kamera.position.set(9 * dashoreba, 3 + 5 * dashoreba, 12 * dashoreba);



const rendereri = new THREE.WebGLRenderer({ antialias: true });
rendereri.setPixelRatio(Math.min(window.devicePixelRatio, 2));
rendereri.setSize(window.innerWidth, window.innerHeight);
rendereri.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(rendereri.domElement);

// orbitcontol კუბის გარშემო ბრუნვასა და მიახლოებას გვაძლევს
const kontroli = new THREE.OrbitControls(kamera, rendereri.domElement);
kontroli.target.set(0, 3, 0);
kontroli.enableDamping = true;
kontroli.dampingFactor = 0.05;
kontroli.rotateSpeed = 0.6;
kontroli.enablePan = false;
kontroli.minDistance = 8;
kontroli.maxDistance = 30;
kontroli.maxPolarAngle = Math.PI / 2 - 0.05;
kontroli.update();

const bade = new THREE.GridHelper(20, 20, 0x475569, 0x273449);
bade.position.y = -0.02;
scena.add(bade);

// კუბი ფოტოების ჩატვირთვის შემდეგ გამოჩნდება
let chaitvirtaShecdomit = false;
const chamotvirtvisMartva = new THREE.LoadingManager();
chamotvirtvisMartva.onLoad = function () {
  if (!chaitvirtaShecdomit) {
    kubi.visible = true;
    mdgomareoba.hidden = true;
  }
};
chamotvirtvisMartva.onError = function (misamarti) {
  chaitvirtaShecdomit = true;
  mdgomareoba.textContent = 'ფოტოები ვერ ჩაიტვირთა — გამოიყენე Live Server და გადაამოწმე textures/panorama საქაღალდე';
  console.error('ფოტოს ჩატვირთვის შეცდომა', misamarti);
};

// რიგი ემთხვევა boxgeometry-ის მხარეებს
// ამ პანორამის X მხარეები Three.js  ის კოორდინატებისთვის ადგილებს ცვლიან
// ზედა და წინა მხარეები ღიაა, რადგან შიდა კედლები გარედან გამოჩნდეს
const fotoebi = [
  'negx.jpg',
  'posx.jpg',
  null,
  'negy.jpg',
  null,
  'negz.jpg'
];

const chamtvirtveli = new THREE.TextureLoader(chamotvirtvisMartva);
const masalebi = fotoebi.map(function (faili) {
  if (faili === null) {

    return new THREE.MeshBasicMaterial({ visible: false });
  }

  const teqstura = chamtvirtveli.load('./textures/panorama/' + faili);
  teqstura.encoding = THREE.sRGBEncoding;
  teqstura.anisotropy = Math.min(8, rendereri.capabilities.getMaxAnisotropy());



  // ფოტოები კუბის შიგნიდან სწორად უნდა ჩანდეს
  teqstura.repeat.x = -1;
  teqstura.offset.x = 1;


  // BackSide ტექსტურას შიდა მხარეს აჩვენებს, MeshBasicMaterial განათებას არ საჭიროებს
  return new THREE.MeshBasicMaterial({ map: teqstura, side: THREE.BackSide });
});

// ფოტოები სამ შიდა კედელსა და იატაკს ფარავს
const geometria = new THREE.BoxGeometry(6, 6, 6);
const kubi = new THREE.Mesh(geometria, masalebi);
kubi.position.y = 3;
kubi.visible = false;
scena.add(kubi);


// კონტური ღია მხარეებზეც აჩვენებს კუბის ფორმას
const konturi = new THREE.LineSegments(
  new THREE.EdgesGeometry(geometria),
  new THREE.LineBasicMaterial({ color: 0xb6c7d9 })
);
kubi.add(konturi);



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
