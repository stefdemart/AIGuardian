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
  Copy
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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

  // OSINT State
  const [osintSearchTerm, setOsintSearchTerm] = useState('');
  const [isScanningOsint, setIsScanningOsint] = useState(false);
  const [osintLogs, setOsintLogs] = useState<string[]>([]);
  const [osintResults, setOsintResults] = useState<any | null>(null);

  const [enabledSources, setEnabledSources] = useState<Record<string, boolean>>({
    'ChatGPT': true, 'Claude': true, 'Gemini': true
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  const downloadProfile = () => {
    const profileData = {
      title: "Profil de Connaissances AIGuardian",
      date: new Date().toISOString(),
      analysis: aiAnalysis || "Non analysé",
      tags: Array.from(new Set(vaultItems.flatMap(i => i.tags))),
      dimensions: PROFILE_DIMENSIONS_DATA
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

  const getChartData = () => {
    const counts = vaultItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [
      { name: 'Conversations', count: counts['conversation'] || 0, color: '#06b6d4', type: 'conversation' }, 
      { name: 'Code', count: counts['code'] || 0, color: '#10b981', type: 'code' }, 
      { name: 'Images', count: counts['image'] || 0, color: '#d946ef', type: 'image' }, 
    ];
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

  const renderLanding = () => (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white transition-colors duration-500">
      <BackgroundBeams />
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 animate-pulse group-hover:opacity-40 transition-opacity"></div>
              <Shield className="w-8 h-8 text-blue-600 dark:text-cyan-400 relative z-10" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">AIGuardian</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Fonctionnalités</a>
            <a href="#security" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Sécurité</a>
            <a href="#tips" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Conseils</a>
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

          {/* Advice/Conseils Section (ex-Pricing) */}
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

  const renderSidebar = () => (
    <aside className="hidden lg:flex flex-col w-72 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-white/5 fixed inset-y-0 z-30 transition-all">
      <div className="p-6 flex items-center gap-3">
        <div className="relative group">
            <div className="absolute inset-0 bg-cyan-500 blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            <Shield className="w-7 h-7 text-blue-600 dark:text-cyan-400 relative z-10" />
        </div>
        <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight font-sans">AIGuardian</span>
      </div>
      
      <div className="px-6 py-2">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl p-4 border border-slate-200 dark:border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all duration-500"></div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide font-mono">Secure Core</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono relative z-10">
              AES-256 • DLS Protocol
            </div>
          </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {[
          { id: ViewState.DASHBOARD, icon: Database, label: 'Mon Coffre-fort' },
          { id: ViewState.PROFILE, icon: BrainCircuit, label: 'Profil de Connaissances' },
          { id: ViewState.OSINT, icon: Eye, label: 'OSINT / Digital Footprint' },
          { id: ViewState.DLS, icon: Share2, label: 'Portabilité (DLS)' },
          { id: ViewState.SETTINGS, icon: Settings, label: 'Paramètres' },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setView(item.id)} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${view === item.id ? 'bg-cyan-50 dark:bg-cyan-900/10 text-cyan-700 dark:text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)] border border-cyan-100 dark:border-cyan-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${view === item.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} /> 
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-200/60 dark:border-white/5 mx-4 mb-4">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-sm font-medium transition-colors">
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>
    </aside>
  );

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SpotlightCard className="p-1 !bg-transparent !border-none !shadow-none overflow-visible">
          <div className="relative overflow-hidden bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-200/30 dark:border-cyan-500/20 rounded-2xl p-6 flex items-start gap-4 backdrop-blur-sm">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <Shield className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white font-mono">Architecture Zero-Knowledge</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-2xl">
                Toutes les opérations de chiffrement sont effectuées côté client. Votre clé privée ne quitte jamais votre appareil, garantissant une confidentialité mathématique.
            </p>
            </div>
          </div>
      </SpotlightCard>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 z-20 py-2">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="block w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none text-slate-900 dark:text-white shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 items-center w-full md:w-auto">
             <div className="flex items-center gap-2 mr-4">
                 <span className={`text-xs font-bold ${isAuditMode ? 'text-rose-500' : 'text-slate-500'}`}>SCAN AUDIT</span>
                 <button 
                  onClick={() => setIsAuditMode(!isAuditMode)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isAuditMode ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                 >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isAuditMode ? 'translate-x-5' : 'translate-x-0'}`}></span>
                 </button>
             </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide p-1 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5">
            {uniqueSources.map(source => (
                <button
                key={source}
                onClick={() => setSelectedSourceFilter(source)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${selectedSourceFilter === source ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md transform scale-105 border border-slate-100 dark:border-white/10' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                {source === 'ALL' ? 'Tout' : source}
                </button>
            ))}
            </div>
        </div>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-white/5">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-mono">Source</th>
              <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-mono">Contenu</th>
              <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-mono">{isAuditMode ? 'SCORE DE RISQUE' : 'TYPE'}</th>
              <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-mono">Date</th>
              <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-right font-mono">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filteredItems.map(item => (
              <tr key={item.id} className={`transition-colors group ${isAuditMode ? (item.riskLevel ? 'bg-rose-50/50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20' : 'opacity-40') : 'hover:bg-cyan-50/50 dark:hover:bg-white/5'}`}>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.source === 'ChatGPT' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 
                      item.source === 'Claude' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20' :
                      'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                  }`}>
                    {item.source}
                  </span>
                </td>
                <td className="px-6 py-4">
                    <p className="text-slate-900 dark:text-slate-200 font-medium truncate max-w-xs">{item.summary}</p>
                    <div className="flex gap-1 mt-1">
                        {item.tags.map(tag => <span key={tag} className="text-[10px] text-slate-400 font-mono">#{tag}</span>)}
                    </div>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm capitalize">
                    {isAuditMode && item.riskLevel ? (
                        <div className="flex items-center gap-2 text-rose-500 font-bold font-mono animate-pulse">
                            <AlertTriangle className="w-4 h-4" /> {item.riskLevel}
                        </div>
                    ) : item.type}
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-mono">{item.date}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAuditMode && item.riskLevel ? (
                        <button onClick={() => setSelectedRiskItem(item)} className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-all">CORRIGER</button>
                    ) : (
                        <>
                        <button onClick={() => handleSecureAction(() => downloadEncryptedItem(item))} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors" title="Télécharger"><Download className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteClick(item)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                        </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOsint = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SpotlightCard className="p-8 border-cyan-500/30">
        <div className="flex flex-col md:flex-row gap-8">
           <div className="flex-1 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-mono flex items-center gap-3">
                 <div className="p-2 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg animate-pulse">
                    <Scan className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                 </div>
                 DIGITAL FOOTPRINT ANALYZER
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Scannez votre empreinte numérique publique (OSINT). Identifiez les fuites de données, les profils sociaux exposés et les métadonnées accessibles publiquement.
              </p>
              
              <div className="flex gap-4">
                 <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Email, Username, ou Domaine..." 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none text-slate-900 dark:text-white font-mono"
                      value={osintSearchTerm}
                      onChange={(e) => setOsintSearchTerm(e.target.value)}
                    />
                 </div>
                 <button 
                  onClick={runOsintScan} 
                  disabled={isScanningOsint || !osintSearchTerm}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold font-mono flex items-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                    {isScanningOsint ? <Loader2 className="w-5 h-5 animate-spin" /> : <Globe className="w-5 h-5" />}
                    INITIATE_SCAN
                 </button>
              </div>
           </div>
           
           <div className="w-full md:w-1/3 bg-black rounded-xl p-4 font-mono text-xs text-green-500 h-48 overflow-y-auto border border-green-500/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-2 border-b border-green-500/20 pb-2 mb-2">
                 <Terminal className="w-4 h-4" /> SYSTEM_LOGS
              </div>
              {osintLogs.length === 0 && <span className="opacity-50 text-green-500/50">Waiting for target input...</span>}
              {osintLogs.map((log, i) => (
                 <div key={i} className="mb-1">{`> ${log}`}</div>
              ))}
              {isScanningOsint && <span className="animate-pulse">_</span>}
           </div>
        </div>
      </SpotlightCard>

      {osintResults && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8">
           {/* Exposure Score */}
           <SpotlightCard className="p-6 border-l-4 border-l-rose-500">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <AlertOctagon className="w-4 h-4" /> Exposition Globale
              </h3>
              <div className="flex items-center gap-4">
                 <div className="text-4xl font-black text-rose-500 tracking-tighter">CRITIQUE</div>
                 <div className="px-2 py-1 bg-rose-500/10 text-rose-500 text-xs font-bold rounded">SCORE: 9.2/10</div>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                 Votre identité numérique présente de multiples vulnérabilités critiques. Action immédiate requise.
              </p>
           </SpotlightCard>

           {/* Breaches */}
           <SpotlightCard className="p-6 lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Database className="w-4 h-4" /> Fuites de Données (Breaches)
              </h3>
              <div className="space-y-3">
                 {osintResults.breaches.map((breach: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/20 rounded-lg">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                          <div>
                             <div className="font-bold text-slate-900 dark:text-white">{breach.source}</div>
                             <div className="text-xs text-slate-500">Année: {breach.date}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-xs font-mono text-red-600 dark:text-red-400">{breach.data}</div>
                          <button className="text-xs underline text-slate-500 hover:text-slate-800 dark:hover:text-white mt-1">Changer mot de passe</button>
                       </div>
                    </div>
                 ))}
              </div>
           </SpotlightCard>

           {/* Socials */}
           <SpotlightCard className="p-6">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Users className="w-4 h-4" /> Traces Sociales
              </h3>
              <div className="space-y-3">
                 {osintResults.socials.map((social: any, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-white/5">
                       <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800 dark:text-white">{social.platform}</span>
                          <span className="text-xs font-mono text-slate-500">{social.username}</span>
                       </div>
                       <div className="text-xs text-orange-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {social.risk}
                       </div>
                    </div>
                 ))}
              </div>
           </SpotlightCard>

           {/* Technical Metadata */}
           <SpotlightCard className="p-6 lg:col-span-2">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Fingerprint className="w-4 h-4" /> Métadonnées Techniques
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-2"><MapPin className="w-3 h-3" /> Adresses IP Exposées</div>
                    {osintResults.metadata.ips.map((ip: string, i: number) => (
                       <div key={i} className="font-mono text-cyan-600 dark:text-cyan-400 text-sm">{ip}</div>
                    ))}
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5">
                    <div className="text-xs text-slate-400 mb-2 flex items-center gap-2"><Smartphone className="w-3 h-3" /> Appareils Détectés</div>
                    {osintResults.metadata.devices.map((dev: string, i: number) => (
                       <div key={i} className="font-mono text-slate-700 dark:text-slate-300 text-sm">{dev}</div>
                    ))}
                 </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/20 rounded-lg flex gap-3 text-xs text-blue-700 dark:text-blue-300">
                 <Info className="w-4 h-4 shrink-0" />
                 Note: Ce scan OSINT n'accède qu'aux données publiques. AIGuardian n'a pas hacké ces services, mais a agrégé les informations disponibles en source ouverte.
              </div>
           </SpotlightCard>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        {/* Analysis Card */}
        <SpotlightCard className="p-6">
          <div className="flex justify-between items-start mb-6">
             <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-cyan-50 dark:bg-cyan-500/20 rounded-xl shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    <BrainCircuit className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                 </div>
                 <h3 className="font-bold text-lg text-slate-900 dark:text-white">Analyse IA</h3>
             </div>
            <button onClick={() => setIsInfoOpen(!isInfoOpen)} className="text-slate-400 hover:text-cyan-500 transition-colors"><Info className="w-5 h-5" /></button>
          </div>
          
          {isInfoOpen && (
            <div className="mb-6 text-sm bg-slate-50 dark:bg-white/5 p-4 rounded-xl text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-white/5 leading-relaxed animate-in fade-in">
              L'analyse est effectuée par un modèle Gemini s'exécutant dans un environnement sandboxé. Vos données brutes ne sont pas conservées par le fournisseur.
            </div>
          )}

          {!aiAnalysis && !analyzing && (
            <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm max-w-xs mx-auto">Générez un profil cognitif complet basé sur vos données chiffrées.</p>
              <button onClick={runAnalysis} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02]">
                Lancer l'analyse sécurisée
              </button>
            </div>
          )}

          {analyzing && (
            <div className="space-y-6 py-6">
              <div className="flex justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-mono">
                <span>Traitement en cours</span>
                <span>{analysisStep === 1 ? '30%' : analysisStep === 2 ? '60%' : '90%'}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className={`h-1.5 rounded-full bg-cyan-500 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]`} style={{ width: analysisStep === 1 ? '30%' : analysisStep === 2 ? '60%' : '90%' }}></div>
              </div>
              <div className="flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                <span className="font-mono">{analysisStep === 1 ? "Indexation des sources chiffrées..." : analysisStep === 2 ? "Extraction des entités clés..." : "Finalisation du profil..."}</span>
              </div>
            </div>
          )}

          {aiAnalysis && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/10 p-5 rounded-2xl border border-cyan-100/50 dark:border-cyan-500/20 text-cyan-900 dark:text-cyan-100 text-sm leading-7 shadow-inner">
                {aiAnalysis}
              </div>
              <button onClick={() => handleSecureAction(downloadProfile)} className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">
                <Download className="w-4 h-4" /> Télécharger le Profil Complet
              </button>
            </div>
          )}
        </SpotlightCard>

        {/* Dimensions */}
        <SpotlightCard className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Dimensions</h3>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
               {['ALL', 'ChatGPT', 'Claude'].map(p => (
                 <button key={p} onClick={() => setSelectedDimensionProvider(p)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${selectedDimensionProvider === p ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{p}</button>
               ))}
            </div>
          </div>
          <div className="space-y-2">
            {PROFILE_DIMENSIONS_DATA.map((dim, index) => (
              <AnimatedProgressBar 
                key={dim.label} 
                dimension={{...dim, score: dim.scores[selectedDimensionProvider] || 0}} 
                delay={index * 150} 
              />
            ))}
          </div>
        </SpotlightCard>
      </div>

      <div className="space-y-6">
        {/* Distribution Chart */}
        <SpotlightCard className="p-6 flex flex-col min-h-[350px]">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Distribution</h3>
              {selectedChartFilter && (
                <button onClick={() => setSelectedChartFilter(null)} className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-md hover:bg-cyan-200 transition-colors">Réinitialiser filtre</button>
              )}
           </div>
           
           <div className="flex-1 w-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()} onClick={(data: any) => { if(data?.activePayload?.[0]) setSelectedChartFilter(data.activePayload[0].payload.type) }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                  <XAxis dataKey="name" stroke={isDarkMode ? "#94a3b8" : "#64748b"} tick={{fontSize: 12, fontFamily: 'monospace'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke={isDarkMode ? "#94a3b8" : "#64748b"} tick={{fontSize: 12, fontFamily: 'monospace'}} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    cursor={{fill: isDarkMode ? 'rgba(6, 182, 212, 0.05)' : 'rgba(0,0,0,0.05)'}} 
                    contentStyle={{
                        backgroundColor: isDarkMode ? 'rgba(2, 6, 23, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(8px)',
                        color: isDarkMode ? '#fff' : '#000'
                    }} 
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                     {getChartData().map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} opacity={selectedChartFilter && selectedChartFilter !== entry.type ? 0.3 : 1} cursor="pointer" />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </SpotlightCard>

        {/* Recommendations & Tags */}
        <SpotlightCard className="p-6">
           <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white">Recommandations</h3>
           <div className="flex flex-wrap gap-2 mb-8">
             {getFilteredTags().map(tag => (
               <span key={tag} className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 rounded-full text-xs font-mono font-medium hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-default">#{tag}</span>
             ))}
           </div>
           <div className="space-y-3">
             {getRecommendations().map((rec, i) => (
               <div key={i} className="flex gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5 hover:border-cyan-200 dark:hover:border-cyan-500/30 transition-colors group">
                 <div className="mt-0.5 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">{rec.icon}</div>
                 <div>
                   <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-500 transition-colors">{rec.title}</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{rec.text}</p>
                 </div>
               </div>
             ))}
           </div>
        </SpotlightCard>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SpotlightCard className="p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg"><Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
          Gestion des Sources
        </h2>
        <div className="space-y-4">
          {Object.entries(enabledSources).map(([source, enabled]) => (
            <div key={source} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5">
              <span className="font-medium text-slate-700 dark:text-slate-300">{source}</span>
              <button 
                onClick={() => setEnabledSources(prev => ({...prev, [source]: !prev[source]}))}
                className={`text-3xl transition-colors ${enabled ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-300 dark:text-slate-600'}`}
              >
                {enabled ? <ToggleRight /> : <ToggleLeft />}
              </button>
            </div>
          ))}
        </div>
      </SpotlightCard>

      <SpotlightCard className="p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg"><Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
          Sécurité Avancée
        </h2>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5">
          <div>
             <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Rotation des clés</h3>
             <p className="text-xs text-slate-500 mt-1">Ré-encryptez toutes vos données avec une nouvelle clé AES.</p>
          </div>
          <button onClick={() => handleSecureAction(rotateKeys)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm">
            <RefreshCw className="w-4 h-4" /> Rotation
          </button>
        </div>
      </SpotlightCard>

      <SpotlightCard className="p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
          <div className="p-2 bg-fuchsia-100 dark:bg-fuchsia-500/20 rounded-lg"><History className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" /></div>
          Historique d'Analyse
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/5">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 dark:bg-white/5">
               <tr>
                 <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 font-mono">Date</th>
                 <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 font-mono">Score</th>
                 <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 font-mono">Résumé</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-white/5">
               {MOCK_HISTORY.map(h => (
                 <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                   <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono text-xs">{h.date}</td>
                   <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-md font-bold text-xs">{h.score}%</span>
                   </td>
                   <td className="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs">{h.summary}</td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </SpotlightCard>
    </div>
  );

  const renderStaticPage = (title: string, content: React.ReactNode) => (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <button onClick={() => setView(ViewState.DASHBOARD)} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group">
        <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 transition-colors">
            <ChevronUp className="w-4 h-4 rotate-[-90deg] group-hover:-translate-x-0.5 transition-transform" />
        </div>
        <span className="text-sm font-medium">Retour au tableau de bord</span>
      </button>
      <SpotlightCard className="p-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-white/5 pb-6">{title}</h1>
        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-8">
          {content}
        </div>
      </SpotlightCard>
    </div>
  );

  if (view === ViewState.LANDING) return renderLanding();

  const mainContent = () => {
    switch(view) {
      case ViewState.PROFILE: return renderProfile();
      case ViewState.OSINT: return renderOsint();
      case ViewState.DLS: return (
        <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in zoom-in duration-500">
            <SpotlightCard className="p-12 text-center max-w-md mx-auto shadow-[0_0_50px_rgba(6,182,212,0.15)] border-cyan-500/30">
                <div className="w-24 h-24 bg-cyan-50 dark:bg-cyan-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Share2 className="w-12 h-12 text-cyan-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-mono">DLS PORTABILITY</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    Générez une clé DLS unique pour transférer votre profil de connaissances chiffré vers un autre agent ou système compatible.
                </p>
                <button onClick={() => setShowDlsModal(true)} className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all tracking-wide">
                    INITIALISER PROTOCOLE DLS
                </button>
            </SpotlightCard>
        </div>
      );
      case ViewState.SETTINGS: return renderSettings();
      case ViewState.PRIVACY: return renderStaticPage("Politique de Confidentialité", (
        <div className="space-y-6">
          <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-8">1. Collecte de données</h3>
          <p>AIGuardian applique un principe de minimisation stricte. Nous ne collectons aucune donnée personnelle sur nos serveurs. Vos conversations importées restent stockées exclusivement dans le `localStorage` de votre navigateur ou dans une base de données IndexedDB locale chiffrée.</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-8">2. Usage des données</h3>
          <p>Les données ne sont traitées que pour générer votre profil de connaissances. Aucune donnée n'est partagée avec des tiers, ni utilisée pour entraîner des modèles d'IA.</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-8">3. Vos droits</h3>
          <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et d'effacement. Puisque nous n'hébergeons pas vos données, la suppression de votre cache navigateur ou l'utilisation du bouton "Supprimer" dans l'application suffit à exercer votre droit à l'oubli.</p>
        </div>
      ));
      case ViewState.LEGAL: return renderStaticPage("Mentions Légales", (
        <div className="space-y-6">
          <p><strong>Éditeur :</strong> AIGuardian SAS</p>
          <p><strong>Siège social :</strong> 123 Avenue de la Data, 75000 Paris, France</p>
          <p><strong>Contact :</strong> legal@aiguardian.io</p>
          <p><strong>Hébergeur :</strong> Vercel Inc.</p>
        </div>
      ));
      case ViewState.TERMS: return renderStaticPage("Conditions Générales d'Utilisation", (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-8">Responsabilité de la clé</h3>
          <p>L'utilisateur est seul responsable de la conservation de sa clé DLS et de ses clés d'exportation. AIGuardian ne disposant pas de double des clés, toute perte est définitive.</p>
        </div>
      ));
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-500 font-sans selection:bg-cyan-500/30">
      <BackgroundBeams />
      
      {renderSidebar()}
      
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 p-4 z-40 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-600" />
            <span className="font-bold text-slate-900 dark:text-white">AIGuardian</span>
         </div>
         <button onClick={() => setIsMenuOpen(true)} className="text-slate-900 dark:text-white"><Menu /></button>
      </div>

      <div className="lg:ml-72 flex-1 flex flex-col min-w-0 pt-16 lg:pt-0 relative z-10">
        {(view !== ViewState.PRIVACY && view !== ViewState.LEGAL && view !== ViewState.TERMS) && (
          <header className="sticky top-0 z-30 hidden lg:block bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 transition-all">
            <div className="px-8 py-5 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
                {view === ViewState.DASHBOARD ? '// MON_COFFRE_FORT' : 
                 view === ViewState.PROFILE ? '// PROFIL_COGNITIF' : 
                 view === ViewState.SETTINGS ? '// PARAMETRES_SYSTEME' : 
                 view === ViewState.OSINT ? '// OSINT_SCANNER' : '// PROTOCOLE_DLS'}
              </h1>
              <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-white dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/5">
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button onClick={() => setShowImport(true)} className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:shadow-xl hover:-translate-y-0.5">
                  <Plus className="w-4 h-4" /> IMPORTER
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border-2 border-white dark:border-slate-800 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
              </div>
            </div>
          </header>
        )}

        <main className="p-6 md:p-10 overflow-y-auto flex-1">
          {mainContent()}
        </main>

        {(view === ViewState.DASHBOARD || view === ViewState.PROFILE || view === ViewState.SETTINGS || view === ViewState.DLS || view === ViewState.OSINT) && (
           <footer className="p-8 border-t border-slate-200/60 dark:border-white/5 text-center text-xs text-slate-400">
             <div className="flex justify-center gap-6 mb-4">
                <button onClick={() => setView(ViewState.PRIVACY)} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Confidentialité</button>
                <button onClick={() => setView(ViewState.LEGAL)} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">Mentions</button>
                <button onClick={() => setView(ViewState.TERMS)} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">CGU</button>
             </div>
             <p className="opacity-60 font-mono">AIGuardian v2.0.4 • DLS Protocol Enabled • AES-256-GCM</p>
           </footer>
        )}
      </div>

      {showDlsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <SpotlightCard className="max-w-md w-full p-6 !bg-white/90 dark:!bg-slate-950/90 border-cyan-500/30">
            <button onClick={() => setShowDlsModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-mono">GÉNÉRATION CLÉ DLS</h3>
            {!generatedDls ? (
               <div className="text-center space-y-6">
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl text-sm text-cyan-800 dark:text-cyan-200 border border-cyan-100 dark:border-cyan-500/30">
                    Cette clé cryptographique permet le transfert sécurisé de votre profil vers un autre système compatible DLS.
                  </div>
                  <button onClick={() => handleSecureAction(generateDls)} className="w-full py-4 bg-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all font-mono">GÉNÉRER CLÉ UNIQUE</button>
               </div>
            ) : (
               <div className="text-center space-y-6 animate-in zoom-in-95">
                  <div className="relative p-6 bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-cyan-500/30 font-mono text-xl md:text-2xl font-bold tracking-widest break-all text-slate-800 dark:text-cyan-400 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]">
                    {generatedDls}
                    <button 
                      onClick={() => copyToClipboard(generatedDls)}
                      className="absolute top-2 right-2 p-2 hover:text-cyan-200 transition-colors"
                      title="Copier"
                    >
                       <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Ne partagez ce code qu'avec le destinataire de confiance.
                  </p>
               </div>
            )}
          </SpotlightCard>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <SpotlightCard className="max-w-sm w-full p-6 !bg-white dark:!bg-slate-900 border-red-100 dark:border-red-900/30">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Supprimer définitivement ?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Cette action est irréversible. L'élément sera effacé de votre stockage local (localStorage).
              </p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                  Annuler
                </button>
                <button onClick={confirmDelete} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-500/20 transition-all">
                  Supprimer
                </button>
              </div>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* Remediation Modal (Audit Mode) */}
      {selectedRiskItem && selectedRiskItem.riskLevel && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
           <SpotlightCard className="max-w-lg w-full p-0 !bg-white dark:!bg-slate-900 border-rose-500/30 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-rose-50 dark:bg-rose-900/10 flex justify-between items-center">
                 <h3 className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5" /> PROTOCOLE DE NETTOYAGE
                 </h3>
                 <button onClick={() => setSelectedRiskItem(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                 <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Donnée Sensible Détectée</label>
                    <div className="mt-2 p-3 bg-slate-100 dark:bg-black/40 rounded-lg font-mono text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                       {selectedRiskItem.risks?.[0].description}
                       <div className="mt-1 text-rose-500 dark:text-rose-400 opacity-80 blur-[2px] hover:blur-none transition-all cursor-help select-none">
                          {selectedRiskItem.risks?.[0].snippet}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Actions Recommandées</label>
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all group">
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-200">1. Anonymiser localement (Scrubbing)</span>
                       <Ghost className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all group">
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-200">2. Supprimer à la source ({selectedRiskItem.source})</span>
                       <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" />
                    </button>
                 </div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
                 <button onClick={() => setSelectedRiskItem(null)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm">Ignorer</button>
                 <button onClick={() => { 
                    alert("Donnée anonymisée avec succès."); 
                    setSelectedRiskItem(null); 
                 }} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-rose-500/20">
                    Exécuter
                 </button>
              </div>
           </SpotlightCard>
        </div>
      )}

      {showImport && <ImportWizard onComplete={handleImportComplete} onCancel={() => setShowImport(false)} />}
      <TwoFactorModal isOpen={is2FAOpen} onClose={() => setIs2FAOpen(false)} onSuccess={on2FASuccess} />
      
      <CookieBanner />
    </div>
  );
};

export default App;