import React from 'react';
import { useParams } from 'react-router-dom';

const RecipeDetailPage = () => {
  const { id } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-4">Recipe Details</h1>
      <p className="text-gray-400">Viewing recipe with ID: <span className="text-pink-500 font-mono">{id}</span></p>
    </div>
  );
};

export default RecipeDetailPage;
