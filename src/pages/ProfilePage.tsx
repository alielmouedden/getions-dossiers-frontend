import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Lock, Mail, Phone, Shield, Save, Key, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { userAddSchema, validateForm } from '@/lib/validation';
import { z } from 'zod';

const profileSchema = userAddSchema.omit({ password: true, username: true, role: true });

const passwordChangeSchema = z.object({
  currentPassword: z.string().trim().min(1, 'currentPasswordRequired'),
  newPassword: z.string().trim().min(1, 'newPasswordRequired').min(6, 'minLength6'),
  confirmPassword: z.string().trim().min(1, 'required'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'passwordsDoNotMatch',
  path: ['confirmPassword'],
});

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const isRtl = i18n.language === 'ar';

  // Personal Info Form State
  const [infoForm, setInfoForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});
  const [infoLoading, setInfoLoading] = useState(false);

  // Password Form State
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const { success, errors } = validateForm(profileSchema, infoForm, t);
    if (!success) {
      setInfoErrors(errors);
      return;
    }
    setInfoErrors({});
    setInfoLoading(true);

    try {
      const updatedUser = await apiClient.updateUser(user.id, {
        firstName: infoForm.firstName,
        lastName: infoForm.lastName,
        email: infoForm.email,
        phone: infoForm.phone,
      });

      updateProfile({
        ...user,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
      });

      toast({ title: t('profileUpdated') });
    } catch (err: any) {
      toast({
        title: t('error'),
        description: err.message || t('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { success, errors } = validateForm(passwordChangeSchema, pwdForm, t);
    if (!success) {
      setPwdErrors(errors);
      return;
    }
    setPwdErrors({});
    setPwdLoading(true);

    try {
      await apiClient.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });

      toast({ title: t('passwordChanged') });
      setPwdForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      toast({
        title: t('error'),
        description: err.message || t('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setPwdLoading(false);
    }
  };

  const initialLetters = (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '');

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserIcon className="w-8 h-8 text-primary" />
          {t('profile')}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Quick view Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border border-border/40 shadow-sm overflow-hidden bg-card">
            <div className="h-28 bg-gradient-to-r from-primary/10 to-primary/20 relative" />
            <CardContent className="pt-0 pb-6 text-center relative px-6">
              <div className="w-20 h-20 rounded-full border-4 border-background bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto -mt-10 shadow-md">
                {initialLetters.toUpperCase() || <UserIcon className="w-8 h-8" />}
              </div>
              <h2 className="mt-4 text-xl font-bold text-foreground">
                {user ? `${user.firstName} ${user.lastName}` : ''}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">@{user?.username}</p>
              <div className="mt-4 flex justify-center">
                <Badge variant="secondary" className="px-3 py-1 text-xs gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  {user?.role ? t(user.role) : ''}
                </Badge>
              </div>

              <div className="mt-6 border-t border-border/50 pt-4 text-left space-y-3" dir="ltr">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0 text-primary/60" />
                  <span className="truncate">{user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0 text-primary/60" />
                  <span>{user?.phone || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Editing forms */}
        <div className="md:col-span-2 space-y-6 animate-in fade-in-50 duration-300">
          {/* Card 1: Personal Details */}
          <Card className="border border-border/40 shadow-sm bg-card">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                {t('personalInfo')}
              </CardTitle>
              <CardDescription>
                {t('updateUserInfoDescription', 'Mettez à jour vos coordonnées et informations de profil.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('firstName')}</Label>
                    <Input
                      id="firstName"
                      value={infoForm.firstName}
                      onChange={e => setInfoForm({ ...infoForm, firstName: e.target.value })}
                      className={infoErrors.firstName ? 'border-destructive' : ''}
                    />
                    {infoErrors.firstName && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {infoErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('lastName')}</Label>
                    <Input
                      id="lastName"
                      value={infoForm.lastName}
                      onChange={e => setInfoForm({ ...infoForm, lastName: e.target.value })}
                      className={infoErrors.lastName ? 'border-destructive' : ''}
                    />
                    {infoErrors.lastName && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {infoErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={infoForm.email}
                      onChange={e => setInfoForm({ ...infoForm, email: e.target.value })}
                      className={infoErrors.email ? 'border-destructive' : ''}
                    />
                    {infoErrors.email && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {infoErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input
                      id="phone"
                      value={infoForm.phone}
                      onChange={e => setInfoForm({ ...infoForm, phone: e.target.value })}
                      placeholder="+2126XXXXXXXX"
                      className={infoErrors.phone ? 'border-destructive' : ''}
                    />
                    {infoErrors.phone && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {infoErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={infoLoading} className="gap-2">
                    <Save className="w-4 h-4" />
                    {infoLoading ? t('saving') : t('save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Card 2: Security Details (Change Password) */}
          <Card className="border border-border/40 shadow-sm bg-card">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                {t('security')}
              </CardTitle>
              <CardDescription>
                {t('changePasswordDescription', 'Modifiez votre mot de passe pour sécuriser votre compte.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePwdSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={pwdForm.currentPassword}
                    onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                    className={pwdErrors.currentPassword ? 'border-destructive' : ''}
                  />
                  {pwdErrors.currentPassword && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {pwdErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('newPassword')}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={pwdForm.newPassword}
                      onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                      className={pwdErrors.newPassword ? 'border-destructive' : ''}
                    />
                    {pwdErrors.newPassword && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {pwdErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={pwdForm.confirmPassword}
                      onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                      className={pwdErrors.confirmPassword ? 'border-destructive' : ''}
                    />
                    {pwdErrors.confirmPassword && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {pwdErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={pwdLoading} className="gap-2">
                    <Key className="w-4 h-4" />
                    {pwdLoading ? t('saving') : t('save')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
