import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserImg from "@/assets/robert.png";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

/**
 * Bouton utilisateur avec dropdown
 * - Bouton corail/rouge avec avatar placeholder
 * - Menu déroulant : Profil, Paramètres, Se Déconnecter
 */
const UserDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : user?.email?.split('@')[0] ?? 'Mon compte';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#FB3816] text-white font-medium text-sm transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FB3816] focus:ring-offset-2 focus:ring-offset-gray-900">
          {/* Avatar image */}
          <img src={user?.avatar || UserImg} alt="User avatar" className="w-7 h-7 rounded-full object-cover" />
          
          {/* Texte */} 
          <span className="hidden sm:inline">{displayName}</span>
          
          {/* Chevron */}
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-gray-900 border border-gray-700 text-white rounded-xl shadow-xl"
        sideOffset={8}
      >
        <DropdownMenuItem onClick={() => navigate('/profile')} className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-white/10 focus:bg-white/10 rounded-lg mx-1 mt-1">
          <User className="w-4 h-4 text-gray-400" />
          <span>Profil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/parametres')} className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-white/10 focus:bg-white/10 rounded-lg mx-1">
          <Settings className="w-4 h-4 text-gray-400" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-700 my-1" />
        
        <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-red-500/20 focus:bg-red-500/20 text-red-400 rounded-lg mx-1 mb-1">
          <LogOut className="w-4 h-4" />
          <span>Se Déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
