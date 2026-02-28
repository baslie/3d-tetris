export const FIELD = { W: 6, H: 12, D: 6 };

export const PIECES = [
  { blocks: [[0,0,0],[1,0,0],[2,0,0],[3,0,0]], color: 0x00f0f0 }, // I
  { blocks: [[0,0,0],[1,0,0],[2,0,0],[2,0,1]], color: 0xf0a000 }, // L
  { blocks: [[0,0,0],[1,0,0],[2,0,0],[1,0,1]], color: 0xa000f0 }, // T
  { blocks: [[0,0,0],[1,0,0],[1,0,1],[2,0,1]], color: 0x00f000 }, // S
  { blocks: [[0,0,0],[1,0,0],[0,0,1],[1,0,1]], color: 0xf0f000 }, // O
];

export const SMOOTH_DROP_MS = 100;
export const TRAIL_MS = 300;
export const CLEAR_ANIM_MS = 300;
export const BASE_DROP_INTERVAL = 1000;

export const BG_COLOR = 0x1a1a2e;
export const GRID_COLOR = 0x4a9eff;
export const EDGE_COLOR = 0x4a9eff;
