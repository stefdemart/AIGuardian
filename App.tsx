import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Database, 
  Key, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Search, 
  Download, 
  Share2, 
  BrainCircuit, 
  FileText,
  Moon,
  Sun,
  Loader2, 
  Activity,
  Briefcase,
  Users,
  Landmark,
  Heart,
  TrendingUp,
  Cpu,
  Filter,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Trash2,
  AlertTriangle,
  Settings,
  History,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ExternalLink,
  ArrowUpRight,
  Sparkles,
  Lock,
  Server,
  Network,
  Eye,
  Globe,
  Scan,
  Fingerprint,
  MapPin,
  AlertOctagon,
  Terminal,
  Ghost,
  Copy,
  CheckSquare,
  Square,
  ShieldCheck,
  HardDrive,
  Scale,
  FileKey,
  ChevronLeft,
  ShieldAlert
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ViewState, VaultItem, ChartData, AnalysisHistoryItem, RiskLevel, Risk } from './types';
import { CookieBanner } from './components/CookieBanner';
import { ImportWizard } from './components/ImportWizard';
import { analyzeVaultData } from './services/geminiService';

// --- Mock Data ---

const MOCK_VAULT_ITEMS: VaultItem[] = [
  { id: '1', source: 'ChatGPT', type: 'conversation', date: '2023-10-15', summary: 'Brainstorming Marketing Eco-responsable', encryptedContent: 'EncryptedBlob_A1B2C3D4...', tags: ['work', 'marketing'] },
  { id: '2', source: 'Claude', type: 'code', date: '2023-10-18', summary: 'Refactoring React Components', encryptedContent: 'EncryptedBlob_E5F6G7H8...', tags: ['dev', 'react'], riskLevel: 'HIGH', risks: [{id: 'r1', type: 'SECRET', description: 'Clé API AWS détectée', snippet: 'AWS_ACCESS_KEY_ID=AKIA...'}] },
  { id: '3', source: 'Gemini', type: 'conversation', date: '2023-11-02', summary: 'Recette Cuisine Italienne', encryptedContent: 'EncryptedBlob_I9J0K1L2...', tags: ['perso', 'cooking'] },
  { id: '4', source: 'Midjourney', type: 'image', date: '2023-11-05', summary: 'Cyberpunk Cityscapes', encryptedContent: 'EncryptedBlob_M3N4O5P6...', tags: ['art', 'concept'] },
  { id: '5', source: 'ChatGPT', type: 'conversation', date: '2023-11-08', summary: 'Planification Voyage Japon', encryptedContent: 'EncryptedBlob_Q7R8S9T0...', tags: ['perso', 'travel'], riskLevel: 'MEDIUM', risks: [{id: 'r2', type: 'PII', description: 'Numéro de passeport', snippet: 'Passeport: 18AV5...'}] },
  { id: '6', source: 'Github Copilot', type: 'code', date: '2023-11-10', summary: 'Python Script Automation', encryptedContent: 'EncryptedBlob_U1V2W3X4...', tags: ['dev', 'python'] },
];

const MOCK_HISTORY: AnalysisHistoryItem[] = [
  { id: 'h1', date: '2023-11-10', score: 85, summary: 'Profil axé technique et développement.' },
  { id: 'h2', date: '2023-10-25', score: 72, summary: 'Dominante créative et artistique.' },
];

interface ProfileDimensionData {
  label: string;
  scores: {
    ALL: number;
    ChatGPT: number;
    Claude: number;
    Gemini: number;
    [key: string]: number;
  };
  color: string;
  icon: React.ReactNode;
  history: number[]; // For Sparkline
}

const PROFILE_DIMENSIONS_DATA: ProfileDimensionData[] = [
  { 
    label: 'Professionnel', 
    scores: { ALL: 85, ChatGPT: 60, Claude: 90, Gemini: 40 }, 
    color: 'bg-cyan-500', 
    icon: <Briefcase className="w-4 h-4" />,
    history: [60, 65, 70, 75, 80, 85]
  },
  { 
    label: 'Personnel', 
    scores: { ALL: 62, ChatGPT: 70, Claude: 30, Gemini: 65 }, 
    color: 'bg-emerald-500', 
    icon: <Heart className="w-4 h-4" />,
    history: [60, 62, 61, 63, 62, 62]
  },
  { 
    label: 'Psychologique', 
    scores: { ALL: 45, ChatGPT: 55, Claude: 40, Gemini: 20 }, 
    color: 'bg-fuchsia-500', 
    icon: <Activity className="w-4 h-4" />,
    history: [40, 42, 41, 43, 44, 45]
  },
  { 
    label: 'Sociologique', 
    scores: { ALL: 30, ChatGPT: 35, Claude: 25, Gemini: 10 }, 
    color: 'bg-yellow-500', 
    icon: <Users className="w-4 h-4" />,
    history: [25, 26, 28, 29, 30, 30]
  },
  { 
    label: 'Économique', 
    scores: { ALL: 78, ChatGPT: 50, Claude: 60, Gemini: 85 }, 
    color: 'bg-blue-500', 
    icon: <TrendingUp className="w-4 h-4" />,
    history: [70, 72, 75, 74, 76, 78]
  },
  { 
    label: 'Politique', 
    scores: { ALL: 15, ChatGPT: 20, Claude: 10, Gemini: 5 }, 
    color: 'bg-rose-500', 
    icon: <Landmark className="w-4 h-4" />,
    history: [10, 12, 11, 13, 14, 15]
  },
];

// --- Sub-Components ---

// Spotlight Card Component (Cyber Style)
const SpotlightCard: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = "", onClick }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-white dark:bg-slate-950/60 backdrop-blur-md shadow-sm transition-all duration-300 ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(6, 182, 212, 0.15), transparent 40%)`,
        }}
      />
      <div className="relative h-full z-20">{children}</div>
    </div>
  );
};

// Animated Background Component (Cyber)
const BackgroundBeams = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
    </div>
  );
};

const Sparkline: React.FC<{ data: number[], colorClass: string }> = ({ data, colorClass }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 20 - ((val - min) / range) * 20;
    return `${x},${y}`;
  }).join(' ');

  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3b82f6',
    'bg-emerald-500': '#10b981',
    'bg-fuchsia-500': '#d946ef',
    'bg-yellow-500': '#eab308',
    'bg-cyan-500': '#06b6d4',
    'bg-rose-500': '#f43f5e',
  };
  const strokeColor = colorMap[colorClass] || '#64748b';

  return (
    <svg width="60" height="20" viewBox="0 0 60 20" className="overflow-visible">
      <polyline 
        points={points} 
        fill="none" 
        stroke={strokeColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="60" cy={20 - ((data[data.length-1] - min) / range) * 20} r="2" fill={strokeColor} />
    </svg>
  );
};

interface DisplayDimension {
  label: string;
  score: number;
  color: string;
  icon: React.ReactNode;
  history: number[];
}

const AnimatedProgressBar: React.FC<{ dimension: DisplayDimension, delay: number }> = ({ dimension, delay }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(dimension.score);
    }, delay);
    setWidth(dimension.score);
    return () => clearTimeout(timer);
  }, [dimension.score, delay]);

  return (
    <div className="mb-5 group">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <span className={`p-1.5 rounded-lg ${dimension.color} bg-opacity-10 text-inherit dark:text-white dark:bg-opacity-20 backdrop-blur-sm`}>
            {dimension.icon}
          </span>
          {dimension.label}
        </div>
        <div className="flex items-center gap-3">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500" title="Évolution sur 6 mois">
                <Sparkline data={dimension.history} colorClass={dimension.color} />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white w-8 text-right font-mono">{dimension.score}%</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-1.5 rounded-full ${dimension.color} shadow-[0_0_10px_rgba(var(--color-rgb),0.5)] transition-all duration-1000 ease-out`} 
          style={{ width: `${width}%` }}
        ></div>
      </div>
    </div>
  );
};

// 2FA Modal Component
interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode(['', '', '', '', '', '']);
      setError(false);
      setIsVerifying(false);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`2fa-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const verifyCode = () => {
    setIsVerifying(true);
    setError(false);
    setTimeout(() => {
      if (code.join('') === '123456') {
        setIsVerifying(false);
        onSuccess();
      } else {
        setIsVerifying(false);
        setError(true);
      }
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
      <SpotlightCard className="max-w-sm w-full p-8 border-slate-200 dark:border-cyan-500/30 !bg-white/90 dark:!bg-slate-950/90 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center mb-2 animate-pulse-slow">
            <Smartphone className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-mono">2FA Secure Check</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Saisissez le code temporaire (** ** ** 42).
            </p>
          </div>
          <div className="flex gap-2 justify-center py-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`2fa-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                className={`w-10 h-12 text-center text-xl font-bold font-mono rounded-lg border bg-transparent focus:ring-2 focus:ring-cyan-500/50 focus:outline-none transition-all ${
                  error ? 'border-red-500/50 text-red-500' : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                }`}
              />
            ))}
          </div>
          {error && <div className="text-xs text-red-500 font-medium">Code incorrect. (Essai: 123456)</div>}
          <div className="w-full space-y-3">
            <button onClick={verifyCode} disabled={isVerifying} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30 transition-all font-mono">
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'VERIFY IDENTITY'}
            </button>
            <button onClick={onClose} className="w-full py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm transition-colors">Annuler</button>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
};

// --- Main App Component ---

interface ExportConfig {
  includeAnalysis: boolean;
  includeRecommendations: boolean;
  selectedSources: string[];
  selectedTypes: string[];
}

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(MOCK_VAULT_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');
  const [showDlsModal, setShowDlsModal] = useState(false);
  const [generatedDls, setGeneratedDls] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0); 
  const [isDarkMode, setIsDarkMode] = useState(true); 
  const [selectedDimensionProvider, setSelectedDimensionProvider] = useState<string>('ALL');
  const [selectedChartFilter, setSelectedChartFilter] = useState<string | null>(null);
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [pending2FAAction, setPending2FAAction] = useState<(() => void) | null>(null);
  const [itemToDelete, setItemToDelete] = useState<VaultItem | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAuditMode, setIsAuditMode] = useState(false);
  const [selectedRiskItem, setSelectedRiskItem] = useState<VaultItem | null>(null);
  const [showExportConfigModal, setShowExportConfigModal] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    includeAnalysis: true,
    includeRecommendations: true,
    selectedSources: [],
    selectedTypes: []
  });

  // OSINT State
  const [osintSearchTerm, setOsintSearchTerm] = useState('');
  const [isScanningOsint, setIsScanningOsint] = useState(false);
  const [osintLogs, setOsintLogs] = useState<string[]>([]);
  const [osintResults, setOsintResults] = useState<any | null>(null);

  // Landing Page Header State
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const [enabledSources, setEnabledSources] = useState<Record<string, boolean>>({
    'ChatGPT': true, 'Claude': true, 'Gemini': true
  });
  
  const allAvailableSources = Array.from(new Set(vaultItems.map(i => i.source)));
  const allAvailableTypes = Array.from(new Set(vaultItems.map(i => i.type)));

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Initialize export config when vault items change
  useEffect(() => {
      setExportConfig(prev => ({
          ...prev,
          selectedSources: allAvailableSources,
          selectedTypes: allAvailableTypes
      }));
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const filteredItems = vaultItems.filter(item => {
    const matchesSearch = item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSource = selectedSourceFilter === 'ALL' || item.source === selectedSourceFilter;
    return matchesSearch && matchesSource;
  });

  const uniqueSources = ['ALL', ...Array.from(new Set(vaultItems.map(item => item.source)))];

  const handleLogin = () => { setView(ViewState.DASHBOARD); window.scrollTo(0,0); };
  const handleLogout = () => { setView(ViewState.LANDING); setIsMenuOpen(false); };

  const handleImportComplete = () => {
    setShowImport(false);
    const newItem: VaultItem = {
      id: Math.random().toString(36).substr(2, 9),
      source: 'Upload Externe',
      type: 'conversation',
      date: new Date().toISOString().split('T')[0],
      summary: 'Nouvelles données importées (Analyse en attente)',
      encryptedContent: 'EncryptedBlob_NewImport...',
      tags: ['import']
    };
    setVaultItems([newItem, ...vaultItems]);
    setExportConfig(prev => ({...prev, selectedSources: [...prev.selectedSources, 'Upload Externe']}));
  };

  const handleSecureAction = (action: () => void) => {
    setPending2FAAction(() => action);
    setIs2FAOpen(true);
  };

  const on2FASuccess = () => {
    setIs2FAOpen(false);
    if (pending2FAAction) {
      pending2FAAction();
      setPending2FAAction(null);
    }
  };

  const handleDeleteClick = (item: VaultItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    if (itemToDelete) {
      setVaultItems(vaultItems.filter(i => i.id !== itemToDelete.id));
      setItemToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const generateDls = () => {
    const parts = ['DLS', Math.floor(Math.random() * 90 + 10).toString(), 'X', Math.random().toString(36).substr(2, 6).toUpperCase(), Math.random().toString(36).substr(2, 3).toUpperCase(), 'SK', Math.random().toString(36).substr(2, 12).toUpperCase(), Math.random().toString(36).substr(2, 12).toUpperCase(), 'V2'];
    setGeneratedDls('dls_sk_live_' + parts.join('').toLowerCase());
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast here
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisStep(1); 
    
    setTimeout(() => setAnalysisStep(2), 1500); 
    setTimeout(() => setAnalysisStep(3), 3000); 

    setTimeout(async () => {
      const summaries = vaultItems.filter(i => enabledSources[i.source] !== false).map(i => i.summary);
      const result = await analyzeVaultData(summaries);
      setAiAnalysis(result);
      setAnalyzing(false);
      setAnalysisStep(0);
    }, 4500);
  };

  const executeExport = () => {
    const itemsToExport = vaultItems.filter(item => 
        exportConfig.selectedSources.includes(item.source) &&
        exportConfig.selectedTypes.includes(item.type)
    );

    const profileData = {
      title: "Profil de Connaissances AIGuardian",
      date: new Date().toISOString(),
      metadata: {
        totalItems: itemsToExport.length,
        sources: exportConfig.selectedSources,
        types: exportConfig.selectedTypes
      },
      analysis: exportConfig.includeAnalysis ? (aiAnalysis || "Non analysé") : null,
      recommendations: exportConfig.includeRecommendations ? getRecommendations() : null,
      tags: Array.from(new Set(itemsToExport.flatMap(i => i.tags))),
      dimensions: PROFILE_DIMENSIONS_DATA,
      data: itemsToExport // In a real scenario, we might export encrypted blobs or decrypted data depending on user choice
    };

    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mon_profil_aiguardian_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportConfigModal(false);
  };

  const openExportConfig = () => {
      // Ensure defaults are set correctly before opening
      setExportConfig(prev => ({
          ...prev,
          selectedSources: allAvailableSources.length > prev.selectedSources.length ? allAvailableSources : prev.selectedSources,
          selectedTypes: allAvailableTypes.length > prev.selectedTypes.length ? allAvailableTypes : prev.selectedTypes
      }));
      setShowExportConfigModal(true);
  };
  
  const getExportSummaryCount = () => {
      return vaultItems.filter(item => 
        exportConfig.selectedSources.includes(item.source) &&
        exportConfig.selectedTypes.includes(item.type)
      ).length;
  };

  const downloadEncryptedItem = (item: VaultItem) => {
    const dataToDownload = { ...item, encryptionMethod: "AES-256 (Simulated)" };
    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aiguardian_encrypted_${item.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const rotateKeys = () => {
    alert("Rotation des clés de chiffrement effectuée avec succès. Vos données ont été ré-encapsulées.");
  };

  // --- OSINT Functionality ---
  const runOsintScan = () => {
    if(!osintSearchTerm) return;
    setIsScanningOsint(true);
    setOsintResults(null);
    setOsintLogs([]);
    
    const logs = [
      "Initializing deep web crawler...",
      `Targeting identity: ${osintSearchTerm}`,
      "Querying breach databases (HaveIBeenPwned API)...",
      "Scanning social graph nodes...",
      "Analyzing public metadata...",
      "Warning: 3 potential leaks found in darknet dumps.",
      "Triangulating digital footprint...",
      "Compiling report..."
    ];

    let delay = 0;
    logs.forEach((log, index) => {
      delay += Math.random() * 800 + 400;
      setTimeout(() => {
        setOsintLogs(prev => [...prev, log]);
        if(index === logs.length - 1) {
          setIsScanningOsint(false);
          setOsintResults({
             exposureScore: "CRITIQUE",
             breaches: [
               { source: "LinkedIn", date: "2021", data: "Email, Profession, Connections" },
               { source: "Adobe", date: "2013", data: "Email, Password Hint, Username" },
               { source: "Canva", date: "2019", data: "Email, Name, City" }
             ],
             socials: [
               { platform: "Twitter", username: "@target_user", risk: "Public Geo-tagging" },
               { platform: "Instagram", username: "unknown", risk: "Face Recognition Match" }
             ],
             metadata: {
               ips: ["45.32.12.xx", "192.168.1.xx"],
               devices: ["iPhone 13", "MacBook Pro (2021)"]
             }
          });
        }
      }, delay);
    });
  };

  const getRecommendations = () => {
    const allTags = vaultItems.flatMap(i => i.tags);
    const recs = [];
    
    if (allTags.some(t => ['dev', 'react', 'python', 'code'].includes(t))) {
      recs.push({ 
        title: "Sécurité & Bonnes Pratiques", 
        text: "Code détecté. Pensez à scanner vos snippets pour éviter les fuites de secrets (API Keys).", 
        icon: <Shield className="w-4 h-4 text-emerald-500" /> 
      });
    }
    
    if (allTags.some(t => ['work', 'marketing', 'business'].includes(t))) {
      recs.push({ 
        title: "Analyse de Marché", 
        text: "Vos conversations contiennent des données stratégiques. Utilisez l'analyse IA pour synthétiser ces tendances.", 
        icon: <TrendingUp className="w-4 h-4 text-cyan-500" /> 
      });
    }

    if (allTags.some(t => ['art', 'concept', 'design', 'image'].includes(t))) {
       recs.push({ 
        title: "Gestion des Assets", 
        text: "Volume d'images important. Envisagez de taguer vos prompts pour une meilleure retrouvabilité.", 
        icon: <Sparkles className="w-4 h-4 text-fuchsia-500" /> 
      });
    }

    if (allTags.some(t => ['perso', 'travel', 'cooking', 'life'].includes(t))) {
        recs.push({ 
         title: "Equilibre de Vie", 
         text: "Vos données personnelles sont riches. Créez des exports spécifiques pour ces souvenirs.", 
         icon: <Heart className="w-4 h-4 text-rose-500" /> 
       });
     }
    
    if (recs.length === 0) {
      recs.push({ title: "Enrichissez votre profil", text: "Connectez plus de sources pour obtenir des recommandations personnalisées.", icon: <Lightbulb className="w-4 h-4 text-yellow-500" /> });
    }
    return recs;
  };

  const getFilteredTags = () => {
    let items = vaultItems;
    if (selectedChartFilter) {
      items = items.filter(i => i.type === selectedChartFilter);
    }
    return Array.from(new Set(items.flatMap(i => i.tags)));
  };
  
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
  };

  const getRiskBadge = (level?: RiskLevel) => {
    if (!level) return null;
    switch (level) {
      case 'LOW': 
        return <span title="Risque Faible" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500"><ShieldCheck className="w-4 h-4" /></span>;
      case 'MEDIUM': 
        return <span title="Risque Moyen" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500"><AlertTriangle className="w-4 h-4" /></span>;
      case 'HIGH': 
        return <span title="Risque Élevé" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-500"><AlertOctagon className="w-4 h-4" /></span>;
      case 'CRITICAL': 
        return <span title="Risque Critique" className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse"><ShieldAlert className="w-4 h-4" /></span>;
      default: return null;
    }
  };

  const Footer = () => (
    <footer className="bg-slate-50 dark:bg-slate-950 text-slate-400 py-12 border-t border-slate-200 dark:border-white/5 relative z-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="mb-4 font-mono text-sm tracking-wide">© 2026 AIGuardian. Sovereignty is non-negotiable.</p>
        <div className="flex justify-center gap-6 text-sm">
          <button onClick={() => { setView(ViewState.PRIVACY); window.scrollTo(0,0); }} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Confidentialité</button>
          <button onClick={() => { setView(ViewState.LEGAL); window.scrollTo(0,0); }} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Mentions Légales</button>
          <button onClick={() => { setView(ViewState.TERMS); window.scrollTo(0,0); }} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">CGU</button>
        </div>
      </div>
    </footer>
  );

  const Sidebar = () => (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 h-screen sticky top-0 z-40">
      <div className="p-6 flex items-center gap-2 text-white font-bold text-xl cursor-pointer" onClick={() => setView(ViewState.LANDING)}>
         <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20"></div>
            <Shield className="w-6 h-6 text-cyan-500 relative z-10" />
         </div>
         AIGuardian
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
         {[
           { id: ViewState.DASHBOARD, label: 'Mon Coffre-fort', icon: <Database className="w-5 h-5" /> },
           { id: ViewState.PROFILE, label: 'Profil de Connaissances', icon: <BrainCircuit className="w-5 h-5" /> },
           { id: ViewState.OSINT, label: 'Empreintes Internet', icon: <Eye className="w-5 h-5" /> },
           { id: ViewState.DLS, label: 'Portabilité (DLS)', icon: <Share2 className="w-5 h-5" /> },
           { id: ViewState.SETTINGS, label: 'Paramètres', icon: <Settings className="w-5 h-5" /> }
         ].map(item => (
           <button
             key={item.id}
             onClick={() => setView(item.id)}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
               view === item.id 
               ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
               : 'hover:bg-white/5 hover:text-white'
             }`}
           >
             {item.icon}
             <span className="font-medium">{item.label}</span>
           </button>
         ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
         <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-cyan-400">
               <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
               SECURE CORE
            </div>
            <div className="text-xs text-slate-500">AES-256 • DLS Protocol</div>
         </div>
         <button onClick={handleLogout} className="mt-4 w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
         </button>
      </div>
    </aside>
  );

  const renderLanding = () => {
    // Dropdown Data
    const featuresMenu = [
        { icon: <Database className="w-4 h-4 text-cyan-500" />, title: "Coffre-fort Digital", desc: "Centralisation sécurisée de vos historiques." },
        { icon: <Share2 className="w-4 h-4 text-fuchsia-500" />, title: "Portabilité DLS", desc: "Format universel pour transférer vos données." },
        { icon: <Eye className="w-4 h-4 text-rose-500" />, title: "Empreintes Internet", desc: "Analysez votre exposition publique." },
        { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, title: "Audit de Risques", desc: "Détection automatique de PII et secrets." }
    ];

    const securityMenu = [
        { icon: <Lock className="w-4 h-4 text-cyan-500" />, title: "Chiffrement AES-256", desc: "Exécuté localement dans votre navigateur." },
        { icon: <Server className="w-4 h-4 text-blue-500" />, title: "Zero-Knowledge", desc: "Aucun accès serveur à vos données brutes." },
        { icon: <HardDrive className="w-4 h-4 text-slate-500" />, title: "Local Storage", desc: "Vos données restent sur votre appareil." }
    ];

    const tipsMenu = [
        { icon: <RefreshCw className="w-4 h-4 text-orange-500" />, title: "Hygiène Numérique", desc: "Nettoyez vos traces régulièrement." },
        { icon: <Cpu className="w-4 h-4 text-indigo-500" />, title: "Modèles Locaux", desc: "Utilisez Llama/Mistral pour le sensible." },
        { icon: <Terminal className="w-4 h-4 text-green-500" />, title: "Prompting Sûr", desc: "Ne partagez jamais de clés privées." }
    ];

    return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-500">
      <BackgroundBeams />
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 relative">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 animate-pulse group-hover:opacity-40 transition-opacity"></div>
              <Shield className="w-8 h-8 text-blue-600 dark:text-cyan-400 relative z-10" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">AIGuardian</span>
          </div>
          
          <nav className="hidden md:flex gap-1">
            {/* Features Menu */}
            <div 
                className="relative group"
                onMouseEnter={() => setHoveredNav('features')}
                onMouseLeave={() => setHoveredNav(null)}
            >
                <button 
                    onClick={() => scrollToSection('features')}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center gap-1"
                >
                    Fonctionnalités <ChevronDown className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform" />
                </button>
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 p-2 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl transition-all duration-200 origin-top ${hoveredNav === 'features' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                    <div className="grid gap-1">
                        {featuresMenu.map((item, i) => (
                            <button key={i} onClick={() => scrollToSection('features')} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left group/item">
                                <div className="mt-1 p-1.5 bg-slate-100 dark:bg-white/5 rounded-md group-hover/item:bg-white dark:group-hover/item:bg-white/10 transition-colors">{item.icon}</div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover/item:text-cyan-500 transition-colors">{item.title}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{item.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security Menu */}
            <div 
                className="relative group"
                onMouseEnter={() => setHoveredNav('security')}
                onMouseLeave={() => setHoveredNav(null)}
            >
                <button 
                    onClick={() => scrollToSection('security')}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center gap-1"
                >
                    Sécurité <ChevronDown className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform" />
                </button>
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-2 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl transition-all duration-200 origin-top ${hoveredNav === 'security' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                    <div className="grid gap-1">
                        {securityMenu.map((item, i) => (
                            <button key={i} onClick={() => scrollToSection('security')} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left group/item">
                                <div className="mt-1 p-1.5 bg-slate-100 dark:bg-white/5 rounded-md group-hover/item:bg-white dark:group-hover/item:bg-white/10 transition-colors">{item.icon}</div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover/item:text-cyan-500 transition-colors">{item.title}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{item.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tips Menu */}
            <div 
                className="relative group"
                onMouseEnter={() => setHoveredNav('tips')}
                onMouseLeave={() => setHoveredNav(null)}
            >
                <button 
                    onClick={() => scrollToSection('tips')}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center gap-1"
                >
                    Conseils <ChevronDown className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform" />
                </button>
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 p-2 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl transition-all duration-200 origin-top ${hoveredNav === 'tips' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                    <div className="grid gap-1">
                        {tipsMenu.map((item, i) => (
                            <button key={i} onClick={() => scrollToSection('tips')} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left group/item">
                                <div className="mt-1 p-1.5 bg-slate-100 dark:bg-white/5 rounded-md group-hover/item:bg-white dark:group-hover/item:bg-white/10 transition-colors">{item.icon}</div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover/item:text-cyan-500 transition-colors">{item.title}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{item.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </nav>
          
          <div className="hidden md:flex gap-4 items-center">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={handleLogin} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Connexion</button>
            <button onClick={handleLogin} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-5 py-2 rounded-full font-medium text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all transform hover:-translate-y-0.5">Créer un compte</button>
          </div>
          <div className="md:hidden flex items-center gap-4">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-900 dark:text-white"><Menu /></button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-20 px-4 relative z-10 scroll-smooth">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-500/20 text-xs font-mono font-medium text-cyan-700 dark:text-cyan-400 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              <Sparkles className="w-3 h-3" /> Compatible Gemini 2.0 & GPT-5
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Datas Local Secure.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500 animate-gradient-x">L'avenir est souverain.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Centralisez vos historiques d'IA dans un coffre-fort chiffré AES-256. 
              <span className="block mt-2 text-slate-500 dark:text-slate-400 text-base">Traitement 100% Client-Side. Zéro transfert serveur.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <button onClick={handleLogin} className="group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">Débuter l'expérience DLS <ArrowUpRight className="w-5 h-5" /></span>
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="pt-24 scroll-mt-24">
             <h2 className="text-3xl font-bold mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"><span className="text-cyan-500">Fonctionnalités</span> Cyber-Souveraines</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { icon: <Lock className="w-6 h-6 text-cyan-500" />, title: "Chiffrement Neural", desc: "Clé DLS AES-256 générée localement. Vos données sont indéchiffrables sans votre action." },
                { icon: <Database className="w-6 h-6 text-blue-500" />, title: "Stockage Isolé", desc: "IndexedDB chiffré. Vos pensées restent sur votre silicium, pas dans le cloud." },
                { icon: <Share2 className="w-6 h-6 text-fuchsia-500" />, title: "Portabilité DLS", desc: "Le protocole DLS permet de migrer votre 'âme numérique' d'une IA à l'autre." }
              ].map((feature, i) => (
                <SpotlightCard key={i} className="p-8 text-left hover:-translate-y-2 transition-transform duration-500 group border-slate-200 dark:border-white/5 dark:hover:border-cyan-500/30">
                  <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500 shadow-inner">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </SpotlightCard>
              ))}
            </div>
          </div>

          {/* Security Section */}
          <div id="security" className="pt-24 scroll-mt-24">
             <div className="bg-slate-900 text-white rounded-3xl p-12 relative overflow-hidden border border-white/10 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                   <div className="flex-1 text-left space-y-6">
                      <div className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-mono rounded-full">ARCHITECTURE ZERO-TRUST</div>
                      <h2 className="text-3xl md:text-4xl font-bold">Sécurité de niveau militaire. <br/>Par défaut.</h2>
                      <p className="text-slate-300 leading-relaxed">
                        Notre code est open-source et audité. Le chiffrement se fait à la volée dans la mémoire RAM de votre navigateur via l'API Web Crypto. Aucune donnée en clair ne touche jamais un disque dur.
                      </p>
                      <ul className="space-y-3 pt-4">
                        {["Chiffrement Client-Side AES-GCM", "Pas de cookies tiers", "Anonymat total (Pas d'email requis)"].map(item => (
                          <li key={item} className="flex items-center gap-3 text-sm font-mono text-cyan-200">
                             <CheckCircle2 className="w-4 h-4 text-cyan-500" /> {item}
                          </li>
                        ))}
                      </ul>
                   </div>
                   <div className="flex-1 flex justify-center">
                      <Shield className="w-64 h-64 text-cyan-500/80 drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]" />
                   </div>
                </div>
             </div>
          </div>

          {/* Tips Section */}
          <div id="tips" className="pt-24 pb-12 scroll-mt-24">
            <h2 className="text-3xl font-bold mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">Conseils pour une <span className="text-fuchsia-500">IA Souveraine</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                 { title: "Local First", text: "Privilégiez les modèles exécutés localement (Llama 3, Mistral) via des outils comme Ollama pour les données ultra-sensibles.", color: "text-emerald-400", border: "border-emerald-500/20" },
                 { title: "Nettoyage Périodique", text: "Utilisez AIGuardian pour auditer votre historique et supprimer les conversations contenant des PII (Infos Personnelles).", color: "text-blue-400", border: "border-blue-500/20" },
                 { title: "Diversification", text: "Ne dépendez pas d'un seul fournisseur. Exportez vos données régulièrement via le format DLS.", color: "text-fuchsia-400", border: "border-fuchsia-500/20" },
                 { title: "Vigilance Prompt", text: "Ne donnez jamais vos mots de passe ou clés privées à une IA, même 'de confiance'.", color: "text-rose-400", border: "border-rose-500/20" }
               ].map((tip, idx) => (
                 <SpotlightCard key={idx} className={`p-6 text-left border ${tip.border} hover:bg-slate-900/80 transition-all`}>
                    <h3 className={`font-mono font-bold text-lg mb-3 ${tip.color}`}>{tip.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{tip.text}</p>
                 </SpotlightCard>
               ))}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
  };
  
  // --- RENDER PUBLIC PAGE (PRIVACY / LEGAL / TERMS) ---
  const renderPublicPage = () => {
    let content;
    let title;
    let icon;

    if (view === ViewState.PRIVACY) {
      title = "Politique de Confidentialité";
      icon = <ShieldCheck className="w-6 h-6 text-cyan-500" />;
      content = (
        <div className="space-y-8 text-slate-400 leading-relaxed text-sm">
           <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-200 text-sm mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong>Résumé "Zero-Knowledge" :</strong> AIGuardian n'a techniquement pas accès à vos données. Elles sont chiffrées dans votre navigateur avant tout stockage. Nous ne pouvons ni les lire, ni les vendre.
              </div>
           </div>

           <section>
             <h3 className="text-lg font-mono font-bold text-white mb-3">1. Collecte et Minimisation (Art. 5 RGPD)</h3>
             <p>Conformément au principe de minimisation des données, AIGuardian ne collecte que le strict nécessaire au fonctionnement technique du service. Aucune donnée personnelle (nom, email, IP) n'est stockée sur nos serveurs. Vos conversations importées restent stockées exclusivement dans le <code>localStorage</code> de votre navigateur ou dans une base de données IndexedDB locale chiffrée.</p>
           </section>

           <section>
             <h3 className="text-lg font-mono font-bold text-white mb-3">2. Chiffrement et Sécurité (Art. 32 RGPD)</h3>
             <p>Nous appliquons des mesures de sécurité techniques avancées ("Privacy by Design"). Toutes les données sont chiffrées côté client via l'algorithme <strong>AES-256-GCM</strong>. La clé de déchiffrement (votre clé DLS) est générée sur votre appareil et n'est jamais transmise à nos serveurs.</p>
           </section>

           <section>
             <h3 className="text-lg font-mono font-bold text-white mb-3">3. Conformité EU AI Act</h3>
             <p>AIGuardian s'engage pour une IA transparente et éthique :</p>
             <ul className="list-disc pl-5 space-y-2 mt-2">
               <li><strong>Transparence :</strong> Vous êtes informé lorsque vous interagissez avec une analyse IA (ex: Gemini). Cette analyse est optionnelle et explicite.</li>
               <li><strong>Contrôle Humain :</strong> Aucune décision automatisée n'est prise sans votre validation (ex: suppression de données, fusion de profils).</li>
             </ul>
           </section>

           <section>
             <h3 className="text-lg font-mono font-bold text-white mb-3">4. Vos Droits (Art. 15-21 RGPD)</h3>
             <p>Vous disposez d'un contrôle absolu sur vos données :</p>
             <ul className="list-disc pl-5 space-y-2 mt-2">
               <li><strong>Droit à l'effacement :</strong> Le bouton "Supprimer" dans l'application efface définitivement les clés de chiffrement, rendant les données irrécupérables.</li>
               <li><strong>Droit à la portabilité (DLS) :</strong> Notre format ouvert vous permet de récupérer l'intégralité de votre profil sous forme de JSON structuré pour le transférer vers un autre service.</li>
             </ul>
           </section>
        </div>
      );
    } else if (view === ViewState.LEGAL) {
        title = "Mentions Légales";
        icon = <Scale className="w-6 h-6 text-fuchsia-500" />;
        content = (
           <div className="space-y-8 text-slate-400 leading-relaxed text-sm">
             <section>
               <h3 className="text-lg font-mono font-bold text-white mb-3">Éditeur du Service</h3>
               <p>
                 <strong>AIGuardian SAS</strong><br/>
                 Société par Actions Simplifiée au capital de 10 000 €<br/>
                 Siège social : 42 Avenue de la Souveraineté Numérique, 75000 Paris, France<br/>
                 RCS Paris B 123 456 789<br/>
                 TVA Intracommunautaire : FR 12 123456789
               </p>
             </section>
             <section>
               <h3 className="text-lg font-mono font-bold text-white mb-3">Directeur de la Publication</h3>
               <p>Monsieur Jean Data, en qualité de Président.</p>
             </section>
             <section>
               <h3 className="text-lg font-mono font-bold text-white mb-3">Hébergement</h3>
               <p>
                 Le site est hébergé par Vercel Inc.<br/>
                 340 S Lemon Ave #4133 Walnut, CA 91789, USA.<br/>
                 <em>Note : Les données utilisateurs ne sont pas hébergées par Vercel mais stockées localement sur le terminal de l'utilisateur.</em>
               </p>
             </section>
              <section>
               <h3 className="text-lg font-mono font-bold text-white mb-3">Propriété Intellectuelle</h3>
               <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
             </section>
           </div>
        );
    } else if (view === ViewState.TERMS) {
        title = "Conditions Générales d'Utilisation (CGU)";
        icon = <FileKey className="w-6 h-6 text-blue-500" />;
        content = (
           <div className="space-y-8 text-slate-400 leading-relaxed text-sm">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-200 text-sm mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <strong>Avertissement Important :</strong> Vous êtes le seul gardien de votre clé de chiffrement. En cas de perte, AIGuardian ne pourra techniquement pas restaurer vos données.
                </div>
             </div>

             <section>
               <h3 className="text-lg font-mono font-bold text-white mb-3">1. Objet</h3>
               <p>Les présentes CGU ont pour objet de définir les modalités de mise à disposition des services du site AIGuardian et les conditions d'utilisation du service par l'Utilisateur.</p>
             </section>

             <section>
               <h3 className="text-lg font-mono font-bold text-white mb-3">2. Responsabilité de l'Utilisateur</h3>
               <p>L'utilisateur est responsable de la sécurité de son terminal et de la conservation de sa clé DLS. AIGuardian décline toute responsabilité en cas de vol de données résultant d'une compromission du matériel de l'utilisateur (malware, vol physique).</p>
             </section>

             <section>
               <h3 className="text-lg font-mono font-bold text-white mb-3">3. Disponibilité du Service</h3>
               <p>Le service est fourni "tel quel". Bien que nous nous efforcions d'assurer une disponibilité maximale, nous ne pouvons garantir l'absence d'interruptions ou de bugs. Le mode "Local-First" vous permet cependant d'accéder à vos données déjà importées même hors connexion.</p>
             </section>

             <section>
               <h3 className="text-lg font-mono font-bold text-white mb-3">4. Usage de l'IA Générative</h3>
               <p>Les analyses de profil sont générées par des modèles d'IA tiers (Gemini). L'utilisateur reconnaît que ces analyses sont probabilistes et peuvent contenir des erreurs. Elles ne constituent pas un avis professionnel (médical, juridique, financier).</p>
             </section>
           </div>
        );
    }

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-500 relative overflow-hidden">
         <BackgroundBeams />
         <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView(ViewState.LANDING); window.scrollTo(0,0); }}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 animate-pulse"></div>
                        <Shield className="w-8 h-8 text-blue-600 dark:text-cyan-400 relative z-10" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">AIGuardian</span>
                </div>
                
                <nav className="hidden md:flex gap-6 items-center">
                    <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-colors">Fonctionnalités</button>
                    <button onClick={() => scrollToSection('security')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-colors">Sécurité</button>
                    <button onClick={() => scrollToSection('tips')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-500 transition-colors">Conseils</button>
                </nav>
                
                <div className="flex items-center gap-4">
                    <button onClick={() => setView(ViewState.LANDING)} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-white flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Retour
                    </button>
                </div>
            </div>
         </header>
         
         <main className="pt-32 pb-20 px-4 relative z-10">
            <div className="max-w-3xl mx-auto">
               <SpotlightCard className="p-8 md:p-12 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-white/10">
                     <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl">
                        {icon}
                     </div>
                     <div>
                        <h1 className="text-3xl font-bold">{title}</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Dernière mise à jour : 07/12/2025</p>
                     </div>
                  </div>
                  {content}
               </SpotlightCard>
            </div>
         </main>
         <Footer />
      </div>
    );
  };

  const isPublic = [ViewState.LANDING, ViewState.PRIVACY, ViewState.LEGAL, ViewState.TERMS].includes(view);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {view === ViewState.LANDING && renderLanding()}
      
      {[ViewState.PRIVACY, ViewState.LEGAL, ViewState.TERMS].includes(view) && renderPublicPage()}

      {!isPublic && (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans">
             <Sidebar />
             <main className="flex-1 overflow-y-auto h-screen relative">
                {view === ViewState.DASHBOARD && (
                     <div className="min-h-screen text-slate-900 dark:text-white transition-colors duration-500">
                        <header className="bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 p-4 flex justify-between items-center sticky top-0 z-40">
                            <div className="flex items-center gap-2">
                                <Shield className="w-6 h-6 text-cyan-500" />
                                <span className="font-bold">AIGuardian Vault</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={runAnalysis} disabled={analyzing} className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/20 transition-colors">
                                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
                                    {analyzing ? 'Analyse...' : 'Analyser le profil'}
                                </button>
                                {/* Removed redundant logout as it's in sidebar now, or keep as top bar action */}
                            </div>
                        </header>

                        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                            {/* Analysis Section */}
                            {aiAnalysis && (
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-4">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-fuchsia-500" /> Analyse IA du Profil</h2>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{aiAnalysis}</p>
                                </div>
                            )}

                            {/* Vault Items Grid */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Mes Données</h2>
                                    <div className="flex gap-2">
                                        <button onClick={() => setShowImport(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                                            <Plus className="w-4 h-4" /> Importer
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredItems.map(item => (
                                        <SpotlightCard key={item.id} className="p-5 flex flex-col h-full hover:border-cyan-500/50 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'image' ? 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                    {item.source}
                                                </div>
                                                {getRiskBadge(item.riskLevel)}
                                            </div>
                                            <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.summary}</h3>
                                            <div className="flex-grow">
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {item.tags.map(tag => (
                                                        <span key={tag} className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                                <span className="text-xs text-slate-400">{item.date}</span>
                                                <button onClick={() => handleDeleteClick(item)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </SpotlightCard>
                                    ))}
                                </div>
                            </div>
                        </div>
                     </div>
                )}
                
                {[ViewState.PROFILE, ViewState.SETTINGS, ViewState.OSINT, ViewState.DLS].includes(view) && (
                    <div className="p-8">
                        {view === ViewState.OSINT ? (
                           <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
                              <h1 className="text-3xl font-bold flex items-center gap-3">
                                 <Eye className="w-8 h-8 text-rose-500" /> Empreintes Internet
                              </h1>
                              
                              <div className="grid gap-6">
                                 <SpotlightCard className="p-6">
                                     <h3 className="text-lg font-bold mb-4">Scan d'exposition publique</h3>
                                     <div className="flex gap-4">
                                         <div className="flex-1 relative">
                                            <input 
                                              type="text" 
                                              placeholder="Email ou Pseudonyme à analyser..." 
                                              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-rose-500"
                                              value={osintSearchTerm}
                                              onChange={(e) => setOsintSearchTerm(e.target.value)}
                                            />
                                            <Search className="absolute right-3 top-3.5 text-slate-400 w-5 h-5" />
                                         </div>
                                         <button 
                                            onClick={runOsintScan} 
                                            disabled={isScanningOsint}
                                            className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] disabled:opacity-50"
                                         >
                                            {isScanningOsint ? <Loader2 className="animate-spin" /> : 'Lancer Scan'}
                                         </button>
                                     </div>
                                 </SpotlightCard>

                                 {/* Terminal Logs */}
                                 {osintLogs.length > 0 && (
                                     <div className="bg-black/90 rounded-xl p-4 font-mono text-sm text-green-400 h-64 overflow-y-auto border border-slate-800 shadow-inner">
                                         {osintLogs.map((log, i) => (
                                             <div key={i} className="mb-1 animate-in slide-in-from-left-2">
                                                 <span className="opacity-50 mr-2">{new Date().toLocaleTimeString()}</span>
                                                 {log}
                                             </div>
                                         ))}
                                         {isScanningOsint && <div className="animate-pulse">_</div>}
                                     </div>
                                 )}

                                 {/* Results */}
                                 {osintResults && (
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in duration-500">
                                         <SpotlightCard className="p-6 border-red-500/20">
                                             <div className="flex items-center gap-3 mb-4 text-red-500">
                                                 <AlertOctagon className="w-6 h-6" />
                                                 <h3 className="font-bold text-lg">Fuites de Données (Breaches)</h3>
                                             </div>
                                             <div className="space-y-3">
                                                 {osintResults.breaches.map((b: any, i: number) => (
                                                     <div key={i} className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/10">
                                                         <div>
                                                             <div className="font-bold text-red-200">{b.source}</div>
                                                             <div className="text-xs text-red-300">{b.data}</div>
                                                         </div>
                                                         <div className="text-xs font-mono bg-red-950 px-2 py-1 rounded text-red-400">{b.date}</div>
                                                     </div>
                                                 ))}
                                             </div>
                                         </SpotlightCard>
                                         
                                         <SpotlightCard className="p-6 border-orange-500/20">
                                             <div className="flex items-center gap-3 mb-4 text-orange-500">
                                                 <Globe className="w-6 h-6" />
                                                 <h3 className="font-bold text-lg">Traces Sociales</h3>
                                             </div>
                                             <div className="space-y-3">
                                                 {osintResults.socials.map((s: any, i: number) => (
                                                     <div key={i} className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/10">
                                                         <div>
                                                             <div className="font-bold text-orange-200">{s.platform}</div>
                                                             <div className="text-xs text-orange-300">@{s.username}</div>
                                                         </div>
                                                         <div className="text-xs bg-orange-950 px-2 py-1 rounded text-orange-400">{s.risk}</div>
                                                     </div>
                                                 ))}
                                             </div>
                                         </SpotlightCard>
                                     </div>
                                 )}
                              </div>
                           </div>
                        ) : (
                           // Placeholder for Profile/Settings/DLS
                           <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                              <h1 className="text-2xl font-bold text-white mb-2">{view}</h1>
                              <p>Section en cours de construction...</p>
                              <button onClick={() => setView(ViewState.LANDING)} className="text-cyan-500 underline">Retour Accueil</button>
                           </div>
                        )}
                    </div>
                )}
             </main>
        </div>
      )}

      <CookieBanner />
      {showImport && <ImportWizard onComplete={handleImportComplete} onCancel={() => setShowImport(false)} />}
      <TwoFactorModal isOpen={is2FAOpen} onClose={() => setIs2FAOpen(false)} onSuccess={on2FASuccess} />
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-white/10">
                  <h3 className="text-lg font-bold mb-2 dark:text-white">Confirmer la suppression</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.</p>
                  <div className="flex gap-3 justify-end">
                      <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Annuler</button>
                      <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Supprimer</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;