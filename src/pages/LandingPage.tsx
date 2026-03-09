import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MiniChat } from '@/components/MiniChat';
import { FileText, Users, ArrowLeftRight, Shield, Globe } from 'lucide-react';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRtl]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'fr' : 'ar');
  };

  const features = [
    { icon: FileText, key: 'featureFiles' },
    { icon: Users, key: 'featureUsers' },
    { icon: ArrowLeftRight, key: 'featureTransfers' },
    { icon: Shield, key: 'featureSecurity' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{t('ministryTitle')}</h1>
              <p className="text-sm text-muted-foreground">{t('platformTitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={toggleLanguage}>
              <Globe className="w-5 h-5" />
            </Button>
            <Button onClick={() => navigate('/login')}>
              {t('login')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t('landingTitle')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('landingDescription')}
          </p>
          <Button size="lg" onClick={() => navigate('/login')} className="px-8">
            {t('getStarted')}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-12">
            {t('featuresTitle')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.key} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h4 className="text-lg font-medium text-foreground mb-2">
                    {t(`${feature.key}Title`)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t(`${feature.key}Desc`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} {t('ministryTitle')}. {t('allRightsReserved')}
        </div>
      </footer>

      {/* Floating Mini Chat */}
      <MiniChat />
    </div>
  );
};

export default LandingPage;
