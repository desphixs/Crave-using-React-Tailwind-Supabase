/**
 * HomePage.tsx
 * The main discovery feed of the application.
 * Fetches all recipes from Supabase and displays them in a responsive grid with Like functionality.
 */

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Recipe } from "@/types";
import RecipeCard from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Define a local type that includes like data for our internal state.
interface RecipeWithLikes extends Recipe {
    like_count: number;
    has_liked: boolean;
}

const HomePage = () => {
    // Access the current user to see if they've liked any of these recipes.
    const { user } = useAuth();
    const navigate = useNavigate();

    // Memory to hold our enhanced recipe list.
    const [recipes, setRecipes] = useState<RecipeWithLikes[]>([]);
    // Global loading state.
    const [loading, setLoading] = useState(true);

    /**
     * fetchRecipes: Grabs all recipes and their associated like counts.
     */
    const fetchRecipes = async () => {
        try {
            setLoading(true);

            // Fetch recipes and all associated likes in one go using Supabase's powerful nesting.
            // 'likes(user_id)' tells Supabase to join the likes table for each recipe.
            const { data, error } = await supabase
                .from("recipes")
                .select("*, likes:likes(user_id)")
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Process the data to calculate counts and check if the current user has liked each one.
            const processedRecipes = (data || []).map((recipe: any) => ({
                ...recipe,
                // The total number of likes is just the length of the likes array returned by Supabase.
                like_count: recipe.likes?.length || 0,
                // We check if the current user's ID exists anywhere in that likes array.
                has_liked: recipe.likes?.some((l: any) => l.user_id === user?.id) || false,
            }));

            setRecipes(processedRecipes);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when the component mounts or when the user changes (log in/out).
    useEffect(() => {
        fetchRecipes();
    }, [user?.id]);

    /**
     * handleLike: Toggles the like status for a recipe directly from the home feed.
     */
    const handleLike = async (recipeId: string, hasLiked: boolean) => {
        // If they aren't logged in, they can't like things. Send them to login.
        if (!user) {
            toast.error("Sign in to like recipes!");
            navigate("/login");
            return;
        }

        // OPTIMISTIC UPDATE:
        // We update the UI immediately before the database responds to make the app feel "instant".
        setRecipes(prev => prev.map(r => {
            if (r.id === recipeId) {
                return {
                    ...r,
                    has_liked: !hasLiked,
                    like_count: hasLiked ? r.like_count - 1 : r.like_count + 1
                };
            }
            return r;
        }));

        try {
            if (hasLiked) {
                // If they already liked it, we remove the row from the 'likes' table.
                await supabase.from("likes").delete().eq("recipe_id", recipeId).eq("user_id", user.id);
            } else {
                // If they haven't liked it, we insert a new row.
                await supabase.from("likes").insert({ recipe_id: recipeId, user_id: user.id });
            }
        } catch (error) {
            // If the database call fails, we should technically revert the UI, 
            // but for now we'll just log it and maybe show a toast.
            console.error("Like error:", error);
            toast.error("Something went wrong with that like.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">
            {/* Hero Section */}
            <section className="text-center py-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600/10 border border-pink-500/20 text-pink-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                    <UtensilsCrossed className="w-3 h-3" />
                    Chef's Special
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
                    Discover <span className="text-transparent bg-clip-text bg-pink-500">Culinary</span> Magic
                </h1>
                <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">Join a community of home chefs sharing their best-kept secrets. Find inspiration for your next meal or share your own masterpiece.</p>

                <div className="max-w-xl mx-auto relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-pink-500 transition-colors" />
                    <input type="text" placeholder="Search recipes, ingredients, or chefs..." className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all backdrop-blur-sm" />
                </div>
            </section>

            {/* Feed Section */}
            <section>
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Trending Now</h2>
                        <div className="h-1 w-12 bg-pink-600 mt-2 rounded-full" />
                    </div>
                    <Link to="/dashboard/add">
                        <Button size="sm" className="rounded-xl h-10 px-4 font-bold shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Recipe
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="aspect-[4/5] rounded-3xl bg-zinc-900 border border-zinc-800 animate-pulse" />
                        ))}
                    </div>
                ) : recipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {recipes.map((recipe) => (
                            <RecipeCard 
                                key={recipe.id} 
                                recipe={recipe} 
                                likeCount={recipe.like_count}
                                hasLiked={recipe.has_liked}
                                // We stop the card's main 'Link' click from firing if they click exactly on the heart.
                                onLike={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleLike(recipe.id, recipe.has_liked);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-zinc-900/30 rounded-[3rem] border border-dashed border-zinc-800">
                        <div className="bg-zinc-900 p-6 rounded-3xl">
                            <UtensilsCrossed className="w-12 h-12 text-zinc-700" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">The kitchen is empty!</h3>
                            <p className="text-zinc-500 max-w-xs mx-auto">No recipes have been shared yet. Be the first to publish a masterpiece!</p>
                        </div>
                        <Link to="/dashboard/add">
                            <Button variant="outline" className="rounded-xl border-zinc-800 hover:bg-zinc-800">
                                Share a Recipe
                            </Button>
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
};

export default HomePage;
