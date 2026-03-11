import { useEffect, useState } from "react";
import { Bell, Lock, Globe, User, Moon, Mail, Shield, ChevronRight, Crown, Eye, EyeOff, Download, AlertCircle, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { useTheme } from "@/hooks/use-theme";
import { useClientProfile, usePromoteurStatus, useUpdateClientProfile } from "@/hooks/useApi";
import { getPreferredCurrency, setPreferredCurrency, type PreferredCurrency } from "@/lib/userPreferences";
import { useToast } from "@/hooks/use-toast";
import { accountService } from "@/lib/services";

/**
 * Settings - Page Paramètres du dashboard client
 *
 * Sections:
 * - Compte (langue, fuseau horaire, devise)
 * - Notifications (email, push)
 * - Sécurité (email, mot de passe, 2FA)
 * - Apparence (thème)
 * - Devenir Promoteur
 * - Zone sensible (export RGPD, déactivation compte)
 */

/* ---------- Toggle switch réutilisable ---------- */
const Toggle = ({
  enabled = false,
  onToggle,
  disabled = false,
}: {
  enabled?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    onClick={onToggle}
    disabled={disabled}
    className={`
      relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
      border-2 border-transparent transition-colors duration-200 ease-in-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${enabled ? "bg-coral-500" : "bg-gray-200 dark:bg-gray-600"}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-5 w-5 transform rounded-full
        bg-white shadow ring-0 transition duration-200 ease-in-out
        ${enabled ? "translate-x-5" : "translate-x-0"}
      `}
    />
  </button>
);

/* ---------- Section card ---------- */
const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-6 transition-colors duration-300">
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-lg bg-coral-50 dark:bg-coral-500/10 text-coral-500">{icon}</div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-gray-100">{title}</h2>
    </div>
    <div className="divide-y divide-gray-100 dark:divide-gray-700">{children}</div>
  </div>
);

/* ---------- Row item ---------- */
const SettingRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
    <div>
      <p className="text-sm font-medium text-slate-900 dark:text-gray-100">{label}</p>
      {description && (
        <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    <div className="flex items-center">{children}</div>
  </div>
);

/* ---------- Page ---------- */
const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: clientProfile } = useClientProfile();
  const updateClientProfile = useUpdateClientProfile();
  const { data: promoteurStatus } = usePromoteurStatus();

  const [preferredCurrency, setPreferredCurrencyState] = useState<PreferredCurrency>("EUR");
  const [userEmail, setUserEmail] = useState<string>("");
  const [deactivationCountdown, setDeactivationCountdown] = useState<number | null>(null);

  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    whatsapp: false,
    newLeads: true,
    projectUpdates: true,
  });

  // Security panels
  const [securityPanel, setSecurityPanel] = useState<null | 'password' | 'email'>(null);

  // Change password state
  const [changePasswordState, setChangePasswordState] = useState({
    current: '',
    next: '',
    confirm: '',
    loading: false,
    error: '',
    success: false,
  });

  // Change email state
  const [changeEmailState, setChangeEmailState] = useState({
    newEmail: '',
    password: '',
    code: '',
    step: 0, // 0 = request, 1 = verify code
    loading: false,
    error: '',
    success: false,
  });

  // Delete account modal
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteState, setDeleteState] = useState({
    password: '',
    confirmation: '',
    loading: false,
    error: '',
  });

  useEffect(() => {
    setPreferredCurrencyState(getPreferredCurrency());
  }, []);

  useEffect(() => {
    const notifications = clientProfile?.preferences?.notifications;
    if (!notifications) return;
    setNotificationPrefs({
      email: notifications.email ?? true,
      whatsapp: notifications.whatsapp ?? false,
      newLeads: notifications.newLeads ?? true,
      projectUpdates: notifications.projectUpdates ?? true,
    });
  }, [clientProfile]);

  // Set user email and check deactivation countdown
  useEffect(() => {
    if (clientProfile?.email) {
      setUserEmail(clientProfile.email);
    }
  }, [clientProfile]);

  const handleCurrencyChange = (value: string) => {
    const next = value === "XOF" ? "XOF" : "EUR";
    setPreferredCurrencyState(next);
    setPreferredCurrency(next);
  };

  const handleNotificationToggle = async (
    key: "email" | "whatsapp" | "newLeads" | "projectUpdates"
  ) => {
    const previous = notificationPrefs;
    const next = {
      ...notificationPrefs,
      [key]: !notificationPrefs[key],
    };
    setNotificationPrefs(next);
    try {
      await updateClientProfile.mutateAsync({
        preferences: {
          notifications: next,
        },
      });
    } catch {
      setNotificationPrefs(previous);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer vos préférences de notifications.",
        variant: "destructive",
      });
    }
  };

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return { hasMinLength, hasUppercase, hasLowercase, hasNumber };
  };

  const passwordStrength = getPasswordStrength(changePasswordState.next);
  const isPasswordValid = passwordStrength.hasMinLength && passwordStrength.hasUppercase && passwordStrength.hasLowercase && passwordStrength.hasNumber;
  const passwordMismatch = changePasswordState.confirm.length > 0 && changePasswordState.next !== changePasswordState.confirm;

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setChangePasswordState(prev => ({ ...prev, error: 'Le mot de passe ne respecte pas les critères de sécurité' }));
      return;
    }

    if (passwordMismatch) {
      setChangePasswordState(prev => ({ ...prev, error: 'Les mots de passe ne correspondent pas' }));
      return;
    }

    setChangePasswordState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await accountService.changePassword({
        currentPassword: changePasswordState.current,
        newPassword: changePasswordState.next,
      });

      setChangePasswordState({
        current: '',
        next: '',
        confirm: '',
        loading: false,
        error: '',
        success: true,
      });

      setTimeout(() => {
        setSecurityPanel(null);
        toast({
          title: 'Succès',
          description: 'Votre mot de passe a été modifié avec succès.',
        });
      }, 1500);
    } catch (error: any) {
      console.error('Password change error:', error);
      setChangePasswordState(prev => ({ ...prev, error: 'Le mot de passe actuel est incorrect ou une erreur est survenue', loading: false }));
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier votre mot de passe. Vérifiez vos données.',
        variant: 'destructive',
      });
    }
  };

  // Handle email change request
  const handleRequestChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(changeEmailState.newEmail)) {
      setChangeEmailState(prev => ({ ...prev, error: 'Format d\'adresse email invalide' }));
      return;
    }

    setChangeEmailState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await accountService.requestChangeEmail({
        newEmail: changeEmailState.newEmail,
        currentPassword: changeEmailState.password,
      });

      setChangeEmailState(prev => ({
        ...prev,
        step: 1,
        loading: false,
        error: '',
      }));

      toast({
        title: 'Code envoyé',
        description: 'Vérifiez votre nouvelle adresse email pour le code de vérification.',
      });
    } catch (error: any) {
      console.error('Email change request error:', error);
      const errorMsg = error?.message || '';
      let displayError = 'Impossible de demander le changement d\'email';

      if (errorMsg.includes('mot de passe') || errorMsg.includes('incorrect')) {
        displayError = 'Le mot de passe est incorrect';
      } else if (errorMsg.includes('déjà utilisée') || errorMsg.includes('already')) {
        displayError = 'Cette adresse email est déjà utilisée';
      }

      setChangeEmailState(prev => ({ ...prev, error: displayError, loading: false }));
      toast({
        title: 'Erreur',
        description: displayError,
        variant: 'destructive',
      });
    }
  };

  // Handle email change confirmation
  const handleConfirmChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!changeEmailState.code || changeEmailState.code.length !== 6) {
      setChangeEmailState(prev => ({ ...prev, error: 'Code invalide (6 chiffres requis)' }));
      return;
    }

    setChangeEmailState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await accountService.confirmChangeEmail({
        code: changeEmailState.code,
      });

      const newEmail = changeEmailState.newEmail;
      setChangeEmailState({
        newEmail: '',
        password: '',
        code: '',
        step: 0,
        loading: false,
        error: '',
        success: true,
      });

      // Update user email
      setUserEmail(newEmail);

      setTimeout(() => {
        setSecurityPanel(null);
        toast({
          title: 'Succès',
          description: 'Votre adresse email a été modifiée avec succès.',
        });
      }, 1500);
    } catch (error: any) {
      console.error('Email confirmation error:', error);
      const errorMsg = error?.message || '';
      let displayError = 'Code de vérification invalide ou expiré';

      if (errorMsg.includes('expired')) {
        displayError = 'Le code a expiré. Veuillez demander un nouveau code.';
      }

      setChangeEmailState(prev => ({ ...prev, error: displayError, loading: false }));
      toast({
        title: 'Erreur',
        description: displayError,
        variant: 'destructive',
      });
    }
  };

  // Handle account deactivation
  const handleDeactivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteState.confirmation !== 'SUPPRIMER') {
      setDeleteState(prev => ({ ...prev, error: 'Veuillez taper SUPPRIMER pour confirmer' }));
      return;
    }

    setDeleteState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      await accountService.deactivateAccount({
        password: deleteState.password,
        confirmation: deleteState.confirmation,
      });

      toast({
        title: 'Succès',
        description: 'Votre compte sera supprimé dans 7 jours.',
      });

      // Close modal and refresh
      setDeleteModal(false);
      setDeleteState({ password: '', confirmation: '', loading: false, error: '' });

      // Refresh to show countdown banner
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error('Account deactivation error:', error);
      const errorMsg = error?.message || '';
      let displayError = 'Impossible de désactiver le compte';

      if (errorMsg.includes('mot de passe') || errorMsg.includes('incorrect')) {
        displayError = 'Le mot de passe est incorrect';
      }

      setDeleteState(prev => ({ ...prev, error: displayError, loading: false }));
      toast({
        title: 'Erreur',
        description: displayError,
        variant: 'destructive',
      });
    }
  };

  // Handle cancel deactivation
  const handleCancelDeactivation = async () => {
    try {
      await accountService.cancelDeactivation();
      toast({
        title: 'Succès',
        description: 'Suppression de votre compte annulée.',
      });
      setDeactivationCountdown(null);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      console.error('Cancel deactivation error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'annuler la suppression. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  // Handle data export
  const handleExportData = async () => {
    try {
      const data = await accountService.exportMyData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mes-donnees-afterimmo.json';
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Succès',
        description: 'Vos données ont été exportées avec succès.',
      });
    } catch (error: any) {
      console.error('Data export error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'exporter vos données. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <div className="hidden lg:block lg:w-64 xl:w-72 p-4 lg:p-6">
          <div className="sticky top-6 h-[calc(100vh-48px)]">
            <Sidebar />
          </div>
        </div>

        {/* Contenu principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-6">Paramètres</h1>

          <div className="max-w-3xl">
            {/* Deactivation countdown banner */}
            {deactivationCountdown !== null && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-200">
                    Votre compte est en cours de suppression
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    Il sera supprimé définitivement dans {deactivationCountdown} jours.
                  </p>
                  <button
                    onClick={handleCancelDeactivation}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors"
                  >
                    Annuler la suppression
                  </button>
                </div>
              </div>
            )}

            {/* ---- Compte ---- */}
            <SectionCard title="Compte" icon={<User className="w-5 h-5" />}>
              <SettingRow label="Langue" description="Langue de l'interface">
                <select className="px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-coral-500">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </SettingRow>

              <SettingRow
                label="Fuseau horaire"
                description="Définir le fuseau horaire de votre compte"
              >
                <select className="px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-coral-500">
                  <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                  <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
                  <option value="America/New_York">America/New York (GMT-5)</option>
                </select>
              </SettingRow>

              <SettingRow label="Devise" description="Devise par défaut pour les projets">
                <select
                  value={preferredCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-coral-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="XOF">XOF (FCFA)</option>
                </select>
              </SettingRow>
            </SectionCard>

            {/* ---- Notifications ---- */}
            <SectionCard
              title="Notifications"
              icon={<Bell className="w-5 h-5" />}
            >
              <SettingRow
                label="Notifications par email"
                description="Recevoir les alertes par email"
              >
                <Toggle
                  enabled={notificationPrefs.email}
                  onToggle={() => !updateClientProfile.isLoading && handleNotificationToggle("email")}
                />
              </SettingRow>

              <SettingRow
                label="Notifications push"
                description="Recevoir les notifications par WhatsApp"
              >
                <Toggle
                  enabled={notificationPrefs.whatsapp}
                  onToggle={() => !updateClientProfile.isLoading && handleNotificationToggle("whatsapp")}
                />
              </SettingRow>

              <SettingRow
                label="Nouveaux leads"
                description="Être notifié lors d'un nouveau lead"
              >
                <Toggle
                  enabled={notificationPrefs.newLeads}
                  onToggle={() => !updateClientProfile.isLoading && handleNotificationToggle("newLeads")}
                />
              </SettingRow>

              <SettingRow
                label="Mises à jour projets"
                description="Être notifié des changements sur vos projets"
              >
                <Toggle
                  enabled={notificationPrefs.projectUpdates}
                  onToggle={() => !updateClientProfile.isLoading && handleNotificationToggle("projectUpdates")}
                />
              </SettingRow>
            </SectionCard>

            {/* ---- Sécurité ---- */}
            <SectionCard
              title="Sécurité"
              icon={<Shield className="w-5 h-5" />}
            >
              {/* Email row */}
              <SettingRow
                label="Adresse email"
                description={userEmail}
              >
                <button
                  onClick={() => {
                    setSecurityPanel(securityPanel === 'email' ? null : 'email');
                    setChangeEmailState({
                      newEmail: '',
                      password: '',
                      code: '',
                      step: 0,
                      loading: false,
                      error: '',
                      success: false,
                    });
                  }}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-600 text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Modifier
                  <ChevronRight className="w-4 h-4" />
                </button>
              </SettingRow>

              {/* Email change inline form */}
              {securityPanel === 'email' && (
                <div className="bg-slate-50 dark:bg-gray-700/50 rounded-lg p-4 my-4">
                  <form onSubmit={changeEmailState.step === 0 ? handleRequestChangeEmail : handleConfirmChangeEmail} className="space-y-4">
                    {changeEmailState.error && (
                      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-xs">
                        {changeEmailState.error}
                      </div>
                    )}

                    {changeEmailState.step === 0 ? (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-2">
                            Nouvelle adresse email
                          </label>
                          <input
                            type="email"
                            placeholder="nouvelle@exemple.com"
                            value={changeEmailState.newEmail}
                            onChange={(e) => setChangeEmailState(prev => ({ ...prev, newEmail: e.target.value }))}
                            disabled={changeEmailState.loading}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-coral-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-2">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={changeEmailState.password}
                            onChange={(e) => setChangeEmailState(prev => ({ ...prev, password: e.target.value }))}
                            disabled={changeEmailState.loading}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-coral-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={changeEmailState.loading || !changeEmailState.newEmail || !changeEmailState.password}
                          className="w-full px-4 py-2 rounded-lg bg-coral-500 text-white text-sm font-medium hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {changeEmailState.loading ? 'Envoi en cours...' : 'Envoyer le code'}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-slate-600 dark:text-gray-400">
                          Code de vérification envoyé à <strong>{changeEmailState.newEmail}</strong>
                        </p>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-2">
                            Code de vérification (6 chiffres)
                          </label>
                          <input
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={changeEmailState.code}
                            onChange={(e) => setChangeEmailState(prev => ({ ...prev, code: e.target.value.replace(/\D/g, '') }))}
                            disabled={changeEmailState.loading}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-coral-500 text-center font-mono"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={changeEmailState.loading || changeEmailState.code.length !== 6}
                          className="w-full px-4 py-2 rounded-lg bg-coral-500 text-white text-sm font-medium hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {changeEmailState.loading ? 'Vérification...' : 'Confirmer'}
                        </button>
                      </>
                    )}
                  </form>
                </div>
              )}

              {/* Password row */}
              <SettingRow
                label="Mot de passe"
                description="Dernière modification il y a 3 mois"
              >
                <button
                  onClick={() => {
                    setSecurityPanel(securityPanel === 'password' ? null : 'password');
                    setChangePasswordState({
                      current: '',
                      next: '',
                      confirm: '',
                      loading: false,
                      error: '',
                      success: false,
                    });
                  }}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-600 text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Modifier
                  <ChevronRight className="w-4 h-4" />
                </button>
              </SettingRow>

              {/* Password change inline form */}
              {securityPanel === 'password' && (
                <div className="bg-slate-50 dark:bg-gray-700/50 rounded-lg p-4 my-4">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {changePasswordState.error && (
                      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-xs">
                        {changePasswordState.error}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-2">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={changePasswordState.current}
                        onChange={(e) => setChangePasswordState(prev => ({ ...prev, current: e.target.value }))}
                        disabled={changePasswordState.loading}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-coral-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={changePasswordState.next}
                        onChange={(e) => setChangePasswordState(prev => ({ ...prev, next: e.target.value }))}
                        disabled={changePasswordState.loading}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-coral-500"
                      />

                      {changePasswordState.next && (
                        <div className="mt-3 space-y-2">
                          <div className="flex gap-1">
                            {[
                              { met: passwordStrength.hasMinLength, label: '8+ caractères' },
                              { met: passwordStrength.hasUppercase, label: '1 majuscule' },
                              { met: passwordStrength.hasLowercase, label: '1 minuscule' },
                              { met: passwordStrength.hasNumber, label: '1 chiffre' },
                            ].map((req, idx) => (
                              <div
                                key={idx}
                                className={`flex-1 h-1 rounded-full transition-colors ${
                                  req.met ? 'bg-green-500' : 'bg-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs text-slate-600 dark:text-gray-400">
                            <div className={passwordStrength.hasMinLength ? 'text-green-600 dark:text-green-400' : ''}>
                              ✓ 8+ caractères
                            </div>
                            <div className={passwordStrength.hasUppercase ? 'text-green-600 dark:text-green-400' : ''}>
                              ✓ 1 majuscule
                            </div>
                            <div className={passwordStrength.hasLowercase ? 'text-green-600 dark:text-green-400' : ''}>
                              ✓ 1 minuscule
                            </div>
                            <div className={passwordStrength.hasNumber ? 'text-green-600 dark:text-green-400' : ''}>
                              ✓ 1 chiffre
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={changePasswordState.confirm}
                        onChange={(e) => setChangePasswordState(prev => ({ ...prev, confirm: e.target.value }))}
                        disabled={changePasswordState.loading}
                        className={`w-full px-3 py-2 rounded-lg border text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all bg-white dark:bg-gray-700 ${
                          passwordMismatch
                            ? 'border-red-300 dark:border-red-700 focus:ring-red-500'
                            : 'border-slate-200 dark:border-gray-600 focus:ring-coral-500'
                        }`}
                      />
                      {passwordMismatch && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">Les mots de passe ne correspondent pas</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={changePasswordState.loading || !isPasswordValid || passwordMismatch || !changePasswordState.current}
                      className="w-full px-4 py-2 rounded-lg bg-coral-500 text-white text-sm font-medium hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {changePasswordState.loading ? 'Modification en cours...' : 'Mettre à jour le mot de passe'}
                    </button>
                  </form>
                </div>
              )}

              {/* 2FA row */}
              <SettingRow
                label="Authentification à deux facteurs"
                description="Sécurisez votre compte avec la 2FA"
              >
                <Toggle enabled={false} disabled={true} />
              </SettingRow>

              {/* Sessions row */}
              <SettingRow
                label="Sessions actives"
                description="Gérer les appareils connectés"
              >
                <button className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-600 text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                  Voir
                  <ChevronRight className="w-4 h-4" />
                </button>
              </SettingRow>
            </SectionCard>

            {/* ---- Apparence ---- */}
            <SectionCard
              title="Apparence"
              icon={<Moon className="w-5 h-5" />}
            >
              <SettingRow
                label="Mode sombre"
                description="Activer le thème sombre"
              >
                <Toggle enabled={isDark} onToggle={toggleTheme} />
              </SettingRow>
            </SectionCard>

            {/* ---- Devenir Promoteur ---- */}
            {!promoteurStatus?.isPromoteur && (
              <div className="bg-gradient-to-r from-coral-500 to-amber-500 rounded-xl shadow-sm p-6 mb-6 text-white transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white/20">
                    <Crown className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold">Devenir Promoteur</h2>
                </div>
                <p className="text-sm text-coral-100 mb-4">
                  Passez au niveau supérieur ! Publiez vos projets immobiliers, recevez des leads qualifiés
                  et développez votre activité sur notre plateforme.
                </p>
                <Link
                  to="/devenir-promoteur"
                  className="inline-flex items-center gap-2 bg-white text-coral-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-coral-50 transition-colors text-sm"
                >
                  <Crown className="w-4 h-4" />
                  Devenir Promoteur
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {promoteurStatus?.isPromoteur && (
              <SectionCard title="Compte Promoteur" icon={<Crown className="w-5 h-5" />}>
                <SettingRow
                  label="Statut Promoteur"
                  description={`Organisation : ${promoteurStatus.promoteur?.organizationName || '–'}`}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Actif
                  </span>
                </SettingRow>
                <SettingRow
                  label="Espace promoteur"
                  description="Accéder à votre tableau de bord promoteur"
                >
                  <a
                    href={import.meta.env.VITE_PROMOTEUR_URL || "http://localhost:8081"}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-coral-500 text-white text-sm font-medium hover:bg-coral-600 transition-colors"
                  >
                    Ouvrir
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </SettingRow>
              </SectionCard>
            )}

            {/* ---- Zone sensible ---- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-6 border border-red-100 dark:border-red-900/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Zone sensible</h2>
              </div>

              <div className="space-y-4">
                {/* Export data row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-gray-100">Télécharger mes données</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                      Exportez vos données personnelles (conforme RGPD)
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-600 text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Exporter
                  </button>
                </div>

                {/* Deactivate account row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-gray-100">Désactiver mon compte</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                      Votre compte sera supprimé après une période de 7 jours
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteModal(true)}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Désactiver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete account confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-gray-100">
                Confirmer la désactivation
              </h3>
              <button
                onClick={() => setDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 text-xs text-blue-700 dark:text-blue-300">
              Votre compte sera supprimé dans 7 jours. Durant cette période, vous pouvez vous reconnecter pour annuler.
            </div>

            <form onSubmit={handleDeactivateAccount} className="space-y-4">
              {deleteState.error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-xs">
                  {deleteState.error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={deleteState.password}
                  onChange={(e) => setDeleteState(prev => ({ ...prev, password: e.target.value }))}
                  disabled={deleteState.loading}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-gray-300 mb-2">
                  Tapez SUPPRIMER pour confirmer
                </label>
                <input
                  type="text"
                  placeholder="SUPPRIMER"
                  value={deleteState.confirmation}
                  onChange={(e) => setDeleteState(prev => ({ ...prev, confirmation: e.target.value }))}
                  disabled={deleteState.loading}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-center"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-600 text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={deleteState.loading || deleteState.confirmation !== 'SUPPRIMER' || !deleteState.password}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteState.loading ? 'Suppression...' : 'Supprimer mon compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
