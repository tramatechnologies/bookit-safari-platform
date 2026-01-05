import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'sw' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium"
      title={i18n.language === 'en' ? 'Switch to Swahili' : 'Switch to English'}
    >
      <Globe className="w-4 h-4" />
      <span className="text-xs sm:text-sm">
        {i18n.language === 'en' ? 'Sw' : 'En'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
