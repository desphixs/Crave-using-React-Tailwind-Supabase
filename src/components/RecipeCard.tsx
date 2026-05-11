// Import React and tools for navigation.
import React from 'react';
import { Link } from 'react-router-dom';

// Import our Recipe blueprint.
import type { Recipe } from '@/types';

// Import icons to make the card look professional.
import { Heart, Clock, Utensils, Bookmark } from 'lucide-react';

// Define the properties this component expects to receive.
interface RecipeCardProps {
  recipe: Recipe;
  likeCount?: number;   // How many people liked this recipe total.
  hasLiked?: boolean;   // Has the current user liked this specific recipe?
  isSaved?: boolean;    // Has the current user saved this recipe to their box?
  onLike?: (e: React.MouseEvent) => void; // A function to run when the heart is clicked.
  onSave?: (e: React.MouseEvent) => void; // A function to run when the bookmark is clicked.
}

// The RecipeCard component displays a beautiful preview of a recipe.
const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  likeCount = 0, 
  hasLiked = false, 
  isSaved = false,
  onLike,
  onSave
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

        {/* ACTION BUTTONS: Positioned in the top right. */}
        <div className="absolute top-5 right-5 z-20 flex flex-col gap-2.5">
          {/* LIKE BUTTON */}
          <button
            onClick={onLike}
            className="w-11 h-11 flex flex-col items-center justify-center rounded-[1rem] bg-black/20 backdrop-blur-xl border border-white/10 text-white transition-all hover:scale-110 active:scale-95 group/btn"
          >
            <Heart 
              className={`w-5 h-5 transition-all duration-300 ${hasLiked ? "fill-pink-500 text-pink-500 scale-110" : "text-white group-hover/btn:text-pink-400"}`} 
            />
            {likeCount > 0 && (
              <span className="text-[9px] font-black font-mono leading-none tracking-tighter mt-0.5">
                {likeCount > 999 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
              </span>
            )}
          </button>

          {/* SAVE BUTTON */}
          <button
            onClick={onSave}
            className="w-11 h-11 flex items-center justify-center rounded-[1rem] bg-black/20 backdrop-blur-xl border border-white/10 text-white transition-all hover:scale-110 active:scale-95 group/save"
          >
            <Bookmark 
              className={`w-5 h-5 transition-all duration-300 ${isSaved ? "fill-yellow-500 text-yellow-500 scale-110" : "text-white group-hover/save:text-yellow-400"}`} 
            />
          </button>
        </div>

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
