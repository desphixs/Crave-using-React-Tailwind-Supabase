/**
 * EditRecipePage.tsx
 * This component allows recipe owners to update their existing recipes.
 * It pre-fills a form with current data and performs authorization checks to ensure only creators can make changes.
 */

import React, { useState, useEffect } from "react"; // React core hooks
import { useNavigate, useParams } from "react-router-dom"; // Navigation and route parameter hooks
import { supabase } from "@/lib/supabase"; // Supabase client
import { useAuth } from "@/context/AuthContext"; // Auth context for user identification
import { toast } from "sonner"; // Toast notifications
import { Button } from "@/components/ui/button"; // Reusable button component
import { Utensils, Image as ImageIcon, ClipboardList, Type, Hash, Loader2, Save, X, Edit3 } from "lucide-react"; // Icons

// Standard categories list
const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Vegan", "Dessert", "Snack", "Drink"];

const EditRecipePage = () => {
    const { id } = useParams(); // Get the unique recipe ID from the URL
    const navigate = useNavigate(); // Initialize navigation
    const { user } = useAuth(); // Access current logged-in user

    // FORM STATE: Initialized with empty values, to be filled after fetch
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [category, setCategory] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [instructions, setInstructions] = useState("");

    // LOGIC STATE
    const [loading, setLoading] = useState(true); // Controls the initial fetch loading state
    const [submitting, setSubmitting] = useState(false); // Controls the "Saving..." button state
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    /**
     * INITIAL DATA FETCH & AUTHORIZATION
     * Runs once when the component mounts or the ID changes.
     */
    useEffect(() => {
        const fetchRecipe = async () => {
            if (!id) return;

            try {
                // Fetch the specific recipe by its ID
                const { data, error } = await supabase
                    .from("recipes")
                    .select("*")
                    .eq("id", id)
                    .single(); // We only expect one result

                if (error) throw error;
                if (!data) throw new Error("Recipe not found");

                /**
                 * SECURITY: OWNERSHIP CHECK
                 * If the user_id on the recipe doesn't match the currently logged-in user,
                 * they shouldn't be here. We kick them back to the dashboard.
                 */
                if (user && data.user_id !== user.id) {
                    toast.error("Unauthorized: You can only edit your own recipes.");
                    navigate("/dashboard");
                    return;
                }

                // Populate the form state with existing data
                setTitle(data.title);
                setDescription(data.description || "");
                setImageUrl(data.image_url || "");
                setCategory(data.category || "");
                setIngredients(data.ingredients || "");
                setInstructions(data.instructions || "");

            } catch (error: any) {
                console.error("Error fetching recipe:", error);
                toast.error(error.message || "Failed to load recipe details.");
                navigate("/dashboard");
            } finally {
                setLoading(false);
            }
        };

        // Only attempt fetch if we have a user context (avoids race conditions)
        if (user) {
            fetchRecipe();
        }
    }, [id, user, navigate]);

    /**
     * VALIDATION LOGIC
     * Ensures mandatory fields are not empty before sending update to DB.
     */
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!title.trim()) newErrors.title = "Recipe title is required";
        if (!category) newErrors.category = "Please select a category";
        if (!instructions.trim()) newErrors.instructions = "Cooking instructions are required";
        if (imageUrl && !imageUrl.startsWith("http")) {
            newErrors.imageUrl = "Please enter a valid image URL";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * UPDATE HANDLER
     * Sends the modified data back to the 'recipes' table in Supabase.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors before saving");
            return;
        }

        setSubmitting(true);

        try {
            /**
             * DB UPDATE:
             * We use the .update() method and filter by .eq('id', id).
             */
            const { error } = await supabase
                .from("recipes")
                .update({
                    title,
                    description,
                    image_url: imageUrl,
                    category,
                    ingredients,
                    instructions,
                })
                .eq("id", id);

            if (error) throw error;

            toast.success("Recipe updated successfully!");
            // Redirect back to the recipe detail page to see the changes
            navigate(`/recipe/${id}`);
        } catch (error: any) {
            console.error("Error updating recipe:", error);
            toast.error(error.message || "Failed to update recipe.");
        } finally {
            setSubmitting(false);
        }
    };

    // LOADING STATE UI
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
                <p className="text-zinc-400 font-medium">Fetching recipe details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20">
            {/* Page Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Editing Recipe
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center flex-wrap gap-3">
                    <Edit3 className="w-8 h-8 md:w-10 md:h-10 text-pink-600" />
                    Update Your Masterpiece
                </h1>
                <p className="text-zinc-400 mt-2 text-base md:text-lg">Refine your ingredients or tweak your steps to make it even better.</p>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <Type className="w-4 h-4 text-pink-500" />
                            Recipe Title <span className="text-pink-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            className={`w-full bg-zinc-950/50 border ${errors.title ? "border-red-500" : "border-zinc-800"} rounded-2xl p-4 text-white focus:outline-none focus:border-pink-600/50 transition-all`} 
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1 ml-1">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-pink-500" />
                            Category <span className="text-pink-500">*</span>
                        </label>
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                            className={`w-full bg-zinc-950/50 border ${errors.category ? "border-red-500" : "border-zinc-800"} rounded-2xl p-4 text-white appearance-none cursor-pointer focus:outline-none focus:border-pink-600/50 transition-all`}
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Media Link */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-pink-500" />
                        Image URL
                    </label>
                    <input 
                        type="text" 
                        value={imageUrl} 
                        onChange={(e) => setImageUrl(e.target.value)} 
                        className={`w-full bg-zinc-950/50 border ${errors.imageUrl ? "border-red-500" : "border-zinc-800"} rounded-2xl p-4 text-white focus:outline-none focus:border-pink-600/50 transition-all`} 
                    />
                </div>

                {/* Description Text */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Short Description</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        rows={3} 
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-600/50 transition-all resize-none" 
                    />
                </div>

                {/* Ingredients & Instructions */}
                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-pink-500" />
                            Ingredients
                        </label>
                        <textarea 
                            value={ingredients} 
                            onChange={(e) => setIngredients(e.target.value)} 
                            rows={5} 
                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none focus:border-pink-600/50 transition-all shadow-inner" 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-pink-500" />
                            Cooking Instructions <span className="text-pink-500">*</span>
                        </label>
                        <textarea 
                            value={instructions} 
                            onChange={(e) => setInstructions(e.target.value)} 
                            rows={8} 
                            className={`w-full bg-zinc-950/50 border ${errors.instructions ? "border-red-500" : "border-zinc-800"} rounded-2xl p-4 text-white focus:outline-none focus:border-pink-600/50 transition-all`} 
                        />
                        {errors.instructions && <p className="text-red-500 text-xs mt-1 ml-1">{errors.instructions}</p>}
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-zinc-900">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => navigate("/dashboard")} 
                        disabled={submitting} 
                        className="rounded-xl px-8 hover:bg-zinc-900"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Discard Changes
                    </Button>

                    <Button 
                        type="submit" 
                        disabled={submitting} 
                        className="rounded-xl px-12 h-12 font-bold shadow-lg shadow-pink-600/20 active:scale-[0.98] transition-all"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditRecipePage;
