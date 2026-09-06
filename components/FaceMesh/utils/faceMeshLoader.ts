import { FaceLandmark3D, GeometryAnalysis, FaceBoundingBox } from '../types';

// Global types for CDN window objects
declare global {
  interface Window {
    FaceMesh?: any;
    faceapi?: any;
    FACEMESH_TESSELATION?: number[][];
  }
}

let faceMeshInstance: any = null;
let staticFaceMeshInstance: any = null;

async function ensureMediaPipeScripts(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.FaceMesh) return true;

  const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });

  try {
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'),
    ]);
    return !!window.FaceMesh;
  } catch (err) {
    console.warn('Dynamic MediaPipe script loading failed', err);
    return false;
  }
}

export async function initFaceMesh(): Promise<boolean> {
  if (faceMeshInstance) return true;

  try {
    await ensureMediaPipeScripts();
    if (typeof window !== 'undefined' && window.FaceMesh) {
      faceMeshInstance = new window.FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMeshInstance.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
        staticImageMode: false,
      });

      await faceMeshInstance.initialize();
      return true;
    }
    return false;
  } catch (err) {
    console.warn('MediaPipe FaceMesh live initialization failed, switching to fallback', err);
    return false;
  }
}

export async function detectFaceLandmarksFromVideo(
  videoEl: HTMLVideoElement
): Promise<{ landmarks: FaceLandmark3D[]; box: FaceBoundingBox } | null> {
  if (!videoEl || videoEl.readyState < 2) return null;

  return new Promise((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, 400);

    if (faceMeshInstance) {
      faceMeshInstance.onResults((results: any) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const raw = results.multiFaceLandmarks[0];
          const landmarks: FaceLandmark3D[] = raw.map((pt: any) => ({
            x: pt.x,
            y: pt.y,
            z: pt.z,
          }));

          const box = computeBoundingBoxFromLandmarks(landmarks, videoEl.videoWidth, videoEl.videoHeight);
          resolve({ landmarks, box });
        } else {
          resolve(null);
        }
      });

      faceMeshInstance.send({ image: videoEl }).catch(() => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(null);
        }
      });
    } else {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

export async function analyzeStaticImage(
  imageSource: HTMLImageElement | HTMLCanvasElement
): Promise<FaceLandmark3D[] | null> {
  try {
    await ensureMediaPipeScripts();
    if (typeof window === 'undefined' || !window.FaceMesh) return null;

    if (!staticFaceMeshInstance) {
      staticFaceMeshInstance = new window.FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      staticFaceMeshInstance.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        staticImageMode: true,
      });
      await staticFaceMeshInstance.initialize();
    }

    return new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, 3000);

      staticFaceMeshInstance.onResults((results: any) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const raw = results.multiFaceLandmarks[0];
          const landmarks: FaceLandmark3D[] = raw.map((pt: any) => ({
            x: pt.x,
            y: pt.y,
            z: pt.z,
          }));
          resolve(landmarks);
        } else {
          resolve(null);
        }
      });

      staticFaceMeshInstance.send({ image: imageSource }).catch((err: any) => {
        console.warn('Error sending image to static FaceMesh instance:', err);
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(null);
        }
      });
    });
  } catch (err) {
    console.error('Failed static image face analysis:', err);
    return null;
  }
}

export function computeBoundingBoxFromLandmarks(
  landmarks: FaceLandmark3D[],
  imgWidth: number,
  imgHeight: number
): FaceBoundingBox {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  for (const p of landmarks) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  return {
    x: minX * imgWidth,
    y: minY * imgHeight,
    width: (maxX - minX) * imgWidth,
    height: (maxY - minY) * imgHeight,
  };
}
