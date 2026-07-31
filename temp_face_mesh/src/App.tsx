/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CameraStage } from './components/CameraStage';
import { CardPreview } from './components/CardPreview';
import { GeometryAnalysisPanel } from './components/GeometryAnalysisPanel';
import { AppMode, CapturedPhoto, GeometryAnalysis, FaceLandmark3D } from './types';
import { calculateFacialGeometry, generateFallbackGeometry } from './utils/facialGeometry';
import { downloadPhotoOnlyPng, downloadProfileCardPng } from './utils/cardExporter';
import { Camera, UserCheck, ShieldCheck, ArrowLeft, Download, Loader2, Image as ImageIcon, FileText } from 'lucide-react';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('capture');
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [subjectName, setSubjectName] = useState<string>('Jane Doe');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [modalDownloadMode, setModalDownloadMode] = useState<'photo' | 'card' | null>(null);

  // Callback when photo is captured from CameraStage
  const handlePhotoCaptured = (photo: CapturedPhoto, rawLandmarks: FaceLandmark3D[] | null) => {
    let analysis: GeometryAnalysis;

    if (rawLandmarks && rawLandmarks.length >= 468) {
      analysis = calculateFacialGeometry(rawLandmarks);
    } else {
      analysis = generateFallbackGeometry();
    }

    const photoWithAnalysis: CapturedPhoto = {
      ...photo,
      analysis,
      cardName: subjectName || 'Profile Photo',
    };

    setCapturedPhoto(photoWithAnalysis);
    setAppMode('review');
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setAppMode('capture');
  };

  const handleConfirmPhoto = () => {
    setShowConfirmModal(true);
  };

  const handleModalDownloadPhoto = async () => {
    if (!capturedPhoto) return;
    try {
      setModalDownloadMode('photo');
      await downloadPhotoOnlyPng(capturedPhoto);
    } catch (err) {
      console.error('Failed to download photo in modal:', err);
    } finally {
      setModalDownloadMode(null);
    }
  };

  const handleModalDownloadCard = async () => {
    if (!capturedPhoto) return;
    try {
      setModalDownloadMode('card');
      await downloadProfileCardPng(capturedPhoto);
    } catch (err) {
      console.error('Failed to download card in modal:', err);
    } finally {
      setModalDownloadMode(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Camera className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                FaceScan Studio
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                Live Auto-Alignment • 3:4 Card Crop • Facial Geometry
              </p>
            </div>
          </div>

          {/* Mode Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${
                appMode === 'capture'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {appMode === 'capture' ? 'Phase 1: Live Capture' : 'Phase 2: Review & Analysis'}
            </span>
          </div>
        </div>
      </header>

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Phase 1: Live Selfie Capture */}
        {appMode === 'capture' && (
          <div className="w-full flex flex-col items-center justify-center space-y-6">
            {/* Subject Name Input Bar */}
            <div className="w-full max-w-md flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 pl-2">Profile Name:</span>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Enter name for card..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Camera Stage Component */}
            <CameraStage
              onPhotoCaptured={handlePhotoCaptured}
              cardName={subjectName || 'Profile Photo'}
            />
          </div>
        )}

        {/* Phase 2: Card Preview + Facial Analysis */}
        {appMode === 'review' && capturedPhoto && (
          <div className="w-full space-y-6 animate-in fade-in duration-300">
            {/* Back Navigation Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <button
                onClick={handleRetake}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Return to Camera</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>All processing done 100% in-browser</span>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Official Profile Card Preview */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <CardPreview
                  photo={capturedPhoto}
                  onRetake={handleRetake}
                  onConfirm={handleConfirmPhoto}
                />
              </div>

              {/* Right Column: Geometry Analysis */}
              <div className="lg:col-span-7 space-y-6">
                {capturedPhoto.analysis && (
                  <GeometryAnalysisPanel
                    analysis={capturedPhoto.analysis}
                    photoUrl={capturedPhoto.dataUrl}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && capturedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Photo Confirmed!</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your profile photo for <strong className="text-emerald-700">{capturedPhoto.cardName}</strong> has been confirmed and stored locally.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 text-left space-y-1">
              <div>• Dimensions: 720 × 960 px (3:4 ratio)</div>
              <div>• Symmetry Score: {capturedPhoto.analysis?.symmetryScore}%</div>
              <div>• Output Format: High-Res PNG Card</div>
            </div>

            {/* Download Buttons in Confirmation Modal */}
            <div className="space-y-2">
              <button
                onClick={handleModalDownloadPhoto}
                disabled={modalDownloadMode !== null}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {modalDownloadMode === 'photo' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Photo PNG...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    <span>Download Photo Only (PNG)</span>
                  </>
                )}
              </button>

              <button
                onClick={handleModalDownloadCard}
                disabled={modalDownloadMode !== null}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {modalDownloadMode === 'card' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                    <span>Generating Card...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download Full ID Card (PNG)</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handleRetake();
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Capture Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 bg-white">
        <p>
          FaceScan Studio • Client-Side Face Alignment & Card Generator • No network image transfers
        </p>
      </footer>
    </div>
  );
}

