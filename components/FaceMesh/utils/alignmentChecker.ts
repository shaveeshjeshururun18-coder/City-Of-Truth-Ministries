import { AlignmentStatus, FaceBoundingBox, FaceLandmark3D } from '../types';

export const TARGET_FACE_HEIGHT_RATIO = 0.42; // Target: face height ~42% of frame height
export const CENTER_TOLERANCE_X = 0.06; // ~6% horizontal tolerance
export const CENTER_TOLERANCE_Y = 0.06; // ~6% vertical tolerance
export const SIZE_TOLERANCE = 0.09; // ~9% height tolerance (0.33 to 0.51)

export function evaluateFaceAlignment(
  box: FaceBoundingBox | null,
  frameWidth: number,
  frameHeight: number,
  landmarks?: FaceLandmark3D[]
): AlignmentStatus {
  if (!box || frameWidth <= 0 || frameHeight <= 0) {
    return {
      state: 'no_face',
      message: 'Looking for a face…',
      horizontalDirection: 'left',
      verticalDirection: 'up',
      distanceDirection: 'closer',
      centerOffsetX: 0,
      centerOffsetY: 0,
      sizeRatio: 0,
      targetSizeRatio: TARGET_FACE_HEIGHT_RATIO,
      score: 0,
    };
  }

  // Bounding box center relative to normalized frame center (0 to 1)
  const faceCenterX = (box.x + box.width / 2) / frameWidth;
  const faceCenterY = (box.y + box.height / 2) / frameHeight;

  // Normalized offsets from center (0.5, 0.5)
  // Note: in mirrored video view, faceCenterX > 0.5 means face is on screen-right.
  const rawOffsetX = faceCenterX - 0.5;
  const rawOffsetY = faceCenterY - 0.48; // Target center slightly above middle for natural headroom

  // Face size ratio relative to frame height
  const currentSizeRatio = box.height / frameHeight;

  // Evaluate centering tolerance
  const isHorizontallyCentered = Math.abs(rawOffsetX) <= CENTER_TOLERANCE_X;
  const isVerticallyCentered = Math.abs(rawOffsetY) <= CENTER_TOLERANCE_Y;
  const isDistanceOptimal = Math.abs(currentSizeRatio - TARGET_FACE_HEIGHT_RATIO) <= SIZE_TOLERANCE;

  let horizontalDir: 'left' | 'right' | 'centered' = 'centered';
  if (rawOffsetX < -CENTER_TOLERANCE_X) {
    horizontalDir = 'left';
  } else if (rawOffsetX > CENTER_TOLERANCE_X) {
    horizontalDir = 'right';
  }

  let verticalDir: 'up' | 'down' | 'centered' = 'centered';
  if (rawOffsetY < -CENTER_TOLERANCE_Y) {
    verticalDir = 'down';
  } else if (rawOffsetY > CENTER_TOLERANCE_Y) {
    verticalDir = 'up';
  }

  let distanceDir: 'closer' | 'back' | 'optimal' = 'optimal';
  if (currentSizeRatio < TARGET_FACE_HEIGHT_RATIO - SIZE_TOLERANCE) {
    distanceDir = 'closer';
  } else if (currentSizeRatio > TARGET_FACE_HEIGHT_RATIO + SIZE_TOLERANCE) {
    distanceDir = 'back';
  }

  const isAligned = isHorizontallyCentered && isVerticallyCentered && isDistanceOptimal;

  // Compute 0-1 alignment quality score
  const xErr = Math.min(1, Math.abs(rawOffsetX) / (CENTER_TOLERANCE_X * 2));
  const yErr = Math.min(1, Math.abs(rawOffsetY) / (CENTER_TOLERANCE_Y * 2));
  const sErr = Math.min(1, Math.abs(currentSizeRatio - TARGET_FACE_HEIGHT_RATIO) / (SIZE_TOLERANCE * 2));
  const score = Math.max(0, 1 - (xErr * 0.35 + yErr * 0.35 + sErr * 0.3));

  let message = 'Perfect — hold still';
  if (!isAligned) {
    if (distanceDir === 'closer') {
      message = 'Move closer';
    } else if (distanceDir === 'back') {
      message = 'Move back';
    } else if (horizontalDir === 'left') {
      message = 'Move left';
    } else if (horizontalDir === 'right') {
      message = 'Move right';
    } else if (verticalDir === 'up') {
      message = 'Move up';
    } else if (verticalDir === 'down') {
      message = 'Move down';
    }
  }

  return {
    state: isAligned ? 'aligned' : 'misaligned',
    message,
    horizontalDirection: horizontalDir,
    verticalDirection: verticalDir,
    distanceDirection: distanceDir,
    centerOffsetX: rawOffsetX,
    centerOffsetY: rawOffsetY,
    sizeRatio: currentSizeRatio,
    targetSizeRatio: TARGET_FACE_HEIGHT_RATIO,
    score,
  };
}
