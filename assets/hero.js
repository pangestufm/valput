// Hero sapaan C3: ayam putih berjambul merah (SVG inline di index.html) digerakkan dengan Web Animations API.
// File ini sengaja terpisah dari index.html: tests/app.test.cjs menjalankan semua <script> inline di VM tanpa DOM.
// Gerak idle (napas, kedip, jambul) ada di CSS; klip sekali jalan (muncul, melambai, bicara, memanggil) ada di sini.

const LINES = {
    hello: 'Hai',
    back: 'Oh, halo kamu kembali lagi? kalau mau pakai aplikasi scroll ke bawah ya',
    poke: 'Hai juga! Aplikasinya ada di bawah, tinggal scroll.'
};

const WING_REST = 92;
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

const hero = document.getElementById('sapa');
if (hero) {
    startAtLanding();
    init();
}

// Setiap kali web dibuka, termasuk muat ulang atau tautan berakhiran #aplikasi, tampilan mulai dari landing page;
// pengguna sendiri yang scroll ke validator. Tautan #aplikasi di dalam halaman tetap berfungsi seperti biasa.
function startAtLanding() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash === '#aplikasi') history.replaceState(null, '', location.pathname + location.search);
    let userMoved = false;
    const markMoved = () => { userMoved = true; };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(type => window.addEventListener(type, markMoved, { once: true, passive: true }));
    const toTop = () => {
        if (userMoved) return;
        const root = document.documentElement;
        const behavior = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        root.style.scrollBehavior = behavior;
    };
    toTop();
    // Browser bisa melompat ke #aplikasi atau memulihkan posisi lama setelah skrip ini jalan; ulangi saat load
    // kecuali pengguna sudah mulai menggulir sendiri.
    window.addEventListener('load', toTop, { once: true });
}

function init() {
    const q = selector => hero.querySelector(selector);
    const bubble = document.getElementById('caputBubble');
    const pauseBtn = document.getElementById('caputPause');
    const pokeBtn = document.getElementById('caputPoke');
    const ck = { root: q('.ck-root'), wing: q('.ck-wing'), wingL: q('.ck-wing-l'), jaw: q('.ck-jaw'), mouth: q('.ck-mouth'), comb: q('.ck-comb'), eyes: q('.ck-eyes') };
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !ck.root.animate;

    let paused = false;
    let hasLeft = false;
    let hintTimer = 0;
    let running = [];
    let busyUntil = 0;
    let inView = true;
    let idleTimer = 0;
    let lastIdle = '';

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

    // Satu klip = beberapa animasi bagian tubuh yang dimulai bersamaan; klip baru membatalkan klip lama.
    function play(tracks) {
        running.forEach(a => a.cancel());
        running = tracks.map(([el, frames, options]) => el.animate(frames, { easing: 'ease-in-out', ...options }));
        if (paused) running.forEach(a => a.pause());
        busyUntil = performance.now() + Math.max(0, ...tracks.map(([, , o]) => (o.delay || 0) + o.duration));
    }

    const rot = deg => ({ transform: `rotate(${deg}deg)` });
    const lift = y => ({ transform: `translateY(${y}%)` });
    // Sayap kiri adalah cermin sayap kanan: sudut rotasinya dibalik tanda.
    const mirror = frames => frames.map(f => ({ ...f, transform: f.transform.replace(/rotate\((-?[\d.]+)deg\)/, (m, d) => `rotate(${-d}deg)`) }));
    const flutter = () => mirror([rot(WING_REST), { ...rot(70), offset: 0.3 }, { ...rot(WING_REST), offset: 0.5 }, { ...rot(74), offset: 0.7 }, rot(WING_REST)]);

    // Sayap naik dari posisi istirahat, mengayun n kali, lalu turun lagi.
    function waveFrames(n) {
        const frames = [rot(WING_REST), { ...rot(-8), offset: 0.16 }];
        for (let i = 0; i < n; i++) {
            frames.push({ ...rot(12), offset: 0.16 + (i + 0.5) * (0.66 / n) }, { ...rot(-10), offset: 0.16 + (i + 1) * (0.66 / n) });
        }
        frames.push(rot(WING_REST));
        return frames;
    }

    // Paruh bawah turun-naik seperti bicara.
    function talkTracks(times, duration, delay = 0) {
        const jaw = [], mouth = [];
        for (let i = 0; i <= times * 2; i++) {
            const open = i % 2 === 1;
            jaw.push({ transform: `translateY(${open ? 10 : 0}px)` });
            mouth.push({ transform: `scaleY(${open ? 1 : 0.15})` });
        }
        return [[ck.jaw, jaw, { duration, delay }], [ck.mouth, mouth, { duration, delay }]];
    }

    const clips = {
        hello: () => play([
            [ck.root, [lift(105), { ...lift(-4), offset: 0.72 }, lift(0)], { duration: 900, easing: EASE_OUT }],
            [ck.wing, waveFrames(3), { duration: 2100, delay: 650 }],
            [ck.wingL, flutter(), { duration: 2100, delay: 650 }],
            ...talkTracks(2, 700, 750)
        ]),
        // Kembali ke atas: menunduk kaget, melompat, melambai, lalu sayap menunjuk ke petunjuk scroll di kanan bawah.
        back: () => play([
            [ck.root, [lift(0), { ...lift(10), offset: 0.08 }, { ...lift(-7), offset: 0.18 }, { ...lift(0), offset: 0.28 }, lift(0)], { duration: 3600 }],
            [ck.comb, [rot(0), { ...rot(-12), offset: 0.12 }, { ...rot(10), offset: 0.2 }, { ...rot(-4), offset: 0.28 }, rot(0)], { duration: 3600 }],
            [ck.wing, [
                rot(WING_REST), { ...rot(-10), offset: 0.12 }, { ...rot(12), offset: 0.2 }, { ...rot(-10), offset: 0.28 },
                { ...rot(14), offset: 0.36 }, { ...rot(34), offset: 0.46 }, { ...rot(18), offset: 0.54 }, { ...rot(34), offset: 0.62 },
                { ...rot(18), offset: 0.7 }, { ...rot(34), offset: 0.78 }, { ...rot(20), offset: 0.86 }, rot(WING_REST)
            ], { duration: 3600 }],
            // Kaget: dua sayap terangkat, lalu sayap kiri turun sementara sayap kanan melambai dan menunjuk.
            [ck.wingL, mirror([rot(WING_REST), { ...rot(4), offset: 0.1 }, { ...rot(-8), offset: 0.2 }, { ...rot(WING_REST), offset: 0.34 }, rot(WING_REST)]), { duration: 3600 }],
            ...talkTracks(5, 2200, 200)
        ]),
        poke: () => play([
            [ck.root, [lift(0), { ...lift(-6), offset: 0.3 }, lift(0)], { duration: 600, easing: EASE_OUT }],
            [ck.wing, waveFrames(2), { duration: 1500 }],
            [ck.wingL, flutter(), { duration: 1500 }],
            ...talkTracks(3, 1100, 100)
        ])
    };

    // Aksi idle: gerak pendek tanpa bicara, dipilih acak selama pengguna masih di hero.
    const look = (x, y) => ({ transform: `translate(${x}px, ${y}px)` });
    const squash = y => ({ transform: `scaleY(${y})` });
    const dip = { transform: 'translateY(5%) rotate(4deg)' };
    const flap = () => [rot(WING_REST), { ...rot(50), offset: 0.15 }, { ...rot(96), offset: 0.3 }, { ...rot(48), offset: 0.48 }, { ...rot(96), offset: 0.64 }, { ...rot(52), offset: 0.8 }, rot(WING_REST)];
    const bounce = () => [rot(WING_REST), { ...rot(66), offset: 0.22 }, { ...rot(WING_REST), offset: 0.44 }, { ...rot(72), offset: 0.64 }, rot(WING_REST)];
    const stretch = () => [rot(WING_REST), { ...rot(24), offset: 0.3 }, { ...rot(24), offset: 0.7 }, rot(WING_REST)];
    const idle = {
        celingak: () => [
            [ck.eyes, [look(0, 0), { ...look(-12, 0), offset: 0.2 }, { ...look(-12, 0), offset: 0.42 }, { ...look(12, 0), offset: 0.6 }, { ...look(12, 0), offset: 0.82 }, look(0, 0)], { duration: 2200 }],
            [ck.root, [rot(0), { ...rot(-3), offset: 0.3 }, { ...rot(3), offset: 0.72 }, rot(0)], { duration: 2200 }]
        ],
        matuk: () => [
            [ck.root, [lift(0), { ...dip, offset: 0.15 }, { ...lift(0), offset: 0.3 }, { ...dip, offset: 0.45 }, { ...lift(0), offset: 0.6 }, { ...dip, offset: 0.75 }, lift(0)], { duration: 1400 }]
        ],
        kepak: () => [
            [ck.wing, flap(), { duration: 1200 }],
            [ck.wingL, mirror(flap()), { duration: 1200 }],
            [ck.root, [lift(0), { ...lift(-2), offset: 0.5 }, lift(0)], { duration: 1200 }]
        ],
        lompat: () => [
            [ck.root, [lift(0), { ...lift(-7), offset: 0.22 }, { ...lift(0), offset: 0.44 }, { ...lift(-4), offset: 0.64 }, { ...lift(0), offset: 0.84 }, lift(0)], { duration: 1100, easing: EASE_OUT }],
            [ck.wing, bounce(), { duration: 1100 }],
            [ck.wingL, mirror(bounce()), { duration: 1100 }]
        ],
        jambul: () => [
            [ck.comb, [rot(0), { ...rot(-14), offset: 0.2 }, { ...rot(12), offset: 0.4 }, { ...rot(-8), offset: 0.6 }, { ...rot(5), offset: 0.8 }, rot(0)], { duration: 1100 }]
        ],
        menguap: () => [
            [ck.jaw, [{ transform: 'translateY(0)' }, { transform: 'translateY(16px)', offset: 0.3 }, { transform: 'translateY(16px)', offset: 0.7 }, { transform: 'translateY(0)' }], { duration: 2000 }],
            [ck.mouth, [squash(0.15), { ...squash(1.5), offset: 0.3 }, { ...squash(1.5), offset: 0.7 }, squash(0.15)], { duration: 2000 }],
            [ck.eyes, [squash(1), { ...squash(0.35), offset: 0.3 }, { ...squash(0.35), offset: 0.7 }, squash(1)], { duration: 2000 }],
            [ck.root, [squash(1), { ...squash(1.03), offset: 0.35 }, { ...squash(1.03), offset: 0.65 }, squash(1)], { duration: 2000 }],
            [ck.wing, stretch(), { duration: 2000 }],
            [ck.wingL, mirror(stretch()), { duration: 2000 }]
        ],
        lirikScroll: () => [
            [ck.eyes, [look(0, 0), { ...look(12, 8), offset: 0.2 }, { ...look(12, 8), offset: 0.8 }, look(0, 0)], { duration: 1900 }],
            [ck.wing, [rot(WING_REST), { ...rot(36), offset: 0.3 }, { ...rot(24), offset: 0.45 }, { ...rot(36), offset: 0.6 }, { ...rot(36), offset: 0.75 }, rot(WING_REST)], { duration: 1900 }]
        ],
        kedipGanda: () => [
            [ck.eyes, [squash(1), { ...squash(0.08), offset: 0.12 }, { ...squash(1), offset: 0.26 }, { ...squash(0.08), offset: 0.4 }, { ...squash(1), offset: 0.54 }, squash(1)], { duration: 900 }]
        ]
    };
    const idleNames = Object.keys(idle);
    const canIdle = () => !still && !paused && inView && !document.hidden;

    // Jeda acak 2-6 detik dihitung dari selesainya gerak terakhir (sapaan atau aksi idle).
    function scheduleIdle() {
        clearTimeout(idleTimer);
        if (!canIdle()) return;
        const wait = Math.max(0, busyUntil - performance.now()) + 2000 + Math.random() * 4000;
        idleTimer = setTimeout(runIdle, wait);
    }

    function runIdle() {
        if (!canIdle()) return;
        if (performance.now() < busyUntil) return scheduleIdle();
        const choices = idleNames.filter(name => name !== lastIdle);
        lastIdle = choices[Math.floor(Math.random() * choices.length)];
        hero.dataset.idle = lastIdle;
        play(idle[lastIdle]());
        scheduleIdle();
    }

    document.addEventListener('visibilitychange', () => (document.hidden ? clearTimeout(idleTimer) : scheduleIdle()));

    function welcomeBack() {
        say('back');
        nudgeHint();
        if (!still) clips.back();
    }

    pokeBtn.addEventListener('click', () => {
        say('poke');
        if (!still) clips.poke();
        scheduleIdle();
    });

    pauseBtn.addEventListener('click', () => {
        paused = !paused;
        pauseBtn.setAttribute('aria-pressed', String(paused));
        pauseBtn.textContent = paused ? 'Lanjutkan gerak' : 'Jeda gerak';
        hero.classList.toggle('is-paused', paused);
        running.forEach(a => (paused ? a.pause() : a.play()));
        if (paused) clearTimeout(idleTimer);
        else scheduleIdle();
    });

    new IntersectionObserver(([entry]) => {
        // Hero yang hanya menempel di tepi layar dianggap "intersecting" dengan luas 0; gerak idle cukup berhenti di situ.
        hero.classList.toggle('is-offscreen', entry.intersectionRatio === 0);
        if (entry.intersectionRatio < 0.2) hasLeft = true;
        else if (entry.intersectionRatio >= 0.55 && hasLeft) {
            hasLeft = false;
            welcomeBack();
        }
        // Aksi idle hanya selama hero masih dominan di layar (pengguna belum turun ke aplikasi).
        inView = entry.intersectionRatio >= 0.55;
        if (inView) scheduleIdle();
        else clearTimeout(idleTimer);
    }, { threshold: [0, 0.2, 0.55] }).observe(hero);

    if (still) {
        hero.classList.add('is-still');
        showHint(0);
        return;
    }

    // Mata mengikuti pointer, maksimal beberapa piksel, dihitung hanya saat pointer bergerak.
    let eyeFrame = 0;
    window.addEventListener('pointermove', e => {
        if (eyeFrame || paused) return;
        eyeFrame = requestAnimationFrame(() => {
            eyeFrame = 0;
            const r = ck.eyes.getBoundingClientRect();
            const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
            const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
            ck.eyes.style.transform = `translate(${(dx * 9).toFixed(1)}px, ${(dy * 7).toFixed(1)}px)`;
        });
    }, { passive: true });

    // Ikut scroll: makin jauh pengguna turun, makin miring badan ayam dan makin besar tatapannya.
    // Hanya menulis satu variabel CSS per frame; transformnya dikerjakan CSS.
    let scrollFrame = 0;
    function trackScroll() {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(() => {
            scrollFrame = 0;
            const p = Math.min(Math.max(window.scrollY / (hero.offsetHeight * 0.8), 0), 1);
            hero.style.setProperty('--scroll-p', p.toFixed(3));
        });
    }
    window.addEventListener('scroll', trackScroll, { passive: true });
    trackScroll();

    say('hello');
    clips.hello();
    showHint(2800);
    scheduleIdle();
}
