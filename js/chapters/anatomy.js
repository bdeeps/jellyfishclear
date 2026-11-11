// Chapter 1: inside a jellyfish. A generic moon jellyfish (Aurelia) cut open: the bell of mesoglea,
// the ring of swimming (coronal) muscle on its underside, gut pouches and canals running to the rim,
// four horseshoe gonads, eight rhopalia, a fringe of short tentacles and four frilly oral arms.
// Beside it, one stinging cell (cnidocyte) magnified, coiled and fired.
// Numbers:
//  - Water: Aurelia is about 96% water by wet weight (95.9–96.6% in 9 animals; Hyman 1937, Bull Mt
//    Desert Isl Biol Lab 3).
//  - Nematocyst discharge, measured in Hydra (a freshwater cnidarian polyp, not a jellyfish):
//    as short as 700 ns, acceleration up to 5,410,000 g, pressure at the tip over 7 GPa (Nüchter et
//    al. 2006, Curr Biol 16: R316, as reported in its press release); stylet impact speed 18.5–37.1 m/s
//    (BioNumbers 105579, citing the same paper). We show it slowed down by about two million.
//  - Aurelia has 8 rhopalia and hundreds of short marginal tentacles (we draw 128).
import { THREE, M, approach, clamp, latheX } from '../kit.js';
import { toast } from '../ui.js';
import { Jelly, pulseShape, layoutOf, reelZoom, viewFixer, makeSpecks } from '../jelly.js';

const R = 1.6, Y0 = 2.1;

const INFO = {
  bell: 'The <b>bell</b> (umbrella) is made of <b>mesoglea</b>: a clear jelly that is about 96% water, held together by stretchy fibres.',
  muscle: 'The <b>coronal muscle</b> is a single thin ring of muscle on the underside of the bell. It is the only swimming muscle.',
  gonad: 'The four horseshoe <b>gonads</b> make eggs or sperm. They give the moon jelly its four-leaf-clover look.',
  rho: 'Each <b>rhopalium</b> is a tiny sense club at the rim with a balance organ and a light-sensing spot. It also sets the beat.',
  arm: 'The frilly <b>oral arms</b> carry food from the tentacles to the mouth in the middle.',
  stomach: 'The <b>stomach</b> in the middle branches into <b>gut pouches</b> and canals that carry food out to the rim.',
};

// A stinging cell: capsule, lid, trigger hair, coiled thread and barbs.
function makeCnido() {
  const g = new THREE.Group();
  const cap = latheX([[0, 0], [0.08, 0.2], [0.3, 0.34], [0.6, 0.36], [0.85, 0.24], [0.98, 0.1], [1.0, 0.0]], M.clear(0xcfe8ff, 0.32, { emissive: 0x24445a }), { seg: 40 });
  cap.rotation.z = Math.PI / 2; cap.position.y = -0.5; g.add(cap);   // capsule stands upright, mouth on top
  const cell = new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 18), M.ghost(0xffb547, 0.12)); cell.scale.set(1, 1.15, 1); cell.position.y = 0; g.add(cell);
  const lid = new THREE.Group(); const lidM = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), M.plastic(0x9fd2ff, { side: THREE.DoubleSide })); lidM.rotation.x = -Math.PI / 2; lidM.position.x = 0.11; lid.add(lidM); lid.position.set(-0.11, 0.5, 0); g.add(lid);
  const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.5, 6), M.glow(0xffd84a)); hair.position.set(0.25, 0.75, 0); hair.rotation.z = -0.25; g.add(hair);
  // Coiled thread inside the capsule.
  const coilPts = []; for (let i = 0; i <= 160; i++) { const u = i / 160, a = u * 14 * Math.PI; coilPts.push(new THREE.Vector3(0.2 * Math.cos(a), -0.42 + 0.8 * u, 0.2 * Math.sin(a))); }
  const coilGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), 320, 0.018, 6, false);
  const coil = new THREE.Mesh(coilGeo, M.glow(0xff7a59)); g.add(coil);
  // The thread after firing: shoots straight out of the top, turning inside out as it goes.
  const outPts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; outPts.push(new THREE.Vector3(0.05 * Math.sin(u * 9), 0.5 + u * 2.0, 0.05 * Math.cos(u * 7))); }
  const outGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outPts), 120, 0.03, 6, false);
  const thread = new THREE.Mesh(outGeo, M.glow(0xff7a59)); g.add(thread);
  const barbs = new THREE.Group();
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.22, 6), M.glow(0xffd84a)); const a = (i % 3) * TAU3, y = 0.65 + Math.floor(i / 3) * 0.14; b.position.set(0.08 * Math.cos(a), y, 0.08 * Math.sin(a)); b.rotation.z = Math.cos(a) * 2.4; b.rotation.x = -Math.sin(a) * 2.4; barbs.add(b); }
  g.add(barbs);
  return { g, coil, thread, barbs, lid, coilN: coilGeo.index.count, outN: outGeo.index.count };
}
const TAU3 = (Math.PI * 2) / 3;

export default {
  id: 'anatomy',
  short: 'Inside a jellyfish',
  title: 'Inside a jellyfish',
  subtitle: 'A bell of jelly, one ring of muscle, a net of nerves and a skin full of stinging cells.',
  view: { pos: [1.9, 3.1, 7.9], target: [1.9, 2.5, 0], narrow: { pos: [0.4, 2.8, 5.6], target: [0.4, 2.2, 0] } },
  learn: `<p>Meet a <b>moon jellyfish</b> (<i>Aurelia</i>), a common jelly of coastal seas around the world. It has no bones, no brain, no heart and no blood. It is about <b>96% water</b>.</p>
    <p>The see-through <b>bell</b> (or umbrella) is made of <b>mesoglea</b>, a jelly stiffened with stretchy fibres. Under the bell runs a single thin ring of swimming muscle, the <b>coronal muscle</b>. Squeeze it and the bell narrows. Let go and the springy jelly pops it open again.</p>
    <p>Instead of a brain there is a <b>nerve net</b> spread through the skin. Around the rim sit eight <b>rhopalia</b>, tiny clubs that sense light and which way is down, and that set the rhythm of the beat.</p>
    <p>A fringe of short <b>tentacles</b> hangs from the rim and four frilly <b>oral arms</b> hang from the middle. The <b>mouth</b> leads to a stomach that branches into <b>gut pouches</b> and canals out to the rim. The four horseshoe shapes are the <b>gonads</b>, where eggs or sperm are made.</p>
    <p>The skin of the tentacles and arms is packed with <b>stinging cells</b> (cnidocytes). Each holds a capsule, the <b>nematocyst</b>, with a coiled, barbed thread inside. Touch the trigger hair and the thread shoots out, turning inside out as it goes. Measured in a close relative, the whole thing takes about <b>700 billionths of a second</b>, one of the fastest movements in nature.</p>
    <p class="tip"><b>Try it:</b> cut the bell open and take it apart, then fire a stinging cell. Tap a part of the jelly to hear what it does.</p>`,
  terms: [
    { t: 'Mesoglea', d: 'The springy jelly that makes up most of the bell. It is mostly water.' },
    { t: 'Coronal muscle', d: 'The single ring of swimming muscle under the bell.' },
    { t: 'Nerve net', d: 'A spread-out mesh of nerve cells instead of a brain.' },
    { t: 'Rhopalium', d: 'A tiny sense club at the bell’s rim that detects light and gravity and paces the beat.' },
    { t: 'Cnidocyte', d: 'A stinging cell. Jellyfish, corals and sea anemones are called cnidarians after them.' },
    { t: 'Nematocyst', d: 'The capsule inside a stinging cell, with a coiled thread that fires out when triggered.' },
  ],
  defaults: { cut: true, explode: 0, beat: true },
  controls: [
    { key: 'cut', type: 'toggle', label: 'Cut the bell open', hint: 'Remove a quarter of the bell to see inside.' },
    { key: 'explode', type: 'range', label: 'Take it apart', min: 0, max: 1, step: 0.01, ends: ['together', 'apart'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'beat', type: 'toggle', label: 'Gentle beating' },
    { key: 'fireBtn', type: 'buttons', label: 'Stinging cell', items: [{ label: 'Fire it', act: (s, inst) => inst.fire?.() }, { label: 'Reload', act: (s, inst) => inst.reload?.() }] },
  ],
  quiz: [
    { q: 'What is the bell of a moon jellyfish mostly made of?', options: ['Muscle', 'Bone', 'A jelly called mesoglea that is mostly water', 'Fat'], answer: 2, why: 'The mesoglea is a springy jelly, and the whole animal is about 96% water.' },
    { q: 'What does a jellyfish have instead of a brain?', options: ['Nothing at all', 'A nerve net and small sense clubs at the rim', 'A spinal cord', 'A brain in each tentacle'], answer: 1, why: 'A nerve net spreads through the body, and the rhopalia at the rim sense light and gravity and set the beat.' },
    { q: 'What happens when a stinging cell fires?', options: ['It releases a cloud of gas', 'A coiled thread shoots out, turning inside out, in under a millionth of a second', 'The tentacle squeezes slowly', 'It glows'], answer: 1, why: 'The nematocyst’s thread everts at enormous acceleration and its barbs and venom go into the prey.' },
  ],
  reel: [
    { ms: 5000, caption: 'A moon jellyfish has no brain, no bones and no heart, and is about 96% water.', set: { cut: true, beat: true }, anim: { explode: [0, 0.8] }, view: { pos: [0.4, 3.4, 7.6], target: [0.2, 2.2, 0] }, spin: 0.3 },
    { ms: 4800, caption: 'Each stinging cell fires a barbed thread in about 700 billionths of a second.', set: { cut: true, explode: 0 }, act: (s, inst) => inst.fire?.(0.6), view: { pos: [4.1, 2.9, 4.8], target: [3.9, 2.5, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const jel = { full: new Jelly({ kind: 'moon', R }), cut: new Jelly({ kind: 'moon', R, cut: true }) };
    for (const k in jel) { jel[k].group.position.y = Y0; root.add(jel[k].group); }
    const specks = makeSpecks(140, [-5, 7, 0.2, 5.5, -3, 3]); root.add(specks.mesh);
    // Stinging cell, magnified.
    const cn = makeCnido(); cn.g.position.set(3.9, 2.0, 0); cn.g.scale.setScalar(1.0); root.add(cn.g);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.38, 1.44, 64), M.glow(0x6cc4ff, { transparent: true, opacity: 0.5, side: THREE.DoubleSide })); ring.position.copy(cn.g.position); ring.position.y += 0.4; root.add(ring);
    const L = (h, p, par = root, c = '') => stage.label(h, p, par, c);
    const tags = {
      bell: L('Bell of mesoglea (jelly)', [0, 0, 0]), muscle: L('Coronal swimming muscle', [0, 0, 0], root, 'hot'), gonad: L('Gonads (four horseshoes)', [0, 0, 0]),
      rho: L('Rhopalium (sense club)', [0, 0, 0], root, 'hot'), tent: L('Tentacles', [0, 0, 0]), arm: L('Oral arms', [0, 0, 0]), canal: L('Gut pouches and canals', [0, 0, 0]),
      cn: L('One stinging cell, hugely magnified', [3.9, 3.65, 0], root, 'hot'), thread: L('Coiled barbed thread', [4.6, 1.0, 0]), hair: L('Trigger hair', [4.5, 2.95, 0]),
    };
    const pick = new Map();
    for (const j of Object.values(jel)) {
      stage.pickables.push(j.bell, j.muscle, j.stomach); pick.set(j.bell, 'bell'); pick.set(j.muscle, 'muscle'); pick.set(j.stomach, 'stomach');
      j.gonads.children.forEach((gd) => { stage.pickables.push(gd); pick.set(gd, 'gonad'); });
      j.rho.forEach((m) => { stage.pickables.push(m); pick.set(m, 'rho'); });
      j.arms.forEach((m) => { stage.pickables.push(m); pick.set(m, 'arm'); });
    }

    let t = 0, ph = 0, amp = 0, ex = 0, fireT = -1, fireRate = 1;
    const fixView = viewFixer(stage, this.view);
    const inst = {
      fire(rate = 1) { fireT = 0; fireRate = rate; },
      reload() { fireT = -1; },
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.5); fixView();
        amp = approach(amp, s.beat ? 0.55 : 0, 3, dt); ph += dt * 0.35;
        ex = approach(ex, s.explode, 6, dt);
        const j = s.cut ? jel.cut : jel.full;
        jel.cut.group.visible = s.cut; jel.full.group.visible = !s.cut;
        j.explode = ex; j.pose(amp * pulseShape(ph), t);
        specks.update(dt, (x, y, z) => [0.02 * Math.sin(y + t * 0.3), -0.04, 0]);
        // Labels
        const lift = (k) => k * ex * R;
        const [rr, ry] = j.rimAt(j.c), H = j.F * 2 * R;
        tags.bell.position.set(-0.55 * R, Y0 + H + lift(1.2) + 0.15, 0.2);
        tags.muscle.position.set(-rr * 0.75, Y0 + ry + 0.25 + lift(0.45), 0.5);
        tags.gonad.position.set(0.15, Y0 + H * 0.45 + 0.35 - lift(0.25), 0.9);
        const rh = j.rho[1]; tags.rho.position.set(rh.position.x + 0.1, Y0 + rh.position.y - 0.25, rh.position.z + 0.1);
        tags.tent.position.set(-rr - 0.1, Y0 + ry - 0.45 - lift(0.25), 0);
        tags.arm.position.set(0.2, Y0 + ry - 1.45 - lift(0.9), 0.4);
        tags.canal.position.set(0.9, Y0 + H * 0.3 - lift(0.25), 1.2);
        tags.canal.visible = s.cut || ex > 0.3; tags.gonad.visible = s.cut || ex > 0.3;
        const narrow = layoutOf(stage) === 'narrow';
        if (narrow) { tags.canal.visible = tags.gonad.visible = tags.tent.visible = tags.rho.visible = false; tags.thread.visible = tags.hair.visible = tags.cn.visible = false; }
        // Stinging cell: before firing the thread is coiled inside; then it shoots out in ~1 s on screen.
        let k = 0;
        if (fireT >= 0) { fireT += dt * fireRate; k = clamp((fireT - 0.15) / 0.9, 0, 1); }
        const e = k * k * (3 - 2 * k);
        cn.lid.rotation.z = -e * 2.0 * (k > 0 ? 1 : 0) - (k > 0 ? 0.3 : 0);
        cn.coil.geometry.setDrawRange(0, Math.floor(cn.coilN * (1 - e) / 6) * 6);
        cn.thread.geometry.setDrawRange(0, Math.floor(cn.outN * e / 6) * 6);
        cn.barbs.visible = k > 0.15; cn.barbs.scale.setScalar(clamp(k * 4, 0, 1));
        tags.thread.element.textContent = k > 0.5 ? 'Thread turned inside out, barbs first' : 'Coiled barbed thread';
        ring.lookAt(stage.camera.position);
        if (!narrow) tags.thread.position.set(4.6, k > 0.5 ? 3.3 : 1.0, 0);
      },
      readout: (s) => {
        const fired = fireT > 1.05;
        return fired || fireT >= 0 ? `<div class="big">${fired ? 'Fired in about 700 ns' : 'Firing…'}</div>
          <div class="row"><span>Time to fire</span><b>as little as 700 billionths of a second</b></div>
          <div class="row"><span>Acceleration</span><b>up to 5.4 million g</b></div>
          <div class="row"><span>Tip speed at impact</span><b>about 18–37 m/s</b></div>
          <div class="row"><span>Pressure at the tip</span><b>over 7 billion pascals</b></div>
          <small>Measured in Hydra, a jellyfish relative (Nüchter et al. 2006). Shown about two million times slower.</small>`
          : `<div class="big">A moon jellyfish, about 96% water</div>
          <div class="row"><span>Swimming muscle</span><b>one thin ring under the bell</b></div>
          <div class="row"><span>Sense clubs (rhopalia)</span><b>8, around the rim</b></div>
          <div class="row"><span>Brain</span><b>none: a nerve net</b></div>
          <div class="row"><span>Stinging cells</span><b>packed along tentacles and arms</b></div>
          <small>Water content of Aurelia: Hyman 1937. Press “Fire it” to see a stinging cell go off.</small>`;
      },
      pick(o) { const k = pick.get(o); if (k && INFO[k]) toast(INFO[k]); },
    };
    return inst;
  },
};
