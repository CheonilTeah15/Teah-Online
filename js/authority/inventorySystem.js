// ===================== INVENTORY SYSTEM =====================
let invDragFrom = -1;
let invHover = -1;
let invTooltip = null;
let cardPopup = null;

const EQUIP_SLOTS = ['weapon', 'melee', 'armor', 'accessory'];

function createItem(type, tierData) {
  return { id: tierData.id, name: tierData.name, type: type, tier: tierData.tier, data: tierData, stackable: false, count: 1 };
}

function createConsumable(id, name, count) {
  return { id: id, name: name, type: "consumable", tier: 0, data: { id, name }, stackable: true, count: count || 1 };
}

function addToInventory(item) {
  if (item.stackable) {
    for (let i = 0; i < inventory.length; i++) {
      if (inventory[i] && inventory[i].id === item.id && inventory[i].stackable) {
        inventory[i].count += item.count;
        return true;
      }
    }
  }
  inventory.push(item);
  return true;
}

function isInInventory(id) {
  for (let i = 0; i < inventory.length; i++) {
    if (inventory[i] && inventory[i].id === id) return true;
  }
  return false;
}

function findInventoryItemById(id) {
  for (let i = 0; i < inventory.length; i++) {
    if (inventory[i] && inventory[i].id === id) return inventory[i];
  }
  return null;
}

function removeFromInventory(slot) {
  const item = inventory[slot];
  inventory.splice(slot, 1);
  return item;
}

function applyGunStats(data) {
  playerEquip.gun = data;
  gun.damage = data.damage || GUN_DEFAULTS.damage;
  gun.magSize = data.magSize || 12;
  gun.ammo = data.magSize || 12;
  gun.fireCooldownMax = data.fireRate || 10;
  gun.special = data.special || null;
}

function applyMeleeStats(data) {
  playerEquip.melee = data;
  melee.damage = data.damage || MELEE_DEFAULTS.damage;
  melee.range = data.range || DEFAULT_MELEE.range;
  melee.cooldownMax = data.cooldown || DEFAULT_MELEE.cooldown;
  melee.critChance = data.critChance || MELEE_DEFAULTS.critChance;
  melee.special = data.special || null;
}

function applyDefaultGun() { applyGunStats(DEFAULT_GUN); gun.special = null; }
function applyDefaultMelee() { applyMeleeStats(DEFAULT_MELEE); melee.special = null; }

function equipItem(slot) {
  const item = inventory[slot];
  if (!item) return;
  const eqType = item.type;
  if (!ITEM_CATEGORIES.equipment.includes(eqType)) return;

  if (playerEquip[eqType] && playerEquip[eqType].id === item.data.id) {
    if (eqType === 'gun') applyDefaultGun();
    else if (eqType === 'melee') applyDefaultMelee();
    else { playerEquip[eqType] = null; if (eqType === 'chest') recalcMaxHp(); }
    return;
  }

  if (eqType === 'gun') { applyGunStats(item.data); gun.ammo = Math.min(gun.ammo, gun.magSize); }
  else if (eqType === 'melee') applyMeleeStats(item.data);
  else { playerEquip[eqType] = item.data; if (eqType === 'chest') recalcMaxHp(); }
}

function unequipItem(eqType) {
  const current = playerEquip[eqType];
  if (!current) return false;
  if (current.id === DEFAULT_GUN.id || current.id === DEFAULT_MELEE.id) return false;
  const item = createItem(eqType, current);
  if (addToInventory(item)) {
    if (eqType === 'gun') applyDefaultGun();
    else if (eqType === 'melee') applyDefaultMelee();
    else playerEquip[eqType] = null;
    return true;
  }
  return false;
}
