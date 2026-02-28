// ===================== SAVE / LOAD SYSTEM =====================
const SAVE_KEY = 'dungeon_game_save';
const SAVE_VERSION = 5;

const SaveLoad = {
  _cosmeticKeys: ['skin', 'hair', 'shirt', 'pants', 'shoes', 'hat', 'glasses',
    'gloves', 'belt', 'cape', 'tattoo', 'scars', 'earring', 'necklace',
    'backpack', 'warpaint', 'eyes', 'facialHair'],

  save() {
    try {
      const data = {
        version: SAVE_VERSION,
        keybinds: { ...keybinds },
        settings: { ...gameSettings },
        identity: { name: player.name, status: playerStatus, faction: playerFaction, country: playerCountry, gender: playerGender },
        cosmetics: {},
      };
      for (const k of this._cosmeticKeys) data.cosmetics[k] = player[k];
      data.progression = { playerLevel, playerXP, skillData: JSON.parse(JSON.stringify(skillData)) };
      data.fishing = { baitCount: fishingState.baitCount, stats: { ...fishingState.stats } };
      if (typeof farmingState !== 'undefined') data.farming = { landLevel: farmingState.landLevel, stats: { ...farmingState.stats } };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) { console.warn('Save failed:', e); }
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data || !data.version || data.version < 1) return false;
      if (data.keybinds) for (const action in data.keybinds) if (action in DEFAULT_KEYBINDS) keybinds[action] = data.keybinds[action];
      if (data.settings) for (const key in data.settings) if (key in gameSettings) gameSettings[key] = data.settings[key];
      if (data.identity) {
        if (data.identity.name) player.name = data.identity.name;
        if (data.identity.status !== undefined) playerStatus = data.identity.status;
        if (data.identity.faction) playerFaction = data.identity.faction;
        if (data.identity.country) playerCountry = data.identity.country;
        if (data.identity.gender) playerGender = data.identity.gender;
      }
      if (data.cosmetics) for (const k of this._cosmeticKeys) if (data.cosmetics[k] !== undefined) player[k] = data.cosmetics[k];
      if (data.progression) {
        const p = data.progression;
        if (p.playerLevel !== undefined) playerLevel = p.playerLevel;
        if (p.playerXP !== undefined) playerXP = p.playerXP;
        if (p.skillData) for (const skill in p.skillData) if (skillData[skill]) { skillData[skill].level = p.skillData[skill].level || 1; skillData[skill].xp = p.skillData[skill].xp || 0; }
      }
      if (data.fishing && typeof fishingState !== 'undefined') {
        fishingState.baitCount = data.fishing.baitCount || 0;
        if (data.fishing.stats) Object.assign(fishingState.stats, data.fishing.stats);
      }
      if (data.farming && typeof farmingState !== 'undefined') {
        if (data.farming.landLevel !== undefined) farmingState.landLevel = data.farming.landLevel;
        if (data.farming.stats) Object.assign(farmingState.stats, data.farming.stats);
      }
      return true;
    } catch (e) { console.warn('Load failed:', e); return false; }
  },

  clear() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} },

  autoSave() {
    if (this._saveTimeout) clearTimeout(this._saveTimeout);
    this._saveTimeout = setTimeout(() => this.save(), 1000);
  },
};

SaveLoad.load();
useSpriteMode = gameSettings.spriteMode;

const SETTINGS_DATA = {
  General: [
    { label: "Nicknames", key: "nicknames", type: "toggle" },
    { label: "Animations", key: "animations", type: "toggle" },
    { label: "Sprite Mode", key: "spriteMode", type: "toggle" },
  ],
  Sounds: [
    { label: "Master Volume", key: "masterVolume", type: "toggle" },
    { label: "Sound Effects", key: "sfx", type: "toggle" },
  ],
  Indicators: [
    { label: "Damage Numbers", key: "damageNumbers", type: "toggle" },
    { label: "Health Bars", key: "healthBars", type: "toggle" },
  ],
};

function drawSettingsPanel() {
  if (!UI.isOpen('settings')) return;
  const pw = 520, ph = 480;
  const px = BASE_W/2 - pw/2, py = BASE_H/2 - ph/2;
  ctx.fillStyle = "rgba(8,8,14,0.92)";
  ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 8); ctx.fill();
  ctx.strokeStyle = "#2a6a4a"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 8); ctx.stroke();
  ctx.font = "bold 14px monospace"; ctx.fillStyle = PALETTE.accent; ctx.textAlign = "center";
  ctx.fillText("SETTINGS", px + pw/2, py + 24);
  ctx.fillStyle = PALETTE.closeBtn;
  ctx.beginPath(); ctx.roundRect(px + pw - 36, py + 6, 28, 28, 4); ctx.fill();
  ctx.font = "bold 16px monospace"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
  ctx.fillText("\u2715", px + pw - 22, py + 25);
}
