import React from 'react';
import { useParams } from 'react-router-dom';

const EditRecipePage = () => {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-4">Edit Recipe</h1>
      <p className="text-gray-400">Updating recipe: <span className="text-pink-500 font-mono">{id}</span></p>
    </div>
  );
};

export default EditRecipePage;
