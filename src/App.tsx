/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  ChevronRight, 
  TrendingUp, 
  ShieldAlert, 
  Info,
  Activity,
  BarChart3,
  Clock,
  Zap,
  Home,
  Layers,
  Users,
  Settings,
  Plus
} from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MOCK_PROJECTS } from './mockData';
import { Project } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

// --- Helper for color scale ---
const getPosColor = (project: Project) => {
  if (project.toxicityRisk) return '#F97316'; // Warning Orange for toxicity
  if (project.pos < 30) return '#94A3B8'; // Morandi Grey
  if (project.pos < 60) return '#7C99AC'; // Morandi Blue-Grey
  return '#5B8FF9'; // AntV Blue
};

const TRANSITION_600 = { duration: 0.6, ease: [0.22, 1, 0.36, 1] }; // Smooth physical easing

const StrategicWeightSlider = ({ 
  weight, 
  setWeight 
}: { 
  weight: number, 
  setWeight: (v: number) => void 
}) => {
  return (
    <div className="flex flex-col gap-2.5 w-full max-w-md">
      <div className="flex justify-between text-[9px] uppercase tracking-[0.2em] text-pharma-text-dim font-black">
        <span className={cn("transition-colors duration-300", weight < 40 ? "text-white" : "text-pharma-text-dim/50")}>商业回报</span>
        <span className={cn("transition-colors duration-300", weight > 60 ? "text-white" : "text-pharma-text-dim/50")}>科学成功率</span>
      </div>
      <div className="relative h-6 flex items-center group">
        <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pharma-accent to-pharma-purple transition-all duration-300"
            style={{ width: `${weight}%` }}
          />
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={weight} 
          onChange={(e) => setWeight(parseInt(e.target.value))}
          className="w-full h-1 bg-transparent appearance-none cursor-pointer z-10 slider-thumb-custom"
        />
      </div>
    </div>
  );
};

interface VerdictCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const VerdictCard: React.FC<VerdictCardProps> = ({ 
  project, 
  isSelected, 
  onSelect,
  onRemove
}) => {
  const [isRevealed, setIsRevealed] = useState(project.confidence >= 0.6);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={TRANSITION_600}
      onClick={onSelect}
      className={cn(
        "relative flex-1 min-w-[280px] p-6 rounded-3xl border transition-all cursor-pointer group overflow-hidden",
        isSelected 
          ? "bg-pharma-card border-pharma-accent/50 shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(59,130,246,0.1)]" 
          : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]"
      )}
    >
      {/* Hardware-style decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pharma-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-pharma-accent/5 rounded-full blur-3xl" />

      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-4 right-4 w-6 h-6 bg-white/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pharma-warning/20 hover:text-pharma-warning border border-white/10"
      >
        <Zap className="w-3 h-3 rotate-45" />
      </button>

      {project.toxicityRisk && (
        <div className="absolute top-4 right-12 group/risk">
          <AlertCircle className="w-4 h-4 text-pharma-warning animate-pulse" />
          <div className="absolute bottom-full right-0 mb-3 w-64 p-5 bg-pharma-bg/95 border border-pharma-warning/30 rounded-2xl text-[11px] opacity-0 group-hover/risk:opacity-100 transition-all translate-y-2 group-hover/risk:translate-y-0 pointer-events-none z-50 shadow-2xl backdrop-blur-2xl">
            <div className="font-black text-pharma-warning mb-3 flex items-center gap-2 uppercase tracking-widest">
              <ShieldAlert className="w-4 h-4" /> 临床毒性警示
            </div>
            <div className="space-y-3">
              <p className="text-pharma-text-dim leading-relaxed">
                临床二期实验中记录到严重毒性。数据表明风险比平均水平高出 <span className="text-white font-mono">33%</span>。
              </p>
              <div className="pt-3 border-t border-white/5 font-mono text-[10px] text-white/80 flex justify-between">
                <span>原始数值:</span>
                <span className="text-pharma-warning">LD50: 12.4mg/kg</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-mono text-pharma-accent uppercase tracking-[0.2em] bg-pharma-accent/10 px-2 py-0.5 rounded-md border border-pharma-accent/20">
            {project.phase}
          </span>
          {project.confidence < 0.6 && (
            <span className="text-[9px] font-mono text-pharma-warning uppercase tracking-[0.2em] bg-pharma-warning/10 px-2 py-0.5 rounded-md border border-pharma-warning/20">
              低置信度
            </span>
          )}
        </div>
        <h3 className="text-base font-black tracking-tight group-hover:text-pharma-accent transition-colors uppercase">
          {project.name}
        </h3>
      </div>

      <div className="space-y-5 font-mono">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[9px] text-pharma-text-dim uppercase tracking-widest font-bold mb-1">预期估值</span>
            <span className="text-lg font-black text-emerald-400 leading-none">
              <span className="text-xs mr-0.5">$</span>{project.marketPotential.toFixed(2)}<span className="text-[10px] ml-1 opacity-60">BN</span>
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-pharma-text-dim uppercase tracking-widest font-bold mb-1">成功率</span>
            <span className="text-lg font-black text-white leading-none" style={{ color: getPosColor(project) }}>
              {project.pos}<span className="text-[10px] ml-0.5 opacity-60">%</span>
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[8px] text-pharma-text-dim uppercase tracking-widest font-bold mb-1">研发成本</span>
            <span className="text-xs font-bold text-white/90">${project.rdCost}M</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-pharma-text-dim uppercase tracking-widest font-bold mb-1">专利寿命</span>
            <span className="text-xs font-bold text-white/90">{project.patentLife}Y</span>
          </div>
        </div>
      </div>

      {!isRevealed && (
        <div className="absolute inset-0 glass-mask rounded-3xl flex flex-col items-center justify-center p-8 text-center z-10">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
            <Clock className="w-6 h-6 text-pharma-text-dim opacity-50" />
          </div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-white font-black mb-2">数据源待验证</span>
          <p className="text-[10px] text-pharma-text-dim/70 mb-6 leading-relaxed">该项目数据置信度低于 60%，需要人工二次确认。</p>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsRevealed(true); }}
            className="text-[10px] bg-pharma-accent text-white px-6 py-2.5 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-pharma-accent/20"
          >
            解锁深度数据
          </button>
        </div>
      )}
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(MOCK_PROJECTS[0].id);
  const [pkIds, setPkIds] = useState<string[]>([MOCK_PROJECTS[0].id, MOCK_PROJECTS[1].id, MOCK_PROJECTS[2].id]);
  const [weight, setWeight] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('全部');
  const [isPkSelectionOpen, setIsPkSelectionOpen] = useState(false);

  const selectedProject = useMemo(() => 
    MOCK_PROJECTS.find(p => p.id === selectedProjectId) || null
  , [selectedProjectId]);

  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPhase = phaseFilter === '全部' || p.phase === phaseFilter;
      return matchesSearch && matchesPhase;
    }).map(p => {
      const commercialFactor = (100 - weight) / 100;
      const scienceFactor = weight / 100;
      const dynamicScore = (p.marketPotential * 4 * commercialFactor) + (p.pos * scienceFactor);
      return { ...p, dynamicScore };
    }).sort((a, b) => b.dynamicScore - a.dynamicScore);
  }, [searchQuery, weight]);

  const chartData = useMemo(() => {
    return filteredProjects.map(p => ({
      name: p.name,
      x: p.pos,
      y: p.marketPotential,
      z: p.budget,
      id: p.id,
      score: p.dynamicScore
    }));
  }, [filteredProjects]);

  const togglePk = (id: string) => {
    setPkIds(prev => 
      prev.includes(id) 
        ? prev.filter(pId => pId !== id) 
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  return (
    <div className="flex h-screen w-full bg-pharma-bg overflow-hidden font-sans text-white selection:bg-pharma-accent/30">
      {/* Left Sidebar: Candidate Projects */}
      <aside className="w-80 border-r border-white/5 flex flex-col bg-black/10 backdrop-blur-3xl z-30 shadow-[10px_0_30px_rgba(0,0,0,0.2)] relative">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pharma-text-dim" />
              <input 
                type="text" 
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-pharma-accent/50 transition-all placeholder:text-pharma-text-dim/50"
              />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {['全部', '临床前', '临床一期', '临床二期'].map(phase => (
              <button
                key={phase}
                onClick={() => setPhaseFilter(phase)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest whitespace-nowrap border transition-all",
                  phaseFilter === phase 
                    ? "bg-pharma-accent/20 border-pharma-accent/30 text-pharma-accent" 
                    : "bg-white/5 border-transparent text-pharma-text-dim hover:bg-white/10"
                )}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
          <div className="flex justify-between items-center px-2 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-pharma-text-dim">候选项目列表</span>
            <Filter className="w-3.5 h-3.5 text-pharma-text-dim cursor-pointer hover:text-white transition-colors" />
          </div>
          
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={TRANSITION_600}
                onClick={() => setSelectedProjectId(p.id)}
                className={cn(
                  "group p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden",
                  selectedProjectId === p.id 
                    ? "bg-pharma-accent/10 border-pharma-accent/30 shadow-[0_8px_20px_rgba(59,130,246,0.1)]" 
                    : "bg-transparent border-transparent hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    selectedProjectId === p.id ? "bg-pharma-accent/20" : "bg-white/5 group-hover:bg-white/10"
                  )}>
                    <Activity className={cn(
                      "w-5 h-5",
                      selectedProjectId === p.id ? "text-pharma-accent" : "text-pharma-text-dim"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className={cn(
                        "text-xs font-bold truncate transition-colors",
                        selectedProjectId === p.id ? "text-white" : "text-pharma-text-dim group-hover:text-white"
                      )}>{p.name}</h4>
                      <span className="text-[10px] font-mono font-bold" style={{ color: getPosColor(p) }}>${p.marketPotential}B</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-[8px] text-pharma-text-dim uppercase tracking-widest font-mono">{p.phase}</p>
                      <p className="text-[8px] text-pharma-text-dim uppercase font-bold">PoS: {p.pos}%</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </aside>

      {/* Middle: Core Analysis Area (Majority Space) */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative overflow-hidden">
        {/* Top Control Bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/5 backdrop-blur-xl z-20">
          <div className="flex items-center gap-8 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-pharma-accent/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-pharma-accent" />
              </div>
              <h2 className="text-sm font-black tracking-tight uppercase">Portfolio Overview</h2>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <StrategicWeightSlider weight={weight} setWeight={setWeight} />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pharma-accent to-pharma-purple flex items-center justify-center text-[10px] font-bold">NM</div>
                <span className="text-[11px] font-bold text-pharma-text-dim">Ning Meng</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-8 py-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          {/* Quadrant Map (Large Area - Glass Card) */}
          <section className="glass-card rounded-[2.5rem] p-6 min-h-[420px] relative flex flex-col group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-black tracking-tight flex items-center gap-3 uppercase">
                  <Activity className="w-5 h-5 text-pharma-accent" /> 投资组合象限图
                </h2>
                <span className="text-[10px] text-pharma-text-dim/60 uppercase tracking-[0.2em] font-bold ml-8">Portfolio Strategic Quadrant</span>
              </div>

              <div className="flex items-center gap-10">
                {/* Strategic Match Score Integrated into the Module */}
                <div className="flex flex-col items-end relative group/score pr-6 border-r border-white/5">
                  <div className="flex items-center gap-1.5 mb-1 cursor-help">
                    <span className="text-[9px] uppercase tracking-widest text-pharma-text-dim font-black">战略匹配得分</span>
                    <Info className="w-3 h-3 text-pharma-text-dim/50" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-mono font-black text-pharma-accent drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      {selectedProject ? Math.round(selectedProject.dynamicScore) : '--'}
                    </span>
                    <span className="text-[10px] font-mono text-pharma-text-dim font-bold">/ 100</span>
                  </div>
                  
                  {/* Score Rule Tooltip */}
                  <div className="absolute top-full right-0 mt-2 w-64 p-4 glass-card z-50 opacity-0 invisible group-hover/score:opacity-100 group-hover/score:visible transition-all duration-300 scale-95 group-hover/score:scale-100">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-pharma-accent mb-2">得分计算规则</h5>
                    <p className="text-[10px] text-pharma-text-dim leading-relaxed">
                      基于当前战略倾向权重 (<span className="text-white">{weight}%</span>) 实时计算。
                      <br /><br />
                      • <span className="text-white">商业回报:</span> 市场潜力与估值权重
                      <br />
                      • <span className="text-white">科学成功率:</span> 临床阶段与 PoS 权重
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-pharma-accent shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                    <span className="text-[9px] text-pharma-text-dim uppercase font-black tracking-widest">高战略匹配</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-pharma-warning shadow-[0_0_12px_rgba(249,115,22,0.6)]" />
                    <span className="text-[9px] text-pharma-text-dim uppercase font-black tracking-widest">高风险预警</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 40, bottom: 60, left: 40 }}>
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="成功率" 
                    unit="%" 
                    stroke="#475569" 
                    strokeWidth={1}
                    fontSize={10} 
                    tickLine={{ stroke: '#475569' }}
                    axisLine={{ stroke: '#475569', strokeWidth: 2 }}
                    domain={[0, 100]}
                    label={{ value: '成功概率 (PoS) %', position: 'bottom', offset: 40, fill: '#94A3B8', fontSize: 11, fontWeight: '900', letterSpacing: '0.2em', textAnchor: 'middle' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="预期估值" 
                    unit="B" 
                    stroke="#475569" 
                    strokeWidth={1}
                    fontSize={10} 
                    tickLine={{ stroke: '#475569' }}
                    axisLine={{ stroke: '#475569', strokeWidth: 2 }}
                    domain={[0, 25]}
                    label={{ value: '市场潜力 ($BN eNPV)', angle: -90, position: 'insideLeft', offset: -20, fill: '#94A3B8', fontSize: 11, fontWeight: '900', letterSpacing: '0.2em', textAnchor: 'middle' }}
                  />
                  <ZAxis type="number" dataKey="z" range={[400, 4000]} name="预算" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3', stroke: '#5B8FF9', strokeWidth: 1.5 }} 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-pharma-bg/95 backdrop-blur-3xl border border-white/10 p-5 rounded-3xl shadow-2xl min-w-[220px] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-pharma-accent" />
                            <p className="text-xs font-black mb-4 text-white uppercase tracking-tight">{data.name}</p>
                            <div className="space-y-3 text-[11px] font-mono">
                              <div className="flex justify-between items-center">
                                <span className="text-pharma-text-dim uppercase tracking-tighter">成功率:</span>
                                <span className="text-white font-black">{data.x}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-pharma-text-dim uppercase tracking-tighter">估值:</span>
                                <span className="text-emerald-400 font-black">${data.y}B</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-pharma-text-dim uppercase tracking-tighter">预算:</span>
                                <span className="text-white font-black">${data.z}M</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={50} stroke="rgba(255,255,255,0.05)" strokeDasharray="8 8" />
                  <ReferenceLine y={12.5} stroke="rgba(255,255,255,0.05)" strokeDasharray="8 8" />
                  <Scatter 
                    name="项目" 
                    data={chartData} 
                    onClick={(data) => setSelectedProjectId(data.id)}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                  >
                    {chartData.map((entry, index) => {
                      const project = MOCK_PROJECTS.find(p => p.id === entry.id)!;
                      const isSelected = selectedProjectId === entry.id;
                      const isHighMatch = entry.score > 85;
                      const color = getPosColor(project);
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={color} 
                          fillOpacity={isSelected ? 0.9 : 0.3}
                          stroke={isSelected ? "#FFFFFF" : isHighMatch ? color : "transparent"}
                          strokeWidth={isSelected ? 3 : isHighMatch ? 2 : 0}
                          className={cn(
                            "cursor-pointer transition-all duration-1000",
                            isHighMatch && "breathing-glow"
                          )}
                        />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-pharma-text-dim/30 font-black uppercase tracking-[0.5em]">
                Sized by budget allocation
              </div>
            </div>
          </section>

          {/* PK Cards (Horizontal List - Glass Card) */}
          <section className="glass-card rounded-[3rem] p-10 shadow-2xl relative group">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-pharma-text-dim flex items-center gap-3">
                    <TrendingUp className="w-4 h-4" /> 横向战略对比卡片
                  </h2>
                  <span className="text-[9px] text-pharma-text-dim/40 uppercase tracking-[0.1em] font-bold ml-7">Strategic Comparison Matrix</span>
                </div>
                
                {/* User Selection Box for PK Comparison (Refined) */}
                <div className="relative">
                  <button 
                    onClick={() => setIsPkSelectionOpen(!isPkSelectionOpen)}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      isPkSelectionOpen 
                        ? "bg-pharma-accent text-white border-pharma-accent shadow-lg shadow-pharma-accent/30" 
                        : "bg-white/5 border-white/10 text-pharma-text-dim hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    选择对比项目
                  </button>
                  
                  <AnimatePresence>
                    {isPkSelectionOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-0 mb-4 w-64 bg-pharma-bg/98 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-50 max-h-80 overflow-y-auto custom-scrollbar"
                      >
                        <div className="flex justify-between items-center mb-4 px-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-pharma-text-dim">可选制药项目</span>
                          <span className="text-[9px] font-mono text-pharma-accent">{pkIds.length}/4</span>
                        </div>
                        <div className="space-y-1.5">
                          {MOCK_PROJECTS.map(p => (
                            <label key={p.id} className={cn(
                              "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                              pkIds.includes(p.id) ? "bg-pharma-accent/10 border-pharma-accent/30" : "bg-transparent border-transparent hover:bg-white/5"
                            )}>
                              <div className="relative flex items-center">
                                <input 
                                  type="checkbox" 
                                  checked={pkIds.includes(p.id)}
                                  onChange={() => togglePk(p.id)}
                                  className="peer appearance-none w-4 h-4 rounded-md border-2 border-white/20 bg-transparent checked:bg-pharma-accent checked:border-pharma-accent transition-all cursor-pointer"
                                />
                                <Zap className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-black truncate text-white/90">{p.name}</span>
                                <span className="text-[8px] font-mono text-pharma-text-dim uppercase">{p.phase}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-pharma-text-dim font-black uppercase tracking-[0.2em] mb-1">
                    对比槽位 <span className="font-mono text-white ml-2">{pkIds.length} / 4</span>
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={cn("w-6 h-1 rounded-full transition-all duration-500", i <= pkIds.length ? "bg-pharma-accent" : "bg-white/10")} />
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => setPkIds([])} 
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-pharma-text-dim hover:text-pharma-warning hover:border-pharma-warning/30 transition-all"
                >
                  <Zap className="w-4 h-4 rotate-45" />
                </button>
              </div>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar no-scrollbar">
              <AnimatePresence mode="popLayout">
                {MOCK_PROJECTS.filter(p => pkIds.includes(p.id)).map(p => (
                  <VerdictCard 
                    key={p.id} 
                    project={p} 
                    isSelected={selectedProjectId === p.id}
                    onSelect={() => setSelectedProjectId(p.id)}
                    onRemove={() => togglePk(p.id)}
                  />
                ))}
                {pkIds.length === 0 && (
                  <div className="flex-1 min-h-[220px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-pharma-text-dim gap-4 bg-white/[0.01] group-hover:bg-white/[0.02] transition-all">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center opacity-20">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30">选择项目进行 PK 对比</p>
                      <p className="text-[9px] opacity-20 uppercase tracking-widest">最多支持 4 个项目同时分析</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Bottom Info Bar */}
        <div className="px-8 pb-8 flex justify-between items-center">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-pharma-text-dim uppercase font-bold tracking-widest">盈利能力: 高</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-pharma-accent" />
              <span className="text-[9px] text-pharma-text-dim uppercase font-bold tracking-widest">研发效率: 稳定</span>
            </div>
          </div>
          <div className="text-[9px] text-pharma-text-dim/40 font-mono">
            数据最后更新: 2026-03-27 07:42
          </div>
        </div>
      </main>

      {/* Right Sidebar: Deep Drill-down Assessment (Reduced Size) */}
      <aside className="w-72 border-l border-white/5 bg-black/20 backdrop-blur-3xl flex flex-col z-30 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedProject ? (
            <motion.div 
              key={selectedProject.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={TRANSITION_600}
              className="flex-1 flex flex-col h-full"
            >
              <div className="p-5 border-b border-pharma-border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-base font-black tracking-tight uppercase mb-1">{selectedProject.name}</h2>
                    <span className="text-[9px] font-mono text-pharma-accent bg-pharma-accent/10 px-2 py-0.5 rounded uppercase tracking-widest">{selectedProject.phase}</span>
                  </div>
                  <button className="p-1.5 rounded-lg bg-pharma-card border border-pharma-border hover:border-pharma-accent transition-all">
                    <Info className="w-3.5 h-3.5 text-pharma-text-dim" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black text-pharma-text-dim uppercase tracking-widest">核心证据链 (Evidence)</span>
                    <div className="bg-pharma-card border border-pharma-border rounded-xl p-2.5 text-[10px] font-bold flex justify-between items-center group cursor-pointer hover:border-pharma-accent transition-all">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-pharma-accent" />
                        <span className="truncate max-w-[140px]">临床二期有效性报告.pdf</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-pharma-text-dim group-hover:text-pharma-accent transition-colors" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                {/* Strategic Alignment */}
                <section>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-pharma-text-dim">战略对齐矩阵</h3>
                    <span className="text-[10px] font-mono font-bold text-pharma-accent">85% 匹配</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: '科学委员会', val: 85, color: 'bg-pharma-accent' },
                      { label: '市场潜力', val: 92, color: 'bg-emerald-500' },
                      { label: '财务可行性', val: 74, color: 'bg-pharma-morandi-blue' }
                    ].map(item => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider">
                          <span className="text-pharma-text-dim">{item.label}</span>
                          <span className="text-white">{item.val}%</span>
                        </div>
                        <div className="h-0.5 w-full bg-pharma-border rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.val}%` }}
                            transition={TRANSITION_600}
                            className={cn("h-full", item.color)} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* AI Risk Assessment */}
                <section className="p-4 bg-pharma-card/30 border border-pharma-border rounded-2xl space-y-4">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-pharma-text-dim">AI 风险评估模型</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-pharma-text-dim uppercase font-bold">科学可行性</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">82%</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] text-pharma-text-dim uppercase font-bold">监管通过率</span>
                      <span className="text-xs font-mono font-bold text-pharma-accent">65%</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-pharma-border/50">
                    <p className="text-[9px] text-pharma-text-dim leading-relaxed italic">
                      "基于当前临床数据，该项目在同类药物中具有显著的竞争优势，但需关注三期实验的招募进度。"
                    </p>
                  </div>
                </section>

                {/* Strategic Recommendation */}
                <section className="space-y-3">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-pharma-text-dim">战略决策建议</h3>
                  <div className="p-4 rounded-2xl bg-pharma-accent/5 border border-pharma-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-pharma-accent" />
                      <span className="text-[10px] font-bold text-white">维持并加速 (Maintain & Accelerate)</span>
                    </div>
                    <p className="text-[9px] text-pharma-text-dim leading-relaxed">
                      建议在未来 12 个月内增加 15% 的研发预算，以确保在 2028 年前完成临床三期。
                    </p>
                  </div>
                </section>
              </div>

              <div className="p-5 border-t border-pharma-border">
                <button className="w-full bg-pharma-accent text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-pharma-accent/20 hover:scale-[1.02] active:scale-[0.98]">
                  生成完整分析报告 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-pharma-card border border-pharma-border flex items-center justify-center mb-6 opacity-20">
                <Activity className="w-8 h-8 text-pharma-text-dim" />
              </div>
              <h4 className="text-xs font-black text-white mb-2 tracking-tight uppercase">未选中项目</h4>
              <p className="text-[10px] text-pharma-text-dim max-w-[160px] leading-relaxed">请从左侧列表或象限图中选择一个项目以查看深度钻取分析</p>
            </div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}
