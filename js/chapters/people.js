// Chapter 5: jellyfish and people. Three scenes:
// 1. India's coasts (a sketch map from approximate coastal coordinates) and a net full of jellies.
//    - Southern Kerala: a CMFRI survey 2017–21 at Vizhinjam found 12 scyphozoan species plus a box
//      jelly and a hydrozoan; Crambionella swarms in Oct–Nov reached 200–800 per net, Chrysaora
//      thousands per haul; the season runs July to January (Surya et al. 2025, J Mar Biol Assoc India
//      67: 70; CMFRI eprint 19467).
//    - Andhra Pradesh: a fishery for one species, Crambionella annandalei, landed about 55,181 t in
//      2017–19, peaking at 33,273 t in 2018; processed oral arms are exported, mainly to China
//      (Behera et al. 2020, Ocean & Coastal Management 191; CMFRI eprint 14168).
//    - India landed 11,756 t of jellyfish in 2021 (CMFRI director, PTI report, 24 Nov 2023).
//    - Gulf of Kutch: Catostylus perezi and Rhopilema hispidum swarms, fished with scoop nets (ICAR
//      record "Jellyfish fisheries along the Gujarat coast"; read as a search summary).
//    - Gulf of Mannar and Palk Bay: many species, including Lobonemoides robustus and the invasive
//      Phyllorhiza punctata (CMFRI eprints 19790, 19468; search summaries).
//    - Kalpakkam: jellyfish swarms entering the cooling-water system of the Madras Atomic Power Station
//      forced a shutdown (Masilamoni et al. 2000, Curr Sci 79: 567, abstract); a later study at the
//      same plant found jellyfish were about 135.6 t a year, about 95% of the weight of all animals
//      caught on its intake screens (Mar Pollut Bull 2017, 124: 555).
//    - Mumbai and Goa: bluebottles (Portuguese man o' war, Physalia) wash up in the monsoon; city
//      officials and lifeguards issue warnings (news reports). NOAA: the man o' war is a siphonophore,
//      a colony of zooids, not a true jellyfish.
//    Blooms and their causes: Purcell 2012 (Annu Rev Mar Sci 4: 209) lists fishing, nutrient
//    pollution, new hard surfaces, introduced species, aquaculture and climate as suspects, with direct
//    evidence lacking for most; Condon et al. 2013 (PNAS 110: 1000) found no robust sign of a global
//    long-term rise, but ~20-year swings and regional increases.
// 2. A cooling-water intake: the clogging model is illustrative (flow falls as screens fill).
// 3. Stings: first aid quoted from ANZCOR Guideline 9.4.5 (2025), Healthdirect Australia (reviewed
//    Oct 2024) and the NHS page "Jellyfish and other sea creature stings". Nothing else is suggested.
import { THREE, M, approach, clamp, box, tube, sphere } from '../kit.js';
import { miniJelly, board, panel, head, txt, wrap, COL, layoutOf, reelZoom, focuser, viewFixer, fitBoard, inReel } from '../jelly.js';

const VIEWS = {
  india: { pos: [1.0, 3.6, 10.2], target: [1.0, 3.2, 0], narrow: { pos: [-1.6, 3.4, 5.8], target: [-1.6, 2.8, 0] } },
  intake: { pos: [1.0, 4.6, 10.5], target: [0.6, 2.2, 0], narrow: { pos: [0.4, 4.2, 7.5], target: [0.4, 1.8, 0] } },
  sting: { pos: [1.6, 3.6, 8.8], target: [1.6, 2.4, 0], narrow: { pos: [-1.0, 3.0, 5.2], target: [-1.0, 1.6, 0] } },
};
// Coast of peninsular India, west to east, as [longitude °E, latitude °N] (approximate).
const COAST = [[68.4, 23.5], [69.6, 22.9], [70.2, 22.6], [69.1, 22.3], [69.6, 21.6], [70.4, 20.9], [71.4, 20.7], [72.2, 21.2], [72.6, 22.2], [72.7, 21.3], [72.9, 20.2], [72.8, 19.0], [73.0, 18.0], [73.3, 17.0], [73.7, 15.8], [73.8, 15.4], [74.4, 14.4], [74.8, 12.9], [75.4, 11.9], [75.8, 11.2], [76.2, 9.9], [76.9, 8.5], [77.5, 8.1], [78.1, 8.6], [78.2, 8.9], [79.2, 9.3], [79.0, 9.6], [79.3, 10.2], [79.8, 10.3], [79.85, 11.0], [79.85, 11.9], [80.2, 12.6], [80.3, 13.1], [80.15, 14.2], [80.1, 15.2], [80.9, 15.8], [81.2, 16.3], [82.3, 16.9], [83.3, 17.7], [84.2, 18.4], [84.9, 19.3], [85.8, 19.8], [86.6, 20.2], [86.8, 20.8], [87.5, 21.6], [88.2, 21.6], [89.1, 21.8]];
const PLACES = [
  { n: 1, ll: [69.9, 22.7], name: 'Gulf of Kutch', note: 'swarms of Catostylus and Rhopilema, fished with scoop nets' },
  { n: 2, ll: [72.8, 19.0], name: 'Mumbai', note: 'bluebottles wash up on beaches in the monsoon' },
  { n: 3, ll: [73.8, 15.4], name: 'Goa', note: 'lifeguards warn of Portuguese man o’ war' },
  { n: 4, ll: [76.99, 8.38], name: 'Vizhinjam, Kerala', note: 'CMFRI: 12 kinds of jelly; up to 800 in one net' },
  { n: 5, ll: [79.1, 9.1], name: 'Gulf of Mannar, Palk Bay', note: 'many species, one of them invasive' },
  { n: 6, ll: [80.17, 12.53], name: 'Kalpakkam', note: 'swarms in the cooling water shut a power plant' },
  { n: 7, ll: [82.4, 16.9], name: 'Andhra Pradesh coast', note: '55,000 t landed in 2017–19 for export' },
];
const AID = {
  box: { title: 'Box jellyfish or other tropical sting', src: 'ANZCOR Guideline 9.4.5 (2025), Healthdirect Australia', steps: ['Get the person out of the water and call for emergency help (in India, 112 or 108).', 'If a box jellyfish could be the cause: pour vinegar on the sting for 30 seconds, then pick off any tentacles.', 'If they stop breathing normally, start CPR.', 'A cold pack can ease the pain. Go to hospital.'], dont: 'Do not rinse with fresh water: it can fire more stinging cells.' },
  blue: { title: 'Bluebottle (Portuguese man o’ war)', src: 'ANZCOR Guideline 9.4.5 (2025), Healthdirect Australia', steps: ['Do not put vinegar on it.', 'Pick off any tentacles and rinse well with sea water, not fresh water.', 'Put the stung part in hot water, about 45 °C (comfortably hot, test it first), for 20 minutes.', 'If hot water is not available, use ice. Get medical help if the pain or swelling is bad.'], dont: 'Even dead bluebottles on the beach can sting.' },
  nhs: { title: 'Any sea sting (NHS, UK)', src: 'NHS: Jellyfish and other sea creature stings', steps: ['Get help from a lifeguard or first-aider.', 'Rinse with sea water, not fresh water. Remove spines or tentacles with tweezers or the edge of a card.', 'Soak in very warm water, as hot as can be tolerated, for at least 30 minutes.', 'Call emergency help for trouble breathing, chest pain, a fit, severe swelling or fainting.'], dont: 'Do not pee on it, put ice on it, touch it with bare hands, or cover the wound.' },
};
const px = (ll, w) => [40 + ((ll[0] - 67.5) / 22.5) * (w - 80), 92 + ((24.5 - ll[1]) / 17.5) * 430];

export default {
  id: 'people',
  short: 'Jellyfish and people',
  title: 'Blooms, stings and dinner',
  subtitle: 'From clogged nets and power plants to beach warnings and the dinner plate.',
  view: VIEWS.india,
  learn: `<p>Sometimes jellyfish turn up in enormous numbers: a <b>bloom</b> or <b>swarm</b>. On India’s coasts, scientists at the <b>CMFRI</b> (Central Marine Fisheries Research Institute) track them. Off southern Kerala they found a dozen kinds of jellyfish, with swarms of up to <b>800 in a single net</b> in October and November. Fishers lose time and nets; the stings itch.</p>
    <p>Blooms also hit power stations that cool themselves with sea water. Jellies are sucked against the intake screens and block the flow. At the <b>Madras Atomic Power Station</b> at Kalpakkam, swarms once forced a shutdown, and a later study found jellyfish made up about 95% of everything caught on its screens.</p>
    <p>Are blooms getting worse because of us? Scientists suspect overfishing (fewer fish eating the same food), nutrient pollution, warmer water and new piers and walls where polyps can settle. But the evidence is <b>debated</b>: a big 2013 study found no clear worldwide rise, rather swings over about 20 years, with increases in some regions.</p>
    <p>People also <b>eat</b> jellyfish, mostly in China, Japan, Korea and Southeast Asia, salted and dried, crunchy in salads. India now has its own jellyfish fishery for export: about <b>55,000 tonnes</b> of one species were landed on the Andhra Pradesh coast in 2017–19.</p>
    <p>And jellies <b>sting</b>. Most stings hurt but are harmless; a few, like some box jellyfish, are dangerous. The <b>bluebottle</b> that washes up on Mumbai and Goa beaches in the monsoon is not even a true jellyfish but a <b>siphonophore</b>, a colony of tiny animals working as one. First aid differs by kind, so follow official advice, and get medical help for any bad sting.</p>
    <p class="tip"><b>Try it:</b> fill the net, then turn up the bloom at the power plant. In “Stings”, compare what official first aid says for each kind.</p>`,
  terms: [
    { t: 'Bloom', d: 'A sudden, very large number of jellyfish in one area.' },
    { t: 'CMFRI', d: 'India’s Central Marine Fisheries Research Institute, in Kochi, which studies sea life and fisheries.' },
    { t: 'Cooling-water intake', d: 'The opening where a coastal power plant draws in sea water to cool its machines.' },
    { t: 'Siphonophore', d: 'A colony of small animals that works like one, such as the Portuguese man o’ war.' },
    { t: 'Envenomation', d: 'Venom getting into the body, for example from a sting.' },
  ],
  defaults: { focus: 'india', haul: 300, bloom: 0.4, kind: 'box' },
  onChange(s, key) { if (key === 'haul') s.focus = 'india'; if (key === 'bloom' || key === 'action') s.focus = 'intake'; if (key === 'kind') s.focus = 'sting'; },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'india', label: 'India’s coasts' }, { v: 'intake', label: 'Power plant' }, { v: 'sting', label: 'Stings' }] },
    { key: 'haul', type: 'range', label: 'Jellyfish in the net', min: 0, max: 900, step: 10, fmt: (v) => v + ' jellies' },
    { key: 'bloom', type: 'range', label: 'Bloom at the power plant', min: 0, max: 1, step: 0.01, ends: ['none', 'huge swarm'], fmt: (v) => (v < 0.15 ? 'a few' : v < 0.5 ? 'many' : v < 0.8 ? 'a swarm' : 'a huge swarm') },
    { key: 'clean', type: 'buttons', label: 'Intake screens', items: [{ label: 'Clean the screens', act: (s, inst) => inst.clean?.() }] },
    { key: 'kind', type: 'seg', label: 'First aid for', options: [{ v: 'box', label: 'Box jelly' }, { v: 'blue', label: 'Bluebottle' }, { v: 'nhs', label: 'NHS advice' }] },
  ],
  quiz: [
    { q: 'How can a jellyfish bloom shut down a coastal power plant?', options: ['Jellies eat the cables', 'Jellies block the screens that let in cooling sea water', 'Their stings hurt the workers', 'They make the sea too salty'], answer: 1, why: 'Plants draw in sea water for cooling. Masses of jellies clog the intake screens, so less water gets through.' },
    { q: 'Are jellyfish blooms definitely increasing all over the world?', options: ['Yes, everywhere', 'The evidence is debated: some regions show increases, but a 2013 study found no clear global rise', 'No, jellyfish are disappearing', 'Nobody has studied it'], answer: 1, why: 'Overfishing, pollution and warming are suspects, but long records show swings over decades and regional differences.' },
    { q: 'What do official first-aid guides say about vinegar?', options: ['Use it on every sting', 'Use it for box jellyfish stings, but not for bluebottle stings', 'Never use it on any sting', 'Mix it with fresh water'], answer: 1, why: 'Australian guidelines use vinegar for tropical box jellyfish stings, but say not to put vinegar on bluebottle stings. Fresh water should not be used.' },
  ],
  reel: [
    { ms: 5200, caption: 'Off southern Kerala, jellyfish swarms can fill a net with hundreds at a time.', set: { focus: 'india' }, anim: { haul: [80, 800] }, view: { pos: [-0.6, 3.6, 7.5], target: [-1.2, 2.2, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const G = { india: new THREE.Group(), intake: new THREE.Group(), sting: new THREE.Group() };
    for (const k in G) root.add(G[k]);
    const L = (h, p, par, c = '') => stage.label(h, p, par, c);
    let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

    // ---------------------------------------------------------------- India: map + net
    const map = board(G.india, 3.4, 4.5, 620, 820, (g, w, h) => {
      panel(g, w, h); head(g, 'Jellyfish on India’s coasts', 'Sketch of the coastline; places from CMFRI and news reports');
      g.strokeStyle = '#6cc4ff'; g.lineWidth = 3; g.beginPath(); COAST.forEach((ll, i) => { const [x, y] = px(ll, w, h); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      txt(g, 'Arabian Sea', 60, 420, 'rgba(108,196,255,.6)', 'italic 20px sans-serif'); txt(g, 'Bay of Bengal', 420, 420, 'rgba(108,196,255,.6)', 'italic 20px sans-serif');
      for (const p of PLACES) { const [x, y] = px(p.ll, w, h); g.fillStyle = COL.hot; g.beginPath(); g.arc(x, y, 13, 0, 7); g.fill(); txt(g, String(p.n), x - 6, y + 6, '#111', 'bold 17px sans-serif'); }
      let y = 560; for (const p of PLACES) { y = wrap(g, `${p.n}. ${p.name}: ${p.note}`, 22, y, w - 40, 24, COL.text, '18px sans-serif') - 1; }
    }, [3.6, 2.8, -0.5]);
    // Net: a hanging bag of mesh, filled with jellies.
    const net = new THREE.Mesh(new THREE.SphereGeometry(1.5, 18, 12, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65), new THREE.MeshBasicMaterial({ color: 0xd8c08a, wireframe: true, transparent: true, opacity: 0.55 }));
    net.position.set(-1.6, 3.0, 0); G.india.add(net);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.5 * Math.sin(Math.PI * 0.35), 0.04, 6, 40), M.matte(0x8a6a3a)); rim.rotation.x = Math.PI / 2; rim.position.set(-1.6, 3.0 + 1.5 * Math.cos(Math.PI * 0.35), 0); G.india.add(rim);
    const NJ = 60, catchJ = [];
    for (let i = 0; i < NJ; i++) { const j = miniJelly(i % 3 ? 0xf0d9a8 : 0xd8a8ff, 0.16); const r = 1.25 * Math.cbrt(rnd()), th = rnd() * Math.PI * 2, ph = Math.PI * 0.55 + rnd() * Math.PI * 0.42; j.position.set(-1.6 + r * Math.sin(ph) * Math.cos(th), 3.0 + r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)); j.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); G.india.add(j); catchJ.push(j); }
    const rope = tube([[-1.6, 3.9, 0], [-1.6, 5.4, 0]], 0.03, M.matte(0x8a6a3a)); G.india.add(rope);
    const il = { net: L('A fishing net in a swarm', [-1.6, 1.25, 0], G.india, 'hot') };

    // ---------------------------------------------------------------- intake: sea → screen → pump house
    const sea = box(5, 2.4, 3.2, M.clear(0x2f86c8, 0.25)); sea.position.set(-3.6, 1.2, 0); G.intake.add(sea);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 3.6, 24, 1, true), M.clear(0xcfe8ff, 0.25)); pipe.rotation.z = Math.PI / 2; pipe.position.set(0.2, 1.0, 0); G.intake.add(pipe);
    const screenGrp = new THREE.Group(); screenGrp.position.set(2.1, 1.0, 0); G.intake.add(screenGrp);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 1.6), new THREE.MeshBasicMaterial({ color: 0x9fb2bd, wireframe: true })); screenGrp.add(frame);
    const house = box(2.2, 2.4, 2.4, M.matte(0x56606e)); house.position.set(3.4, 1.2, 0); G.intake.add(house);
    const turb = sphere(0.35, M.metal(0xd0d6de)); turb.position.set(3.4, 2.8, 0); G.intake.add(turb);
    const NI = 40, flow = [];
    for (let i = 0; i < NI; i++) { const j = miniJelly(0xf0d9a8, 0.14); j.userData = { ...j.userData, x: -5.5 + rnd() * 5, y: 0.4 + rnd() * 1.4, z: -1.2 + rnd() * 2.4, stuck: false, sy: 0.4 + rnd() * 1.2, sz: -0.6 + rnd() * 1.2 }; G.intake.add(j); flow.push(j); }
    const wl = { sea: L('Sea', [-3.6, 2.7, 0], G.intake), screen: L('Intake screen', [2.1, 2.2, 0], G.intake, 'hot'), plant: L('Pumps and cooling system', [3.4, 3.5, 0], G.intake) };

    // ---------------------------------------------------------------- sting: skin block + tentacle + first-aid board
    const skin = new THREE.Group(); skin.position.set(-1.0, 1.4, 0); G.sting.add(skin);
    const layers = [[0.18, 0xf2c7a5], [0.6, 0xe8a58d], [0.5, 0xf5e0b0]]; let yy = 0;
    layers.forEach(([hh, c]) => { const b = box(3.2, hh, 2.0, M.matte(c)); b.position.y = -yy - hh / 2; skin.add(b); yy += hh; });
    const tent = tube([[-1.6, 0.25, -0.6], [-0.6, 0.18, 0.1], [0.4, 0.22, -0.2], [1.6, 0.2, 0.5]], 0.09, M.clear(0xe6d8ff, 0.7));
    skin.add(tent);
    const threads = []; for (let i = 0; i < 14; i++) { const u = i / 13, x = -1.5 + 3.0 * u; const t = tube([[x, 0.15, -0.5 + u * 0.9], [x + 0.05, -0.3, -0.45 + u * 0.9], [x - 0.05, -0.65, -0.4 + u * 0.9]], 0.012, M.glow(0xff7a59), false, 12); t.geometry.userData.n = t.geometry.index.count; skin.add(t); threads.push(t); }
    const aid = board(G.sting, 3.6, 3.4, 640, 600, (g, w, h, k = 'box') => {
      panel(g, w, h); const A = AID[k];
      head(g, A.title, A.src);
      let y = 104; A.steps.forEach((st, i) => { y = wrap(g, `${i + 1}. ${st}`, 24, y, w - 48, 25, COL.text, '19px sans-serif') + 6; });
      y = wrap(g, A.dont, 24, y + 4, w - 48, 25, COL.down, 'bold 19px sans-serif');
      wrap(g, 'This is a summary of official guidance, not medical advice. If in doubt, get medical help.', 24, h - 46, w - 48, 22, COL.soft, '16px sans-serif');
    }, [2.9, 2.6, 0]);
    const sl = { tent: L('Tentacle touching skin', [-1.0, 2.2, 0], G.sting), thread: L('Threads fire venom into the skin', [-1.0, 0.0, 1.2], G.sting, 'hot') };

    const focus = focuser(stage, G, VIEWS);
    const fixView = viewFixer(stage, this.view);
    let t = 0, clog = 0, aidK = '', sting = 0;
    focus('india', true);
    const inst = {
      clean() { clog = 0; flow.forEach((j) => { j.userData.stuck = false; j.userData.x = -5.5 + rnd() * 3; }); },
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.35); fixView();
        focus(s.focus);
        const lay = layoutOf(stage), narrow = lay === 'narrow';
        if (s.focus === 'india') {
          const n = Math.round((s.haul / 900) * NJ);
          catchJ.forEach((j, i) => { j.visible = i < n; j.userData.bell.scale.y = 1 + 0.1 * Math.sin(t * 2 + i); });
          if (narrow) map.mesh.visible = false; else fitBoard(stage, map.mesh, lay === 'tall' ? [-1.4, 6.6, -0.5] : [3.2, 2.9, -0.5], lay === 'tall' ? 0.8 : 1);
        }
        if (s.focus === 'intake') {
          // Flow through the screen falls as it clogs (illustrative).
          const q = 1 - 0.85 * clog;
          let stuck = 0;
          flow.forEach((j) => {
            const u = j.userData;
            j.visible = (flow.indexOf(j) / NI) < s.bloom + 0.05 || u.stuck;
            if (!j.visible) return;
            if (u.stuck) { stuck++; j.position.set(2.0, 1.0 + (u.sy - 1.0) * 1.1, u.sz); return; }
            u.x += dt * 1.6 * q;
            const inPipe = u.x > -1.6;
            j.position.set(u.x, inPipe ? 1.0 + (u.sy - 1.0) * 0.7 : u.y, inPipe ? u.sz * 0.7 : u.z);
            if (u.x > 1.95) { if (Math.random() < 0.6 * s.bloom + 0.15) u.stuck = true; else u.x = -5.5; }
          });
          clog = clamp(stuck / (NI * 0.7), 0, 1);
          turb.rotation.y += dt * 3 * q;
        }
        if (s.focus === 'sting') {
          if (aidK !== s.kind) { aid.redraw(s.kind); aidK = s.kind; }
          sting = (sting + dt * 0.5) % 1.4;
          threads.forEach((th, i) => { const k = clamp((sting - i * 0.03) * 3, 0, 1); th.geometry.setDrawRange(0, Math.floor((th.geometry.userData.n * k) / 6) * 6); });
          if (narrow) aid.mesh.visible = false; else fitBoard(stage, aid.mesh, lay === 'tall' ? [-0.6, 5.6, 0] : [2.9, 2.6, 0], lay === 'tall' ? 0.85 : 1);
          sl.thread.visible = !narrow;
        }
      },
      readout: (s) => {
        if (s.focus === 'india') return `<div class="big">${s.haul} jellies in one haul</div>
          <div class="row"><span>Southern Kerala swarms</span><b>200–800 per net (Oct–Nov)</b></div>
          <div class="row"><span>Jellyfish season there</span><b>July to January</b></div>
          <div class="row"><span>India’s jellyfish landings, 2021</span><b>11,756 tonnes</b></div>
          <div class="row"><span>Andhra Pradesh, 2017–19</span><b>about 55,000 tonnes, one species</b></div>
          <small>CMFRI surveys (Surya et al. 2025; Behera et al. 2020) and CMFRI figures reported in 2023.</small>`;
        if (s.focus === 'intake') { const q = 1 - 0.85 * clog; return `<div class="big">Cooling-water flow ${Math.round(q * 100)}%</div>
          <div class="row"><span>Screens blocked</span><b>${Math.round(clog * 100)}%</b></div>
          <div class="row"><span>Plant</span><b class="${q < 0.5 ? 'no' : 'ok'}">${q < 0.5 ? 'must cut power or shut down' : 'running'}</b></div>
          <div class="row"><span>Kalpakkam, per year</span><b>about 136 t of jellies on the screens</b></div>
          <small>Clogging here is an illustration. Kalpakkam figures: Masilamoni et al. 2000; Mar Pollut Bull 2017 (jellies ≈ 95% of the weight caught).</small>`; }
        return `<div class="big">${AID[s.kind].title}</div>
          <div class="row"><span>Emergency in India</span><b>112, or 108 for an ambulance</b></div>
          <div class="row"><span>Fresh water</span><b class="no">no: rinse with sea water</b></div>
          <div class="row"><span>Vinegar</span><b>${s.kind === 'box' ? 'yes, 30 seconds (box jellyfish)' : s.kind === 'blue' ? 'no' : 'not mentioned by the NHS'}</b></div>
          <small>From ${AID[s.kind].src}. Not medical advice.</small>`;
      },
    };
    return inst;
  },
};
