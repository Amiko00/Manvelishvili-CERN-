// სცენა, კამერა და რენდერერი
const mdgomareoba = document.getElementById('mdgomareoba');

const scena = new THREE.Scene();

scena.background = new THREE.Color(0x111827);



const kamera = new THREE.PerspectiveCamera(
  50, window.innerWidth / window.innerHeight, 0.1, 100

);


const mandzili = window.innerWidth < 600 ? 13 : 9;

kamera.position.set(1, 0.7, 1.4).normalize().multiplyScalar(mandzili);

kamera.position.y += 1.8;



const rendereri = new THREE.WebGLRenderer({ antialias: true });
rendereri.setPixelRatio(Math.min(window.devicePixelRatio, 2));
rendereri.setSize(window.innerWidth, window.innerHeight);
rendereri.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(rendereri.domElement);

// orbitcontrols საშუალებას გვაძლევს პირამიდა სხვადასხვა მხრიდან დავათვალიეროთ
const kontroli = new THREE.OrbitControls(kamera, rendereri.domElement);
kontroli.target.set(0, 1.8, 0);
kontroli.enableDamping = true;
kontroli.dampingFactor = 0.05;
kontroli.minDistance = 4;
kontroli.maxDistance = 25;
kontroli.update();

scena.add(new THREE.AmbientLight(0xffffff, 0.7));
const sinatle = new THREE.DirectionalLight(0xffffff, 0.6);
sinatle.position.set(4, 7, 5);
scena.add(sinatle);

const bade = new THREE.GridHelper(14, 14, 0x475569, 0x273449);
scena.add(bade);

// textureloader ფოტოს ფაილიდან ქმნის ტექსტურას
const chamtvirtveli = new THREE.TextureLoader();
const teqstura = chamtvirtveli.load(
  './textures/dedamica.jpg',
  function () {
    piramida.visible = true;
    mdgomareoba.hidden = true;
  },
  undefined,
  function (shecdoma) {
    mdgomareoba.textContent = 'ფოტო ვერ ჩაიტვირთა ამიტომაც გამოიყენე Live Server და გადაამოწმე textures საქაღალდე';
    console.error('ფოტოს ჩატვირთვის შეცდომა', shecdoma);
  }
);

// sRGB ფოტოს ფერების სწორად ჩვენებისთვის გვჭირდება
teqstura.encoding = THREE.sRGBEncoding;
teqstura.anisotropy = Math.min(8, rendereri.capabilities.getMaxAnisotropy());

// ოთხსეგმენტიანი კონუსი კვადრატული ფუძის მქონე პირამიდას ქმნის
const geometria = new THREE.ConeGeometry(2.3, 3.6, 4).toNonIndexed();
geometria.computeVertexNormals();

// თითოეულ სამკუთხა გვერდზე ფოტო ცალ-ცალკე თავსდება
const koordinatebi = geometria.attributes.uv;
for (let gverdi = 0; gverdi < 4; gverdi++) {
  const dasawyisi = gverdi * 6;

  koordinatebi.setXY(dasawyisi, 0.5, 1);
  koordinatebi.setXY(dasawyisi + 1, 0, 0);
  koordinatebi.setXY(dasawyisi + 2, 0.5, 1);
  koordinatebi.setXY(dasawyisi + 3, 0, 0);
  koordinatebi.setXY(dasawyisi + 4, 1, 0);
  koordinatebi.setXY(dasawyisi + 5, 0.5, 1);

}

// map ფოტოს პირამიდის ზედაპირებზე ათავსებს
const masala = new THREE.MeshLambertMaterial({ map: teqstura });

const piramida = new THREE.Mesh(geometria, masala);

piramida.position.y = 1.8;

piramida.rotation.y = Math.PI / 4;

piramida.visible = false;

scena.add(piramida);

// წვრილი კონტური ფოტოს მუქ ფონზეც გამოკვეთს პირამიდის კიდეებს
const konturi = new THREE.LineSegments(

  new THREE.EdgesGeometry(geometria),
  new THREE.LineBasicMaterial({ color: 0x64748b })

);
piramida.add(konturi);

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


