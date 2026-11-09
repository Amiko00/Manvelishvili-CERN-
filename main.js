//სცენა კამერა და რენდერერი
const scena = new THREE.Scene();
scena.background = new THREE.Color(0x111827);

const kamera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const mandzili = window.innerWidth < 600 ? 38 : 24;
kamera.position.set(0.55, 0.45, 0.7).normalize().multiplyScalar(mandzili);
kamera.position.y += 2;

const rend = new THREE.WebGLRenderer({ antialias: true });
rend.setPixelRatio(Math.min(window.devicePixelRatio, 2));
rend.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(rend.domElement);

//OrbitControls სცენის სხვადასხვა მხრიდან დათვალიერებისთვის
const kontroli = new THREE.OrbitControls(kamera, rend.domElement);
kontroli.target.set(0, 2, 0);
kontroli.enableDamping = true;
kontroli.dampingFactor = 0.05;
kontroli.minDistance = 5;
kontroli.maxDistance = 65;
kontroli.maxPolarAngle = Math.PI / 2;
kontroli.update();

//განათება, ბადე და კოორდინატების ღერძები
scena.add(new THREE.AmbientLight(0xffffff, 0.65));
const sinatle = new THREE.DirectionalLight(0xffffff, 1);
sinatle.position.set(5, 12, 8);
scena.add(sinatle);
scena.add(new THREE.GridHelper(24, 24, 0x475569, 0x273449));

// X — წითელი, Y — მწვანე, Z — ლურჯი. ღერძების სიგრძე 8 ერთეულია
const axebi = new THREE.AxesHelper(8);
scena.add(axebi);

// სამი განსხვავებული ფიგურა
const kubi = new THREE.Mesh(
  new THREE.BoxGeometry(1.3, 1.3, 1.3),
  new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.4 })
);
scena.add(kubi);

const spero = new THREE.Mesh(
  new THREE.SphereGeometry(0.8, 32, 24),
  new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 })
);
scena.add(spero);

const konusi = new THREE.Mesh(
  new THREE.ConeGeometry(0.8, 1.6, 32),
  new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 })
);
scena.add(konusi);

//მოძრაობის საზღვრები და სიჩქარეები
const xazisNaxevari = 6.5;
const xazisSimagle = 1;
const xazisZ = 5;
const xazisSichqare = 0.8;

const crisCentri = new THREE.Vector3(-4, 1.1, -2);
const crisRadiusi = 2.2;
const crisSichqare = 0.75;

const spiralisCentri = new THREE.Vector3(4, 1.1, -2);
const spiralisRadiusi = 2;
const spiralisSimagle = 5;
const spiralisBrunvebi = 2;
const spiralisSichqare = 0.35;

//gavliliNawili = 0 ნიშნავს სპირალის დასაწყისს, gavliliNawili = 1მის ზედა ბოლოს
//ამავე ფორმულით ვხატავთ ტრაექტორიას და ვამოძრავებთ კონუსს
function setSpiralPosition(pozicia, gavliliNawili) {
  const kutxe = gavliliNawili * Math.PI * 2 * spiralisBrunvebi;
  pozicia.set(
    spiralisCentri.x + spiralisRadiusi * Math.cos(kutxe),
    spiralisCentri.y + spiralisSimagle * gavliliNawili,
    spiralisCentri.z + spiralisRadiusi * Math.sin(kutxe)
  );
}

//ფერადი ხაზები გვიჩვენებს თითოეული ფიგურის მოძრაობის გზას
function addTrajectory(certilebi, feri) {
  const geometria = new THREE.BufferGeometry().setFromPoints(certilebi);
  const masala = new THREE.LineBasicMaterial({
    color: feri,
    transparent: true,
    opacity: 0.5
  });
  scena.add(new THREE.Line(geometria, masala));
}

addTrajectory([
  new THREE.Vector3(-xazisNaxevari, xazisSimagle, xazisZ),
  new THREE.Vector3(xazisNaxevari, xazisSimagle, xazisZ)
], 0x60a5fa);

const criscertilebi = [];
const spiraliscertilebi = [];
const monakvetebi = 200;
for (let nomeri = 0; nomeri <= monakvetebi; nomeri += 1) {
  const gavliliNawili = nomeri / monakvetebi;
  const kutxe = gavliliNawili * Math.PI * 2;
  criscertilebi.push(new THREE.Vector3(
    crisCentri.x + crisRadiusi * Math.cos(kutxe),
    crisCentri.y,
    crisCentri.z + crisRadiusi * Math.sin(kutxe)
  ));

  const wertili = new THREE.Vector3();
  setSpiralPosition(wertili, gavliliNawili);
  spiraliscertilebi.push(wertili);
}
addTrajectory(criscertilebi, 0xf472b6);
addTrajectory(spiraliscertilebi, 0xfbbf24);

//პოზიციებს ვანგარიშობთ გასული დროით (წამებში)
function updatePositions(dro) {
  //siიცვლება -1-დან 1-მდე კუბი X-ზე მიდის წინ და უკან
  //Y და Z უცვლელია, ამიტომ მოძრაობის გზა სწორი ხაზია
  kubi.position.set(
    Math.sin(dro * xazisSichqare) * xazisNaxevari,
    xazisSimagle,
    xazisZ
  );

  //cos და sin ერთად წრიულ მოძრაობას ქმნის XZ სიბრტყეში
  const crisKutxe = dro * crisSichqare;
  spero.position.set(
    crisCentri.x + crisRadiusi * Math.cos(crisKutxe),
    crisCentri.y,
    crisCentri.z + crisRadiusi * Math.sin(crisKutxe)
  );

  //gavliliNawili რბილად იცვლება 0-დან 1მდე და უკან
  //კონუსი იმავე სპირალს აუყვება და ჩამოუყვება, ადგილზე გადახტომის გარეშე
  const spiralisNawili = (1 - Math.cos(dro * spiralisSichqare)) / 2;
  setSpiralPosition(konusi.position, spiralisNawili);
}

//requestAnimationFrame გვაძლევს დროს მილიწამებში
let dawyebisDro = null;

function animate(kadrisDro) {
  if (dawyebisDro === null) dawyebisDro = kadrisDro;
  const dro = (kadrisDro - dawyebisDro) / 1000;

  updatePositions(dro);
  kontroli.update();
  rend.render(scena, kamera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

//ფანჯრის ზომის ცვლილება.
window.addEventListener("resize", () => {
  kamera.aspect = window.innerWidth / window.innerHeight;
  kamera.updateProjectionMatrix();
  rendereri.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  rendereri.setSize(window.innerWidth, window.innerHeight);
});