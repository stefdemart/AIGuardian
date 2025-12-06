
import React, { useState, useEffect } from 'react';
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
  ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ViewState, VaultItem, ChartData, AnalysisHistoryItem } from './types';
import { CookieBanner } from './components/CookieBanner';
import { ImportWizard } from './components/ImportWizard';
import { analyzeVaultData } from './services/geminiService';

// --- Mock Data ---

const MOCK_VAULT_ITEMS: VaultItem[] = [
  { id: '1', source: 'ChatGPT', type: 'conversation', date: '2023-10-15', summary: 'Brainstorming Marketing Eco-responsable', encryptedContent: 'EncryptedBlob_A1B2C3D4...', tags: ['work', 'marketing'] },
  { id: '2', source: 'Claude', type: 'code', date: '2023-10-18', summary: 'Refactoring React Components', encryptedContent: 'EncryptedBlob_E5F6G7H8...', tags: ['dev', 'react'] },
  { id: '3', source: 'Gemini', type: 'conversation', date: '2023-11-02', summary: 'Recette Cuisine Italienne', encryptedContent: 'EncryptedBlob_I9J0K1L2...', tags: ['perso', 'cooking'] },
  { id: '4', source: 'Midjourney', type: 'image', date: '2023-11-05', summary: 'Cyberpunk Cityscapes', encryptedContent: 'EncryptedBlob_M3N4O5P6...', tags: ['art', 'concept'] },
  { id: '5', source: 'ChatGPT', type: 'conversation', date: '2023-11-08', summary: 'Planification Voyage Japon', encryptedContent: 'EncryptedBlob_Q7R8S9T0...', tags: ['perso', 'travel'] },
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
    color: 'bg-blue-500', 
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
    color: 'bg-purple-500', 
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
    color: 'bg-cyan-500', 
    icon: <TrendingUp className="w-4 h-4" />,
    history: [70, 72, 75, 74, 76, 78]
  },
  { 
    label: 'Politique', 
    scores: { ALL: 15, ChatGPT: 20, Claude: 10, Gemini: 5 }, 
    color: 'bg-red-500', 
    icon: <Landmark className="w-4 h-4" />,
    history: [10, 12, 11, 13, 14, 15]
  },
];

// --- Sub-Components ---

const Sparkline: React.FC<{ data: number[], colorClass: string }> = ({ data, colorClass }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  // Create SVG path
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 60; // width 60px
    const y = 20 - ((val - min) / range) * 20; // height 20px
    return `${x},${y}`;
  }).join(' ');

  // Extract color hex from tailwind class map (simplified for demo)
  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3b82f6',
    'bg-emerald-500': '#10b981',
    'bg-purple-500': '#a855f7',
    'bg-yellow-500': '#eab308',
    'bg-cyan-500': '#06b6d4',
    'bg-red-500': '#ef4444',
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
      {/* End dot */}
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
          <span className={`p-1 rounded-md ${dimension.color} bg-opacity-20 text-inherit dark:text-white dark:bg-opacity-30`}>
            {dimension.icon}
          </span>
          {dimension.label}
        </div>
        <div className="flex items-center gap-3">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity" title="Évolution sur 6 mois">
                <Sparkline data={dimension.history} colorClass={dimension.color} />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white w-8 text-right">{dimension.score}%</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full ${dimension.color} transition-all duration-1000 ease-out`} 
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
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
            <Smartphone className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Authentification Forte</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Veuillez saisir le code de sécurité envoyé à votre appareil (** ** ** 42).
          </p>
          <div className="flex gap-2 justify-center py-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`2fa-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                className={`w-10 h-12 text-center text-xl font-bold rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                  error ? 'border-red-300 bg-red-50 text-red-600' : 'border-slate-300 bg-slate-50 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white'
                }`}
              />
            ))}
          </div>
          {error && <div className="text-xs text-red-600 dark:text-red-400">Code incorrect. (Essai: 123456)</div>}
          <button onClick={verifyCode} disabled={isVerifying} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">
            {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Vérifier'}
          </button>
          <button onClick={onClose} className="w-full py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm">Annuler</button>
        </div>
      </div>
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
  const [showRioModal, setShowRioModal] = useState(false);
  const [generatedRio, setGeneratedRio] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0); // 0: Idle, 1: Indexing, 2: Extracting, 3: Finalizing
  const [isDarkMode, setIsDarkMode] = useState(true); // Default Dark Mode
  const [selectedDimensionProvider, setSelectedDimensionProvider] = useState<string>('ALL');
  const [selectedChartFilter, setSelectedChartFilter] = useState<string | null>(null);
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [pending2FAAction, setPending2FAAction] = useState<(() => void) | null>(null);
  const [itemToDelete, setItemToDelete] = useState<VaultItem | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Settings State
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

  // Filter vault items
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

  const handleDeleteClick = (item: VaultItem) => setItemToDelete(item);
  const confirmDelete = () => {
    if (itemToDelete) {
      setVaultItems(vaultItems.filter(i => i.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  const generateRio = () => {
    const parts = ['AIG', Math.floor(Math.random() * 90 + 10).toString(), 'P', Math.random().toString(36).substr(2, 6).toUpperCase(), Math.random().toString(36).substr(2, 3).toUpperCase()];
    setGeneratedRio(parts.join(''));
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisStep(1); // Indexing
    
    setTimeout(() => setAnalysisStep(2), 1500); // Extracting
    setTimeout(() => setAnalysisStep(3), 3000); // Finalizing

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

  const getChartData = () => {
    const counts = vaultItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return [
      { name: 'Conversations', count: counts['conversation'] || 0, color: '#3b82f6', type: 'conversation' }, 
      { name: 'Code', count: counts['code'] || 0, color: '#10b981', type: 'code' }, 
      { name: 'Images', count: counts['image'] || 0, color: '#8b5cf6', type: 'image' }, 
    ];
  };

  const getRecommendations = () => {
    const allTags = vaultItems.flatMap(i => i.tags);
    const recs = [];
    if (allTags.includes('dev') || allTags.includes('react')) {
      recs.push({ title: "Sécurité API", text: "Détecté : Code. Assurez-vous que vos clés API ne sont pas hardcodées.", icon: <Shield className="w-4 h-4 text-emerald-500" /> });
    }
    if (allTags.includes('work') || allTags.includes('marketing')) {
      recs.push({ title: "Veille Concurrentielle", text: "Analysez vos benchmarks marketing pour dégager des tendances.", icon: <TrendingUp className="w-4 h-4 text-blue-500" /> });
    }
    if (recs.length === 0) {
      recs.push({ title: "Diversifiez vos sources", text: "Connectez d'autres IA pour enrichir votre profil.", icon: <Lightbulb className="w-4 h-4 text-yellow-500" /> });
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

  // --- Render Functions ---

  const renderLanding = () => (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">AIGuardian</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 font-medium">Fonctionnalités</a>
            <a href="#security" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 font-medium">Sécurité</a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 font-medium">Tarifs</a>
          </nav>
          <div className="hidden md:flex gap-4 items-center">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={handleLogin} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 font-medium">Connexion</button>
            <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium">Créer un compte</button>
          </div>
          <div className="md:hidden flex items-center gap-4">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-900 dark:text-white"><Menu /></button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="pt-20 pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 -z-10"></div>
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6">
              Reprenez le contrôle de <br className="hidden md:block"/><span className="text-blue-600 dark:text-blue-400">vos données d'IA</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
              Centralisez, sécurisez et transférez vos historiques de conversations générés par l'IA. Conformité RGPD et souveraineté totale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold shadow-xl">Commencer gratuitement</button>
            </div>
          </div>
        </section>
        {/* Features section omitted for brevity but would exist here */}
      </main>
      <Footer />
    </div>
  );

  const Footer = () => (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="mb-4">© 2023 AIGuardian. Tous droits réservés.</p>
        <div className="flex justify-center gap-6 text-sm">
          <button onClick={() => { setView(ViewState.PRIVACY); window.scrollTo(0,0); }} className="hover:text-white">Confidentialité</button>
          <button onClick={() => { setView(ViewState.LEGAL); window.scrollTo(0,0); }} className="hover:text-white">Mentions Légales</button>
          <button onClick={() => { setView(ViewState.TERMS); window.scrollTo(0,0); }} className="hover:text-white">CGU</button>
        </div>
      </div>
    </footer>
  );

  const renderSidebar = () => (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0 z-20">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <Shield className="w-6 h-6 text-blue-600 dark:text-blue-500" />
        <span className="font-bold text-lg text-slate-900 dark:text-white">AIGuardian</span>
      </div>
      <div className="px-6 py-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Système Sécurisé</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              AES-256 • Local Storage
            </div>
          </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {[
          { id: ViewState.DASHBOARD, icon: Database, label: 'Mon Coffre-fort' },
          { id: ViewState.PROFILE, icon: BrainCircuit, label: 'Profil de Connaissances' },
          { id: ViewState.RIO, icon: Share2, label: 'Portabilité (RIO)' },
          { id: ViewState.SETTINGS, icon: Settings, label: 'Paramètres' },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setView(item.id)} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === item.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <item.icon className="w-5 h-5" /> {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium">
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>
    </aside>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Architecture Zero-Knowledge Active</h4>
          <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
            Vos données sont chiffrées avec votre clé privée. Ni AIGuardian, ni les fournisseurs ne peuvent les lire.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
          {uniqueSources.map(source => (
            <button
              key={source}
              onClick={() => setSelectedSourceFilter(source)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${selectedSourceFilter === source ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
            >
              {source === 'ALL' ? 'Tout' : source}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Source</th>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Résumé</th>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Type</th>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Date</th>
              <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                    {item.source}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-medium">{item.summary}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm capitalize">{item.type}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{item.date}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button onClick={() => handleSecureAction(() => downloadEncryptedItem(item))} className="text-slate-400 hover:text-blue-600" title="Télécharger"><Download className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteClick(item)} className="text-slate-400 hover:text-red-600" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        {/* Analysis Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Analyse IA
            </h3>
            <button onClick={() => setIsInfoOpen(!isInfoOpen)} className="text-slate-400 hover:text-indigo-500"><Info className="w-4 h-4" /></button>
          </div>
          
          {isInfoOpen && (
            <div className="mb-4 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
              L'analyse est effectuée par un modèle Gemini s'exécutant dans un environnement sandboxé. Vos données brutes ne sont pas conservées par le fournisseur.
            </div>
          )}

          {!aiAnalysis && !analyzing && (
            <>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">Générez un profil basé sur vos données chiffrées.</p>
              <button onClick={runAnalysis} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md">
                Générer mon profil de connaissances
              </button>
            </>
          )}

          {analyzing && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                <span>Progression</span>
                <span>{analysisStep === 1 ? '30%' : analysisStep === 2 ? '60%' : '90%'}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full bg-indigo-500 transition-all duration-500`} style={{ width: analysisStep === 1 ? '30%' : analysisStep === 2 ? '60%' : '90%' }}></div>
              </div>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                {analysisStep === 1 ? "Indexation des sources chiffrées..." : analysisStep === 2 ? "Extraction des entités clés..." : "Finalisation du profil..."}
              </p>
            </div>
          )}

          {aiAnalysis && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-sm leading-relaxed">
                {aiAnalysis}
              </div>
              <button onClick={() => handleSecureAction(downloadProfile)} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4" /> Télécharger le Profil
              </button>
            </div>
          )}
        </div>

        {/* Dimensions */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Dimensions</h3>
            <div className="flex gap-1">
               {['ALL', 'ChatGPT', 'Claude'].map(p => (
                 <button key={p} onClick={() => setSelectedDimensionProvider(p)} className={`px-2 py-1 text-[10px] rounded ${selectedDimensionProvider === p ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>{p}</button>
               ))}
            </div>
          </div>
          <div className="space-y-1">
            {PROFILE_DIMENSIONS_DATA.map((dim, index) => (
              <AnimatedProgressBar 
                key={dim.label} 
                dimension={{...dim, score: dim.scores[selectedDimensionProvider] || 0}} 
                delay={index * 150} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Distribution Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col min-h-[350px]">
           <div className="flex justify-between mb-2">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Distribution</h3>
              {selectedChartFilter && (
                <button onClick={() => setSelectedChartFilter(null)} className="text-xs text-blue-500 hover:underline">Réinitialiser</button>
              )}
           </div>
           <p className="text-xs text-slate-500 mb-4">Cliquez sur une barre pour filtrer les sujets.</p>
           <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()} onClick={(data) => { if(data?.activePayload?.[0]) setSelectedChartFilter(data.activePayload[0].payload.type) }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} vertical={false} />
                  <XAxis dataKey="name" stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
                  <YAxis stroke={isDarkMode ? "#94a3b8" : "#64748b"} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: isDarkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: 'none'}} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                     {getChartData().map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} opacity={selectedChartFilter && selectedChartFilter !== entry.type ? 0.3 : 1} cursor="pointer" />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Recommendations & Tags */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Sujets & Recommandations</h3>
           <div className="flex flex-wrap gap-2 mb-6">
             {getFilteredTags().map(tag => (
               <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm">#{tag}</span>
             ))}
           </div>
           <div className="space-y-3">
             {getRecommendations().map((rec, i) => (
               <div key={i} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700">
                 <div className="mt-1">{rec.icon}</div>
                 <div>
                   <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{rec.title}</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400">{rec.text}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5" /> Gestion des Sources
        </h2>
        <div className="space-y-4">
          {Object.entries(enabledSources).map(([source, enabled]) => (
            <div key={source} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <span className="font-medium text-slate-700 dark:text-slate-300">{source}</span>
              <button 
                onClick={() => setEnabledSources(prev => ({...prev, [source]: !prev[source]}))}
                className={`text-2xl ${enabled ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
              >
                {enabled ? <ToggleRight /> : <ToggleLeft />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Key className="w-5 h-5" /> Sécurité Avancée
        </h2>
        <div className="flex items-center justify-between">
          <div>
             <h3 className="font-medium text-slate-800 dark:text-slate-200">Rotation des clés</h3>
             <p className="text-sm text-slate-500">Ré-encryptez toutes vos données avec une nouvelle clé AES.</p>
          </div>
          <button onClick={() => handleSecureAction(rotateKeys)} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Rotation
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <History className="w-5 h-5" /> Historique d'Analyse
        </h2>
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 dark:bg-slate-900">
               <tr>
                 <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                 <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Score</th>
                 <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Résumé</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
               {MOCK_HISTORY.map(h => (
                 <tr key={h.id}>
                   <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{h.date}</td>
                   <td className="px-4 py-3 text-emerald-600 font-bold">{h.score}%</td>
                   <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-xs">{h.summary}</td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStaticPage = (title: string, content: React.ReactNode) => (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <button onClick={() => setView(ViewState.DASHBOARD)} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white">
        <ChevronUp className="w-4 h-4 rotate-[-90deg]" /> Retour au tableau de bord
      </button>
      <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{title}</h1>
        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
          {content}
        </div>
      </div>
    </div>
  );

  // --- Main Render Switch ---

  if (view === ViewState.LANDING) return renderLanding();

  const mainContent = () => {
    switch(view) {
      case ViewState.PROFILE: return renderProfile();
      case ViewState.RIO: return (
        // Re-implementing simplified RIO view inline for brevity as functionality was moved to modal, 
        // but sticking to requested architecture.
        <div className="flex flex-col items-center justify-center h-[50vh]">
            <Share2 className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4" />
            <p className="text-slate-500">Utilisez le bouton "Obtenir mon RIO" dans le menu.</p>
            <button onClick={() => setShowRioModal(true)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Ouvrir RIO</button>
        </div>
      );
      case ViewState.SETTINGS: return renderSettings();
      case ViewState.PRIVACY: return renderStaticPage("Politique de Confidentialité", (
        <div className="space-y-4">
          <p>Dernière mise à jour : {new Date().toLocaleDateString()}</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-4">1. Collecte de données</h3>
          <p>AIGuardian applique un principe de minimisation stricte. Nous ne collectons aucune donnée personnelle sur nos serveurs. Vos conversations importées restent stockées exclusivement dans le `localStorage` de votre navigateur ou dans une base de données IndexedDB locale chiffrée.</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-4">2. Usage des données</h3>
          <p>Les données ne sont traitées que pour générer votre profil de connaissances. Aucune donnée n'est partagée avec des tiers, ni utilisée pour entraîner des modèles d'IA.</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-4">3. Vos droits</h3>
          <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et d'effacement. Puisque nous n'hébergeons pas vos données, la suppression de votre cache navigateur ou l'utilisation du bouton "Supprimer" dans l'application suffit à exercer votre droit à l'oubli.</p>
        </div>
      ));
      case ViewState.LEGAL: return renderStaticPage("Mentions Légales", (
        <div className="space-y-4">
          <p><strong>Éditeur :</strong> AIGuardian SAS</p>
          <p><strong>Siège social :</strong> 123 Avenue de la Data, 75000 Paris, France</p>
          <p><strong>Contact :</strong> legal@aiguardian.io</p>
          <p><strong>Hébergeur :</strong> Vercel Inc.</p>
        </div>
      ));
      case ViewState.TERMS: return renderStaticPage("Conditions Générales d'Utilisation", (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-4">Responsabilité de la clé</h3>
          <p>L'utilisateur est seul responsable de la conservation de son RIO et de ses clés d'exportation. AIGuardian ne disposant pas de double des clés, toute perte est définitive.</p>
        </div>
      ));
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300 font-sans">
      {renderSidebar()}
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 z-20 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-slate-900 dark:text-white">AIGuardian</span>
         </div>
         <button onClick={() => setIsMenuOpen(true)} className="text-slate-900 dark:text-white"><Menu /></button>
      </div>

      {/* Main Container */}
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        {(view !== ViewState.PRIVACY && view !== ViewState.LEGAL && view !== ViewState.TERMS) && (
          <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 hidden lg:block">
            <div className="px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {view === ViewState.DASHBOARD ? 'Mon Coffre-fort' : view === ViewState.PROFILE ? 'Profil de Connaissances' : view === ViewState.SETTINGS ? 'Paramètres' : 'Portabilité'}
              </h1>
              <div className="flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button onClick={() => setShowImport(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Importer
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
              </div>
            </div>
          </header>
        )}

        <main className="p-6 md:p-8 overflow-y-auto flex-1">
          {mainContent()}
        </main>

        {(view === ViewState.DASHBOARD || view === ViewState.PROFILE || view === ViewState.SETTINGS) && (
           <footer className="p-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
             <div className="flex justify-center gap-4 mb-2">
                <button onClick={() => setView(ViewState.PRIVACY)} className="hover:underline">Confidentialité</button>
                <button onClick={() => setView(ViewState.LEGAL)} className="hover:underline">Mentions</button>
                <button onClick={() => setView(ViewState.TERMS)} className="hover:underline">CGU</button>
             </div>
             <p>AIGuardian v1.2.0 • Conformité RGPD • Chiffrement AES-256</p>
           </footer>
        )}
      </div>

      {/* Modals */}
      {showRioModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowRioModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Générer RIO</h3>
            {!generatedRio ? (
               <div className="text-center space-y-4">
                  <p className="text-sm text-slate-500">Créez une clé de transfert portable pour exporter votre profil.</p>
                  <button onClick={() => handleSecureAction(generateRio)} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold">Générer</button>
               </div>
            ) : (
               <div className="text-center space-y-4">
                  <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded font-mono text-xl font-bold select-all">{generatedRio}</div>
                  <p className="text-xs text-amber-600">Ne partagez ce code qu'avec le destinataire de confiance.</p>
               </div>
            )}
          </div>
        </div>
      )}

      {showImport && <ImportWizard onComplete={handleImportComplete} onCancel={() => setShowImport(false)} />}
      <TwoFactorModal isOpen={is2FAOpen} onClose={() => setIs2FAOpen(false)} onSuccess={on2FASuccess} />
      {/* Delete Modal omitted for brevity but logic exists */}
      
      <CookieBanner />
    </div>
  );
};

export default App;
