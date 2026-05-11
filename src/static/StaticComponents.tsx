import React from "react";
import { Utensils, LogIn, Menu, LayoutDashboard, Bookmark, Search, LogOut, User, Heart, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- STATIC NAVBAR ---
export const StaticNavbar = ({ user, onSignOut, onNavigate, currentView }: any) => {
    const navLinks = [
        { id: "home", label: "Explore", icon: Search },
        { id: "recipe-box", label: "Recipe Box", icon: Bookmark },
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ];

    return (
        <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <div onClick={() => onNavigate("home")} className="flex items-center space-x-2 group cursor-pointer">
                        <div className="bg-pink-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                            <Utensils className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
                            Crave
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => onNavigate(link.id)}
                                className={`text-sm font-medium transition-colors ${currentView === link.id ? "text-pink-500" : "text-zinc-400 hover:text-white"}`}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>

                    {/* Auth */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <div className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
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
                                    onClick={onSignOut}
                                    className="text-zinc-400 hover:text-red-400"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onNavigate("auth")}
                                className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all duration-300 text-sm font-semibold"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

// --- STATIC RECIPE CARD ---
export const StaticRecipeCard = ({ recipe, onLike, onSave, onNavigate }: any) => {
    return (
        <div 
            onClick={() => onNavigate("detail", recipe)}
            className="group block relative cursor-pointer"
        >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:border-pink-500/30 hover:shadow-[0_20px_50px_rgba(236,72,153,0.1)] group-hover:-translate-y-2">
                
                {recipe.image_url ? (
                    <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                        <Utensils className="h-12 w-12 text-zinc-700" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />

                <div className="absolute top-5 right-5 z-20 flex flex-col gap-2.5">
                    <button
                        onClick={(e) => { e.stopPropagation(); onLike(recipe.id); }}
                        className="w-11 h-11 flex flex-col items-center justify-center rounded-[1rem] bg-black/20 backdrop-blur-xl border border-white/10 text-white transition-all hover:scale-110 active:scale-95 group/btn"
                    >
                        <Heart 
                            className={`w-5 h-5 transition-all duration-300 ${recipe.has_liked ? "fill-pink-500 text-pink-500 scale-110" : "text-white group-hover/btn:text-pink-400"}`} 
                        />
                        {recipe.like_count > 0 && (
                            <span className="text-[9px] font-black font-mono leading-none tracking-tighter mt-0.5">
                                {recipe.like_count}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onSave(recipe.id); }}
                        className="w-11 h-11 flex items-center justify-center rounded-[1rem] bg-black/20 backdrop-blur-xl border border-white/10 text-white transition-all hover:scale-110 active:scale-95 group/save"
                    >
                        <Bookmark 
                            className={`w-5 h-5 transition-all duration-300 ${recipe.is_saved ? "fill-yellow-500 text-yellow-500 scale-110" : "text-white group-hover/save:text-yellow-400"}`} 
                        />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-pink-600/90 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                            {recipe.category}
                        </span>
                    </div>

                    <h3 className="text-2xl font-black text-white leading-tight tracking-tight group-hover:text-pink-400 transition-colors">
                        {recipe.title}
                    </h3>

                    <div className="flex items-center gap-4 text-zinc-400 text-xs font-medium pt-2">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-pink-500" />
                            <span>45m prep</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
