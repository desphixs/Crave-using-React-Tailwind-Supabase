import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Bookmark, Search, UtensilsCrossed, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import RecipeCard from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const RecipeBoxPage = () => {
    const { user } = useAuth();
    const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSavedRecipes = async () => {
        if (!user) return;

        try {
            setLoading(true);
            /**
             * We query the 'saved_recipes' table and join it with 'recipes'.
             * We also need engagement counts for each recipe so the RecipeCard 
             * displays correctly (like counts, and ensuring the bookmark icon is filled).
             */
            const { data, error } = await supabase
                .from("saved_recipes")
                .select(`
                    id,
                    recipes (
                        *,
                        likes:likes(user_id),
                        saved_recipes:saved_recipes(user_id)
                    )
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Flatten the data: extract the nested recipe objects and add engagement flags
            const flattened = (data || []).map((item: any) => {
                const recipe = item.recipes;
                return {
                    ...recipe,
                    like_count: recipe.likes?.length || 0,
                    has_liked: recipe.likes?.some((l: any) => l.user_id === user.id) || false,
                    is_saved: true, // By definition, if it's in this list, it's saved
                };
            });

            setSavedRecipes(flattened);
        } catch (error) {
            console.error("Error fetching saved recipes:", error);
            toast.error("Failed to load your recipe box");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedRecipes();
    }, [user?.id]);

    const handleUnsave = async (recipeId: string) => {
        try {
            // Delete from database
            const { error } = await supabase
                .from("saved_recipes")
                .delete()
                .eq("user_id", user?.id)
                .eq("recipe_id", recipeId);

            if (error) throw error;

            // Optimistic Update: Remove from local state immediately
            setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
            toast.success("Removed from your Recipe Box");
        } catch (error) {
            console.error("Unsave error:", error);
            toast.error("Failed to unsave recipe");
        }
    };

    const handleLike = async (recipeId: string, hasLiked: boolean) => {
        try {
            if (hasLiked) {
                await supabase.from("likes").delete().eq("user_id", user?.id).eq("recipe_id", recipeId);
            } else {
                await supabase.from("likes").insert({ user_id: user?.id, recipe_id: recipeId });
            }

            // Update local state to toggle like icon and count
            setSavedRecipes(prev => prev.map(r => {
                if (r.id === recipeId) {
                    return {
                        ...r,
                        has_liked: !hasLiked,
                        like_count: hasLiked ? r.like_count - 1 : r.like_count + 1
                    };
                }
                return r;
            }));
        } catch (error) {
            console.error("Like error:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
                <p className="text-zinc-400 font-medium">Opening your Recipe Box...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20">
            {/* Header */}
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

            {/* Content Grid */}
            {savedRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {savedRecipes.map((recipe) => (
                        <RecipeCard 
                            key={recipe.id} 
                            recipe={recipe} 
                            likeCount={recipe.like_count}
                            hasLiked={recipe.has_liked}
                            isSaved={recipe.is_saved}
                            onLike={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleLike(recipe.id, recipe.has_liked);
                            }}
                            onSave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUnsave(recipe.id);
                            }}
                        />
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

                    <Link to="/">
                        <Button className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-pink-600/20">
                            Explore Recipes
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};

// Helper import for the empty state
import { PlusCircle } from "lucide-react";

export default RecipeBoxPage;
