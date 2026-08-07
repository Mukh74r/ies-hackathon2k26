import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Ruler, Upload, Layers, Box, Maximize2, Download, Sparkles, Play, Pause, 
  RotateCcw, Pen, ChevronLeft, ChevronRight, Eye, Info, CheckCircle, 
  HelpCircle, BookOpen, AlertCircle, RefreshCw, ZoomIn, ZoomOut, Compass, MousePointer
} from 'lucide-react';
import { apiEndpoint, getAuthHeaders } from '../../../utils/api';

interface PointEntity {
  id?: string;
  label?: string;
  x: number;
  y: number;
  style?: 'endpoint' | 'trace' | 'construction';
  anchor?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface LineEntity {
  id?: string;
  from: [number, number];
  to: [number, number];
  style?: 'object' | 'construction' | 'hidden' | 'projector';
  label?: string;
  step?: number;
}

interface LocusEntity {
  through: [number, number];
  direction: 'horizontal' | 'vertical';
  extent: number;
  style?: string;
  label?: string;
}

interface ArcEntity {
  center: [number, number];
  radius: number;
  startAngle: number;
  endAngle: number;
  label?: string;
}

interface DimensionEntity {
  from: [number, number];
  to: [number, number];
  value: string;
  unit?: string;
  side?: 'left' | 'right' | 'top' | 'bottom' | 'parallel';
}

interface ConstructionStep {
  step: number;
  title: string;
  description: string;
  action?: string;
  parameters?: any;
  reasoning?: string;
  formula?: string;
}

interface SolutionData {
  status: string;
  topic?: string;
  problem_type?: string;
  method?: string;
  quadrant?: string;
  given?: Record<string, string>;
  answers?: string[];
  analysis?: {
    summary?: string;
    engineering_reasoning?: string;
    formulae?: string[];
    observations?: string[];
  };
  construction_steps?: ConstructionStep[];
  geometry?: {
    points?: PointEntity[];
    lines?: LineEntity[];
    projectors?: any[];
    loci?: LocusEntity[];
    arcs?: ArcEntity[];
    dimensions?: DimensionEntity[];
    labels?: any[];
    traces?: any[];
  };
  teaching?: {
    important_points?: string[];
    common_errors?: string[];
    exam_tips?: string[];
  };
  problemText?: string;
}

export default function GraphicsEngineeringTool() {
  const [problemText, setProblemText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('projections');
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<SolutionData | null>(null);
  const [activeView, setActiveView] = useState<'2d' | '3d'>('2d');
  
  // Animation & Step State
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animSpeed, setAnimSpeed] = useState<number>(1); // 0.5x, 1x, 2x
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  
  // 3D Canvas Controls
  const [rotation, setRotation] = useState({ x: 0.4, y: 0.6 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGivenCard, setShowGivenCard] = useState(true);
  const [activeTab, setActiveTab] = useState<'steps' | 'measurements' | 'reasoning' | 'tips'>('steps');

  // Canvas Refs
  const canvas2DRef = useRef<HTMLCanvasElement>(null);
  const canvas3DRef = useRef<HTMLCanvasElement>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrame3DRef = useRef<number>();

  const categories = [
    { 
      id: 'projections', 
      name: 'Projections of Lines', 
      icon: Layers, 
      description: 'Points, Lines, True Length & Apparent Angles',
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      id: 'isometric', 
      name: 'Isometric Views', 
      icon: Box, 
      description: '3D Pictorial & Orthographic Projection',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'sections', 
      name: 'Sections of Solids', 
      icon: Maximize2, 
      description: 'Cutting Planes & True Shapes of Section',
      color: 'from-amber-500 to-orange-600'
    },
    { 
      id: 'development', 
      name: 'Surface Development', 
      icon: Download, 
      description: 'Parallel Line & Radial Line Unwrapping',
      color: 'from-green-500 to-emerald-600'
    },
  ];

  const templates = [
    {
      label: 'Line inclined to HP & VP (Standard KTU/BIS)',
      category: 'projections',
      text: 'A line AB 90mm long has its end A 20mm above HP and 30mm in front of VP. The line is inclined at 30° to HP and 40° to VP. Draw its projections and find apparent inclinations.'
    },
    {
      label: 'Line with Apparent Views given',
      category: 'projections',
      text: 'Top view of a 75mm long line AB measures 55mm while its front view measures 60mm. End A is in the HP and 15mm in front of VP. Draw projections and determine true inclinations with HP and VP.'
    },
    {
      label: 'Point in 1st & 3rd Quadrants',
      category: 'projections',
      text: 'Point P is 40mm above HP and 25mm in front of VP. Point Q is 30mm below HP and 45mm behind VP. Draw their projections.'
    }
  ];

  // ═══════════════════════════════════════════════════════
  // HIGH-DPI RETINA CANVAS RENDERING ENGINE (BIS SP:46)
  // ═══════════════════════════════════════════════════════
  const renderGeometry2D = useCallback(() => {
    const canvas = canvas2DRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI Resolution Scaling
    const container = canvas.parentElement;
    if (container) {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;
      
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
    }

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // 1. Draw Clean Technical Paper Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Grid lines (subtle blueprint grid)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Draw Reference Line (XY) & Folding Axis
    const cy = height / 2;
    const cx = Math.max(width * 0.42, 280);

    // XY Reference Line (Black Thin Line - BIS Standard)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, cy);
    ctx.lineTo(width - 40, cy);
    ctx.stroke();

    // Labels X and Y
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('X', 25, cy + 5);
    ctx.fillText('Y', width - 25, cy + 5);

    // Quadrant Legend — concise labels only
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('VP (Front View)', 45, cy - 12);
    ctx.fillText('HP (Top View)', 45, cy + 22);

    if (!solution?.geometry) {
      ctx.restore();
      return;
    }

    const geo = solution.geometry;
    const totalSteps = solution.construction_steps?.length || 1;

    // Apply Zoom & Origin Shift
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-cx, -cy);

    const getCoord = (entity: any, key1: string, key2: string): [number, number] => {
      if (!entity) return [0, 0];
      if (Array.isArray(entity[key1]) && entity[key1].length >= 2) return [Number(entity[key1][0]) || 0, Number(entity[key1][1]) || 0];
      if (Array.isArray(entity[key2]) && entity[key2].length >= 2) return [Number(entity[key2][0]) || 0, Number(entity[key2][1]) || 0];
      return [0, 0];
    };

    // Scale calculation: fit geometry smoothly
    let allCoords: number[][] = [];
    (geo.points || []).forEach((p: any) => allCoords.push([p.x || 0, p.y || 0]));
    (geo.lines || []).forEach((l: any) => {
      allCoords.push(getCoord(l, 'from', 'start'));
      allCoords.push(getCoord(l, 'to', 'end'));
    });
    (geo.loci || []).forEach((l: any) => {
      allCoords.push(getCoord(l, 'through', 'from'));
    });

    const maxX = Math.max(...allCoords.map(c => Math.abs(c[0])), 40);
    const maxY = Math.max(...allCoords.map(c => Math.abs(c[1])), 40);
    const availableX = Math.min(cx - 80, width - cx - 80);
    const availableY = cy - 60;
    const baseScale = Math.min(availableX / maxX, availableY / maxY, 3.5);

    const toCanvas = (gx: number, gy: number) => ({
      x: cx + gx * baseScale,
      y: cy - gy * baseScale // Y is inverted: positive above XY, negative below XY
    });

    // Helper arrowhead for dimensioning
    const drawArrowhead = (x: number, y: number, angle: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-8, -3);
      ctx.lineTo(-8, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Helper pill background text box to prevent overlapping lines/text
    const fillPillText = (text: string, x: number, y: number, font: string, textColor: string, align: CanvasTextAlign = 'center') => {
      ctx.save();
      ctx.font = font;
      ctx.textAlign = align;
      const metrics = ctx.measureText(text);
      const pw = metrics.width + 6;
      const ph = 14;
      let rx = x - pw / 2;
      if (align === 'left') rx = x;
      if (align === 'right') rx = x - pw;
      const ry = y - ph + 2;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillRect(rx, ry, pw, ph);
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(rx, ry, pw, ph);
      ctx.fillStyle = textColor;
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    // ── STEP-BASED FILTERING ENGINE ──
    const isStepVisible = (entityStep?: number) => {
      if (currentStep === 0) return false;
      if (entityStep === undefined || entityStep === null) return true;
      return entityStep <= currentStep;
    };

    // 1. DRAW LOCI LINES (Chain Thin: BIS Standard)
    (geo.loci || []).filter((l: any) => isStepVisible(l.step)).forEach((locus: any) => {
      const throughCoord = getCoord(locus, 'through', 'from');
      const p = toCanvas(throughCoord[0], throughCoord[1]);
      const ext = (locus.extent || 120) * baseScale;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.setLineDash([12, 3, 2, 3]); // Chain line
      ctx.beginPath();
      if (locus.direction === 'horizontal' || locus.from) {
        ctx.moveTo(p.x - 40, p.y);
        ctx.lineTo(p.x + ext, p.y);
      } else {
        ctx.moveTo(p.x, p.y - 40);
        ctx.lineTo(p.x, p.y + ext);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      if (locus.label) {
        fillPillText(locus.label, p.x + ext - 10, p.y + 4, 'italic 11px Inter, sans-serif', '#475569', 'right');
      }
    });

    // 2. DRAW PROJECTORS (Thin continuous gray lines)
    (geo.projectors || []).filter((p: any) => isStepVisible(p.step)).forEach((pr: any) => {
      const c1 = getCoord(pr, 'from', 'start');
      const c2 = getCoord(pr, 'to', 'end');
      const p1 = toCanvas(c1[0], c1[1]);
      const p2 = toCanvas(c2[0], c2[1]);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]); // Dashed projectors
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 3. DRAW ARCS (Construction Arcs for rotation)
    (geo.arcs || []).filter((a: any) => isStepVisible(a.step)).forEach((arc: any) => {
      const centerCoord = getCoord(arc, 'center', 'from');
      const c = toCanvas(centerCoord[0], centerCoord[1]);
      const r = (arc.radius || 20) * baseScale;
      const startRad = -(arc.startAngle || 0) * (Math.PI / 180);
      const endRad = -(arc.endAngle || 0) * (Math.PI / 180);

      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, startRad, endRad, startRad > endRad);
      ctx.stroke();
      ctx.setLineDash([]);

      if (arc.label) {
        const midAngle = (startRad + endRad) / 2;
        const lx = c.x + (r + 14) * Math.cos(midAngle);
        const ly = c.y + (r + 14) * Math.sin(midAngle);
        fillPillText(arc.label, lx, ly, 'bold 11px Inter, sans-serif', '#1e40af', 'center');
      }
    });

    // 4. DRAW GEOMETRIC LINES (Object Lines vs Construction Lines)
    (geo.lines || []).filter((l: any) => isStepVisible(l.step)).forEach((line: any) => {
      const c1 = getCoord(line, 'from', 'start');
      const c2 = getCoord(line, 'to', 'end');
      const p1 = toCanvas(c1[0], c1[1]);
      const p2 = toCanvas(c2[0], c2[1]);
      const isObject = line.style === 'object';
      const isConstruction = line.style === 'construction';
      const isHidden = line.style === 'hidden';
      const isHovered = hoveredEntity === line.id || hoveredEntity === line.label;

      if (isObject) {
        // Final Projections (a'b', ab): Continuous Thick Black
        ctx.strokeStyle = isHovered ? '#0284c7' : '#0f172a';
        ctx.lineWidth = isHovered ? 3.5 : 2.5;
        ctx.setLineDash([]);
      } else if (isConstruction) {
        // True Length & Helper Lines: Continuous Thin Blue
        ctx.strokeStyle = isHovered ? '#2563eb' : '#3b82f6';
        ctx.lineWidth = isHovered ? 2 : 1.2;
        ctx.setLineDash([]);
      } else if (isHidden) {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 4]);
      } else {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Line Label along line orientation
      if (line.label) {
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(angle);
        fillPillText(line.label, 0, -6, isObject ? 'bold 12px Inter, sans-serif' : '11px Inter, sans-serif', isObject ? '#0f172a' : '#1e40af', 'center');
        ctx.restore();
      }
    });

    // 5. DIMENSIONS are shown in the Measurements tab to keep the diagram clean

    // 6. DRAW POINTS (Dot + Cross Tick Standard)
    (geo.points || []).filter((p: any) => isStepVisible(p.step)).forEach((pt: any) => {
      const p = toCanvas(pt.x || 0, pt.y || 0);
      const isTrace = pt.style === 'trace';
      const isHovered = hoveredEntity === pt.id || hoveredEntity === pt.label;

      if (isTrace) {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Point marker dot
        ctx.fillStyle = isHovered ? '#0284c7' : '#0f172a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, isHovered ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fill();

        // Cross ticks
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - 4, p.y);
        ctx.lineTo(p.x + 4, p.y);
        ctx.moveTo(p.x, p.y - 4);
        ctx.lineTo(p.x, p.y + 4);
        ctx.stroke();
      }

      // Point Label (a', a, b', b, b1', b2)
      if (pt.label || pt.name) {
        const labelText = pt.label || pt.name;
        const anchor = pt.anchor || 'top-right';
        let lx = p.x + 8, ly = p.y - 8;
        let align: CanvasTextAlign = 'left';

        if (anchor === 'top-left') { lx = p.x - 8; ly = p.y - 8; align = 'right'; }
        else if (anchor === 'bottom-right') { lx = p.x + 8; ly = p.y + 16; }
        else if (anchor === 'bottom-left') { lx = p.x - 8; ly = p.y + 16; align = 'right'; }

        fillPillText(labelText, lx, ly, 'bold 13px Inter, sans-serif', isTrace ? '#dc2626' : (isHovered ? '#0284c7' : '#0f172a'), align);
      }
    });

    // 7. DRAW TRACES (HT & VT)
    (geo.traces || []).filter((t: any) => isStepVisible(t.step)).forEach((tr: any) => {
      const p = toCanvas(tr.x || 0, tr.y || 0);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      fillPillText(tr.label || tr.id, p.x + 8, p.y - 6, 'bold 12px Inter, sans-serif', '#dc2626', 'left');
    });

    // 8. STANDALONE LABELS (α, β etc.) are shown in Measurements tab for cleaner diagrams

    ctx.restore();
    ctx.restore();
  }, [solution, zoomLevel, currentStep, hoveredEntity]);

  // Handle solve call
  const handleSolve = async () => {
    if (!problemText.trim()) {
      alert('Please enter an engineering graphics problem statement.');
      return;
    }

    setIsLoading(true);
    setSolution(null);
    setCurrentStep(0);

    try {
      const response = await fetch(apiEndpoint('/api/graphics/solve'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          problemText,
          category: selectedCategory,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errText.substring(0, 200)}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Backend returned non-JSON response. Ensure the backend server is running.');
      }

      const data = await response.json();
      setSolution(data);
      setCurrentStep(data.construction_steps?.length || 1);
      setActiveView('2d');
    } catch (error: any) {
      console.error('Graphics solve error:', error);
      alert(error?.message || 'Failed to solve problem. Please check your backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step Animation Playback Controls
  useEffect(() => {
    if (animationPlaying) {
      const totalSteps = solution?.construction_steps?.length || 1;
      const intervalTime = 2000 / animSpeed;

      animationTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps) {
            setAnimationPlaying(false);
            if (animationTimerRef.current) clearInterval(animationTimerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, intervalTime);
    } else {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    }

    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [animationPlaying, animSpeed, solution]);

  // Re-render 2D canvas on step/zoom/solution updates
  useEffect(() => {
    if (activeView === '2d') {
      renderGeometry2D();
    }
  }, [renderGeometry2D, activeView, currentStep, zoomLevel]);

  // Render 3D Quadrant View
  useEffect(() => {
    if (activeView === '3d' && canvas3DRef.current) {
      const canvas = canvas3DRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 600;
      canvas.height = 450;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 30;
      const size = 120;

      // Draw 3D Quadrant Planes (HP & VP)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;

      // Vertical Plane (VP)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.beginPath();
      ctx.moveTo(cx - size, cy - size);
      ctx.lineTo(cx + size, cy - size);
      ctx.lineTo(cx + size, cy);
      ctx.lineTo(cx - size, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Horizontal Plane (HP)
      ctx.fillStyle = 'rgba(168, 85, 247, 0.08)';
      ctx.beginPath();
      ctx.moveTo(cx - size, cy);
      ctx.lineTo(cx + size, cy);
      ctx.lineTo(cx + size * 1.5, cy + size * 0.8);
      ctx.lineTo(cx - size * 0.5, cy + size * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Reference Line XY
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - size, cy);
      ctx.lineTo(cx + size, cy);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('VERTICAL PLANE (VP)', cx - size + 10, cy - size + 25);
      ctx.fillStyle = '#c084fc';
      ctx.fillText('HORIZONTAL PLANE (HP)', cx - size * 0.4, cy + size * 0.7);
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('XY REFERENCE LINE', cx + size - 140, cy - 8);
    }
  }, [activeView, rotation]);

  const totalSteps = solution?.construction_steps?.length ? solution.construction_steps.length : 1;

  return (
    <div className="w-full h-full flex flex-col gap-5 text-slate-100 overflow-y-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Ruler className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
              EG-PRO-X Graphics Engineering Engine
              <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full uppercase font-bold tracking-wider">
                BIS SP:46 Compliant
              </span>
            </h1>
            <p className="text-xs text-slate-400">Step-by-Step Technical Drawing & Trigonometric Solver for BTech / Engineering Students</p>
          </div>
        </div>

        {solution && (
          <div className="flex items-center gap-2 bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setActiveView('2d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === '2d' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pen className="w-3.5 h-3.5" />
              2D Drafting Canvas
            </button>
            <button
              onClick={() => setActiveView('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === '3d' 
                  ? 'bg-purple-500 text-slate-950 shadow-md font-extrabold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              3D Quadrants View
            </button>
          </div>
        )}
      </div>

      {/* Problem Input & Quick Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Input Textarea */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Engineering Problem Description
            </label>
            <span className="text-[11px] text-slate-400">Enter measurements, angles & positions</span>
          </div>

          <textarea
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="Type your engineering drawing question here...&#10;&#10;Example: A line AB 90mm long has its end A 20mm above HP and 30mm in front of VP. The line is inclined at 30° to HP and 40° to VP. Draw its projections."
            className="w-full h-32 bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 resize-none font-mono"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleSolve}
              disabled={isLoading || !problemText.trim()}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
                isLoading || !problemText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25 hover:scale-102'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Solving Math Engine...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate 2D Solution
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Quick Exam Templates */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            University Exam Question Bank
          </span>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[145px] pr-1">
            {templates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => {
                  setProblemText(tpl.text);
                  setSelectedCategory(tpl.category);
                }}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 text-left transition-all text-xs group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-cyan-400 flex items-center justify-between">
                  {tpl.label}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Solution Workspace */}
      {solution && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[650px]">
          {/* Left / Center: Interactive 2D Canvas Engine */}
          <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            {/* Top Canvas Action Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-300">Step {currentStep} of {totalSteps}:</span>
                <span className="text-cyan-400 font-semibold truncate max-w-[280px]">
                  {currentStep === 0 ? 'XY Reference Line' : solution.construction_steps?.[currentStep - 1]?.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.6))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all text-xs font-mono"
                  title="Reset Zoom"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative flex-1 bg-white border border-slate-300 rounded-xl overflow-hidden min-h-[480px] my-3 shadow-inner">
              {activeView === '2d' ? (
                <canvas ref={canvas2DRef} className="w-full h-full cursor-crosshair" />
              ) : (
                <canvas ref={canvas3DRef} className="w-full h-full" />
              )}

              {/* Floating overlay removed — measurements now live in the Measurements tab for diagram clarity */}
            </div>

            {/* Bottom Progressive Animation Controls Bar */}
            <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl flex flex-col gap-2">
              {/* Progress Scrubber */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={totalSteps}
                  value={currentStep}
                  onChange={(e) => {
                    setAnimationPlaying(false);
                    setCurrentStep(Number(e.target.value));
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Playback Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAnimationPlaying(false);
                      setCurrentStep(0);
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                    title="Reset to Step 0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setAnimationPlaying(false);
                      setCurrentStep(prev => Math.max(prev - 1, 0));
                    }}
                    disabled={currentStep === 0}
                    className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setAnimationPlaying(!animationPlaying)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md text-xs uppercase"
                  >
                    {animationPlaying ? (
                      <>
                        <Pause className="w-4 h-4" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" /> Play Step-by-Step
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setAnimationPlaying(false);
                      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
                    }}
                    disabled={currentStep === totalSteps}
                    className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Speed:</span>
                  {[0.5, 1, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setAnimSpeed(spd)}
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        animSpeed === spd
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: BYJU'S-Style Pedagogical Side Panel */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              {/* Tab Navigation */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
                {[
                  { id: 'steps' as const, label: 'Steps' },
                  { id: 'measurements' as const, label: 'Measurements' },
                  { id: 'reasoning' as const, label: 'Formulas' },
                  { id: 'tips' as const, label: 'Tips' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.id ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: Progressive Construction Steps */}
              {activeTab === 'steps' && (
                <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
                  {(solution.construction_steps || []).map((step, idx) => {
                    const stepNum = idx + 1;
                    const isActive = currentStep === stepNum;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setAnimationPlaying(false);
                          setCurrentStep(stepNum);
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                            : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                            Step {stepNum}: {step.title}
                          </span>
                          {isActive && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {step.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: Measurements — Given Data, Answers & Geometry Dimensions */}
              {activeTab === 'measurements' && (
                <div className="space-y-4 overflow-y-auto max-h-[480px] pr-1 text-xs">
                  {/* Given Data */}
                  {solution.given && Object.keys(solution.given).length > 0 && (
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-cyan-400 flex items-center gap-1.5 mb-2 tracking-wider text-[11px] uppercase">
                        <Ruler className="w-3.5 h-3.5" /> Given Data
                      </span>
                      <div className="space-y-1.5">
                        {Object.entries(solution.given).map(([key, value], idx) => (
                          <div key={idx} className="flex items-baseline justify-between gap-2 py-1 px-2 rounded-lg bg-slate-900/60">
                            <span className="text-slate-400 font-medium truncate">{key.replace(/^\[\d+\]\s*/, '')}</span>
                            <span className="font-bold text-white font-mono whitespace-nowrap">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Computed Answers */}
                  {solution.answers && solution.answers.length > 0 && (
                    <div className="bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-800/40">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-2 tracking-wider text-[11px] uppercase">
                        <CheckCircle className="w-3.5 h-3.5" /> Computed Answers
                      </span>
                      <div className="space-y-1.5">
                        {solution.answers.map((ans, idx) => (
                          <div key={idx} className="py-1.5 px-2 rounded-lg bg-slate-900/60 text-emerald-300 font-mono font-bold text-[11px]">
                            {ans}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Geometry Dimensions Table */}
                  {solution.geometry?.dimensions && solution.geometry.dimensions.length > 0 && (
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-purple-400 flex items-center gap-1.5 mb-2 tracking-wider text-[11px] uppercase">
                        <Compass className="w-3.5 h-3.5" /> Dimension Values
                      </span>
                      <div className="space-y-1.5">
                        {(solution.geometry.dimensions as any[]).map((dim: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg bg-slate-900/60">
                            <span className="text-slate-400 font-medium">{dim.id?.replace(/^dim_/, '').replace(/_/g, ' ').toUpperCase() || `Dim ${idx+1}`}</span>
                            <span className="font-bold text-white font-mono">{dim.value}{dim.unit || 'mm'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Point Coordinates */}
                  {solution.geometry?.points && solution.geometry.points.length > 0 && (
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-2 tracking-wider text-[11px] uppercase">
                        <MousePointer className="w-3.5 h-3.5" /> Point Coordinates
                      </span>
                      <div className="space-y-1.5">
                        {(solution.geometry.points as any[]).map((pt: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg bg-slate-900/60">
                            <span className="text-amber-300 font-bold">{pt.label || pt.name || pt.id}</span>
                            <span className="text-slate-300 font-mono text-[11px]">({(pt.x || 0).toFixed(1)}, {(pt.y || 0).toFixed(1)})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis Summary */}
                  {solution.analysis?.summary && (
                    <div className="bg-blue-950/20 p-3.5 rounded-xl border border-blue-800/40">
                      <span className="font-bold text-blue-400 flex items-center gap-1.5 mb-1 tracking-wider text-[11px] uppercase">
                        <Info className="w-3.5 h-3.5" /> Problem Summary
                      </span>
                      <p className="text-slate-300 leading-relaxed">{solution.analysis.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Mathematical Analysis & Formulas */}
              {activeTab === 'reasoning' && (
                <div className="space-y-4 overflow-y-auto max-h-[480px] pr-1 text-xs">
                  {solution.analysis?.engineering_reasoning && (
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-cyan-400 block mb-1">Engineering Rationale</span>
                      <p className="text-slate-300 leading-relaxed font-sans">{solution.analysis.engineering_reasoning}</p>
                    </div>
                  )}

                  {solution.analysis?.formulae && solution.analysis.formulae.length > 0 && (
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-purple-400 block mb-1.5">Trigonometric Formulas Applied</span>
                      <div className="space-y-1 font-mono text-[11px] text-slate-300">
                        {solution.analysis.formulae.map((f, i) => (
                          <div key={i} className="p-1 bg-slate-900 rounded border border-slate-800">{f}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Exam Tips & Common Pitfalls */}
              {activeTab === 'tips' && (
                <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1 text-xs">
                  {solution.teaching?.important_points && (
                    <div className="bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-800/40">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                        <CheckCircle className="w-4 h-4" /> Key Drafting Rules
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {solution.teaching.important_points.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {solution.teaching?.common_errors && (
                    <div className="bg-rose-950/20 p-3.5 rounded-xl border border-rose-800/40">
                      <span className="font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                        <AlertCircle className="w-4 h-4" /> Common Student Errors
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {solution.teaching.common_errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Export Options */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 mt-3">
              <button
                onClick={() => {
                  const canvas = canvas2DRef.current;
                  if (!canvas) return;
                  const link = document.createElement('a');
                  link.download = `Engineering_Drawing_${Date.now()}.png`;
                  link.href = canvas.toDataURL('image/png');
                  link.click();
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" /> Export PNG
              </button>
              <button
                onClick={() => setShowGivenCard(!showGivenCard)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-purple-400" /> Toggle Given Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
