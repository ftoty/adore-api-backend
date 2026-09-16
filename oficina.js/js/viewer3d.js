let scene, camera, renderer, currentMesh;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function initThreeViewer() {
    const container = document.getElementById('webgl-container');
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pLight = new THREE.PointLight(0xC5F955, 2, 50);
    pLight.position.set(5, 5, 5);
    scene.add(pLight);

    criarMalha3D('icosahedron');

    container.addEventListener('mousedown', (e) => { isDragging = true; previousMousePosition = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('mouseup', () => { isDragging = false; });
    container.addEventListener('mousemove', (e) => {
        if (!isDragging || !currentMesh) return;
        currentMesh.rotation.y += (e.clientX - previousMousePosition.x) * 0.008;
        currentMesh.rotation.x += (e.clientY - previousMousePosition.y) * 0.008;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    animateViewer();
}

function criarMalha3D(tipo) {
    if (currentMesh) scene.remove(currentMesh);
    let geom = tipo === 'esfera' ? new THREE.SphereGeometry(1.2, 32, 32) : new THREE.IcosahedronGeometry(1.3, 0);
    currentMesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({ color: 0xC5F955, metalness: 0.85, roughness: 0.25 }));
    scene.add(currentMesh);
}

function alternarGeometria3D() {
    criarMalha3D(Math.random() > 0.5 ? 'esfera' : 'icosahedron');
}

function animateViewer() {
    requestAnimationFrame(animateViewer);
    if (currentMesh && !isDragging) currentMesh.rotation.y += 0.004;
    if (renderer && scene && camera) renderer.render(scene, camera);
}