import { useEffect, useRef, useCallback, useState } from 'react';

// Compact cell format: [x, y, char, colorIndex, bgColorIndex?]
type CellData = (number | string)[];

type Frame = {
  duration: number;
  cells: CellData[];
};

type AsciiMotionComponentProps = {
  showControls?: boolean;
  autoPlay?: boolean;
  onReady?: (api: {
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    restart: () => void;
  }) => void;
};

const COLORS: string[] = ["#1C2405","#2E3A0D","#3D4F10","#5A6B1A","#7A9022","#9DB82C","#C2E035","#D4FF3E"];

import framesJson from './AsciiJellyfish2.frames.json';
const FRAMES = framesJson as unknown as Frame[];

const CANVAS_WIDTH = 1436.4;
const CANVAS_HEIGHT = 900;
const CELL_WIDTH = 10.8;
const CELL_HEIGHT = 18;
const FONT_SIZE = 18;
const FONT_FAMILY = "SF Mono, Monaco, Cascadia Code, Consolas, JetBrains Mono, Fira Code, Monaspace Neon, Geist Mono, Courier New, monospace";
const BACKGROUND_COLOR = "transparent";

// WebGL Shader Post-Processing
if (typeof window !== "undefined") {

// ── WebGL Shader Post-Processing Runtime ──
(function() {
  var VERTEX_SRC = "#version 300 es\nprecision highp float;\n\nin vec2 a_position;\nin vec2 a_texCoord;\n\nout vec2 v_texCoord;\n\nvoid main() {\n  gl_Position = vec4(a_position, 0.0, 1.0);\n  v_texCoord = a_texCoord;\n}\n";
  var SHADER_DEFS = [{
    passes: 3,
    passShaders: ["#version 300 es\nprecision highp float;\n\nuniform sampler2D u_texture;\nuniform vec2 u_resolution;\nuniform float u_time;\nuniform float u_frame;\n\nuniform float u_threshold;\nuniform vec3 u_colorA;\nuniform vec3 u_colorB;\nuniform float u_colorMode;\n\nin vec2 v_texCoord;\nout vec4 fragColor;\n\n\n// --- Common utilities (auto-injected) ---\n\n// Simple hash function\nfloat hash(vec2 p) {\n  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\n}\n\n// 2D hash returning vec2\nvec2 hash2(vec2 p) {\n  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));\n  return fract(sin(p) * 43758.5453);\n}\n\n// Simple value noise\nfloat noise(vec2 p) {\n  vec2 i = floor(p);\n  vec2 f = fract(p);\n  f = f * f * (3.0 - 2.0 * f);\n  float a = hash(i);\n  float b = hash(i + vec2(1.0, 0.0));\n  float c = hash(i + vec2(0.0, 1.0));\n  float d = hash(i + vec2(1.0, 1.0));\n  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n}\n\n// Luminance (rec.709)\nfloat luminance(vec3 c) {\n  return dot(c, vec3(0.2126, 0.7152, 0.0722));\n}\n\n// RGB to HSL\nvec3 rgb2hsl(vec3 c) {\n  float maxC = max(max(c.r, c.g), c.b);\n  float minC = min(min(c.r, c.g), c.b);\n  float l = (maxC + minC) * 0.5;\n  if (maxC == minC) return vec3(0.0, 0.0, l);\n  float d = maxC - minC;\n  float s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);\n  float h;\n  if (maxC == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);\n  else if (maxC == c.g) h = (c.b - c.r) / d + 2.0;\n  else h = (c.r - c.g) / d + 4.0;\n  h /= 6.0;\n  return vec3(h, s, l);\n}\n\n// Hex color to vec3 (for uniform binding from JS hex strings)\n// Not used in GLSL directly — conversion happens on the JS side\n\n// --- End common utilities ---\n\n\nvoid main() {\n  vec4 texel = texture(u_texture, v_texCoord);\n  float lum = luminance(texel.rgb);\n  \n  // Soft threshold with smooth transition\n  float brightness = smoothstep(u_threshold, u_threshold + 0.1, lum);\n  \n  // Color mode: 0 = source (tint with colorA), 1 = gradient (lerp A→B by luminance)\n  vec3 tint;\n  if (u_colorMode < 0.5) {\n    tint = texel.rgb * u_colorA;\n  } else {\n    tint = mix(u_colorA, u_colorB, lum);\n  }\n  \n  vec3 glowColor = tint * brightness;\n  \n  fragColor = vec4(glowColor, texel.a * brightness);\n}\n",
"#version 300 es\nprecision highp float;\n\nuniform sampler2D u_texture;\nuniform vec2 u_resolution;\nuniform float u_time;\nuniform float u_frame;\n\nuniform float u_radius;\n\nin vec2 v_texCoord;\nout vec4 fragColor;\n\n\n// --- Common utilities (auto-injected) ---\n\n// Simple hash function\nfloat hash(vec2 p) {\n  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\n}\n\n// 2D hash returning vec2\nvec2 hash2(vec2 p) {\n  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));\n  return fract(sin(p) * 43758.5453);\n}\n\n// Simple value noise\nfloat noise(vec2 p) {\n  vec2 i = floor(p);\n  vec2 f = fract(p);\n  f = f * f * (3.0 - 2.0 * f);\n  float a = hash(i);\n  float b = hash(i + vec2(1.0, 0.0));\n  float c = hash(i + vec2(0.0, 1.0));\n  float d = hash(i + vec2(1.0, 1.0));\n  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n}\n\n// Luminance (rec.709)\nfloat luminance(vec3 c) {\n  return dot(c, vec3(0.2126, 0.7152, 0.0722));\n}\n\n// RGB to HSL\nvec3 rgb2hsl(vec3 c) {\n  float maxC = max(max(c.r, c.g), c.b);\n  float minC = min(min(c.r, c.g), c.b);\n  float l = (maxC + minC) * 0.5;\n  if (maxC == minC) return vec3(0.0, 0.0, l);\n  float d = maxC - minC;\n  float s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);\n  float h;\n  if (maxC == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);\n  else if (maxC == c.g) h = (c.b - c.r) / d + 2.0;\n  else h = (c.r - c.g) / d + 4.0;\n  h /= 6.0;\n  return vec3(h, s, l);\n}\n\n// Hex color to vec3 (for uniform binding from JS hex strings)\n// Not used in GLSL directly — conversion happens on the JS side\n\n// --- End common utilities ---\n\n\nvoid main() {\n  vec2 texelSize = 1.0 / u_resolution;\n  vec3 result = vec3(0.0);\n  float totalWeight = 0.0;\n  \n  int samples = int(min(u_radius, 200.0));\n  float sigma = max(u_radius * 0.4, 1.0);\n  \n  for (int i = -samples; i <= samples; i++) {\n    float offset = float(i);\n    float weight = exp(-0.5 * (offset * offset) / (sigma * sigma));\n    vec2 sampleUV = v_texCoord + vec2(offset * texelSize.x, 0.0);\n    result += texture(u_texture, sampleUV).rgb * weight;\n    totalWeight += weight;\n  }\n  \n  fragColor = vec4(result / totalWeight, 1.0);\n}\n",
"#version 300 es\nprecision highp float;\n\nuniform sampler2D u_texture;\nuniform vec2 u_resolution;\nuniform float u_time;\nuniform float u_frame;\n\nuniform sampler2D u_original;\nuniform float u_radius;\nuniform float u_intensity;\nuniform float u_blendMode;\nuniform float u_colorShift;\n\nin vec2 v_texCoord;\nout vec4 fragColor;\n\n\n// --- Common utilities (auto-injected) ---\n\n// Simple hash function\nfloat hash(vec2 p) {\n  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\n}\n\n// 2D hash returning vec2\nvec2 hash2(vec2 p) {\n  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));\n  return fract(sin(p) * 43758.5453);\n}\n\n// Simple value noise\nfloat noise(vec2 p) {\n  vec2 i = floor(p);\n  vec2 f = fract(p);\n  f = f * f * (3.0 - 2.0 * f);\n  float a = hash(i);\n  float b = hash(i + vec2(1.0, 0.0));\n  float c = hash(i + vec2(0.0, 1.0));\n  float d = hash(i + vec2(1.0, 1.0));\n  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);\n}\n\n// Luminance (rec.709)\nfloat luminance(vec3 c) {\n  return dot(c, vec3(0.2126, 0.7152, 0.0722));\n}\n\n// RGB to HSL\nvec3 rgb2hsl(vec3 c) {\n  float maxC = max(max(c.r, c.g), c.b);\n  float minC = min(min(c.r, c.g), c.b);\n  float l = (maxC + minC) * 0.5;\n  if (maxC == minC) return vec3(0.0, 0.0, l);\n  float d = maxC - minC;\n  float s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);\n  float h;\n  if (maxC == c.r) h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);\n  else if (maxC == c.g) h = (c.b - c.r) / d + 2.0;\n  else h = (c.r - c.g) / d + 4.0;\n  h /= 6.0;\n  return vec3(h, s, l);\n}\n\n// Hex color to vec3 (for uniform binding from JS hex strings)\n// Not used in GLSL directly — conversion happens on the JS side\n\n// --- End common utilities ---\n\n\nvoid main() {\n  vec2 texelSize = 1.0 / u_resolution;\n  vec3 result = vec3(0.0);\n  float totalWeight = 0.0;\n  \n  int samples = int(min(u_radius, 200.0));\n  float sigma = max(u_radius * 0.4, 1.0);\n  \n  for (int i = -samples; i <= samples; i++) {\n    float offset = float(i);\n    float weight = exp(-0.5 * (offset * offset) / (sigma * sigma));\n    vec2 sampleUV = v_texCoord + vec2(0.0, offset * texelSize.y);\n    \n    vec3 sampleColor = texture(u_texture, sampleUV).rgb;\n    \n    // Color shift: push distant samples toward cooler (blue) tones\n    if (u_colorShift > 0.0) {\n      float dist = abs(offset) / max(float(samples), 1.0);\n      float shift = dist * u_colorShift;\n      sampleColor.r *= 1.0 - shift * 0.5;\n      sampleColor.g *= 1.0 - shift * 0.2;\n      sampleColor.b *= 1.0 + shift * 0.4;\n    }\n    \n    result += sampleColor * weight;\n    totalWeight += weight;\n  }\n  \n  vec3 glow = (result / totalWeight) * u_intensity;\n  \n  // Read the original pre-effect scene\n  vec4 original = texture(u_original, v_texCoord);\n  vec3 base = original.rgb;\n  \n  // Blend glow onto original based on blend mode\n  vec3 blended;\n  if (u_blendMode < 0.5) {\n    // Add (0)\n    blended = base + glow;\n  } else if (u_blendMode < 1.5) {\n    // Screen (1)\n    blended = 1.0 - (1.0 - base) * (1.0 - glow);\n  } else if (u_blendMode < 2.5) {\n    // Soft Light (2)\n    blended = mix(\n      2.0 * base * glow + base * base * (1.0 - 2.0 * glow),\n      sqrt(base) * (2.0 * glow - 1.0) + 2.0 * base * (1.0 - glow),\n      step(0.5, glow)\n    );\n  } else {\n    // Overlay (3)\n    blended = mix(\n      2.0 * base * glow,\n      1.0 - 2.0 * (1.0 - base) * (1.0 - glow),\n      step(0.5, base)\n    );\n  }\n  \n  fragColor = vec4(clamp(blended, 0.0, 1.0), original.a);\n}\n"],
    properties: [{"path":"intensity","valueType":"number"},{"path":"radius","valueType":"number"},{"path":"threshold","valueType":"number"},{"path":"blendMode","valueType":"select","options":[{"label":"Add","value":"add"},{"label":"Screen","value":"screen"},{"label":"Soft Light","value":"softlight"},{"label":"Overlay","value":"overlay"}]},{"path":"colorMode","valueType":"select","options":[{"label":"Source Color","value":"source"},{"label":"A & B Gradient","value":"gradient"}]},{"path":"colorShift","valueType":"number"},{"path":"colorA","valueType":"color"},{"path":"colorB","valueType":"color"}],
    passUniforms: null
  }];
  var FRAME_PASSES = [[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}],[{"shaderIndex":0,"settings":{"intensity":2,"radius":48,"threshold":0,"blendMode":"add","colorMode":"source","colorShift":0,"colorA":"#ffffff","colorB":"#0066ff"}}]];

  var gl = null;
  var glCanvas = null;
  var quadVAO = null;
  var programCache = {};
  var fbA = null, fbB = null, texA = null, texB = null;
  var snapFb = null, snapTex = null;
  var inputTex = null;
  var fbW = 0, fbH = 0;

  function hexToRgb(hex) {
    var c = hex.replace('#', '');
    return [parseInt(c.substring(0,2),16)/255, parseInt(c.substring(2,4),16)/255, parseInt(c.substring(4,6),16)/255];
  }

  function initGL() {
    if (gl) return true;
    glCanvas = document.createElement('canvas');
    gl = glCanvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true, antialias: false });
    if (!gl) return false;

    // Fullscreen quad
    var verts = new Float32Array([-1,-1,0,0, 1,-1,1,0, -1,1,0,1, 1,1,1,1]);
    quadVAO = gl.createVertexArray();
    var vbo = gl.createBuffer();
    gl.bindVertexArray(quadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
    gl.bindVertexArray(null);

    inputTex = gl.createTexture();
    return true;
  }

  function getProgram(fragSrc) {
    if (programCache[fragSrc]) return programCache[fragSrc];
    var vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VERTEX_SRC);
    gl.compileShader(vs);
    var fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragSrc);
    gl.compileShader(fs);
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'a_position');
    gl.bindAttribLocation(prog, 1, 'a_texCoord');
    gl.linkProgram(prog);
    programCache[fragSrc] = prog;
    return prog;
  }

  function uploadTex(tex, source) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  }

  function ensureFBs(w, h) {
    if (fbW === w && fbH === h) return;
    [fbA, fbB, snapFb].forEach(function(f) { if (f) gl.deleteFramebuffer(f); });
    [texA, texB, snapTex].forEach(function(t) { if (t) gl.deleteTexture(t); });
    var fbs = [null, null, null], texs = [null, null, null];
    for (var i = 0; i < 3; i++) {
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      var fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      fbs[i] = fb; texs[i] = t;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    fbA = fbs[0]; fbB = fbs[1]; texA = texs[0]; texB = texs[1];
    snapFb = fbs[2]; snapTex = texs[2];
    fbW = w; fbH = h;
  }

  function setUniformValue(prog, name, value, prop) {
    var loc = gl.getUniformLocation(prog, name);
    if (!loc) return;
    if (prop.valueType === 'number') { gl.uniform1f(loc, value); }
    else if (prop.valueType === 'boolean') { gl.uniform1f(loc, value ? 1.0 : 0.0); }
    else if (prop.valueType === 'color') { var rgb = hexToRgb(value); gl.uniform3fv(loc, rgb); }
    else if (prop.valueType === 'select' || prop.valueType === 'string') {
      if (typeof value === 'number') { gl.uniform1f(loc, value); }
      else if (typeof value === 'string' && prop.options) {
        var idx = -1;
        for (var j = 0; j < prop.options.length; j++) { if (prop.options[j].value === value) { idx = j; break; } }
        gl.uniform1f(loc, idx >= 0 ? idx : 0);
      }
    }
  }

  window._applyShaders = function(canvas, frameIndex, time, bgColor) {
    if (!initGL()) return;
    var passes = FRAME_PASSES[frameIndex];
    if (!passes || passes.length === 0) return;

    var w = canvas.width, h = canvas.height;
    glCanvas.width = w;
    glCanvas.height = h;

    uploadTex(inputTex, canvas);
    ensureFBs(w, h);

    var bgRgb = bgColor ? hexToRgb(bgColor) : [0, 0, 0];

    var curInput = inputTex;
    var curFbIdx = 0;
    var fbs = [fbA, fbB], texs = [texA, texB];
    var totalPasses = 0;
    for (var e = 0; e < passes.length; e++) { totalPasses += SHADER_DEFS[passes[e].shaderIndex].passes; }

    var passCount = 0;
    for (var ei = 0; ei < passes.length; ei++) {
      var entry = passes[ei];
      var def = SHADER_DEFS[entry.shaderIndex];

      // Snapshot curInput for multi-pass u_original to avoid ping-pong corruption
      var effectOriginal = curInput;
      if (def.passes > 1 && (curInput === texA || curInput === texB)) {
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, curInput === texA ? fbA : fbB);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, snapFb);
        gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
        gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
        gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
        effectOriginal = snapTex;
      }

      for (var p = 0; p < def.passes; p++) {
        passCount++;
        var isLast = (passCount === totalPasses);
        var fragSrc = def.passShaders[p];
        var prog = getProgram(fragSrc);

        if (isLast) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.bindFramebuffer(gl.FRAMEBUFFER, fbs[curFbIdx]);
        }
        gl.viewport(0, 0, w, h);
        gl.useProgram(prog);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, curInput);
        var uTex = gl.getUniformLocation(prog, 'u_texture');
        if (uTex) gl.uniform1i(uTex, 0);

        if (def.passes > 1) {
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, effectOriginal);
          var uOrig = gl.getUniformLocation(prog, 'u_original');
          if (uOrig) gl.uniform1i(uOrig, 1);
        }

        var uRes = gl.getUniformLocation(prog, 'u_resolution');
        if (uRes) gl.uniform2fv(uRes, [w, h]);
        var uTime = gl.getUniformLocation(prog, 'u_time');
        if (uTime) gl.uniform1f(uTime, time || 0);
        var uFrame = gl.getUniformLocation(prog, 'u_frame');
        if (uFrame) gl.uniform1f(uFrame, frameIndex);
        var uBg = gl.getUniformLocation(prog, 'u_bgColor');
        if (uBg) gl.uniform3fv(uBg, bgRgb);

        var overrides = def.passUniforms ? def.passUniforms[p] : null;
        for (var pi = 0; pi < def.properties.length; pi++) {
          var prop = def.properties[pi];
          var uName = 'u_' + prop.path;
          var val = (overrides && overrides[prop.path] !== undefined) ? overrides[prop.path] : entry.settings[prop.path];
          if (val !== undefined) setUniformValue(prog, uName, val, prop);
        }

        gl.bindVertexArray(quadVAO);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindVertexArray(null);

        if (!isLast) {
          curInput = texs[curFbIdx];
          curFbIdx = 1 - curFbIdx;
        }
      }
    }

    // Read back result onto source canvas
    var ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'copy';
      ctx.drawImage(glCanvas, 0, 0);
      ctx.restore();
    }
  };
})();

}

const AsciiJellyfish2 = (props: AsciiMotionComponentProps = {}) => {
  const { showControls = true, autoPlay = true, onReady } = props;
  const controlsVisible = showControls !== false;
  const initialAutoPlay = autoPlay !== false;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameIndexRef = useRef<number>(0);
  const frameElapsedRef = useRef<number>(0);
  const lastTimestampRef = useRef<number>(0);
  const restartRef = useRef<() => void>(() => {});
  const isPlayingRef = useRef<boolean>(initialAutoPlay);
  const [isPlaying, setIsPlaying] = useState<boolean>(initialAutoPlay);
  const [activeFrame, setActiveFrame] = useState<number>(0);
  const updatePlayingState = useCallback((value: boolean) => {
    isPlayingRef.current = value;
    setIsPlaying(value);
  }, []);
  const play = useCallback(() => {
    updatePlayingState(true);
  }, [updatePlayingState]);
  const pause = useCallback(() => {
    updatePlayingState(false);
  }, [updatePlayingState]);
  const togglePlay = useCallback(() => {
    updatePlayingState(!isPlayingRef.current);
  }, [updatePlayingState]);
  const restart = useCallback(() => {
    if (restartRef.current) {
      restartRef.current();
    }
  }, []);

  useEffect(() => {
    if (isPlayingRef.current !== initialAutoPlay) {
      updatePlayingState(initialAutoPlay);
    }
  }, [initialAutoPlay, updatePlayingState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * devicePixelRatio;
    canvas.height = CANVAS_HEIGHT * devicePixelRatio;
    canvas.style.width = CANVAS_WIDTH + 'px';
    canvas.style.height = CANVAS_HEIGHT + 'px';
    context.resetTransform();
    context.scale(devicePixelRatio, devicePixelRatio);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = FONT_SIZE + 'px ' + FONT_FAMILY;
    context.imageSmoothingEnabled = false;

    frameIndexRef.current = 0;
    frameElapsedRef.current = 0;
    lastTimestampRef.current = 0;

    const drawFrame = (index: number) => {
      const frame = FRAMES[index];

      if (BACKGROUND_COLOR && BACKGROUND_COLOR !== 'transparent') {
        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } else {
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      if (!frame) {
        return;
      }

      for (const cell of frame.cells) {
        const x = cell[0];
        const y = cell[1];
        const char = cell[2];
        const color = COLORS[cell[3]];
        const bgColor = cell.length > 4 ? COLORS[cell[4]] : null;

        if (bgColor) {
          context.fillStyle = bgColor;
          context.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
        }

        context.fillStyle = color || '#ffffff';
        context.fillText(
          char,
          x * CELL_WIDTH + CELL_WIDTH / 2,
          y * CELL_HEIGHT + CELL_HEIGHT / 2
        );
      }

      setActiveFrame(index);

      if (typeof window._applyShaders === "function") {
        window._applyShaders(canvas, index, index / 20, BACKGROUND_COLOR);
      }
    };

    drawFrame(frameIndexRef.current);

    if (FRAMES.length === 0) {
      restartRef.current = () => {
        drawFrame(0);
        setActiveFrame(0);
      };
      return;
    }

    const step = (timestamp: number) => {
      if (FRAMES.length === 0) {
        return;
      }

      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = timestamp;
      }

      const delta = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      if (isPlayingRef.current) {
        frameElapsedRef.current += delta;

        let nextIndex = frameIndexRef.current;
        let remaining = frameElapsedRef.current;
        let duration = FRAMES[nextIndex]?.duration ?? 16;

        while (remaining >= duration && FRAMES.length > 0) {
          remaining -= duration;
          nextIndex = (nextIndex + 1) % FRAMES.length;
          duration = FRAMES[nextIndex]?.duration ?? duration;
        }

        frameElapsedRef.current = remaining;

        if (nextIndex !== frameIndexRef.current) {
          frameIndexRef.current = nextIndex;
          drawFrame(nextIndex);
        } else {
          drawFrame(frameIndexRef.current);
        }
      } else {
        drawFrame(frameIndexRef.current);
      }

      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    animationFrameRef.current = window.requestAnimationFrame(step);

    restartRef.current = () => {
      frameIndexRef.current = 0;
      frameElapsedRef.current = 0;
      lastTimestampRef.current = 0;
      drawFrame(0);
      setActiveFrame(0);
    };

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof onReady === "function") {
      onReady({
        play,
        pause,
        togglePlay,
        restart,
      });
    }
  }, [onReady, play, pause, togglePlay, restart]);

  const hasFrames = FRAMES.length > 0;

  const handleTogglePlay = () => {
    if (!hasFrames) {
      return;
    }
    togglePlay();
  };

  const handleRestart = () => {
    if (!hasFrames) {
      return;
    }
    restart();
    updatePlayingState(true);
  };

  const playLabel = isPlaying ? 'Pause' : 'Play';
  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{
          width: CANVAS_WIDTH + 'px',
          height: CANVAS_HEIGHT + 'px',
          backgroundColor: BACKGROUND_COLOR || 'transparent',
          imageRendering: 'pixelated'
        }}
      />
      {controlsVisible && (
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={!hasFrames}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              background: isPlaying ? '#f1f5f9' : '#111827',
              color: isPlaying ? '#111827' : '#f9fafb',
              cursor: hasFrames ? 'pointer' : 'not-allowed'
            }}
          >
            {playLabel}
          </button>
          <button
            type="button"
            onClick={handleRestart}
            disabled={!hasFrames}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              background: '#0f172a',
              color: '#f9fafb',
              cursor: hasFrames ? 'pointer' : 'not-allowed'
            }}
          >
            Restart
          </button>
          <span
            style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}
          >
            {hasFrames ? 'Frame ' + (activeFrame + 1) + ' / ' + FRAMES.length : 'No frames'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AsciiJellyfish2;
