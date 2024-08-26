import { getStorageData } from '@utility/storageApiHelper';
import { useContext } from 'react';
import { AppContext } from '@components/common/context/AppProvider';

export default function handler(req, res) {

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { itemName } = req.query;

  if (!itemName) {
    return res.status(400).json({ message: 'Item name is required' });
  }

  const storage = null;

  console.log('storage', storage);
  if (!storage) {
    return res.status(500).json({ message: 'Storage data not available' });
  }

  const item = storage.find((item) => item.name.toLowerCase() === itemName.toLowerCase());

  if (item) {
    return res.status(200).json({ itemName: item.name, amount: item.amount });
  } else {
    return res.status(404).json({ message: 'Item not found' });
  }
}
