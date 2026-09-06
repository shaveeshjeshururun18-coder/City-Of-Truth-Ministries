"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ShieldCheck, ArrowRight, QrCode, Sparkles, CheckCircle2, KeyRound } from 'lucide-react';

export interface ModernLoginSignupProps {
  onLogin?: (identifier: string) => void;
  onRegister?: (name: string, email: string) => void;
  onBack?: () => void;
  initialMode?: 'login' | 'signup';
}

/**
 * DotShaderCanvas: A reusable WebGL shader canvas rendering animated dot matrices via Three.js
 */
export function DotShaderCanvas({ className = "fixed inset-0 w-full h-full pointer-events-none z-0" }: { className?: string } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let active = true;
    let renderer: any;
    let geometry: any;
    let material: any;
    let scene: any;
    let camera: any;
    let animationId: number;

    const initThree = (THREE: any) => {
      if (!canvasRef.current || !active) return;
      const canvas = canvasRef.current;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth * 2, window.innerHeight * 2) },
        u_opacities: { value: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1.0] },
        u_colors: { value: [
          new THREE.Vector3(0.96, 0.77, 0.34), // Sacred Amber/Gold (#F59E0B)
          new THREE.Vector3(0.85, 0.85, 0.95), // Pearl Light (#E2E8F0)
          new THREE.Vector3(0.35, 0.60, 0.95), // Celestial Blue (#3B82F6)
          new THREE.Vector3(0.96, 0.77, 0.34),
          new THREE.Vector3(1.0, 0.95, 0.80),
          new THREE.Vector3(0.40, 0.80, 1.00)
        ] },
        u_total_size: { value: 22.0 },
        u_dot_size: { value: 5.5 },
        u_reverse: { value: 0 }
      };

      material = new THREE.ShaderMaterial({
        vertexShader: `
          precision mediump float;
          uniform vec2 u_resolution;
          out vec2 fragCoord;
          void main() {
            gl_Position = vec4(position, 1.0);
            fragCoord = (position.xy + 1.0) * 0.5 * u_resolution;
            fragCoord.y = u_resolution.y - fragCoord.y;
          }
        `,
        fragmentShader: `
          precision mediump float;
          in vec2 fragCoord;

          uniform float u_time;
          uniform float u_opacities[10];
          uniform vec3 u_colors[6];
          uniform float u_total_size;
          uniform float u_dot_size;
          uniform vec2 u_resolution;
          uniform int u_reverse;

          out vec4 fragColor;

          float PHI = 1.61803398874989484820459;
          float random(vec2 xy) {
              return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
          }

          void main() {
              vec2 st = fragCoord.xy;
              st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
              st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

              float opacity = step(0.0, st.x) * step(0.0, st.y);

              vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

              float frequency = 5.0;
              float show_offset = random(st2);
              float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
              opacity *= u_opacities[int(rand * 10.0)];
              opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
              opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

              vec3 color = u_colors[int(show_offset * 6.0)];

              float animation_speed_factor = 2.5;
              vec2 center_grid = u_resolution / 2.0 / u_total_size;
              float dist_from_center = distance(center_grid, st2);

              float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

              float current_timing_offset = timing_offset_intro;
              opacity *= step(current_timing_offset, u_time * animation_speed_factor);
              opacity *= clamp((1.0 - step(current_timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);

              fragColor = vec4(color, opacity);
              fragColor.rgb *= fragColor.a;
          }
        `,
        uniforms: uniforms,
        glslVersion: THREE.GLSL3,
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
        transparent: true
      });

      geometry = new THREE.PlaneGeometry(2, 2);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const startTime = performance.now();
      const animate = () => {
        if (!active) return;
        animationId = requestAnimationFrame(animate);
        uniforms.u_time.value = (performance.now() - startTime) / 1000.0;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!renderer || !canvasRef.current) return;
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.u_resolution.value.set(window.innerWidth * 2, window.innerHeight * 2);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    if ((window as any).THREE) {
      const cleanUp = initThree((window as any).THREE);
      return () => {
        active = false;
        if (cleanUp) cleanUp();
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) renderer.dispose();
        if (geometry) geometry.dispose();
        if (material) material.dispose();
      };
    } else {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).THREE && active) {
          initThree((window as any).THREE);
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      active = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
    />
  );
}

export default function Component({
  onLogin,
  onRegister,
  onBack,
  initialMode = 'login'
}: ModernLoginSignupProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (onLogin) onLogin(identifier || email);
      else alert(`Logging in with identifier: ${identifier || email}`);
    } else {
      if (onRegister) onRegister(fullName, email);
      else alert(`Registering new member: ${fullName} (${email})`);
    }
  };

  /* ─── Social Provider SVGs ─── */
  const GoogleIcon = (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );

  const GitHubIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
  );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 text-white font-sans selection:bg-amber-500 selection:text-slate-950">

      {/* WebGL Dot Canvas Shader Background */}
      <DotShaderCanvas />

      {/* Radial Glow Ambient Overlays */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.6)_0%,rgba(2,6,23,0.95)_100%)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-purple-600/10 to-blue-600/10 blur-[120px] rounded-full pointer-events-none z-1" />

      {/* Main Glassmorphism Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md mx-4 p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] flex flex-col items-center"
      >
        {/* Back Button if provided */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute top-6 left-6 text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10"
          >
            ← Back
          </button>
        )}

        {/* Sacred Branding Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden relative">
              <img
                src="/logo.png"
                alt="City of Truth Logo"
                className="w-10 h-10 object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-serif font-black text-amber-400 text-xl tracking-tighter">COT</span>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/90 mt-3">
            City of Truth Ministries
          </span>
        </div>

        {/* Dynamic Mode Heading */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login-head' : 'signup-head'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white mb-2">
              {isLogin ? 'Welcome Back, Worshipper' : 'Join Sacred Fellowship'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
              {isLogin
                ? 'Enter your Member ID, Phone Number, or Email to access your Entrust profile.'
                : 'Create your official digital worshipper account and receive your Entrust card.'}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Auth Form */}
        <form onSubmit={handleFormSubmit} className="w-full space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Brother / Sister Name"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              {isLogin ? 'Member ID / Email / Phone' : 'Email Address'}
            </label>
            <div className="relative">
              {isLogin ? (
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              ) : (
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              )}
              <input
                type={isLogin ? 'text' : 'email'}
                required
                value={isLogin ? identifier : email}
                onChange={(e) => (isLogin ? setIdentifier(e.target.value) : setEmail(e.target.value))}
                placeholder={isLogin ? 'e.g. COT-2024-1082 or email@domain.com' : 'worshipper@domain.com'}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm rounded-xl shadow-[0_10px_25px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isLogin ? 'Sign In to Account' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="w-full my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            OR CONTINUE WITH
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Social Provider Buttons */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => alert('Google Sign-In ready')}
            className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {GoogleIcon}
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={() => alert('GitHub Sign-In ready')}
            className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {GitHubIcon}
            <span>GitHub</span>
          </button>
        </div>

        {/* Toggle between Login and Signup */}
        <div className="mt-8 text-xs text-slate-400 text-center">
          {isLogin ? (
            <>
              Don't have an Entrust Worshipper Profile?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4 ml-1 transition-colors cursor-pointer"
              >
                Sign Up Now
              </button>
            </>
          ) : (
            <>
              Already registered with City of Truth?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-amber-400 hover:text-amber-300 font-bold underline underline-offset-4 ml-1 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </div>

        {/* Footer Terms */}
        <p className="mt-6 text-[10px] text-slate-500 text-center leading-relaxed max-w-xs">
          By proceeding, you agree to City of Truth Ministries{' '}
          <a href="#" className="text-slate-400 underline">Terms of Sacred Fellowship</a> and{' '}
          <a href="#" className="text-slate-400 underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
