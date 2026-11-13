// სცენა, კამერა და რენდერერი
const mdgomareoba = document.getElementById('mdgomareoba');
const scena = new THREE.Scene();
scena.background = new THREE.Color(0x111827);
const kamera = new THREE.PerspectiveCamera(
  50, window.innerWidth / window.innerHeight, 0.01, 1000
);
kamera.position.set(7, 4, 9);

const rendereri = new THREE.WebGLRenderer({ antialias: true });
rendereri.setPixelRatio(Math.min(window.devicePixelRatio, 2));
rendereri.setSize(window.innerWidth, window.innerHeight);
rendereri.outputEncoding = THREE.sRGBEncoding;
rendereri.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(rendereri.domElement);


const kontroli = new THREE.OrbitControls(kamera, rendereri.domElement);
kontroli.enableDamping = true;
kontroli.dampingFactor = 0.05;
kontroli.update();




scena.add(new THREE.HemisphereLight(0xffffff, 0x607080, 1.1));

const sinatle = new THREE.DirectionalLight(0xffffff, 1.1);
sinatle.position.set(4, 7, 6);
scena.add(sinatle);

const meoreSinatle = new THREE.DirectionalLight(0xc4d5ff, 0.6);
meoreSinatle.position.set(-5, 3, -5);
scena.add(meoreSinatle);

// საერთო ჯგუფი ინარჩუნებს სამი ფაილის ერთმანეთის მიმართ მდებარეობასა და მასშტაბს
const deteqtori = new THREE.Group();


scena.add(deteqtori);
const modelebi = [];


const mosanishniNawilebi = [];

const monishvnisFeri = new THREE.Color(0xff2424).convertSRGBToLinear();


let monishnuliModeli = null;
let scenisRadiusi = 3;
let mzadaa = false;


const failebi = [

  { misamarti: './models/1.glb', saxeli: 'ITK-Strip/Barrel' },
  { misamarti: './models/2.glb', saxeli: 'ITK-Pixel-Outer-Endcap-SideC' },
  { misamarti: './models/3.glb', saxeli: 'ITK-Pixel-Outer-Endcap-SideA' }
];

// ანოტაცია რეალური 3D Sprite ია და კამერისკენ იყურება
const anotaciisTilo = document.createElement('canvas');

const anotaciisKonteqsti = anotaciisTilo.getContext('2d');

const anotaciisTeqstura = new THREE.CanvasTexture(anotaciisTilo);


anotaciisTeqstura.encoding = THREE.sRGBEncoding;

anotaciisTeqstura.minFilter = THREE.LinearFilter;


anotaciisTeqstura.generateMipmaps = false;



const anotacia = new THREE.Sprite(new THREE.SpriteMaterial({
  map: anotaciisTeqstura,
  transparent: true,
  depthTest: false,
  depthWrite: false,
  toneMapped: false
}));
anotacia.center.set(0.5, 0);
anotacia.renderOrder = 2;

const anotaciisXazi = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
  new THREE.LineBasicMaterial({ color: 0xff5757, depthTest: false, depthWrite: false })
);


anotaciisXazi.renderOrder = 1;
const anotaciisJgufi = new THREE.Group();
anotaciisJgufi.add(anotacia, anotaciisXazi);
anotaciisJgufi.visible = false;
scena.add(anotaciisJgufi);
const anotaciisPozicia = new THREE.Vector3();


function anotaciisSheqmna(modeli) {
  // ტექსტი ტექსტურად იხატება და მხოლოდ მონიშნული მოდელის სახელს აჩვენებს
  anotaciisKonteqsti.font = '600 28px Arial';
  anotaciisTilo.width = Math.ceil(anotaciisKonteqsti.measureText(modeli.name).width) + 48;
  anotaciisTilo.height = 72;
  anotaciisKonteqsti.fillStyle = '#0f172a';
  anotaciisKonteqsti.fillRect(0, 0, anotaciisTilo.width, anotaciisTilo.height);
  anotaciisKonteqsti.strokeStyle = '#ff5757';
  anotaciisKonteqsti.lineWidth = 3;

  anotaciisKonteqsti.strokeRect(2, 2, anotaciisTilo.width - 4, anotaciisTilo.height - 4);
  anotaciisKonteqsti.font = '600 28px Arial';

  anotaciisKonteqsti.textAlign = 'center';


  anotaciisKonteqsti.textBaseline = 'middle';
  anotaciisKonteqsti.fillStyle = '#f3f4f6';
  anotaciisKonteqsti.fillText(modeli.name, anotaciisTilo.width / 2, anotaciisTilo.height / 2);

  anotaciisTeqstura.needsUpdate = true;


//მოდელის ზედა წერტილი და წარწერა ხაზით უკავშირდება ერთმანეთს
  const sazgvrebi = new THREE.Box3().setFromObject(modeli);
  const centri = sazgvrebi.getCenter(new THREE.Vector3());
  const samagri = new THREE.Vector3(centri.x, sazgvrebi.max.y, centri.z);
  anotacia.position.copy(samagri);
  anotacia.position.y += scenisRadiusi * 0.16;
  const certilebi = anotaciisXazi.geometry.attributes.position;
  certilebi.setXYZ(0, samagri.x, samagri.y, samagri.z);
  certilebi.setXYZ(1, anotacia.position.x, anotacia.position.y, anotacia.position.z);
  certilebi.needsUpdate = true;
  anotaciisXazi.geometry.computeBoundingSphere();
  anotaciisJgufi.visible = true;
}

function anotaciisZomisGanaxleba() {
  if (!anotaciisJgufi.visible) return;

  // წარწერა მიახლოებისა და დაშორების დროსაც წაკითხვად ზომას ინარჩუნებს ან უ მებისმიერი მიმართელებიდან შეიძლება მისი წაკითხვა
  kamera.updateMatrixWorld();
  anotaciisPozicia.copy(anotacia.position).applyMatrix4(kamera.matrixWorldInverse);
  const sigrme = Math.max(0.01, -anotaciisPozicia.z);
  const ertPiqselze = 2 * sigrme * Math.tan(THREE.MathUtils.degToRad(kamera.fov / 2))
    / window.innerHeight;
  const sigane = Math.min(anotaciisTilo.width * 0.7, 340, window.innerWidth - 32);
  anotacia.scale.set(
    sigane * ertPiqselze,
    sigane * anotaciisTilo.height / anotaciisTilo.width * ertPiqselze,
    1
  );
}

function monishvnisMoxsna() {

  if (monishnuliModeli) {
    monishnuliModeli.userData.masalebi.forEach(function (chanaweri) {
      chanaweri.masala.color.copy(chanaweri.feri);
      chanaweri.masala.roughness = chanaweri.sixorkle;

      chanaweri.masala.metalness = chanaweri.litonuroba;
      if ('clearcoat' in chanaweri.masala) {
        chanaweri.masala.clearcoat = chanaweri.laqi;
      }

    });
  }
  monishnuliModeli = null;
  anotaciisJgufi.visible = false;

  if (mzadaa) mdgomareoba.textContent = 'მონიშნული ობიექტი: არცერთი';
}

function modelisMonishvna(modeli) {
  monishvnisMoxsna();
  monishnuliModeli = modeli;

  modeli.userData.masalebi.forEach(function (chanaweri) {
    // მკვეთრი წითელი და ნაკლები ბზინვარება მონიშვნას უკეთ გამოაჩენს
    chanaweri.masala.color.copy(monishvnisFeri);
    chanaweri.masala.roughness = 1;

    chanaweri.masala.metalness = 0;
    if ('clearcoat' in chanaweri.masala) {

      chanaweri.masala.clearcoat = 0;
    }
  });
  anotaciisSheqmna(modeli);
  anotaciisZomisGanaxleba();
  mdgomareoba.textContent = modeli.name;
}

function xedzeMorgeba() {
  const vertikaluriKutxe = THREE.MathUtils.degToRad(kamera.fov / 2);

  const horizontaluriKutxe = Math.atan(Math.tan(vertikaluriKutxe) * kamera.aspect);

  const mandzili = scenisRadiusi / Math.sin(Math.min(vertikaluriKutxe, horizontaluriKutxe)) * 1.3;

  const mimartuleba = kamera.position.clone().sub(kontroli.target).normalize();


  kontroli.target.set(0, 0, 0);
  kamera.position.copy(mimartuleba.multiplyScalar(mandzili));
  kontroli.minDistance = scenisRadiusi * 0.5;
  kontroli.maxDistance = scenisRadiusi * 12;
  kontroli.update();
}

// GLTF loader თითოეულ GLB ფაილს თავისი შიდა გეომეტრიებით ტვირთავს
const chamtvirtveli = new THREE.GLTFLoader();
let chatvirtuliRaodenoba = 0;

async function modelebisChatvirtva() {
  try {
    const shedegebi = await Promise.allSettled(failebi.map(async function (faili) {
      const monacemebi = await chamtvirtveli.loadAsync(faili.misamarti);
      const modeli = monacemebi.scene;
      modeli.name = faili.saxeli;
      modeli.userData.masalebi = [];

      modeli.traverse(function (nawili) {

        if (!nawili.isMesh) return;

        // შიდა ნაწილის არჩევა მთელ იმპორტირებულ მოდელს მონიშნავს
        nawili.userData.modeli = modeli;
        mosanishniNawilebi.push(nawili);
        const masalebi = Array.isArray(nawili.material) ? nawili.material : [nawili.material];
        const axaliMasalebi = masalebi.map(function (masala) {
          const axaliMasala = masala.clone();


          modeli.userData.masalebi.push({
            masala: axaliMasala,
            feri: axaliMasala.color.clone(),
            sixorkle: axaliMasala.roughness,
            litonuroba: axaliMasala.metalness,
            laqi: axaliMasala.clearcoat
          });


          return axaliMasala;
        });
        nawili.material = Array.isArray(nawili.material) ? axaliMasalebi : axaliMasalebi[0];
      });



      modelebi.push(modeli);
      deteqtori.add(modeli);
      chatvirtuliRaodenoba++;
      mdgomareoba.textContent = 'მოდელები იტვირთება: ' + chatvirtuliRaodenoba + '/3';
    }));

    const shecdoma = shedegebi.find(function (shedegi) {
      return shedegi.status === 'rejected';
    });
    if (shecdoma) throw shecdoma.reason;

    // მხოლოდ მთელ ჯგუფს ვაცენტრებთ და ნაწილების ურთიერთმდებარეობას არ ვცვლით
    const sazgvrebi = new THREE.Box3().setFromObject(deteqtori);
    const centri = sazgvrebi.getCenter(new THREE.Vector3());
    deteqtori.position.sub(centri);
    deteqtori.updateMatrixWorld(true);
    sazgvrebi.setFromObject(deteqtori);
    scenisRadiusi = sazgvrebi.getBoundingSphere(new THREE.Sphere()).radius;



    const bade = new THREE.GridHelper(12, 24, 0x475569, 0x273449);
    bade.position.y = sazgvrebi.min.y - 0.12;
    scena.add(bade);
    xedzeMorgeba();
    mzadaa = true;
    mdgomareoba.textContent = 'მონიშნული ობიექტი: არცერთი';
  } catch (shecdoma) {
    mdgomareoba.textContent = 'მოდელები ვერ ჩაიტვირთა ამიტომაც გახსენი index.html Live Server-ით და გადაამოწმე models საქაღალდე';
    console.error('მოდელების ჩატვირთვის შეცდომა', shecdoma);
  }
}



const sxivi = new THREE.Raycaster();
const mausisPozicia = new THREE.Vector2();

function modelisPovna(movlena) {
  if (!mzadaa) return null;
  const sazgvrebi = rendereri.domElement.getBoundingClientRect();
  mausisPozicia.x = ((movlena.clientX - sazgvrebi.left) / sazgvrebi.width) * 2 - 1;
  mausisPozicia.y = -((movlena.clientY - sazgvrebi.top) / sazgvrebi.height) * 2 + 1;
  if (Math.abs(mausisPozicia.x) > 1 || Math.abs(mausisPozicia.y) > 1) return null;



  scena.updateMatrixWorld(true);
  kamera.updateMatrixWorld();
  sxivi.setFromCamera(mausisPozicia, kamera);
  const shejaxebebi = sxivi.intersectObjects(mosanishniNawilebi, false);
  return shejaxebebi.length ? shejaxebebi[0].object.userData.modeli : null;
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
    modeli: modelisPovna(movlena),
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

  const modeli = modelisPovna(movlena);
  if (modeli !== dachera.modeli) return;

  if (modeli) modelisMonishvna(modeli);
    
  else monishvnisMoxsna();
});

window.addEventListener('pointercancel', function (movlena) {

  aqtiuriTitebi.delete(movlena.pointerId);
  dacherisDasawyisi = null;
});

window.addEventListener('blur', function () {

  // თუ ფანჯარა დაკეტილია, ყველა მომხმარებელის მიერ დაწყებული ქმედებები უნდა გაუქმდეს

aqtiuriTitebi.clear();
  dacherisDasawyisi = null;
});


window.addEventListener('keydown', function (movlena) {
  if (movlena.key === 'Escape') {
    dacherisDasawyisi = null;
    monishvnisMoxsna();
  }
});
// ფანჯრის ზომის ცვლილებისას სამივე მოდელი ხედში დარჩეს
window.addEventListener('resize', function () {
  kamera.aspect = window.innerWidth / window.innerHeight;
  kamera.updateProjectionMatrix();

  rendereri.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  rendereri.setSize(window.innerWidth, window.innerHeight);

  if (mzadaa) xedzeMorgeba();
});

function animacia() {
  requestAnimationFrame(animacia);
  kontroli.update();

  anotaciisZomisGanaxleba();

  rendereri.render(scena, kamera);
}

animacia();
modelebisChatvirtva();
