// src/components/AssetTestComponent.tsx
import React, { useState } from 'react';
import { useGetAssetsQuery, useCreateAssetMutation } from '@/services/endpoints/masterApi';

const AssetTestComponent: React.FC = () => {
  const { data: assets, error: fetchError, isLoading: fetchIsLoading } = useGetAssetsQuery();
  const [createAsset, { error: createError, isLoading: createIsLoading }] = useCreateAssetMutation();

  const [serialNumber, setSerialNumber] = useState('');
  const [modelNumber, setModelNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAsset({ serialNumber, modelNumber, status: 'active', location: null, department: null  }); // Provide required fields, location and department as null for now
      setSerialNumber('');
      setModelNumber('');
    } catch (err) {
      console.error("Failed to create asset:", err);
    }
  };

  return (
    <div>
      <h1>Asset Test Component</h1>

      <h2>Create Asset</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="serialNumber">Serial Number:</label>
          <input
            type="text"
            id="serialNumber"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="modelNumber">Model Number:</label>
          <input
            type="text"
            id="modelNumber"
            value={modelNumber}
            onChange={(e) => setModelNumber(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={createIsLoading}>
          {createIsLoading ? 'Creating...' : 'Create Asset'}
        </button>
        {createError && <p>Error creating asset: {JSON.stringify(createError)}</p>}
      </form>

      <h2>Asset List</h2>
      {fetchIsLoading && <p>Loading assets...</p>}
      {fetchError && <p>Error fetching assets: {JSON.stringify(fetchError)}</p>}
      {assets && (
        <ul>
          {assets.map((asset: any) => (
            <li key={asset._id}>
              {asset.serialNumber} - {asset.modelNumber}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssetTestComponent;