

const tilo = document.getElementById('tilo');

const kutxe = document.getElementById('kutxe');

const gradusi = document.getElementById('gradusi');
const mdgomareoba = document.getElementById('mdgomareoba');

const scena = new THREE.Scene();
scena.background = new THREE.Color(0x111827);

const xedvisKutxe = 46;
const kamera = new THREE.PerspectiveCamera(xedvisKutxe, 1, 0.1, 100);
kamera.position.set(5.5, 3.7, 6.2);

const rendereri = new THREE.WebGLRenderer({ canvas: tilo, antialias: true });
rendereri.outputEncoding = THREE.sRGBEncoding;

// სფეროს მასალაზე სინათლე ზედაპირის დახრილობის მიხედვით ნაწილდება
const geometria = new THREE.SphereGeometry(1.5, 64, 48);

const masala = new THREE.MeshLambertMaterial();

const spero = new THREE.Mesh(geometria, masala);

spero.position.y = 1.6;

spero.rotation.y = -1.45;


scena.add(spero);

// X ღერძი წითელია, Y მწვანე, Z კი ლურჯი
const gerdzebi = new THREE.AxesHelper(3.55);
scena.add(gerdzebi);


const bade = new THREE.GridHelper(20, 20, 0x475569, 0x273449);

bade.position.y = -0.02;
scena.add(bade);

// წყაროდან სფეროს ცენტრისკენ მიმართული სხივები ერთმანეთის პარალელურია

const sinatle = new THREE.DirectionalLight(0xffffff, 1.1);

sinatle.target = spero;
scena.add(sinatle);

const kontroli = new THREE.OrbitControls(kamera, tilo);
kontroli.target.copy(spero.position);
kontroli.enableDamping = true;
kontroli.dampingFactor = 0.05;
kontroli.rotateSpeed = 0.6;
kontroli.enablePan = false;
kontroli.minDistance = 3.3;
kontroli.maxDistance = 14;
kontroli.update();

// ინერციული ბრუნვისას ყოველი ცვლილება შემდეგ კადრს ითხოვს
let kadri = null;
function daxatvisMotxovna() {
  if (kadri === null) {
    kadri = requestAnimationFrame(daxatva);
  }
}

function daxatva() {

  kadri = null;

  kontroli.update();

  rendereri.render(scena, kamera);

}

// სლაიდერი სინათლის წყაროს სფეროს გარშემო გადაადგილებს
function sinatlisMimartva() {
  const radiani = THREE.MathUtils.degToRad(kutxe.valueAsNumber);
  sinatle.position.set(6 * Math.sin(radiani), spero.position.y + 3, 6 * Math.cos(radiani));
  gradusi.value = kutxe.value + '°';
  daxatvisMotxovna();

}

function zomisMorgeba() {

  const sigane = tilo.clientWidth;
  const simagle = tilo.clientHeight;
  kamera.aspect = sigane / simagle;
  // ვიწრო ეკრანზეც სფერო მთლიანად ეტევა საწყის ხედში
  const naxevariKutxe = THREE.MathUtils.degToRad(xedvisKutxe / 2);
  kamera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(naxevariKutxe) / Math.min(1, kamera.aspect)));
  kamera.updateProjectionMatrix();
  rendereri.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  rendereri.setSize(sigane, simagle, false);
  daxatvisMotxovna();

}

kontroli.addEventListener('change', daxatvisMotxovna);
kutxe.addEventListener('input', sinatlisMimartva);
window.addEventListener('resize', zomisMorgeba);
sinatlisMimartva();
zomisMorgeba();

// მსოფლიო რუკა სფეროს ზედაპირს ეკვატორისა და პოლუსების გასწვრივ ერგება
const chamtvirtveli = new THREE.TextureLoader();

chamtvirtveli.load('./textures/dedamica.png', function (teqstura) {

  teqstura.encoding = THREE.sRGBEncoding;
  masala.map = teqstura;

  masala.needsUpdate = true;
  mdgomareoba.hidden = true;

  daxatvisMotxovna();

}, undefined, function () {

  mdgomareoba.textContent = 'რუკა ვერ ჩაიტვირთა — გადაამოწმე textures საქაღალდე და გაუშვი პროექტი Live Server-ით';

});
