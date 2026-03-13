import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Projects from "./pages/Projects";
import Documents from "./pages/Documents";
import Partners from "./pages/Partners";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import Settings from "./pages/Settings";
import BecomePromoteur from "./pages/BecomePromoteur";
import BecomePromoteurPayment from "./pages/BecomePromoteurPayment";
import Alerts from "./pages/Alerts";
import ProjectDetail from "./pages/ProjectDetail";
import Comparer from "./pages/Comparer";
import ComparisonDetail from "./pages/ComparisonDetail";
import AcceptInvitationRedirect from "./pages/AcceptInvitationRedirect";
import Calendar from "./pages/Calendar";
import Reviews from "./pages/Reviews";
import Upgrade from "./pages/Upgrade";
import Pricing from "./pages/Pricing";
import Brochures from "./pages/Brochures";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <Header />
        <Routes>
          {/* Dashboard - Page d'accueil */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Paramètres - Page de configuration */}
          <Route path="/parametres" element={<Settings />} />

          {/* Mon profil - Vue détaillée */}
          <Route path="/profile" element={<Profile />} />
          
          {/* Modifier le profil - Formulaire d'édition */}
          <Route path="/profil/edit" element={<ProfileEdit />} />
          
          {/* Devenir Promoteur - Choix du plan */}
          <Route path="/devenir-promoteur" element={<BecomePromoteur />} />
          <Route path="/devenir-promoteur/success" element={<BecomePromoteur />} />
          
          {/* Devenir Promoteur - Page de paiement */}
          <Route path="/devenir-promoteur/paiement" element={<BecomePromoteurPayment />} />
          
          {/* Mes projets - Liste des projets */}
          <Route path="/projets" element={<Projects />} />
          <Route path="/projets/:id" element={<ProjectDetail />} />
          <Route path="/comparer" element={<Comparer />} />
          <Route path="/comparaisons/:id" element={<ComparisonDetail />} />
          {/* Tarification */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/upgrade" element={<Upgrade />} />
          
          {/* Documents - Liste des documents */}
          <Route path="/documents" element={<Documents />} />

          {/* Brochures - Brochures envoyees par promoteurs */}
          <Route path="/brochures" element={<Brochures />} />
          
          {/* Premiums - Liste des partenaires */}
          <Route path="/partenaires" element={<Partners />} />
          
          {/* Page de messagerie client */}
          <Route path="/messages" element={<Messages />} />
          
          {/* Alertes */}
          <Route path="/alertes" element={<Alerts />} />

          {/* Rendez-vous */}
          <Route path="/rendez-vous" element={<Calendar />} />

          {/* Mes avis */}
          <Route path="/avis" element={<Reviews />} />

          {/* Bridge d'invitation d'equipe vers le dashboard promoteur */}
          <Route path="/accept-invitation/:token" element={<AcceptInvitationRedirect />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
