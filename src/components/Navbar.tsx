import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Utensils, LogIn, Menu, LayoutDashboard, Bookmark, Search, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  const navLinks = [
    { to: "/", label: "Explore", icon: Search },
    { to: "/recipe-box", label: "Recipe Box", icon: Bookmark },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-pink-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
              <Utensils className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
              Crave
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink 
                key={link.to}
                to={link.to} 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors ${isActive ? 'text-pink-500' : 'text-zinc-400 hover:text-white'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Auth & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-zinc-300 truncate max-w-[120px]">
                    {user.email}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-zinc-400 hover:text-red-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="hidden sm:flex items-center space-x-2 px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all duration-300 text-sm font-semibold"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger render={<Button variant="ghost" size="icon" className="text-zinc-400" />}>
                  <Menu className="w-6 h-6" />
                </SheetTrigger>
                <SheetContent side="right" className="bg-zinc-950 border-zinc-800">
                  <SheetHeader className="mb-8">
                    <SheetTitle className="flex items-center space-x-2">
                      <div className="bg-pink-600 p-1.5 rounded-lg">
                        <Utensils className="text-white w-5 h-5" />
                      </div>
                      <span>Crave</span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 p-4 rounded-2xl transition-all ${
                            isActive 
                              ? 'bg-pink-600/10 text-pink-500 border border-pink-500/20' 
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                          }`
                        }
                      >
                        <link.icon className="w-5 h-5" />
                        <span className="font-semibold">{link.label}</span>
                      </NavLink>
                    ))}
                    
                    <hr className="border-zinc-800 my-2" />
                    
                    {user ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                          <User className="w-5 h-5 text-pink-500" />
                          <span className="text-sm font-medium truncate">{user.email}</span>
                        </div>
                        <button 
                          onClick={handleSignOut}
                          className="w-full flex items-center justify-center space-x-3 p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    ) : (
                      <Link 
                        to="/login"
                        className="flex items-center space-x-3 p-4 rounded-2xl bg-pink-600 text-white font-bold hover:bg-pink-700 transition-colors"
                      >
                        <LogIn className="w-5 h-5" />
                        <span>Sign In / Sign Up</span>
                      </Link>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
