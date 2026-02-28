// ===================== AUTHORITY TICK =====================
window.DEBUG_pauseAuthority = false;
window._authorityDriven = false;

window.authorityTick = function() {
  if (DEBUG_pauseAuthority) {
    CommandQueue.length = 0;
    return null;
  }

  const cmds = CommandQueue.slice();
  CommandQueue.length = 0;

  InputIntent.shootHeld = false;

  for (let i = 0; i < cmds.length; i++) {
    const cmd = cmds[i];
    switch (cmd.t) {
      case 'move':
        InputIntent.moveX = cmd.data.x;
        InputIntent.moveY = cmd.data.y;
        break;
      case 'shoot':
        InputIntent.shootHeld = cmd.data.held;
        if (cmd.data.aim) {
          InputIntent.mouseX = cmd.data.aim.mouseX;
          InputIntent.mouseY = cmd.data.aim.mouseY;
          InputIntent.arrowAimDir = cmd.data.aim.arrowAimDir;
          InputIntent.arrowShooting = cmd.data.aim.arrowShooting;
        }
        break;
      case 'reload':    InputIntent.reloadPressed = true; break;
      case 'melee':     InputIntent.meleePressed = true; break;
      case 'dash':      InputIntent.dashPressed = true; break;
      case 'interact':  InputIntent.interactPressed = true; break;
      case 'ultimate':  InputIntent.ultimatePressed = true; break;
      case 'skipWave':  InputIntent.skipWavePressed = true; break;
      case 'readyWave': InputIntent.readyWavePressed = true; break;
      case 'slot':
        if (cmd.data.slot === 0) InputIntent.slot1Pressed = true;
        else if (cmd.data.slot === 1) InputIntent.slot2Pressed = true;
        else if (cmd.data.slot === 2) InputIntent.slot3Pressed = true;
        break;
      case 'usePotion': InputIntent.potionPressed = true; break;
      case 'grab':      InputIntent.slot5Pressed = true; break;
      case 'useExtra':  InputIntent.slot4Pressed = true; break;
      case 'fish_reel':
        InputIntent.reelPressed = true;
        if (cmd.data.held) InputIntent.reelHeld = true;
        break;
    }
  }

  _authorityDriven = true;
  update();
  _authorityDriven = false;

  return serializeGameState();
};
