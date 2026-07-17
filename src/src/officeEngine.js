/**
 * DUST Office Engine — Canvas-based top-down office renderer.
 * Character sprite sheet format (char_N.png) = 112×96px:
 *   Each frame is 16×32px. The sheet has 7 columns × 3 rows.
 *   Row 0 = down direction:  cols 0-2 walk, cols 3-4 type, cols 5-6 read
 *   Row 1 = up direction:    same layout
 *   Row 2 = right direction: same layout (left is horizontally flipped)
 *
 *   Walk cycle:  frames [0, 1, 2, 1]
 *   Type cycle:  frames [3, 4]
 */

// ─── Constants ────────────────────────────────────────────────────────────────
export const TILE_SIZE = 16;
const WALK_SPEED = 48;        // px/sec
const WALK_FRAME_DUR = 0.14;  // sec per walk frame
const TYPE_FRAME_DUR = 0.4;   // sec per typing frame

export const Dir = { DOWN: 0, LEFT: 1, RIGHT: 2, UP: 3 };
export const State = {
  IDLE: 'IDLE',
  WALK: 'WALK',
  TYPE: 'TYPE',
  READ: 'READ',
};

export const FRAME_W = 16;
export const FRAME_H = 32;
const SHEET_COLS = 5; // frames per row in spritesheet

// ─── Pathfinding (BFS) ────────────────────────────────────────────────────────
export function findPath(tileMap, blockedSet, fromCol, fromRow, toCol, toRow) {
  const rows = tileMap.length;
  const cols = rows > 0 ? tileMap[0].length : 0;
  const key = (c, r) => `${c},${r}`;

  const walkable = (c, r) => {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return false;
    const t = tileMap[r][c];
    if (t === 0 || t === 255) return false; // WALL or VOID
    return true;
  };

  if (!walkable(toCol, toRow)) return [];
  if (fromCol === toCol && fromRow === toRow) return [];

  const queue = [{ c: fromCol, r: fromRow, path: [] }];
  const visited = new Set([key(fromCol, fromRow)]);

  while (queue.length > 0) {
    const { c, r, path } = queue.shift();
    for (const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nc = c + dc, nr = r + dr;
      const k = key(nc, nr);
      if (visited.has(k) || !walkable(nc, nr)) continue;
      visited.add(k);
      const newPath = [...path, { col: nc, row: nr }];
      if (nc === toCol && nr === toRow) return newPath;
      queue.push({ c: nc, r: nr, path: newPath });
    }
  }
  return [];
}

function tileCenter(col, row) {
  return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 };
}

function dirBetween(fc, fr, tc, tr) {
  const dc = tc - fc, dr = tr - fr;
  if (dc > 0) return Dir.RIGHT;
  if (dc < 0) return Dir.LEFT;
  if (dr > 0) return Dir.DOWN;
  return Dir.UP;
}

// ─── Character factory ────────────────────────────────────────────────────────
export function createCharacter(id, seatCol, seatRow, facingDir = Dir.DOWN) {
  const center = tileCenter(seatCol, seatRow);
  return {
    id,
    state: State.TYPE,
    dir: facingDir,
    x: center.x, y: center.y,
    tileCol: seatCol, tileRow: seatRow,
    seatCol, seatRow, facingDir,
    path: [],
    moveProgress: 0,
    frame: 0,
    frameTimer: 0,
    isActive: true,
  };
}

// ─── Character update ─────────────────────────────────────────────────────────
export function updateCharacter(ch, dt, tileMap, blockedSet) {
  ch.frameTimer += dt;

  if (ch.state === State.TYPE) {
    if (ch.frameTimer >= TYPE_FRAME_DUR) {
      ch.frameTimer -= TYPE_FRAME_DUR;
      ch.frame = (ch.frame + 1) % 2;
    }
  } else if (ch.state === State.IDLE) {
    ch.frame = 0;
  } else if (ch.state === State.WALK) {
    if (ch.frameTimer >= WALK_FRAME_DUR) {
      ch.frameTimer -= WALK_FRAME_DUR;
      ch.frame = (ch.frame + 1) % 4;
    }

    if (ch.path.length === 0) {
      const center = tileCenter(ch.tileCol, ch.tileRow);
      ch.x = center.x; ch.y = center.y;
      ch.frame = 0; ch.frameTimer = 0;
      if (ch.tileCol === ch.seatCol && ch.tileRow === ch.seatRow) {
        ch.state = State.TYPE;
        ch.dir = ch.facingDir;
      } else {
        ch.state = State.IDLE;
      }
      return;
    }

    const next = ch.path[0];
    ch.dir = dirBetween(ch.tileCol, ch.tileRow, next.col, next.row);
    ch.moveProgress += (WALK_SPEED / TILE_SIZE) * dt;

    const from = tileCenter(ch.tileCol, ch.tileRow);
    const to = tileCenter(next.col, next.row);
    const t = Math.min(ch.moveProgress, 1);
    ch.x = from.x + (to.x - from.x) * t;
    ch.y = from.y + (to.y - from.y) * t;

    if (ch.moveProgress >= 1) {
      ch.tileCol = next.col; ch.tileRow = next.row;
      ch.x = to.x; ch.y = to.y;
      ch.path.shift();
      ch.moveProgress = 0;
    }
  }
}

// ─── Sprite sheet loading ─────────────────────────────────────────────────────
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { console.warn('Failed to load:', src); resolve(null); };
    img.src = src;
  });
}

function extractFrame(sheet, rowIdx, frameIdx) {
  const oc = document.createElement('canvas');
  oc.width = FRAME_W; oc.height = FRAME_H;
  const ctx = oc.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sheet,
    frameIdx * FRAME_W, rowIdx * FRAME_H,
    FRAME_W, FRAME_H,
    0, 0, FRAME_W, FRAME_H
  );
  return oc;
}

function flipH(src) {
  const oc = document.createElement('canvas');
  oc.width = src.width; oc.height = src.height;
  const ctx = oc.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.translate(src.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return oc;
}

/**
 * Builds walk and type frame arrays from a character sprite sheet.
 * Sheet = 112×96px (7 cols × 3 rows, each frame 16×32):
 *   Row 0 = down, Row 1 = up, Row 2 = right
 *   Cols 0-2 = walk frames, cols 3-4 = type frames, cols 5-6 = read frames
 */
export function buildCharacterFrames(sheet) {
  if (!sheet) return null;

  // Walk cycle uses frames 0,1,2,1 (3 unique poses)
  const walk = (row) => [0,1,2,1].map(i => extractFrame(sheet, row, i));
  // Type cycle uses frames 3,4
  const type = (row) => [3,4].map(i => extractFrame(sheet, row, i));
  // Read cycle uses frames 5,6
  const read = (row) => [5,6].map(i => extractFrame(sheet, row, i));

  const walkDown  = walk(0);
  const walkUp    = walk(1);
  const walkRight = walk(2);
  const walkLeft  = walkRight.map(flipH);

  const typeDown  = type(0);
  const typeUp    = type(1);
  const typeRight = type(2);
  const typeLeft  = typeRight.map(flipH);

  const readDown  = read(0);
  const readUp    = read(1);
  const readRight = read(2);
  const readLeft  = readRight.map(flipH);

  return {
    walk: { [Dir.DOWN]: walkDown, [Dir.UP]: walkUp, [Dir.RIGHT]: walkRight, [Dir.LEFT]: walkLeft },
    type: { [Dir.DOWN]: typeDown, [Dir.UP]: typeUp, [Dir.RIGHT]: typeRight, [Dir.LEFT]: typeLeft },
    read: { [Dir.DOWN]: readDown, [Dir.UP]: readUp, [Dir.RIGHT]: readRight, [Dir.LEFT]: readLeft },
  };
}

export function getCharacterFrame(ch, frames) {
  if (!frames) return null;
  if (ch.state === State.TYPE) {
    const arr = frames.type[ch.dir] ?? frames.type[Dir.DOWN];
    return arr[ch.frame % arr.length];
  }
  if (ch.state === State.READ) {
    const arr = frames.read[ch.dir] ?? frames.read[Dir.DOWN];
    return arr[ch.frame % arr.length];
  }
  const arr = frames.walk[ch.dir] ?? frames.walk[Dir.DOWN];
  return arr[ch.frame % arr.length];
}

// ─── Floor tile loading ───────────────────────────────────────────────────────
export async function loadFloorTiles(basePath) {
  const entries = await Promise.all(
    Array.from({ length: 9 }, (_, i) =>
      loadImage(`${basePath}/floor_${i}.png`).then(img => [i, img])
    )
  );
  return Object.fromEntries(entries);
}

// ─── Furniture sprite loading ─────────────────────────────────────────────────
export async function loadFurnitureSprites(furnitureList, basePath) {
  const seen = new Set();
  const unique = [];
  for (const f of furnitureList) {
    const base = f.type.split(':')[0];
    if (!seen.has(base)) { seen.add(base); unique.push(base); }
  }
  const entries = await Promise.all(
    unique.map(base =>
      loadImage(`${basePath}/${base}.png`).then(img => [base, img])
    )
  );
  return Object.fromEntries(entries);
}
