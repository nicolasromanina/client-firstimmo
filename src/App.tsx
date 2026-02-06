import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Projects from "./pages/Projects";
import Documents from "./pages/Documents";
import Partners from "./pages/Partners";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Dashboard - Page d'accueil */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Mon profil - Vue détaillée */}
          <Route path="/profil" element={<Profile />} />
          
          {/* Modifier le profil - Formulaire d'édition */}
          <Route path="/profil/edit" element={<ProfileEdit />} />
          
          {/* Mes projets - Liste des projets */}
          <Route path="/projets" element={<Projects />} />
          
          {/* Documents - Liste des documents */}
          <Route path="/documents" element={<Documents />} />
          
          {/* Partenaires - Liste des partenaires */}
          <Route path="/partenaires" element={<Partners />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
