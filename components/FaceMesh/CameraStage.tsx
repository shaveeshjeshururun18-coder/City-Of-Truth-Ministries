import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Sparkles, AlertCircle, ShieldAlert, CheckCircle2, Sliders, Upload, Image as ImageIcon } from 'lucide-react';
import { AlignmentStatus, FaceBoundingBox, ModelLoadingState, FaceLandmark3D } from './types';
import { initFaceMesh, detectFaceLandmarksFromVideo, analyzeStaticImage, computeBoundingBoxFromLandmarks } from './utils/faceMeshLoader';
import { evaluateFaceAlignment } from './utils/alignmentChecker';
import { cropToCardFormat } from './utils/cardCropper';
import { AlignmentToast } from './Toast';

interface CameraStageProps {
  onPhotoCaptured: (capturedPhoto: any, landmarks: FaceLandmark3D[] | null) => void;
  cardName: string;
  onClose?: () => void;
}

export const CameraStage: React.FC<CameraStageProps> = ({ onPhotoCaptured, cardName, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelState, setModelState] = useState<ModelLoadingState>({
    faceMeshReady: false,
    faceApiReady: false,
    isInitializing: true,
    errorMessage: null,
    isFallbackMode: false,
  });

  const [alignment, setAlignment] = useState<AlignmentStatus>({
    state: 'no_face',
    message: 'Looking for a face…',
    horizontalDirection: 'left',
    verticalDirection: 'up',
    distanceDirection: 'closer',
    centerOffsetX: 0,
    centerOffsetY: 0,
    sizeRatio: 0,
    targetSizeRatio: 0.42,
    score: 0,
  });

  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturingFlash, setIsCapturingFlash] = useState<boolean>(false);
  const [currentFaceBox, setCurrentFaceBox] = useState<FaceBoundingBox | null>(null);
  const [latestLandmarks, setLatestLandmarks] = useState<FaceLandmark3D[] | null>(null);
  const [showAlignedToast, setShowAlignedToast] = useState<boolean>(false);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const detectionLoopRef = useRef<number | null>(null);
  const isAlignedRef = useRef<boolean>(false);

  // Initialize camera safely
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser frame.');
      }

      // Stop existing stream tracks if any
      if (videoRef.current && videoRef.current.srcObject) {
        const existingStream = videoRef.current.srcObject as MediaStream;
        existingStream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr: any) {
          if (playErr.name !== 'AbortError') {
            console.warn('Video play interrupted or rejected:', playErr);
          }
        }
        setHasCameraPermission(true);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setHasCameraPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'SecurityError') {
        setCameraError('Camera access was denied by browser permissions or container settings.');
      } else {
        setCameraError(
          err.message || 'Camera permission denied or camera unavailable.'
        );
      }
    }
  }, []);

  // Initialize Face Models
  useEffect(() => {
    let isMounted = true;

    async function loadModels() {
      setModelState((prev) => ({ ...prev, isInitializing: true }));
      const success = await initFaceMesh();

      if (isMounted) {
        if (success) {
          setModelState({
            faceMeshReady: true,
            faceApiReady: true,
            isInitializing: false,
            errorMessage: null,
            isFallbackMode: false,
          });
        } else {
          setModelState({
            faceMeshReady: false,
            faceApiReady: false,
            isInitializing: false,
            errorMessage: 'Face alignment model load failed. Switch to manual capture.',
            isFallbackMode: true,
          });
        }
      }
    }

    loadModels();
    startCamera();

    return () => {
      isMounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Execute Capture action
  const executeCapture = useCallback(
    (landmarksToUse?: FaceLandmark3D[] | null) => {
      if (!videoRef.current) return;

      setIsCapturingFlash(true);
      setTimeout(() => setIsCapturingFlash(false), 300);

      const capturedPhoto = cropToCardFormat(videoRef.current, currentFaceBox, cardName);
      onPhotoCaptured(capturedPhoto, landmarksToUse || latestLandmarks);
    },
    [currentFaceBox, cardName, latestLandmarks, onPhotoCaptured]
  );

  // Process custom image file or sample photo
  const processImageSource = async (imgElement: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth || imgElement.width || 800;
    canvas.height = imgElement.naturalHeight || imgElement.height || 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imgElement, 0, 0);

    const landmarks = await analyzeStaticImage(canvas);
    let box: FaceBoundingBox | null = null;

    if (landmarks) {
      box = computeBoundingBoxFromLandmarks(landmarks, canvas.width, canvas.height);
    }

    const capturedPhoto = cropToCardFormat(canvas, box, cardName);
    onPhotoCaptured(capturedPhoto, landmarks);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        processImageSource(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSamplePhoto = () => {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 800;
    sampleCanvas.height = 1000;
    const ctx = sampleCanvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 800, 1000);
    grad.addColorStop(0, '#f8fafc');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 1000);

    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(400, 950, 280, 200, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(340, 500, 120, 200);

    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(400, 420, 160, 220, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(330, 400, 20, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(470, 400, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(400, 480, 50, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#64748b';
    ctx.stroke();

    const img = new Image();
    img.onload = () => processImageSource(img);
    img.src = sampleCanvas.toDataURL('image/png');
  };

  // Auto-capture countdown loop
  const startCountdown = useCallback(() => {
    if (countdown !== null) return;

    setCountdown(3);
    let currentCount = 3;

    countdownIntervalRef.current = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdown(currentCount);
      } else {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setCountdown(null);
        executeCapture();
      }
    }, 900);
  }, [countdown, executeCapture]);

  const cancelCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setCountdown(null);
  }, []);

  // Live detection loop throttled to ~150ms
  useEffect(() => {
    let lastTick = 0;

    const runLoop = async (now: number) => {
      if (videoRef.current && hasCameraPermission && !modelState.isFallbackMode) {
        if (now - lastTick >= 140) {
          lastTick = now;

          const res = await detectFaceLandmarksFromVideo(videoRef.current);

          if (res) {
            setCurrentFaceBox(res.box);
            setLatestLandmarks(res.landmarks);

            const status = evaluateFaceAlignment(
              res.box,
              videoRef.current.videoWidth,
              videoRef.current.videoHeight,
              res.landmarks
            );

            setAlignment(status);

            if (status.state === 'aligned') {
              isAlignedRef.current = true;
              setShowAlignedToast(true);
              if (autoCaptureEnabled && countdown === null && !holdTimerRef.current) {
                holdTimerRef.current = setTimeout(() => {
                  if (isAlignedRef.current) {
                    startCountdown();
                  }
                }, 600);
              }
            } else {
              isAlignedRef.current = false;
              setShowAlignedToast(false);
              if (autoCaptureEnabled) {
                cancelCountdown();
              }
            }
          } else {
            setCurrentFaceBox(null);
            setLatestLandmarks(null);
            setAlignment({
              state: 'no_face',
              message: 'Looking for a face…',
              horizontalDirection: 'left',
              verticalDirection: 'up',
              distanceDirection: 'closer',
              centerOffsetX: 0,
              centerOffsetY: 0,
              sizeRatio: 0,
              targetSizeRatio: 0.42,
              score: 0,
            });
            isAlignedRef.current = false;
            if (autoCaptureEnabled) {
              cancelCountdown();
            }
          }
        }
      }

      detectionLoopRef.current = requestAnimationFrame(runLoop);
    };

    detectionLoopRef.current = requestAnimationFrame(runLoop);

    return () => {
      if (detectionLoopRef.current) cancelAnimationFrame(detectionLoopRef.current);
    };
  }, [hasCameraPermission, modelState.isFallbackMode, autoCaptureEnabled, countdown, startCountdown, cancelCountdown]);

  // Color theme derived from state
  const getStatusColorClass = () => {
    if (modelState.isFallbackMode) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (alignment.state === 'aligned') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (alignment.state === 'misaligned') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const getOverlayBorderColor = () => {
    if (modelState.isFallbackMode) return 'stroke-sky-500';
    if (alignment.state === 'aligned') return 'stroke-emerald-500';
    if (alignment.state === 'misaligned') return 'stroke-amber-500';
    return 'stroke-rose-400';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Stage Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden shadow-xs border border-slate-200 group"
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-[60] h-10 w-10 rounded-full bg-white/92 text-slate-700 border border-slate-200 shadow-lg backdrop-blur-md flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label="Close live scan"
            title="Close live scan"
          >
            <X size={20} />
          </button>
        )}

        {/* Flash Effect on Capture */}
        {isCapturingFlash && (
          <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300 pointer-events-none" />
        )}

        {/* Video Stream (Mirrored Selfie View) */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />

        {/* Scanline Animation Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent h-16 w-full animate-scanline pointer-events-none opacity-60" />

        {/* Guide Overlay SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 300 400">
          {/* Outer Card Fit Boundary (3:4 Ratio) */}
          <rect
            x="20"
            y="20"
            width="260"
            height="360"
            rx="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 6"
            className={`${getOverlayBorderColor()} opacity-60 transition-colors duration-300`}
          />

          {/* Inner Target Face Oval Guide */}
          <ellipse
            cx="150"
            cy="185"
            rx="64"
            ry="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`${getOverlayBorderColor()} transition-colors duration-300`}
          />

          {/* Eye Level Alignment Reference Bar */}
          <line
            x1="105"
            y1="162"
            x2="195"
            y2="162"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className={`${getOverlayBorderColor()} opacity-50`}
          />

          {/* Center Crosshairs */}
          <circle
            cx="150"
            cy="185"
            r="3"
            className={`${alignment.state === 'aligned' ? 'fill-emerald-500' : 'fill-slate-400'} opacity-70`}
          />
        </svg>

        {/* Top Status Pill */}
        <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-full border backdrop-blur-md text-xs font-semibold tracking-wide transition-all duration-300 shadow-xs ${getStatusColorClass()}`}
          >
            <span className="relative flex h-2.5 w-2.5">
              {alignment.state === 'aligned' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  alignment.state === 'aligned'
                    ? 'bg-emerald-500'
                    : alignment.state === 'misaligned'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <span>
              {modelState.isFallbackMode
                ? 'Manual Mode Enabled'
                : alignment.message}
            </span>
          </div>

          {/* Score Badge */}
          {!modelState.isFallbackMode && alignment.state !== 'no_face' && (
            <div className="px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 backdrop-blur-md text-[11px] font-mono text-slate-700 shadow-xs">
              Alignment: {Math.round(alignment.score * 100)}%
            </div>
          )}
        </div>

        {/* Non-blocking Alignment Reinforcement Toast */}
        <AlignmentToast
          show={showAlignedToast && !modelState.isFallbackMode}
          message="Perfect Face Alignment!"
          subMessage={
            autoCaptureEnabled
              ? 'Holding position for auto-capture pass'
              : 'Position locked — click capture photo'
          }
        />

        {/* Countdown Ring Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-4 border-emerald-500/40 bg-white shadow-xl">
              <span className="text-5xl font-extrabold text-emerald-600 animate-bounce">
                {countdown}
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-white tracking-wide drop-shadow-md">
              Hold steady for auto-capture…
            </p>
          </div>
        )}

        {/* Camera Permission Pending or Error State */}
        {hasCameraPermission === false && (
          <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Camera Access Restricted</h3>
            <p className="text-xs text-slate-600 max-w-xs mb-5 leading-relaxed">
              {cameraError || 'Camera permission was denied or restricted by your browser. You can retry camera permission or upload an image file.'}
            </p>
            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <button
                onClick={startCamera}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Retry Camera Access
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-500" /> Upload Photo File
              </button>
              <button
                onClick={handleSamplePhoto}
                className="w-full py-2 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-xs border border-slate-200/80 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Use Demo Portrait
              </button>
            </div>
          </div>
        )}

        {/* Model Loading State */}
        {modelState.isInitializing && (
          <div className="absolute bottom-4 left-4 right-4 z-20 px-4 py-2.5 rounded-xl bg-white/90 border border-slate-200 backdrop-blur-md flex items-center gap-3 text-xs text-slate-700 shadow-xs">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Loading Face Alignment Engine…</span>
          </div>
        )}
      </div>

      {/* Control Toolbar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        {/* Auto Capture Toggle */}
        <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 select-none">
          <input
            type="checkbox"
            checked={autoCaptureEnabled}
            onChange={(e) => {
              setAutoCaptureEnabled(e.target.checked);
              if (!e.target.checked) cancelCountdown();
            }}
            disabled={modelState.isFallbackMode}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 relative"></div>
          <span className="font-semibold">
            Auto-capture
            {modelState.isFallbackMode && ' (Disabled)'}
          </span>
        </label>

        {/* Actions Group */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload photo from device"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={() => executeCapture()}
            disabled={!hasCameraPermission || (!modelState.isFallbackMode && alignment.state === 'no_face')}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all ${
              alignment.state === 'aligned' || modelState.isFallbackMode
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Capture Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
