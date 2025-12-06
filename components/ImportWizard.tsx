import React, { useState } from 'react';
import { Upload, FileJson, CheckCircle, ShieldAlert, Lock, ArrowRight, Loader2, HelpCircle, ChevronLeft, ExternalLink, Copy } from 'lucide-react';

interface ImportWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface ExportGuide {
  id: string;
  name: string;
  steps: string[];
  tips?: string;
  color: string;
}

const EXPORT_GUIDES: ExportGuide[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT (OpenAI)',
    color: 'bg-emerald-600',
    steps: [
      "Connectez-vous à chat.openai.com",
      "Cliquez sur votre profil en bas à gauche > Settings (Paramètres)",
      "Allez dans 'Data Controls' (Contrôle des données)",
      "Cliquez sur 'Export Data' > Confirm Export",
      "Vous recevrez un email avec un lien de téléchargement (fichier .zip)"
    ],
    tips: "Le fichier à importer est souvent nommé 'conversations.json' à l'intérieur du ZIP."
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    color: 'bg-orange-600',
    steps: [
      "Connectez-vous à claude.ai",
      "Cliquez sur vos initiales en haut à droite",
      "Sélectionnez 'Settings' > 'Account'",
      "Cliquez sur le bouton 'Export Data'",
      "Le téléchargement démarre immédiatement (.zip ou .json)"
    ],
    tips: "Claude fournit un format JSON très propre, facile à importer."
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    color: 'bg-blue-600',
    steps: [
      "Allez sur takeout.google.com",
      "Cliquez sur 'Désélectionner tout'",
      "Cherchez et cochez uniquement 'Gemini Apps'",
      "En bas, cliquez sur 'Étape suivante'",
      "Choisissez 'Envoyer le lien de téléchargement par e-mail' > 'Créer une exportation'"
    ],
    tips: "Google Takeout peut prendre quelques minutes à générer le fichier."
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    color: 'bg-slate-900',
    steps: [
      "Allez sur midjourney.com/archive",
      "Connectez-vous avec Discord",
      "Utilisez l'outil de sélection pour choisir vos images",
      "Cliquez sur l'icône de téléchargement (Download) en bas",
      "Récupérez l'archive ZIP contenant vos images et prompts"
    ]
  }
];

export const ImportWizard: React.FC<ImportWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string>('chatgpt');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleProcess = () => {
    setIsProcessing(true);
    // Simulate encryption and import delay
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 2000);
  };

  const currentGuide = EXPORT_GUIDES.find(g => g.id === selectedGuideId);

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center transition-colors shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            {showGuide ? "Guide d'exportation des données" : "Importer des données IA"}
          </h2>
          {!showGuide && (
            <div className="flex gap-2">
              <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
              <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
              <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-0 overflow-y-auto flex-1">
          
          {showGuide ? (
            <div className="flex flex-col md:flex-row h-full min-h-[400px]">
              {/* Sidebar Guide Selection */}
              <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-700 p-4 space-y-2">
                 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Choisir la source</p>
                 {EXPORT_GUIDES.map(guide => (
                   <button
                    key={guide.id}
                    onClick={() => setSelectedGuideId(guide.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                      selectedGuideId === guide.id 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                   >
                     <span className={`w-2 h-2 rounded-full ${guide.color}`}></span>
                     {guide.name}
                   </button>
                 ))}
              </div>

              {/* Guide Details */}
              <div className="w-full md:w-2/3 p-6 md:p-8 bg-white dark:bg-slate-800">
                {currentGuide && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${currentGuide.color}`}></span>
                      Exporter depuis {currentGuide.name}
                    </h3>
                    
                    <div className="space-y-6 relative">
                      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-700"></div>
                      {currentGuide.steps.map((s, idx) => (
                        <div key={idx} className="relative flex gap-4 items-start group">
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-blue-100 dark:border-slate-600 text-blue-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center shrink-0 z-10 group-hover:border-blue-500 dark:group-hover:border-blue-500 transition-colors">
                            {idx + 1}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-sm pt-1.5 leading-relaxed">
                            {s}
                          </p>
                        </div>
                      ))}
                    </div>

                    {currentGuide.tips && (
                      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50 flex gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <p className="text-xs text-blue-800 dark:text-blue-200">{currentGuide.tips}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 min-h-[300px] flex flex-col justify-center">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg flex gap-3 transition-colors">
                    <ShieldAlert className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Toutes les données importées sont chiffrées localement dans votre navigateur avant d'être enregistrées. AIGuardian ne peut pas lire vos contenus bruts.
                    </p>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer relative group">
                    <input 
                      type="file" 
                      accept=".json,.txt,.csv,.zip" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={handleFileChange}
                    />
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FileJson className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="font-medium text-slate-900 dark:text-slate-200 text-lg">Glissez-déposez votre export</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">ou cliquez pour parcourir (.json, .zip)</p>
                    {fileName && (
                      <div className="mt-4 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full font-medium flex items-center gap-2 animate-in slide-in-from-bottom-2">
                        <CheckCircle className="w-4 h-4" /> {fileName}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <button 
                      onClick={() => setShowGuide(true)}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" /> Comment récupérer mes données (ChatGPT, Claude...) ?
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
                  {isProcessing ? (
                    <>
                      <div className="relative">
                        <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400 opacity-50" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Chiffrement en cours...</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Nous sécurisons vos données avec une clé AES-256 locale.</p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto">
                        <Lock className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Prêt à importer</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md">
                        Le fichier <strong>{fileName}</strong> a été validé. Il contient environ 45 conversations.
                        Voulez-vous procéder à l'importation sécurisée dans votre coffre-fort ?
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Importation réussie !</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                      Vos données sont maintenant sécurisées dans votre coffre-fort. Vous seul y avez accès.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-between transition-colors shrink-0">
          {showGuide ? (
             <button 
                onClick={() => setShowGuide(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Retour à l'import
              </button>
          ) : (
            step < 3 ? (
              <>
                <button onClick={onCancel} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
                  Annuler
                </button>
                {step === 1 ? (
                  <button 
                    disabled={!fileName}
                    onClick={() => setStep(2)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition-all"
                  >
                    Continuer <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                   !isProcessing && (
                    <button 
                      onClick={handleProcess}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
                    >
                      Chiffrer et Importer <Lock className="w-4 h-4" />
                    </button>
                   )
                )}
              </>
            ) : (
              <button 
                onClick={onComplete}
                className="w-full px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/30 transition-all"
              >
                Accéder au Coffre-fort
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};