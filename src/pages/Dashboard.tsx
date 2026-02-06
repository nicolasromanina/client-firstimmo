import DashboardLayout from "@/components/layout/DashboardLayout";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import DocumentsCard from "@/components/dashboard/DocumentsCard";
import ConsultedProjects from "@/components/dashboard/ConsultedProjects";

/**
 * Dashboard Page (Tableau de bord)
 * Page d'accueil principale affichant:
 * - Carte profil utilisateur
 * - Documents récents
 * - Projets consultés
 */

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Section supérieure: Profil + Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserProfileCard />
          <DocumentsCard />
        </div>

        {/* Section Projets Consultés */}
        <ConsultedProjects />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
