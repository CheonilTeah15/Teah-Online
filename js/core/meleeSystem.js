// ===================== MELEE SYSTEM =====================
const shrine = { charges: 0, chargesMax: 10, active: false, timer: 0, duration: 180, range: 150, slashInterval: 4, damagePerSlash: 0 };
const godspeed = { charges: 0, chargesMax: 10, active: false, timer: 0, duration: 300, range: 180, strikeInterval: 8, damagePerStrike: 0 };

function meleeSwing() {
  if (melee.special === 'ninja' && melee.dashActive && melee.dashesLeft > 0 && !melee.dashing && melee.dashGap <= 0) {
    // ok
  } else {
    if (melee.cooldown > 0 || melee.swinging) return;
  }

  melee.swinging = true;
  melee.swingTimer = melee.swingDuration;
  melee.cooldown = melee.cooldownMax;

  const aimDir = getAimDir();
  shootFaceDir = aimDir;
  shootFaceTimer = melee.swingDuration + 2;

  if (aimDir === 0) melee.swingDir = Math.PI / 2;
  else if (aimDir === 1) melee.swingDir = -Math.PI / 2;
  else if (aimDir === 2) melee.swingDir = Math.PI;
  else melee.swingDir = 0;

  if (melee.special === 'fishing' && typeof nearFishingSpot !== 'undefined' && nearFishingSpot && typeof fishingState !== 'undefined' && !fishingState.active) {
    startFishingCast(); return;
  }

  if (melee.special === 'farming' && typeof Scene !== 'undefined' && Scene.inFarm && typeof handleFarmSwing === 'function') {
    handleFarmSwing(); return;
  }

  if (melee.special === 'ninja' && melee.dashActive && melee.dashesLeft > 0 && !melee.dashing) {
    melee.dashing = true;
    melee.dashTimer = melee.dashDuration;
    melee.dashTrail = [];
    melee.dashesLeft--;
    melee.dashChainWindow = 180;
    melee.cooldown = 0;
    if (aimDir === 0) { melee.dashDirX = 0; melee.dashDirY = 1; }
    else if (aimDir === 1) { melee.dashDirX = 0; melee.dashDirY = -1; }
    else if (aimDir === 2) { melee.dashDirX = -1; melee.dashDirY = 0; }
    else { melee.dashDirX = 1; melee.dashDirY = 0; }
    hitEffects.push({ x: player.x, y: player.y - 15, life: 15, type: "ninja_dash" });
  }

  const halfArc = melee.arcAngle / 2;
  const isCleave = melee.special === 'cleave';
  for (const m of mobs) {
    if (m.hp <= 0) continue;
    const dx = m.x - player.x;
    const dy = m.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < melee.range) {
      let inArc = true;
      if (!isCleave) {
        const angleToMob = Math.atan2(dy, dx);
        let angleDiff = angleToMob - melee.swingDir;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        inArc = Math.abs(angleDiff) < halfArc;
      }
      if (inArc) {
        const isCrit = shadowStepActive ? true : Math.random() < (melee.critChance || 0.20);
        const critMult = isCrit ? 1.5 : 1.0;
        const meleeDmg = Math.round(melee.damage * critMult);
        dealDamageToMob(m, meleeDmg, "melee");
        if (shadowStepActive) shadowStepActive = false;
        hitEffects.push({ x: m.x, y: m.y - (isCrit ? 30 : 20), life: isCrit ? 28 : 19, type: isCrit ? "crit" : "hit", dmg: meleeDmg });
        if (dist > 0) {
          const kx = (dx / dist) * melee.knockback;
          const ky = (dy / dist) * melee.knockback;
          const nc = Math.floor((m.x + kx) / TILE);
          const nr = Math.floor((m.y + ky) / TILE);
          if (!isSolid(nc, nr)) { m.x += kx; m.y += ky; }
        }
        if (melee.special === 'storm' && m.hp > 0) {
          const stormHeal = Math.min(Math.round(meleeDmg * 0.15), 20);
          if (stormHeal > 0) player.hp = Math.min(player.maxHp, player.hp + stormHeal);
          hitEffects.push({ x: m.x, y: m.y, life: 18, type: "shockwave" });
        }
        if (isCleave) {
          hitEffects.push({ x: m.x, y: m.y - 10, life: 15, type: "cleave_hit" });
          const cleaveHeal = Math.min(Math.round(meleeDmg * 0.15), 20);
          if (cleaveHeal > 0) player.hp = Math.min(player.maxHp, player.hp + cleaveHeal);
        }
      }
    }
  }
}

function updateMelee() {
  if (melee.cooldown > 0) melee.cooldown--;
  if (melee.swingTimer > 0) { melee.swingTimer--; if (melee.swingTimer <= 0) melee.swinging = false; }
  if (melee.dashCooldown > 0) melee.dashCooldown--;
  if (melee.dashGap > 0) melee.dashGap--;
  if (melee.dashActive && !melee.dashing) {
    melee.dashChainWindow--;
    if (melee.dashChainWindow <= 0 || melee.dashesLeft <= 0) {
      melee.dashesLeft = 0; melee.dashActive = false; melee.dashCooldown = melee.dashCooldownMax;
    }
  }
  if (melee.dashing) {
    melee.dashTimer--;
    melee.dashTrail.push({ x: player.x, y: player.y, life: 14 });
    if (melee.dashTrail.length > 8) melee.dashTrail.shift();
    const nx = player.x + melee.dashDirX * melee.dashSpeed;
    const ny = player.y + melee.dashDirY * melee.dashSpeed;
    const col = Math.floor(nx / TILE), row = Math.floor(ny / TILE);
    if (!isSolid(col, row)) { player.x = nx; player.y = ny; } else { melee.dashTimer = 0; }
    if (melee.dashTimer <= 0) {
      melee.dashing = false; melee.dashGap = 12;
      for (const m of mobs) delete m.dashHit;
      if (melee.dashesLeft <= 0) { melee.dashActive = false; melee.dashCooldown = melee.dashCooldownMax; }
    }
  }
  if (shrine.active) {
    shrine.timer--;
    if (shrine.timer <= 0) { shrine.active = false; }
    else if (shrine.timer % shrine.slashInterval === 0) {
      for (const m of mobs) {
        if (m.hp <= 0) continue;
        const dx = m.x - player.x, dy = m.y - player.y;
        if (Math.sqrt(dx*dx+dy*dy) < shrine.range) {
          const dmg = m.hp <= m.maxHp * 0.15 ? m.hp : shrine.damagePerSlash;
          hitEffects.push({ x: m.x, y: m.y - 20, life: 12, type: "hit", dmg: dmg });
          dealDamageToMob(m, dmg, "shrine");
        }
      }
    }
  }
  if (godspeed.active) {
    godspeed.timer--;
    if (godspeed.timer <= 0) { godspeed.active = false; }
    else if (godspeed.timer % godspeed.strikeInterval === 0) {
      for (const m of mobs) {
        if (m.hp <= 0) continue;
        const dx = m.x - player.x, dy = m.y - player.y;
        if (Math.sqrt(dx*dx+dy*dy) < godspeed.range) {
          const dmg = m.hp <= m.maxHp * 0.15 ? m.hp : godspeed.damagePerStrike;
          hitEffects.push({ x: m.x, y: m.y - 20, life: 12, type: "hit", dmg: dmg });
          dealDamageToMob(m, dmg, "godspeed");
        }
      }
    }
  }
  for (let ti = melee.dashTrail.length - 1; ti >= 0; ti--) {
    melee.dashTrail[ti].life--;
    if (melee.dashTrail[ti].life <= 0) melee.dashTrail.splice(ti, 1);
  }
}

function usePotion() {
  if (!Scene.inDungeon) return;
  if (potion.count <= 0 || potion.cooldown > 0 || player.hp >= player.maxHp) return;
  potion.count--;
  potion.cooldown = potion.cooldownMax;
  const healBoostMult = 1 + getHealBoost();
  const boostedHeal = Math.round(potion.healAmount * healBoostMult);
  const healed = Math.min(boostedHeal, player.maxHp - player.hp);
  player.hp = Math.min(player.maxHp, player.hp + boostedHeal);
  hitEffects.push({ x: player.x, y: player.y - 30, life: 20, type: "heal", dmg: healed });
}

function updatePotion() { if (potion.cooldown > 0) potion.cooldown--; }

function tryGrab() {}
function updateGrab() {}
function useExtraSlotItem() {}
function equipToExtraSlot(item) { extraSlotItem = item; }

function drawKatanaSwing(camX, camY) {
  if (!melee.swinging) return;
  const progress = 1 - (melee.swingTimer / melee.swingDuration);
  const px = player.x, py = player.y - 20;
  const halfArc = melee.arcAngle / 2;
  const startAngle = melee.swingDir - halfArc;
  const sweepAngle = melee.arcAngle * progress;
  const bladeAngle = startAngle + sweepAngle;
  const fadeAlpha = 1 - progress;
  ctx.save();
  ctx.translate(px, py);
  ctx.strokeStyle = `rgba(200,220,255,${0.7 * fadeAlpha})`;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, 0, melee.range * 0.8, startAngle, bladeAngle); ctx.stroke();
  ctx.restore();
}

function updateBullets() {
  const BULLET_R = 8, ENTITY_R = 20;
  const HIT_DIST = BULLET_R + ENTITY_R;
  const HIT_DIST_SQ = HIT_DIST * HIT_DIST;

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx; b.y += b.vy;
    if (b.isArrow) { b.arrowLife--; if (b.arrowLife <= 0) { bullets.splice(i, 1); continue; } }
    const col = Math.floor(b.x / TILE), row = Math.floor(b.y / TILE);
    if (isSolid(col, row)) { hitEffects.push({ x: b.x, y: b.y, life: 10, type: "wall" }); bullets.splice(i, 1); continue; }
    if (b.fromPlayer) {
      let hit = false;
      for (const m of mobs) {
        if (m.hp <= 0) continue;
        const dx = b.x - m.x, dy = b.y - (m.y - 20);
        if (dx * dx + dy * dy < HIT_DIST_SQ) {
          hitEffects.push({ x: b.x, y: b.y, life: 19, type: "hit", dmg: gun.damage });
          const gunBehavior = gun.special && GUN_BEHAVIORS[gun.special];
          if (gunBehavior && gunBehavior.onHit) gunBehavior.onHit(m, b.x, b.y);
          bullets.splice(i, 1);
          dealDamageToMob(m, gun.damage, "gun");
          hit = true; break;
        }
      }
      if (hit) continue;
    }
    if (!b.fromPlayer) {
      const dx = b.x - player.x, dy = b.y - (player.y - 20);
      if (dx * dx + dy * dy < HIT_DIST_SQ) {
        const bDmg = b.damage || gun.damage;
        const dmgDealt = dealDamageToPlayer(bDmg, "projectile", null);
        hitEffects.push({ x: b.x, y: b.y, life: 19, type: "hit", dmg: dmgDealt });
        bullets.splice(i, 1); continue;
      }
    }
  }

  for (let i = hitEffects.length - 1; i >= 0; i--) {
    hitEffects[i].life--;
    if (hitEffects[i].life <= 0) hitEffects.splice(i, 1);
  }
}

function drawBullets() {
  for (const b of bullets) {
    if (b.isArrow) {
      const angle = Math.atan2(b.vy, b.vx);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(angle);
      ctx.fillStyle = "#3a3020"; ctx.fillRect(-14, -1.5, 28, 3);
      ctx.fillStyle = "#6aff40";
      ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(10, -4); ctx.lineTo(10, 4); ctx.closePath(); ctx.fill();
      ctx.restore(); continue;
    }
    const isMob = b.mobBullet;
    const mainColor = isMob ? "#ff6040" : "#ffe860";
    const coreColor = isMob ? "#ffaa80" : "#fff";
    const isH = Math.abs(b.vx) > Math.abs(b.vy);
    ctx.fillStyle = mainColor;
    if (isH) { ctx.fillRect(b.x - 10, b.y - 5, 20, 10); ctx.fillStyle = coreColor; ctx.fillRect(b.x - 7, b.y - 3, 14, 6); }
    else { ctx.fillRect(b.x - 5, b.y - 10, 10, 20); ctx.fillStyle = coreColor; ctx.fillRect(b.x - 3, b.y - 7, 6, 14); }
    ctx.fillStyle = isMob ? "rgba(255,80,40,0.25)" : "rgba(255,230,80,0.2)";
    ctx.beginPath(); ctx.arc(b.x, b.y, 12, 0, Math.PI * 2); ctx.fill();
  }

  for (const h of hitEffects) {
    if (!h.maxLife) h.maxLife = h.life;
    const alpha = Math.min(1, h.life / h.maxLife);
    const renderer = HIT_EFFECT_RENDERERS[h.type] || HIT_EFFECT_RENDERERS._default;
    renderer(h, ctx, alpha);
  }
}
