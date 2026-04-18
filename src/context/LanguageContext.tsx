import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations } from '../data/translations';

type Locale = 'en' | 'es';

interface LanguageContextType {
  locale: Locale;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en'); // default to english or spanish based on preference

  const toggleLanguage = () => {
    setLocale((prev) => (prev === 'en' ? 'es' : 'en'));
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
