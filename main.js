// === LÓGICA PARA RECORRIDO.HTML (modales y botones) ===
document.addEventListener('DOMContentLoaded', () => {
  const botones = document.querySelectorAll('.botones button');
  const overlay = document.getElementById('overlay');
  const modales = document.querySelectorAll('.modal');
  const cerrarBtns = document.querySelectorAll('.cerrar');

  if (botones.length > 0) {
    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        modales.forEach(m => m.classList.remove('active'));
        document.getElementById('modal-' + modalId).classList.add('active');
        overlay.classList.add('active');
      });
    });

    cerrarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modales.forEach(m => m.classList.remove('active'));
        overlay.classList.remove('active');
      });
    });

    overlay.addEventListener('click', () => {
      modales.forEach(m => m.classList.remove('active'));
      overlay.classList.remove('active');
    });

    // === THREE.JS PARA MODALES ===
    function crearEscena3D(containerId, tipo) {
      const contenedor = document.getElementById(containerId);
      if (!contenedor) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, contenedor.clientWidth / contenedor.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(contenedor.clientWidth, contenedor.clientHeight);
      contenedor.appendChild(renderer.domElement);

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(5, 5, 5);
      scene.add(light);

      let mesh;
      if (tipo === 'historia') {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        mesh = new THREE.Mesh(geo, mat);
      } else {
        const geo = new THREE.ConeGeometry(0.7, 1.5, 32);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        mesh = new THREE.Mesh(geo, mat);
      }

      scene.add(mesh);
      camera.position.z = 3;

      function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
      }
      animate();
    }

    crearEscena3D('three-historia', 'historia');
    crearEscena3D('three-mision', 'mision');
  }

  // === FONDO DE PARTÍCULAS PARA INDEX.HTML ===
  const container = document.getElementById('threejs-container');
  if (container && !document.querySelector('.modal')) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    function animate() {
      requestAnimationFrame(animate);
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
    });
  }
});

