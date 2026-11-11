// Chapter 6: how people worked out jellyfish. Four scenes:
// 1. Romanes (Croonian Lecture read 16 Dec 1875, Phil Trans 1876; book "Jelly-Fish, Star-Fish and
//    Sea-Urchins", 1885). On the naked-eyed medusa Sarsia, cutting off the margin with its marginal
//    bodies caused "immediate, total, and permanent paralysis" of the bell, while the severed margin
//    kept pulsing, even a small piece with one marginal body (read in the Gutenberg text of the book).
// 2. GFP: Shimomura and Johnson collected jellies at Friday Harbor in 1961 and reported aequorin, with
//    GFP noted, in 1962 (Shimomura, Johnson & Saiga, J Cell Comp Physiol 59: 223). Prasher cloned
//    the gene (1992), Chalfie made other organisms glow with it (1994), Tsien explained and recoloured
//    it; Nobel Prize in Chemistry announced 8 Oct 2008 (Royal Swedish Academy press release).
//    In the jelly, aequorin makes blue light when calcium arrives and GFP turns it green.
// 3. Space: Spacelab Life Sciences 1 (STS-40, Columbia, 5–14 June 1991) carried thousands of moon
//    jelly polyps and ephyrae (Dorothy Spangenberg's experiment). Graviceptors formed, but space-reared
//    ephyrae lost more statoliths (Spangenberg et al. 1994, Adv Space Res, NTRS 19950029070); more
//    pulsing problems were reported in space-born ephyrae (search summary only). The counts "2,478 up,
//    about 60,000 back" appear only in secondary sources, so the readout says "reported".
// 4. Medusoid: silicone plus rat heart-muscle cells, eight arms, made to beat by an electric field
//    (Nawroth et al. 2012, Nature Biotechnology; Caltech and Harvard; press releases 22 Jul 2012).
//    Xu & Dabiri (2020, Sci Adv) paced live moon jellies with a 10 mW implant: up to ~3× faster for
//    twice the metabolic cost; a 2024 follow-up added a streamlined "hat" to carry sensors.
import { THREE, M, approach, clamp, box, sphere, arrow } from '../kit.js';
import { Jelly, pulseShape, layoutOf, reelZoom, focuser, viewFixer, inReel } from '../jelly.js';

const VIEWS = {
  romanes: { pos: [1.4, 3.2, 8.4], target: [1.2, 2.4, 0], narrow: { pos: [0.4, 3.0, 6.0], target: [0.4, 2.3, 0] } },
  gfp: { pos: [1.2, 3.6, 7.4], target: [1.0, 2.4, 0], narrow: { pos: [0.0, 3.2, 6.0], target: [0.0, 2.3, 0] } },
  space: { pos: [1.2, 3.0, 7.8], target: [1.0, 2.4, 0], narrow: { pos: [0.0, 3.0, 6.5], target: [0.0, 2.4, 0] } },
  robot: { pos: [1.2, 5.0, 6.4], target: [1.0, 1.8, 0], narrow: { pos: [0.0, 4.4, 5.2], target: [0.0, 1.6, 0] } },
};

export default {
  id: 'history',
  short: 'Working it out',
  title: 'How we worked out jellyfish',
  subtitle: 'A cut rim, a glowing protein, jellies in orbit and a robot made of heart cells.',
  view: VIEWS.romanes,
  learn: `<p>Jellyfish are old: fossils from about <b>505 million years ago</b> show bells that look ready to swim. Science caught up much later. In the <b>1870s</b> the British biologist <b>George Romanes</b> cut jellies apart to find what drives the beat. When he snipped off the rim of a small jelly, the bell stopped dead, while the cut-off rim <b>kept on pulsing</b>. The rhythm lived in the rim’s sense organs. He wrote it up in his 1885 book <i>Jelly-Fish, Star-Fish and Sea-Urchins</i>.</p>
    <p>In <b>1961</b> the Japanese chemist <b>Osamu Shimomura</b> collected thousands of crystal jellies (<i>Aequorea</i>) at Friday Harbor in the USA to find out how they glow. He found a protein that makes blue light, and a second one that turns it <b>green</b>: <b>green fluorescent protein</b>, or GFP. Decades later scientists learned to put the GFP gene into other living things, so cells, nerves and even whole animals could be made to glow and watched. Shimomura, <b>Martin Chalfie</b> and <b>Roger Tsien</b> shared the <b>2008 Nobel Prize in Chemistry</b>.</p>
    <p>In <b>1991</b> thousands of moon-jelly polyps flew on the Space Shuttle <i>Columbia</i> to test how gravity sensing develops. They made ephyrae in orbit, but the space-born jellies lost more of their balance crystals, and some pulsed strangely back on Earth.</p>
    <p>In <b>2012</b> engineers at Caltech and Harvard built the <b>Medusoid</b>: a flat silicone jelly lined with rat heart-muscle cells that swims when an electric field makes the cells beat. In 2020 the same Caltech group fitted live moon jellies with tiny pacemakers that made them swim up to about three times faster. Robots like these could one day carry sensors through the ocean. (Birds and fish inspire robots too: see <a href="/birdflightclear/">BirdFlightClear</a> and <a href="/fishswimclear/">FishSwimClear</a>.)</p>
    <p class="tip"><b>Try it:</b> cut off the rim like Romanes, shine blue light on the crystal jelly, switch gravity off, and pace the Medusoid.</p>`,
  terms: [
    { t: 'Croonian Lecture', d: 'A famous Royal Society lecture. Romanes gave his on jellyfish in 1875.' },
    { t: 'Fluorescence', d: 'Taking in light of one colour and giving out another, like GFP turning blue light green.' },
    { t: 'GFP', d: 'Green fluorescent protein, first found in the crystal jelly Aequorea and now used in labs everywhere.' },
    { t: 'Statolith', d: 'A tiny crystal in a balance organ that shows which way is down.' },
    { t: 'Biohybrid robot', d: 'A machine built partly from living cells.' },
  ],
  defaults: { focus: 'romanes', cut: false, blue: true, gravity: true, pace: 1 },
  onChange(s, key) { if (key === 'cut' || key === 'action') s.focus = 'romanes'; if (key === 'blue') s.focus = 'gfp'; if (key === 'gravity') s.focus = 'space'; if (key === 'pace') s.focus = 'robot'; },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'romanes', label: 'Romanes' }, { v: 'gfp', label: 'GFP' }, { v: 'space', label: 'In space' }, { v: 'robot', label: 'Medusoid' }] },
    { key: 'cut', type: 'toggle', label: 'Cut off the rim (Romanes, 1870s)' },
    { key: 'blue', type: 'toggle', label: 'Shine blue light on the crystal jelly' },
    { key: 'gravity', type: 'toggle', label: 'Gravity on (off = in orbit)' },
    { key: 'pace', type: 'range', label: 'Medusoid: electric pulses per second', min: 0.25, max: 2, step: 0.05, fmt: (v) => v.toFixed(2) + ' Hz' },
  ],
  quiz: [
    { q: 'What did Romanes find when he cut the rim off a small jellyfish?', options: ['The bell kept beating and the rim stopped', 'The bell stopped, but the cut-off rim kept pulsing', 'Both kept beating', 'The jelly glowed green'], answer: 1, why: 'The beat starts in the sense organs at the rim, so the bell without its rim was paralysed.' },
    { q: 'Where was green fluorescent protein (GFP) first found?', options: ['In a firefly', 'In the crystal jelly Aequorea', 'In a moon jelly’s gonads', 'In seaweed'], answer: 1, why: 'Shimomura found it in Aequorea from Friday Harbor. It turns the jelly’s blue light green.' },
    { q: 'What makes the Medusoid robot swim?', options: ['A tiny propeller', 'Rat heart-muscle cells on silicone, made to beat by an electric field', 'A battery-driven motor', 'Air bubbles'], answer: 1, why: 'It is a biohybrid: living heart cells contract on a silicone sheet shaped like a baby jellyfish.' },
  ],
  reel: [
    { ms: 5000, caption: 'A protein from the crystal jelly glows green, and won the 2008 Nobel Prize in Chemistry.', set: { focus: 'gfp', blue: true }, anim: {}, view: { pos: [0.4, 3.4, 6.2], target: [0.2, 2.4, 0] }, spin: 0.35 },
    { ms: 4800, caption: 'In 2012 engineers built a swimming jelly robot from silicone and heart-muscle cells.', set: { focus: 'robot' }, anim: { pace: [0.5, 1.5] }, view: { pos: [0.4, 4.6, 5.4], target: [0.2, 1.8, 0] }, spin: 0.25 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const G = { romanes: new THREE.Group(), gfp: new THREE.Group(), space: new THREE.Group(), robot: new THREE.Group() };
    for (const k in G) root.add(G[k]);
    const L = (h, p, par, c = '') => stage.label(h, p, par, c);

    // ---------------------------------------------------------------- Romanes
    const sar = new Jelly({ kind: 'prolate', R: 0.9, F: 0.85 }); sar.group.position.set(-0.6, 2.4, 0); G.romanes.add(sar.group);
    const marg = new THREE.Group(); G.romanes.add(marg);
    const margRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 10, 48), M.clear(0xe6f4ff, 0.6)); margRing.rotation.x = Math.PI / 2; marg.add(margRing);
    const margDots = []; for (let i = 0; i < 4; i++) { const d = sphere(0.07, M.glow(0xffd84a)); const a = i * Math.PI / 2 + Math.PI / 4; d.position.set(Math.sin(a) * 0.9, 0, Math.cos(a) * 0.9); marg.add(d); margDots.push(d); }
    const scis = new THREE.Group(); const b1 = box(1.0, 0.05, 0.12, M.metal()); b1.rotation.z = 0.3; const b2 = box(1.0, 0.05, 0.12, M.metal()); b2.rotation.z = -0.3; scis.add(b1, b2); scis.position.set(-2.4, 1.6, 0.6); G.romanes.add(scis);
    const rl = { bell: L('Bell', [0, 0, 0], G.romanes), rim: L('Rim with sense organs', [0, 0, 0], G.romanes, 'hot') };

    // ---------------------------------------------------------------- GFP
    const aeq = new Jelly({ kind: 'aequorea', R: 1.3 }); aeq.group.position.set(0, 2.4, 0); G.gfp.add(aeq.group);
    const lamp = new THREE.Group(); G.gfp.add(lamp);
    const beams = []; for (let i = 0; i < 3; i++) { const a = arrow(0x5a7bff, 1.4, 0.3, 0.05); a.position.set(-3.2 + i * 0.1, 4.2 - i * 0.6, 0); a.rotation.z = -2.2; lamp.add(a); beams.push(a); }
    const outs = []; for (let i = 0; i < 3; i++) { const a = arrow(0x5cff9a, 1.1, 0.28, 0.05); a.position.set(1.6, 2.2 + i * 0.35, 0.2); a.rotation.z = -1.2 + i * 0.3; G.gfp.add(a); outs.push(a); }
    const gl = { blue: L('Blue light in', [-3.2, 4.6, 0], G.gfp), green: L('Green light out: GFP', [2.8, 3.4, 0.2], G.gfp, 'hot'), rim: L('Light organs round the rim', [0, 1.5, 1.4], G.gfp) };

    // ---------------------------------------------------------------- Space
    const flask = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.6, 32, 1, true), M.clear(0xcfe8ff, 0.18)); flask.position.set(0, 2.4, 0); G.space.add(flask);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.15, 32), M.metal(0x9aa3ad)); cap.position.set(0, 3.75, 0); G.space.add(cap);
    const eph = [];
    for (let i = 0; i < 9; i++) {
      const sh = new THREE.Shape(); for (let k = 0; k <= 48; k++) { const a = (k / 48) * Math.PI * 2, r = 0.22 * (0.45 + 0.55 * Math.max(0, Math.cos(a * 4)) ** 6); k ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(r, 0); }
      const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: 0xffc7e6, emissive: 0x552244, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })); m.rotation.x = -Math.PI / 2;
      const g = new THREE.Group(); g.add(m); g.userData = { x: Math.cos(i * 2.4) * 0.8, y: 1.5 + (i % 3) * 0.7, z: Math.sin(i * 2.4) * 0.8, ph: i * 0.37 }; g.scale.setScalar(2.4); G.space.add(g); eph.push(g);
    }
    const shuttle = new THREE.Group(); G.space.add(shuttle);
    const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 1.4, 6, 16), M.plastic(0xf2f2f2)); fus.rotation.z = Math.PI / 2; shuttle.add(fus);
    const wingS = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.6, 0, 0), new THREE.Vector3(0.4, 0, 0.7), new THREE.Vector3(0.4, 0, -0.7)]), M.plastic(0x2b2f36, { side: THREE.DoubleSide })); shuttle.add(wingS);
    shuttle.position.set(3.0, 4.6, -1); shuttle.scale.setScalar(0.8);
    const sl = { flask: L('Moon-jelly ephyrae in a flask', [0, 0.75, 1.5], G.space, 'hot'), ship: L('Columbia, June 1991', [3.0, 5.2, -1], G.space) };

    // ---------------------------------------------------------------- Medusoid
    const bot = new THREE.Group(); bot.position.set(0, 1.6, 0); G.robot.add(bot);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 32), M.plastic(0xd8dde4, { transparent: true, opacity: 0.9 })); bot.add(disc);
    const arms = [];
    for (let i = 0; i < 8; i++) {
      const hinge = new THREE.Group(); hinge.rotation.y = (i / 8) * Math.PI * 2; bot.add(hinge);
      const piv = new THREE.Group(); piv.position.x = 0.5; hinge.add(piv);
      const arm = box(1.0, 0.05, 0.36, M.plastic(0xd8dde4, { transparent: true, opacity: 0.9 })); arm.position.x = 0.5; piv.add(arm);
      const cells = box(0.9, 0.02, 0.26, M.plastic(0xff6f86, { emissive: 0x551020 })); cells.position.set(0.5, -0.035, 0); piv.add(cells);
      arms.push(piv);
    }
    const plates = [-2.2, 2.2].map((x) => { const p = box(0.08, 1.6, 2.0, M.metal(0xb9bec8)); p.position.set(x, 1.6, 0); G.robot.add(p); return p; });
    const spark = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 1.5), M.ghost(0xffd84a, 0.0)); spark.position.set(0, 1.6, -0.9); G.robot.add(spark);
    const ol = { cells: L('Rat heart-muscle cells', [0, 0, 0], G.robot, 'hot'), sil: L('Silicone body, 8 arms', [0, 0, 0], G.robot), plate: L('Electrodes pace the beat', [2.2, 2.7, 0], G.robot) };

    const focus = focuser(stage, G, VIEWS);
    const fixView = viewFixer(stage, this.view);
    let t = 0, cutK = 0, ph = 0, grav = 1, rp = 0, flash = 0;
    focus('romanes', true);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.4); fixView();
        focus(s.focus);
        const narrow = layoutOf(stage) === 'narrow';
        if (s.focus === 'romanes') {
          cutK = approach(cutK, s.cut ? 1 : 0, 2.5, dt);
          ph += dt * 0.7;
          const c = pulseShape(ph);
          sar.pose(s.cut ? 0 : c, t, s.cut ? 0.3 : 1);
          sar.rho.forEach((m) => { m.visible = false; });
          // The rim: attached under the bell before the cut, drifting off and still pulsing after it.
          const [rr, ry] = sar.rimAt(s.cut ? 0 : c);
          marg.position.set(-0.6 + cutK * 2.6, 2.4 + ry - cutK * 0.6, 0);
          marg.scale.setScalar(s.cut ? 1 - 0.25 * c : rr / 0.9);
          marg.visible = true; sar.velum.visible = !s.cut;
          scis.position.x = -2.4 + (s.cut ? 0 : Math.sin(t * 2) * 0.1); scis.visible = !s.cut;
          rl.bell.position.set(-0.6 - 1.4, 2.4 + 1.6, 0); rl.bell.element.textContent = s.cut ? 'Bell: paralysed' : 'Bell beating';
          rl.rim.position.set(marg.position.x + 0.6, marg.position.y - 0.55, 0); rl.rim.element.textContent = s.cut ? 'Cut-off rim: still pulsing' : 'Rim with sense organs';
        }
        if (s.focus === 'gfp') {
          aeq.pose(pulseShape(t * 0.45), t);
          const on = s.blue ? 1 : 0;
          aeq.glow.material.color.setHex(on ? 0x5cff9a : 0x7a9a88);
          lamp.visible = !!on; outs.forEach((a, i) => { a.visible = !!on; a.set(0.8 + 0.3 * Math.sin(t * 3 + i)); });
          gl.blue.visible = gl.green.visible = !!on && !narrow;
          stage.scene.background = on ? new THREE.Color(0x02040a) : null;
        } else if (stage.scene.background) stage.scene.background = null;
        if (s.focus === 'space') {
          grav = approach(grav, s.gravity ? 1 : 0, 1.5, dt);
          eph.forEach((e, i) => {
            const u = e.userData, p = pulseShape(t * 0.8 + u.ph);
            const fl = 1 - grav;
            e.position.set(u.x + fl * 0.3 * Math.sin(t * 0.4 + i), u.y + fl * 0.4 * Math.sin(t * 0.3 + i * 2), u.z + fl * 0.3 * Math.cos(t * 0.5 + i));
            e.rotation.set(0.7 + fl * (t * 0.5 + i), t * 0.2 + i, fl * Math.sin(t * 0.7 + i));
            e.scale.set(2.4 * (1 - 0.25 * p), 2.4, 2.4 * (1 - 0.25 * p));
          });
          shuttle.rotation.y = t * 0.2; shuttle.visible = !s.gravity; sl.ship.visible = !s.gravity && !narrow;
        }
        if (s.focus === 'robot') {
          const before = rp; rp += dt * s.pace;
          if (Math.floor(rp) !== Math.floor(before)) flash = 1;
          flash = Math.max(0, flash - dt * 5);
          spark.material.opacity = 0.25 * flash;
          const c = pulseShape(rp, 0.3);
          arms.forEach((a) => { a.rotation.z = -(0.1 + 0.7 * c); });
          bot.position.y = 1.6 + 0.15 * Math.sin(rp * Math.PI * 2);
          ol.cells.position.set(0.9, bot.position.y + 0.55, 0.9); ol.sil.position.set(-1.2, bot.position.y - 0.6, 0.6);
          ol.plate.visible = !narrow;
        }
      },
      readout: (s) => {
        if (s.focus === 'romanes') return `<div class="big">${s.cut ? 'The bell stops; the rim beats on' : 'A small jelly, beating'}</div>
          <div class="row"><span>Who</span><b>George Romanes, UK</b></div>
          <div class="row"><span>When</span><b>Croonian Lecture 1875; book 1885</b></div>
          <div class="row"><span>Showed</span><b>the beat starts at the rim’s sense organs</b></div>
          <small>Experiments on Sarsia, from Romanes’s “Jelly-Fish, Star-Fish and Sea-Urchins”.</small>`;
        if (s.focus === 'gfp') return `<div class="big">${s.blue ? 'Blue in, green out' : 'Under ordinary light'}</div>
          <div class="row"><span>Found by</span><b>Osamu Shimomura (jellies collected 1961)</b></div>
          <div class="row"><span>First reported</span><b>1962</b></div>
          <div class="row"><span>Gene cloned, used in other animals</span><b>1992, 1994</b></div>
          <div class="row"><span>Nobel Prize in Chemistry</span><b>2008: Shimomura, Chalfie, Tsien</b></div>
          <small>In the jelly, aequorin makes blue light and GFP turns it green.</small>`;
        if (s.focus === 'space') return `<div class="big">${s.gravity ? 'On Earth: crystals show “down”' : 'In orbit: no “down” to feel'}</div>
          <div class="row"><span>Mission</span><b>Spacelab Life Sciences 1, 5–14 June 1991</b></div>
          <div class="row"><span>Jellies</span><b>thousands of polyps and ephyrae (reported 2,478 up, ~60,000 back)</b></div>
          <div class="row"><span>Found</span><b>balance organs formed, but more statoliths lost</b></div>
          <small>Dorothy Spangenberg’s experiment (NASA technical reports). The counts come from secondary reports.</small>`;
        return `<div class="big">Medusoid beating ${s.pace.toFixed(2)} times a second</div>
          <div class="row"><span>Built by</span><b>Caltech and Harvard, 2012</b></div>
          <div class="row"><span>Made of</span><b>silicone and rat heart-muscle cells</b></div>
          <div class="row"><span>Live jellies with pacemakers (2020)</span><b>up to ~3× faster, 2× the energy</b></div>
          <small>Nawroth et al. 2012 (Nature Biotechnology); Xu & Dabiri 2020 (Science Advances).</small>`;
      },
    };
  },
};
