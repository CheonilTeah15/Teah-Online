// ===================== DRAW & GAME LOOP =====================
// Core: main render loop, camera, HUD, game loop
// Extracted from index_2.html — Phase E

let renderTime = 0;

// ===================== DRAW =====================
function draw() {
  try {
  renderTime = Date.now();
  ctx.fillStyle = "#2a2a3a";
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  const cx = Math.floor(camera.x), cy = Math.floor(camera.y);

  // Draw level background (placeholder tiles)
  drawLevelBackground(cx, cy);

  // Draw user-placed tiles on top of background
  drawPlacedTiles(cx, cy);

  // Draw level entity overlays (barriers, spawn pads, zones) — uses own cam offset
  drawLevelEntities(cx, cy);

  ctx.save();
  ctx.translate(-cx, -cy);

  // Y-sort all characters
  const sortedChars = [];
  // Draw upgrade station
  if (Scene.inDungeon) drawStation();
  // Draw staircase if open
  if (Scene.inDungeon) drawStaircase();
  // Draw victory celebration
  if (Scene.inDungeon) drawVictoryCelebration();

  sortedChars.push({ y: player.y, type: "player" });
  for (const m of mobs) if (m.hp > 0) sortedChars.push({ y: m.y, type: "mob", mob: m });
  // Deli customer NPCs
  if (typeof deliNPCs !== 'undefined' && Scene.inCooking) {
    for (const npc of deliNPCs) sortedChars.push({ y: npc.y, type: "deliNPC", npc: npc });
  }
  sortedChars.sort((a, b) => a.y - b.y);

  // Ore nodes (under characters)
  if (typeof drawOreNodes === 'function') drawOreNodes();

  // Telegraph ground markers (under characters, over ground)
  if (typeof TelegraphSystem !== 'undefined') TelegraphSystem.draw(ctx, 0, 0);
  // Hazard system ground effects (under characters)
  if (typeof HazardSystem !== 'undefined') HazardSystem.draw(ctx, 0, 0);

  // Ground effects UNDER characters
  drawMobGroundEffects();
  // Ambient particles UNDER characters
  drawMobAmbientEffects();

  for (const e of sortedChars) {
    if (e.type === "player") {
      if (playerDead && deathTimer > 0) {
        const progress = 1 - deathTimer / DEATH_ANIM_FRAMES;
        ctx.save();
        ctx.globalAlpha = 1 - progress * 0.6;
        ctx.translate(player.x - camera.x, player.y - camera.y);
        ctx.rotate(deathRotation);
        ctx.translate(-(player.x - camera.x), -(player.y - camera.y));
        drawChar(player.x, player.y, player.dir, 0, false,
          player.skin, player.hair, player.shirt, player.pants, player.name, 0, true);
        ctx.restore();
      } else if (playerDead) {
        // During countdown, don't draw player
      } else {
        const flashAlpha = contactCooldown > 0 && Math.floor(renderTime / 80) % 2 === 0;
        if (flashAlpha) ctx.globalAlpha = 0.5;
        if (phaseTimer > 0) ctx.globalAlpha = 0.4 + Math.sin(renderTime * 0.015) * 0.1;
        if (queueActive) {
          const stanceBob = Math.sin(renderTime * 0.004) * 1.5;
          const stanceFrame = Math.floor(renderTime / 400) % 2;
          ctx.save();
          ctx.translate(0, stanceBob);
          drawChar(player.x, player.y, 1, stanceFrame, false,
            player.skin, player.hair, player.shirt, player.pants, player.name, player.hp, true, null, player.maxHp);
          ctx.restore();
        } else {
          drawChar(player.x, player.y, player.dir, player.frame, player.moving,
            player.skin, player.hair, player.shirt, player.pants, player.name, player.hp, true, null, player.maxHp);
        }
        if (flashAlpha || phaseTimer > 0) ctx.globalAlpha = 1.0;
      }
    } else if (e.type === "deliNPC") {
      const npc = e.npc;
      drawChar(npc.x, npc.y, npc.dir, Math.floor(npc.frame), npc.moving,
        npc.skin, npc.hair, npc.shirt, npc.pants,
        npc.name, -1, false, null, 100, 0, 0.9, 0);
    } else {
      const m = e.mob;
      const mobInvisible = m._cloaked || m._hidden || m._submerged || m._burrowSubmerged;
      if (m._cloaked) ctx.globalAlpha = 0.0;
      if (m.isBoss && !mobInvisible) {
        const bPulse = 0.15 + 0.08 * Math.sin(renderTime * 0.005);
        ctx.fillStyle = `rgba(255,120,40,${bPulse})`;
        ctx.beginPath(); ctx.arc(m.x, m.y - 15, 35 * (m.scale || 1), 0, Math.PI * 2); ctx.fill();
      }
      if (m._hidden) ctx.globalAlpha = 0.0;
      if (m._submerged || m._burrowSubmerged) ctx.globalAlpha = 0.0;
      drawChar(m.x, m.y, m.dir, Math.floor(m.frame), true,
        m.skin, m.hair, m.shirt, m.pants, m.name, m.hp, false, m.type, m.maxHp, m.boneSwing || 0, m.scale || 1, m.castTimer || m.throwAnim || m.bowDrawAnim || m.healAnim || 0);
      if (m._cloaked) ctx.globalAlpha = 1.0;
      if (m._hidden || m._submerged || m._burrowSubmerged) ctx.globalAlpha = 1.0;
    }
  }

  drawDeathEffects();
  drawMedpacks();
  drawBullets();
  drawKatanaSwing(cx, cy);

  if (typeof drawFarmTiles === 'function') drawFarmTiles();
  if (typeof drawFishingWorldEffects === 'function') drawFishingWorldEffects();

  ctx.restore();

  if (showWeaponStats && activeSlot === 0) { try { drawGunHUD(); } catch(e) { console.error("gunHUD err:", e); } }
  if (showWeaponStats && activeSlot === 1) { try { drawMeleeHUD(); } catch(e) { console.error("meleeHUD err:", e); } }
  drawHotbar();
  if (typeof drawCookingHUD === 'function') drawCookingHUD();
  if (typeof drawFishingHUD === 'function') drawFishingHUD();
  if (typeof drawFishVendorPanel === 'function') drawFishVendorPanel();
  if (typeof drawFarmingHUD === 'function') drawFarmingHUD();
  if (typeof drawFarmVendorPanel === 'function') drawFarmVendorPanel();

  drawChatIcon();
  drawProfileIcon();
  drawMapIcon();
  drawToolboxIcon();
  drawSelectedToolbar();
  drawChatPanel();
  drawProfilePanel();
  drawSettingsPanel();
  drawShopPanel();
  drawIdentityPanel();
  drawStatsPanel();
  drawToolboxPanel();
  drawModifyGunPanel();
  if (typeof drawTestMobPanel === 'function') drawTestMobPanel();

  if (activePlaceTool && !UI.isOpen('toolbox')) {
    drawPlacementPreview(cx, cy);
  }

  const hpBarW = 360, hpBarH = 24;
  const hpBarX = BASE_W / 2 - hpBarW / 2;
  const hpBarY = 16;
  const displayHp = Math.max(0, player.hp);
  const displayMax = player.maxHp || 100;
  const hpPct = Math.max(0, Math.min(1, displayHp / displayMax));

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.beginPath();
  ctx.roundRect(hpBarX - 6, hpBarY - 6, hpBarW + 12, hpBarH + 12, 6);
  ctx.fill();

  ctx.fillStyle = "rgba(255,0,0,0.15)";
  ctx.fillRect(hpBarX, hpBarY, hpBarW, hpBarH);

  if (hpPct > 0.5) ctx.fillStyle = "#e22";
  else if (hpPct > 0.25) ctx.fillStyle = "#e80";
  else ctx.fillStyle = "#f44";
  if (hpPct <= 0.25 && Math.floor(renderTime / 300) % 2 === 0) ctx.fillStyle = "#f66";
  ctx.fillRect(hpBarX, hpBarY, hpBarW * hpPct, hpBarH);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);

  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.fillText(displayHp + " / " + displayMax, BASE_W / 2, hpBarY + 19);

  if (Scene.inDungeon) {
    ctx.textAlign = "left";
    for (let i = 0; i < 3; i++) {
      ctx.font = "30px monospace";
      ctx.fillStyle = i < lives ? "#e33" : "#333";
      ctx.fillText("\u2665", hpBarX - 110 + i * 32, hpBarY + 22);
    }
  }

  if (Scene.inDungeon) {
  ctx.textAlign = "center";
  const waveY = 56;
  const globalWave = (dungeonFloor - 1) * WAVES_PER_FLOOR + wave;
  const totalWaves = getDungeonMaxFloors() * WAVES_PER_FLOOR;

  ctx.font = "bold 14px monospace";
  ctx.fillStyle = "#b090e0";
  ctx.fillText("FLOOR " + dungeonFloor + " / " + getDungeonMaxFloors(), BASE_W / 2, waveY);

  ctx.font = "bold 30px monospace";
  if (dungeonComplete && stairsOpen) {
    ctx.fillStyle = "#ffd700";
    ctx.fillText("\uD83C\uDFC6 DUNGEON COMPLETE!", BASE_W / 2, waveY + 30);
  } else if (stairsOpen) {
    ctx.fillStyle = "#b080ff";
    ctx.fillText("FLOOR CLEAR!", BASE_W / 2, waveY + 30);
  } else if (waveState === "cleared") {
    const sec = Math.ceil(waveTimer / 60);
    ctx.fillStyle = "#fa0";
    ctx.fillText("NEXT WAVE IN " + sec, BASE_W / 2, waveY + 30);
  } else if (waveState === "active") {
    const isBoss = wave % 10 === 0 && wave >= 10;
    ctx.fillStyle = isBoss ? "#ff4444" : "#fff";
    ctx.fillText("WAVE " + globalWave + "/" + totalWaves, BASE_W / 2, waveY + 30);
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = isBoss ? "#ff6666" : "#fa0";
    ctx.fillText(waveTheme, BASE_W / 2, waveY + 46);
    ctx.font = "bold 14px monospace";
    ctx.fillStyle = "#aaa";
    ctx.fillText(mobs.filter(m => m.hp > 0).length + " remaining", BASE_W / 2, waveY + 62);
  } else {
    const sec2 = Math.ceil((1800 - waveTimer) / 60);
    ctx.fillStyle = "#888";
    ctx.fillText("GET READY... " + sec2, BASE_W / 2, waveY + 30);
  }

  ctx.textAlign = "right";
  ctx.font = "bold 18px monospace";
  ctx.fillStyle = "#888";
  ctx.fillText("KILLS", BASE_W - 24, 30);
  ctx.font = "bold 32px monospace";
  ctx.fillStyle = "#fff";
  ctx.fillText(kills.toString(), BASE_W - 24, 62);
  ctx.textAlign = "left";
  }

  if (Scene.inDungeon) {
    const goldY = 140;
    ctx.fillStyle = "#ffc107";
    ctx.beginPath(); ctx.arc(BASE_W / 2 - 50, goldY, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.gold;
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText(gold + "g", BASE_W / 2 + 10, goldY + 7);
  }

  if (playerDead) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, BASE_W, BASE_H);
    ctx.textAlign = 'center';
    if (deathTimer > 0) {
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = '#cc2222';
      ctx.fillText('YOU DIED', BASE_W / 2, BASE_H / 2 - 20);
    } else {
      const secondsLeft = Math.ceil(respawnTimer / 60);
      if (deathGameOver) {
        ctx.font = 'bold 28px monospace';
        ctx.fillStyle = '#cc2222';
        ctx.fillText('GAME OVER', BASE_W / 2, BASE_H / 2 - 40);
      } else {
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#aaa';
        ctx.fillText('Respawning in', BASE_W / 2, BASE_H / 2 - 40);
      }
      ctx.font = 'bold 64px monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText(secondsLeft, BASE_W / 2, BASE_H / 2 + 20);
    }
    ctx.textAlign = 'left';
  }

  drawCustomizeScreen();
  drawInventoryPanel();

  if (transitioning && transitionAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${transitionAlpha})`;
    ctx.fillRect(0, 0, BASE_W, BASE_H);
  }
  } catch(drawErr) {
    console.error('DRAW ERROR:', drawErr.message, drawErr.stack);
  }
}
const FIXED_DT = 1000 / 60;
let lastTime = 0;
let accumulator = 0;
function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  let elapsed = timestamp - lastTime;
  lastTime = timestamp;
  if (elapsed > 100) elapsed = 100;
  if (window._gameSpeed && window._gameSpeed !== 1) elapsed *= window._gameSpeed;
  accumulator += elapsed;
  let updates = 0;
  while (accumulator >= FIXED_DT && updates < 2) {
    translateIntentsToCommands();
    authorityTick();
    accumulator -= FIXED_DT; updates++;
  }
  if (updates === 0) {
    translateIntentsToCommands();
    authorityTick();
    accumulator = 0;
  }
  draw();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
