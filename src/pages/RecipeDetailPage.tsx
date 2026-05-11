// Import React hooks for managing memory and side effects.
import React, { useEffect, useState } from "react";

// Import routing tools to read the URL and navigate between pages.
import { useParams, Link, useNavigate } from "react-router-dom";

// Import the Supabase client to talk to our database.
import { supabase } from "@/lib/supabase";

// Import our custom authentication hook.
import { useAuth } from "@/context/AuthContext";

// Import our TypeScript blueprints.
import type { Recipe, Comment } from "@/types";

// Import UI components.
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import icons to make the UI beautiful.
import { Loader2, ArrowLeft, Calendar, ChefHat, Clock, ClipboardList, Utensils, MessageSquare, Send, User, Heart } from "lucide-react";

const RecipeDetailPage = () => {
    // Read the ID from the URL.
    const { id } = useParams();
    
    // Access the current user and navigation tool.
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- RECIPE & LIKE STATE ---
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Memory to track how many likes this recipe has.
    const [likeCount, setLikeCount] = useState(0);
    // Memory to track if the current viewer has liked this recipe.
    const [hasLiked, setHasLiked] = useState(false);

    // --- COMMENTS STATE ---
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    /**
     * fetchRecipeData: Grabs the recipe and its associated like info.
     */
    const fetchRecipeData = async () => {
        try {
            setLoading(true);

            // 1. Fetch the main recipe record.
            const { data: recipeData, error: recipeError } = await supabase
                .from("recipes")
                .select("*")
                .eq("id", id)
                .single();
            if (recipeError) throw recipeError;
            setRecipe(recipeData);

            // 2. Fetch the total count of likes for this recipe.
            const { count, error: countError } = await supabase
                .from("likes")
                .select("*", { count: 'exact', head: true }) // head: true means "just get the count, don't return the rows".
                .eq("recipe_id", id);
            if (countError) throw countError;
            setLikeCount(count || 0);

            // 3. Check if the current user has liked it.
            if (user) {
                const { data: likeData, error: likeError } = await supabase
                    .from("likes")
                    .select("*")
                    .eq("recipe_id", id)
                    .eq("user_id", user.id)
                    .maybeSingle(); // maybeSingle returns null if no row exists, instead of throwing an error.
                if (likeError) throw likeError;
                setHasLiked(!!likeData); // Double-bang (!!) converts the object to 'true' or null to 'false'.
            }

        } catch (err: any) {
            console.error("Error fetching recipe data:", err);
            setError(err.message || "Could not load the recipe.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * fetchComments: Grabs all comments for the recipe.
     */
    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from("comments")
                .select("*")
                .eq("recipe_id", id)
                .order("created_at", { ascending: true });
            if (error) throw error;
            setComments(data || []);
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };

    // Load everything when the component mounts.
    useEffect(() => {
        if (id) {
            fetchRecipeData();
            fetchComments();
        }
    }, [id, user?.id]); // Re-run if ID or User changes.

    /**
     * handleLike: Toggles the like status with an optimistic update.
     */
    const handleLike = async () => {
        // Must be logged in to like.
        if (!user) {
            toast.error("Please sign in to like this recipe!");
            navigate("/login");
            return;
        }

        // OPTIMISTIC UPDATE:
        // Update the UI immediately so the user feels the app is super fast.
        const originalLiked = hasLiked;
        const originalCount = likeCount;
        
        setHasLiked(!originalLiked);
        setLikeCount(prev => originalLiked ? prev - 1 : prev + 1);

        try {
            if (originalLiked) {
                // If already liked, remove it.
                const { error } = await supabase.from("likes").delete().eq("recipe_id", id).eq("user_id", user.id);
                if (error) throw error;
            } else {
                // If not liked, add it.
                const { error } = await supabase.from("likes").insert({ recipe_id: id, user_id: user.id });
                if (error) throw error;
            }
        } catch (error) {
            // If it fails, revert the state to what it was before.
            setHasLiked(originalLiked);
            setLikeCount(originalCount);
            toast.error("Could not update your like. Please try again.");
        }
    };

    /**
     * handleCommentSubmit: Saves a new comment.
     */
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) {
            toast.error("You must be logged in to comment");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase.from("comments").insert([{ content: newComment.trim(), recipe_id: id, user_id: user.id }]);
            if (error) throw error;
            toast.success("Comment posted!");
            setNewComment("");
            fetchComments();
        } catch (error: any) {
            toast.error(error.message || "Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    // --- RENDER LOGIC ---
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

    const formattedDate = new Date(recipe.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-12">
            {/* Header / Back Navigation */}
            <div className="flex items-center justify-between">
                <Link to="/dashboard" className="inline-flex items-center text-zinc-400 hover:text-pink-500 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Feed
                </Link>
            </div>

            {/* --- HERO SECTION --- */}
            <div className="relative aspect-video md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
                {recipe.image_url ? <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-600 font-medium">No image provided</div>}
                
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                
                {/* LIKE BUTTON (Detail Page) */}
                <button 
                    onClick={handleLike}
                    className="absolute top-8 right-8 z-20 group/like transition-transform active:scale-90"
                >
                    <div className="flex flex-col items-center gap-1.5 p-4 rounded-3xl bg-black/30 backdrop-blur-xl border border-white/10 text-white min-w-[70px]">
                        <Heart className={`w-8 h-8 transition-all duration-300 ${hasLiked ? "fill-pink-500 text-pink-500 scale-110" : "text-white group-hover/like:text-pink-400 group-hover/like:scale-110"}`} />
                        <span className="text-xs font-black font-mono tracking-tighter">{likeCount}</span>
                    </div>
                </button>

                {/* HERO TEXT */}
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
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-7 h-7 text-pink-500" />
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        Comments <span className="text-pink-600 font-mono text-xl ml-1">({comments.length})</span>
                    </h2>
                </div>

                {/* Comment Form */}
                <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] space-y-6">
                    {user ? (
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

                {/* Comments List */}
                <div className="space-y-6">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4 p-6 rounded-3xl bg-zinc-900/20 border border-zinc-900 transition-colors hover:border-zinc-800 group">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-pink-600/10 group-hover:text-pink-500 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
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

export default RecipeDetailPage;
