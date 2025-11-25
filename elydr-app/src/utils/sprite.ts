import { ElydrStage } from '@/types';

const SPRITE_GRID = {
  cols: 4,
  rows: 4,
};

const STAGE_SPRITE_MAP: Record<ElydrStage, number[]> = {
  egg: [0, 1],
  hatchling: [2, 3],
  young: [4, 5, 6, 7],
  mature: [8, 9, 10, 11],
  elder: [12, 13, 14, 15],
};

export function getSpritePosition(stage: ElydrStage, growthPoints: number = 0): {
  backgroundPosition: string;
  backgroundSize: string;
} {
  const sprites = STAGE_SPRITE_MAP[stage];
  const spriteIndex = sprites[Math.min(Math.floor(growthPoints / 5), sprites.length - 1)];

  const row = Math.floor(spriteIndex / SPRITE_GRID.cols);
  const col = spriteIndex % SPRITE_GRID.cols;

  const xPos = col * (100 / (SPRITE_GRID.cols - 1));
  const yPos = row * (100 / (SPRITE_GRID.rows - 1));

  return {
    backgroundPosition: `${xPos.toFixed(2)}% ${yPos.toFixed(2)}%`,
    backgroundSize: '400% 400%',
  };
}

export function getAnimatedSpritePosition(
  stage: ElydrStage,
  frame: number
): {
  backgroundPosition: string;
  backgroundSize: string;
} {
  const sprites = STAGE_SPRITE_MAP[stage];
  const spriteIndex = sprites[frame % sprites.length];

  const row = Math.floor(spriteIndex / SPRITE_GRID.cols);
  const col = spriteIndex % SPRITE_GRID.cols;

  const xPos = col * (100 / (SPRITE_GRID.cols - 1));
  const yPos = row * (100 / (SPRITE_GRID.rows - 1));

  return {
    backgroundPosition: `${xPos.toFixed(2)}% ${yPos.toFixed(2)}%`,
    backgroundSize: '400% 400%',
  };
}
