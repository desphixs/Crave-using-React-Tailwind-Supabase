// Import React hooks for lifecycle, state, and side effects.
import React, { useEffect, useState } from "react";

// Import routing tools to read the URL and create links between pages.
import { useParams, Link } from "react-router-dom";

// Import the Supabase client to communicate with our backend database.
import { supabase } from "@/lib/supabase";

// Import our custom authentication hook to check if a user is currently logged in.
import { useAuth } from "@/context/AuthContext";

// Import our TypeScript blueprints (types) for Recipes and Comments.
import type { Recipe, Comment } from "@/types";

// Import beautiful UI components for buttons and notifications.
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import icons from Lucide to enhance the visual design.
import { Loader2, ArrowLeft, Calendar, ChefHat, Clock, ClipboardList, Utensils, MessageSquare, Send, User } from "lucide-react";

// The RecipeDetailPage component handles showing all details for a single recipe and its comments.
const RecipeDetailPage = () => {
    // Grab the 'id' parameter from the URL (e.g., in /recipe/123, id is 123).
    const { id } = useParams();

    // Access the current logged-in user from our global Auth context.
    const { user } = useAuth();

    // --- RECIPE STATE ---
    // Memory for the recipe object we are fetching.
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    // Memory for the initial page load spinner.
    const [loading, setLoading] = useState(true);
    // Memory for any errors that occur while fetching the recipe.
    const [error, setError] = useState<string | null>(null);

    // --- COMMENTS STATE ---
    // Memory to hold an array of comments related to this specific recipe.
    const [comments, setComments] = useState<Comment[]>([]);
    // Memory for the text the user is currently typing in the comment box.
    const [newComment, setNewComment] = useState("");
    // Memory to show a small loading spinner inside the "Post" button while saving.
    const [submitting, setSubmitting] = useState(false);

    /**
     * fetchRecipe: Grabs the core recipe data from Supabase.
     */
    const fetchRecipe = async () => {
        try {
            setLoading(true); // Start the loading animation.
            // Query Supabase for the recipe matching the ID in the URL.
            const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();
            if (error) throw error; // If something broke, jump to catch.
            setRecipe(data); // Save the recipe to memory.
        } catch (err: any) {
            console.error("Error fetching recipe:", err);
            setError(err.message || "Could not load the recipe.");
        } finally {
            setLoading(false); // Stop the loading animation.
        }
    };

    /**
     * fetchComments: Grabs all comments associated with this recipe.
     */
    const fetchComments = async () => {
        try {
            // Query Supabase for comments where 'recipe_id' matches our current recipe.
            // We order them by 'created_at' ascending so the oldest comments are at the top.
            const { data, error } = await supabase.from("comments").select("*").eq("recipe_id", id).order("created_at", { ascending: true });
            if (error) throw error;
            setComments(data || []); // Save the comments list to memory.
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    // Effect hook to load the recipe and comments when the page first opens.
    useEffect(() => {
        if (id) {
            fetchRecipe();
            fetchComments();
        }
    }, [id]); // Re-run if the ID in the URL changes.

    /**
     * handleCommentSubmit: Saves a new comment to the database.
     */
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Stop the page from refreshing.

        // If the comment is empty or just spaces, don't do anything.
        if (!newComment.trim()) return;

        // Double check if the user is logged in (though the form should be hidden if they aren't).
        if (!user) {
            toast.error("You must be logged in to comment");
            return;
        }

        setSubmitting(true); // Show the loading state on the button.

        try {
            // Insert the new comment into the 'comments' table.
            const { error } = await supabase.from("comments").insert([
                {
                    content: newComment.trim(),
                    recipe_id: id,
                    user_id: user.id, // Tie the comment to the logged-in user.
                },
            ]);

            if (error) throw error;

            toast.success("Comment posted!"); // Show a success notification.
            setNewComment(""); // Clear the text area for the next comment.
            fetchComments(); // Refresh the comments list so the new one appears instantly.
        } catch (error: any) {
            toast.error(error.message || "Failed to post comment");
        } finally {
            setSubmitting(false); // Hide the loading state on the button.
        }
    };

    // --- LOADING & ERROR UI ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
                <p className="text-zinc-400 font-medium tracking-wide">Warming up the oven...</p>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <ChefHat className="w-16 h-16 text-zinc-700" />
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-white">Recipe Not Found</h2>
                    <p className="text-zinc-500">{error || "This recipe might have been deleted."}</p>
                </div>
                <Link to="/dashboard">
                    <Button variant="outline" className="rounded-xl mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Kitchen
                    </Button>
                </Link>
            </div>
        );
    }

    // --- DATE FORMATTING ---
    const formattedDate = new Date(recipe.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // --- MAIN RENDER ---
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-12">
            {/* Back Navigation */}
            <Link to="/dashboard" className="inline-flex items-center text-zinc-400 hover:text-pink-500 transition-colors font-medium text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Feed
            </Link>

            {/* --- HERO SECTION --- */}
            <div className="relative aspect-video md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
                {recipe.image_url ? <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-600 font-medium">No image provided</div>}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-pink-600/90 backdrop-blur-md text-xs font-bold uppercase tracking-widest text-white border border-pink-500/50">{recipe.category}</span>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">{recipe.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-zinc-300 text-sm font-medium pt-2">
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
            </div>

            {/* --- RECIPE CONTENT --- */}
            {recipe.description && <p className="text-xl text-zinc-300 leading-relaxed max-w-3xl">{recipe.description}</p>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
                {/* Ingredients column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                        <ClipboardList className="w-6 h-6 text-pink-500" />
                        <h2 className="text-2xl font-bold text-white tracking-tight">Ingredients</h2>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                        <p className="text-zinc-300 leading-loose whitespace-pre-wrap">{recipe.ingredients || "No specific ingredients listed."}</p>
                    </div>
                </div>

                {/* Instructions column */}
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
                {/* Section header with total comment count. */}
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-7 h-7 text-pink-500" />
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        Comments <span className="text-pink-600 font-mono text-xl ml-1">({comments.length})</span>
                    </h2>
                </div>

                {/* --- COMMENT FORM --- */}
                <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] space-y-6">
                    {user ? (
                        // If the user is logged in, show the input form.
                        <form onSubmit={handleCommentSubmit} className="space-y-4">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="What do you think about this recipe?"
                                rows={4}
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all resize-none shadow-inner"
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={submitting || !newComment.trim()} className="rounded-xl px-8 h-12 font-bold transition-transform active:scale-95 shadow-lg shadow-pink-600/10">
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Post Comment</>}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        // If the user is logged out, show a prompt to log in.
                        <div className="py-6 text-center space-y-4">
                            <p className="text-zinc-400 font-medium">Have something to say? Join the conversation.</p>
                            <Link to="/login">
                                <Button variant="outline" className="rounded-xl border-pink-500/20 text-pink-500 hover:bg-pink-600/10 px-8">
                                    Sign in to leave a comment
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* --- COMMENTS LIST --- */}
                <div className="space-y-6">
                    {comments.length > 0 ? (
                        // If there are comments, map through them and render each one.
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4 p-6 rounded-3xl bg-zinc-900/20 border border-zinc-900 transition-colors hover:border-zinc-800 group">
                                {/* Small avatar icon for the user. */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-pink-600/10 group-hover:text-pink-500 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    {/* Display the timestamp of the comment. */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {/* Display the actual comment content. */}
                                    <p className="text-zinc-300 leading-relaxed">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        // If no comments exist yet, show a subtle empty state.
                        <p className="text-center py-10 text-zinc-600 font-medium italic border border-dashed border-zinc-900 rounded-3xl">
                            Be the first to leave a comment...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailPage;
