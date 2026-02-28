// ===================== GUN SYSTEM =====================
// Core: gun firing, reloading, bullet updates

const gunStats = {
  firerate: 80,
  freeze: 20,
  spread: 0,
  stack: 0,
};

function getFireRate() {
  if (playerEquip.gun && playerEquip.gun.fireRate) return playerEquip.gun.fireRate * 4;
  const base = Math.round(58 - gunStats.firerate * 0.55);
  return Math.round(base * (1 - fireRateBonus * 0.01)) * 4;
}
function getFreezeDuration() {
  if (playerEquip.gun && playerEquip.gun.freezeDuration != null) return playerEquip.gun.freezeDuration;
  return 15;
}
function getFreezePenalty() {
  if (playerEquip.gun && playerEquip.gun.freezePenalty != null) return playerEquip.gun.freezePenalty;
  return Math.min(0.25, gunStats.freeze * 0.0025);
}
function getReloadTime() { return Math.round(40 + gunStats.firerate * 0.5); }

let freezeTimer = 0;

const BULLET_SPEED = 3.75;

function spawnDeathEffect(m) {
  const colors = {
    witch: ["#a060e0","#8040c0","#c080ff","#6020a0"],
    golem: ["#8a8580","#6a6560","#a09a90","#585450"],
    mini_golem: ["#9a9590","#7a7570","#b0aaa0","#686460"],
    mummy: ["#c8b878","#a89858","#e0d098","#887838"],
    healer: ["#ffdd30","#ffe870","#ffc800","#ffee90"],
    archer: ["#30ff20","#1a1a1a","#0e0e0e","#20cc10"],
    skeleton: ["#d8d0c0","#c8c0b0","#e0d8c8","#b8b0a0"],
    grunt: ["#aa4444","#884444","#cc6666","#663333"],
    runner: ["#cc6644","#aa4422","#ee8866","#883322"],
    tank: ["#4466aa","#335588","#6688cc","#224466"],
  };
  const c = colors[m.type] || ["#888","#666","#aaa","#444"];
  const isGolemType = m.type === "golem" || m.type === "mini_golem";
  const count = m.type === "golem" ? 24 : m.type === "mini_golem" ? 16 : m.type === "witch" ? 18 : 12;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.5;
    const speed = 1.5 + Math.random() * 3;
    const sz = isGolemType ? 4 + Math.random() * 6 : 2 + Math.random() * 4;
    deathEffects.push({
      x: m.x + (Math.random() - 0.5) * 20,
      y: m.y - 20 + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      life: 30 + Math.random() * 25,
      maxLife: 55,
      size: sz,
      color: c[Math.floor(Math.random() * c.length)],
      type: m.type,
      gravity: isGolemType ? 0.15 : m.type === "witch" ? -0.05 : 0.08,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
    });
  }
}

function updateDeathEffects() {
  for (let i = deathEffects.length - 1; i >= 0; i--) {
    const p = deathEffects[i];
    p.life--;
    if (p.life <= 0) { deathEffects.splice(i, 1); continue; }
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.97;
    p.rot += p.rotSpeed;
  }
}

function drawDeathEffects() {
  for (const p of deathEffects) {
    const alpha = Math.min(1, p.life / (p.maxLife * 0.4));
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

function updateMobAmbientEffects() {
  for (let i = mobParticles.length - 1; i >= 0; i--) {
    const p = mobParticles[i];
    p.life--;
    if (p.life <= 0) { mobParticles.splice(i, 1); continue; }
    p.x += p.vx;
    p.y += p.vy;
  }
  if (mobParticles.length > 100) mobParticles.splice(0, mobParticles.length - 100);
}

function drawMobAmbientEffects() {
  for (const p of mobParticles) {
    const alpha = Math.min(1, p.life / 15);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawMobGroundEffects() {
  // Ground indicators for special mobs
  for (const m of mobs) {
    if (m.hp <= 0) continue;
    if (m.type === "golem" || m.type === "mini_golem") {
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath(); ctx.ellipse(m.x, m.y + 14, 24, 8, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function getAimDir() {
  if (InputIntent.arrowShooting) return InputIntent.arrowAimDir;
  const psx = player.x - camera.x;
  const psy = player.y - camera.y - 30;
  const dx = InputIntent.mouseX - psx;
  const dy = InputIntent.mouseY - psy;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 3 : 2;
  } else {
    return dy > 0 ? 0 : 1;
  }
}

function getMuzzlePos(aimDir) {
  const x = player.x - 20;
  const y = player.y - 68;
  const bodyL = x + 2;
  const bodyR = x + 36;
  const armY = y + 35;
  if (aimDir === 0) { return { x: bodyR + 1, y: armY + 6 + 49 }; }
  else if (aimDir === 1) { return { x: bodyL - 1, y: y + 28 - 49 }; }
  else if (aimDir === 2) { return { x: bodyL + 2 - 49, y: armY }; }
  else { return { x: bodyR + 9 + 49, y: armY }; }
}

function shoot() {
  if (gun.ammo <= 0 || gun.reloading || gun.fireCooldown > 0) return;

  const aimDir = getAimDir();
  shootFaceDir = aimDir;
  shootFaceTimer = SHOOT_FACE_DURATION;

  let freezeMult = 1.0;
  if (playerEquip.gun && playerEquip.gun.tier >= 4) freezeMult = 0.3;
  else if (playerEquip.gun && playerEquip.gun.tier >= 3) freezeMult = 0.5;
  freezeTimer = Math.round(getFreezeDuration() * freezeMult);

  let vx = 0, vy = 0;
  if (aimDir === 0) vy = BULLET_SPEED;
  else if (aimDir === 1) vy = -BULLET_SPEED;
  else if (aimDir === 2) vx = -BULLET_SPEED;
  else vx = BULLET_SPEED;

  const muzzle = getMuzzlePos(aimDir);

  const stackCount = 1 + Math.floor(gunStats.stack / 10);
  for (let s = 0; s < stackCount; s++) {
    const gunId = playerEquip.gun ? playerEquip.gun.id : null;
    bullets.push({
      id: nextBulletId++,
      x: muzzle.x,
      y: muzzle.y,
      vx: vx, vy: vy,
      fromPlayer: true,
      bulletColor: null,
    });
  }

  gun.ammo--;
  gun.fireCooldown = getFireRate();
  gun.recoilTimer = 6;

  if (gun.ammo <= 0) {
    gun.reloading = true;
    gun.reloadTimer = getReloadTime();
  }
}

function updateGun() {
  if (gun.fireCooldown > 0) gun.fireCooldown--;
  if (gun.recoilTimer > 0) gun.recoilTimer--;

  if (gun.reloading) {
    gun.reloadTimer--;
    if (gun.reloadTimer <= 0) {
      gun.ammo = gun.magSize;
      gun.reloading = false;
    }
  }

  if (InputIntent.shootHeld && !InputIntent.chatActive && !nameEditActive && !statusEditActive) {
    if (activeSlot === 0) shoot();
    else if (activeSlot === 1) { meleeSwing(); }
    else if (activeSlot === 2) usePotion();
  }
}

let _mgDragging = null;
let _ctxFreeze = 85;
let _ctxRof = 50;

function drawModifyGunPanel() {
  if (!UI.isOpen('modifygun')) return;
  const pw = 500, ph = 340;
  const px = BASE_W / 2 - pw / 2, py = BASE_H / 2 - ph / 2;
  ctx.fillStyle = "#0c1018";
  ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 12); ctx.fill();
  ctx.strokeStyle = "rgba(100,220,160,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 12); ctx.stroke();
  ctx.font = "bold 20px monospace";
  ctx.fillStyle = PALETTE.accent;
  ctx.textAlign = "center";
  ctx.fillText("CT-X  Weapon Config", px + pw / 2, py + 32);
  ctx.fillStyle = PALETTE.closeBtn;
  ctx.beginPath(); ctx.roundRect(px + pw - 42, py + 8, 32, 32, 6); ctx.fill();
  ctx.font = "bold 18px monospace"; ctx.fillStyle = "#fff";
  ctx.textAlign = "center"; ctx.fillText("\u2715", px + pw - 26, py + 30);
}

function handleModifyGunClick(mx, my) {
  if (!UI.isOpen('modifygun')) return false;
  const pw = 500, ph = 340;
  const px = BASE_W / 2 - pw / 2, py = BASE_H / 2 - ph / 2;
  if (mx >= px + pw - 42 && mx <= px + pw - 10 && my >= py + 8 && my <= py + 40) {
    UI.close(); _mgDragging = null; return true;
  }
  if (mx >= px && mx <= px + pw && my >= py && my <= py + ph) return true;
  return false;
}

function handleModifyGunDrag(mx) {}
function handleModifyGunUp() { _mgDragging = null; }
