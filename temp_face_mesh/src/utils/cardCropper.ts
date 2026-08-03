import { FaceBoundingBox, CapturedPhoto } from '../types';

export const CARD_WIDTH = 720;
export const CARD_HEIGHT = 960; // 3:4 aspect ratio

export function cropToCardFormat(
  sourceCanvasOrVideo: HTMLVideoElement | HTMLCanvasElement,
  faceBox: FaceBoundingBox | null,
  cardName: string = 'Profile Photo'
): CapturedPhoto {
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = CARD_WIDTH;
  outputCanvas.height = CARD_HEIGHT;
  const ctx = outputCanvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create canvas 2D context for card cropping');
  }

  const srcWidth =
    'videoWidth' in sourceCanvasOrVideo
      ? sourceCanvasOrVideo.videoWidth
      : sourceCanvasOrVideo.width;
  const srcHeight =
    'videoHeight' in sourceCanvasOrVideo
      ? sourceCanvasOrVideo.videoHeight
      : sourceCanvasOrVideo.height;

  // Calculate crop rectangle in source coordinates
  let cropX = 0;
  let cropY = 0;
  let cropW = srcWidth;
  let cropH = srcHeight;

  if (faceBox) {
    // Target card aspect ratio is 3:4 = 0.75
    const targetAspect = CARD_WIDTH / CARD_HEIGHT;

    // Estimate face height in source video
    const faceH = faceBox.height;
    // We want face height to be approx 42% of the cropped output height
    const desiredCropH = Math.min(srcHeight, faceH / 0.42);
    const desiredCropW = desiredCropH * targetAspect;

    // Check if crop width fits in source image
    if (desiredCropW <= srcWidth) {
      cropH = desiredCropH;
      cropW = desiredCropW;
    } else {
      // Fit to available width
      cropW = srcWidth;
      cropH = cropW / targetAspect;
    }

    // Center horizontally on face box center
    const faceCenterX = faceBox.x + faceBox.width / 2;
    cropX = Math.max(0, Math.min(srcWidth - cropW, faceCenterX - cropW / 2));

    // Vertically position for natural passport headroom (~18% headroom above head top)
    const faceTopY = faceBox.y;
    // Ideal top of crop is slightly above head
    const idealCropY = faceTopY - cropH * 0.18;
    cropY = Math.max(0, Math.min(srcHeight - cropH, idealCropY));
  } else {
    // Fallback: center 3:4 crop on source
    const targetAspect = CARD_WIDTH / CARD_HEIGHT;
    if (srcWidth / srcHeight > targetAspect) {
      cropH = srcHeight;
      cropW = srcHeight * targetAspect;
      cropX = (srcWidth - cropW) / 2;
      cropY = 0;
    } else {
      cropW = srcWidth;
      cropH = srcWidth / targetAspect;
      cropX = 0;
      cropY = (srcHeight - cropH) / 2;
    }
  }

  // Draw cropped frame to output canvas, FLIPPED HORIZONTALLY to match mirrored selfie view
  ctx.save();
  // Translate to right edge and scale -1 on X for horizontal flip
  ctx.translate(CARD_WIDTH, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(
    sourceCanvasOrVideo,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    CARD_WIDTH,
    CARD_HEIGHT
  );
  ctx.restore();

  const dataUrl = outputCanvas.toDataURL('image/jpeg', 0.92);

  return {
    dataUrl,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    analysis: null,
    cardName,
  };
}
