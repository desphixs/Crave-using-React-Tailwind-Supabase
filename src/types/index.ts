/**
 * src/types/index.ts
 * Centralized type definitions for the Crave application.
 * Using TypeScript interfaces ensures that our data is predictable and helps catch errors early.
 */

export interface Recipe {
  id: string;               // Unique UUID from Supabase
  created_at: string;       // Timestamp when the recipe was created
  title: string;            // Name of the recipe
  description: string | null; // Optional short summary
  image_url: string | null;   // URL to the recipe image
  category: string;         // Recipe category (Breakfast, Lunch, etc.)
  ingredients: string | null; // List of ingredients as text
  instructions: string;     // Cooking steps
  user_id: string;          // The ID of the chef who created it
}

export interface AuthUser {
  id: string;
  email?: string;
}

export interface Comment {
  id: string;
  created_at: string;
  recipe_id: string;
  user_id: string;
  content: string;
  // Optional: We might want the user's email later, but for now this matches our DB schema.
}
