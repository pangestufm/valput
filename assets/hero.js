// Hero sapaan C3: maskot "Caput" (map dokumen dengan lembar bercentang) dibangun prosedural dengan Three.js.
// File ini sengaja terpisah dari index.html: tests/app.test.cjs menjalankan semua <script> inline di VM tanpa DOM.
// Semua gerak adalah fungsi waktu (pose(clip, t)), jadi frame t yang sama selalu identik dan bisa diuji.

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';

const LINES = {
    hello: 'Halo! Saya Caput, pemandu C3.',
    back: 'Oh, halo kamu kembali lagi? kalau mau pakai aplikasi scroll ke bawah ya',
    poke: 'Hai juga! Aplikasinya ada di bawah, tinggal scroll.'
};

const COLORS = {
    body: 0x1f5fc4, tab: 0x174a9c, skin: 0xf4efe4, legs: 0x22324d, shoes: 0x11161f,
    sheet: 0xffffff, check: 0x1e8c52, line: 0xc9d2df, cheek: 0xf2a7a0, eye: 0x141821, badge: 0xe5a823
};

const CLIPS = { wave: 2.8, back: 3.6, poke: 1.9 };

const hero = document.getElementById('sapa');
if (hero) init();

function init() {
    const stage = hero.querySelector('.hero-stage');
    const bubble = document.getElementById('caputBubble');
    const pauseBtn = document.getElementById('caputPause');
    const pokeBtn = document.getElementById('caputPoke');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const saveData = Boolean(navigator.connection && navigator.connection.saveData);
    const qa = new URLSearchParams(location.search).get('caput');

    let engine = null;
    let paused = false;
    let hasLeft = false;
    let hintTimer = 0;

    hero.classList.add('is-live');

    function say(key) {
        bubble.textContent = LINES[key];
        bubble.classList.remove('is-new');
        void bubble.offsetWidth;
        bubble.classList.add('is-new');
    }

    function showHint(delay) {
        clearTimeout(hintTimer);
        hintTimer = setTimeout(() => hero.classList.add('hint-on'), delay);
    }

    function nudgeHint() {
        hero.classList.remove('hint-nudge');
        void hero.offsetWidth;
        hero.classList.add('hint-on', 'hint-nudge');
    }

    function welcomeBack() {
        say('back');
        nudgeHint();
        if (engine) engine.play('back');
    }

    pokeBtn.addEventListener('click', () => {
        say('poke');
        if (engine) engine.play('poke');
    });

    pauseBtn.addEventListener('click', () => {
        paused = !paused;
        pauseBtn.setAttribute('aria-pressed', String(paused));
        pauseBtn.textContent = paused ? 'Lanjutkan gerak' : 'Jeda gerak';
        hero.classList.toggle('is-paused', paused);
        if (engine) engine.setPaused(paused);
    });

    new IntersectionObserver(([entry]) => {
        // Hero yang hanya menempel di tepi layar dianggap "intersecting" dengan luas 0; render cukup berhenti di situ.
        if (engine) engine.setVisible(entry.intersectionRatio > 0);
        if (entry.intersectionRatio < 0.2) hasLeft = true;
        else if (entry.intersectionRatio >= 0.55 && hasLeft) {
            hasLeft = false;
            welcomeBack();
        }
    }, { threshold: [0, 0.2, 0.55] }).observe(hero);

    const still = reduce.matches || saveData || !webglAvailable();
    if (still && qa === null) {
        hero.classList.add('is-still');
        say('hello');
        showHint(0);
        return;
    }

    say('hello');
    showHint(CLIPS.wave * 1000);
    import(THREE_URL).then(THREE => {
        engine = createEngine(THREE, stage, { qa });
        engine.setPaused(paused);
        engine.play('wave');
        stage.classList.add('has-canvas');
        if (qa !== null) window.__caput = engine;
    }).catch(() => {
        hero.classList.add('is-still');
        showHint(0);
    });
}

function webglAvailable() {
    try {
        const c = document.createElement('canvas');
        return Boolean(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
        return false;
    }
}

const smooth = (a, b, x) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
};
const TAU = Math.PI * 2;

// Pose istirahat. Sudut dalam radian; lengan kanan maskot ada di -X (maskot menghadap +Z).
function idlePose(time) {
    const breath = Math.sin(time * TAU / 3.4);
    return {
        bodyY: 0, bodyScaleY: 1 + breath * 0.012, bodyRotZ: Math.sin(time * TAU / 6.8) * 0.02,
        headTiltZ: Math.sin(time * TAU / 6.8 + 1) * 0.03, headNod: 0,
        rShoulderZ: -0.14, rShoulderX: 0, rElbowZ: -0.12, rElbowX: 0,
        lShoulderZ: 0.14, lShoulderX: 0, lElbowZ: 0.12, lElbowX: 0,
        mouthOpen: 0, blink: (time % 3.8) < 0.13 ? 1 : 0
    };
}

// Klip menulis target pose; bobot w membawa pose dari istirahat ke target lalu kembali.
function clipPose(name, t) {
    const dur = CLIPS[name];
    const w = smooth(0, 0.35, t) * (1 - smooth(dur - 0.5, dur, t));
    const talk = (from, to) => (t > from && t < to ? Math.abs(Math.sin((t - from) * 13)) : 0);
    if (name === 'wave' || name === 'poke') {
        return {
            w,
            pose: {
                rShoulderZ: -2.55, rShoulderX: -0.2,
                rElbowZ: -0.3 + Math.sin(t * TAU * 2.1) * 0.5,
                headTiltZ: -0.12, headNod: Math.sin(t * TAU * 1.05) * 0.05,
                bodyY: Math.abs(Math.sin(t * TAU * 1.05)) * 0.035,
                mouthOpen: talk(0.25, name === 'poke' ? 1.4 : 1.7)
            }
        };
    }
    if (name === 'back') {
        // "Oh!": lompat kecil dengan dua tangan terangkat, lalu kanan melambai dan kiri memanggil.
        const surprise = 1 - smooth(0.6, 0.95, t);
        const hop = t < 0.6 ? Math.sin(Math.PI * t / 0.6) * 0.28 : 0;
        const beckon = smooth(0.7, 1.05, t);
        return {
            w,
            pose: {
                bodyY: hop + Math.abs(Math.sin(t * TAU * 1.2)) * 0.03 * beckon,
                rShoulderZ: -2.55, rShoulderX: -0.2,
                rElbowZ: -0.3 + Math.sin(t * TAU * 2.1) * 0.5 * beckon,
                // Gerak "sini" di bidang layar: lengan kiri terentang ke samping, lengan bawah menekuk ke dalam berulang.
                lShoulderZ: 2.5 * surprise + 1.2 * beckon,
                lShoulderX: -0.35 * beckon,
                lElbowZ: 0.2 * surprise + (1.0 + Math.sin(t * TAU * 1.6) * 0.65) * beckon,
                headTiltZ: 0.14, headNod: -0.08 * surprise,
                mouthOpen: Math.max(surprise * 0.9, talk(1.0, 2.9))
            }
        };
    }
    return { w: 0, pose: {} };
}

function poseAt(clip, clipTime, time) {
    const base = idlePose(time);
    if (!clip) return base;
    const { w, pose } = clipPose(clip, clipTime);
    for (const key of Object.keys(pose)) base[key] += (pose[key] - base[key]) * w;
    return base;
}

function createCaputModel(THREE) {
    const mat = (color, roughness = 0.55) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
    const M = {
        body: mat(COLORS.body, 0.5), tab: mat(COLORS.tab, 0.5), skin: mat(COLORS.skin, 0.6), legs: mat(COLORS.legs),
        shoes: mat(COLORS.shoes, 0.4), sheet: mat(COLORS.sheet, 0.7), check: mat(COLORS.check, 0.45), line: mat(COLORS.line, 0.7),
        cheek: mat(COLORS.cheek, 0.8), eye: mat(COLORS.eye, 0.25), shine: mat(0xffffff, 0.2), badge: mat(COLORS.badge, 0.35)
    };
    const named = (mesh, name) => { mesh.name = name; return mesh; };

    // Kotak membulat: bentuk 2D dikecilkan sebesar bevel supaya ukuran akhir tetap w x h x d.
    function roundedBox(w, h, d, r) {
        const b = r * 0.8, cr = r * 0.5;
        const iw = w - 2 * b, ih = h - 2 * b, x0 = -iw / 2, y0 = -ih / 2;
        const s = new THREE.Shape();
        s.moveTo(x0 + cr, y0);
        s.lineTo(x0 + iw - cr, y0);
        s.quadraticCurveTo(x0 + iw, y0, x0 + iw, y0 + cr);
        s.lineTo(x0 + iw, y0 + ih - cr);
        s.quadraticCurveTo(x0 + iw, y0 + ih, x0 + iw - cr, y0 + ih);
        s.lineTo(x0 + cr, y0 + ih);
        s.quadraticCurveTo(x0, y0 + ih, x0, y0 + ih - cr);
        s.lineTo(x0, y0 + cr);
        s.quadraticCurveTo(x0, y0, x0 + cr, y0);
        const g = new THREE.ExtrudeGeometry(s, {
            depth: Math.max(d - 2 * b, 0.001), bevelEnabled: true, bevelThickness: b,
            bevelSize: b, bevelSegments: 5, curveSegments: 10
        });
        g.center();
        return g;
    }

    const root = new THREE.Group();
    root.name = 'caput';
    const body = new THREE.Group();
    body.name = 'body';
    root.add(body);

    // Kaki dan sepatu.
    const legGeo = new THREE.CapsuleGeometry(0.13, 0.3, 6, 16);
    const shoeGeo = new THREE.SphereGeometry(0.16, 20, 14);
    for (const side of [-1, 1]) {
        const leg = named(new THREE.Mesh(legGeo, M.legs), side < 0 ? 'leg-r' : 'leg-l');
        leg.position.set(0.21 * side, 0.32, 0);
        root.add(leg);
        const shoe = named(new THREE.Mesh(shoeGeo, M.shoes), side < 0 ? 'shoe-r' : 'shoe-l');
        shoe.scale.set(1, 0.55, 1.35);
        shoe.position.set(0.21 * side, 0.08, 0.06);
        root.add(shoe);
    }

    // Badan: map dokumen dengan tab di atas dan lembar kerja bercentang di depan.
    const torso = named(new THREE.Mesh(roundedBox(1.0, 1.0, 0.56, 0.16), M.body), 'torso');
    torso.position.y = 0.92;
    body.add(torso);
    const tab = named(new THREE.Mesh(roundedBox(0.4, 0.16, 0.5, 0.06), M.tab), 'folder-tab');
    tab.position.set(0.26, 1.42, -0.02);
    body.add(tab);
    const backSheet = named(new THREE.Mesh(roundedBox(0.62, 0.42, 0.04, 0.02), M.sheet), 'sheet-back');
    backSheet.position.set(-0.12, 1.43, -0.12);
    backSheet.rotation.z = 0.16;
    body.add(backSheet);

    const plate = new THREE.Group();
    plate.name = 'worksheet';
    plate.position.set(-0.03, 0.88, 0.29);
    plate.rotation.z = -0.04;
    body.add(plate);
    plate.add(named(new THREE.Mesh(roundedBox(0.6, 0.44, 0.04, 0.02), M.sheet), 'worksheet-paper'));
    const lineGeo = new THREE.BoxGeometry(1, 0.035, 0.012);
    [[0.16, 0.36], [0.02, 0.28], [-0.12, 0.32]].forEach(([y, w], i) => {
        const ln = named(new THREE.Mesh(lineGeo, M.line), 'worksheet-line-' + i);
        ln.scale.x = w;
        ln.position.set(0.08 - (0.36 - w) / 2, y, 0.026);
        plate.add(ln);
    });
    const checkPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.23, 0.02, 0.03), new THREE.Vector3(-0.17, -0.06, 0.03),
        new THREE.Vector3(-0.15, -0.08, 0.03), new THREE.Vector3(-0.04, 0.12, 0.03)
    ], false, 'catmullrom', 0.1);
    plate.add(named(new THREE.Mesh(new THREE.TubeGeometry(checkPath, 24, 0.028, 8, false), M.check), 'worksheet-check'));
    const badge = named(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 24), M.badge), 'badge');
    badge.rotation.x = Math.PI / 2;
    badge.position.set(0.33, 1.24, 0.29);
    body.add(badge);

    // Kepala dan wajah. Fitur wajah diletakkan di permukaan elipsoid kepala.
    const head = new THREE.Group();
    head.name = 'head';
    head.position.y = 1.9;
    body.add(head);
    const R = 0.56, SY = 0.9, SZ = 0.92;
    const skull = named(new THREE.Mesh(new THREE.SphereGeometry(R, 40, 28), M.skin), 'skull');
    skull.scale.set(1, SY, SZ);
    head.add(skull);
    const onFace = (x, y, lift = 0) => new THREE.Vector3(x, y, Math.sqrt(Math.max(R * R - x * x - (y / SY) ** 2, 0)) * SZ + lift);

    const eyes = [];
    const eyeGeo = new THREE.CapsuleGeometry(0.052, 0.07, 6, 12);
    const shineGeo = new THREE.SphereGeometry(0.018, 10, 8);
    for (const side of [-1, 1]) {
        const eye = new THREE.Group();
        eye.name = side < 0 ? 'eye-r' : 'eye-l';
        eye.position.copy(onFace(0.19 * side, 0.06, -0.01));
        eye.add(new THREE.Mesh(eyeGeo, M.eye));
        const shine = new THREE.Mesh(shineGeo, M.shine);
        shine.position.set(0.018, 0.04, 0.045);
        eye.add(shine);
        head.add(eye);
        eyes.push(eye);
        const cheek = named(new THREE.Mesh(new THREE.CircleGeometry(0.075, 24), M.cheek), side < 0 ? 'cheek-r' : 'cheek-l');
        cheek.position.copy(onFace(0.32 * side, -0.09, 0.004));
        cheek.lookAt(cheek.position.clone().multiplyScalar(2));
        head.add(cheek);
    }
    const mouth = named(new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.022, 10, 24, Math.PI), M.eye), 'mouth');
    mouth.position.copy(onFace(0, -0.12, 0.0));
    mouth.rotation.z = Math.PI;
    head.add(mouth);
    const tuft = named(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.46, 0.05), new THREE.Vector3(0.04, 0.6, 0.06),
        new THREE.Vector3(0.14, 0.62, 0.05), new THREE.Vector3(0.16, 0.54, 0.04)
    ]), 20, 0.035, 8, false), M.tab), 'tuft');
    head.add(tuft);

    // Lengan: bahu -> siku -> tangan, masing-masing pivot sendiri supaya bisa melambai.
    const upperGeo = new THREE.CapsuleGeometry(0.105, 0.26, 6, 14);
    const foreGeo = new THREE.CapsuleGeometry(0.1, 0.22, 6, 14);
    const handGeo = new THREE.SphereGeometry(0.14, 20, 14);
    const arms = {};
    for (const side of [-1, 1]) {
        const key = side < 0 ? 'r' : 'l';
        const shoulder = new THREE.Group();
        shoulder.name = 'shoulder-' + key;
        shoulder.position.set(0.56 * side, 1.3, 0);
        body.add(shoulder);
        const upper = named(new THREE.Mesh(upperGeo, M.body), 'upper-arm-' + key);
        upper.position.y = -0.2;
        shoulder.add(upper);
        const elbow = new THREE.Group();
        elbow.name = 'elbow-' + key;
        elbow.position.y = -0.4;
        shoulder.add(elbow);
        const fore = named(new THREE.Mesh(foreGeo, M.body), 'forearm-' + key);
        fore.position.y = -0.17;
        elbow.add(fore);
        const hand = named(new THREE.Mesh(handGeo, M.skin), 'hand-' + key);
        hand.position.y = -0.38;
        elbow.add(hand);
        arms[key] = { shoulder, elbow };
    }

    return { root, body, head, eyes, mouth, arms };
}

function blobShadow(THREE) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    grad.addColorStop(0, 'rgba(10,20,40,0.34)');
    grad.addColorStop(1, 'rgba(10,20,40,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.005;
    m.name = 'contact-shadow';
    return m;
}

function createEngine(THREE, stage, { qa }) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: qa !== null });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb6c3d8, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.3);
    key.position.set(-3, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xcfe0ff, 1.2);
    rim.position.set(4, 3, -4);
    scene.add(rim);

    const model = createCaputModel(THREE);
    scene.add(model.root);
    scene.add(blobShadow(THREE));

    const look = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', e => {
        const r = stage.getBoundingClientRect();
        look.tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
        look.ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.3)) / (window.innerHeight / 2)));
    }, { passive: true });

    function resize() {
        const w = stage.clientWidth, h = stage.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Bingkai: seluruh tinggi maskot plus tangan terangkat harus muat, lebar layar sempit menjauhkan kamera.
        const narrow = camera.aspect < 0.75;
        const dist = narrow ? 8.6 / Math.max(camera.aspect, 0.45) * 0.74 : 7.2;
        const aimY = narrow ? 1.62 : 1.32;
        camera.position.set(0, aimY + 0.23, dist);
        camera.lookAt(0, aimY, 0);
        camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    let clip = null, clipStart = 0, visible = true, paused = false, raf = 0, last = performance.now();
    const t0 = performance.now();

    function apply(p) {
        const { body, head, eyes, mouth, arms } = model;
        body.position.y = p.bodyY;
        body.scale.y = p.bodyScaleY;
        body.rotation.z = p.bodyRotZ;
        head.rotation.set(p.headNod - look.y * 0.22, look.x * 0.45, p.headTiltZ);
        arms.r.shoulder.rotation.set(p.rShoulderX, 0, p.rShoulderZ);
        arms.r.elbow.rotation.set(p.rElbowX, 0, p.rElbowZ);
        arms.l.shoulder.rotation.set(p.lShoulderX, 0, p.lShoulderZ);
        arms.l.elbow.rotation.set(p.lElbowX, 0, p.lElbowZ);
        for (const eye of eyes) eye.scale.y = p.blink ? 0.12 : 1;
        mouth.scale.set(1, 1 + p.mouthOpen * 0.9, 1);
    }

    function renderAt(time) {
        const clipTime = clip ? time - clipStart : 0;
        if (clip && clipTime > CLIPS[clip]) clip = null;
        apply(poseAt(clip, clipTime, time));
        renderer.render(scene, camera);
    }

    function frame(now) {
        raf = 0;
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        const k = 1 - Math.exp(-dt * 6);
        look.x += (look.tx - look.x) * k;
        look.y += (look.ty - look.y) * k;
        renderAt((now - t0) / 1000);
        schedule();
    }

    function schedule() {
        if (!raf && visible && !paused && !document.hidden) raf = requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange', () => { last = performance.now(); schedule(); });

    renderAt(0);
    schedule();

    return {
        play(name) {
            clip = name;
            clipStart = (performance.now() - t0) / 1000;
            if (paused) renderAt(clipStart + 0.9);
            schedule();
        },
        setVisible(v) { visible = v; last = performance.now(); schedule(); },
        setPaused(p) { paused = p; last = performance.now(); if (!p) schedule(); },
        // Untuk QA: hentikan loop dan render pose klip pada detik t secara deterministik.
        seek(name, t) {
            paused = true;
            look.x = look.y = 0;
            clip = name || null;
            clipStart = 0;
            apply(poseAt(clip, t, t));
            renderer.render(scene, camera);
            return renderer.domElement.toDataURL('image/png');
        }
    };
}
