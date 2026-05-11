// Import React and hooks for managing component lifecycle and state.
import React, { useEffect, useState } from "react";

// Import routing hooks: useParams gets the ID from the URL, Link creates navigable buttons.
import { useParams, Link } from "react-router-dom";

// Import the Supabase client to fetch data from the database.
import { supabase } from "@/lib/supabase";

// Import the Recipe type blueprint so TypeScript knows our data shape.
import type { Recipe } from "@/types";

// Import the Button component for beautiful, styled actions.
import { Button } from "@/components/ui/button";

// Import icons from Lucide to make the UI look professional.
import { Loader2, ArrowLeft, Calendar, ChefHat, Clock, ClipboardList, Utensils } from "lucide-react";

// Define the RecipeDetailPage component.
const RecipeDetailPage = () => {
    // Destructure the 'id' parameter from the current URL (e.g., /recipe/:id).
    const { id } = useParams();

    // Create a state variable to hold the fetched recipe data. It starts as null.
    const [recipe, setRecipe] = useState<Recipe | null>(null);

    // Create a loading state to show a spinner while data is being fetched.
    const [loading, setLoading] = useState(true);

    // Create an error state to hold any messages if the fetch fails.
    const [error, setError] = useState<string | null>(null);

    // Use the useEffect hook to run the fetch logic as soon as the page loads.
    useEffect(() => {
        // Define an asynchronous function to fetch the recipe from Supabase.
        const fetchRecipe = async () => {
            try {
                // Ensure the loading spinner is visible before starting the fetch.
                setLoading(true);

                // Ask Supabase to find a single recipe where the 'id' column matches our URL 'id'.
                const { data, error } = await supabase
                    .from("recipes")
                    .select("*")
                    .eq("id", id)
                    .single(); // .single() tells Supabase we only expect ONE result, not an array.

                // If Supabase throws an error (e.g., network failure or ID not found), throw it.
                if (error) throw error;

                // If we get data back, save it into our 'recipe' state memory.
                setRecipe(data);
            } catch (err: any) {
                // If anything goes wrong, catch the error and save a message into our 'error' state.
                console.error("Error fetching recipe:", err);
                setError(err.message || "Could not load the recipe.");
            } finally {
                // Whether it succeeded or failed, turn off the loading spinner.
                setLoading(false);
            }
        };

        // If we actually have an ID from the URL, execute the fetch function.
        if (id) {
            fetchRecipe();
        }
    }, [id]); // This effect will re-run if the 'id' in the URL ever changes.

    // SCENARIO 1: The data is currently being fetched (loading is true).
    if (loading) {
        return (
            // Return a simple, centered loading screen.
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                {/* Show a spinning loader icon in pink. */}
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
                {/* Display a friendly loading message. */}
                <p className="text-zinc-400 font-medium tracking-wide">Warming up the oven...</p>
            </div>
        );
    }

    // SCENARIO 2: There was an error, or the recipe doesn't exist.
    if (error || !recipe) {
        return (
            // Return a centered error screen.
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                {/* Display an icon to indicate emptiness. */}
                <ChefHat className="w-16 h-16 text-zinc-700" />
                <div className="space-y-2">
                    {/* Show a bold error title. */}
                    <h2 className="text-3xl font-bold text-white">Recipe Not Found</h2>
                    {/* Show the specific error message, or a fallback. */}
                    <p className="text-zinc-500">{error || "This recipe might have been deleted."}</p>
                </div>
                {/* Provide a button to let the user navigate back to the Home feed safely. */}
                <Link to="/dashboard">
                    <Button variant="outline" className="rounded-xl mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Kitchen
                    </Button>
                </Link>
            </div>
        );
    }

    // Format the date dynamically using the built-in JavaScript Date object.
    const formattedDate = new Date(recipe.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // SCENARIO 3: The data has successfully loaded. Render the full page!
    return (
        // Wrap the whole page in a container that handles maximum width and responsive padding.
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-12">
            
            {/* Provide a 'Back' button at the very top for easy navigation. */}
            <Link to="/dashboard" className="inline-flex items-center text-zinc-400 hover:text-pink-500 transition-colors font-medium text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Feed
            </Link>

            {/* --- HERO SECTION --- */}
            {/* Create a large container with a rounded border and an aspect ratio suitable for a hero image. */}
            <div className="relative aspect-video md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
                {/* If the recipe has an image, render an img tag. */}
                {recipe.image_url ? (
                    <img 
                        src={recipe.image_url} 
                        alt={recipe.title} 
                        // Make the image cover the entire container perfectly.
                        className="w-full h-full object-cover" 
                    />
                ) : (
                    // If no image exists, show a stylish fallback placeholder with a chef hat icon.
                    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800">
                        <ChefHat className="w-20 h-20 text-zinc-700 mb-4" />
                        <span className="text-zinc-600 font-medium">No image provided</span>
                    </div>
                )}
                
                {/* Add a smooth dark gradient overlay so the text is always legible over the image. */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                
                {/* Position the title and metadata in the bottom left corner, floating over the gradient. */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 space-y-4">
                    {/* Display the Category as a floating badge. */}
                    <span className="inline-block px-4 py-1.5 rounded-full bg-pink-600/90 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-white border border-pink-500/50">
                        {recipe.category}
                    </span>
                    {/* Render the Recipe Title in huge, bold text. */}
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                        {recipe.title}
                    </h1>
                    {/* Render a row of tiny metadata items like the Date and Prep Time. */}
                    <div className="flex flex-wrap items-center gap-6 text-zinc-300 text-sm font-medium pt-2">
                        {/* Display the dynamically formatted date next to a calendar icon. */}
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-pink-500" />
                            <span>{formattedDate}</span>
                        </div>
                        {/* Show a placeholder cook time (since we didn't add it to the DB schema initially). */}
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-pink-500" />
                            <span>45 mins cook time</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT SECTION --- */}
            {/* If the user wrote a description, display it spanning the full width beneath the hero. */}
            {recipe.description && (
                <p className="text-xl text-zinc-300 leading-relaxed max-w-3xl">
                    {recipe.description}
                </p>
            )}

            {/* Create a CSS grid to split the page into two columns on large screens. */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
                
                {/* LEFT COLUMN: Ingredients (Takes up 1/3 of the space on large screens) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Section Header for Ingredients. */}
                    <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <ClipboardList className="w-6 h-6 text-pink-500" />
                        <h2 className="text-2xl font-bold text-white tracking-tight">Ingredients</h2>
                    </div>
                    {/* Render the ingredients inside a stylized dark box. */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                        {/* Format the raw text. whitespace-pre-wrap ensures that line breaks (Enters) are respected. */}
                        <p className="text-zinc-300 leading-loose whitespace-pre-wrap">
                            {/* If ingredients are missing, display a fallback message. */}
                            {recipe.ingredients || "No specific ingredients listed."}
                        </p>
                    </div>
                </div>

                {/* RIGHT COLUMN: Instructions (Takes up 2/3 of the space on large screens) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section Header for Instructions. */}
                    <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <Utensils className="w-6 h-6 text-pink-500" />
                        <h2 className="text-2xl font-bold text-white tracking-tight">Instructions</h2>
                    </div>
                    {/* Render the instructions text. */}
                    <div className="prose prose-invert prose-pink max-w-none">
                        {/* whitespace-pre-wrap ensures paragraph breaks are displayed correctly. */}
                        <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-wrap">
                            {recipe.instructions}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Export the component so it can be used in App.tsx for routing.
export default RecipeDetailPage;
