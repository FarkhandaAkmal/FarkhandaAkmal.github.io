/*
 * Site-wide 3D background: a dotted Earth with orbiting satellites.
 *
 * Needs Three.js (loaded from a CDN before this file). If Three.js or WebGL
 * is not available the page falls back to a still CSS backdrop (.no-webgl).
 *
 * The scene is decoration only: it sits behind the page, ignores pointer
 * events for hit-testing, and carries no content.
 */
(() => {
  const root = document.documentElement;
  const THREE = window.THREE;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function fallback() {
    root.classList.add("no-webgl");
  }

  if (!THREE) {
    fallback();
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "space-canvas";
  canvas.setAttribute("aria-hidden", "true");

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (error) {
    fallback();
    return;
  }
  document.body.prepend(canvas);
  root.classList.add("has-webgl");

  const CYAN = 0x00ffff;
  const EMERALD = 0x00ff66;
  const SPACE = 0x0b0f19;
  const DEG = Math.PI / 180;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  camera.position.set(0, 0, 6.4);

  // Everything hangs off the rig, which leans toward the pointer.
  const rig = new THREE.Group();
  scene.add(rig);

  /* ------------------------------------------------------------ helpers */

  function latLonToVector(lat, lon, radius) {
    const phi = lat * DEG;
    const theta = lon * DEG;
    return new THREE.Vector3(
      radius * Math.cos(phi) * Math.sin(theta),
      radius * Math.sin(phi),
      radius * Math.cos(phi) * Math.cos(theta),
    );
  }

  // Soft round sprite used for every point in the scene.
  function makeDotTexture() {
    const size = 64;
    const dot = document.createElement("canvas");
    dot.width = size;
    dot.height = size;
    const context = dot.getContext("2d");
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.85)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(dot);
  }
  const dotTexture = makeDotTexture();

  /* -------------------------------------------------------------- stars */

  {
    const count = 900;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const u = Math.random() * 2 - 1;
      const t = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 40;
      const s = Math.sqrt(1 - u * u);
      positions[i * 3] = r * s * Math.cos(t);
      positions[i * 3 + 1] = r * u;
      positions[i * 3 + 2] = r * s * Math.sin(t);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({
      map: dotTexture, color: 0xbfe9ff, size: 0.28, transparent: true, opacity: 0.55, depthWrite: false,
    }));
    scene.add(stars);
  }

  /* -------------------------------------------------------------- globe */

  const globeAnchor = new THREE.Group(); // position and size on screen
  const globeTilt = new THREE.Group(); // fixed axial tilt
  const globe = new THREE.Group(); // spins
  rig.add(globeAnchor);
  globeAnchor.add(globeTilt);
  globeTilt.add(globe);
  globeTilt.rotation.set(0.32, 0, -0.2);

  // Land mask: 180 x 90 cells of 2 degrees, one bit per cell, north to south.
  const LAND = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf+AP/gAAAAAAAAAAAAAAAAAAAAAAA//////7AAAAAggABAAAAAAAAAAAACN//////wAB/gAAAAB8AAAAAAAAAAASSz4f///wAAYAAAEAAGwAAAAAAAAAAPivwAf//4AAAAADgAP/4AHAAAAAAAD+338AP//wAAAAAEBD///+DgAAgBwACXw3/wP//gAAAQAED///////wAgf////xdjwH//AAAH/gC//////////8P/////9h+H/gAAAf/7///////////s//////9l4D8AeAA+/f///////////CP/////xgcB4AIAD5/////////////Af/////gHgAwAAAP5///////////PwAHgP///gH0AAAAAH4//////////yMAACQD///8H/AAAAGC5/////////8A8AAAABf///v/gAAAODL/////////wA4AAAAAf///v/wAAAbn//////////+AwAAAAAP/////wAAADf//////////9AgAAAAAD////+YAAAD///////////9AAAAAAAD////8AAAAB///////////5AAAAAAAD////+AAAAB/f6f///////wAAAAAAAD////gAAAAP5vwP///////hAAAAAAAD////AAAAAfib3///////+CAAAAAAAD///+AAAAAfCLf//////+MCAAAAAAAB///8AAAAAOeBP///////mOAAAAAAAB///8AAAAAH+AA///////E8AAAAAAAAf//wAAAAAP/gB///////hgAAAAAAAAP//wAAAAAf/7////////gAAAAAAAAAH/gwAAAAAf////f/////gAAAAAAAAAH/AQAAAAB///+/n/////AAAAAAAAAAC+AAAAAAD/////k/////AAAAAAAAAAAeAYAAAAD////f/D///8gAAAAAAAAAAeEEAAAAD////v/B/z/QAAAAAAAAAAAPMBwAAAD////v+A/B+gAAAAAAAAAAAD8AAAAAD////34A+B/AgAAAAAAAAAAAPAAAAAH////3wAcAfggAAAAAAAAAAAHAAAAAH////+AAcAfgQAAAAAAAAAAABDYAAAD////9wAMATAYAAAAAAAAAAAA3/AAAB/////gAKAQAIAAAAAAAAAAAAH/gAAA/////gACAICIAAAAAAAAAAAAH/8AAAfH///AAAAsHAAAAAAAAAAAAAH/+AAAAB//+AAAAUOAAAAAAAAAAAAAP/+AAAAB//8AAAAc+SAAAAAAAAAAAAP//gAAAD//4AAAAMekgAAAAAAAAAAAP//8AAAB//wAAAAGdgfAAAAAAAAAAAf///AAAA//wAAAACAAPkAAAAAAAAAAP///gAAA//wAAAABwAHwAAAAAAAAAAH///AAAA//wAAAAADQCQAAAAAAAAAAH///AAAAf/wAAAAAAAAAAAAAAAAAAAD//+AAAA//wgAAAAABxAAAAAAAAAAAD//+AAAA//4gAAAAAPxgAAAAAAAAAAA//+AAAA//zgAAAAAf/gAAAAAAAAAAAf/8AAAA//DgAAAAAf/wAAAAAAAAAAAf/8AAAAf/DAAAAAD//4CAAAAAAAAAAf/4AAAAf/DAAAAAH//4AAAAAAAAAAA//AAAAAf+CAAAAAH//8AAAAAAAAAAA//AAAAAf+AAAAAAH//+AAAAAAAAAAA/+AAAAAP8AAAAAAH//+AAAAAAAAAAA/+AAAAAH4AAAAAAD//+AAAAAAAAAAA/8AAAAAHwAAAAAAD4f8AAAAAAAAAAA/4AAAAAAAAAAAAACAH4AAAAAAAAAAB/wAAAAAAAAAAAAAAAD4AEAAAAAAAAB/gAAAAAAAAAAAAAAAAAAGAAAAAAAAB+AAAAAAAAAAAAAAAAAQAMAAAAAAAAB8AAAAAAAAAAAAAAAAAQAYAAAAAAAAD4AAAAAAAAAAAAAAAAAAAwAAAAAAAAB4AAAAAAAAAAAAAAAAAAAgAAAAAAAADwAAAAAAAAAAAAAAAAAAAAAAAAAAAABwgAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
  const maskBytes = Uint8Array.from(atob(LAND), (character) => character.charCodeAt(0));
  function isLand(lat, lon) {
    const row = Math.min(89, Math.max(0, Math.floor((90 - lat) / 2)));
    const column = Math.min(179, Math.max(0, Math.floor((lon + 180) / 2)));
    const index = row * 180 + column;
    return (maskBytes[index >> 3] >> (7 - (index & 7))) & 1;
  }

  // Solid core, so the far side of the planet does not show through.
  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(0.992, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x0a111e }),
  ));

  // Land, drawn as evenly spaced dots.
  {
    const positions = [];
    const colours = [];
    const cyan = new THREE.Color(CYAN);
    const emerald = new THREE.Color(EMERALD);
    for (let lat = -58; lat <= 84; lat += 1.6) {
      const ring = Math.max(1, Math.round(225 * Math.cos(lat * DEG)));
      for (let i = 0; i < ring; i += 1) {
        const lon = -180 + (360 * (i + 0.5)) / ring;
        if (!isLand(lat, lon)) {
          continue;
        }
        const point = latLonToVector(lat, lon, 1);
        positions.push(point.x, point.y, point.z);
        const colour = cyan.clone().lerp(emerald, Math.random() < 0.14 ? 0.85 : 0.08);
        colours.push(colour.r, colour.g, colour.b);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
    globe.add(new THREE.Points(geometry, new THREE.PointsMaterial({
      map: dotTexture, vertexColors: true, size: 0.04, transparent: true, opacity: 1, depthWrite: false,
    })));
  }

  // Graticule: parallels and meridians every 20 degrees.
  {
    const positions = [];
    const push = (a, b) => positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lon = -180; lon < 180; lon += 4) {
        push(latLonToVector(lat, lon, 1.002), latLonToVector(lat, lon + 4, 1.002));
      }
    }
    for (let lon = -180; lon < 180; lon += 20) {
      for (let lat = -88; lat < 88; lat += 4) {
        push(latLonToVector(lat, lon, 1.002), latLonToVector(lat + 4, lon, 1.002));
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    globe.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
      color: CYAN, transparent: true, opacity: 0.08, depthWrite: false,
    })));
  }

  // Atmosphere: a glow that is strongest at the limb.
  globeTilt.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 48, 48),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      uniforms: {
        cyan: { value: new THREE.Color(CYAN) },
        emerald: { value: new THREE.Color(EMERALD) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 cyan;
        uniform vec3 emerald;
        varying vec3 vNormal;
        void main() {
          // 1 at the planet's edge, fading to 0 at the outside of the shell.
          float rim = clamp(-dot(vNormal, vec3(0.0, 0.0, 1.0)) / 0.553, 0.0, 1.0);
          float glow = pow(rim, 2.2) * 0.7;
          vec3 colour = mix(cyan, emerald, smoothstep(-0.6, 0.9, vNormal.y));
          gl_FragColor = vec4(colour, 1.0) * glow;
        }`,
    }),
  ));

  // Lahore: a ground station with a repeating radar ping.
  const station = new THREE.Group();
  const stationPosition = latLonToVector(31.5204, 74.3587, 1.004);
  station.position.copy(stationPosition);
  // Lay the marker flat on the surface: its face points straight up.
  station.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), stationPosition.clone().normalize());
  globe.add(station);
  station.add(new THREE.Mesh(
    new THREE.CircleGeometry(0.014, 20),
    new THREE.MeshBasicMaterial({ color: EMERALD }),
  ));
  const pings = [0, 1].map((index) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1, 48),
      new THREE.MeshBasicMaterial({ color: EMERALD, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    );
    ring.userData.offset = index * 0.5;
    station.add(ring);
    return ring;
  });

  // Start with South Asia facing the viewer.
  globe.rotation.y = -74 * DEG;

  /* --------------------------------------------------------- satellites */

  const orbits = [
    { radius: 1.34, inclination: 98, node: 20, speed: 0.34, colour: EMERALD, phase: 0.4 },
    { radius: 1.5, inclination: 52, node: 140, speed: 0.26, colour: CYAN, phase: 2.1 },
    { radius: 1.68, inclination: 70, node: 250, speed: -0.2, colour: CYAN, phase: 4.0 },
    { radius: 1.86, inclination: 28, node: 80, speed: 0.15, colour: EMERALD, phase: 1.2 },
    { radius: 2.08, inclination: 110, node: 310, speed: -0.12, colour: CYAN, phase: 5.3 },
  ];
  const TRAIL = 26;
  const satellitePositions = new Float32Array(orbits.length * 3);
  const satelliteColours = new Float32Array(orbits.length * 3);
  const trailPositions = new Float32Array(orbits.length * TRAIL * 3);
  const trailColours = new Float32Array(orbits.length * TRAIL * 3);
  const beamPositions = new Float32Array(orbits.length * 6);
  const beamColours = new Float32Array(orbits.length * 6);

  orbits.forEach((orbit, index) => {
    orbit.frame = new THREE.Group();
    orbit.frame.rotation.set(orbit.inclination * DEG, orbit.node * DEG, 0, "YXZ");
    globeTilt.add(orbit.frame);

    const points = [];
    for (let step = 0; step <= 160; step += 1) {
      const angle = (step / 160) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * orbit.radius, 0, Math.sin(angle) * orbit.radius));
    }
    orbit.frame.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: orbit.colour, transparent: true, opacity: 0.13, depthWrite: false }),
    ));
    orbit.frame.updateMatrixWorld(true);

    const colour = new THREE.Color(orbit.colour);
    satelliteColours.set([colour.r, colour.g, colour.b], index * 3);
    for (let step = 0; step < TRAIL; step += 1) {
      const fade = (1 - step / TRAIL) ** 2 * 0.8;
      trailColours.set([colour.r * fade, colour.g * fade, colour.b * fade], (index * TRAIL + step) * 3);
    }
    beamColours.set([colour.r * 0.55, colour.g * 0.55, colour.b * 0.55, 0, 0, 0], index * 6);
  });

  function pointsLayer(positions, colours, size) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colours, 3));
    return new THREE.Points(geometry, new THREE.PointsMaterial({
      map: dotTexture, vertexColors: true, size, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
  }
  const satelliteLayer = pointsLayer(satellitePositions, satelliteColours, 0.17);
  const trailLayer = pointsLayer(trailPositions, trailColours, 0.07);
  globeTilt.add(satelliteLayer, trailLayer);

  // Nadir beam from each satellite to the ground beneath it.
  const beamGeometry = new THREE.BufferGeometry();
  beamGeometry.setAttribute("position", new THREE.BufferAttribute(beamPositions, 3));
  beamGeometry.setAttribute("color", new THREE.BufferAttribute(beamColours, 3));
  const beamLayer = new THREE.LineSegments(beamGeometry, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  globeTilt.add(beamLayer);

  const scratch = new THREE.Vector3();
  function placeOnOrbit(orbit, angle, target, offset) {
    scratch.set(Math.cos(angle) * orbit.radius, 0, Math.sin(angle) * orbit.radius).applyEuler(orbit.frame.rotation);
    target[offset] = scratch.x;
    target[offset + 1] = scratch.y;
    target[offset + 2] = scratch.z;
  }

  function updateSatellites(time) {
    orbits.forEach((orbit, index) => {
      const angle = orbit.phase + time * orbit.speed;
      placeOnOrbit(orbit, angle, satellitePositions, index * 3);
      for (let step = 0; step < TRAIL; step += 1) {
        placeOnOrbit(orbit, angle - Math.sign(orbit.speed) * step * 0.022, trailPositions, (index * TRAIL + step) * 3);
      }
      const x = satellitePositions[index * 3];
      const y = satellitePositions[index * 3 + 1];
      const z = satellitePositions[index * 3 + 2];
      const length = Math.hypot(x, y, z);
      beamPositions.set([x, y, z, x / length, y / length, z / length], index * 6);
    });
    satelliteLayer.geometry.attributes.position.needsUpdate = true;
    trailLayer.geometry.attributes.position.needsUpdate = true;
    beamGeometry.attributes.position.needsUpdate = true;
  }

  /* -------------------------------------------------------------- layout */

  let width = 1;
  let height = 1;
  let baseOpacity = 1;

  function layout() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, width < 700 ? 1.25 : 1.5);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Size of the view at the planet's distance, for turning pixels into scene units.
    const halfHeight = Math.tan((camera.fov * DEG) / 2) * camera.position.z;
    const halfWidth = halfHeight * camera.aspect;
    const toScene = (x, y) => [((x / width) * 2 - 1) * halfWidth, -((y / height) * 2 - 1) * halfHeight];

    // Wide screens: on the home page the planet sits inside the framed drawing
    // beside the introduction; on other pages it sits to the right of the heading.
    // Narrow screens: it rises behind the top of the page, smaller.
    const aspect = width / height;
    const frame = document.querySelector(".hero-art");
    const frameBox = frame?.getBoundingClientRect();
    const frameTop = frameBox ? frameBox.top + window.scrollY : 0;
    if (aspect >= 1.15 && frameBox && frameBox.width > 0 && frameTop < height * 0.6) {
      const [x, y] = toScene(frameBox.left + frameBox.width / 2, frameTop + frameBox.height / 2);
      const radius = (Math.min(frameBox.width, frameBox.height) * 0.56 / height) * 2 * halfHeight;
      globeAnchor.position.set(x, y, 0);
      globeAnchor.scale.setScalar(radius);
    } else if (aspect >= 1.15) {
      const [x, y] = toScene(width * 0.76, height * 0.46);
      globeAnchor.position.set(x, y, 0);
      globeAnchor.scale.setScalar(1.28);
    } else if (aspect >= 0.75) {
      const [x, y] = toScene(width * 0.74, height * 0.34);
      globeAnchor.position.set(x, y, 0);
      globeAnchor.scale.setScalar(1.05);
    } else {
      // Phones: small, high and dim, so it never competes with the text.
      const [x, y] = toScene(width * 0.8, height * 0.17);
      globeAnchor.position.set(x, y, 0);
      globeAnchor.scale.setScalar(0.74);
    }
    baseOpacity = aspect >= 0.75 ? 1 : 0.62;
  }

  /* ---------------------------------------------------------- interaction */

  const pointer = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  let scrollEased = 0;

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      return;
    }
    pointer.x = (event.clientX / width) * 2 - 1;
    pointer.y = (event.clientY / height) * 2 - 1;
  }, { passive: true });

  /* --------------------------------------------------------------- render */

  const clock = new THREE.Clock();
  let elapsed = 0;
  let frame = 0;
  let running = false;
  let lastRender = 0;

  function render(delta) {
    elapsed += delta;

    // Slow spin, plus a lean and a shift toward the pointer.
    globe.rotation.y += delta * 0.045;
    eased.x += (pointer.x - eased.x) * Math.min(1, delta * 2.4);
    eased.y += (pointer.y - eased.y) * Math.min(1, delta * 2.4);
    rig.rotation.y = eased.x * 0.24;
    rig.rotation.x = eased.y * 0.14;
    camera.position.x = -eased.x * 0.32;
    camera.position.y = eased.y * 0.2;
    camera.lookAt(0, 0, 0);

    // The planet drifts upward and dims as the page scrolls.
    const scroll = Math.min(window.scrollY / Math.max(1, height), 3);
    scrollEased += (scroll - scrollEased) * Math.min(1, delta * 4);
    rig.position.y = scrollEased * 0.42;
    canvas.style.opacity = String(baseOpacity * Math.max(0.5, 1 - scrollEased * 0.38));

    updateSatellites(elapsed);

    pings.forEach((ring) => {
      const phase = (elapsed * 0.45 + ring.userData.offset) % 1;
      ring.scale.setScalar(0.02 + phase * 0.17);
      ring.material.opacity = (1 - phase) * 0.75;
    });

    renderer.render(scene, camera);
  }

  function tick(now) {
    frame = window.requestAnimationFrame(tick);
    // Full rate near the top of the page, half rate once content covers it.
    const interval = window.scrollY > height * 0.7 ? 1000 / 30 : 0;
    if (now - lastRender < interval) {
      return;
    }
    lastRender = now;
    render(Math.min(clock.getDelta(), 0.05));
  }

  function setRunning(shouldRun) {
    const next = shouldRun && !reducedMotion.matches;
    if (next === running) {
      return;
    }
    running = next;
    window.cancelAnimationFrame(frame);
    if (running) {
      clock.getDelta();
      frame = window.requestAnimationFrame(tick);
    }
  }

  function refresh() {
    setRunning(!document.hidden);
    if (!running) {
      render(0);
    }
  }

  window.addEventListener("resize", () => {
    layout();
    if (!running) {
      render(0);
    }
  });
  document.addEventListener("visibilitychange", refresh);
  reducedMotion.addEventListener?.("change", refresh);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    setRunning(false);
    root.classList.remove("has-webgl");
    fallback();
  });

  layout();
  updateSatellites(0);
  render(0);
  refresh();
})();
