import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Item {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  expiration_date: string;
}

interface Recipe {
  id: number;
  name: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  const { data: expiringItems } = useQuery<Item[]>({
    queryKey: ['expiringItems'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/items/expiring');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const { data: randomRecipe } = useQuery<Recipe>({
    queryKey: ['randomRecipe'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/recipes/random');
      return response.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to FoodJunkie</h1>
        <p className="mt-4 text-gray-600">Please login or register to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Expiring Items</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expiringItems?.map((item) => (
            <div
              key={item.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Quantity: {item.quantity} {item.unit}
                </p>
                <p className="mt-1 text-sm text-red-600">
                  Expires: {new Date(item.expiration_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">What Can We Eat?</h2>
        {randomRecipe && (
          <div className="mt-4 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">{randomRecipe.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{randomRecipe.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Prep Time</p>
                  <p className="mt-1 text-sm text-gray-900">{randomRecipe.prep_time} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Cook Time</p>
                  <p className="mt-1 text-sm text-gray-900">{randomRecipe.cook_time} minutes</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Servings</p>
                  <p className="mt-1 text-sm text-gray-900">{randomRecipe.servings}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 