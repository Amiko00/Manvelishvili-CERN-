

const tilo = document.getElementById('tilo');

const simdzlavre = document.getElementById('simdzlavre');

const machvenebeli = document.getElementById('machvenebeli');
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
bade.geometry.computeBoundingSphere();
scena.add(bade);

// წყაროდან სფეროს ცენტრისკენ მიმართული სხივები ერთმანეთის პარალელურია

const sinatle = new THREE.DirectionalLight(0xffffff, 1.1);
sinatle.position.set(-3, 4.6, 5.2);
sinatle.target.position.copy(spero.position);
scena.add(sinatle, sinatle.target);

const kontroli = new THREE.OrbitControls(kamera, tilo);
kontroli.target.copy(spero.position);
kontroli.rotateSpeed = 0.6;
kontroli.enablePan = true;
kontroli.minDistance = 3.3;
kontroli.update();

// გადათრევის დასაწყისში ვამოწმებთ, მოხვდა თუ არა სხივი სფეროს
const sxivi = new THREE.Raycaster();
const isari = new THREE.Vector2();
const shexebebi = new Map();
const marjvenaGerzi = new THREE.Vector3();
const zedaGerzi = new THREE.Vector3();

function sperozeDachera(movlena) {
  const sazghvrebi = tilo.getBoundingClientRect();
  isari.set(
    2 * (movlena.clientX - sazghvrebi.left) / sazghvrebi.width - 1,
    1 - 2 * (movlena.clientY - sazghvrebi.top) / sazghvrebi.height
  );
  kamera.updateMatrixWorld();
  spero.updateMatrixWorld();
  sxivi.setFromCamera(isari, kamera);
  return sxivi.intersectObject(spero).length > 0;
}

tilo.addEventListener('pointerdown', function (movlena) {
  if (movlena.button !== 0 || movlena.ctrlKey || movlena.shiftKey || movlena.metaKey) return;
  if (shexebebi.size === 0) {
    kontroli.enableRotate = !sperozeDachera(movlena);
    marjvenaGerzi.set(1, 0, 0).applyQuaternion(kamera.quaternion);
    zedaGerzi.set(0, 1, 0).applyQuaternion(kamera.quaternion);
  }
  shexebebi.set(movlena.pointerId, new THREE.Vector2(movlena.clientX, movlena.clientY));
  tilo.setPointerCapture(movlena.pointerId);
}, { capture: true });

tilo.addEventListener('pointermove', function (movlena) {
  const winaAdgili = shexebebi.get(movlena.pointerId);
  if (!winaAdgili) return;

  // ორი თითით მიახლოებასა და გადატანას OrbitControls მართავს
  if (!kontroli.enableRotate && shexebebi.size === 1) {
    const sichqare = Math.PI / Math.min(tilo.clientWidth, tilo.clientHeight);
    spero.rotateOnWorldAxis(zedaGerzi, (movlena.clientX - winaAdgili.x) * sichqare);
    spero.rotateOnWorldAxis(marjvenaGerzi, (movlena.clientY - winaAdgili.y) * sichqare);
    daxatvisMotxovna();
  }
  winaAdgili.set(movlena.clientX, movlena.clientY);
});

function shexebisDasruleba(movlena) {
  shexebebi.delete(movlena.pointerId);
  if (shexebebi.size === 0) kontroli.enableRotate = true;
}
tilo.addEventListener('pointerup', shexebisDasruleba);
tilo.addEventListener('pointercancel', shexebisDasruleba);
tilo.addEventListener('lostpointercapture', shexebisDasruleba);

// ხედის ცვლილებისას შემდეგი კადრი იხატება
let kadri = null;
function daxatvisMotxovna() {
  if (kadri === null) {
    kadri = requestAnimationFrame(daxatva);
  }
}

function daxatva() {

  kadri = null;

  rendereri.render(scena, kamera);

}

// სლაიდერი ფიქსირებული წყაროს სიმძლავრეს ცვლის
function sinatlisSimdzlavre() {
  sinatle.intensity = simdzlavre.valueAsNumber;
  machvenebeli.value = sinatle.intensity.toFixed(1);
  daxatvisMotxovna();

}

// ბადის ოთხივე კუთხე ეტევა ხედში სრული დაშორებისას, ხედის გადატანის შემდეგაც
const naxevariKutxe = THREE.MathUtils.degToRad(xedvisKutxe / 2);
function xedvisSazgvrebi() {
  const radiusi = bade.geometry.boundingSphere.radius + kontroli.target.distanceTo(bade.position);
  kontroli.maxDistance = 1.15 * radiusi / Math.sin(naxevariKutxe);
  kamera.far = Math.max(100, kontroli.maxDistance + 2 * radiusi);
  kamera.updateProjectionMatrix();
  daxatvisMotxovna();
}

function zomisMorgeba() {

  const sigane = tilo.clientWidth;
  const simagle = tilo.clientHeight;
  kamera.aspect = sigane / simagle;
  // ვიწრო ეკრანზეც სფერო მთლიანად ეტევა საწყის ხედში
  kamera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(naxevariKutxe) / Math.min(1, kamera.aspect)));
  rendereri.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  rendereri.setSize(sigane, simagle, false);
  xedvisSazgvrebi();

}

kontroli.addEventListener('change', xedvisSazgvrebi);
simdzlavre.addEventListener('input', sinatlisSimdzlavre);
window.addEventListener('resize', zomisMorgeba);
sinatlisSimdzlavre();
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
