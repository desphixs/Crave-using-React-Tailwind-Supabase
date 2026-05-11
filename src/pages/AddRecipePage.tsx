/**
 * AddRecipePage.tsx
 * This component provides a comprehensive form for authenticated users to create and publish new recipes.
 * It handles form state, validation, user authentication context, and database interaction with Supabase.
 */

import React, { useState } from "react"; // Import React and the useState hook for managing form inputs
import { useNavigate } from "react-router-dom"; // Import useNavigate to programmatically redirect users after submission
import { supabase } from "@/lib/supabase"; // Import our initialized Supabase client to interact with the database
import { useAuth } from "@/context/AuthContext"; // Import our custom auth hook to access the current user's information
import { toast } from "sonner"; // Import the toast utility from sonner for beautiful user notifications
import { Button } from "@/components/ui/button"; // Import our custom reusable Button component
import { Utensils, Image as ImageIcon, ClipboardList, Type, Hash, Loader2 } from "lucide-react"; // Import icons for better visual representation

// Define the available recipe categories for the dropdown menu
const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Vegan", "Dessert", "Snack", "Drink"];

const AddRecipePage = () => {
    /**
     * FORM STATE MANAGEMENT
     * We use individual state variables for each form field to keep the logic simple and manageable.
     */
    const [title, setTitle] = useState(""); // Stores the name of the dish
    const [description, setDescription] = useState(""); // Stores a short summary of the recipe
    const [imageUrl, setImageUrl] = useState(""); // Stores the URL of the recipe image
    const [category, setCategory] = useState(""); // Stores the selected category from the dropdown
    const [ingredients, setIngredients] = useState(""); // Stores the list of ingredients as text
    const [instructions, setInstructions] = useState(""); // Stores the step-by-step cooking steps

    /**
     * UI & LOGIC STATE
     */
    const [loading, setLoading] = useState(false); // Controls the "submitting" state to disable buttons and show spinners
    const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Stores validation error messages for specific fields

    const navigate = useNavigate(); // Initialize the navigation function
    const { user } = useAuth(); // Destructure the current user object from our Auth Context

    /**
     * FORM VALIDATION
     * Checks if the required fields are filled before attempting to save to the database.
     */
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}; // Temporary object to collect errors

        // Ensure title is provided
        if (!title.trim()) newErrors.title = "Recipe title is required";

        // Ensure a category is selected
        if (!category) newErrors.category = "Please select a category";

        // Ensure instructions are provided as they are the core of the recipe
        if (!instructions.trim()) newErrors.instructions = "Cooking instructions are required";

        // Optional: Basic URL validation if an image URL is provided
        if (imageUrl && !imageUrl.startsWith("http")) {
            newErrors.imageUrl = "Please enter a valid image URL (starting with http)";
        }

        setErrors(newErrors); // Update the state with any found errors
        return Object.keys(newErrors).length === 0; // Return true if there are no errors, false otherwise
    };

    /**
     * SUBMISSION HANDLER
     * The main logic for saving the recipe to Supabase.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Stop the browser from refreshing the page on form submission

        // Run our validation check
        if (!validateForm()) {
            toast.error("Please fix the errors before submitting"); // Notify the user visually
            return; // Stop execution if validation fails
        }

        // Double-check if we actually have a user (though ProtectedRoute should handle this)
        if (!user) {
            toast.error("You must be logged in to add a recipe");
            return;
        }

        setLoading(true); // Turn on the loading state (e.g., show spinner on button)

        try {
            /**
             * INSERT DATA INTO SUPABASE
             * We use the .from('recipes').insert() method.
             * Note: 'user_id' is critical here; it links this recipe to the person who wrote it.
             */
            const { error } = await supabase.from("recipes").insert([
                {
                    title,
                    description,
                    image_url: imageUrl,
                    category,
                    ingredients,
                    instructions,
                    user_id: user.id, // Attach the current user's unique ID from our Auth Context
                },
            ]);

            // If Supabase returns an error (e.g., network issue, permission denied), throw it to the catch block
            if (error) throw error;

            // SUCCESS CASE
            toast.success("Recipe published successfully!"); // Show a success message
            navigate("/dashboard"); // Take the user back to their dashboard to see their new recipe
        } catch (error: any) {
            // ERROR CASE
            console.error("Error adding recipe:", error);
            toast.error(error.message || "Failed to add recipe. Please try again.");
        } finally {
            setLoading(false); // Always turn off loading, whether success or failure
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20">
            {/* Header Section */}
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                    <Utensils className="w-10 h-10 text-pink-600" />
                    Publish New Recipe
                </h1>
                <p className="text-zinc-400 mt-2 text-lg">Fill out the details below to share your culinary masterpiece with the community.</p>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Grid Layout for Title and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <Type className="w-4 h-4 text-pink-500" />
                            Recipe Title <span className="text-pink-500">*</span>
                        </label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Midnight Pasta Carbonara" className={`w-full bg-zinc-950/50 border ${errors.title ? "border-red-500" : "border-zinc-800"} rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all shadow-inner`} />
                        {errors.title && <p className="text-red-500 text-xs mt-1 ml-1">{errors.title}</p>}
                    </div>

                    {/* Category Dropdown */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-pink-500" />
                            Category <span className="text-pink-500">*</span>
                        </label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full bg-zinc-950/50 border ${errors.category ? "border-red-500" : "border-zinc-800"} rounded-2xl p-4 text-white focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all appearance-none cursor-pointer`}>
                            <option value="" disabled className="bg-zinc-900">
                                Select a category
                            </option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat} className="bg-zinc-900">
                                    {cat}
                                </option>
                            ))}
                        </select>
                        {errors.category && <p className="text-red-500 text-xs mt-1 ml-1">{errors.category}</p>}
                    </div>
                </div>

                {/* Image URL Input */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-pink-500" />
                        Image URL
                    </label>
                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/your-food-photo" className={`w-full bg-zinc-950/50 border ${errors.imageUrl ? "border-red-500" : "border-zinc-800"} rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all shadow-inner`} />
                    {errors.imageUrl && <p className="text-red-500 text-xs mt-1 ml-1">{errors.imageUrl}</p>}
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300">Short Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell the story behind this dish or what makes it special..." rows={3} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all shadow-inner resize-none" />
                </div>

                {/* Ingredients Textarea */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-pink-500" />
                        Ingredients
                    </label>
                    <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="List your ingredients here, one per line..." rows={5} className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all shadow-inner" />
                </div>

                {/* Instructions Textarea */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-pink-500" />
                        Cooking Instructions <span className="text-pink-500">*</span>
                    </label>
                    <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Describe the steps to prepare this dish..." rows={8} className={`w-full bg-zinc-950/50 border ${errors.instructions ? "border-red-500" : "border-zinc-800"} rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-600/50 focus:ring-1 focus:ring-pink-600/50 transition-all shadow-inner`} />
                    {errors.instructions && <p className="text-red-500 text-xs mt-1 ml-1">{errors.instructions}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6">
                    {/* Cancel Button: Takes user back to dashboard without saving */}
                    <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} disabled={loading} className="rounded-xl px-8">
                        Cancel
                    </Button>

                    {/* Submit Button: Triggers the handleSubmit function */}
                    <Button type="submit" disabled={loading} className="rounded-xl px-12 h-12 font-bold active:scale-[0.98] transition-transform">
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            "Publish Recipe"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddRecipePage;
