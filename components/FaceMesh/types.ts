export interface FaceLandmark3D {
  x: number;
  y: number;
  z: number;
}

export interface FaceBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AlignmentState = 'no_face' | 'misaligned' | 'aligned';

export interface AlignmentStatus {
  state: AlignmentState;
  message: string;
  horizontalDirection: 'left' | 'right' | 'centered';
  verticalDirection: 'up' | 'down' | 'centered';
  distanceDirection: 'closer' | 'back' | 'optimal';
  centerOffsetX: number; // percentage (-1 to +1)
  centerOffsetY: number; // percentage (-1 to +1)
  sizeRatio: number; // current face height / frame height
  targetSizeRatio: number; // e.g. 0.42
  score: number; // 0 to 1
}

export interface GeometryAnalysis {
  symmetryScore: number; // 0 - 100 percentage
  eyeSpacingRatio: number; // interocular dist / face width
  faceLengthToWidthRatio: number; // length / face width
  jawToCheekboneRatio: number; // jaw width / cheek width
  noseToMouthWidthRatio: number; // nose width / mouth width
  landmarksCount: number;
  confidence: number;
  rawLandmarks: FaceLandmark3D[];
  faceBox?: FaceBoundingBox;
  averageBrightness?: number; // 0 - 100 percentage
  lightingStatus?: 'underexposed' | 'optimal' | 'overexposed';
  lightingSuggestion?: string;
}

export interface CapturedPhoto {
  dataUrl: string;
  timestamp: string;
  width: number;
  height: number;
  analysis: GeometryAnalysis | null;
  cardName: string;
}

export interface ModelLoadingState {
  faceMeshReady: boolean;
  faceApiReady: boolean;
  isInitializing: boolean;
  errorMessage: string | null;
  isFallbackMode: boolean;
}

export type AppMode = 'capture' | 'review';
