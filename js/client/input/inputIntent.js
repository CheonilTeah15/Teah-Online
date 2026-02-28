// ===================== INPUT INTENT =====================
window.InputIntent = {
  chatActive: false, moveX: 0, moveY: 0, mouseX: 0, mouseY: 0, mouseDown: false,
  shootHeld: false, shootPressed: false, arrowAimDir: 0, arrowShooting: false,
  meleePressed: false, reloadPressed: false, dashPressed: false, interactPressed: false,
  slot1Pressed: false, slot2Pressed: false, slot3Pressed: false, slot4Pressed: false, slot5Pressed: false,
  potionPressed: false, ultimatePressed: false, skipWavePressed: false, readyWavePressed: false,
  reelPressed: false, reelHeld: false,
};

function clearOneFrameIntents() {
  InputIntent.shootPressed = false;
  InputIntent.meleePressed = false;
  InputIntent.reloadPressed = false;
  InputIntent.dashPressed = false;
  InputIntent.interactPressed = false;
  InputIntent.slot1Pressed = false;
  InputIntent.slot2Pressed = false;
  InputIntent.slot3Pressed = false;
  InputIntent.slot4Pressed = false;
  InputIntent.slot5Pressed = false;
  InputIntent.potionPressed = false;
  InputIntent.ultimatePressed = false;
  InputIntent.skipWavePressed = false;
  InputIntent.readyWavePressed = false;
  InputIntent.reelPressed = false;
}
