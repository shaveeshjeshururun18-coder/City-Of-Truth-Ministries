"use client";

import * as React2 from "react";
import { useEffect, useRef as useRef2, forwardRef, useState } from "react";
import * as React from "react";
import { memo, memo as memo2 } from "react";
import { jsx, jsx as jsx2, jsx as jsx3, jsx as jsx4, jsxs } from "react/jsx-runtime";

// ─── Vertex Shader ──────────────────────────────────────────────────────────

var vertexShaderSource = `#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y); }
  else if (u_fit == 2.) { box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y); }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;
  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;
  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  v_responsiveBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;
  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
    (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
    (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;
  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;
  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) { v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x); }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  v_patternUV *= .01;

  vec2 imageBoxSize;
  if (u_fit == 1.) { imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio; }
  else if (u_fit == 2.) { imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio; }
  else { imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio); }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;
  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;
  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;

// ─── ShaderMount core ────────────────────────────────────────────────────────

var DEFAULT_MAX_PIXEL_COUNT = 1920 * 1080 * 4;

var defaultStyle = `@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;
    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
    }
  }
}`;

function isSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android");
}

function bestGuessBrowserZoom() {
  const viewportScale = visualViewport?.scale ?? 1;
  const viewportWidth = visualViewport?.width ?? window.innerWidth;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  const innerWidth = viewportScale * viewportWidth + scrollbarWidth;
  const ratio = outerWidth / innerWidth;
  const zoomPercentageRounded = Math.round(100 * ratio);
  if (zoomPercentageRounded % 5 === 0) return zoomPercentageRounded / 100;
  if (zoomPercentageRounded === 33) return 1 / 3;
  if (zoomPercentageRounded === 67) return 2 / 3;
  if (zoomPercentageRounded === 133) return 4 / 3;
  return ratio;
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error: " + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string): WebGLProgram | null {
  const vs = createShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error: " + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  gl.detachShader(program, vs);
  gl.detachShader(program, fs);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

type UniformValue = number | boolean | number[] | number[][] | HTMLImageElement;
type Uniforms = Record<string, UniformValue>;

class ShaderMount {
  parentElement: HTMLElement & { paperShaderMount?: ShaderMount };
  canvasElement: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram | null = null;
  uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  fragmentShader: string;
  rafId: number | null = null;
  lastRenderTime = 0;
  currentFrame = 0;
  speed = 0;
  currentSpeed = 0;
  providedUniforms: Uniforms;
  mipmaps: string[] = [];
  hasBeenDisposed = false;
  resolutionChanged = true;
  textures = new Map<string, WebGLTexture>();
  minPixelRatio: number;
  maxPixelCount: number;
  isSafari2 = isSafari();
  uniformCache: Record<string, unknown> = {};
  textureUnitMap = new Map<string, number>();
  renderScale = 1;
  parentWidth = 0;
  parentHeight = 0;
  parentDevicePixelWidth = 0;
  parentDevicePixelHeight = 0;
  devicePixelsSupported = false;
  resizeObserver: ResizeObserver | null = null;

  constructor(
    parentElement: HTMLElement,
    fragmentShader: string,
    uniforms: Uniforms,
    webGlContextAttributes?: WebGLContextAttributes,
    speed = 0,
    frame = 0,
    minPixelRatio = 2,
    maxPixelCount = DEFAULT_MAX_PIXEL_COUNT,
    mipmaps: string[] = []
  ) {
    if (!(parentElement instanceof HTMLElement)) throw new Error("parent must be HTMLElement");
    this.parentElement = parentElement;
    if (!document.querySelector("style[data-paper-shader]")) {
      const s = document.createElement("style");
      s.innerHTML = defaultStyle;
      s.setAttribute("data-paper-shader", "");
      document.head.prepend(s);
    }
    const canvas = document.createElement("canvas");
    this.canvasElement = canvas;
    this.parentElement.prepend(canvas);
    this.fragmentShader = fragmentShader;
    this.providedUniforms = uniforms;
    this.mipmaps = mipmaps;
    this.currentFrame = frame;
    this.minPixelRatio = minPixelRatio;
    this.maxPixelCount = maxPixelCount;
    const gl = canvas.getContext("webgl2", webGlContextAttributes);
    if (!gl) throw new Error("WebGL2 not supported");
    this.gl = gl;
    this.initProgram();
    this.setupPositionAttribute();
    this.setupUniforms();
    this.setUniformValues(this.providedUniforms);
    this.setupResizeObserver();
    visualViewport?.addEventListener("resize", this.handleVisualViewportChange);
    this.setSpeed(speed);
    this.parentElement.setAttribute("data-paper-shader", "");
    this.parentElement.paperShaderMount = this;
    document.addEventListener("visibilitychange", this.handleDocumentVisibilityChange);
  }

  initProgram = () => {
    const prog = createProgram(this.gl, vertexShaderSource, this.fragmentShader);
    if (prog) this.program = prog;
  };

  setupPositionAttribute = () => {
    if (!this.program) return;
    const loc = this.gl.getAttribLocation(this.program, "a_position");
    const buf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(loc);
    this.gl.vertexAttribPointer(loc, 2, this.gl.FLOAT, false, 0, 0);
  };

  setupUniforms = () => {
    if (!this.program) return;
    const locs: Record<string, WebGLUniformLocation | null> = {
      u_time: this.gl.getUniformLocation(this.program, "u_time"),
      u_pixelRatio: this.gl.getUniformLocation(this.program, "u_pixelRatio"),
      u_resolution: this.gl.getUniformLocation(this.program, "u_resolution"),
    };
    Object.entries(this.providedUniforms).forEach(([key, value]) => {
      locs[key] = this.gl.getUniformLocation(this.program!, key);
      if (value instanceof HTMLImageElement) {
        locs[`${key}AspectRatio`] = this.gl.getUniformLocation(this.program!, `${key}AspectRatio`);
      }
    });
    this.uniformLocations = locs;
  };

  setupResizeObserver = () => {
    this.resizeObserver = new ResizeObserver(([entry]) => {
      if (entry?.borderBoxSize[0]) {
        const phys = entry.devicePixelContentBoxSize?.[0];
        if (phys) {
          this.devicePixelsSupported = true;
          this.parentDevicePixelWidth = phys.inlineSize;
          this.parentDevicePixelHeight = phys.blockSize;
        }
        this.parentWidth = entry.borderBoxSize[0].inlineSize;
        this.parentHeight = entry.borderBoxSize[0].blockSize;
      }
      this.handleResize();
    });
    this.resizeObserver.observe(this.parentElement);
  };

  handleVisualViewportChange = () => {
    this.resizeObserver?.disconnect();
    this.setupResizeObserver();
  };

  handleResize = () => {
    let tw = 0, th = 0;
    const dpr = Math.max(1, window.devicePixelRatio);
    const pinchZoom = visualViewport?.scale ?? 1;
    if (this.devicePixelsSupported) {
      const scale = Math.max(1, this.minPixelRatio / dpr);
      tw = this.parentDevicePixelWidth * scale * pinchZoom;
      th = this.parentDevicePixelHeight * scale * pinchZoom;
    } else {
      let trs = Math.max(dpr, this.minPixelRatio) * pinchZoom;
      if (this.isSafari2) trs *= Math.max(1, bestGuessBrowserZoom());
      tw = Math.round(this.parentWidth) * trs;
      th = Math.round(this.parentHeight) * trs;
    }
    const headroom = Math.sqrt(this.maxPixelCount) / Math.sqrt(tw * th);
    const sc = Math.min(1, headroom);
    const nw = Math.round(tw * sc);
    const nh = Math.round(th * sc);
    const nrs = nw / Math.round(this.parentWidth);
    if (this.canvasElement.width !== nw || this.canvasElement.height !== nh || this.renderScale !== nrs) {
      this.renderScale = nrs;
      this.canvasElement.width = nw;
      this.canvasElement.height = nh;
      this.resolutionChanged = true;
      this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
      this.render(performance.now());
    }
  };

  render = (currentTime: number) => {
    if (this.hasBeenDisposed || !this.program) return;
    const dt = currentTime - this.lastRenderTime;
    this.lastRenderTime = currentTime;
    if (this.currentSpeed !== 0) this.currentFrame += dt * this.currentSpeed;
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.uniformLocations.u_time!, this.currentFrame * 1e-3);
    if (this.resolutionChanged) {
      this.gl.uniform2f(this.uniformLocations.u_resolution!, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniform1f(this.uniformLocations.u_pixelRatio!, this.renderScale);
      this.resolutionChanged = false;
    }
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    if (this.currentSpeed !== 0) this.requestRender();
    else this.rafId = null;
  };

  requestRender = () => {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(this.render);
  };

  setTextureUniform = (uniformName: string, image: HTMLImageElement) => {
    if (!image.complete || image.naturalWidth === 0) return;
    const existing = this.textures.get(uniformName);
    if (existing) this.gl.deleteTexture(existing);
    if (!this.textureUnitMap.has(uniformName)) this.textureUnitMap.set(uniformName, this.textureUnitMap.size);
    const unit = this.textureUnitMap.get(uniformName)!;
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
    if (this.mipmaps.includes(uniformName)) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    }
    if (texture) {
      this.textures.set(uniformName, texture);
      const loc = this.uniformLocations[uniformName];
      if (loc) {
        this.gl.uniform1i(loc, unit);
        const arLoc = this.uniformLocations[`${uniformName}AspectRatio`];
        if (arLoc) this.gl.uniform1f(arLoc, image.naturalWidth / image.naturalHeight);
      }
    }
  };

  areUniformValuesEqual = (a: unknown, b: unknown): boolean => {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) return a.every((v, i) => this.areUniformValuesEqual(v, (b as unknown[])[i]));
    return false;
  };

  setUniformValues = (updated: Uniforms) => {
    if (!this.program) return;
    this.gl.useProgram(this.program);
    Object.entries(updated).forEach(([key, value]) => {
      let cacheVal: unknown = value;
      if (value instanceof HTMLImageElement) cacheVal = `${value.src.slice(0,200)}|${value.naturalWidth}x${value.naturalHeight}`;
      if (this.areUniformValuesEqual(this.uniformCache[key], cacheVal)) return;
      this.uniformCache[key] = cacheVal;
      const loc = this.uniformLocations[key];
      if (!loc) return;
      if (value instanceof HTMLImageElement) {
        this.setTextureUniform(key, value);
      } else if (Array.isArray(value)) {
        const flat = (Array.isArray(value[0]) ? (value as number[][]).flat() : value) as number[];
        const len = Array.isArray(value[0]) ? (value[0] as number[]).length : flat.length;
        if (len === 2) this.gl.uniform2fv(loc, flat);
        else if (len === 3) this.gl.uniform3fv(loc, flat);
        else if (len === 4) this.gl.uniform4fv(loc, flat);
        else if (len === 9) this.gl.uniformMatrix3fv(loc, false, flat);
        else if (len === 16) this.gl.uniformMatrix4fv(loc, false, flat);
      } else if (typeof value === "number") {
        this.gl.uniform1f(loc, value);
      } else if (typeof value === "boolean") {
        this.gl.uniform1i(loc, value ? 1 : 0);
      }
    });
  };

  getCurrentFrame = () => this.currentFrame;
  setFrame = (f: number) => { this.currentFrame = f; this.lastRenderTime = performance.now(); this.render(performance.now()); };
  setSpeed = (s = 1) => { this.speed = s; this.setCurrentSpeed(document.hidden ? 0 : s); };
  setCurrentSpeed = (s: number) => {
    this.currentSpeed = s;
    if (this.rafId === null && s !== 0) { this.lastRenderTime = performance.now(); this.rafId = requestAnimationFrame(this.render); }
    if (this.rafId !== null && s === 0) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  };
  setMaxPixelCount = (n = DEFAULT_MAX_PIXEL_COUNT) => { this.maxPixelCount = n; this.handleResize(); };
  setMinPixelRatio = (n = 2) => { this.minPixelRatio = n; this.handleResize(); };
  setUniforms = (newUniforms: Uniforms) => {
    this.setUniformValues(newUniforms);
    this.providedUniforms = { ...this.providedUniforms, ...newUniforms };
    this.render(performance.now());
  };
  handleDocumentVisibilityChange = () => { this.setCurrentSpeed(document.hidden ? 0 : this.speed); };
  dispose = () => {
    this.hasBeenDisposed = true;
    if (this.rafId !== null) { cancelAnimationFrame(this.rafId); this.rafId = null; }
    if (this.gl && this.program) {
      this.textures.forEach(t => this.gl.deleteTexture(t));
      this.textures.clear();
      this.gl.deleteProgram(this.program);
      this.program = null;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    visualViewport?.removeEventListener("resize", this.handleVisualViewportChange);
    document.removeEventListener("visibilitychange", this.handleDocumentVisibilityChange);
    this.uniformLocations = {};
    this.canvasElement.remove();
    delete this.parentElement.paperShaderMount;
  };
}

// ─── Color utilities ─────────────────────────────────────────────────────────

type ColorArray = [number, number, number, number];
const fallbackColor: ColorArray = [0, 0, 0, 1];
const clampN = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

function hexToRgba(hex: string): ColorArray {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  if (hex.length === 6) hex = hex + "ff";
  return [
    parseInt(hex.slice(0,2),16)/255,
    parseInt(hex.slice(2,4),16)/255,
    parseInt(hex.slice(4,6),16)/255,
    parseInt(hex.slice(6,8),16)/255,
  ];
}
function parseRgba(rgba: string): ColorArray {
  const m = rgba.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);
  if (!m) return [0,0,0,1];
  return [parseInt(m[1]??'0')/255, parseInt(m[2]??'0')/255, parseInt(m[3]??'0')/255, m[4]===undefined?1:parseFloat(m[4])];
}
function parseHsla(hsla: string): [number,number,number,number] {
  const m = hsla.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);
  if (!m) return [0,0,0,1];
  return [parseInt(m[1]??'0'), parseInt(m[2]??'0'), parseInt(m[3]??'0'), m[4]===undefined?1:parseFloat(m[4])];
}
function hslaToRgba([h,s,l,a]: [number,number,number,number]): ColorArray {
  const sd=s/100, ld=l/100;
  const A=sd*Math.min(ld,1-ld);
  const ch=(n:number)=>{const k=(n+h/30)%12,v=ld-A*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(255*Math.max(0,Math.min(1,v))).toString(16).padStart(2,"0");};
  const [r,g,b2] = [parseFloat("0x"+ch(0))/255, parseFloat("0x"+ch(8))/255, parseFloat("0x"+ch(4))/255];
  return [r,g,b2,a];
}
function getShaderColorFromString(c: string | number[]): ColorArray {
  if (Array.isArray(c)) return c.length===4 ? c as ColorArray : [...c,1] as ColorArray;
  if (typeof c !== "string") return fallbackColor;
  let v: ColorArray;
  if (c.startsWith("#")) v = hexToRgba(c);
  else if (c.startsWith("rgb")) v = parseRgba(c);
  else if (c.startsWith("hsl")) v = hslaToRgba(parseHsla(c));
  else return fallbackColor;
  return [clampN(v[0],0,1),clampN(v[1],0,1),clampN(v[2],0,1),clampN(v[3],0,1)];
}

// ─── Empty pixel ─────────────────────────────────────────────────────────────

const emptyPixel = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
function getEmptyPixel(): HTMLImageElement | undefined {
  if (typeof window === "undefined") return undefined;
  const img = new Image();
  img.src = emptyPixel;
  return img;
}

// ─── useMergeRefs ────────────────────────────────────────────────────────────

type Ref<T> = React.RefCallback<T> | React.RefObject<T> | null | undefined;
function useMergeRefs<T>(refs: Ref<T>[]): React.RefCallback<T> | null {
  const cleanupRef = React.useRef<(() => void) | undefined>(undefined);
  const refEffect = React.useCallback((instance: T | null) => {
    const cleanups = refs.map(ref => {
      if (ref == null) return undefined;
      if (typeof ref === "function") {
        const cb = ref as React.RefCallback<T>;
        const cleanup = cb(instance);
        return typeof cleanup === "function" ? cleanup : () => cb(null);
      }
      (ref as React.MutableRefObject<T | null>).current = instance;
      return () => { (ref as React.MutableRefObject<T | null>).current = null; };
    });
    return () => cleanups.forEach(c => c?.());
  }, refs);

  return React.useMemo(() => {
    if (refs.every(r => r == null)) return null;
    return (value: T | null) => {
      if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = undefined; }
      if (value != null) cleanupRef.current = refEffect(value);
    };
  }, refs);
}

// ─── processUniforms ─────────────────────────────────────────────────────────

function setMinImageSize(img: HTMLImageElement) {
  if (img.naturalWidth < 1024 && img.naturalHeight < 1024) {
    if (img.naturalWidth < 1 || img.naturalHeight < 1) return;
    const a = img.naturalWidth / img.naturalHeight;
    img.width = Math.round(a > 1 ? 1024 * a : 1024);
    img.height = Math.round(a > 1 ? 1024 : 1024 / a);
  }
}

type RawUniformValue = string | number | boolean | number[] | number[][] | HTMLImageElement;
type RawUniforms = Record<string, RawUniformValue>;

async function processUniforms(uniformsProp: RawUniforms): Promise<Uniforms> {
  const processed: Uniforms = {};
  const promises: Promise<void>[] = [];
  const isValidUrl = (u: string) => { try { if (u.startsWith("/")) return true; new URL(u); return true; } catch { return false; } };
  const isExternal = (u: string) => { try { if (u.startsWith("/")) return false; return new URL(u, window.location.origin).origin !== window.location.origin; } catch { return false; } };

  Object.entries(uniformsProp).forEach(([key, value]) => {
    if (typeof value === "string") {
      if (!value) { processed[key] = getEmptyPixel() as HTMLImageElement; return; }
      if (!isValidUrl(value)) return;
      promises.push(new Promise((resolve, reject) => {
        const img = new Image();
        if (isExternal(value)) img.crossOrigin = "anonymous";
        img.onload = () => { setMinImageSize(img); processed[key] = img; resolve(); };
        img.onerror = () => reject();
        img.src = value;
      }));
    } else if (value instanceof HTMLImageElement) {
      setMinImageSize(value);
      processed[key] = value;
    } else {
      processed[key] = value as UniformValue;
    }
  });
  await Promise.all(promises.map(p => p.catch(() => {})));
  return processed;
}

// ─── ShaderMount React Component ─────────────────────────────────────────────

interface ShaderMountProps extends React.HTMLAttributes<HTMLDivElement> {
  fragmentShader: string;
  uniforms: RawUniforms;
  webGlContextAttributes?: WebGLContextAttributes;
  speed?: number;
  frame?: number;
  width?: number | string;
  height?: number | string;
  minPixelRatio?: number;
  maxPixelCount?: number;
  mipmaps?: string[];
}

const ShaderMountComponent = forwardRef<HTMLDivElement, ShaderMountProps>(
  function ShaderMountImpl({ fragmentShader, uniforms: uniformsProp, webGlContextAttributes, speed = 0, frame = 0, width, height, minPixelRatio, maxPixelCount, mipmaps, style, ...divProps }, forwardedRef) {
    const [isInitialized, setIsInitialized] = useState(false);
    const divRef = useRef2<HTMLDivElement>(null);
    const shaderMountRef = useRef2<ShaderMount | null>(null);
    const webGlContextAttributesRef = useRef2(webGlContextAttributes);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        const uniforms = await processUniforms(uniformsProp);
        if (!cancelled && divRef.current && !shaderMountRef.current) {
          shaderMountRef.current = new ShaderMount(divRef.current, fragmentShader, uniforms, webGlContextAttributesRef.current, speed, frame, minPixelRatio, maxPixelCount, mipmaps);
          setIsInitialized(true);
        }
      })();
      return () => { cancelled = true; shaderMountRef.current?.dispose(); shaderMountRef.current = null; };
    }, [fragmentShader]);

    useEffect(() => {
      let stale = false;
      (async () => {
        const uniforms = await processUniforms(uniformsProp);
        if (!stale) shaderMountRef.current?.setUniforms(uniforms);
      })();
      return () => { stale = true; };
    }, [uniformsProp, isInitialized]);

    useEffect(() => { shaderMountRef.current?.setSpeed(speed); }, [speed, isInitialized]);
    useEffect(() => { shaderMountRef.current?.setMaxPixelCount(maxPixelCount); }, [maxPixelCount, isInitialized]);
    useEffect(() => { shaderMountRef.current?.setMinPixelRatio(minPixelRatio); }, [minPixelRatio, isInitialized]);
    useEffect(() => { shaderMountRef.current?.setFrame(frame); }, [frame, isInitialized]);

    const mergedRef = useMergeRefs([divRef, forwardedRef]);

    return jsx("div", {
      ref: mergedRef,
      style: width !== undefined || height !== undefined
        ? { width: typeof width === "string" && !isNaN(+width) ? +width : width, height: typeof height === "string" && !isNaN(+height) ? +height : height, ...style }
        : style,
      ...divProps
    });
  }
);
ShaderMountComponent.displayName = "ShaderMount";

// ─── Shader sources ──────────────────────────────────────────────────────────

const simplexNoise = `
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v) {
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1;
  i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;
  i=mod(i,289.);vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m;m=m*m;vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);
  vec3 a0=x-ox;m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);
}`;

const proceduralHash21 = `float hash21(vec2 p){p=fract(p*vec2(0.3183099,0.3678794))+0.1;p+=dot(p,p+19.19);return fract(p.x*p.y);}`;
const declarePI = `#define TWO_PI 6.28318530718\n#define PI 3.14159265358979323846`;

const ditheringFragmentShader = `#version 300 es
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform float u_pixelRatio;
uniform float u_originX;uniform float u_originY;uniform float u_worldWidth;uniform float u_worldHeight;
uniform float u_fit;uniform float u_scale;uniform float u_rotation;uniform float u_offsetX;uniform float u_offsetY;
uniform float u_pxSize;uniform vec4 u_colorBack;uniform vec4 u_colorFront;uniform float u_shape;uniform float u_type;
out vec4 fragColor;
${simplexNoise}
${declarePI}
${proceduralHash21}
float hash11(float p){p=fract(p*.3183099)+.1;p*=p+19.19;return fract(p*p);}
float getSimplexNoise(vec2 uv,float t){float n=.5*snoise(uv-vec2(0.,.3*t));n+=.5*snoise(2.*uv+vec2(0.,.32*t));return n;}
const int bayer8x8[64]=int[64](0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21);
const int bayer4x4[16]=int[16](0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5);
const int bayer2x2[4]=int[4](0,2,3,1);
float getBayerValue(vec2 uv,int size){ivec2 pos=ivec2(fract(uv/float(size))*float(size));int idx=pos.y*size+pos.x;if(size==2)return float(bayer2x2[idx])/4.;if(size==4)return float(bayer4x4[idx])/16.;return float(bayer8x8[idx])/64.;}
void main(){
  float t=.5*u_time;float pxSize=u_pxSize*u_pixelRatio;
  vec2 pxSizeUV=gl_FragCoord.xy-.5*u_resolution;pxSizeUV/=pxSize;
  vec2 canvPxUV=(floor(pxSizeUV)+.5)*pxSize;vec2 normUV=canvPxUV/u_resolution;
  vec2 boxOrigin=vec2(.5-u_originX,u_originY-.5);
  vec2 givenBoxSize=max(vec2(u_worldWidth,u_worldHeight),vec2(1.))*u_pixelRatio;
  float r=u_rotation*PI/180.;mat2 rot=mat2(cos(r),sin(r),-sin(r),cos(r));
  vec2 graphicOffset=vec2(-u_offsetX,u_offsetY);
  vec2 shapeUV=normUV;
  if(u_shape>3.5){
    vec2 boxSize=vec2((u_worldWidth==0.)?u_resolution.x:givenBoxSize.x,(u_worldHeight==0.)?u_resolution.y:givenBoxSize.y);
    vec2 objBoxSize=vec2(min(boxSize.x,boxSize.y));if(u_fit==1.)objBoxSize=vec2(min(u_resolution.x,u_resolution.y));else if(u_fit==2.)objBoxSize=vec2(max(u_resolution.x,u_resolution.y));
    vec2 objScale=u_resolution.xy/objBoxSize;shapeUV*=objScale;shapeUV+=boxOrigin*(objScale-1.);shapeUV+=graphicOffset;shapeUV/=u_scale;shapeUV=rot*shapeUV;
  }else{
    vec2 boxSize=vec2((u_worldWidth==0.)?u_resolution.x:givenBoxSize.x,(u_worldHeight==0.)?u_resolution.y:givenBoxSize.y);
    float pbr=boxSize.x/boxSize.y;
    vec2 pbs=vec2(pbr*min(boxSize.x/pbr,boxSize.y));float nfw=pbs.x;if(u_fit==1.)pbs.x=pbr*min(u_resolution.x/pbr,u_resolution.y);else if(u_fit==2.)pbs.x=pbr*max(u_resolution.x/pbr,u_resolution.y);pbs.y=pbs.x/pbr;
    vec2 psc=u_resolution.xy/pbs;shapeUV+=graphicOffset/psc;shapeUV+=boxOrigin;shapeUV-=boxOrigin/psc;shapeUV*=u_resolution.xy;shapeUV/=u_pixelRatio;if(u_fit>0.)shapeUV*=(nfw/pbs.x);shapeUV/=u_scale;shapeUV=rot*shapeUV;shapeUV+=boxOrigin/psc;shapeUV-=boxOrigin;shapeUV+=.5;
  }
  float shape=0.;
  if(u_shape<1.5){shapeUV*=.001;shape=.5+.5*getSimplexNoise(shapeUV,t);shape=smoothstep(.3,.9,shape);}
  else if(u_shape<2.5){shapeUV*=.003;for(float i=1.;i<6.;i++){shapeUV.x+=.6/i*cos(i*2.5*shapeUV.y+t);shapeUV.y+=.6/i*cos(i*1.5*shapeUV.x+t);}shape=.15/max(.001,abs(sin(t-shapeUV.y-shapeUV.x)));shape=smoothstep(.02,1.,shape);}
  else if(u_shape<3.5){shapeUV*=.05;float si=floor(2.*shapeUV.x/TWO_PI);float rnd=hash11(si*10.);rnd=sign(rnd-.5)*pow(.1+abs(rnd),.4);shape=sin(shapeUV.x)*cos(shapeUV.y-5.*rnd*t);shape=pow(abs(shape),6.);}
  else if(u_shape<4.5){shapeUV*=4.;float wave=cos(.5*shapeUV.x-2.*t)*sin(1.5*shapeUV.x+t)*(.75+.25*cos(3.*t));shape=1.-smoothstep(-1.,1.,shapeUV.y+wave);}
  else if(u_shape<5.5){float dist=length(shapeUV);shape=sin(pow(dist,1.7)*7.-3.*t)*.5+.5;}
  else if(u_shape<6.5){float l=length(shapeUV);float angle=6.*atan(shapeUV.y,shapeUV.x)+4.*t;float twist=1.2;float offset=1./pow(max(l,1e-6),twist)+angle/TWO_PI;float mid=smoothstep(0.,1.,pow(l,twist));shape=mix(0.,fract(offset),mid);}
  else{shapeUV*=2.;float d=1.-pow(length(shapeUV),2.);vec3 pos=vec3(shapeUV,sqrt(max(0.,d)));vec3 lp=normalize(vec3(cos(1.5*t),.8,sin(1.25*t)));shape=.5+.5*dot(lp,pos);shape*=step(0.,d);}
  int type=int(floor(u_type));float dith=0.;
  if(type==1)dith=step(hash21(canvPxUV),shape);else if(type==2)dith=getBayerValue(pxSizeUV,2);else if(type==3)dith=getBayerValue(pxSizeUV,4);else dith=getBayerValue(pxSizeUV,8);
  dith-=.5;float res=step(.5,shape+dith);
  vec3 fg=u_colorFront.rgb*u_colorFront.a;float fa=u_colorFront.a;
  vec3 bg=u_colorBack.rgb*u_colorBack.a;float ba=u_colorBack.a;
  vec3 color=fg*res;float opacity=fa*res;color+=bg*(1.-opacity);opacity+=ba*(1.-opacity);
  fragColor=vec4(color,opacity);
}`;

const DitheringShapes: Record<string,number> = { simplex:1, warp:2, dots:3, wave:4, ripple:5, swirl:6, sphere:7 };
const DitheringTypes: Record<string,number> = { random:1, "2x2":2, "4x4":3, "8x8":4 };
const ShaderFitOptions: Record<string,number> = { none:0, contain:1, cover:2 };

// ─── Dithering component ──────────────────────────────────────────────────────

interface DitheringProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number; frame?: number; colorBack?: string; colorFront?: string;
  shape?: string; type?: string; pxSize?: number; size?: number;
  fit?: string; scale?: number; rotation?: number; originX?: number; originY?: number;
  offsetX?: number; offsetY?: number; worldWidth?: number; worldHeight?: number;
}

const Dithering = memo(function DitheringImpl({ speed=1, frame=0, colorBack="#000000", colorFront="#00b2ff", shape="sphere", type="4x4", pxSize, size, fit="none", scale=0.6, rotation=0, originX=0.5, originY=0.5, offsetX=0, offsetY=0, worldWidth=0, worldHeight=0, ...props }: DitheringProps) {
  const sz = size ?? pxSize ?? 2;
  const uniforms = {
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorFront: getShaderColorFromString(colorFront),
    u_shape: DitheringShapes[shape] ?? 7,
    u_type: DitheringTypes[type] ?? 3,
    u_pxSize: sz,
    u_fit: ShaderFitOptions[fit] ?? 0,
    u_scale: scale, u_rotation: rotation, u_offsetX: offsetX, u_offsetY: offsetY,
    u_originX: originX, u_originY: originY, u_worldWidth: worldWidth, u_worldHeight: worldHeight,
  };
  return jsx2(ShaderMountComponent, { ...props, speed, frame, fragmentShader: ditheringFragmentShader, uniforms } as unknown as React.HTMLAttributes<HTMLDivElement>);
});

// ─── Ticket constants & helpers ───────────────────────────────────────────────

const REF = 741;

export const TICKET_GEOMETRY = { aspect: 741/425, cornerRadius: 25/REF, notchRadius: 21/REF, perforation: 562/REF };
export const TICKET_LAYOUT = {
  padding: 57/REF, labelTop: 58/REF, labelSize: 19.72/REF, labelLead: 28/REF, labelTracking: 0.016,
  nameTop: 185/REF, nameSize: 64.79/REF, nameLead: 65/REF, nameTracking: -0.01,
  footerTop: 348/REF, footerSize: 19.72/REF, footerTracking: 0.016,
  stubSize: 67.61/REF, stubTracking: 0, stubOpacity: 0.88,
  watermarkSize: 144/REF, watermarkOpacity: 0.6, watermarkColor: "#ffdcbe", inkColor: "#5a3520",
};
export const TICKET_TEXTURE = {
  engine: "generative" as const,
  colorBack: "#ef671c", colorFront: "#ffc691", colorHighlight: "#fe9046",
  shape: "warp", type: "random", size: 0.5, colorSteps: 4, originalColors: true,
  scale: 1, rotation: 0, offsetX: 0, offsetY: 0, speed: 0.4,
};
export const TICKET_GRADIENT = {
  centreX: 0.62, centreY: 0.3, radius: 0.58, midStop: 0.45,
  colorLight: "#ffc691", colorMid: "#fe9046", colorDark: "#ef671c",
};
export const TICKET_STYLE = { texture: TICKET_TEXTURE, gradient: TICKET_GRADIENT };

const SHAPES = ["simplex","warp","dots","wave","ripple","swirl","sphere"];
const TYPES = ["random","2x2","4x4","8x8"];

export function ticketClipPath(width: number, height: number, geometry = TICKET_GEOMETRY) {
  const r = geometry.cornerRadius * width, n = geometry.notchRadius * width, p = geometry.perforation * width;
  return [`M ${r} 0`,`L ${p-n} 0`,`A ${n} ${n} 0 0 0 ${p+n} 0`,`L ${width-r} 0`,`A ${r} ${r} 0 0 0 ${width} ${r}`,`L ${width} ${height-r}`,`A ${r} ${r} 0 0 0 ${width-r} ${height}`,`L ${p+n} ${height}`,`A ${n} ${n} 0 0 0 ${p-n} ${height}`,`L ${r} ${height}`,`A ${r} ${r} 0 0 0 0 ${height-r}`,`L 0 ${r}`,`A ${r} ${r} 0 0 0 ${r} 0`,"Z"].join(" ");
}

function splitName(name: string, max = 3): string[] {
  const clean = name.trim().replace(/\s+/g," ").toUpperCase();
  if (!clean) return [];
  const lines: string[] = [];
  for (const word of clean.split(" ")) {
    if (lines.length < max) lines.push(word);
    else lines[lines.length-1] = `${lines[lines.length-1]} ${word}`;
  }
  return lines;
}

function fitScale(lines: string[], opts: { availableWidth: number; availableHeight: number; fontSize: number; lineHeight: number; tracking: number }) {
  if (!lines.length) return 1;
  const { availableWidth, availableHeight, fontSize, lineHeight, tracking } = opts;
  if (fontSize <= 0 || availableWidth <= 0) return 1;
  const longest = Math.max(...lines.map(l => l.length));
  const charWidth = (0.6 + tracking) * fontSize;
  const block = lines.length * lineHeight;
  return Math.max(0.05, Math.min(1, charWidth > 0 ? availableWidth/(longest*charWidth) : 1, block > 0 && availableHeight > 0 ? availableHeight/block : 1));
}

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function usePrefersReducedMotion() {
  return React2.useSyncExternalStore(
    onChange => { const mq = window.matchMedia(MOTION_QUERY); mq.addEventListener("change",onChange); return () => mq.removeEventListener("change",onChange); },
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );
}

function useDrift(speed: number) {
  const [offset, setOffset] = React2.useState({ x:0, y:0 });
  const reduced = usePrefersReducedMotion();
  const active = speed > 0 && !reduced;
  React2.useEffect(() => {
    if (!active) return;
    let raf = 0, start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = (now-start)/1000*speed;
      setOffset({ x: 0.06*Math.sin(0.37*t), y: 0.045*Math.cos(0.23*t) });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, speed]);
  return active ? offset : { x:0, y:0 };
}

// ─── TicketCard ───────────────────────────────────────────────────────────────

interface TicketTexture {
  engine: "generative" | "image";
  colorBack: string; colorFront: string; colorHighlight: string;
  shape: string; type: string; size: number; colorSteps: number; originalColors: boolean;
  scale: number; rotation: number; offsetX: number; offsetY: number; speed: number;
}

interface TicketCardProps {
  name: string; presenter?: string; event?: string; venue?: string; dates?: string;
  stubText?: string; watermark?: string; width?: number;
  geometry?: typeof TICKET_GEOMETRY; layout?: typeof TICKET_LAYOUT;
  texture?: TicketTexture; gradient?: typeof TICKET_GRADIENT; className?: string;
}

export function TicketCard({ name, presenter, event, venue, dates, stubText, watermark, width=REF, geometry=TICKET_GEOMETRY, layout=TICKET_LAYOUT, texture=TICKET_TEXTURE, gradient=TICKET_GRADIENT, className }: TicketCardProps) {
  const height = width / geometry.aspect;
  const perfX = geometry.perforation * width;
  const reduced = usePrefersReducedMotion();
  const drift = useDrift(texture.engine === "image" ? texture.speed : 0);
  const lines = splitName(name);
  const scale = fitScale(lines, {
    availableWidth: perfX - layout.padding*width - 0.03*width,
    availableHeight: layout.footerTop*width - layout.nameTop*width - 0.02*width,
    fontSize: layout.nameSize*width, lineHeight: layout.nameLead*width, tracking: layout.nameTracking,
  });
  const shaderStyle: React2.CSSProperties = { position:"absolute", inset:0, width, height };
  return jsxs("div", {
    className: `relative select-none ${className ?? ""}`,
    style: { width, height, clipPath: `path('${ticketClipPath(width, height, geometry)}')` },
    children: [
      jsx4("div", { className: "absolute inset-0", style: { background: texture.colorBack } }),
      jsx4(Dithering, {
        colorBack: texture.colorBack, colorFront: texture.colorFront,
        shape: texture.shape, type: texture.type, size: texture.size,
        scale: texture.scale, rotation: texture.rotation,
        offsetX: texture.offsetX + drift.x, offsetY: texture.offsetY + drift.y,
        speed: reduced ? 0 : texture.speed, style: shaderStyle,
      } as DitheringProps),
      jsx4("div", {
        className: "absolute top-0 bottom-0",
        style: { left: perfX, width: Math.max(1, 2.2e-3*width), backgroundImage: `repeating-linear-gradient(to bottom, ${layout.inkColor}55 0 ${0.012*width}px, transparent ${0.012*width}px ${0.024*width}px)` },
      }),
      jsx4("div", {
        className: "pointer-events-none absolute grid place-items-center font-bold tabular-nums",
        style: { left: perfX, top: 0, width: width-perfX, height, color: layout.watermarkColor, opacity: layout.watermarkOpacity },
        children: jsx4("span", { style: { writingMode: "vertical-rl", fontSize: layout.watermarkSize*width, lineHeight: 1, letterSpacing: "-0.04em" }, children: watermark }),
      }),
      jsxs("div", { className: "absolute inset-0", style: { color: layout.inkColor }, children: [
        jsxs("div", { className: "absolute whitespace-pre uppercase", style: { left: layout.padding*width, top: layout.labelTop*width, fontSize: layout.labelSize*width, lineHeight: `${layout.labelLead*width}px`, letterSpacing: `${layout.labelTracking}em` }, children: [presenter, "\n", event] }),
        jsx4("div", { className: "absolute font-medium", style: { left: layout.padding*width, top: layout.nameTop*width, fontSize: layout.nameSize*width*scale, lineHeight: `${layout.nameLead*width*scale}px`, letterSpacing: `${layout.nameTracking}em` }, children: lines.map((line, i) => jsx4("div", { children: line }, i)) }),
        jsxs("div", { className: "absolute whitespace-nowrap uppercase", style: { left: layout.padding*width, top: layout.footerTop*width, fontSize: layout.footerSize*width, letterSpacing: `${layout.footerTracking}em` }, children: [venue, " · ", dates] }),
        jsx4("div", { className: "absolute grid place-items-center font-medium whitespace-nowrap uppercase", style: { left: perfX, top: 0, width: width-perfX, height, fontSize: layout.stubSize*width, letterSpacing: `${layout.stubTracking}em`, opacity: layout.stubOpacity }, children: jsx4("span", { style: { writingMode: "vertical-rl" }, children: stubText }) }),
      ]}),
    ],
  });
}

// ─── TiltCard ─────────────────────────────────────────────────────────────────

interface TiltCardProps {
  children: React2.ReactNode; clipPath?: string;
  maxTilt?: number; scale?: number; glare?: number; className?: string;
}

export function TiltCard({ children, clipPath, maxTilt=9, scale=1.02, glare=0.16, className }: TiltCardProps) {
  const cardRef = React2.useRef<HTMLDivElement>(null);
  const glareRef = React2.useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = React2.useState(false);
  const onMove = React2.useCallback((e: React2.PointerEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX-rect.left)/rect.width-0.5;
    const dy = (e.clientY-rect.top)/rect.height-0.5;
    el.style.transform = `perspective(1200px) rotateX(${-(dy*2)*maxTilt}deg) rotateY(${dx*2*maxTilt}deg) scale(${scale})`;
    if (glareRef.current) glareRef.current.style.background = `radial-gradient(38% 55% at ${(dx+0.5)*100}% ${(dy+0.5)*100}%, rgba(255,255,255,${glare}) 0%, rgba(255,255,255,0) 70%)`;
  }, [maxTilt, scale, glare]);
  const onLeave = React2.useCallback(() => {
    setHovering(false);
    if (cardRef.current) cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)";
    if (glareRef.current) glareRef.current.style.background = "transparent";
  }, []);
  return jsxs("div", {
    ref: cardRef,
    onPointerEnter: () => setHovering(true), onPointerMove: onMove, onPointerLeave: onLeave,
    className: `relative w-fit will-change-transform ${className ?? ""}`,
    style: { transition: hovering ? "none" : "transform 420ms cubic-bezier(0.22,1,0.36,1)", transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)", transformStyle: "preserve-3d" },
    children: [
      children,
      glare > 0 && jsx4("div", { ref: glareRef, "aria-hidden": true, className: "pointer-events-none absolute inset-0", style: { clipPath, transition: hovering ? "none" : "background 420ms ease-out" } }),
    ],
  });
}

// ─── AdmitOneTicket (main export) ────────────────────────────────────────────

interface AdmitOneTicketProps extends TicketCardProps {
  tilt?: false | Omit<TiltCardProps, "children" | "clipPath">;
  onSubmitContact?: (data: { name: string; email: string; subject: string; message: string }) => Promise<void>;
}

export function AdmitOneTicket({ tilt, ...props }: AdmitOneTicketProps) {
  const width = props.width ?? REF;
  const geometry = props.geometry ?? TICKET_GEOMETRY;
  if (tilt === false) return jsx4(TicketCard, props as TicketCardProps);
  return jsx4(TiltCard, {
    clipPath: `path('${ticketClipPath(width, width/geometry.aspect, geometry)}')`,
    ...tilt,
    children: jsx4(TicketCard, props as TicketCardProps),
  });
}

// ─── Remix utilities ──────────────────────────────────────────────────────────

function hslToHex(h: number, s: number, l: number): string {
  const sat=s/100, lig=l/100, a=sat*Math.min(lig,1-lig);
  const ch=(n: number) => { const k=(n+h/30)%12, v=lig-a*Math.max(-1,Math.min(k-3,9-k,1)); return Math.round(255*Math.max(0,Math.min(1,v))).toString(16).padStart(2,"0"); };
  return `#${ch(0)}${ch(8)}${ch(4)}`;
}
const pick = <T,>(list: T[], rnd: ()=>number): T => list[Math.floor(rnd()*list.length)%list.length];
const between = (min: number, max: number, rnd: ()=>number) => min+rnd()*(max-min);

export function remixTexture(prev: typeof TICKET_TEXTURE, rnd=Math.random) {
  const hue=between(8,44,rnd), dark=hslToHex(hue,88,between(45,56,rnd)), light=hslToHex(hue+between(-6,10,rnd),92,between(74,88,rnd)), swap=rnd()<.5;
  return { ...prev, colorBack: swap?light:dark, colorFront: swap?dark:light, colorHighlight: hslToHex(hue+between(-4,6,rnd),90,between(60,72,rnd)), shape: pick(SHAPES,rnd), type: pick(TYPES,rnd), size: between(0.4,3.2,rnd), colorSteps: Math.round(between(2,6,rnd)), rotation: between(0,360,rnd), scale: between(1.45,2.1,rnd), offsetX: between(-0.3,0.3,rnd), offsetY: between(-0.3,0.3,rnd), speed: between(0.15,0.7,rnd) };
}
export function remixGradient(prev: typeof TICKET_GRADIENT, rnd=Math.random) {
  const hue=between(8,44,rnd);
  return { ...prev, centreX: between(0.25,0.8,rnd), centreY: between(0.15,0.7,rnd), radius: between(0.35,0.85,rnd), midStop: between(0.3,0.6,rnd), colorLight: hslToHex(hue+between(-4,8,rnd),95,between(78,90,rnd)), colorMid: hslToHex(hue,96,between(58,68,rnd)), colorDark: hslToHex(hue-between(0,6,rnd),92,between(44,54,rnd)) };
}
export function remixTicketStyle(prev: typeof TICKET_STYLE) {
  return { texture: remixTexture(prev.texture), gradient: remixGradient(prev.gradient) };
}

// ─── Audio ────────────────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;
type BurstOpts = { gain: number; decay: number; frequency: number; q: number };
function burst(ctx: AudioContext, at: number, opts: BurstOpts) {
  const length = Math.ceil(0.05*ctx.sampleRate);
  const buffer = ctx.createBuffer(1,length,ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i=0;i<length;i++) data[i]=Math.random()*2-1;
  const source = ctx.createBufferSource(); source.buffer = buffer;
  const filter = ctx.createBiquadFilter(); filter.type="bandpass"; filter.frequency.value=opts.frequency; filter.Q.value=opts.q;
  const gain = ctx.createGain(); gain.gain.setValueAtTime(1e-4,at); gain.gain.exponentialRampToValueAtTime(opts.gain,at+1e-3); gain.gain.exponentialRampToValueAtTime(1e-4,at+opts.decay);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(at); source.stop(at+opts.decay+0.02);
}
export function playShutterSound({ volume=0.35, gap=0.045 } = {}) {
  const Ctor = typeof window !== "undefined" ? (window.AudioContext ?? (window as any).webkitAudioContext) : undefined;
  if (!Ctor) return;
  audioCtx ??= new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  const now = audioCtx.currentTime;
  burst(audioCtx, now, { gain: volume, decay: 0.035, frequency: 3200, q: 1.1 });
  burst(audioCtx, now+gap, { gain: volume*0.75, decay: 0.055, frequency: 1800, q: 0.9 });
}

export default AdmitOneTicket;
