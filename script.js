// ===== Sticky Navbar =====
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.5)';
  } else {
    header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
  }
});

// ===== Mobile Menu Toggle =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  
  // Change icon
  const icon = hamburger.querySelector('i');
  if (navLinks.classList.contains('active')) {
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-xmark');
  } else {
    icon.classList.remove('fa-xmark');
    icon.classList.add('fa-bars');
  }
});

// Close mobile menu when a link is clicked
const links = document.querySelectorAll('.nav-links li a');
links.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    const icon = hamburger.querySelector('i');
    icon.classList.remove('fa-xmark');
    icon.classList.add('fa-bars');
  });
});

// ===== Active Nav Link =====
const sections = document.querySelectorAll('section, footer');

window.addEventListener('scroll', () => {
  let current = '';
  const scrollY = window.scrollY + 150;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    
    // Check if the section has an ID
    if (section.hasAttribute('id')) {
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
        }
    }
  });

  links.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
  
  // Special case for Home (no id on hero section usually matches top)
  if(window.scrollY < 200) {
      links.forEach(link => link.classList.remove('active'));
      document.querySelector('.nav-links li a[href="#"]').classList.add('active');
  }
});

// ===== Product Modal Logic =====
const modal = document.getElementById('productModal');
const closeModal = document.querySelector('.close-modal');
const viewDetailsBtns = document.querySelectorAll('.view-details-btn');

// Modal Elements to populate
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalFeatures = document.getElementById('modalFeatures');

// ===== 3D Model Setup (Three.js) =====
const modelContainer = document.getElementById('modelContainer');
let scene, camera, renderer, doorGroup, doorSlab, handle, controls;

function init3DModel() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf9f9f9);

  // Camera setup
  camera = new THREE.PerspectiveCamera(45, modelContainer.clientWidth / modelContainer.clientHeight, 0.1, 100);
  camera.position.set(-6, 2, 10); // Angled view initially

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  modelContainer.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  scene.add(dirLight);
  
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-5, 0, -5);
  scene.add(fillLight);

  // Door Group
  doorGroup = new THREE.Group();

  // 1. Door Slab
  const slabGeometry = new THREE.BoxGeometry(3.6, 7.5, 0.25);
  const defaultWood = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 });
  doorSlab = new THREE.Mesh(slabGeometry, [
    defaultWood, defaultWood, defaultWood, defaultWood, defaultWood, defaultWood
  ]);
  doorSlab.castShadow = true;
  doorSlab.receiveShadow = true;
  doorGroup.add(doorSlab);

  // 2. Door Handle (Metallic Lever)
  handle = new THREE.Group();
  
  // Backplate
  const plateGeo = new THREE.BoxGeometry(0.2, 1.0, 0.05);
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 });
  const plate = new THREE.Mesh(plateGeo, metalMat);
  plate.position.set(0, 0, 0.15); // On front face
  handle.add(plate);

  const plateBack = new THREE.Mesh(plateGeo, metalMat);
  plateBack.position.set(0, 0, -0.15); // On back face
  handle.add(plateBack);

  // Lever Handle (Front)
  const leverGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 16);
  const lever = new THREE.Mesh(leverGeo, metalMat);
  lever.rotation.z = Math.PI / 2;
  lever.position.set(0.2, 0, 0.22);
  handle.add(lever);
  
  // Lever Base (Front)
  const leverBaseGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16);
  const leverBase = new THREE.Mesh(leverBaseGeo, metalMat);
  leverBase.rotation.x = Math.PI / 2;
  leverBase.position.set(0, 0, 0.18);
  handle.add(leverBase);

  // Position handle group on the right side of the door
  handle.position.set(1.4, -0.2, 0);
  doorGroup.add(handle);

  scene.add(doorGroup);

  // Controls for 360 view
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 20;
  controls.target.set(0, 0, 0);

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    if (modelContainer.clientWidth > 0) {
      camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
    }
  });
}

// Initialize the 3D viewer
init3DModel();

// Texture Loader
const textureLoader = new THREE.TextureLoader();

viewDetailsBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const card = btn.closest('.service-card');
    
    // Get data from attributes
    const title = card.getAttribute('data-title');
    const desc = card.getAttribute('data-desc');
    const image = card.getAttribute('data-image');
    const featuresString = card.getAttribute('data-features');
    
    // Populate Modal Details
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    
    // Load Texture and Update 3D Model
    textureLoader.load(image, (texture) => {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      
      const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x2a1e12, roughness: 0.9 }); // Dark edge
      const faceMaterial = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5 });
      
      // Update door slab materials [right, left, top, bottom, front, back]
      doorSlab.material = [
        edgeMaterial, // Right
        edgeMaterial, // Left
        edgeMaterial, // Top
        edgeMaterial, // Bottom
        faceMaterial, // Front
        faceMaterial  // Back
      ];
      
      // Reset camera to show off the 3D model at a slight angle
      camera.position.set(-5, 2, 8);
      controls.target.set(0, 0, 0);
      controls.update();
    });
    
    // Populate Features List
    modalFeatures.innerHTML = '';
    if (featuresString) {
      const features = featuresString.split(',');
      features.forEach(feature => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fa-solid fa-check"></i> ${feature.trim()}`;
        modalFeatures.appendChild(li);
      });
    }
    
    // Show Modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Ensure renderer resizes properly when modal opens
    setTimeout(() => {
      camera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
    }, 50);
  });
});

// Close Modal
closeModal.addEventListener('click', () => {
  modal.classList.remove('show');
  document.body.style.overflow = 'auto'; // Restore scrolling
});

// Close Modal on outside click
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
});

// ===== Contact Form Submission =====
const contactForm = document.getElementById('contactForm');
const successPopup = document.getElementById('successPopup');
const closePopupBtn = document.querySelector('.close-popup-btn');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent normal form submission behavior
    
    // Get form values
    const name = contactForm.querySelector('[name="Name"]').value;
    const phone = contactForm.querySelector('[name="Phone"]').value;
    const email = contactForm.querySelector('[name="Email"]').value;
    const message = contactForm.querySelector('[name="Message"]').value;
    
    // Change button text to show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Send email silently using FormSubmit AJAX
    fetch("https://formsubmit.co/ajax/Shahdoors9@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            Name: name,
            Phone: phone,
            Email: email,
            Message: message,
            _subject: `New Inquiry from ${name} (Shah Doors)`
        })
    })
    .then(response => response.json())
    .then(data => {
        // Show beautiful success popup
        successPopup.classList.add('show');
        
        // Reset the form
        contactForm.reset();
    })
    .catch(error => {
        console.error("Error sending message:", error);
        alert("There was an error sending your message. Please try again later.");
    })
    .finally(() => {
        // Restore button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    });
  });
}

if (closePopupBtn) {
  closePopupBtn.addEventListener('click', () => {
    successPopup.classList.remove('show');
  });
}
