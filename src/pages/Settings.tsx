import { Bell, Lock, Globe, User, Moon, Mail, Shield, ChevronRight, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { useTheme } from "@/hooks/use-theme";
import { usePromoteurStatus } from "@/hooks/useApi";

/**
 * Settings - Page Paramètres du dashboard promoteur
 *
 * Sections :
 * - Compte (langue, fuseau horaire)
 * - Notifications (email, push)
 * - Sécurité (mot de passe, 2FA)
 * - Apparence (thème) – connecté au ThemeProvider
 */

/* ---------- Toggle switch réutilisable ---------- */
const Toggle = ({
  enabled = false,
  onToggle,
}: {
  enabled?: boolean;
  onToggle?: () => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    onClick={onToggle}
    className={`
      relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
      border-2 border-transparent transition-colors duration-200 ease-in-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500
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
  const { data: promoteurStatus } = usePromoteurStatus();

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
                <select className="px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-sm text-slate-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-coral-500">
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="MAD">MAD (د.م.)</option>
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
                <Toggle enabled />
              </SettingRow>

              <SettingRow
                label="Notifications push"
                description="Recevoir les notifications dans le navigateur"
              >
                <Toggle enabled={false} />
              </SettingRow>

              <SettingRow
                label="Nouveaux leads"
                description="Être notifié lors d'un nouveau lead"
              >
                <Toggle enabled />
              </SettingRow>

              <SettingRow
                label="Mises à jour projets"
                description="Être notifié des changements sur vos projets"
              >
                <Toggle enabled />
              </SettingRow>
            </SectionCard>

            {/* ---- Sécurité ---- */}
            <SectionCard
              title="Sécurité"
              icon={<Shield className="w-5 h-5" />}
            >
              <SettingRow
                label="Mot de passe"
                description="Dernière modification il y a 3 mois"
              >
                <button className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-gray-600 text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                  Modifier
                  <ChevronRight className="w-4 h-4" />
                </button>
              </SettingRow>

              <SettingRow
                label="Authentification à deux facteurs"
                description="Sécurisez votre compte avec la 2FA"
              >
                <Toggle enabled={false} />
              </SettingRow>

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
                  description={`Organisation : ${promoteurStatus.promoteur?.organizationName || '—'}`}
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

            {/* ---- Zone danger ---- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 p-6 mb-6 border border-red-100 dark:border-red-900/30 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Zone sensible</h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-gray-100">Supprimer mon compte</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                    Cette action est irréversible. Toutes vos données seront supprimées.
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
