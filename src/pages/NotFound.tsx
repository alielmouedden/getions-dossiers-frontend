import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const userRoles = user?.roles?.map((r: string) => r.replace('ROLE_', '').toLowerCase()) || [];
  const isAdmin = userRoles.includes('manager') || userRoles.includes('admin') || user?.role === 'MANAGER';
  const isLoggedIn = !!user;

  const isRtl = i18n.language === 'ar';

  const handleBack = () => {
    if (isLoggedIn) {
      navigate(isAdmin ? '/dashboard' : '/my-transfers');
    } else {
      navigate('/');
    }
  };

  const getButtonText = () => {
    if (isLoggedIn) {
      return isAdmin 
        ? t('backToDashboard', 'العودة إلى لوحة التحكم') 
        : t('backToMyTransfers', 'العودة إلى إحالاتي');
    }
    return t('backToHome', 'العودة إلى الصفحة الرئيسية');
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center text-center gap-6 p-8 bg-background"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="rounded-full bg-primary/10 p-6">
        <FileQuestion className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-foreground">
        {t('notFoundTitle', 'الصفحة غير موجودة')}
      </h1>
      <p className="text-muted-foreground max-w-md text-lg">
        {t('notFoundDesc', 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.')}
      </p>
      <Button onClick={handleBack} size="lg">
        {getButtonText()}
      </Button>
    </div>
  );
};

export default NotFound;
