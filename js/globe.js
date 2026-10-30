(function () {
  'use strict';

  var stage = document.getElementById('orbit-stage');
  var canvas = document.getElementById('orbit-canvas');
  if (!stage || !canvas) return;

  function fallback() {
    stage.classList.add('no-webgl');
  }

  function hasWebGL() {
    try {
      var test = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (test.getContext('webgl2') || test.getContext('webgl')));
    } catch (e) {
      return false;
    }
  }

  if (typeof THREE === 'undefined' || !hasWebGL()) {
    fallback();
    return;
  }

  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqCompact = window.matchMedia('(max-width: 767px), (pointer: coarse)');
  var compact = mqCompact.matches;
  var reduce = mqReduce.matches;

  var RING_HEIGHT = 4.4;
  var GLOBE_RADIUS = 1.2;
  var GLOBE_OPACITY = 0.9;
  var GLOBE_GLOW = 0.3;
  var RING_OPACITY = 0.6;
  var ORBIT_OPACITY_A = 0.8;
  var ORBIT_OPACITY_B = 0.5;
  var RING_TILT = 0.2;
  var RING_SPIN = 0.1;
  var PARALLAX = 0.35;
  var SWAY_AMP = 0.42;
  var SWAY_PERIOD = 14;
  var DRAG_SENS = 0.01;
  var FLING_MAX = 6;
  var FRICTION = 2.2;
  var MAX_TILT = 0.1;
  var BOB = 0.05;
  var TWO_PI = Math.PI * 2;

  var swayAmp = 0;
  var ringSpeed = 0;
  var tiltOn = false;

  function refreshSettings() {
    reduce = mqReduce.matches;
    compact = mqCompact.matches;
    swayAmp = reduce ? 0 : SWAY_AMP;
    ringSpeed = reduce ? 0 : RING_SPIN;
    tiltOn = !reduce;
  }

  function listen(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  refreshSettings();
  listen(mqReduce, refreshSettings);
  listen(mqCompact, refreshSettings);

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) {
    fallback();
    return;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.z = 10;

  var loader = new THREE.TextureLoader();
  var SEG = compact ? 48 : 96;

  var globeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: GLOBE_OPACITY,
    depthWrite: false
  });

  globeMat.map = loader.load(
    'assets/images/globe-map.png',
    function (tex) {
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      globeMat.needsUpdate = true;
    },
    undefined,
    function () {
      globeMat.map = null;
      globeMat.color.set(0x7fc8f0);
      globeMat.needsUpdate = true;
    }
  );

  var globeMesh = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS, SEG, SEG / 2),
    globeMat
  );

  var atmo = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.08, 64, 32),
    new THREE.MeshBasicMaterial({
      color: 0x9fe6ff,
      transparent: true,
      opacity: GLOBE_GLOW,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );

  var RING_WIDTH = RING_HEIGHT * (1333 / 1181);
  var ringMat = new THREE.MeshBasicMaterial({
    map: loader.load('assets/images/outer.png'),
    transparent: true,
    opacity: RING_OPACITY,
    alphaTest: 0.01,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  var ringMesh = new THREE.Mesh(new THREE.PlaneGeometry(RING_WIDTH, RING_HEIGHT), ringMat);

  function makeOrbit(radius, opacity) {
    return new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.014, 8, compact ? 120 : 240),
      new THREE.MeshBasicMaterial({
        color: 0xbff0ff,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
  }

  var orbitA = makeOrbit(RING_HEIGHT * 0.42, ORBIT_OPACITY_A);
  orbitA.rotation.x = 1.15;
  var orbitB = makeOrbit(RING_HEIGHT * 0.47, ORBIT_OPACITY_B);
  orbitB.rotation.set(0.4, 0.9, 0);

  function makeHalo() {
    var c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grd.addColorStop(0, 'rgba(180, 235, 255, 0.30)');
    grd.addColorStop(0.45, 'rgba(180, 235, 255, 0.10)');
    grd.addColorStop(1, 'rgba(180, 235, 255, 0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
    return new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
  }

  var halo = makeHalo();
  halo.scale.set(GLOBE_RADIUS * 4.2, GLOBE_RADIUS * 4.2, 1);
  halo.position.z = -0.6;

  var world = new THREE.Group();
  var globeGroup = new THREE.Group();
  var ringGroup = new THREE.Group();
  globeGroup.add(globeMesh, atmo);
  ringGroup.add(ringMesh, orbitA, orbitB);
  world.add(globeGroup, ringGroup);
  scene.add(world, halo);

  function resize() {
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(stage);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  var baseYaw = 0;
  var basePitch = 0;
  var yawVel = 0;
  var pitchVel = 0;
  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  var lastT = 0;
  var sampleYaw = 0;
  var samplePitch = 0;
  var pNX = 0;
  var pNY = 0;
  var tiltTX = 0;
  var tiltTY = 0;
  var tiltX = 0;
  var tiltY = 0;

  function clamp(value, limit) {
    return Math.max(-limit, Math.min(limit, value));
  }

  function updatePointer(e) {
    var r = stage.getBoundingClientRect();
    pNX = (e.clientX - r.left) / r.width - 0.5;
    pNY = (e.clientY - r.top) / r.height - 0.5;
  }

  function onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = performance.now();
    sampleYaw = 0;
    samplePitch = 0;
    yawVel = 0;
    pitchVel = 0;
    stage.classList.add('is-dragging');
    try { stage.setPointerCapture(e.pointerId); } catch (err) { }
  }

  function onMove(e) {
    updatePointer(e);
    var now = performance.now();

    if (dragging) {
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      var dt = Math.max((now - lastT) / 1000, 0.001);
      var stepYaw = dx * DRAG_SENS;
      var stepPitch = dy * DRAG_SENS;

      baseYaw += stepYaw;
      basePitch += stepPitch;

      sampleYaw = sampleYaw * 0.6 + (stepYaw / dt) * 0.4;
      samplePitch = samplePitch * 0.6 + (stepPitch / dt) * 0.4;

      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    } else if (tiltOn && (e.pointerType === 'mouse' || e.pointerType === 'pen')) {
      tiltTY = pNX * MAX_TILT;
      tiltTX = -pNY * MAX_TILT;
    }
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');

    var idleFor = performance.now() - lastT;
    if (reduce || idleFor > 120) {
      yawVel = 0;
      pitchVel = 0;
    } else {
      yawVel = clamp(sampleYaw, FLING_MAX);
      pitchVel = clamp(samplePitch, FLING_MAX);
    }
  }

  function onLeave() {
    tiltTX = 0;
    tiltTY = 0;
  }

  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);
  stage.addEventListener('pointerleave', onLeave);

  var visible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }).observe(stage);
  }

  var t = 0;
  var spin = 0;
  var last = performance.now();

  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.1);
    last = now;

    var panelOpen = document.documentElement.classList.contains('panel-open');

    if (visible && !panelOpen) {
      t += dt;

      if (!dragging) {
        var decay = Math.exp(-FRICTION * dt);
        yawVel *= decay;
        pitchVel *= decay;
        baseYaw += yawVel * dt;
        basePitch += pitchVel * dt;
      }

      baseYaw = baseYaw % TWO_PI;
      basePitch = basePitch % TWO_PI;

      var sway = swayAmp * Math.sin((2 * Math.PI * t) / SWAY_PERIOD);
      var yaw = baseYaw + sway;

      spin -= ringSpeed * dt;

      var k = 1 - Math.exp(-6 * dt);
      tiltX += (tiltTX - tiltX) * k;
      tiltY += (tiltTY - tiltY) * k;

      globeGroup.rotation.set(basePitch, yaw, 0);
      ringGroup.rotation.set(RING_TILT + basePitch * PARALLAX, yaw * PARALLAX, spin);
      world.rotation.set(tiltX, tiltY, 0);
      world.position.y = Math.sin(t * 0.9) * BOB;

      renderer.render(scene, camera);
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();