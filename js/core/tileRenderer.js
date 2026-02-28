// ===================== TILE RENDERER =====================
function drawLevelBackground(camX, camY) {
  ctx.fillStyle = Scene.inTestArena ? '#181820' : Scene.inFarm ? '#5a4830' : Scene.inCooking ? '#c0b898' : Scene.inMine ? '#1a1510' : Scene.inCave ? '#1a1818' : Scene.inAzurine ? '#0e0e1a' : Scene.inLobby ? '#1a4a18' : '#1e1e26';
  ctx.fillRect(0, 0, BASE_W, BASE_H);

  const startTX = Math.max(0, Math.floor(camX / TILE));
  const startTY = Math.max(0, Math.floor(camY / TILE));
  const endTX = Math.min(level.widthTiles - 1, startTX + Math.ceil(BASE_W / TILE) + 1);
  const endTY = Math.min(level.heightTiles - 1, startTY + Math.ceil(BASE_H / TILE) + 1);

  for (let ty = startTY; ty <= endTY; ty++) {
    for (let tx = startTX; tx <= endTX; tx++) {
      const x = tx * TILE - camX;
      const y = ty * TILE - camY;
      const isBorder = tx === 0 || ty === 0 || tx === level.widthTiles-1 || ty === level.heightTiles-1;

      if (Scene.inLobby) {
        const ascii = level.collisionAscii[ty]?.[tx];
        if (ascii === '@') {
          ctx.fillStyle = '#226a20'; ctx.fillRect(x, y, TILE, TILE);
        } else {
          const gv = ((tx * 7 + ty * 13) % 5);
          ctx.fillStyle = `rgb(${60 + gv * 2},${120 + gv * 3},${45 + gv})`;
          ctx.fillRect(x, y, TILE, TILE);
        }
        continue;
      }

      if (Scene.inCave) {
        if (collisionGrid[ty][tx] === 1) {
          ctx.fillStyle = '#242220'; ctx.fillRect(x, y, TILE, TILE);
        } else {
          const sv = ((tx * 3 + ty * 7) % 5);
          ctx.fillStyle = `rgb(${48 + sv * 2},${46 + sv * 2},${52 + sv})`;
          ctx.fillRect(x, y, TILE, TILE);
        }
        continue;
      }

      if (Scene.inMine) {
        if (collisionGrid[ty][tx] === 1) {
          ctx.fillStyle = '#342818'; ctx.fillRect(x, y, TILE, TILE);
        } else {
          const sv = ((tx * 5 + ty * 11) % 5);
          ctx.fillStyle = `rgb(${52 + sv * 2},${44 + sv * 2},${32 + sv})`;
          ctx.fillRect(x, y, TILE, TILE);
        }
        continue;
      }

      if (Scene.inCooking) {
        if (collisionGrid[ty][tx] === 1) {
          ctx.fillStyle = '#c8b898'; ctx.fillRect(x, y, TILE, TILE);
        } else {
          const checker = (tx + ty) % 2 === 0;
          ctx.fillStyle = checker ? '#e0d8c8' : '#d0c8b0';
          ctx.fillRect(x, y, TILE, TILE);
        }
        continue;
      }

      if (Scene.inFarm) {
        if (collisionGrid[ty][tx] === 1) {
          ctx.fillStyle = '#5a5048'; ctx.fillRect(x, y, TILE, TILE);
        } else {
          const sv = ((tx * 5 + ty * 11) % 5);
          ctx.fillStyle = `rgb(${90 + sv * 3},${70 + sv * 2},${45 + sv})`;
          ctx.fillRect(x, y, TILE, TILE);
        }
        continue;
      }

      if (Scene.inAzurine) {
        if (collisionGrid[ty][tx] === 1) {
          ctx.fillStyle = '#181828'; ctx.fillRect(x, y, TILE, TILE);
        } else {
          const sv = ((tx * 3 + ty * 7) % 5);
          ctx.fillStyle = `rgb(${32 + sv},${32 + sv},${42 + sv * 2})`;
          ctx.fillRect(x, y, TILE, TILE);
        }
        continue;
      }

      if (collisionGrid[ty][tx] === 1) {
        ctx.fillStyle = isBorder ? '#2a2a32' : '#3a3a44';
        ctx.fillRect(x, y, TILE, TILE);
      } else {
        const sv = ((tx + ty) % 2 === 0) ? 0 : 2;
        ctx.fillStyle = `rgb(${58 + sv},${55 + sv},${55 + sv})`;
        ctx.fillRect(x, y, TILE, TILE);
      }
    }
  }
}
