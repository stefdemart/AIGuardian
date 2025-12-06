import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900 text-white shadow-2xl border-t border-slate-700">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg">Votre vie privée est notre priorité</h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Nous utilisons uniquement des cookies essentiels au fonctionnement sécurisé du coffre-fort. 
            Aucun traceur publicitaire n'est utilisé. Conformément au RGPD, vous avez le contrôle total.
          </p>
          {detailsOpen && (
            <div className="mt-4 bg-slate-800 p-4 rounded text-xs grid gap-2">
              <div className="flex justify-between items-center">
                <span>Cookies Essentiels (Sécurité, Session)</span>
                <span className="text-emerald-400 font-bold">Toujours actif</span>
              </div>
              <div className="flex justify-between items-center opacity-75">
                <span>Analytique (Anonymisé)</span>
                <input type="checkbox" className="accent-blue-500" />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
           <button 
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="text-sm underline text-slate-400 hover:text-white transition-colors"
          >
            {detailsOpen ? 'Masquer détails' : 'Personnaliser'}
          </button>
          <button 
            onClick={handleRejectAll}
            className="px-4 py-2 text-sm font-medium bg-transparent border border-slate-500 rounded hover:bg-slate-800 transition-colors"
          >
            Tout refuser
          </button>
          <button 
            onClick={handleAcceptAll}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
};
