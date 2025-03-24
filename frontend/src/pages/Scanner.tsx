import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface ScannedItem {
  name: string;
  barcode: string;
  quantity: number;
  unit: string;
  expiration_date: string;
}

export default function Scanner() {
  const { isAuthenticated } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'barcode' | 'receipt'>('barcode');
  const webcamRef = useRef<Webcam>(null);
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async (item: ScannedItem) => {
      const response = await axios.post('http://localhost:8000/api/items/', item);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expiringItems'] });
    },
  });

  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Here you would typically send the image to your backend for processing
        // For now, we'll just simulate a successful scan
        const mockScannedItem: ScannedItem = {
          name: 'Sample Item',
          barcode: '123456789',
          quantity: 1,
          unit: 'piece',
          expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        };
        addItemMutation.mutate(mockScannedItem);
      }
    }
  }, [webcamRef, addItemMutation]);

  if (!isAuthenticated) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Please login to use the scanner</h1>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Scan Items</h2>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => setScanMode('barcode')}
            className={`px-4 py-2 rounded-md ${
              scanMode === 'barcode'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Barcode Scanner
          </button>
          <button
            onClick={() => setScanMode('receipt')}
            className={`px-4 py-2 rounded-md ${
              scanMode === 'receipt'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Receipt Scanner
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {scanMode === 'barcode' ? (
          <div>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg"
            />
            <div className="mt-4 flex justify-center">
              <button
                onClick={capture}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Capture
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="receipt-upload"
            />
            <label
              htmlFor="receipt-upload"
              className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-green-500"
            >
              <span className="text-gray-600">Click to upload receipt image</span>
            </label>
          </div>
        )}
      </div>

      {addItemMutation.isSuccess && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
          Item successfully added to inventory!
        </div>
      )}
    </div>
  );
} 