import React, { useState, useEffect } from "react";
import { MOCK_RECIPES } from "./mockData";
import { StaticNavbar, StaticRecipeCard } from "./StaticComponents";
import { Utensils, Loader2, Search, Heart, Bookmark, Clock, Mail, Lock, Plus, ArrowRight, ArrowLeft, Edit3, Trash2, ClipboardList, Type, Hash, Image as ImageIcon, UtensilsCrossed, User, Send, Calendar, MessageSquare, PlusCircle, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const StaticApp = () => {
    // --- STATE ---
    const [view, setView] = useState("home"); // home, auth, detail, dashboard, recipe-box, add, edit
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("crave_demo_user");
        return saved ? JSON.parse(saved) : null;
    });
    const [recipes, setRecipes] = useState(() => {
        const saved = localStorage.getItem("crave_demo_recipes");
        if (!saved) return MOCK_RECIPES;
        
        const localRecipes = JSON.parse(saved);
        // Merge: Use local version if it exists (to keep likes/saves), 
        // but add any new ones from MOCK_RECIPES that aren't in local storage yet.
        const merged = [...localRecipes];
        MOCK_RECIPES.forEach(mock => {
            if (!merged.some(m => m.id === mock.id)) {
                merged.push(mock);
            }
        });
        return merged;
    });
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem("crave_demo_recipes", JSON.stringify(recipes));
    }, [recipes]);

    useEffect(() => {
        localStorage.setItem("crave_demo_user", JSON.stringify(user));
    }, [user]);

    // --- ACTIONS ---
    const navigateTo = (newView: string, data: any = null) => {
        if (data) setSelectedRecipe(data);
        setView(newView);
        window.scrollTo(0, 0);
    };

    const handleLogin = (email: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setUser({ email, id: "demo-user" });
            setView("home");
            setIsLoading(false);
            toast.success("Welcome back!");
        }, 800);
    };

    const handleSignOut = () => {
        setUser(null);
        setView("home");
        toast.info("Signed out successfully");
    };

    const handleToggleLike = (id: string) => {
        if (!user) {
            toast.error("Sign in to like recipes!");
            setView("auth");
            return;
        }
        setRecipes(
            recipes.map((r) => {
                if (r.id === id) {
                    const newHasLiked = !r.has_liked;
                    return {
                        ...r,
                        has_liked: newHasLiked,
                        like_count: newHasLiked ? r.like_count + 1 : r.like_count - 1,
                    };
                }
                return r;
            }),
        );
    };

    const handleToggleSave = (id: string) => {
        if (!user) {
            toast.error("Sign in to save recipes!");
            setView("auth");
            return;
        }
        setRecipes(
            recipes.map((r) => {
                if (r.id === id) {
                    const newIsSaved = !r.is_saved;
                    if (newIsSaved) toast.success("Saved to your Recipe Box!");
                    else toast.success("Removed from your Recipe Box");
                    return { ...r, is_saved: newIsSaved };
                }
                return r;
            }),
        );
    };

    const handleDeleteRecipe = (id: string) => {
        if (window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
            setRecipes(recipes.filter((r) => r.id !== id));
            toast.success("Recipe deleted successfully");
            setView("dashboard");
        }
    };

    // --- HELPER COMPONENTS FOR LAYOUT ---

    const StaticSidebar = ({ onNavigate, currentView }: any) => {
        const links = [
            { id: "dashboard", label: "Overview", icon: LayoutDashboard },
            { id: "add", label: "Add Recipe", icon: PlusCircle },
            { id: "recipe-box", label: "Recipe Box", icon: Bookmark },
        ];

        return (
            <aside className="w-64 bg-zinc-950 border-r border-zinc-800 h-[calc(100vh-80px)] sticky top-20 hidden lg:block">
                <div className="p-6 space-y-2">
                    {links.map((link) => (
                        <button key={link.id} onClick={() => onNavigate(link.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === link.id || (link.id === "dashboard" && (currentView === "dashboard" || currentView === "edit")) ? "bg-pink-600/10 text-pink-500 border border-pink-500/20" : "text-zinc-400 hover:text-white hover:bg-zinc-900"}`}>
                            <link.icon className="w-5 h-5" />
                            <span className="font-medium">{link.label}</span>
                        </button>
                    ))}
                </div>

            </aside>
        );
    };

    const StaticMobileDashboardNav = ({ onNavigate, currentView }: any) => {
        const links = [
            { id: "dashboard", label: "Overview", icon: LayoutDashboard },
            { id: "add", label: "Add Recipe", icon: PlusCircle },
            { id: "recipe-box", label: "Recipe Box", icon: Bookmark },
        ];

        return (
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-full px-4 py-2 shadow-2xl flex items-center space-x-2">
                    {links.map((link) => (
                        <button key={link.id} onClick={() => onNavigate(link.id)} className={`p-3 rounded-full transition-all duration-300 ${currentView === link.id || (link.id === "dashboard" && (currentView === "dashboard" || currentView === "edit")) ? "bg-pink-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]" : "text-zinc-400 hover:text-white"}`}>
                            <link.icon className="w-6 h-6" />
                            <span className="sr-only">{link.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const StaticDashboardLayout = ({ children, onNavigate, currentView }: any) => {
        return (
            <div className="flex w-full max-w-7xl mx-auto min-h-screen overflow-x-hidden">
                <StaticSidebar onNavigate={onNavigate} currentView={currentView} />
                <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8">
                    <div className="bg-zinc-900/30 rounded-3xl border border-zinc-800/50 p-6 md:p-8 min-h-full backdrop-blur-sm">{children}</div>
                </main>
                <StaticMobileDashboardNav onNavigate={onNavigate} currentView={currentView} />
            </div>
        );
    };

    // --- VIEWS ---

    const AuthView = () => {
        const [isLogin, setIsLogin] = useState(true);
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");

        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-pink-600 p-3 rounded-2xl mb-4 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                            <Utensils className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{isLogin ? "Welcome Back" : "Create Account"}</h1>
                        <p className="text-zinc-400 mt-2 text-center">{isLogin ? "Sign in to access your saved recipes and dashboard" : "Join Crave today and start sharing your amazing recipes"}</p>
                    </div>

                    <div className="flex bg-zinc-950 p-1.5 rounded-2xl mb-8 border border-zinc-800">
                        <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${isLogin ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}>
                            Sign In
                        </button>
                        <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${!isLogin ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"}`}>
                            Sign Up
                        </button>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin(email);
                        }}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-pink-500 transition-colors" />
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@example.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-pink-500 transition-colors" />
                                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all" />
                            </div>
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-transform">
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isLogin ? "Sign In" : "Create Account"}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-zinc-500 text-sm">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setIsLogin(!isLogin)} className="text-pink-500 font-semibold hover:underline">
                            {isLogin ? "Sign up" : "Sign in"}
                        </button>
                    </p>
                </div>
            </div>
        );
    };

    const HomeView = () => {
        const [searchQuery, setSearchQuery] = useState("");
        const [activeCategory, setActiveCategory] = useState("All");
        const categories = ["All", "Breakfast", "Lunch", "Dinner", "Vegan", "Dessert"];

        const filteredRecipes = recipes.filter((recipe) => {
            const matchesCategory = activeCategory === "All" || recipe.category === activeCategory;
            const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">
                <section className="text-center py-16 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600/10 border border-pink-500/20 text-pink-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                        <UtensilsCrossed className="w-3 h-3" />
                        Chef's Special
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
                        Discover <span className="text-transparent bg-clip-text bg-pink-500">Culinary</span> Magic
                    </h1>
                    <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">Join a community of home chefs sharing their best-kept secrets. Find inspiration for your next meal or share your own masterpiece.</p>

                    <div className="max-w-xl mx-auto space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-pink-500 transition-colors" />
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search recipes, ingredients, or chefs..." className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all backdrop-blur-sm" />
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {categories.map((category) => (
                                <button key={category} onClick={() => setActiveCategory(category)} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeCategory === category ? "bg-pink-600 text-white shadow-lg shadow-pink-600/20" : "bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"}`}>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">{activeCategory === "All" ? "Trending Now" : `${activeCategory} Recipes`}</h2>
                            <div className="h-1 w-12 bg-pink-600 mt-2 rounded-full" />
                        </div>
                        <button onClick={() => navigateTo("add")} className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl h-10 px-4 font-bold shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Recipe
                        </button>
                    </div>

                    {filteredRecipes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredRecipes.map((recipe) => (
                                <StaticRecipeCard key={recipe.id} recipe={recipe} onNavigate={navigateTo} onLike={handleToggleLike} onSave={handleToggleSave} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-800">
                            <div className="bg-zinc-900 p-6 rounded-3xl">
                                <Search className="w-12 h-12 text-zinc-700" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">No matches found</h3>
                                <p className="text-zinc-500 max-w-xs mx-auto">
                                    We couldn't find any recipes matching "{searchQuery}" in {activeCategory}. Try a different keyword!
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("");
                                    setActiveCategory("All");
                                }}
                                className="rounded-xl border-zinc-800 hover:bg-zinc-800"
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    )}
                </section>
            </div>
        );
    };

    const RecipeDetailView = () => {
        if (!selectedRecipe) return null;

        // Always get the latest data from the master recipes state
        const recipe = recipes.find((r) => r.id === selectedRecipe.id) || selectedRecipe;

        // --- COMMENT STATE (Static Demo) ---
        const [recipeComments, setRecipeComments] = useState<any[]>(() => {
            const allComments = JSON.parse(localStorage.getItem("crave_demo_comments") || "[]");
            return allComments.filter((c: any) => c.recipe_id === selectedRecipe.id);
        });
        const [newComment, setNewComment] = useState("");
        const [submitting, setSubmitting] = useState(false);

        const handleCommentSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!newComment.trim() || !user) return;

            setSubmitting(true);
            setTimeout(() => {
                const comment = {
                    id: Math.random().toString(36).substr(2, 9),
                    content: newComment.trim(),
                    recipe_id: selectedRecipe.id,
                    user_id: user.id,
                    created_at: new Date().toISOString(),
                };

                const allComments = JSON.parse(localStorage.getItem("crave_demo_comments") || "[]");
                const updatedComments = [...allComments, comment];
                localStorage.setItem("crave_demo_comments", JSON.stringify(updatedComments));

                setRecipeComments([...recipeComments, comment]);
                setNewComment("");
                setSubmitting(false);
                toast.success("Comment posted!");
            }, 600);
        };

        const formattedDate = new Date(recipe.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-12">
                <div className="flex items-center justify-between">
                    <button onClick={() => setView("home")} className="inline-flex items-center text-zinc-400 hover:text-pink-500 transition-colors font-medium text-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Feed
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
                    <div className="relative aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">{recipe.image_url ? <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-600 font-medium">No image provided</div>}</div>

                    <div className="flex flex-col justify-center space-y-10">
                        <div className="space-y-6">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-pink-600/10 text-xs font-bold uppercase tracking-widest text-pink-500 border border-pink-500/20">{recipe.category}</span>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">{recipe.title}</h1>

                            <div className="flex flex-wrap items-center gap-6 text-zinc-400 text-sm font-medium pt-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-pink-500" />
                                    <span>{formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-pink-500" />
                                    <span>45 mins cook time</span>
                                </div>
                            </div>
                        </div>

                        {recipe.description && <p className="text-lg text-zinc-300 leading-relaxed border-l-2 border-pink-500/50 pl-6 py-2">{recipe.description}</p>}

                        <div className="flex items-center gap-4 pt-6 border-t border-zinc-800/50">
                            <Button onClick={() => handleToggleLike(recipe.id)} className={`flex-1 h-16 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl ${recipe.has_liked ? "bg-pink-600 text-white shadow-pink-600/25 hover:bg-pink-700" : "bg-white text-zinc-950 hover:bg-zinc-200 hover:scale-[1.02]"}`}>
                                <Heart className={`w-6 h-6 mr-3 ${recipe.has_liked ? "fill-white" : ""}`} />
                                {recipe.has_liked ? "Loved It" : "Show some Love"}
                                <span className={`ml-3 px-3 py-1 rounded-full text-sm ${recipe.has_liked ? "bg-black/20" : "bg-zinc-200"}`}>{recipe.like_count}</span>
                            </Button>

                            <Button onClick={() => handleToggleSave(recipe.id)} variant="outline" className={`h-16 w-16 p-0 flex-shrink-0 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 ${recipe.is_saved ? "border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20" : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700"}`}>
                                <Bookmark className={`w-6 h-6 transition-colors ${recipe.is_saved ? "fill-yellow-500 text-yellow-500" : "text-zinc-400"}`} />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                            <ClipboardList className="w-6 h-6 text-pink-500" />
                            <h2 className="text-2xl font-bold text-white tracking-tight">Ingredients</h2>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                            <p className="text-zinc-300 leading-loose whitespace-pre-wrap">{recipe.ingredients || "No specific ingredients listed."}</p>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                            <Utensils className="w-6 h-6 text-pink-500" />
                            <h2 className="text-2xl font-bold text-white tracking-tight">Instructions</h2>
                        </div>
                        <div className="prose prose-invert prose-pink max-w-none">
                            <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">{recipe.instructions}</p>
                        </div>
                    </div>
                </div>

                {/* --- COMMENTS SECTION --- */}
                <div className="pt-12 space-y-10 border-t border-zinc-900">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-7 h-7 text-pink-500" />
                        <h2 className="text-3xl font-black text-white tracking-tight">
                            Comments <span className="text-pink-600 font-mono text-xl ml-1">({recipeComments.length})</span>
                        </h2>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] space-y-6">
                        {user ? (
                            <form onSubmit={handleCommentSubmit} className="space-y-4">
                                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="What do you think about this recipe?" rows={4} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all resize-none shadow-inner" />
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={submitting || !newComment.trim()} className="rounded-xl px-8 h-12 font-bold transition-transform active:scale-95 shadow-lg shadow-pink-600/10">
                                        {submitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" /> Post Comment
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="py-6 text-center space-y-4">
                                <p className="text-zinc-400 font-medium">Have something to say? Join the conversation.</p>
                                <button onClick={() => setView("auth")} className="rounded-xl border border-pink-500/20 text-pink-500 hover:bg-pink-600/10 px-8 py-3 text-sm font-bold transition-all">
                                    Sign in to leave a comment
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {recipeComments.length > 0 ? (
                            recipeComments.map((comment: any) => (
                                <div key={comment.id} className="flex gap-4 p-6 rounded-3xl bg-zinc-900/20 border border-zinc-900 transition-colors hover:border-zinc-800 group">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-pink-600/10 group-hover:text-pink-500 transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-zinc-300 leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-10 text-zinc-600 font-medium italic border border-dashed border-zinc-900 rounded-3xl">Be the first to leave a comment...</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const DashboardView = () => {
        const myRecipes = recipes.filter((r) => r.user_id === user?.id);
        const stats = {
            totalRecipes: myRecipes.length,
            totalLikes: myRecipes.reduce((acc, curr) => acc + curr.like_count, 0),
            totalSaves: recipes.filter((r) => r.is_saved).length,
            totalComments: 0,
        };

        const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2rem] space-y-4 hover:border-zinc-700 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800">{icon}</div>
                <div>
                    <p className="text-zinc-500 text-sm font-medium">{label}</p>
                    <p className="text-3xl font-black text-white mt-1">{value.toLocaleString()}</p>
                </div>
            </div>
        );

        return (
            <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
                        <p className="text-zinc-400 mt-1">Manage your recipes and track your growth.</p>
                    </div>
                    <button onClick={() => setView("add")} className="bg-pink-600 hover:bg-pink-700 text-white h-12 px-6 rounded-2xl font-bold shadow-lg shadow-pink-600/20 transition-all flex items-center">
                        <Plus className="w-5 h-5 mr-2" /> Create New Recipe
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<Utensils className="text-pink-500" />} label="My Recipes" value={stats.totalRecipes} />
                    <StatCard icon={<Heart className="text-rose-500" />} label="Total Likes" value={stats.totalLikes} />
                    <StatCard icon={<Bookmark className="text-yellow-500" />} label="Total Saves" value={stats.totalSaves} />
                    <StatCard icon={<MessageSquare className="text-blue-500" />} label="Total Comments" value={stats.totalComments} />
                </div>

                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Your Creations</h2>
                        <span className="text-sm text-zinc-500 font-medium">{myRecipes.length} published</span>
                    </div>

                    {myRecipes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {myRecipes.map((recipe) => (
                                <div key={recipe.id} className="group relative bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-zinc-700 transition-all duration-500">
                                    <div className="aspect-video relative overflow-hidden">
                                        <img src={recipe.image_url || "/placeholder-recipe.jpg"} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white">{recipe.category}</span>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white leading-tight line-clamp-1">{recipe.title}</h3>
                                            <div className="flex items-center gap-4 mt-2 text-zinc-500 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Heart className="w-3 h-3" />
                                                    <span>{recipe.like_count}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Bookmark className="w-3 h-3" />
                                                    <span>{recipe.is_saved ? 1 : 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
                                            <Button variant="outline" size="sm" onClick={() => navigateTo("edit", recipe)} className="flex-1 rounded-xl h-10 border-zinc-800 hover:bg-zinc-800 hover:text-white">
                                                <Edit3 className="w-4 h-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDeleteRecipe(recipe.id)} className="rounded-xl h-10 w-10 p-0 border-zinc-800 hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-500">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-800">
                            <div className="bg-zinc-900 p-6 rounded-3xl">
                                <Utensils className="w-12 h-12 text-zinc-700" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">You haven't shared any recipes yet</h3>
                                <p className="text-zinc-500 max-w-xs mx-auto">Start your culinary journey and share your first masterpiece with the world!</p>
                            </div>
                            <Button onClick={() => setView("add")} className="rounded-xl px-8 h-12 font-bold">
                                Create Your First Recipe
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const RecipeBoxView = () => {
        const savedRecipes = recipes.filter((r) => r.is_saved);
        return (
            <div className="max-w-7xl mx-auto px-4 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-pink-600/10 flex items-center justify-center border border-pink-500/20">
                                <Bookmark className="w-6 h-6 text-pink-500" />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Recipe Box</h1>
                        </div>
                        <p className="text-zinc-400 text-lg">Your curated collection of kitchen inspiration.</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-3">
                        <span className="text-zinc-500 text-sm font-medium">Total Saved: </span>
                        <span className="text-white font-bold ml-1">{savedRecipes.length}</span>
                    </div>
                </div>

                {savedRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {savedRecipes.map((recipe) => (
                            <StaticRecipeCard key={recipe.id} recipe={recipe} onNavigate={navigateTo} onLike={handleToggleLike} onSave={handleToggleSave} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-800">
                        <div className="relative">
                            <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800">
                                <UtensilsCrossed className="w-16 h-16 text-zinc-700" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-pink-600 p-2 rounded-full shadow-lg shadow-pink-600/20">
                                <PlusCircle className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="space-y-2 max-w-sm">
                            <h3 className="text-2xl font-bold text-white">Your cookbook is empty</h3>
                            <p className="text-zinc-500">You haven't saved any recipes yet. Explore the feed and bookmark the ones that catch your eye!</p>
                        </div>
                        <Button onClick={() => setView("home")} className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-pink-600/20">
                            Explore Recipes <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const AddEditView = ({ isEdit = false }) => {
        const [formData, setFormData] = useState(isEdit ? selectedRecipe : { title: "", description: "", image_url: "", category: "", ingredients: "", instructions: "" });
        const cats = ["Breakfast", "Lunch", "Dinner", "Vegan", "Dessert", "Snack", "Drink"];

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            setIsLoading(true);
            setTimeout(() => {
                if (isEdit) {
                    setRecipes(recipes.map((r) => (r.id === formData.id ? formData : r)));
                    toast.success("Recipe updated successfully!");
                } else {
                    const newRecipe = { ...formData, id: Math.random().toString(36).substr(2, 9), user_id: user?.id, created_at: new Date().toISOString(), like_count: 0, has_liked: false, is_saved: false };
                    setRecipes([newRecipe, ...recipes]);
                    toast.success("Recipe published successfully!");
                }
                setView("dashboard");
                setIsLoading(false);
            }, 600);
        };

        return (
            <div className="max-w-4xl mx-auto px-4 pb-20">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <Utensils className="w-10 h-10 text-pink-600" />
                        {isEdit ? "Update Recipe" : "Publish New Recipe"}
                    </h1>
                    <p className="text-zinc-400 mt-2 text-lg">Fill out the details below to share your culinary masterpiece with the community.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                <Type className="w-4 h-4 text-pink-500" /> Recipe Title *
                            </label>
                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="e.g., Midnight Pasta Carbonara" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all shadow-inner" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                <Hash className="w-4 h-4 text-pink-500" /> Category *
                            </label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all appearance-none cursor-pointer">
                                <option value="" disabled className="bg-zinc-900">
                                    Select a category
                                </option>
                                {cats.map((c) => (
                                    <option key={c} value={c} className="bg-zinc-900">
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-pink-500" /> Image URL
                        </label>
                        <input type="text" value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://images.unsplash.com/your-food-photo" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300">Short Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Tell the story behind this dish..." rows={3} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all shadow-inner resize-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-pink-500" /> Ingredients
                        </label>
                        <textarea value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })} placeholder="List your ingredients here, one per line..." rows={5} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-pink-500" /> Cooking Instructions *
                        </label>
                        <textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} required placeholder="Describe the steps to prepare this dish..." rows={8} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all shadow-inner" />
                    </div>
                    <div className="flex items-center justify-end gap-4 pt-6">
                        <Button type="button" variant="outline" onClick={() => setView("dashboard")} className="rounded-xl px-8">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="rounded-xl px-12 h-12 font-bold active:scale-[0.98] transition-transform">
                            {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : isEdit ? "Update Recipe" : "Publish Recipe"}
                        </Button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-black font-sans text-zinc-300 selection:bg-pink-600/30">
            <StaticNavbar user={user} onSignOut={handleSignOut} onNavigate={navigateTo} currentView={view} />
            <main className="py-8">
                {view === "home" && <HomeView />}
                {view === "auth" && <AuthView />}
                {view === "detail" && <RecipeDetailView />}

                {/* Wrapped Dashboard Views */}
                {view === "dashboard" &&
                    (user ? (
                        <StaticDashboardLayout onNavigate={navigateTo} currentView={view}>
                            <DashboardView />
                        </StaticDashboardLayout>
                    ) : (
                        <AuthView />
                    ))}

                {view === "recipe-box" &&
                    (user ? (
                        <RecipeBoxView />
                    ) : (
                        <AuthView />
                    ))}

                {view === "add" &&
                    (user ? (
                        <StaticDashboardLayout onNavigate={navigateTo} currentView={view}>
                            <AddEditView />
                        </StaticDashboardLayout>
                    ) : (
                        <AuthView />
                    ))}

                {view === "edit" &&
                    (user ? (
                        <StaticDashboardLayout onNavigate={navigateTo} currentView={view}>
                            <AddEditView isEdit />
                        </StaticDashboardLayout>
                    ) : (
                        <AuthView />
                    ))}
            </main>
        </div>
    );
};

export default StaticApp;
