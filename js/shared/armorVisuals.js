// Armor visual configuration
const ARMOR_VISUALS = {
  1: { name: "Leather", primary: "#6a5030", secondary: "#7a6040", dark: "#5a4028", darker: "#3a2a18", highlight: "#7a6040", belt: "#5a4020", accent: null, glow: null, animSpeed: 0 },
  2: { name: "Iron", primary: "#4a5a64", secondary: "#6a7a84", dark: "#3a4a54", highlight: "#5a6a74", accent: "#8a9aa4", bootStripe: "#7a8a94", glow: null, animSpeed: 0 },
  3: { name: "Warden", primary: "#3a4a3a", secondary: "#4a5a4a", dark: "#2a3a2a", highlight: "#5a6a5a", emberEmblem: "#8a6030", glow: { color: [220, 140, 50], baseAlpha: 0.3, amplitude: 0.15 }, animSpeed: 0.005 },
  4: { name: "Void", primary: "#1a1020", secondary: "#2a1a30", dark: "#1a1020", highlight: "#2a1a30", voidCore: "#3a1a4a", bootSole: "#0a0810", glow: { color: [140, 50, 220], baseAlpha: 0.4, amplitude: 0.2 }, animSpeed: 0.006, shimmer: [180, 100, 255], coreGlow: [180, 80, 255], eyeGlow: [160, 60, 255] },
};

function tierGlow(tier, time, speedOverride) {
  const tv = ARMOR_VISUALS[tier];
  if (!tv || !tv.glow) return 0;
  const speed = speedOverride || tv.animSpeed;
  return tv.glow.baseAlpha + Math.sin(time * speed) * tv.glow.amplitude;
}
