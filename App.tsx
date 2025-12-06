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
  FileText 
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ViewState, VaultItem, ChartData } from './types';
import { CookieBanner } from './components/CookieBanner';
import { ImportWizard } from './components/ImportWizard';
import { analyzeVaultData } from './services/geminiService';

// Mock Data
const MOCK_VAULT_ITEMS: VaultItem[] = [
  { id: '1', source: 'ChatGPT', type: 'conversation', date: '2023-10-15', summary: 'Brainstorming Marketing Eco-responsable', encryptedContent: 'EncryptedBlob...', tags: ['work', 'marketing'] },
  { id: '2', source: 'Claude', type: 'code', date: '2023-10-18', summary: 'Refactoring React Components', encryptedContent: 'EncryptedBlob...', tags: ['dev', 'react'] },
  { id: '3', source: 'Gemini', type: 'conversation', date: '2023-11-02', summary: 'Recette Cuisine Italienne', encryptedContent: 'EncryptedBlob...', tags: ['perso', 'cooking'] },
  { id: '4', source: 'Midjourney', type: 'image', date: '2023-11-05', summary: 'Cyberpunk Cityscapes', encryptedContent: 'EncryptedBlob...', tags: ['art', 'concept'] },
];

const MOCK_CHART_DATA: ChartData[] = [
  { subject: 'Code', A: 120, fullMark: 150 },
  { subject: 'Créativité', A: 98, fullMark: 150 },
  { subject: 'Productivité', A: 86, fullMark: 150 },
  { subject: 'Recherche', A: 99, fullMark: 150 },
  { subject: 'Linguistique', A: 85, fullMark: 150 },
  { subject: 'Technique', A: 65, fullMark: 150 },
];

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(MOCK_VAULT_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRioModal, setShowRioModal] = useState(false);
  const [generatedRio, setGeneratedRio] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Filter vault items
  const filteredItems = vaultItems.filter(item => 
    item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      encryptedContent: '...',
      tags: ['import']
    };
    setVaultItems([newItem, ...vaultItems]);
  };

  const generateRio = () => {
    // Generate a RIO-like key
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

  // --- Render Sections ---

  const renderLanding = () => (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900 tracking-tight">AIGuardian</span>
            </div>
            <nav className="hidden md:flex gap-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Fonctionnalités</a>
              <a href="#security" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Sécurité</a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Tarifs</a>
            </nav>
            <div className="hidden md:flex gap-4">
              <button onClick={handleLogin} className="text-slate-600 hover:text-slate-900 font-medium">Connexion</button>
              <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20">
                Créer un compte
              </button>
            </div>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-4">
            <a href="#features" className="block text-slate-600 font-medium">Fonctionnalités</a>
            <a href="#security" className="block text-slate-600 font-medium">Sécurité</a>
            <button onClick={handleLogin} className="block w-full text-left text-blue-600 font-bold">Connexion</button>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100 -z-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Reprenez le contrôle de <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">vos données d'IA</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Centralisez, sécurisez et transférez vos historiques de conversations générés par l'IA. 
              Votre profil de connaissances vous appartient, pas aux algorithmes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold shadow-xl shadow-blue-500/30 transition-transform transform hover:-translate-y-1">
                Commencer gratuitement
              </button>
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-lg px-8 py-4 rounded-xl font-medium transition-colors">
                En savoir plus
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Coffre-fort Centralisé</h3>
                <p className="text-slate-600">Fusionnez vos données ChatGPT, Claude, et Gemini en un seul lieu sécurisé.</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Souveraineté Totale</h3>
                <p className="text-slate-600">Chiffrement côté client. Vos données ne sont jamais revendues ni utilisées pour entraîner des modèles publics.</p>
              </div>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Portabilité RIO</h3>
                <p className="text-slate-600">Générez une clé de transfert pour migrer votre "Profil de Connaissances" vers n'importe quelle autre IA.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4 text-slate-500">© 2023 AIGuardian. Tous droits réservés.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white">Confidentialité</a>
            <a href="#" className="hover:text-white">Mentions Légales</a>
            <a href="#" className="hover:text-white">CGU</a>
          </div>
        </div>
      </footer>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed inset-y-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg text-slate-900">AIGuardian</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setView(ViewState.DASHBOARD)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === ViewState.DASHBOARD ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Database className="w-5 h-5" /> Mon Coffre-fort
          </button>
          <button onClick={() => setView(ViewState.PROFILE)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === ViewState.PROFILE ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <BrainCircuit className="w-5 h-5" /> Profil de Connaissances
          </button>
          <button onClick={() => setShowRioModal(true)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === ViewState.RIO ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Share2 className="w-5 h-5" /> Portabilité (RIO)
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">
              {view === ViewState.DASHBOARD ? 'Mon Coffre-fort' : view === ViewState.PROFILE ? 'Profil de Connaissances' : 'Portabilité'}
            </h1>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowImport(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Importer
              </button>
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8 overflow-y-auto flex-1">
          {view === ViewState.DASHBOARD && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher dans mes conversations..." 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-500 font-medium">Items stockés</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{vaultItems.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-500 font-medium">Sources connectées</p>
                  <div className="flex -space-x-2 mt-2">
                    {['ChatGPT', 'Claude', 'Gemini'].map((s, i) => (
                      <div key={s} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600" title={s}>
                        {s[0]}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-500 font-medium">Statut Sécurité</p>
                  <div className="flex items-center gap-2 mt-2 text-emerald-600 font-bold">
                    <Shield className="w-5 h-5" /> Chiffré & Sauvegardé
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Source</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Résumé</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Type</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Date</th>
                      <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.source}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-medium">{item.summary}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm capitalize">{item.type}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{item.date}</td>
                        <td className="px-6 py-4">
                          <button className="text-slate-400 hover:text-blue-600">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredItems.length === 0 && (
                  <div className="p-8 text-center text-slate-500">Aucun résultat trouvé.</div>
                )}
              </div>
            </div>
          )}

          {view === ViewState.PROFILE && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 text-slate-900 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-600" /> Analyse IA
                  </h3>
                  <p className="text-slate-600 mb-6 text-sm">
                    Utilisez notre IA locale sécurisée pour analyser la structure de vos connaissances sans exposer les données brutes.
                  </p>
                  {!aiAnalysis ? (
                    <button 
                      onClick={runAnalysis} 
                      disabled={analyzing}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
                    >
                      {analyzing ? 'Analyse en cours...' : 'Générer mon profil de connaissances'}
                    </button>
                  ) : (
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-indigo-900 text-sm leading-relaxed">
                      {aiAnalysis}
                    </div>
                  )}
                 </div>

                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-slate-900">Sujets Fréquents</h3>
                    <div className="flex flex-wrap gap-2">
                       {Array.from(new Set(vaultItems.flatMap(i => i.tags))).map(tag => (
                         <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">#{tag}</span>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                 <h3 className="font-bold text-lg mb-6 text-slate-900 self-start">Visualisation Radar</h3>
                 <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={MOCK_CHART_DATA}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis />
                        <Radar name="User" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* RIO Modal */}
      {showRioModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Obtenir mon RIO</h3>
              <button onClick={() => setShowRioModal(false)}><X className="text-slate-400 hover:text-slate-900" /></button>
            </div>
            
            {!generatedRio ? (
              <div className="text-center space-y-6">
                <p className="text-slate-600">
                  Le Relevé d'Identité Opérateur (RIO) pour IA permet de transférer l'intégralité de votre profil de connaissances vers un autre fournisseur de manière sécurisée.
                </p>
                <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 text-left">
                  <strong>Attention:</strong> Cette action génère une clé de déchiffrement temporaire. Ne la partagez qu'avec le nouveau service de confiance.
                </div>
                <button onClick={generateRio} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                  Générer le code RIO
                </button>
              </div>
            ) : (
              <div className="text-center space-y-6 animate-in zoom-in duration-300">
                <div className="bg-slate-100 p-4 rounded-lg border border-slate-300 font-mono text-2xl tracking-widest text-slate-800 font-bold select-all">
                  {generatedRio}
                </div>
                <p className="text-sm text-slate-500">
                  Code valide pour 24 heures. Copiez ce code dans l'interface d'importation de votre nouveau service IA.
                </p>
                <button onClick={() => {navigator.clipboard.writeText(generatedRio); alert('Copié !')}} className="text-blue-600 hover:underline font-medium">
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