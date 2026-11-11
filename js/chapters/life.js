// Chapter 4: the life cycle of a moon jelly (Aurelia). Medusae release eggs and sperm; the fertilised
// egg grows into a planula larva that swims with tiny hairs, settles and becomes a polyp (scyphistoma).
// Polyps bud off more polyps; when conditions change (often as water cools) a polyp strobilates: it
// splits into a stack of discs that pop off one by one as eight-armed ephyrae, which grow into medusae.
// (Aurelia aurita stage names: Wikipedia "Aurelia aurita". Sizes are typical and hedged: the planula is
// around a millimetre; ephyra sizes in sources range from about 1 mm to 1 cm, so we say "a few mm";
// adults are commonly palm-sized.)
// Turritopsis dohrnii: under stress (starvation, temperature shock, low salinity, damage) a medusa can
// turn back into a polyp colony by transdifferentiation (Piraino et al. 1996, Biol Bull 190: 302, as
// T. nutricula; first reported by Bavestrello, Sommer & Sarà 1992). "Immortal" only in theory: most
// die from predators or disease, and the reversal has not been seen in the wild.
import { THREE, M, approach, clamp, sphere, tube } from '../kit.js';
import { Jelly, pulseShape, miniJelly, layoutOf, reelZoom, viewFixer } from '../jelly.js';

const STAGES = [
  { name: 'Medusa (adult)', size: 'commonly palm-sized', what: 'Males release sperm, females catch it and carry eggs on their oral arms.' },
  { name: 'Planula larva', size: 'about a millimetre', what: 'A tiny oval covered in beating hairs. It swims, then settles on a hard surface.' },
  { name: 'Polyp', size: 'a few millimetres', what: 'A small stalk with tentacles, fixed to a rock. It feeds and buds off copies of itself.' },
  { name: 'Strobila', size: 'a few millimetres', what: 'The polyp splits into a stack of discs, like a pile of saucers.' },
  { name: 'Ephyra', size: 'a few millimetres', what: 'Each disc pops off as an eight-armed baby jelly and swims away.' },
  { name: 'Young medusa', size: 'grows over weeks', what: 'The ephyra fills in between its arms and grows into a medusa.' },
];
const RAD = 3.4, ANG = (i) => Math.PI / 2 - (i / 6) * Math.PI * 2;
const posOf = (i) => [Math.cos(ANG(i)) * RAD, 2.4 + Math.sin(ANG(i)) * RAD * 0.5, 0];

function ephyraMesh(r = 0.32) {
  const sh = new THREE.Shape();
  for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2, k = 0.45 + 0.55 * Math.max(0, Math.cos(a * 8 / 2) ** 6); const rr = r * k; i ? sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : sh.moveTo(rr, 0); }
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshStandardMaterial({ color: 0xffc7e6, emissive: 0x552244, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; const g = new THREE.Group(); g.add(m); return g;
}
function polypMesh(discs = 0) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.06, 0.7, 16), M.plastic(0xffd8b0, { transparent: true, opacity: 0.9 })); body.position.y = 0.35; g.add(body);
  const tents = new THREE.Group(); tents.position.y = 0.7;
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const t = tube([[0, 0, 0], [Math.cos(a) * 0.2, 0.18, Math.sin(a) * 0.2], [Math.cos(a) * 0.32, 0.42, Math.sin(a) * 0.32]], 0.012, M.plastic(0xffe8d0), false, 12); tents.add(t); }
  g.add(tents); g.userData = { body, tents };
  return g;
}

export default {
  id: 'life',
  short: 'Life cycle',
  title: 'From polyp to jellyfish',
  subtitle: 'Most of a jellyfish’s life story happens stuck to a rock.',
  view: { pos: [-0.2, 4.4, 10.8], target: [-0.2, 3.0, 0], narrow: { pos: [-0.2, 3.4, 7.8], target: [-0.2, 2.6, 0] } },
  learn: `<p>The floating bell you know is only one half of a moon jelly’s life. Grown jellies, called <b>medusae</b>, are male or female. Eggs and sperm meet, and each fertilised egg becomes a <b>planula</b>, a tiny oval larva covered in beating hairs.</p>
    <p>The planula swims for a while, then sticks to a rock, a shell or a pier and turns into a <b>polyp</b>: a little stalk with a ring of tentacles, a few millimetres tall, rather like a tiny sea anemone. Polyps catch food and <b>bud off copies of themselves</b>, so one larva can become a whole lawn of polyps.</p>
    <p>When conditions change, often as the water cools, a polyp does something strange. It splits across into a stack of discs, like a pile of saucers. This is a <b>strobila</b>. One by one, the discs pop off as <b>ephyrae</b>: tiny eight-armed stars that already pulse. Each grows into a new medusa. Because one polyp can make many ephyrae, and many polyps can do it at once, huge numbers of jellies can appear suddenly: a <b>bloom</b>.</p>
    <p>One small jelly, <b><i>Turritopsis dohrnii</i></b>, is called the “immortal jellyfish”. When it is starved, hurt or shocked, its medusa can turn back into a polyp and start again. That is remarkable, but it is not really immortal: in the sea most are eaten or die of disease, and scientists have seen the reversal in the lab, not in the wild.</p>
    <p class="tip"><b>Try it:</b> drag the slider round the cycle and watch the strobila release its ephyrae. Then switch on the <i>Turritopsis</i> shortcut.</p>`,
  terms: [
    { t: 'Medusa', d: 'The free-swimming, bell-shaped stage of a jellyfish.' },
    { t: 'Planula', d: 'A tiny hairy larva that swims, then settles down.' },
    { t: 'Polyp', d: 'The small stalked stage that lives stuck to a surface and can clone itself.' },
    { t: 'Strobilation', d: 'A polyp splitting into a stack of discs that become baby jellies.' },
    { t: 'Ephyra', d: 'A baby jellyfish shaped like an eight-armed star.' },
    { t: 'Transdifferentiation', d: 'Cells changing from one type into another. Turritopsis uses it to turn back into a polyp.' },
  ],
  defaults: { stage: 0, turri: false, auto: true },
  onChange(s, key) { if (key === 'stage') s.auto = false; },
  controls: [
    { key: 'stage', type: 'range', label: 'Stage in the life cycle', min: 0, max: 5.99, step: 0.01, fmt: (v) => STAGES[Math.floor(v)].name },
    { key: 'auto', type: 'toggle', label: 'Go round by itself' },
    { key: 'turri', type: 'toggle', label: 'Show the Turritopsis shortcut', hint: 'A medusa turning back into a polyp, seen in the lab.' },
  ],
  quiz: [
    { q: 'Where does a moon jelly’s polyp live?', options: ['Floating at the surface', 'Stuck to a rock, shell or pier', 'Inside the adult’s stomach', 'In the sand on the beach'], answer: 1, why: 'The planula settles on a hard surface and becomes a polyp that stays put.' },
    { q: 'What is a strobila?', options: ['A stinging cell', 'A polyp splitting into a stack of discs that become ephyrae', 'An adult male jelly', 'A kind of tentacle'], answer: 1, why: 'Strobilation turns one polyp into a pile of discs, each released as a tiny ephyra.' },
    { q: 'What is true of the “immortal jellyfish” Turritopsis?', options: ['It cannot die', 'Under stress its medusa can turn back into a polyp, but most still die from predators or disease', 'It lives for 1,000 years', 'It never becomes a medusa'], answer: 1, why: 'The reversal is real and remarkable, but in nature most are eaten or die of disease.' },
  ],
  reel: [
    { ms: 5400, caption: 'A jellyfish starts life as a polyp on a rock, which splits into a stack of baby jellies.', set: { turri: false, auto: false }, anim: { stage: [1.5, 4.6] }, view: { pos: [0.6, 2.6, 8.0], target: [0.3, 1.6, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const L = (h, p, c = '') => stage.label(h, p, root, c);
    // Path round the cycle.
    const path = []; for (let i = 0; i <= 96; i++) { const a = Math.PI / 2 - (i / 96) * Math.PI * 2; path.push([Math.cos(a) * RAD, 2.4 + Math.sin(a) * RAD * 0.5, -0.4]); }
    root.add(tube(path, 0.025, M.glow(0x4a6a8a), true, 200));
    const dot = sphere(0.12, M.glow(0xffb547)); root.add(dot);
    // Stage models
    const adult = new Jelly({ kind: 'moon', R: 0.75 }); adult.group.position.set(...posOf(0)); adult.group.position.y -= 0.1; root.add(adult.group);
    const plan = new THREE.Group(); const pb = sphere(0.18, M.plastic(0xffe2b8)); pb.scale.set(1, 1.6, 1); plan.add(pb);
    const hairs = []; for (let i = 0; i < 24; i++) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 4), M.glow(0xffffff)); const a = (i / 24) * Math.PI * 2, y = ((i % 6) / 5 - 0.5) * 0.4; h.position.set(Math.cos(a) * 0.19, y, Math.sin(a) * 0.19); h.rotation.z = Math.PI / 2; h.rotation.y = -a; plan.add(h); hairs.push(h); }
    plan.position.set(...posOf(1)); root.add(plan);
    const rock = (i) => { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), M.matte(0x5a5f6a, { flatShading: true })); r.scale.set(1.6, 0.5, 1.1); const p = posOf(i); r.position.set(p[0], p[1] - 0.75, p[2]); root.add(r); return r; };
    rock(2); rock(3);
    const polyps = []; for (let k = 0; k < 3; k++) { const p = polypMesh(); const b = posOf(2); p.position.set(b[0] - 0.45 + k * 0.45, b[1] - 0.55, b[2] + (k === 1 ? 0.2 : 0)); p.scale.setScalar(k === 1 ? 1 : 0.7); root.add(p); polyps.push(p); }
    const strob = new THREE.Group(); { const b = posOf(3); strob.position.set(b[0], b[1] - 0.55, b[2]); } root.add(strob);
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.06, 0.3, 12), M.plastic(0xffd8b0)); stalk.position.y = 0.15; strob.add(stalk);
    const discs = []; for (let k = 0; k < 7; k++) { const d = ephyraMesh(0.2); d.position.y = 0.35 + k * 0.13; d.userData.home = d.position.y; strob.add(d); discs.push(d); }
    const ephs = []; for (let k = 0; k < 3; k++) { const e = ephyraMesh(0.3); const b = posOf(4); e.position.set(b[0] + (k - 1) * 0.6, b[1] + (k % 2) * 0.35, b[2]); root.add(e); ephs.push(e); }
    const young = miniJelly(0xd8ecff, 0.45); young.position.set(...posOf(5)); root.add(young);
    // Turritopsis shortcut: a dashed red arc from medusa back to polyp.
    const tpts = []; for (let i = 0; i <= 30; i++) { const u = i / 30, a = posOf(0), b = posOf(2); tpts.push([a[0] + (b[0] - a[0]) * u - Math.sin(u * Math.PI) * 1.2, a[1] + (b[1] - a[1]) * u, 0.6 + Math.sin(u * Math.PI) * 0.8]); }
    const turri = tube(tpts, 0.04, M.glow(0xff5a8a), false, 60); root.add(turri);
    const tl = L('Turritopsis: medusa back to polyp (lab)', [0, 0, 0], 'hot');
    const labels = STAGES.map((st, i) => { const p = posOf(i), out = [p[0] * 1.32, 2.4 + (p[1] - 2.4) * 1.45 + (i === 0 ? 0.5 : i === 3 ? -0.5 : 0), 0]; return L(st.name, out); });
    const bud = L('Polyps bud off copies', [posOf(2)[0], posOf(2)[1] - 1.25, 0]);
    let t = 0, st = 0;
    const fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView();
        if (s.auto) { s.stage = (s.stage + dt * 0.25) % 6; }
        st = s.stage;
        const i = Math.floor(st), k = st - i;
        const a0 = ANG(st);
        dot.position.set(Math.cos(a0) * RAD, 2.4 + Math.sin(a0) * RAD * 0.5, -0.4);
        const nar = layoutOf(stage) === 'narrow';
        labels.forEach((l, j) => { l.element.classList.toggle('hot', j === i); l.visible = !nar || j === i; });
        adult.pose(pulseShape(t * 0.4), t);
        plan.rotation.y += dt * 1.5; plan.position.y = posOf(1)[1] + Math.sin(t * 2) * 0.08;
        hairs.forEach((h, j) => { h.rotation.x = Math.sin(t * 12 + j) * 0.4; });
        polyps.forEach((p, j) => { p.userData.tents.rotation.y = Math.sin(t * 0.7 + j) * 0.2; });
        // Strobila: discs lift off one by one while in stages 3–4.
        const rel = i === 3 ? k : i === 4 ? 1 : 0;
        discs.forEach((d, j) => {
          const order = (6 - j) / 7, go = clamp((rel - order) * 4, 0, 1);
          d.position.y = d.userData.home + go * 1.6; d.position.x = go * 0.6 * (j % 2 ? 1 : -1); d.rotation.y = t * go;
          d.children[0].material.opacity = 0.8 * (1 - go * 0.9);
        });
        ephs.forEach((e, j) => { e.rotation.y = t * 0.4 + j; const sq = pulseShape(t * 0.9 + j * 0.3); e.scale.set(1 - 0.2 * sq, 1, 1 - 0.2 * sq); });
        const sq = pulseShape(t * 0.6); young.scale.set(1 - 0.15 * sq, 1 + 0.08 * sq, 1 - 0.15 * sq);
        turri.visible = s.turri; tl.visible = s.turri && layoutOf(stage) !== 'narrow';
        tl.position.set(tpts[15][0] - 0.4, tpts[15][1] + 0.3, tpts[15][2]);
        bud.visible = layoutOf(stage) !== 'narrow';
      },
      readout: (s) => {
        const S = STAGES[Math.floor(s.stage)];
        return `<div class="big">${S.name}</div>
          <div class="row"><span>Size</span><b>${S.size}</b></div>
          <div class="row"><span>What happens</span><b></b></div><div>${S.what}</div>
          <small>Moon jelly (Aurelia). Sizes are typical and vary a lot with species and food.</small>`;
      },
    };
  },
};
