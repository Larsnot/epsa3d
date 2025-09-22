// Variables globales

let scene, camera, renderer, water, particles;
let animationId;
let isLoaded = false;

// Configuración inicial
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    setupNavigation();
    setupHeroThreeJS();   // si lo quieres mantener (fondo animado)
    setupHeroModel();     // <-- añade esto
    setupScrollEffects();
    setupGallery();
    setupStats();
    setupContactForm();
    setupIntersectionObserver();
});
document.addEventListener('DOMContentLoaded', function() {
    function initializeWebsite() {
    setupNavigation();
    setupHeroThreeJS();   // fondo (opcional)
    setupHeroModel();     // inicializa modelo lateral
    setupScrollEffects();
    setupGallery();
    setupStats();
    setupContactForm();
    setupIntersectionObserver();
}

});



// ============================================================================
// NAVEGACIÓN
// ============================================================================
function setupNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect para navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Toggle móvil
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer click en enlaces
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
            }
            if (navToggle) {
                navToggle.classList.remove('active');
            }
        });
    });

    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================================================
// THREE.JS HERO SECTION
// ============================================================================
// Reemplaza la función setupHeroThreeJS existente por esta:
function setupHeroThreeJS() {
    const container = document.getElementById('hero-canvas');
    if (!container) return;

    try {
        // Siempre busca o crea un canvas hijo dentro del contenedor
        let canvasEl = container.querySelector('canvas');
        if (!canvasEl) {
            canvasEl = document.createElement('canvas');
            canvasEl.style.width = '100%';
            canvasEl.style.height = '100%';
            canvasEl.style.display = 'block';
            container.appendChild(canvasEl);
        }
        // Verifica que sea un canvas real
        if (canvasEl.tagName.toLowerCase() !== 'canvas') {
            throw new Error('No se pudo crear o encontrar un elemento <canvas> dentro de #hero-canvas');
        }

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);

        // Escena y cámara
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

        // Iluminación
        const ambientLight = new THREE.AmbientLight(0x4A90E2, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x87CEEB, 0.8);
        directionalLight.position.set(50, 50, 50);
        scene.add(directionalLight);

        // Crear efecto de agua y partículas
        createWaterEffect();
        createFloatingParticles();

        camera.position.z = 5;
        camera.position.y = 1;

        if (!animationId) animate();

        window.addEventListener('resize', onWindowResize);
    } catch (err) {
        console.error('Error inicializando Three.js para el hero:', err);
    }
}
// Asegúrate de usar esta versión de animate (reemplaza la tuya)
function animate() {
    // Guardar id para posible cancelación/destrucción
    animationId = requestAnimationFrame(animate);

    // Animar agua
    if (water && water.material && water.material.uniforms) {
        water.material.uniforms.time.value += 0.01;
    }

    // Animar partículas
    if (particles && particles.geometry && particles.userData) {
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.userData.velocities;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];

            if (positions[i + 1] > 10) {
                positions[i + 1] = -10;
                positions[i] = (Math.random() - 0.5) * 20;
                positions[i + 2] = (Math.random() - 0.5) * 10;
            }
        }

        particles.geometry.attributes.position.needsUpdate = true;
    }

    // Renderizar la escena
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Añade esta función para manejar el resize
function onWindowResize() {
    const container = document.getElementById('hero-canvas');
    const width = (container && container.clientWidth) ? container.clientWidth : window.innerWidth;
    const height = (container && container.clientHeight) ? container.clientHeight : window.innerHeight;

    if (camera) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    if (renderer) {
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    }
}
// -----------------------------
// Hero lateral: cargar modelo GLTF en canvas pequeño
// -----------------------------
let heroModel = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  animationId: null,
  modelRoot: null,
  loaded: false
};

function setupHeroModel() {
  console.log("🎯 setupHeroModel ejecutándose...");

  const canvas = document.getElementById('hero-model-canvas');
  const container = document.querySelector('.hero-model');
  const loadingLabel = document.getElementById('hero-model-loading');

  if (!canvas || !container) {
    console.warn('⚠️ setupHeroModel: canvas o container no encontrado.');
    return;
  }

  // Escena básica
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 1000);
  camera.position.set(0, 1.6, 3.5);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  // Luz
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(5,10,7); scene.add(dir);

  // Root + placeholder
  const root = new THREE.Group(); scene.add(root);
  const placeholder = new THREE.Mesh(new THREE.BoxGeometry(1,0.6,0.6), new THREE.MeshStandardMaterial({color:0x0ea5ff}));
  placeholder.position.y = 0.15; root.add(placeholder);

  // Cubo azul de referencia (siempre visible)
  const refCube = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), new THREE.MeshStandardMaterial({color:0x0033ff}));
  refCube.position.set(0.8, 0.2, 0);
  scene.add(refCube);

  // Controls
  let controls = null;
  if (typeof THREE?.OrbitControls === 'function' || typeof OrbitControls === 'function') {
    try {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.autoRotate = true; controls.autoRotateSpeed = 0.6; controls.enablePan = false;
    } catch (e) { console.warn('No se pudo crear OrbitControls:', e); }
  } else {
    console.warn('OrbitControls no disponible.');
  }

  // Resize observer
  const ro = new ResizeObserver(() => {
    const w = container.clientWidth || 360, h = container.clientHeight || 360;
    renderer.setSize(w,h,false); camera.aspect = w/h; camera.updateProjectionMatrix();
  });
  ro.observe(container);

  // Loader
  const manager = new THREE.LoadingManager();
  manager.onLoad = () => { console.log('Manager: onLoad'); if (loadingLabel) loadingLabel.style.display='none'; };
  manager.onError = (u) => { console.warn('Manager error', u); if (loadingLabel) { loadingLabel.textContent='Error cargando'; setTimeout(()=>loadingLabel.style.display='none',2000);} };

  const modelUrl = 'models/epsa_model.glb'; // o la URL pública que quieras probar
  console.log('Intentando cargar modelo en:', modelUrl);

  if (typeof THREE?.GLTFLoader === 'function' || typeof GLTFLoader === 'function') {
    const loader = new THREE.GLTFLoader(manager);
    loader.load(modelUrl,
      (gltf) => {
        console.log('Modelo GLTF cargado:', gltf);
        // quitar placeholder
        root.remove(placeholder);
        const model = gltf.scene || gltf.scenes[0];
        root.add(model);

        // Bounding + escala + centrar
        const bbox = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3(); bbox.getSize(size);
        const center = bbox.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const maxSide = Math.max(size.x,size.y,size.z);
        if (maxSide>0) {
          const desired = 1.2; model.scale.setScalar(desired / maxSide);
          console.log('Escalado aplicado:', desired / maxSide);
        }
        // ajustar cámara y controles
        const bbox2 = new THREE.Box3().setFromObject(model);
        const size2 = new THREE.Vector3(); bbox2.getSize(size2);
        const center2 = bbox2.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size2.x,size2.y,size2.z);
        const radius = maxDim*0.5;
        const fov = camera.fov * (Math.PI/180);
        const distance = Math.abs(radius / Math.sin(fov/2)) * 1.15;
        camera.position.set(center2.x, center2.y + radius*0.6, center2.z + distance);
        camera.lookAt(center2);
        if (controls) { controls.target.copy(center2); controls.update(); }
        console.log('Cámara ajustada. distance:', distance);
      },
      (xhr) => {
        if (xhr && xhr.total) {
          console.log('Modelo progreso:', Math.round(xhr.loaded/xhr.total*100) + '%');
          if (loadingLabel) loadingLabel.textContent = `Cargando modelo... ${Math.round(xhr.loaded/xhr.total*100)}%`;
        }
      },
      (err) => {
        console.error('Error cargando GLTF:', err);
        if (loadingLabel) { loadingLabel.textContent='Error cargando modelo'; setTimeout(()=>loadingLabel.style.display='none',2000); }
      }
    );
  } else {
    console.error('GLTFLoader no disponible en runtime.');
    if (loadingLabel) loadingLabel.style.display='none';
  }

  // Render loop
  (function loop() {
    requestAnimationFrame(loop);
    if (controls) controls.update();
    renderer.render(scene, camera);
  })();

  // Exponer para debug
  heroModel.scene = scene; heroModel.camera = camera; heroModel.renderer = renderer;
}

