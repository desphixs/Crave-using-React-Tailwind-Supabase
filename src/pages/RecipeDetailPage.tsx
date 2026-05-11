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
import { Loader2, ArrowLeft, Calendar, ChefHat, Clock, ClipboardList, Utensils, MessageSquare, Send, User, Heart, Bookmark } from "lucide-react";

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
    // Memory to track if the current viewer has saved this recipe.
    const [isSaved, setIsSaved] = useState(false);

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
                    .maybeSingle(); 
                if (likeError) throw likeError;
                setHasLiked(!!likeData);

                // 4. Check if the current user has saved it.
                const { data: saveData, error: saveError } = await supabase
                    .from("saved_recipes")
                    .select("*")
                    .eq("recipe_id", id)
                    .eq("user_id", user.id)
                    .maybeSingle();
                if (saveError) throw saveError;
                setIsSaved(!!saveData);
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
        if (!user) {
            toast.error("Please sign in to like this recipe!");
            navigate("/login");
            return;
        }

        const originalLiked = hasLiked;
        const originalCount = likeCount;
        
        setHasLiked(!originalLiked);
        setLikeCount(prev => originalLiked ? prev - 1 : prev + 1);

        try {
            if (originalLiked) {
                await supabase.from("likes").delete().eq("recipe_id", id).eq("user_id", user.id);
            } else {
                await supabase.from("likes").insert({ recipe_id: id, user_id: user.id });
            }
        } catch (error) {
            setHasLiked(originalLiked);
            setLikeCount(originalCount);
            toast.error("Could not update your like.");
        }
    };

    /**
     * handleSave: Toggles the saved status with an optimistic update.
     */
    const handleSave = async () => {
        if (!user) {
            toast.error("Please sign in to save this recipe!");
            navigate("/login");
            return;
        }

        const originalSaved = isSaved;
        setIsSaved(!originalSaved);

        try {
            if (originalSaved) {
                await supabase.from("saved_recipes").delete().eq("recipe_id", id).eq("user_id", user.id);
                toast.success("Removed from your Recipe Box");
            } else {
                await supabase.from("saved_recipes").insert({ recipe_id: id, user_id: user.id });
                toast.success("Saved to your Recipe Box!");
            }
        } catch (error) {
            setIsSaved(originalSaved);
            toast.error("Could not update your Recipe Box.");
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-12">
            {/* Header / Back Navigation */}
            <div className="flex items-center justify-between">
                <Link to="/dashboard" className="inline-flex items-center text-zinc-400 hover:text-pink-500 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Feed
                </Link>
            </div>

            {/* --- E-COMMERCE STYLE HERO SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
                {/* Left Column: Image Gallery equivalent */}
                <div className="relative aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
                    {recipe.image_url ? (
                        <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-600 font-medium">No image provided</div>
                    )}
                </div>

                {/* Right Column: Product Details & Actions */}
                <div className="flex flex-col justify-center space-y-10">
                    <div className="space-y-6">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-pink-600/10 text-xs font-bold uppercase tracking-widest text-pink-500 border border-pink-500/20">
                            {recipe.category}
                        </span>
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                            {recipe.title}
                        </h1>
                        
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

                    {recipe.description && (
                        <p className="text-lg text-zinc-300 leading-relaxed border-l-2 border-pink-500/50 pl-6 py-2">
                            {recipe.description}
                        </p>
                    )}

                    {/* Actions (Ecommerce style "Add to Cart" equivalent) */}
                    <div className="flex items-center gap-4 pt-6 border-t border-zinc-800/50">
                        <Button 
                            onClick={handleLike}
                            className={`flex-1 h-16 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl ${
                                hasLiked 
                                    ? 'bg-pink-600 text-white shadow-pink-600/25 hover:bg-pink-700' 
                                    : 'bg-white text-zinc-950 hover:bg-zinc-200 hover:scale-[1.02]'
                            }`}
                        >
                            <Heart className={`w-6 h-6 mr-3 ${hasLiked ? 'fill-white' : ''}`} />
                            {hasLiked ? 'Loved It' : 'Show some Love'} 
                            <span className={`ml-3 px-3 py-1 rounded-full text-sm ${hasLiked ? 'bg-black/20' : 'bg-zinc-200'}`}>
                                {likeCount}
                            </span>
                        </Button>

                        <Button
                            onClick={handleSave}
                            variant="outline"
                            className={`h-16 w-16 p-0 flex-shrink-0 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                                isSaved 
                                    ? 'border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20' 
                                    : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700'
                            }`}
                        >
                            <Bookmark className={`w-6 h-6 transition-colors ${isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-zinc-400'}`} />
                        </Button>
                    </div>
                </div>
            </div>

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
