/**
 * HomePage.tsx
 * The main discovery feed of the application.
 * Fetches all recipes from Supabase and displays them in a responsive grid.
 */

// Import React core and hooks:
// 'useEffect' handles side effects (like data fetching),
// 'useState' manages local component data.
import React, { useEffect, useState } from "react";

// Import the pre-configured Supabase client from our library folder
// to interact with the backend database.
import { supabase } from "@/lib/supabase";

// Import the 'Recipe' TypeScript type to ensure our data matches
// the expected structure (id, title, ingredients, etc.).
import type { Recipe } from "@/types";

// Import our custom UI component used to render an individual
// recipe's information in a card format.
import RecipeCard from "@/components/RecipeCard";

// Import a reusable Button component from our local UI library
// (likely built with Radix UI or Shadcn/UI).
import { Button } from "@/components/ui/button";

// Import 'Link' for client-side navigation, allowing users
// to move between pages without a full browser refresh.
import { Link } from "react-router-dom";

// Import specific icons from the Lucide library to add
// visual context to our buttons and headers.
import { Plus, Search, UtensilsCrossed } from "lucide-react";

/**
 * HomePage functional component:
 * The entry point for users to browse shared recipes.
 */
const HomePage = () => {
    /* 
     State definition: 'recipes' will hold the array of recipe objects.
     Initial value is an empty array [], and we use the <Recipe[]> 
     generic to tell TypeScript what kind of data to expect.
  */
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    /* 
     Loading state: Boolean used to show a spinner or placeholder 
     while the data is being fetched from the database.
  */
    const [loading, setLoading] = useState(true);

    /* 
     The 'useEffect' hook with an empty dependency array ([]) 
     ensures the code inside runs exactly once when the component mounts.
  */
    useEffect(() => {
        /**
         * fetchRecipes: An asynchronous function defined inside the effect
         * to handle the Supabase communication.
         */
        const fetchRecipes = async () => {
            try {
                // Set loading to true before starting the fetch to trigger UI updates.
                setLoading(true);

                /* 
           The Supabase query:
           1. .from('recipes') -> Target the database table named 'recipes'.
           2. .select('*') -> Retrieve all columns for each row.
           3. .order('created_at', { ascending: false }) -> Sort the results 
              so the most recently created recipes appear first.
        */
                const { data, error } = await supabase.from("recipes").select("*").order("created_at", { ascending: false });

                // If the query returns an error, jump to the catch block.
                if (error) throw error;

                /* 
           Update the 'recipes' state with the retrieved data. 
           If 'data' is null for some reason, we default to an empty array.
        */
                setRecipes(data || []);
            } catch (error) {
                // Log the error to the console for debugging purposes.
                console.error("Error fetching recipes:", error);
            } finally {
                /* 
           The 'finally' block runs regardless of success or failure, 
           ensuring we stop the loading animation.
        */
                setLoading(false);
            }
        };

        // Execute the function we just defined.
        fetchRecipes();
    }, []); // End of useEffect

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">
            {/* Hero / Introduction Section */}
            <section className="text-center py-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600/10 border border-pink-500/20 text-pink-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                    <UtensilsCrossed className="w-3 h-3" />
                    Chef's Special
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
                    Discover <span className="text-transparent bg-clip-text bg-pink-500">Culinary</span> Magic
                </h1>
                <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">Join a community of home chefs sharing their best-kept secrets. Find inspiration for your next meal or share your own masterpiece.</p>

                {/* Search Bar Placeholder */}
                <div className="max-w-xl mx-auto relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-pink-500 transition-colors" />
                    <input type="text" placeholder="Search recipes, ingredients, or chefs..." className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all backdrop-blur-sm" />
                </div>
            </section>

            {/* Recipe Feed Section */}
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

                {/* LOADING STATE: Skeletons */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="aspect-[4/5] rounded-3xl bg-zinc-900 border border-zinc-800 animate-pulse" />
                        ))}
                    </div>
                ) : recipes.length > 0 ? (
                    // REAL DATA: Recipe Grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {recipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                ) : (
                    // EMPTY STATE: No recipes found
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
