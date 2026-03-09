import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const featureCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="border-b border-border bg-card sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="hidden xs:block">
              <h1 className="text-sm sm:text-lg font-semibold text-foreground">{t('ministryTitle')}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">{t('platformTitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} className="h-8 w-8 sm:h-10 sm:w-10">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button onClick={() => navigate('/login')} size="sm" className="sm:px-4">
              {t('login')}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-gradient-to-b from-accent/30 to-background overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 sm:px-6 text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight"
          >
            {t('landingTitle')}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xs sm:max-w-lg md:max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed"
          >
            {t('landingDescription')}
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="px-6 sm:px-8 py-3 text-base sm:text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              {t('getStarted')}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground text-center mb-8 sm:mb-12"
          >
            {t('featuresTitle')}
          </motion.h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={feature.key} variants={featureCardVariants} custom={index}>
                <Card className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-3 sm:mb-4"
                    >
                      <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    </motion.div>
                    <h4 className="text-base sm:text-lg font-medium text-foreground mb-2">
                      {t(`${feature.key}Title`)}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {t(`${feature.key}Desc`)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-6 sm:py-8 border-t border-border bg-card"
      >
        <div className="container mx-auto px-4 sm:px-6 text-center text-muted-foreground text-xs sm:text-sm">
          © {new Date().getFullYear()} {t('ministryTitle')}. {t('allRightsReserved')}
        </div>
      </motion.footer>

      {/* Floating Mini Chat */}
      <MiniChat />
    </div>
  );
};

export default LandingPage;
