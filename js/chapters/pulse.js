// Chapter 2: the pulse. The coronal muscle squeezes the bell and pushes water out under the rim; the
// springy mesoglea pops the bell open again with no muscle at all. Flat (oblate) bells "row": big
// swirls form at the rim and, as the bell refills, a second ring of opposite spin (the stopping vortex)
// sits under the bell and gives a free extra push. Tall (prolate) bells jet: a velum narrows the opening
// into a fast jet. Speed, cost of transport and the stopping-vortex bonus come from swimModel() in
// jelly.js (a labelled toy model; see the sources there: Colin & Costello 2002, Dabiri et al. 2005,
// Gemmell et al. 2013, Xu & Dabiri 2020). The jelly is 8 cm across in every shape, so you compare like
// with like. Picture slowed down when it beats faster than once a second.
import { THREE, M, approach, clamp, arrow } from '../kit.js';
import { Jelly, pulseShape, swimModel, COT_MOON, vortexRing, makeSpecks, board, panel, head, txt, COL, layoutOf, fitBoard, reelZoom, viewFixer } from '../jelly.js';

const R = 1.3, Y0 = 2.6, D = 0.08, SC = (2 * R) / D;   // scene units per metre
const shapeName = (F) => (F < 0.45 ? 'flat (oblate)' : F < 0.65 ? 'in between' : 'tall (prolate)');

export default {
  id: 'pulse',
  short: 'The pulse',
  title: 'Squeeze, spring back, glide',
  subtitle: 'One ring of muscle, a springy bell and two rings of swirling water.',
  view: { pos: [2.0, 3.4, 8.2], target: [1.9, 2.9, 0], narrow: { pos: [0.2, 3.0, 5.8], target: [0.2, 2.6, 0] } },
  learn: `<p>A jellyfish swims by <b>pulsing</b>. The ring of muscle under the bell <b>squeezes</b>, the bell narrows, and water is pushed out under the rim. Push water back and you go forward: Newton’s third law again.</p>
    <p>Then the muscle simply lets go. The <b>mesoglea</b> is springy, like a rubber ball, so the bell <b>springs back</b> open on its own and refills with water. The muscle only ever pulls one way.</p>
    <p>Jellyfish do this in two styles. Tall, bullet-shaped jellies such as box jellies and many small hydromedusae are <b>jetters</b>: a shelf of skin called the <b>velum</b> narrows the opening, so the water squirts out fast, like a squid. They are quick, but a fast jet wastes a lot of energy.</p>
    <p>Flat jellies like the moon jelly are <b>rowers</b>. Each squeeze throws off a ring-shaped swirl, a <b>vortex ring</b>, from the rim. As the bell springs open, a second ring spinning the other way, the <b>stopping vortex</b>, forms under the bell and pushes it along for free. A 2013 study found this lets moon jellies go about <b>30% further</b> per beat, and that their energy cost to travel is lower than that of other animals measured. A salmon spends at least 3.5 times as much.</p>
    <p>A fish makes thrust differently, with a wave down its body and a zigzag of swirls (see <a href="/fishswimclear/">FishSwimClear</a>). A jelly’s rings come out one behind the other, in a line.</p>
    <p class="tip"><b>Try it:</b> make the bell flat and watch the blue stopping vortex. Then make it tall: it goes faster, but watch the cost climb.</p>`,
  terms: [
    { t: 'Pulse', d: 'One squeeze and spring-back of the bell.' },
    { t: 'Vortex ring', d: 'A doughnut of spinning water, like a smoke ring, shed by each pulse.' },
    { t: 'Stopping vortex', d: 'A ring of opposite spin that forms under the bell as it refills and gives a free push.' },
    { t: 'Jet propulsion', d: 'Squirting water out fast through a narrow opening, used by tall jellies.' },
    { t: 'Rowing', d: 'Pushing a large amount of water slowly with a flat bell’s flexible rim, used by moon jellies.' },
    { t: 'Cost of transport', d: 'The energy needed to move one kilogram of animal one metre. Lower is more efficient.' },
    { t: 'Velum', d: 'A ring-shaped shelf inside the rim of some jellies that narrows the jet.' },
  ],
  defaults: { F: 0.3, f: 0.4, c: 0.3, rings: true },
  controls: [
    { key: 'F', type: 'range', label: 'Bell shape (height ÷ width)', min: 0.2, max: 1.2, step: 0.01, ends: ['flat, like a moon jelly', 'tall, like a bullet'], fmt: (v) => `${v.toFixed(2)}: ${shapeName(v)}` },
    { key: 'f', type: 'range', label: 'Pulses per second', min: 0.2, max: 1.5, step: 0.01, fmt: (v) => v.toFixed(2) + ' Hz', hint: 'Grown moon jellies often beat about once every 3 to 8 seconds; small ones beat faster.' },
    { key: 'c', type: 'range', label: 'How hard it squeezes', min: 0.1, max: 0.45, step: 0.01, fmt: (v) => `rim narrows ${Math.round(v * 100)}%` },
    { key: 'rings', type: 'toggle', label: 'Show the vortex rings' },
  ],
  quiz: [
    { q: 'What opens the bell again after the muscle squeezes?', options: ['A second muscle', 'The springy jelly (mesoglea) bouncing back', 'Water pressure from the stomach', 'The tentacles pulling'], answer: 1, why: 'Jellyfish have only one swimming muscle. The elastic mesoglea springs the bell back open for free.' },
    { q: 'What is the stopping vortex?', options: ['A whirlpool that traps prey', 'A ring of spinning water under the bell that gives a second, free push', 'The jet from a box jelly', 'A current that stops the jelly'], answer: 1, why: 'As the bell refills, a ring of opposite spin forms underneath and pushes on the bell, so flat jellies glide further per beat.' },
    { q: 'Why do tall, jetting jellies spend more energy than flat, rowing ones?', options: ['They are heavier', 'They push a small amount of water very fast, which wastes energy', 'They have no muscle', 'They swim upside down'], answer: 1, why: 'For the same push, throwing a little water fast costs far more energy than moving lots of water slowly.' },
  ],
  reel: [
    { ms: 5200, caption: 'One ring of muscle squeezes the bell, and the springy jelly pops it open again.', set: { F: 0.3, c: 0.3, rings: false }, anim: { f: [0.4, 0.7] }, view: { pos: [0.2, 2.6, 6.6], target: [0, 2.3, 0] }, spin: 0 },
    { ms: 5600, caption: 'As the bell refills, a second swirl under it gives a moon jelly a free push.', set: { F: 0.28, f: 0.5, c: 0.32, rings: true }, anim: {}, view: { pos: [0.2, 1.4, 6.6], target: [0, 1.9, 0] }, spin: 0 },
    { ms: 5400, caption: 'Tall jellies jet: faster, but a narrow, fast jet costs far more energy.', set: { f: 0.8, c: 0.3, rings: true }, anim: { F: [0.3, 1.05] }, view: { pos: [0.2, 2.2, 7.0], target: [0, 2.2, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const jel = { row: new Jelly({ kind: 'moon', R, F: 0.3 }), jet: new Jelly({ kind: 'prolate', R, F: 0.9 }) };
    const holder = new THREE.Group(); holder.position.y = Y0; root.add(holder);
    for (const k in jel) holder.add(jel[k].group);
    const specks = makeSpecks(220, [-4, 4, -1, 7, -3, 3]); root.add(specks.mesh);
    const rings = [];
    for (let i = 0; i < 8; i++) { const r = vortexRing(i % 2 ? 0x6cc4ff : 0xff7a59); r.visible = false; root.add(r); rings.push(r); }
    const jet = arrow(0xffb547, 1, 0.3, 0.05); jet.rotation.z = Math.PI; root.add(jet);
    const go = arrow(0x5ce1a9, 1, 0.3, 0.05); root.add(go);
    const lbl = {
      muscle: stage.label('Muscle squeezes', [0, 0, 0], root, 'hot'), spring: stage.label('Jelly springs back', [0, 0, 0], root),
      start: stage.label('Starting vortex (thrown off)', [0, 0, 0], root, 'hot'), stop: stage.label('Stopping vortex: free push', [0, 0, 0], root),
      velum: stage.label('Velum narrows the jet', [0, 0, 0], root),
    };

    // Board: speed and cost against bell shape, at the current beat and squeeze.
    const cur = { F: 0.3, f: 0.5, c: 0.3, trace: [] };
    const chart = board(root, 4.4, 3.1, 720, 500, (g, w, h) => {
      panel(g, w, h);
      head(g, 'Flat rowers against tall jetters', '8 cm bell, same beat and squeeze');
      const x0 = 70, x1 = w - 30, y0 = 400, y1 = 95, X = (F) => x0 + (x1 - x0) * (F - 0.2) / 1.0;
      const pts = []; let uMax = 0, cMax = 0;
      for (let i = 0; i <= 50; i++) { const F = 0.2 + i / 50; const m = swimModel(F, cur.f, cur.c, D); pts.push([F, m.U, m.cot / COT_MOON]); uMax = Math.max(uMax, m.U); cMax = Math.max(cMax, m.cot / COT_MOON); }
      g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.moveTo(x0, y0); g.lineTo(x0, y1); g.stroke();
      g.fillStyle = 'rgba(108,196,255,.08)'; g.fillRect(x0, y1, X(0.45) - x0, y0 - y1);
      g.fillStyle = 'rgba(255,181,71,.08)'; g.fillRect(X(0.65), y1, x1 - X(0.65), y0 - y1);
      txt(g, 'rowing', x0 + 8, y1 + 20, COL.water, 'bold 17px sans-serif'); txt(g, 'jetting', x1 - 70, y1 + 20, COL.hot, 'bold 17px sans-serif');
      const line = (k, max, col) => { g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); pts.forEach((p, i) => { const x = X(p[0]), y = y0 - (y0 - y1 - 30) * p[k] / max; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); };
      line(1, uMax, COL.up); line(2, cMax, COL.down);
      const m = swimModel(cur.F, cur.f, cur.c, D), xs = X(cur.F);
      g.strokeStyle = '#fff'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(xs, y0); g.lineTo(xs, y1); g.stroke(); g.setLineDash([]);
      for (const [v, max, col] of [[m.U, uMax, COL.up], [m.cot / COT_MOON, cMax, COL.down]]) { g.fillStyle = col; g.beginPath(); g.arc(xs, y0 - (y0 - y1 - 30) * v / max, 9, 0, 7); g.fill(); }
      txt(g, 'flat', x0, y0 + 28, COL.soft, '17px sans-serif'); txt(g, 'bell shape →', X(0.62) - 40, y0 + 28, COL.soft, '17px sans-serif'); txt(g, 'tall', x1 - 34, y0 + 28, COL.soft, '17px sans-serif');
      txt(g, `● speed ${(m.U * 100).toFixed(1)} cm/s`, x0, y0 + 66, COL.up, 'bold 20px sans-serif');
      txt(g, `● cost ${(m.cot / COT_MOON).toFixed(1)}× a moon jelly`, x0 + 300, y0 + 66, COL.down, 'bold 20px sans-serif');
    }, [5.2, 2.6, -1.0]);
    let drawn = '';

    let ph = 0, prevP = 0, bob = 0, vb = 0, ri = 0, t = 0;
    const fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.35); fixView();
        const lay = layoutOf(stage);
        fitBoard(stage, chart.mesh, lay === 'tall' ? [0.2, 6.2, -1.0] : [5.0, 2.6, -1.2], lay === 'tall' ? 0.85 : 1);
        const slow = Math.min(1, 1 / s.f);
        ph += dt * s.f * slow;
        const phase = ph - Math.floor(ph), a = 0.33;
        const jetMode = s.F >= 0.55;
        jel.row.group.visible = !jetMode; jel.jet.group.visible = jetMode;
        const J = jetMode ? jel.jet : jel.row;
        J.F = s.F;
        const cDraw = clamp(s.c / 0.3, 0.3, 1.5) * pulseShape(ph, a);
        J.pose(cDraw, t);
        const m = swimModel(s.F, s.f, s.c, D);
        const Ud = m.U * SC * slow;                    // mean speed in scene units/s
        // Bob: kick during the squeeze, coast, and (rowers) a second small kick as the bell refills.
        const kick = phase < a ? Math.sin(Math.PI * phase / a) : 0;
        const kick2 = phase > a ? m.obl * 0.45 * Math.sin(Math.PI * clamp((phase - a) / 0.35, 0, 1)) : 0;
        const vInst = Ud * (0.35 + 1.9 * kick + 1.9 * kick2) / 1.0;
        vb = vInst - Ud; bob += vb * dt; bob *= Math.exp(-0.6 * dt);
        holder.position.y = Y0 + clamp(bob, -0.5, 0.5);
        specks.update(dt, () => [0, -Ud, 0]);
        // Vortex rings: a starting ring at the end of each squeeze; a stopping ring as the bell refills.
        const [rr, ry] = J.rimAt(J.c), H = s.F * 2 * R;
        const crossed = (x) => prevP < x && phase >= x || (prevP > phase && x < phase);
        if (crossed(a * 0.9)) {
          const r = rings[ri++ % rings.length]; r.visible = true;
          Object.assign(r.userData, { age: 0, life: jetMode ? 2.2 : 3.2, spin: 1, kind: 'start', r: jetMode ? rr * 0.55 : rr * 0.85, vy: -(jetMode ? 2.4 : 0.9) * Math.max(0.6, m.uj / 0.05) * slow * 0.5 - Ud });
          r.position.set(0, holder.position.y + ry - 0.15, 0); r.scale.setScalar(r.userData.r);
        }
        if (crossed(a + 0.12) && m.obl > 0.2) {
          const r = rings[ri++ % rings.length]; r.visible = true;
          Object.assign(r.userData, { age: 0, life: 1.6 / Math.max(0.4, s.f * slow), spin: -1, kind: 'stop', r: rr * 0.6, vy: 0 });
          r.scale.setScalar(r.userData.r);
        }
        prevP = phase;
        let sA = null, sS = null;
        for (const r of rings) {
          if (!r.visible) continue;
          const u = r.userData; u.age += dt;
          const k = 1 - u.age / u.life;
          if (k <= 0) { r.visible = false; continue; }
          if (u.kind === 'stop') { r.position.set(0, holder.position.y + ry + 0.12, 0); r.scale.setScalar(u.r * (0.8 + 0.3 * (1 - k))); sS = r; }
          else { r.position.y += u.vy * dt; r.scale.setScalar(u.r * (1 + 0.5 * (1 - k))); if (!sA || r.userData.age < sA.userData.age) sA = r; }
          u.mat.opacity = 0.85 * Math.min(1, k * 2) * (s.rings ? 1 : 0);
          r.spinUpdate(dt * slow);
          r.visible = s.rings && k > 0;
        }
        // Arrows: jet down during the squeeze, motion up.
        jet.position.set(0, holder.position.y + ry - 0.1, 0); jet.set(kick > 0.05 ? (jetMode ? 1.8 : 0.9) * kick : 0);
        go.position.set(0, holder.position.y + H + 0.25, 0); go.set(clamp(0.3 + vInst * 0.25, 0.3, 1.6));
        // Labels
        const narrow = lay === 'narrow';
        lbl.muscle.visible = phase < a; lbl.spring.visible = phase >= a && phase < 0.85;
        lbl.muscle.position.set(-rr - 0.3, holder.position.y + ry + 0.25, 0);
        lbl.spring.position.set(-rr - 0.3, holder.position.y + ry + 0.25, 0);
        lbl.velum.visible = jetMode && !narrow; lbl.velum.position.set(rr + 0.5, holder.position.y + ry - 0.05, 0);
        lbl.start.visible = !!sA && s.rings; if (sA) lbl.start.position.set(sA.scale.x + 0.9, sA.position.y, 0);
        lbl.stop.visible = !!sS && s.rings && !narrow; if (sS) lbl.stop.position.set(-sS.scale.x - 1.1, sS.position.y - 0.25, 0);
        cur.F = s.F; cur.f = s.f; cur.c = s.c;
        const key = [s.F, s.f, s.c].map((v) => v.toFixed(2)).join();
        if (key !== drawn) { chart.redraw(); drawn = key; }
      },
      readout: (s) => {
        const m = swimModel(s.F, s.f, s.c, D), slow = Math.min(1, 1 / s.f);
        return `<div class="big">${(m.U * 100).toFixed(1)} cm/s, ${m.mode}</div>
          <div class="row"><span>Bell widths a second</span><b>${(m.U / D).toFixed(2)}</b></div>
          <div class="row"><span>Water leaving the bell at</span><b>${(m.uj * 100).toFixed(0)} cm/s</b></div>
          <div class="row"><span>Free push from the stopping vortex</span><b>${m.bonus > 0.01 ? '+' + Math.round(m.bonus * 100) + '%' : 'none'}</b></div>
          <div class="row"><span>Energy cost to travel</span><b>${(m.cot / COT_MOON).toFixed(1)}× a moon jelly’s</b></div>
          <small>An 8 cm bell. Toy model: jet momentum against drag, +30% for flat bells after Gemmell et al. 2013. Use it to compare shapes, not as exact numbers.${slow < 1 ? ` Shown ${(1 / slow).toFixed(1)}× slower.` : ''}</small>`;
      },
    };
  },
};
