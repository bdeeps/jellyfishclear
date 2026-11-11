// Shared parts for JellyfishClear: a pulsing jellyfish (bell of mesoglea, coronal muscle, canals,
// gonads, rhopalia, tentacles, oral arms) in four kinds, the pulse waveform, the swimming model
// (jet momentum against drag, with the stopping-vortex bonus for flat bells), vortex rings, water
// specks, chart boards and small layout helpers for phones and the tall reel. The board, layout and
// specks helpers are the same ones FishSwimClear uses (/fishswimclear/).
//
// Sources for the numbers used here and in the chapters:
//  - Mesoglea: Aurelia is about 95.9–96.6% water by wet weight (Hyman 1937, Bull Mt Desert Isl Biol
//    Lab 3); older literature gave 94–96.5% for medusae. We say "about 96%".
//  - Rowing and jetting: swimming performance rises with bell fineness (height ÷ diameter) and a
//    well-developed velum; prolate medusae are explained by jet thrust, oblate ones make big vortices
//    at the bell margin and "row" (Colin & Costello 2002, J Exp Biol 205: 427). Fineness about 0.5 as
//    the rough dividing line is quoted from later work (Lucas et al. 2012, MEPS), read second-hand.
//  - Passive energy recapture: a vortex ring under the bell during refilling gives a second, free
//    push, so Aurelia aurita travels "30% further each swimming cycle", improving cost of transport
//    by an estimated 48%; its cost of transport is "lower than other metazoans", and a salmon's is at
//    least 3.5× higher (Gemmell et al. 2013, PNAS 110: 17904). Starting and stopping vortices of
//    opposite spin: Dabiri et al. 2005, J Exp Biol 208: 1257.
//  - Pulse rate: mature Aurelia pulse on average about 0.24 Hz (± 0.11) and can be paced from about
//    0.3 to 0.8 Hz; Xu & Dabiri (2020, Science Advances 6: eaaz3194) paced live moon jellies to swim
//    up to 2.8× faster for only twice the metabolic cost. Smaller jellies pulse faster.
//  - The fraction of a cycle spent contracting is drawn as about a third; that is illustrative.
import { THREE, M, swarm, clamp, lerp, smooth } from './kit.js';

export const TAU = Math.PI * 2;
export const RHO_SEA = 1025;          // kg/m³, the sea-water value BuoyancyClear uses (/buoyancyclear/)

// ---------------------------------------------------------------- kinds of jelly
// F: fineness (bell height ÷ diameter). nRho: rhopalia. seg: lathe segments (4 gives a box).
export const KINDS = {
  moon: { name: 'Moon jellyfish (Aurelia)', F: 0.3, nRho: 8, seg: 64, bell: 0xd8ecff, tent: 'fringe', arms: 4, gonads: true, velum: false },
  prolate: { name: 'Bullet-shaped hydromedusa (Sarsia-like)', F: 0.9, nRho: 0, seg: 48, bell: 0xe6f4ff, tent: 'four', arms: 0, manubrium: true, gonads: false, velum: true },
  box: { name: 'Box jellyfish', F: 0.85, nRho: 4, seg: 4, bell: 0xe8f6ff, tent: 'corners', arms: 0, manubrium: true, gonads: false, velum: true },
  aequorea: { name: 'Crystal jelly (Aequorea)', F: 0.35, nRho: 0, seg: 64, bell: 0xeef6ff, tent: 'fringe', arms: 0, canals: 48, glow: true, gonads: false, velum: true },
};

// ---------------------------------------------------------------- the pulse
// Contraction 0 → 1 over one beat: a quick squeeze (first `a` of the cycle), then a slower spring back.
export function pulseShape(phase, a = 0.33) {
  const p = phase - Math.floor(phase);
  return p < a ? Math.sin((Math.PI / 2) * (p / a)) ** 2 : Math.cos((Math.PI / 2) * ((p - a) / (1 - a))) ** 2;
}

// ---------------------------------------------------------------- swimming model
// A labelled toy model for a bell of diameter D (m). Per beat the bell squeezes a volume ΔV of water out
// of its cavity in time tc through an opening (narrowed by a velum in jetters):
//   ΔV = Vcav (1 − (1 − c)²),  u_jet = ΔV / (A_open tc),  jet impulse J = ρ ΔV u_jet.
// Flat (oblate) bells get the stopping-vortex bonus: up to +30% of the push for free (Gemmell 2013).
// Mean speed from impulse per second against drag: f (J + J_bonus) = ½ ρ Cd A U².
// Energy: the jet's kinetic energy ½ ρ ΔV u_jet² per beat, divided by a muscle efficiency of 20%
// (a textbook-sized figure). Fast, narrow jets carry more energy per push, which is why jetting costs more.
// Constants are tuned so an 8 cm moon jelly cruises at a couple of cm/s, close to measured values.
export function swimModel(F, f, c, D = 0.08) {
  const R = D / 2, H = F * D, rho = RHO_SEA;
  const Vcav = (2 / 3) * Math.PI * R * R * H * 0.7;
  const dV = Vcav * (1 - (1 - c) ** 2);
  const tc = Math.min(0.45, 0.4 / f);
  const prol = smooth((F - 0.45) / 0.4), obl = smooth((0.6 - F) / 0.35);
  const vel = 1 - 0.55 * prol;
  const Aopen = Math.PI * (R * (1 - c) * vel) ** 2;
  const uj = dV / (Aopen * tc);
  const J = rho * dV * uj, bonus = 0.3 * obl;
  const Cd = 0.4 + 0.7 * (1 - smooth((F - 0.2) / 0.9));
  const U = Math.sqrt((2 * f * J * (1 + bonus)) / (rho * Cd * Math.PI * R * R));
  const E = (0.5 * rho * dV * uj * uj) / 0.2;
  const m = rho * (2 / 3) * Math.PI * R * R * H;
  const cot = (f * E) / (m * U);
  return { U, uj, bonus, cot, D, mode: obl > 0.6 ? 'rowing' : prol > 0.6 ? 'jetting' : 'in between', obl, prol };
}
// Cost of transport relative to an 8 cm moon jelly at its usual beat.
export const COT_MOON = swimModel(0.3, 0.4, 0.3).cot;

// ---------------------------------------------------------------- bell shape
// Profile of the bell: s runs from the top (0) to the margin (1). Returns outer and inner [r, y].
function bellPoint(s, R, H, c, kind, inner) {
  const th = s * (Math.PI / 2) * (kind === 'prolate' || kind === 'box' ? 1.0 : 1.04);
  // Contraction pulls the margin in. Flat bells bend mostly at the rim; tall bells squeeze all over.
  const flat = kind === 'moon' || kind === 'aequorea';
  const squeeze = 1 - c * (flat ? 0.42 * s * s : 0.34 * (0.35 + 0.65 * s));
  const t0 = flat ? 0.42 * H : 0.16 * H, tm = flat ? 0.03 * R : 0.05 * R;
  const rr = inner ? (R - tm) : R, hh = inner ? H - t0 * (1 - s * s) : H;
  let r = rr * Math.sin(th) * squeeze;
  let y = hh * Math.cos(th) - (inner ? 0.002 : 0);
  // As the rim swings in, it also dips down a little (flat bells) or the bell gets taller (tall ones).
  y += flat ? -c * 0.22 * H * s * s * s : c * 0.12 * H * (1 - s);
  if (inner && s > 0.97) r = Math.max(r, R * Math.sin(th) * squeeze - tm);
  return [Math.max(0, r), y];
}

function writeLathe(geo, prof, seg, phi0 = 0, phiL = TAU) {
  const pos = geo.attributes.position, P = prof.length;
  let k = 0;
  for (let i = 0; i <= seg; i++) {
    const ph = phi0 + (i / seg) * phiL, sn = Math.sin(ph), cs = Math.cos(ph);
    for (let j = 0; j < P; j++) { const [r, y] = prof[j]; pos.setXYZ(k++, r * sn, y, r * cs); }
  }
  pos.needsUpdate = true; geo.computeVertexNormals();
}
function makeLathe(prof, seg, phi0, phiL) {
  return new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), seg, phi0, phiL);
}

// ---------------------------------------------------------------- the jellyfish
const NP = 22;
export class Jelly {
  // R: bell radius in scene units. cut: draw a quarter cut away so you can see inside.
  constructor({ kind = 'moon', R = 1, F = null, cut = false, detail = true } = {}) {
    this.kind = kind; this.K = KINDS[kind]; this.R = R; this.F = F ?? this.K.F; this.c = 0; this.t = 0;
    this.cut = cut; this.detail = detail;
    const K = this.K, g = (this.group = new THREE.Group());
    this.body = new THREE.Group(); g.add(this.body);
    const seg = K.seg, phi0 = cut ? Math.PI * 0.5 : (kind === 'box' ? Math.PI / 4 : 0), phiL = cut ? Math.PI * 1.5 : TAU;
    this.seg = seg; this.phi0 = phi0; this.phiL = phiL;
    // Bell: outer surface down to the rim, then the inner (subumbrella) surface back up.
    this.bellMat = new THREE.MeshStandardMaterial({ color: K.bell, emissive: 0x3a6a8a, emissiveIntensity: 0.25, roughness: 0.2, metalness: 0, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false, flatShading: kind === 'box' });
    this.bell = new THREE.Mesh(makeLathe(this.profile(0), seg, phi0, phiL), this.bellMat); this.bell.renderOrder = 2;
    this.bellG = new THREE.Group(); this.bellG.add(this.bell); this.body.add(this.bellG);
    // Cut face: the thick jelly (mesoglea) seen in section.
    if (cut) {
      this.cutMat = M.ghost(0x9fd2ff, 0.45);
      this.cutFaces = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), this.cutMat); this.bellG.add(m); return m; });
    }
    // Coronal swimming muscle: a ring band on the inner surface.
    this.muscleMat = M.plastic(0xff6f86, { transparent: true, opacity: 0.75, emissive: 0x5a1020, side: THREE.DoubleSide, depthWrite: false });
    this.muscle = new THREE.Mesh(makeLathe(this.muscleProfile(0), seg, phi0, phiL), this.muscleMat); this.muscle.renderOrder = 3;
    this.muscleG = new THREE.Group(); this.muscleG.add(this.muscle); this.body.add(this.muscleG);
    // Canals (gut pouches run out to the rim as branching canals) and the ring canal.
    const nCan = K.canals || (kind === 'moon' ? 16 : 4);
    this.nCan = nCan;
    this.canGeo = new THREE.BufferGeometry(); this.canGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((nCan * 10 + 64) * 2 * 3), 3));
    this.canals = new THREE.LineSegments(this.canGeo, new THREE.LineBasicMaterial({ color: kind === 'aequorea' ? 0xa8ffcf : 0xffd27a, transparent: true, opacity: 0.85 }));
    this.innerG = new THREE.Group(); this.innerG.add(this.canals); this.body.add(this.innerG);
    // Stomach in the middle.
    this.stomach = new THREE.Mesh(new THREE.SphereGeometry(0.17 * R, 20, 12), M.plastic(0xffc79a, { transparent: true, opacity: 0.7 }));
    this.stomach.scale.y = 0.45; this.innerG.add(this.stomach);
    // Gonads: four horseshoes in a four-leaf pattern (moon jelly).
    this.gonads = new THREE.Group();
    if (K.gonads) for (let q = 0; q < 4; q++) {
      const a = q * Math.PI / 2 + Math.PI / 4;
      const tg = new THREE.Mesh(new THREE.TorusGeometry(0.14 * R, 0.035 * R, 8, 30, Math.PI * 1.55), M.plastic(0xd178ff, { emissive: 0x3a0a55, roughness: 0.5 }));
      tg.rotation.x = Math.PI / 2; tg.rotation.z = -a + Math.PI * 0.22 + Math.PI;
      tg.position.set(Math.sin(a) * 0.3 * R, 0, Math.cos(a) * 0.3 * R); tg.userData.a = a;
      this.gonads.add(tg);
    }
    this.innerG.add(this.gonads);
    // Rhopalia at the rim: sense organs with a statocyst.
    this.rho = [];
    for (let i = 0; i < K.nRho; i++) {
      const a = (K.nRho === 4 ? Math.PI / 4 : Math.PI / 8) + (i / K.nRho) * TAU;
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.045 * R * (kind === 'box' ? 1.6 : 1), 12, 8), M.glow(0xffd84a));
      m.userData.a = a; this.rho.push(m); this.body.add(m);
    }
    // Velum: a thin shelf just inside the rim that narrows the jet.
    if (K.velum) {
      this.velum = new THREE.Mesh(new THREE.RingGeometry(0.62, 1, kind === 'box' ? 4 : 48, 1, kind === 'box' ? Math.PI / 4 : 0), M.ghost(0x9ff0ff, 0.38));
      this.velum.rotation.x = -Math.PI / 2; this.body.add(this.velum);
    }
    // Tentacles: lines hanging from the rim.
    const nT = K.tent === 'fringe' ? (kind === 'aequorea' ? 96 : 128) : K.tent === 'four' ? 4 : 4 * 6;
    const segT = K.tent === 'fringe' ? 4 : 14;
    this.nT = nT; this.segT = segT;
    this.tentGeo = new THREE.BufferGeometry(); this.tentGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nT * segT * 2 * 3), 3));
    this.tentMat = new THREE.LineBasicMaterial({ color: kind === 'box' ? 0xbfe4ff : 0xf3e6ff, transparent: true, opacity: 0.8 });
    this.tents = new THREE.LineSegments(this.tentGeo, this.tentMat);
    this.tentG = new THREE.Group(); this.tentG.add(this.tents); this.body.add(this.tentG);
    // Oral arms (moon jelly) or a manubrium (hydromedusa, box jelly).
    this.armG = new THREE.Group(); this.body.add(this.armG); this.arms = [];
    const nA = K.arms || (K.manubrium ? 1 : 0);
    for (let i = 0; i < nA; i++) {
      const L = K.arms ? 1.15 * R : 0.55 * R * this.F, a = (i / Math.max(1, nA)) * TAU;
      const pts = []; for (let k = 0; k <= 12; k++) pts.push(new THREE.Vector3(0, -k / 12 * L, 0));
      const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, K.arms ? 0.05 * R : 0.06 * R, 8, false);
      const p = geo.attributes.position; geo.userData.base = Float32Array.from(p.array);
      const arm = new THREE.Mesh(geo, M.plastic(K.arms ? 0xffb0d8 : 0xffd1a8, { transparent: true, opacity: 0.8, roughness: 0.6 }));
      arm.userData = { a, L }; this.arms.push(arm); this.armG.add(arm);
    }
    if (K.glow) {
      // Green glow spots around the rim (the light organs where GFP was found).
      this.glow = swarm(nCan, new THREE.SphereGeometry(0.035 * R, 8, 6), M.glow(0x5cff9a));
      this.glow.castShadow = false; this.body.add(this.glow);
    }
    this.explode = 0;
    this.pose(0, 0);
  }

  profile(c) {
    const H = this.F * 2 * this.R, out = [];
    for (let j = 0; j <= NP; j++) out.push(bellPoint(j / NP, this.R, H, c, this.kind, false));
    for (let j = NP; j >= 0; j--) out.push(bellPoint(j / NP, this.R, H, c, this.kind, true));
    return out;
  }
  muscleProfile(c) {
    const H = this.F * 2 * this.R, out = [];
    for (let j = 0; j <= 12; j++) { const s = 0.4 + 0.56 * (j / 12); const [r, y] = bellPoint(s, this.R, H, c, this.kind, true); out.push([Math.max(0, r - 0.012 * this.R), y - 0.012 * this.R]); }
    return out;
  }
  rimAt(c) { const H = this.F * 2 * this.R; return bellPoint(1, this.R, H, c, this.kind, false); }
  innerAt(s, c) { const H = this.F * 2 * this.R; return bellPoint(s, this.R, H, c, this.kind, true); }
  dirAt(a) { // unit direction for angle a; the box bell is square, so scale its corners out
    if (this.kind !== 'box') return [Math.sin(a), Math.cos(a)];
    const sx = Math.sin(a), cz = Math.cos(a), k = 1 / Math.max(Math.abs(Math.sin(a - Math.PI / 4)), Math.abs(Math.cos(a - Math.PI / 4))) * Math.cos(Math.PI / 4);
    return [sx * k, cz * k];
  }

  // c: contraction 0..1 (1 = the deepest squeeze drawn), t: time for swaying, flow: downward water speed.
  pose(c, t, sway = 1) {
    this.c = c; this.t = t;
    const R = this.R, K = this.K, prof = this.profile(c);
    writeLathe(this.bell.geometry, prof, this.seg, this.phi0, this.phiL);
    writeLathe(this.muscle.geometry, this.muscleProfile(c), this.seg, this.phi0, this.phiL);
    if (this.cut) {
      // Fill the two cut faces (at phi0 and phi0 + phiL) with the bell's cross-section.
      for (const [m, ph] of [[this.cutFaces[0], this.phi0], [this.cutFaces[1], this.phi0 + this.phiL]]) {
        const sn = Math.sin(ph), cs = Math.cos(ph), v = [];
        for (let j = 0; j < NP; j++) {
          const o0 = prof[j], o1 = prof[j + 1], i0 = prof[prof.length - 1 - j], i1 = prof[prof.length - 2 - j];
          for (const [r, y] of [o0, o1, i1, o0, i1, i0]) v.push(r * sn, y, r * cs);
        }
        m.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3)); m.geometry.computeVertexNormals();
      }
    }
    const [rr, ry] = this.rimAt(c);
    const [, apexIn] = this.innerAt(0, c);
    // Canals along the inner surface, plus the ring canal.
    const cp = this.canGeo.attributes.position; let k = 0;
    const put = (a, b) => { cp.setXYZ(k++, ...a); cp.setXYZ(k++, ...b); };
    const hide = this.cut ? (a) => { let d = (a - this.phi0) % TAU; if (d < 0) d += TAU; return d > this.phiL; } : () => false;
    for (let i = 0; i < this.nCan; i++) {
      const a = (i / this.nCan) * TAU + 0.001;
      if (hide(a)) continue;
      const [dx, dz] = this.dirAt(a), s0 = this.kind === 'moon' ? (i % 2 ? 0.45 : 0.3) : 0.25;
      let prev = null;
      for (let j = 0; j <= 9; j++) {
        const s = s0 + (0.98 - s0) * (j / 9), [r, y] = this.innerAt(s, c), p = [dx * (r - 0.01 * R), y - 0.01 * R, dz * (r - 0.01 * R)];
        if (prev) put(prev, p); prev = p;
      }
    }
    let prev = null;
    for (let i = 0; i <= 32; i++) {
      const a = this.phi0 + (i / 32) * this.phiL, [dx, dz] = this.dirAt(a), [r, y] = this.innerAt(0.97, c), p = [dx * r, y, dz * r];
      if (prev) put(prev, p); prev = p;
    }
    for (; k < cp.count;) cp.setXYZ(k++, 0, apexIn, 0);
    cp.needsUpdate = true;
    this.stomach.position.y = apexIn - 0.05 * R;
    this.gonads.position.y = apexIn - 0.06 * R;
    this.gonads.children.forEach((gd) => { gd.visible = !hide(gd.userData.a); });
    this.rho.forEach((m) => { const [dx, dz] = this.dirAt(m.userData.a); m.position.set(dx * (rr - 0.02 * R), ry + 0.03 * R, dz * (rr - 0.02 * R)); m.visible = !hide(m.userData.a); });
    if (this.velum) { const [vr, vy] = this.innerAt(0.99, c); this.velum.scale.setScalar(vr); this.velum.position.y = vy - 0.005; }
    // Tentacles hang down, trailing with the sway and the beat.
    const tp = this.tentGeo.attributes.position; k = 0;
    const tLen = K.tent === 'fringe' ? 0.28 * R : K.tent === 'four' ? 1.8 * R : 2.4 * R;
    for (let i = 0; i < this.nT; i++) {
      let a, [r0, y0] = [rr, ry];
      if (K.tent === 'corners') { const corner = Math.floor(i / 6); a = Math.PI / 4 + corner * Math.PI / 2 + ((i % 6) - 2.5) * 0.04; }
      else a = ((i + 0.5) / this.nT) * TAU;
      const [dx, dz] = this.dirAt(a);
      let px = dx * r0, py = y0, pz = dz * r0;
      const hidden = hide(a);
      for (let j = 0; j < this.segT; j++) {
        const u = (j + 1) / this.segT, L = tLen / this.segT;
        const wob = sway * 0.25 * Math.sin(t * 1.3 - u * 3 + i * 0.7) * u;
        const out = K.tent === 'fringe' ? 0.35 - 0.6 * c : 0.05;
        const nx = px + (dx * out + wob * dz) * L, ny = py - L, nz = pz + (dz * out - wob * dx) * L;
        if (hidden) { tp.setXYZ(k++, 0, apexIn, 0); tp.setXYZ(k++, 0, apexIn, 0); }
        else { tp.setXYZ(k++, px, py, pz); tp.setXYZ(k++, nx, ny, nz); }
        px = nx; py = ny; pz = nz;
      }
    }
    tp.needsUpdate = true;
    // Oral arms: wavy, trailing.
    for (const arm of this.arms) {
      const p = arm.geometry.attributes.position, b = arm.geometry.userData.base, { a, L } = arm.userData;
      const off = K.arms ? 0.08 * R : 0;
      for (let i = 0; i < p.count; i++) {
        const x = b[i * 3], y = b[i * 3 + 1], z = b[i * 3 + 2], u = -y / L;
        const sw = sway * 0.12 * R * Math.sin(t * 1.1 - u * 4 + a) * u;
        const xx = K.arms ? x * 2.2 : x;
        const rx = Math.cos(a) * xx + Math.sin(a) * z, rz = -Math.sin(a) * xx + Math.cos(a) * z;
        p.setXYZ(i, rx + Math.sin(a) * (off + sw + u * 0.1 * R), y, rz + Math.cos(a) * (off + sw + u * 0.1 * R));
      }
      p.needsUpdate = true; arm.geometry.computeVertexNormals();
      arm.position.y = apexIn - 0.08 * R;
      arm.visible = !(this.cut && hide(a));
    }
    if (this.glow) {
      for (let i = 0; i < this.nCan; i++) { const a = (i / this.nCan) * TAU, [dx, dz] = this.dirAt(a); this.glow.place(i, [dx * (rr - 0.01), ry + 0.01, dz * (rr - 0.01)]); }
      this.glow.done();
    }
    this.setExplode(this.explode);
  }

  setExplode(k) {
    this.explode = k; const R = this.R, H = this.F * 2 * R;
    this.bellG.position.y = k * 1.2 * R;
    this.muscleG.position.y = k * 0.45 * R;
    this.innerG.position.y = -k * 0.25 * R;
    this.armG.position.y = -k * 0.9 * R;
    this.tentG.position.y = -k * 0.25 * R; this.tentG.scale.setScalar(1 + k * 0.25);
    this.rho.forEach((m) => { m.position.y += k * 0.7 * R; });
    if (this.velum) this.velum.position.y -= k * 0.05 * H;
  }
}

// A light-weight jelly for crowds: a bell and a few tentacles, cheap to draw many of.
export function miniJelly(color = 0xcfe8ff, R = 0.3) {
  const g = new THREE.Group();
  const prof = []; for (let j = 0; j <= 10; j++) { const th = (j / 10) * Math.PI / 2; prof.push(new THREE.Vector2(R * Math.sin(th), 0.6 * R * Math.cos(th))); }
  const bell = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), new THREE.MeshStandardMaterial({ color, emissive: 0x335a77, emissiveIntensity: 0.3, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
  g.add(bell); g.userData.bell = bell;
  return g;
}

// ---------------------------------------------------------------- vortex rings
// A ring of spinning water: a torus with beads that roll round the tube to show which way it spins.
export function vortexRing(color) {
  const g = new THREE.Group();
  const mat = M.glow(color, { transparent: true, opacity: 0.75, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 8, 48), mat); ring.rotation.x = Math.PI / 2; g.add(ring);
  const beads = swarm(24, new THREE.SphereGeometry(0.05, 8, 6), mat); beads.castShadow = false; g.add(beads);
  g.userData = { ring, beads, mat, psi: 0, spin: 1, age: 0, life: 3, r: 1 };
  g.spinUpdate = (dt) => {
    const u = g.userData; u.psi += u.spin * dt * 4;
    for (let i = 0; i < 24; i++) {
      const th = (Math.floor(i / 3) / 8) * TAU, ps = u.psi + (i % 3) * TAU / 3, a = 0.16;
      const rr = 1 + a * Math.cos(ps);
      beads.place(i, [Math.sin(th) * rr, a * Math.sin(ps), Math.cos(th) * rr]);
    }
    beads.done();
  };
  g.spinUpdate(0);
  return g;
}

// ---------------------------------------------------------------- water specks (as in FishSwimClear)
export function makeSpecks(n, box, col = 0xbfe6ff, r = 0.022) {
  const m = swarm(n, new THREE.SphereGeometry(r, 6, 4), M.glow(col, { transparent: true, opacity: 0.6 }));
  m.castShadow = false;
  const p = new Float32Array(n * 3), [x0, x1, y0, y1, z0, z1] = box;
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) { p[i * 3] = x0 + rnd() * (x1 - x0); p[i * 3 + 1] = y0 + rnd() * (y1 - y0); p[i * 3 + 2] = z0 + rnd() * (z1 - z0); }
  return {
    mesh: m, p,
    update(dt, vel) {
      for (let i = 0; i < n; i++) {
        const o = i * 3; const v = vel(p[o], p[o + 1], p[o + 2]);
        p[o] += v[0] * dt; p[o + 1] += v[1] * dt; p[o + 2] += v[2] * dt;
        if (p[o] < x0) p[o] += x1 - x0; if (p[o] > x1) p[o] -= x1 - x0;
        if (p[o + 1] < y0) p[o + 1] += y1 - y0; if (p[o + 1] > y1) p[o + 1] -= y1 - y0;
        if (p[o + 2] < z0) p[o + 2] += z1 - z0; if (p[o + 2] > z1) p[o + 2] -= z1 - z0;
        m.place(i, [p[o], p[o + 1], p[o + 2]]);
      }
      m.done();
    },
  };
}

// A deep-blue water column backdrop (a big open cylinder, seen from inside).
export function seaColumn(root, r = 9, h = 12, y = 3, col = 0x0d3350) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40, 1, true), new THREE.MeshBasicMaterial({ color: col, side: THREE.BackSide, transparent: true, opacity: 0.55, depthWrite: false }));
  m.position.y = y; root.add(m); return m;
}

// ---------------------------------------------------------------- boards (as in FishSwimClear)
export const COL = { hot: '#ffb547', cool: '#8ef0ff', up: '#5ce1a9', down: '#ff7a59', water: '#6cc4ff', red: '#ff5a8a', gold: '#f2c24b', violet: '#c49bff', soft: 'rgba(255,255,255,.6)', text: '#e8eef8' };
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = (...a) => { draw(g, pxW, pxH, ...a); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }));
  m.position.set(...pos); m.renderOrder = 10; root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function panel(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.88)'; g.beginPath(); g.roundRect(0, 0, w, h, 18); g.fill(); }
export function head(g, t, sub = '') {
  g.fillStyle = COL.text; g.font = 'bold 26px sans-serif'; g.fillText(t, 22, 38);
  if (sub) { g.font = '18px sans-serif'; g.fillStyle = COL.soft; g.fillText(sub, 22, 64); }
}
export function txt(g, s, x, y, col = 'rgba(255,255,255,.78)', font = '19px sans-serif') { g.fillStyle = col; g.font = font; g.fillText(s, x, y); }
export function wrap(g, s, x, y, maxW, lh = 24, col = 'rgba(255,255,255,.78)', font = '19px sans-serif') {
  g.fillStyle = col; g.font = font; let line = '', yy = y;
  for (const word of s.split(' ')) { const t = line ? line + ' ' + word : word; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, yy); line = word; yy += lh; } else line = t; }
  if (line) g.fillText(line, x, yy);
  return yy + lh;
}

// ---------------------------------------------------------------- layout helpers (as in FishSwimClear)
export const inReel = () => document.body.classList.contains('gb-reel');
export function layoutOf(stage) {
  const w = stage.host.clientWidth, h = stage.host.clientHeight || 1;
  if (inReel() && w / h < 0.8) return 'tall';
  return w < 560 ? 'narrow' : 'wide';
}
export function viewFor(stage, v) { const lay = layoutOf(stage); return v[lay] || v; }
export function viewFixer(stage, view) {
  let done = false;
  return () => {
    if (done) return; done = true;
    const lay = layoutOf(stage);
    if (lay !== 'wide' && view[lay] && !inReel()) stage.setView(view[lay].pos, view[lay].target, 0.01);
  };
}
export function focuser(stage, groups, views) {
  let cur = '';
  return (f, force = false) => {
    if (f === cur && !force) return false;
    cur = f;
    for (const k in groups) groups[k].visible = k === f;
    if (!inReel()) { const v = viewFor(stage, views[f]); stage.setView(v.pos, v.target, 1.0); }
    return true;
  };
}
const _v = new THREE.Vector3(), _r = new THREE.Vector3(), _u = new THREE.Vector3();
export function fitBoard(stage, mesh, base, scale = 1) {
  const cam = stage.camera;
  mesh.visible = layoutOf(stage) !== 'narrow';
  if (!mesh.visible) return;
  mesh.position.set(...base); mesh.scale.setScalar(scale); mesh.updateMatrixWorld(true);
  const p = mesh.geometry.parameters, hw = p.width / 2, hh = p.height / 2;
  cam.updateMatrixWorld(); _r.setFromMatrixColumn(cam.matrixWorld, 0); _u.setFromMatrixColumn(cam.matrixWorld, 1);
  for (let it = 0; it < 3; it++) {
    let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      _v.set(sx * hw, sy * hh, 0).applyMatrix4(mesh.matrixWorld).project(cam);
      x0 = Math.min(x0, _v.x); x1 = Math.max(x1, _v.x); y0 = Math.min(y0, _v.y); y1 = Math.max(y1, _v.y);
    }
    const wN = x1 - x0, hN = y1 - y0;
    if (wN > 1.25 || hN > 0.9) { const k = Math.min(1.25 / wN, 0.9 / hN); mesh.scale.multiplyScalar(k); mesh.updateMatrixWorld(true); continue; }
    let dx = 0, dy = 0;
    if (x1 > 0.97) dx = 0.97 - x1; if (x0 + dx < -0.97) dx = -0.97 - x0;
    if (y1 > 0.86) dy = 0.86 - y1;
    if (x0 + dx < 0.2 && y1 + dy > 0.3 && y0 + dy < 0.98) {
      if (wN > 0.77) { mesh.scale.multiplyScalar(0.77 / wN); mesh.updateMatrixWorld(true); continue; }
      dx = 0.2 - x0;
    }
    if (!dx && !dy) break;
    const d = mesh.position.distanceTo(cam.position), th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * d;
    mesh.position.addScaledVector(_r, dx * th * cam.aspect).addScaledVector(_u, dy * th);
    mesh.updateMatrixWorld(true);
  }
}
export function reelZoom(stage, z) {
  const lay = layoutOf(stage), want = lay === 'tall' ? z : 1;
  if (stage.camera.zoom !== want) { stage.camera.zoom = want; stage.camera.updateProjectionMatrix(); }
  // On a phone the readout covers the top of the stage, so drop the picture lower; on a laptop nudge it
  // right and down, away from the readout in the upper left.
  const [x, y] = lay === 'narrow' ? [0, -0.24] : lay === 'wide' ? [0.08, -0.1] : [0, 0];
  if (!stage.shift || stage.shift[0] !== x || stage.shift[1] !== y) stage.setShift(x, y);
}
// Deep-sea look: dark blue background and a little fog. The stage resets both on chapter close.
export function seaLook(stage, col = 0x061a2b) { stage.scene.background = new THREE.Color(col); stage.scene.fog = new THREE.Fog(col, 14, 40); }
