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
if (hero) init();

function init() {
    const q = selector => hero.querySelector(selector);
    const bubble = document.getElementById('caputBubble');
    const pauseBtn = document.getElementById('caputPause');
    const pokeBtn = document.getElementById('caputPoke');
    const ck = { root: q('.ck-root'), wing: q('.ck-wing'), jaw: q('.ck-jaw'), mouth: q('.ck-mouth'), comb: q('.ck-comb'), eyes: q('.ck-eyes') };
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !ck.root.animate;

    let paused = false;
    let hasLeft = false;
    let hintTimer = 0;
    let running = [];

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
    }

    const rot = deg => ({ transform: `rotate(${deg}deg)` });
    const lift = y => ({ transform: `translateY(${y}%)` });

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
            ...talkTracks(5, 2200, 200)
        ]),
        poke: () => play([
            [ck.root, [lift(0), { ...lift(-6), offset: 0.3 }, lift(0)], { duration: 600, easing: EASE_OUT }],
            [ck.wing, waveFrames(2), { duration: 1500 }],
            ...talkTracks(3, 1100, 100)
        ])
    };

    function welcomeBack() {
        say('back');
        nudgeHint();
        if (!still) clips.back();
    }

    pokeBtn.addEventListener('click', () => {
        say('poke');
        if (!still) clips.poke();
    });

    pauseBtn.addEventListener('click', () => {
        paused = !paused;
        pauseBtn.setAttribute('aria-pressed', String(paused));
        pauseBtn.textContent = paused ? 'Lanjutkan gerak' : 'Jeda gerak';
        hero.classList.toggle('is-paused', paused);
        running.forEach(a => (paused ? a.pause() : a.play()));
    });

    new IntersectionObserver(([entry]) => {
        // Hero yang hanya menempel di tepi layar dianggap "intersecting" dengan luas 0; gerak idle cukup berhenti di situ.
        hero.classList.toggle('is-offscreen', entry.intersectionRatio === 0);
        if (entry.intersectionRatio < 0.2) hasLeft = true;
        else if (entry.intersectionRatio >= 0.55 && hasLeft) {
            hasLeft = false;
            welcomeBack();
        }
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

    say('hello');
    clips.hello();
    showHint(2800);
}
