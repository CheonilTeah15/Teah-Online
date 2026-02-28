// ===================== DUNGEON REGISTRY =====================
const DUNGEON_REGISTRY = {
  cave: { name: 'Cave Dungeon', maxFloors: 5, returnLevel: 'cave_01', hasHazards: false, spawnTX: 20, spawnTY: 20, requiredLevel: 0, rewardMult: 0, tileset: '', difficulty: 0, music: '' },
  azurine: { name: 'Azurine City', maxFloors: 5, returnLevel: 'azurine_01', hasHazards: true, spawnTX: 20, spawnTY: 20, requiredLevel: 0, rewardMult: 0, tileset: '', difficulty: 0, music: '' },
  dungeon_3: { name: 'Dungeon 3', maxFloors: 5, returnLevel: '', hasHazards: false, spawnTX: 20, spawnTY: 20, requiredLevel: 0, rewardMult: 0, tileset: '', difficulty: 0, music: '' },
  dungeon_4: { name: 'Dungeon 4', maxFloors: 5, returnLevel: '', hasHazards: false, spawnTX: 20, spawnTY: 20, requiredLevel: 0, rewardMult: 0, tileset: '', difficulty: 0, music: '' },
  dungeon_5: { name: 'Dungeon 5', maxFloors: 5, returnLevel: '', hasHazards: false, spawnTX: 20, spawnTY: 20, requiredLevel: 0, rewardMult: 0, tileset: '', difficulty: 0, music: '' },
};

function validateDungeonType(key) {
  if (DUNGEON_REGISTRY[key]) return key;
  console.warn('Invalid dungeon type: ' + key + ', falling back to cave');
  return 'cave';
}
