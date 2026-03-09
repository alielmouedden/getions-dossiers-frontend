import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppSidebar } from './AppSidebar';
import { AppNavbar } from './AppNavbar';
import { AppBreadcrumb } from './AppBreadcrumb';

const MainLayout = () => {
  const { i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRtl]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'fr' : 'ar');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} isRtl={isRtl} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleTheme={() => setDarkMode(!darkMode)}
          onToggleLanguage={toggleLanguage}
          onLogout={handleLogout}
          darkMode={darkMode}
          language={i18n.language}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
