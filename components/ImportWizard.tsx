import React, { useState } from 'react';
import { Upload, FileJson, CheckCircle, ShieldAlert, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface ImportWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

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

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-700 transition-colors">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center transition-colors">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Importer des données IA</h2>
          <div className="flex gap-2">
            <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
            <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
            <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[300px] flex flex-col justify-center">
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg flex gap-3 transition-colors">
                <ShieldAlert className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Toutes les données importées sont chiffrées localement dans votre navigateur avant d'être enregistrées. AIGuardian ne peut pas lire vos contenus bruts.
                </p>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".json,.txt,.csv" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <FileJson className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
                <h3 className="font-medium text-slate-900 dark:text-slate-200">Glissez-déposez votre export (ChatGPT, Claude...)</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">ou cliquez pour parcourir (.json, .zip)</p>
                {fileName && (
                  <div className="mt-4 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {fileName}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center text-center space-y-6">
              {isProcessing ? (
                <>
                  <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin" />
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

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-between transition-colors">
          {step < 3 ? (
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
          )}
        </div>
      </div>
    </div>
  );
};