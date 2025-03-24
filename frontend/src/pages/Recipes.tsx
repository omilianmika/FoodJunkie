import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Recipe {
  id: number;
  name: string;
  description: string;
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  ingredients: Array<{
    id: number;
    name: string;
    quantity: number;
    unit: string;
  }>;
}

export default function Recipes() {
  const { isAuthenticated } = useAuth();
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    instructions: '',
    prep_time: 30,
    cook_time: 30,
    servings: 4,
    ingredients: [] as Array<{
      id: number;
      quantity: number;
      unit: string;
    }>,
  });
  const queryClient = useQueryClient();

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/recipes/');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const { data: availableIngredients } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/items/');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const addRecipeMutation = useMutation({
    mutationFn: async (recipe: Omit<Recipe, 'id'>) => {
      const response = await axios.post('http://localhost:8000/api/recipes/', recipe);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setIsAddingRecipe(false);
      setNewRecipe({
        name: '',
        description: '',
        instructions: '',
        prep_time: 30,
        cook_time: 30,
        servings: 4,
        ingredients: [],
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Please login to view recipes</h1>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Recipes</h2>
        <button
          onClick={() => setIsAddingRecipe(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add Recipe
        </button>
      </div>

      {isAddingRecipe && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Recipe</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addRecipeMutation.mutate(newRecipe);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newRecipe.description}
                onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Instructions</label>
              <textarea
                value={newRecipe.instructions}
                onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                rows={5}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prep Time (minutes)</label>
                <input
                  type="number"
                  value={newRecipe.prep_time}
                  onChange={(e) => setNewRecipe({ ...newRecipe, prep_time: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cook Time (minutes)</label>
                <input
                  type="number"
                  value={newRecipe.cook_time}
                  onChange={(e) => setNewRecipe({ ...newRecipe, cook_time: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Servings</label>
                <input
                  type="number"
                  value={newRecipe.servings}
                  onChange={(e) => setNewRecipe({ ...newRecipe, servings: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsAddingRecipe(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Recipe
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recipes?.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">{recipe.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{recipe.description}</p>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Ingredients:</h4>
                <ul className="mt-2 space-y-1">
                  {recipe.ingredients.map((ingredient) => (
                    <li key={ingredient.id} className="text-sm text-gray-500">
                      {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Prep:</span>
                  <span className="ml-1 text-gray-500">{recipe.prep_time} min</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Cook:</span>
                  <span className="ml-1 text-gray-500">{recipe.cook_time} min</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Serves:</span>
                  <span className="ml-1 text-gray-500">{recipe.servings}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
 