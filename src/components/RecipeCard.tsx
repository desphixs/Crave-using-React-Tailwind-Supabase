// Import React and tools for navigation.
import React from 'react';
import { Link } from 'react-router-dom';

// Import our Recipe blueprint.
import type { Recipe } from '@/types';

// Import icons to make the card look professional.
import { Heart, Clock, Utensils } from 'lucide-react';

// Define the properties this component expects to receive.
interface RecipeCardProps {
  recipe: Recipe;
  likeCount?: number;   // How many people liked this recipe total.
  hasLiked?: boolean;   // Has the current user liked this specific recipe?
  onLike?: (e: React.MouseEvent) => void; // A function to run when the heart is clicked.
}

// The RecipeCard component displays a beautiful preview of a recipe.
const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  likeCount = 0, 
  hasLiked = false, 
  onLike 
}) => {
  return (
    // The whole card is a link that takes the user to the detail page.
    <Link to={`/recipe/${recipe.id}`} className="group block relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:border-pink-500/30 hover:shadow-[0_20px_50px_rgba(236,72,153,0.1)] group-hover:-translate-y-2">
        
        {/* RECIPE IMAGE */}
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            // group-hover:scale-110 creates a smooth zoom effect when the user hovers over the card.
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          // Fallback if no image exists.
          <div className="flex h-full w-full items-center justify-center bg-zinc-800">
            <Utensils className="h-12 w-12 text-zinc-700" />
          </div>
        )}

        {/* GRADIENT OVERLAY: Makes sure the text is always readable over any image. */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />

        {/* LIKE BUTTON: Positioned in the top right. */}
        <button
          onClick={onLike}
          // z-20 ensures it stays on top of everything.
          className="absolute top-6 right-6 z-20 p-3 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 text-white transition-all hover:scale-110 active:scale-95 group/btn"
        >
          <div className="flex items-center gap-2">
            <Heart 
              // If liked, the heart is filled with pink. Otherwise, it's just an outline.
              className={`w-5 h-5 transition-colors ${hasLiked ? "fill-pink-500 text-pink-500" : "text-white group-hover/btn:text-pink-400"}`} 
            />
            {/* Only show the count if it's greater than zero. */}
            {likeCount > 0 && <span className="text-xs font-bold font-mono">{likeCount}</span>}
          </div>
        </button>

        {/* INFO OVERLAY: Title, Category, and Meta info at the bottom. */}
        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-pink-600/90 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
              {recipe.category}
            </span>
          </div>

          <h3 className="text-2xl font-black text-white leading-tight tracking-tight group-hover:text-pink-400 transition-colors">
            {recipe.title}
          </h3>

          <div className="flex items-center gap-4 text-zinc-400 text-xs font-medium pt-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-pink-500" />
              <span>45m prep</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
