import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, Move } from 'lucide-react';
import { Button } from './Button';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImg: string) => void;
    onCancel: () => void;
}

const MAX_OUTPUT_DIM = 1024;

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onCropComplete, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Crop area state (relative to container)
    const [cropArea, setCropArea] = useState({ x: 40, y: 40, width: 220, height: 220 });
    const [isDraggingCrop, setIsDraggingCrop] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string>('');
    const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });

    const imgRef = useRef<HTMLImageElement>(new Image());
    const [minAllowedScale, setMinAllowedScale] = useState(0.1);
    const viewportSize = 300;

    // Load image
    useEffect(() => {
        const img = imgRef.current;
        img.src = imageSrc;
        img.onload = () => {
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const scaleX = canvas.width / img.width;
                const scaleY = canvas.height / img.height;
                // Fit whole image inside 300x300 box without aggressive zoom
                const fitScale = Math.min(scaleX, scaleY);

                const initialScale = Math.max(0.05, fitScale);
                setMinAllowedScale(initialScale);
                setScale(initialScale);

                const imgW = img.width * initialScale;
                const imgH = img.height * initialScale;
                const posX = (canvas.width - imgW) / 2;
                const posY = (canvas.height - imgH) / 2;
                const cropSize = Math.min(240, Math.max(160, Math.min(imgW, imgH, viewportSize - 40)));

                setImagePosition({ x: posX, y: posY });
                setCropArea({
                    x: (viewportSize - cropSize) / 2,
                    y: (viewportSize - cropSize) / 2,
                    width: cropSize,
                    height: cropSize
                });
            }
            draw();
        };
    }, [imageSrc]);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = imgRef.current;
        if (img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.translate(imagePosition.x, imagePosition.y);
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);
            ctx.restore();
        }
    };

    useEffect(() => {
        draw();
    }, [scale, imagePosition, imageSrc]);

    // Image dragging
    const handleImageMouseDown = (e: React.MouseEvent) => {
        handleDragStart(e.clientX, e.clientY);
    };

    const handleImageTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
    };

    const handleDragStart = (clientX: number, clientY: number) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Check if clicking inside crop area
        if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
            y >= cropArea.y && y <= cropArea.y + cropArea.height) {
            return; // Don't drag image if clicking in crop area
        }

        setIsDraggingImage(true);
        setDragStart({ x: clientX - imagePosition.x, y: clientY - imagePosition.y });
    };

    useEffect(() => {
        const handleMove = (clientX: number, clientY: number) => {
            if (isDraggingImage) {
                let newX = clientX - dragStart.x;
                let newY = clientY - dragStart.y;

                const img = imgRef.current;
                if (img && img.complete) {
                    const imgW = img.width * scale;
                    const imgH = img.height * scale;

                    const minX = Math.min(0, cropArea.x + cropArea.width - imgW);
                    const maxX = Math.max(0, cropArea.x);
                    const minY = Math.min(0, cropArea.y + cropArea.height - imgH);
                    const maxY = Math.max(0, cropArea.y);

                    newX = Math.max(minX, Math.min(maxX, newX));
                    newY = Math.max(minY, Math.min(maxY, newY));
                }

                setImagePosition({ x: newX, y: newY });
            }
            if (isDraggingCrop) {
                const dx = clientX - cropDragStart.x;
                const dy = clientY - cropDragStart.y;

                setCropArea(prev => ({
                    ...prev,
                    x: Math.max(0, Math.min(viewportSize - prev.width, prev.x + dx)),
                    y: Math.max(0, Math.min(viewportSize - prev.height, prev.y + dy))
                }));
                setCropDragStart({ x: clientX, y: clientY });
            }
            if (isResizing) {
                handleResizeAction(clientX, clientY);
            }
        };

        const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const handleTouchMove = (e: TouchEvent) => {
            if (isDraggingImage || isDraggingCrop || isResizing) {
                e.preventDefault();
                const touch = e.touches[0];
                handleMove(touch.clientX, touch.clientY);
            }
        };

        const handleEnd = () => {
            setIsDraggingImage(false);
            setIsDraggingCrop(false);
            setIsResizing(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('mouseup', handleEnd);
        window.addEventListener('touchend', handleEnd);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDraggingImage, isDraggingCrop, isResizing, dragStart, cropDragStart, cropArea]);

    // Crop area dragging
    const handleCropMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDraggingCrop(true);
        setCropDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleCropTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation();
        setIsDraggingCrop(true);
        const touch = e.touches[0];
        setCropDragStart({ x: touch.clientX, y: touch.clientY });
    };

    // Resize handling
    const handleResizeStart = (e: React.MouseEvent, handle: string) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeHandle(handle);
        setCropDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleResizeTouchStart = (e: React.TouchEvent, handle: string) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeHandle(handle);
        const touch = e.touches[0];
        setCropDragStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleResizeAction = (clientX: number, clientY: number) => {
        const dx = clientX - cropDragStart.x;
        const dy = clientY - cropDragStart.y;

        setCropArea(prev => {
            let newArea = { ...prev };

            switch (resizeHandle) {
                case 'nw':
                    newArea.x += dx;
                    newArea.y += dy;
                    newArea.width -= dx;
                    newArea.height -= dy;
                    break;
                case 'ne':
                    newArea.y += dy;
                    newArea.width += dx;
                    newArea.height -= dy;
                    break;
                case 'sw':
                    newArea.x += dx;
                    newArea.width -= dx;
                    newArea.height += dy;
                    break;
                case 'se':
                    newArea.width += dx;
                    newArea.height += dy;
                    break;
            }

            // Constraints
            newArea.width = Math.max(100, Math.min(viewportSize - newArea.x, newArea.width));
            newArea.height = Math.max(100, Math.min(viewportSize - newArea.y, newArea.height));
            newArea.x = Math.max(0, Math.min(viewportSize - newArea.width, newArea.x));
            newArea.y = Math.max(0, Math.min(viewportSize - newArea.height, newArea.y));

            return newArea;
        });

        setCropDragStart({ x: clientX, y: clientY });
    };

    const handleCrop = () => {
        const img = imgRef.current;
        if (img && img.complete && img.naturalWidth > 0) {
            const scaleX = 1 / scale;
            const scaleY = 1 / scale;

            const sourceX = Math.max(0, (cropArea.x - imagePosition.x) * scaleX);
            const sourceY = Math.max(0, (cropArea.y - imagePosition.y) * scaleY);
            const sourceWidth = Math.min(img.naturalWidth - sourceX, cropArea.width * scaleX);
            const sourceHeight = Math.min(img.naturalHeight - sourceY, cropArea.height * scaleY);

            let targetWidth = sourceWidth;
            let targetHeight = sourceHeight;

            if (targetWidth > MAX_OUTPUT_DIM || targetHeight > MAX_OUTPUT_DIM) {
                const ratio = Math.min(MAX_OUTPUT_DIM / targetWidth, MAX_OUTPUT_DIM / targetHeight);
                targetWidth *= ratio;
                targetHeight *= ratio;
            }

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = targetWidth;
            tempCanvas.height = targetHeight;
            const tempCtx = tempCanvas.getContext('2d');

            if (tempCtx) {
                tempCtx.fillStyle = '#ffffff';
                tempCtx.fillRect(0, 0, targetWidth, targetHeight);

                tempCtx.drawImage(
                    img,
                    sourceX, sourceY, sourceWidth, sourceHeight,
                    0, 0, targetWidth, targetHeight
                );
                const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
                onCropComplete(dataUrl);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-serif font-bold text-gray-800 flex items-center gap-2">
                        <Move size={16} /> Adjust Photo
                    </h3>
                    <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center gap-4 bg-slate-100 select-none">
                    <div
                        ref={containerRef}
                        className="relative rounded-lg overflow-hidden shadow-inner border-2 border-white ring-4 ring-gray-200/50"
                        onMouseDown={handleImageMouseDown}
                        onTouchStart={handleImageTouchStart}
                    >
                        <canvas
                            ref={canvasRef}
                            width={300}
                            height={300}
                            className="bg-white block cursor-move"
                        />

                        {/* Darkened overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <svg width="300" height="300" style={{ position: 'absolute', top: 0, left: 0 }}>
                                <defs>
                                    <mask id="cropMask">
                                        <rect width="300" height="300" fill="white" />
                                        <rect
                                            x={cropArea.x}
                                            y={cropArea.y}
                                            width={cropArea.width}
                                            height={cropArea.height}
                                            fill="black"
                                        />
                                    </mask>
                                </defs>
                                <rect width="300" height="300" fill="black" opacity="0.5" mask="url(#cropMask)" />
                            </svg>
                        </div>

                        {/* Draggable crop area with grid */}
                        <div
                            style={{
                                position: 'absolute',
                                left: cropArea.x,
                                top: cropArea.y,
                                width: cropArea.width,
                                height: cropArea.height,
                                cursor: 'move'
                            }}
                            onMouseDown={handleCropMouseDown}
                            onTouchStart={handleCropTouchStart}
                            className="border-2 border-white shadow-lg"
                        >
                            {/* Grid lines */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0 pointer-events-none">
                                <div className="border-r border-b border-white/40"></div>
                                <div className="border-r border-b border-white/40"></div>
                                <div className="border-b border-white/40"></div>
                                <div className="border-r border-b border-white/40"></div>
                                <div className="border-r border-b border-white/40"></div>
                                <div className="border-b border-white/40"></div>
                                <div className="border-r border-white/40"></div>
                                <div className="border-r border-white/40"></div>
                                <div></div>
                            </div>

                            {/* Resize handles */}
                            <div
                                className="absolute -top-2 -left-2 w-6 h-6 bg-brand-500 border-2 border-white rounded-full cursor-nw-resize shadow-lg"
                                onMouseDown={(e) => handleResizeStart(e, 'nw')}
                                onTouchStart={(e) => handleResizeTouchStart(e, 'nw')}
                            />
                            <div
                                className="absolute -top-2 -right-2 w-6 h-6 bg-brand-500 border-2 border-white rounded-full cursor-ne-resize shadow-lg"
                                onMouseDown={(e) => handleResizeStart(e, 'ne')}
                                onTouchStart={(e) => handleResizeTouchStart(e, 'ne')}
                            />
                            <div
                                className="absolute -bottom-2 -left-2 w-6 h-6 bg-brand-500 border-2 border-white rounded-full cursor-sw-resize shadow-lg"
                                onMouseDown={(e) => handleResizeStart(e, 'sw')}
                                onTouchStart={(e) => handleResizeTouchStart(e, 'sw')}
                            />
                            <div
                                className="absolute -bottom-2 -right-2 w-6 h-6 bg-brand-500 border-2 border-white rounded-full cursor-se-resize shadow-lg"
                                onMouseDown={(e) => handleResizeStart(e, 'se')}
                                onTouchStart={(e) => handleResizeTouchStart(e, 'se')}
                            />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full space-y-2 px-4">
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <span>Zoom</span>
                            <span>{(scale * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setScale(prev => Math.max(minAllowedScale, prev - 0.1))}
                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                            >
                                <span className="text-xl font-bold">-</span>
                            </button>
                            <input
                                type="range"
                                min={minAllowedScale}
                                max={Math.max(3, minAllowedScale * 5)}
                                step="0.01"
                                value={scale}
                                onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="flex-1 accent-brand-600 h-1.5 bg-gray-300 rounded-full appearance-none cursor-pointer"
                            />
                            <button
                                onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                            >
                                <span className="text-xl font-bold">+</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2">Drag to move • Drag corners to resize • Zoom slider</p>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
                    <Button onClick={onCancel} variant="outline" className="flex-1">
                        Cancel
                    </Button>
                    <Button onClick={handleCrop} variant="primary" className="flex-1">
                        <Check size={18} className="mr-2" /> Save Photo
                    </Button>
                </div>
            </div>
        </div>
    );
};
