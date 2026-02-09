import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
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
          <Route path="/profil" element={<Profile />} />
          
          {/* Modifier le profil - Formulaire d'édition */}
          <Route path="/profil/edit" element={<ProfileEdit />} />
          
          {/* Devenir Promoteur - Choix du plan */}
          <Route path="/devenir-promoteur" element={<BecomePromoteur />} />
          <Route path="/devenir-promoteur/success" element={<BecomePromoteur />} />
          
          {/* Devenir Promoteur - Page de paiement */}
          <Route path="/devenir-promoteur/paiement" element={<BecomePromoteurPayment />} />
          
          {/* Mes projets - Liste des projets */}
          <Route path="/projets" element={<Projects />} />
          
          {/* Documents - Liste des documents */}
          <Route path="/documents" element={<Documents />} />
          
          {/* Partenaires - Liste des partenaires */}
          <Route path="/partenaires" element={<Partners />} />
          
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
