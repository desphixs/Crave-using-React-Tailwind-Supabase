import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Utensils, Heart, Bookmark, MessageSquare, Edit3, Trash2, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DashboardStats {
    totalRecipes: number;
    totalLikes: number;
    totalSaves: number;
    totalComments: number;
}

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState<any[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalRecipes: 0,
        totalLikes: 0,
        totalSaves: 0,
        totalComments: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Fetch user's recipes along with counts for engagement
            const { data, error } = await supabase
                .from("recipes")
                .select(
                    `
                    *,
                    likes(count),
                    saved_recipes(count),
                    comments(count)
                `,
                )
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            const userRecipes = data || [];

            // Calculate totals
            const totals = userRecipes.reduce(
                (acc, recipe) => {
                    return {
                        totalRecipes: acc.totalRecipes + 1,
                        totalLikes: acc.totalLikes + (recipe.likes?.[0]?.count || 0),
                        totalSaves: acc.totalSaves + (recipe.saved_recipes?.[0]?.count || 0),
                        totalComments: acc.totalComments + (recipe.comments?.[0]?.count || 0),
                    };
                },
                { totalRecipes: 0, totalLikes: 0, totalSaves: 0, totalComments: 0 },
            );

            setRecipes(userRecipes);
            setStats(totals);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user?.id]);

    const handleDelete = async (recipeId: string, title: string) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`);

        if (!confirmed) return;

        try {
            const { error } = await supabase.from("recipes").delete().eq("id", recipeId);

            if (error) throw error;

            toast.success("Recipe deleted successfully");
            // Optimistically update the UI
            setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
            // Update counts
            setStats((prev) => ({ ...prev, totalRecipes: prev.totalRecipes - 1 }));
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete recipe");
        }
    };

    if (loading) {
        return (
            <div className="space-y-12 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-zinc-900 rounded-3xl border border-zinc-800" />
                    ))}
                </div>
                <div className="h-96 bg-zinc-900 rounded-[3rem] border border-zinc-800" />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
                    <p className="text-zinc-400 mt-1">Manage your recipes and track your growth.</p>
                </div>
                <Link to="/dashboard/add">
                    <Button className="h-12 px-6 rounded-2xl font-bold shadow-lg shadow-pink-600/20">
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Recipe
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Utensils className="text-pink-500" />} label="My Recipes" value={stats.totalRecipes} />
                <StatCard icon={<Heart className="text-rose-500" />} label="Total Likes" value={stats.totalLikes} />
                <StatCard icon={<Bookmark className="text-yellow-500" />} label="Total Saves" value={stats.totalSaves} />
                <StatCard icon={<MessageSquare className="text-blue-500" />} label="Total Comments" value={stats.totalComments} />
            </div>

            {/* My Recipes List */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Your Creations</h2>
                    <span className="text-sm text-zinc-500 font-medium">{recipes.length} published</span>
                </div>

                {recipes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {recipes.map((recipe) => (
                            <div key={recipe.id} className="group relative bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] overflow-hidden hover:border-zinc-700 transition-all duration-500">
                                {/* Image Container */}
                                <div className="aspect-video relative overflow-hidden">
                                    <img src={recipe.image_url || "/placeholder-recipe.jpg"} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />

                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white">{recipe.category}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white leading-tight line-clamp-1">{recipe.title}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-zinc-500 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Heart className="w-3 h-3" />
                                                <span>{recipe.likes?.[0]?.count || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Bookmark className="w-3 h-3" />
                                                <span>{recipe.saved_recipes?.[0]?.count || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-800/50">
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/edit/${recipe.id}`)} className="flex-1 rounded-xl h-10 border-zinc-800 hover:bg-zinc-800 hover:text-white">
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => handleDelete(recipe.id, recipe.title)} className="rounded-xl h-10 w-10 p-0 border-zinc-800 hover:bg-rose-500/10 hover:border-rose-500/50 hover:text-rose-500">
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
                        <Link to="/dashboard/add">
                            <Button className="rounded-xl px-8 h-12 font-bold">Create Your First Recipe</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
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

export default DashboardPage;
