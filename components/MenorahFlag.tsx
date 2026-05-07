import React, { useEffect, useRef, useState } from 'react';

interface MenorahFlagProps {
    width?: number;
    height?: number;
    windSpeed?: number;
    showControlsButton?: boolean;
    className?: string;
}

const MenorahFlag: React.FC<MenorahFlagProps> = ({
    width = 800,
    height = 600,
    windSpeed: initialWindSpeed = 8,
    showControlsButton = true,
    className = ''
}) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [windSpeed, setWindSpeed] = useState(initialWindSpeed);
    const [showControls, setShowControls] = useState(false);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Clear existing content
        canvasRef.current.innerHTML = '';

        // Dynamic script loading for Three.js
        const loadScript = (src: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                const existing = document.querySelector(`script[src="${src}"]`);
                if (existing) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => resolve();
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };

        const initFlag = async (): Promise<(() => void) | undefined> => {
            try {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');

                // Wait for THREE to be available
                await new Promise(resolve => setTimeout(resolve, 100));

                if (typeof (window as any).THREE === 'undefined') {
                    console.error('THREE.js failed to load');
                    return;
                }

                const THREE = (window as any).THREE;
                const container = canvasRef.current!;

                // Scene Setup
                const scene = new THREE.Scene();
                scene.background = new THREE.Color(0x0b3ea8);

                const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
                camera.position.set(0, 0, 35);

                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
                renderer.setSize(width, height);
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                renderer.setPixelRatio(window.devicePixelRatio);
                container.appendChild(renderer.domElement);

                // Lighting
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
                scene.add(ambientLight);

                const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
                dirLight.position.set(10, 20, 20);
                dirLight.castShadow = true;
                dirLight.shadow.mapSize.width = 2048;
                dirLight.shadow.mapSize.height = 2048;
                scene.add(dirLight);

                const spotLight = new THREE.SpotLight(0xffd700, 1.5);
                spotLight.position.set(-20, 10, 10);
                spotLight.lookAt(0, 0, 0);
                scene.add(spotLight);

                // Flag Pole
                const poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 35, 32);
                const poleMaterial = new THREE.MeshStandardMaterial({
                    color: 0xd4af37,
                    roughness: 0.2,
                    metalness: 0.8
                });
                const pole = new THREE.Mesh(poleGeometry, poleMaterial);
                pole.position.y = -8;
                pole.position.x = -14;
                pole.receiveShadow = true;
                pole.castShadow = true;
                scene.add(pole);

                // Top ornament
                const ballGeo = new THREE.SphereGeometry(0.6, 32, 32);
                const ballMat = new THREE.MeshStandardMaterial({
                    color: 0xffd700,
                    metalness: 0.9,
                    roughness: 0.1
                });
                const ball = new THREE.Mesh(ballGeo, ballMat);
                ball.position.set(-14, 9.5, 0);
                scene.add(ball);

                // Create animated Menorah Flag Texture
                const textureCanvas = document.createElement('canvas');
                textureCanvas.width = 1024;
                textureCanvas.height = 682;
                const ctx = textureCanvas.getContext('2d')!;
                const candlePositions = [
                    { x: 0, y: -80 },
                    { x: -40, y: -60 },
                    { x: -80, y: -40 },
                    { x: -120, y: -20 },
                    { x: 40, y: -60 },
                    { x: 80, y: -40 },
                    { x: 120, y: -20 }
                ];

                const drawMenorahTexture = (animationTime: number) => {
                    // Blue background stripes
                    const blueColor = '#003399';
                    ctx.fillStyle = blueColor;
                    ctx.fillRect(0, 0, 1024, 120);
                    ctx.fillRect(0, 562, 1024, 120);

                    // White middle section
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 120, 1024, 442);

                    // Hebrew text "יהוה" repeated (YHWH - Tetragrammaton)
                    ctx.fillStyle = '#FFD700';
                    ctx.font = 'bold 70px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const hebrewText = 'יהוה';
                    const spacing = 130;
                    const startX = 150;
                    const topY = 60;
                    const bottomY = 622;

                    // Top stripe text
                    for (let i = 0; i < 7; i++) {
                        ctx.fillText(hebrewText, startX + i * spacing, topY);
                    }

                    // Bottom stripe text
                    for (let i = 0; i < 7; i++) {
                        ctx.fillText(hebrewText, startX + i * spacing, bottomY);
                    }

                    // Draw Menorah
                    const centerX = 512;
                    const centerY = 341;

                    // Base
                    ctx.fillStyle = '#DAA520';
                    ctx.beginPath();
                    ctx.moveTo(centerX - 60, centerY + 100);
                    ctx.lineTo(centerX + 60, centerY + 100);
                    ctx.lineTo(centerX + 50, centerY + 80);
                    ctx.lineTo(centerX - 50, centerY + 80);
                    ctx.closePath();
                    ctx.fill();

                    // Stem
                    ctx.fillRect(centerX - 8, centerY - 80, 16, 180);

                    // Branches
                    const drawBranch = (x: number, y: number, side: 'left' | 'right') => {
                        ctx.strokeStyle = '#DAA520';
                        ctx.lineWidth = 8;
                        ctx.beginPath();
                        ctx.arc(
                            x,
                            y,
                            40,
                            side === 'left' ? Math.PI * 0.5 : Math.PI * 0,
                            side === 'left' ? Math.PI : Math.PI * 0.5
                        );
                        ctx.stroke();
                    };

                    // Left branches
                    drawBranch(centerX - 40, centerY - 60, 'left');
                    drawBranch(centerX - 80, centerY - 40, 'left');
                    drawBranch(centerX - 120, centerY - 20, 'left');

                    // Right branches
                    drawBranch(centerX + 40, centerY - 60, 'right');
                    drawBranch(centerX + 80, centerY - 40, 'right');
                    drawBranch(centerX + 120, centerY - 20, 'right');

                    // Candle holders and flames
                    const drawCandle = (x: number, y: number, index: number) => {
                        // Holder
                        ctx.fillStyle = '#DAA520';
                        ctx.beginPath();
                        ctx.arc(x, y, 6, 0, Math.PI * 2);
                        ctx.fill();

                        // Flame (live burning animation)
                        const flicker = Math.sin(animationTime * 8 + index * 1.17) * 2.4 + Math.sin(animationTime * 13 + index * 0.83) * 1.1;
                        const flameHeight = 15 + flicker;
                        const flameWidth = 5 + Math.sin(animationTime * 10 + index) * 1.2;
                        const flameTipY = y - 6 - flameHeight;

                        ctx.fillStyle = '#FF4500';
                        ctx.beginPath();
                        ctx.moveTo(x, y - 6);
                        ctx.quadraticCurveTo(x - flameWidth, y - 11, x, flameTipY);
                        ctx.quadraticCurveTo(x + flameWidth, y - 11, x, y - 6);
                        ctx.fill();

                        ctx.fillStyle = '#FFA500';
                        ctx.beginPath();
                        ctx.moveTo(x, y - 8);
                        ctx.quadraticCurveTo(x - flameWidth * 0.45, y - 12, x, flameTipY + 5);
                        ctx.quadraticCurveTo(x + flameWidth * 0.45, y - 12, x, y - 8);
                        ctx.fill();

                        ctx.fillStyle = 'rgba(255, 220, 120, 0.25)';
                        ctx.beginPath();
                        ctx.arc(x, y - 14, 8 + Math.abs(flicker) * 0.8, 0, Math.PI * 2);
                        ctx.fill();
                    };

                    // Draw 7 candles
                    candlePositions.forEach((pos, index) => {
                        drawCandle(centerX + pos.x, centerY + pos.y, index);
                    });

                    // Olive branches
                    const drawOliveBranch = (startX: number, startY: number, flip: boolean) => {
                        ctx.strokeStyle = '#DAA520';
                        ctx.lineWidth = 4;

                        // Main branch curve
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        const controlX = flip ? startX - 60 : startX + 60;
                        ctx.quadraticCurveTo(controlX, startY - 30, flip ? startX - 80 : startX + 80, startY - 80);
                        ctx.stroke();

                        // Leaves
                        ctx.fillStyle = '#DAA520';
                        for (let i = 0; i < 8; i++) {
                            const t = i / 8;
                            const x = startX + (flip ? -1 : 1) * t * 80;
                            const y = startY - t * 80;
                            const leafX = x + (flip ? -15 : 15);
                            const leafY = y + (i % 2 === 0 ? -8 : 8);

                            ctx.beginPath();
                            ctx.ellipse(leafX, leafY, 8, 4, flip ? Math.PI / 4 : -Math.PI / 4, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    };

                    drawOliveBranch(centerX - 150, centerY + 60, true);
                    drawOliveBranch(centerX + 150, centerY + 60, false);

                };

                const flagWidth = 24;
                const flagHeight = 16;
                const segW = 50;
                const segH = 30;

                const geometry = new THREE.PlaneGeometry(flagWidth, flagHeight, segW, segH);

                drawMenorahTexture(0);
                const texture = new THREE.CanvasTexture(textureCanvas);
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                    roughness: 0.6,
                    metalness: 0.1
                });

                const flag = new THREE.Mesh(geometry, material);
                flag.position.set(-2, 2, 0);
                flag.castShadow = true;
                flag.receiveShadow = true;
                scene.add(flag);

                // Store original positions
                const positionAttribute = geometry.attributes.position;
                const originalPositions: { x: number; y: number; z: number }[] = [];

                for (let i = 0; i < positionAttribute.count; i++) {
                    originalPositions.push({
                        x: positionAttribute.getX(i),
                        y: positionAttribute.getY(i),
                        z: positionAttribute.getZ(i)
                    });
                }

                // Animation
                let time = 0;
                let currentWindSpeed = windSpeed;

                let animationFrameId = 0;
                let isDisposed = false;

                const animate = () => {
                    if (isDisposed) return;
                    animationFrameId = requestAnimationFrame(animate);

                    time += 0.01 * currentWindSpeed;

                    // Update flag vertices
                    for (let i = 0; i < positionAttribute.count; i++) {
                        const x = originalPositions[i].x;
                        const y = originalPositions[i].y;

                        const pinOffset = flagWidth / 2;
                        const xNorm = (x + pinOffset) / flagWidth;

                        if (xNorm < 0.05) {
                            positionAttribute.setZ(i, 0);
                            continue;
                        }

                        const wave1 = Math.sin(x * 0.5 - time) * 2.0;
                        const wave2 = Math.sin(x * 1.5 - time * 1.2) * 0.5;
                        const wave3 = Math.sin(y * 0.5 + time * 0.5) * 0.5;

                        const amplitude = xNorm * xNorm;
                        const z = (wave1 + wave2 + wave3) * amplitude;

                        positionAttribute.setZ(i, z);
                    }

                    positionAttribute.needsUpdate = true;
                    geometry.computeVertexNormals();
                    drawMenorahTexture(time);
                    texture.needsUpdate = true;

                    renderer.render(scene, camera);
                };

                animate();

                // Cleanup
                return () => {
                    isDisposed = true;
                    if (animationFrameId) {
                        cancelAnimationFrame(animationFrameId);
                    }
                    renderer.dispose();
                    geometry.dispose();
                    material.dispose();
                    texture.dispose();
                    if (container.contains(renderer.domElement)) {
                        container.removeChild(renderer.domElement);
                    }
                };
            } catch (error) {
                console.error('Error initializing flag:', error);
                return undefined;
            }
        };

        let cleanup: (() => void) | void;
        let mounted = true;
        initFlag().then((disposeFn) => {
            if (!mounted && disposeFn) {
                disposeFn();
                return;
            }
            cleanup = disposeFn;
        });

        return () => {
            mounted = false;
            if (cleanup) cleanup();
        };
    }, [width, height, windSpeed]);

    return (
        <div className={`relative ${className}`}>
            <div
                ref={canvasRef}
                style={{ width: `${width}px`, height: `${height}px` }}
                className="rounded-lg shadow-2xl overflow-hidden"
            />

            {showControlsButton && (
                <button
                    onClick={() => setShowControls(!showControls)}
                    className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-black/80 transition-all"
                >
                    ⚙️ Controls
                </button>
            )}

            {showControlsButton && showControls && (
                <div className="absolute top-16 right-4 bg-black/80 backdrop-blur-md text-white p-6 rounded-lg shadow-2xl border border-white/10 w-64">
                    <h3 className="text-lg font-bold mb-4">Flag Controls</h3>

                    <div className="mb-4">
                        <label className="block text-sm mb-2 text-gray-300">
                            Wind Speed: {windSpeed.toFixed(1)}
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="0.1"
                            value={windSpeed}
                            onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                            className="w-full accent-blue-500 cursor-pointer"
                        />
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-4">
                        Scroll to zoom in/out
                    </p>
                </div>
            )}
        </div>
    );
};

export default MenorahFlag;
