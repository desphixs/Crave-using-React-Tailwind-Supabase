/**
 * src/components/RecipeCard.tsx
 * A visually rich card component to display recipe previews.
 * Features a hover-zoom effect, an elegant gradient overlay, and a category badge.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import type { Recipe } from '@/types'; // Import our Recipe type
import { Clock, ChefHat } from 'lucide-react'; // Icons for extra detail

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Link 
      to={`/recipe/${recipe.id}`} 
      className="group relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col h-full"
    >
      {/* Recipe Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800">
            <ChefHat className="h-12 w-12 text-zinc-700" />
          </div>
        )}

        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Category Badge - Floats on top of image */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full bg-pink-600/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-white border border-pink-500/50">
            {recipe.category}
          </span>
        </div>
      </div>

      {/* Content Section - Floats over the bottom of the image */}
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-pink-500 transition-colors duration-300">
          {recipe.title}
        </h3>
        
        {recipe.description && (
          <p className="text-zinc-400 text-sm line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Footer info (Mocking time since it's not in DB yet) */}
        <div className="flex items-center gap-4 pt-2 text-zinc-500 text-xs font-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-pink-500/70" />
            <span>25 mins</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>Easy</span>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
