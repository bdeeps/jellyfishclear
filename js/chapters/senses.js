// Chapter 3: drifting, balancing and steering. Three scenes:
// 1. Drift: jellyfish are plankton (drifters): a moon jelly cruises at a few cm/s (see the pulse
//    chapter), while coastal and tidal currents often run at tens of cm/s, so the sea decides where
//    they go. Many plankton also move up and down each day (diel vertical migration); jellyfish species
//    differ, so the text says "many" and "often". Depths drawn are illustrative.
// 2. Balance and pacing: each rhopalium holds a statocyst (a heavy crystal mass at its tip) and is a
//    pacemaker; the swim beat starts at a rhopalium. Removing all rhopalia stops normal swimming in
//    Aurelia, and removing the statocyst costs the jelly its sense of up and down (Romanes 1885; recent
//    work summarised in Biomimetics 2025, 10: 810, read only as a search summary).
//    How exactly the beat is adjusted to turn upright varies; we say "adjusted", not which side.
// 3. Box-jelly eyes: Tripedalia cystophora has 24 eyes of four types on four rhopalia (on each: an
//    upper and a lower lens eye, two pit eyes and two slit eyes; Nilsson et al. 2005, Nature 435: 201).
//    The upper lens eye looks up through the water surface and uses the mangrove canopy to stay near
//    the trees (Garm, Oskarsson & Nilsson 2011, Curr Biol 21: 798). Its field of view is close to 100°,
//    about the size of Snell's window, the 97° cone through which a fish or jelly sees the whole sky
//    (critical angle asin(1/1.333) = 48.6°). Jellies in tests saw the canopy from about 8 m (reported in
//    reviews; we read only summaries), so the model turns back when the trees are further than 8 m.
import { THREE, M, approach, clamp, arrow, box, sphere } from '../kit.js';
import { Jelly, pulseShape, miniJelly, makeSpecks, layoutOf, reelZoom, focuser, viewFixer, inReel } from '../jelly.js';

const VIEWS = {
  drift: { pos: [1.5, 3.2, 12.5], target: [1.2, 2.6, 0], narrow: { pos: [0.5, 3.4, 8.5], target: [0.3, 2.6, 0] } },
  balance: { pos: [1.4, 3.0, 7.6], target: [1.2, 2.5, 0], narrow: { pos: [0.0, 2.8, 6.0], target: [0.0, 2.4, 0] } },
  eyes: { pos: [1.6, 3.8, 12.5], target: [1.6, 3.6, 0], narrow: { pos: [2.6, 4.0, 8.0], target: [2.6, 3.6, 0] } },
};
const SNELL = Math.asin(1 / 1.333);   // 48.6°

export default {
  id: 'senses',
  short: 'Drift, balance, steer',
  title: 'Drifting, balancing and steering',
  subtitle: 'Carried by the sea, but never quite helpless.',
  view: VIEWS.drift,
  learn: `<p>A moon jelly swims at a few centimetres a second. Ocean and tidal currents often move at ten times that. So jellyfish are <b>plankton</b>, a word from Greek for “drifters”: the sea decides where they end up, which is why thousands can wash up on one beach.</p>
    <p>They are not helpless, though. Many jellyfish and other plankton make a daily trip up and down, often rising nearer the surface at night: a <b>vertical migration</b>. By choosing a depth they also choose a current, a bit like a hot-air balloon picking a wind.</p>
    <p>Floating is easy for them. Their body is almost exactly as dense as sea water, and some jellies fine-tune it by pushing out heavy <b>sulfate</b> ions and keeping lighter <b>chloride</b> ones (more in <a href="/buoyancyclear/">BuoyancyClear</a>). A fish needs a gas bag; a jelly barely needs to try.</p>
    <p>Each <b>rhopalium</b> at the rim has a tiny heavy crystal at its tip, the <b>statocyst</b>. When the jelly tips over, the crystals lean and the jelly feels which way is down, then adjusts its beat to turn upright. The rhopalia are also <b>pacemakers</b>: every pulse starts at one of them. Cut them all off and the bell stops beating.</p>
    <p><b>Box jellyfish</b> go further. They have <b>24 eyes</b> on four rhopalia, some with real lenses. A small Caribbean box jelly looks <b>up through the water surface</b> with one of them, spots the dark canopy of mangrove trees, and swims back towards the trees, where its food gathers.</p>
    <p class="tip"><b>Try it:</b> turn up the current. Tip the jelly over, then take away its rhopalia. Move the box jelly away from the mangroves.</p>`,
  terms: [
    { t: 'Plankton', d: 'Living things that drift with the water because they cannot swim against currents.' },
    { t: 'Vertical migration', d: 'A daily trip up and down the water column.' },
    { t: 'Statocyst', d: 'A balance organ with a heavy crystal that shows which way is down.' },
    { t: 'Pacemaker', d: 'A group of cells that sets the rhythm of a beat.' },
    { t: 'Lens eye', d: 'An eye with a lens that focuses an image. Box jellies have eight of them.' },
    { t: 'Snell’s window', d: 'The circle of sky you see when looking up from underwater, squeezed into a cone about 97° wide.' },
  ],
  defaults: { focus: 'drift', current: 0.3, hour: 14, tilt: 30, rhop: true, dist: 4 },
  onChange(s, key) { if (key === 'current' || key === 'hour') s.focus = 'drift'; if (key === 'tilt' || key === 'rhop' || key === 'action') { if (key !== 'action') s.focus = 'balance'; } if (key === 'dist') s.focus = 'eyes'; },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'drift', label: 'Drifting' }, { v: 'balance', label: 'Balance and beat' }, { v: 'eyes', label: 'Box-jelly eyes' }] },
    { key: 'current', type: 'range', label: 'Current speed', min: 0, max: 1, step: 0.01, fmt: (v) => `${Math.round(v * 100)} cm/s` },
    { key: 'hour', type: 'range', label: 'Time of day', min: 0, max: 24, step: 0.1, fmt: (v) => `${String(Math.floor(v) % 24).padStart(2, '0')}:${String(Math.floor((v % 1) * 60)).padStart(2, '0')}` },
    { key: 'tilt', type: 'range', label: 'Tip the jelly over', min: 0, max: 60, step: 1, fmt: (v) => v + '°' },
    { key: 'rhop', type: 'toggle', label: 'Rhopalia in place', hint: 'Turn off to remove them, as George Romanes did in the 1870s.' },
    { key: 'dist', type: 'range', label: 'Box jelly’s distance from the mangroves', min: 1, max: 14, step: 0.1, fmt: (v) => v.toFixed(1) + ' m' },
  ],
  quiz: [
    { q: 'Why are jellyfish counted as plankton?', options: ['They are tiny', 'They cannot swim against most currents, so they drift', 'They eat plankton', 'They live only near the surface'], answer: 1, why: 'Plankton means drifters. A jelly swims a few cm/s, while currents are often much faster.' },
    { q: 'What do the rhopalia do?', options: ['Digest food', 'Sense gravity and light, and start each beat', 'Make eggs', 'Sting prey'], answer: 1, why: 'Each rhopalium has a crystal-weighted balance organ and light sensors, and acts as a pacemaker for the pulse.' },
    { q: 'How does a mangrove box jelly find its way back to the trees?', options: ['By smell', 'It looks up through the water surface and sees the tree canopy', 'By following the current', 'By echolocation'], answer: 1, why: 'One of its lens eyes points up through the surface. Seeing the canopy tells it where the mangroves are.' },
  ],
  reel: [
    { ms: 5200, caption: 'Box jellyfish have 24 eyes, and one kind looks up through the surface to find mangroves.', set: { focus: 'eyes' }, anim: { dist: [3, 11] }, view: { pos: [1.5, 4.4, 11.0], target: [1.5, 4.0, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const G = { drift: new THREE.Group(), balance: new THREE.Group(), eyes: new THREE.Group() };
    for (const k in G) root.add(G[k]);
    const L = (h, p, par, c = '') => stage.label(h, p, par, c);

    // ---------------------------------------------------------------- drift
    const N = 26, crowd = [];
    let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < N; i++) { const j = miniJelly(i === 0 ? 0xffd27a : 0xcfe8ff, 0.22 + rnd() * 0.12); j.userData.x = -6 + rnd() * 12; j.userData.z = -2.5 + rnd() * 5; j.userData.dy = rnd(); j.userData.ph = rnd() * 6; G.drift.add(j); crowd.push(j); }
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), M.ghost(0x6cc4ff, 0.18)); surf.rotation.x = -Math.PI / 2; surf.position.y = 5.6; G.drift.add(surf);
    const dSpecks = makeSpecks(180, [-7, 7, 0.2, 5.5, -3, 3]); G.drift.add(dSpecks.mesh);
    const curA = arrow(0x6cc4ff, 2, 0.35, 0.06); curA.rotation.z = -Math.PI / 2; curA.position.set(-2.6, 0.5, 2.2); G.drift.add(curA);
    const swimA = arrow(0x5ce1a9, 0.4, 0.2, 0.045); G.drift.add(swimA);
    const sun = sphere(0.35, M.glow(0xffd27a)); sun.position.set(5.6, 6.6, -2); G.drift.add(sun);
    const dl = { cur: L('Current', [-2.2, 0.95, 2.2], G.drift), swim: L('Its own swimming', [0, 0, 0], G.drift, 'hot'), surf: L('Sea surface', [-2.5, 5.85, 0], G.drift), sky: L('Day', [5.6, 7.2, -2], G.drift) };

    // ---------------------------------------------------------------- balance
    const bj = new Jelly({ kind: 'moon', R: 1.2 }); const bHold = new THREE.Group(); bHold.position.set(0, 2.4, 0); bHold.add(bj.group); G.balance.add(bHold);
    const downA = arrow(0xffb547, 0.9, 0.25, 0.04); downA.rotation.z = Math.PI; downA.position.set(-2.4, 3.4, 0); G.balance.add(downA);
    // Magnified rhopalium: a club with a crystal-weighted tip that hangs with gravity.
    const inset = new THREE.Group(); inset.position.set(3.4, 2.8, 0); G.balance.add(inset);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.2, 48), M.glow(0x6cc4ff, { transparent: true, opacity: 0.55, side: THREE.DoubleSide })); inset.add(ring);
    const club = new THREE.Group(); inset.add(club);
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.1, 16), M.plastic(0xf3e6ff, { transparent: true, opacity: 0.8 })); stalk.position.y = -0.55; club.add(stalk);
    const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), M.plastic(0xffd84a, { emissive: 0x553300, flatShading: true })); crystal.position.y = -1.15; club.add(crystal);
    const pad = box(1.2, 0.08, 0.5, M.plastic(0xff8fa8)); pad.position.set(0, -0.4, -0.3); inset.add(pad);
    const eyeSpot = sphere(0.09, M.glow(0xff5a5a)); eyeSpot.position.set(0.13, -0.6, 0.1); club.add(eyeSpot);
    club.position.y = 0.55;
    const bl = { inset: L('One rhopalium, magnified', [3.4, 4.2, 0], G.balance, 'hot'), crystal: L('Statocyst crystal', [0, 0, 0], G.balance), down: L('Down', [-2.4, 2.25, 0], G.balance), pace: L('This one started the beat', [0, 0, 0], G.balance, 'hot') };

    // ---------------------------------------------------------------- eyes: box jelly in a mangrove lagoon
    const ej = new Jelly({ kind: 'box', R: 0.45 }); const eHold = new THREE.Group(); eHold.add(ej.group); G.eyes.add(eHold);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), M.ghost(0x6cc4ff, 0.16)); water.rotation.x = -Math.PI / 2; water.position.set(-1, 4.6, 0); G.eyes.add(water);
    const shore = box(2.2, 4.8, 6, M.matte(0x3a2a1a)); shore.position.set(7.6, 2.4, 0); G.eyes.add(shore);
    const trees = new THREE.Group(); G.eyes.add(trees);
    for (let i = 0; i < 5; i++) {
      const z = -2.4 + i * 1.2;
      for (let r = 0; r < 4; r++) { const root = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.0, 6), M.matte(0x5a4028)); root.position.set(6.2 - r * 0.25, 4.2, z + (r % 2) * 0.2); root.rotation.z = 0.35 - r * 0.22; trees.add(root); }
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.4, 8), M.matte(0x5a4028)); trunk.position.set(6.4, 6.2, z); trees.add(trunk);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 10), M.matte(0x2f6b3a)); crown.position.set(6.2, 7.6, z); crown.scale.set(1.5, 0.8, 1.0); trees.add(crown);
    }
    // The upper lens eye's view: a cone of about 100°, opening upwards.
    const coneH = 1.9, cone = new THREE.Mesh(new THREE.ConeGeometry(coneH * Math.tan(SNELL), coneH, 40, 1, true), M.ghost(0xffd27a, 0.12));
    cone.rotation.x = Math.PI; cone.position.y = coneH / 2; const coneG = new THREE.Group(); coneG.add(cone); eHold.add(coneG);
    const backA = arrow(0x5ce1a9, 1.2, 0.3, 0.05); backA.rotation.z = -Math.PI / 2; backA.visible = false; G.eyes.add(backA);
    const el = { trees: L('Mangrove canopy', [6.0, 8.7, 0], G.eyes), eye: L('Upper lens eye looks up through the surface', [0, 0, 0], G.eyes, 'hot'), cop: L('Food (tiny crustaceans) gathers in light gaps by the roots', [4.2, 1.0, 1.5], G.eyes) };

    const focus = focuser(stage, G, VIEWS);
    const fixView = viewFixer(stage, this.view);
    let t = 0, lastTilt = 30, tiltNow = 30, ph = 0, ex = 1, leader = 0, lastBeat = 0, eX = -3, eDir = 1, beats = 0;
    focus('drift', true);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.4); fixView();
        if (focus(s.focus) && s.focus === 'balance') tiltNow = s.tilt;
        if (s.tilt !== lastTilt) { tiltNow = s.tilt; lastTilt = s.tilt; }
        const narrow = layoutOf(stage) === 'narrow';
        if (s.focus === 'drift') {
          // Day and night: depth band rises at night (illustrative).
          const night = 0.5 + 0.5 * Math.cos((s.hour / 24) * Math.PI * 2);     // 1 at midnight, 0 at noon
          const yBand = 1.2 + 3.2 * night;
          const vCur = s.current * 6;                                         // scene units/s for display
          crowd.forEach((j, i) => {
            const u = j.userData; u.x += (vCur + 0.12) * dt; if (u.x > 7) u.x -= 14;
            const y = clamp(yBand + (u.dy - 0.5) * 1.6, 0.5, 5.3);
            j.position.set(u.x, approach(j.position.y || y, y, 1.2, dt), u.z);
            const p = pulseShape(t * 0.5 + u.ph); j.scale.set(1 - 0.15 * p, 1 + 0.1 * p, 1 - 0.15 * p);
          });
          dSpecks.update(dt, () => [vCur, 0, 0]);
          curA.set(0.3 + s.current * 3.5); dl.cur.position.set(-2.6 + (0.3 + s.current * 3.5) / 2, 0.95, 2.2);
          const hero = crowd[0]; swimA.position.set(hero.position.x, hero.position.y + 0.35, hero.position.z); swimA.set(0.35);
          dl.swim.position.set(hero.position.x, hero.position.y + 1.0, hero.position.z);
          const day = 1 - night; sun.material.color.setHex(day > 0.5 ? 0xffd27a : 0xcfd8ff); sun.scale.setScalar(day > 0.5 ? 1 : 0.7);
          dl.sky.element.textContent = day > 0.5 ? 'Day: deeper' : 'Night: nearer the surface';
          stage.scene.background = new THREE.Color().setHSL(0.58, 0.6, 0.03 + 0.06 * day);
        }
        if (s.focus === 'balance') {
          // Righting: with rhopalia, each beat removes part of the tilt.
          const f = 0.5;
          if (s.rhop) {
            const before = ph; ph += dt * f;
            if (Math.floor(ph) !== Math.floor(before)) { tiltNow *= 0.55; leader = tiltNow > 3 ? 0 : (beats++ % 8); lastBeat = t; }
          }
          const c = s.rhop ? pulseShape(ph) : 0;
          bj.pose(c, t, s.rhop ? 1 : 0.3);
          bj.rho.forEach((m) => { m.visible = s.rhop; });
          bHold.rotation.z = THREE.MathUtils.degToRad(tiltNow);
          // The rhopalium club tilts with the body but its crystal-heavy tip hangs down.
          const tilt = THREE.MathUtils.degToRad(tiltNow);
          club.rotation.z = tilt * 0.35;
          inset.visible = true; bl.inset.visible = !narrow;
          bl.crystal.position.set(3.4 - 1.1, 2.8 + 0.55 - 1.15, 0);
          const lead = bj.rho[leader], wp = new THREE.Vector3(); lead.getWorldPosition(wp);
          const flash = s.rhop && t - lastBeat < 0.7;
          bl.pace.visible = flash && !narrow; bl.pace.position.copy(wp).add(new THREE.Vector3(0, -0.45, 0));
          bj.rho.forEach((m, i) => m.scale.setScalar(flash && i === leader ? 2.2 : 1));
        }
        if (s.focus === 'eyes') {
          // The jelly patrols; it turns back towards the trees when they are out of sight (beyond 8 m).
          const target = 5.4 - s.dist * 0.75;                               // 0.75 scene units per metre
          eX = approach(eX, target, 1.2, dt);
          const wob = Math.sin(t * 0.8) * 0.15;
          eHold.position.set(eX + wob, 2.6 + Math.sin(t * 0.6) * 0.1, 0);
          const lost = s.dist > 8;
          eDir = approach(eDir, lost ? 1 : 0, 2, dt);
          backA.visible = eDir > 0.2; backA.set(1.4 * eDir); backA.position.set(eX + wob + 0.4, 2.4, 0);   // swims back towards the trees
          ej.pose(pulseShape(t * 1.2), t);
          cone.material.color.setHex(lost ? 0xff7a59 : 0xffd27a);
          el.eye.position.set(eX - 0.4, 4.9, 0); el.eye.visible = !narrow;
          el.eye.element.textContent = lost ? 'Canopy out of sight: swims back to the trees' : 'Upper lens eye sees the canopy: stays near';
          el.cop.visible = !narrow; el.trees.visible = !narrow;
        }
        if (s.focus !== 'drift' && stage.scene.background) stage.scene.background = null;
      },
      readout: (s) => {
        if (s.focus === 'drift') {
          const km = s.current * 3.6, swim = 0.015 * 3600;
          return `<div class="big">Carried ${km.toFixed(1)} km an hour</div>
            <div class="row"><span>Current</span><b>${Math.round(s.current * 100)} cm/s</b></div>
            <div class="row"><span>A moon jelly swims</span><b>about 1–2 cm/s, ~${swim.toFixed(0)} m an hour</b></div>
            <div class="row"><span>Current ÷ swimming</span><b>${s.current > 0 ? (s.current / 0.015).toFixed(0) + '×' : 'still water'}</b></div>
            <div class="row"><span>Time of day</span><b>${(s.hour < 6 || s.hour > 18) ? 'night: many plankton rise' : 'day: many plankton sink deeper'}</b></div>
            <small>Swimming speed from the pulse chapter’s model. Depths drawn are illustrative; species differ.</small>`;
        }
        if (s.focus === 'balance') return `<div class="big">${!s.rhop ? 'No rhopalia: no beat' : tiltNow > 3 ? `Turning upright: ${tiltNow.toFixed(0)}°` : 'Upright'}</div>
            <div class="row"><span>Beat</span><b>${s.rhop ? 'about 30 a minute, started by a rhopalium' : 'stopped'}</b></div>
            <div class="row"><span>Sense of down</span><b>${s.rhop ? 'statocyst crystals lean with the tilt' : 'lost'}</b></div>
            <small>After Romanes (1870s–1885) and later experiments: remove the rhopalia and the bell stops pulsing.</small>`;
        const lost = s.dist > 8, e = Math.atan2(5, s.dist), thw = Math.asin(Math.cos(e) / 1.333);
        return `<div class="big">${lost ? 'Trees out of sight: heading back' : 'Trees in sight: staying near'}</div>
            <div class="row"><span>Eyes</span><b>24 on 4 rhopalia, 8 with lenses</b></div>
            <div class="row"><span>Snell’s window</span><b>whole sky squeezed into 97°</b></div>
            <div class="row"><span>Canopy top seen at</span><b>${(thw * 180 / Math.PI).toFixed(0)}° from straight up</b></div>
            <small>Tripedalia cystophora (Garm et al. 2011). Trees taken as 5 m tall; the 8 m sighting limit is from reviews of the experiments.</small>`;
      },
    };
  },
};
