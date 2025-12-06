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
  AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ViewState, VaultItem, ChartData } from './types';
import { CookieBanner } from './components/CookieBanner';
import { ImportWizard } from './components/ImportWizard';
import { analyzeVaultData } from './services/geminiService';

// Mock Data
const MOCK_VAULT_ITEMS: VaultItem[] = [
  { id: '1', source: 'ChatGPT', type: 'conversation', date: '2023-10-15', summary: 'Brainstorming Marketing Eco-responsable', encryptedContent: 'EncryptedBlob_A1B2C3D4...', tags: ['work', 'marketing'] },
  { id: '2', source: 'Claude', type: 'code', date: '2023-10-18', summary: 'Refactoring React Components', encryptedContent: 'EncryptedBlob_E5F6G7H8...', tags: ['dev', 'react'] },
  { id: '3', source: 'Gemini', type: 'conversation', date: '2023-11-02', summary: 'Recette Cuisine Italienne', encryptedContent: 'EncryptedBlob_I9J0K1L2...', tags: ['perso', 'cooking'] },
  { id: '4', source: 'Midjourney', type: 'image', date: '2023-11-05', summary: 'Cyberpunk Cityscapes', encryptedContent: 'EncryptedBlob_M3N4O5P6...', tags: ['art', 'concept'] },
  { id: '5', source: 'ChatGPT', type: 'conversation', date: '2023-11-08', summary: 'Planification Voyage Japon', encryptedContent: 'EncryptedBlob_Q7R8S9T0...', tags: ['perso', 'travel'] },
  { id: '6', source: 'Github Copilot', type: 'code', date: '2023-11-10', summary: 'Python Script Automation', encryptedContent: 'EncryptedBlob_U1V2W3X4...', tags: ['dev', 'python'] },
];

const MOCK_CHART_DATA: ChartData[] = [
  { subject: 'Code', A: 120, fullMark: 150 },
  { subject: 'Créativité', A: 98, fullMark: 150 },
  { subject: 'Productivité', A: 86, fullMark: 150 },
  { subject: 'Recherche', A: 99, fullMark: 150 },
  { subject: 'Linguistique', A: 85, fullMark: 150 },
  { subject: 'Technique', A: 65, fullMark: 150 },
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
}

const PROFILE_DIMENSIONS_DATA: ProfileDimensionData[] = [
  { 
    label: 'Professionnel', 
    scores: { ALL: 85, ChatGPT: 60, Claude: 90, Gemini: 40 }, 
    color: 'bg-blue-500', 
    icon: <Briefcase className="w-4 h-4" /> 
  },
  { 
    label: 'Personnel', 
    scores: { ALL: 62, ChatGPT: 70, Claude: 30, Gemini: 65 }, 
    color: 'bg-emerald-500', 
    icon: <Heart className="w-4 h-4" /> 
  },
  { 
    label: 'Psychologique', 
    scores: { ALL: 45, ChatGPT: 55, Claude: 40, Gemini: 20 }, 
    color: 'bg-purple-500', 
    icon: <Activity className="w-4 h-4" /> 
  },
  { 
    label: 'Sociologique', 
    scores: { ALL: 30, ChatGPT: 35, Claude: 25, Gemini: 10 }, 
    color: 'bg-yellow-500', 
    icon: <Users className="w-4 h-4" /> 
  },
  { 
    label: 'Économique', 
    scores: { ALL: 78, ChatGPT: 50, Claude: 60, Gemini: 85 }, 
    color: 'bg-cyan-500', 
    icon: <TrendingUp className="w-4 h-4" /> 
  },
  { 
    label: 'Politique', 
    scores: { ALL: 15, ChatGPT: 20, Claude: 10, Gemini: 5 }, 
    color: 'bg-red-500', 
    icon: <Landmark className="w-4 h-4" /> 
  },
];

interface DisplayDimension {
  label: string;
  score: number;
  color: string;
  icon: React.ReactNode;
}

const AnimatedProgressBar: React.FC<{ dimension: DisplayDimension, delay: number }> = ({ dimension, delay }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Reset width to 0 briefly when dimension.score changes to re-trigger animation feel, 
    // or just let CSS transition handle the slide.
    // CSS transition is smoother for value updates.
    const timer = setTimeout(() => {
      setWidth(dimension.score);
    }, delay); // Initial delay
    
    // Immediate update for prop changes after mount (handled by CSS transition mostly)
    setWidth(dimension.score);

    return () => clearTimeout(timer);
  }, [dimension.score, delay]);

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <span className={`p-1 rounded-md ${dimension.color} bg-opacity-20 text-inherit dark:text-white dark:bg-opacity-30`}>
            {dimension.icon}
          </span>
          {dimension.label}
        </div>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{dimension.score}%</span>
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

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`2fa-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      const prevInput = document.getElementById(`2fa-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyCode = () => {
    setIsVerifying(true);
    setError(false);
    
    // Simulate API verification
    setTimeout(() => {
      const enteredCode = code.join('');
      // Mock correct code is 123456
      if (enteredCode === '123456') {
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
            Pour sécuriser cette action, veuillez saisir le code envoyé à votre appareil de confiance (** ** ** 42).
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
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-10 h-12 text-center text-xl font-bold rounded-lg border focus:ring-2 focus:outline-none transition-all ${
                  error 
                    ? 'border-red-300 bg-red-50 text-red-600 focus:ring-red-500 dark:bg-red-900/20 dark:border-red-800' 
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white'
                }`}
              />
            ))}
          </div>

          {error && (
             <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full">
               <AlertCircle className="w-3 h-3" /> Code incorrect. Essayez 123456.
             </div>
          )}

          <div className="w-full space-y-3 pt-2">
            <button 
              onClick={verifyCode}
              disabled={isVerifying || code.some(c => c === '')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Vérifier'}
            </button>
            <button 
              onClick={onClose}
              className="w-full py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
          
          <p className="text-xs text-slate-400 dark:text-slate-500 pt-2">
            Code non reçu ? <button className="text-blue-600 dark:text-blue-400 hover:underline">Renvoyer</button>
          </p>
        </div>
      </div>
    </div>
  );
};

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedDimensionProvider, setSelectedDimensionProvider] = useState<string>('ALL');
  
  // 2FA States
  const [is2FAOpen, setIs2FAOpen] = useState(false);
  const [pending2FAAction, setPending2FAAction] = useState<(() => void) | null>(null);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<VaultItem | null>(null);

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

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

  // Get unique sources for filter buttons
  const uniqueSources = ['ALL', ...Array.from(new Set(vaultItems.map(item => item.source)))];

  const handleLogin = () => {
    setView(ViewState.DASHBOARD);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setView(ViewState.LANDING);
    setIsMenuOpen(false);
  };

  const handleImportComplete = () => {
    setShowImport(false);
    // Add a mock new item
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

  // Generic Secure Action Wrapper
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
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setVaultItems(vaultItems.filter(i => i.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  const generateRio = () => {
    // This function will be passed to handleSecureAction
    const parts = [
      'AIG',
      Math.floor(Math.random() * 90 + 10).toString(), // Provider Code
      'P', // Contract Type (Personal)
      Math.random().toString(36).substr(2, 6).toUpperCase(), // Contract Ref
      Math.random().toString(36).substr(2, 3).toUpperCase() // Checksum
    ];
    setGeneratedRio(parts.join(''));
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    const summaries = vaultItems.map(i => i.summary);
    const result = await analyzeVaultData(summaries);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const downloadProfile = () => {
    const profileData = {
      title: "Profil de Connaissances AIGuardian",
      date: new Date().toISOString(),
      analysis: aiAnalysis || "Non analysé",
      stats: MOCK_CHART_DATA,
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
    const dataToDownload = {
      id: item.id,
      source: item.source,
      date: item.date,
      type: item.type,
      encryptedContent: item.encryptedContent,
      summary: item.summary,
      encryptionMethod: "AES-256 (Simulated)"
    };
    
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

  const getChartData = () => {
    const counts = vaultItems.reduce((acc, item) => {
      const key = item.type;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Conversations', count: counts['conversation'] || 0, color: '#3b82f6' }, // blue-500
      { name: 'Code', count: counts['code'] || 0, color: '#10b981' }, // emerald-500
      { name: 'Images', count: counts['image'] || 0, color: '#8b5cf6' }, // violet-500
    ];
  };

  // --- Render Sections ---

  const renderLanding = () => (
    <div className="flex flex-col min-h-screen transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">AIGuardian</span>
            </div>
            <nav className="hidden md:flex gap-8">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Fonctionnalités</a>
              <a href="#security" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Sécurité</a>
              <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Tarifs</a>
            </nav>
            <div className="hidden md:flex gap-4 items-center">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={handleLogin} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium">Connexion</button>
              <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20">
                Créer un compte
              </button>
            </div>
            <div className="md:hidden flex items-center gap-4">
               <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-900 dark:text-white">
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-4">
            <a href="#features" className="block text-slate-600 dark:text-slate-300 font-medium">Fonctionnalités</a>
            <a href="#security" className="block text-slate-600 dark:text-slate-300 font-medium">Sécurité</a>
            <button onClick={handleLogin} className="block w-full text-left text-blue-600 dark:text-blue-400 font-bold">Connexion</button>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 -z-10 transition-colors duration-300"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6 transition-colors">
              Reprenez le contrôle de <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">vos données d'IA</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 transition-colors">
              Centralisez, sécurisez et transférez vos historiques de conversations générés par l'IA. 
              Votre profil de connaissances vous appartient, pas aux algorithmes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold shadow-xl shadow-blue-500/30 transition-transform transform hover:-translate-y-1">
                Commencer gratuitement
              </button>
              <button className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 text-lg px-8 py-4 rounded-xl font-medium transition-colors">
                En savoir plus
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-6">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Coffre-fort Centralisé</h3>
                <p className="text-slate-600 dark:text-slate-400">Fusionnez vos données ChatGPT, Claude, et Gemini en un seul lieu sécurisé.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Souveraineté Totale</h3>
                <p className="text-slate-600 dark:text-slate-400">Chiffrement côté client. Vos données ne sont jamais revendues ni utilisées pour entraîner des modèles publics.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center mb-6">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Portabilité RIO</h3>
                <p className="text-slate-600 dark:text-slate-400">Générez une clé de transfert pour migrer votre "Profil de Connaissances" vers n'importe quelle autre IA.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4 text-slate-500 dark:text-slate-500">© 2023 AIGuardian. Tous droits réservés.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-white transition-colors">CGU</a>
          </div>
        </div>
      </footer>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0 transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          <span className="font-bold text-lg text-slate-900 dark:text-white">AIGuardian</span>
        </div>
        
        {/* Security Widget */}
        <div className="px-6 py-4">
           <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Système Sécurisé</span>
             </div>
             <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1 font-mono">
               <div className="flex justify-between">
                 <span>Chiffrement:</span>
                 <span className="text-emerald-600 dark:text-emerald-400">AES-256</span>
               </div>
               <div className="flex justify-between">
                 <span>Statut:</span>
                 <span className="text-blue-600 dark:text-blue-400">Verrouillé</span>
               </div>
               <div className="flex justify-between">
                 <span>Stockage:</span>
                 <span className="text-purple-600 dark:text-purple-400">Local Only</span>
               </div>
             </div>
           </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setView(ViewState.DASHBOARD)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === ViewState.DASHBOARD ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Database className="w-5 h-5" /> Mon Coffre-fort
          </button>
          <button onClick={() => setView(ViewState.PROFILE)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === ViewState.PROFILE ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <BrainCircuit className="w-5 h-5" /> Profil de Connaissances
          </button>
          <button onClick={() => setShowRioModal(true)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === ViewState.RIO ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <Share2 className="w-5 h-5" /> Portabilité (RIO)
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0 transition-colors duration-300">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-colors duration-300">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {view === ViewState.DASHBOARD ? 'Mon Coffre-fort' : view === ViewState.PROFILE ? 'Profil de Connaissances' : 'Portabilité'}
            </h1>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setShowImport(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Importer
              </button>
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"></div>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 overflow-y-auto flex-1">
          {view === ViewState.DASHBOARD && (
            <div className="space-y-6">
              
              {/* Zero-Knowledge Banner */}
              <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-lg p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Architecture Zero-Knowledge Active</h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                    Vos données sont chiffrées avec votre clé privée avant même d'être sauvegardées. Ni AIGuardian, ni Google, ni OpenAI ne peuvent lire le contenu de ce coffre-fort sans votre autorisation explicite.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Rechercher dans mes conversations..." 
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Source Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {uniqueSources.map(source => (
                  <button
                    key={source}
                    onClick={() => setSelectedSourceFilter(source)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                      selectedSourceFilter === source
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {source === 'ALL' && <Filter className="w-3 h-3" />}
                    {source === 'ALL' ? 'Tout' : source}
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Items stockés</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{vaultItems.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sources connectées</p>
                  <div className="flex -space-x-2 mt-2">
                    {['ChatGPT', 'Claude', 'Gemini'].map((s, i) => (
                      <div key={s} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300" title={s}>
                        {s[0]}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Statut Sécurité</p>
                  <div className="flex items-center gap-2 mt-2 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Shield className="w-5 h-5" /> Chiffré & Sauvegardé
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
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
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                            {item.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-medium">{item.summary}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm capitalize">{item.type}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{item.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleSecureAction(() => downloadEncryptedItem(item))}
                              className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Télécharger le contenu chiffré"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(item)}
                              className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredItems.length === 0 && (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">Aucun résultat trouvé pour cette sélection.</div>
                )}
              </div>
            </div>
          )}

          {view === ViewState.PROFILE && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                  <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Analyse IA
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                    Utilisez notre IA locale sécurisée pour analyser la structure de vos connaissances sans exposer les données brutes.
                  </p>
                  
                  {!aiAnalysis && !analyzing && (
                    <button 
                      onClick={runAnalysis} 
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20"
                    >
                      Générer mon profil de connaissances
                    </button>
                  )}

                  {analyzing && (
                    <div className="w-full py-6 px-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center gap-3 animate-pulse transition-all">
                      <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Analyse de vos données sécurisées en cours...</div>
                      <div className="flex gap-1 mt-1">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}

                  {aiAnalysis && (
                    <div className="space-y-3">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-sm leading-relaxed animate-in fade-in">
                        {aiAnalysis}
                      </div>
                      <button 
                        onClick={() => handleSecureAction(downloadProfile)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4" /> Télécharger le Profil
                      </button>
                    </div>
                  )}
                 </div>

                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Dimensions du Profil</h3>
                    </div>
                    
                    {/* Provider Filters */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                      {['ALL', 'ChatGPT', 'Claude', 'Gemini'].map((provider) => (
                        <button
                          key={provider}
                          onClick={() => setSelectedDimensionProvider(provider)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                            selectedDimensionProvider === provider
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {provider === 'ALL' ? 'Global (Toutes IA)' : provider}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1">
                      {PROFILE_DIMENSIONS_DATA.map((dim, index) => {
                        // Dynamically calculate score based on selection
                        const displayScore = dim.scores[selectedDimensionProvider] || 0;
                        const displayDim: DisplayDimension = {
                          label: dim.label,
                          color: dim.color,
                          icon: dim.icon,
                          score: displayScore
                        };
                        return (
                          <AnimatedProgressBar 
                            key={dim.label} 
                            dimension={displayDim} 
                            delay={index * 150} 
                          />
                        );
                      })}
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center min-h-[400px] transition-colors">
                   <h3 className="font-bold text-lg mb-6 text-slate-900 dark:text-white self-start">Distribution des Données</h3>
                   <div className="w-full h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#475569" : "#e2e8f0"} vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            stroke={isDarkMode ? "#cbd5e1" : "#475569"} 
                            tick={{ fill: isDarkMode ? "#cbd5e1" : "#475569" }}
                          />
                          <YAxis 
                            stroke={isDarkMode ? "#cbd5e1" : "#475569"} 
                            tick={{ fill: isDarkMode ? "#cbd5e1" : "#475569" }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: isDarkMode ? '#1e293b' : '#fff', 
                              borderColor: isDarkMode ? '#334155' : '#e2e8f0', 
                              color: isDarkMode ? '#fff' : '#000',
                              borderRadius: '8px'
                            }}
                            cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                          />
                          <Bar dataKey="count" name="Éléments" radius={[4, 4, 0, 0]}>
                             {getChartData().map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Sujets Fréquents</h3>
                    <div className="flex flex-wrap gap-2">
                       {Array.from(new Set(vaultItems.flatMap(i => i.tags))).map(tag => (
                         <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm">#{tag}</span>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* RIO Modal */}
      {showRioModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Obtenir mon RIO</h3>
              <button onClick={() => setShowRioModal(false)}><X className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" /></button>
            </div>
            
            {!generatedRio ? (
              <div className="text-center space-y-6">
                <p className="text-slate-600 dark:text-slate-300">
                  Le Relevé d'Identité Opérateur (RIO) pour IA permet de transférer l'intégralité de votre profil de connaissances vers un autre fournisseur de manière sécurisée.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-xs text-yellow-800 dark:text-yellow-200 text-left">
                  <strong>Attention:</strong> Cette action génère une clé de déchiffrement temporaire. Ne la partagez qu'avec le nouveau service de confiance.
                </div>
                <button 
                  onClick={() => handleSecureAction(generateRio)} 
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Générer le code RIO
                </button>
              </div>
            ) : (
              <div className="text-center space-y-6 animate-in zoom-in duration-300">
                <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-2xl tracking-widest text-slate-800 dark:text-slate-200 font-bold select-all">
                  {generatedRio}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Code valide pour 24 heures. Copiez ce code dans l'interface d'importation de votre nouveau service IA.
                </p>
                <button onClick={() => {navigator.clipboard.writeText(generatedRio); alert('Copié !')}} className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors">
                  Copier dans le presse-papier
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Wizard */}
      {showImport && (
        <ImportWizard 
          onComplete={handleImportComplete} 
          onCancel={() => setShowImport(false)} 
        />
      )}

      {/* 2FA Modal */}
      <TwoFactorModal 
        isOpen={is2FAOpen} 
        onClose={() => setIs2FAOpen(false)} 
        onSuccess={on2FASuccess}
      />

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="w-7 h-7" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Supprimer définitivement cet élément ?</h3>
              
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg w-full text-left border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Résumé</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{itemToDelete.summary}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{itemToDelete.source} • {itemToDelete.date}</p>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Cette action est <span className="font-bold text-red-600 dark:text-red-400">irréversible</span>. La donnée sera effacée de votre stockage local et ne pourra pas être récupérée.
              </p>

              <div className="w-full space-y-3 pt-2">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                >
                  Supprimer définitivement
                </button>
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="w-full py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  return (
    <>
      {view === ViewState.LANDING ? renderLanding() : renderDashboard()}
      <CookieBanner />
    </>
  );
};

export default App;