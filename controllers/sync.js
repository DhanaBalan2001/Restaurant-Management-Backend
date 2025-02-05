import { cacheData, getCachedData } from '../utils/indexedDB.js';

export const syncData = async (req, res) => {
  try {
    const { lastSyncTimestamp } = req.query;

    // Fetch updated data since last sync
    const updates = await getUpdatedData(lastSyncTimestamp);

    // Cache new data
    await Promise.all([
      cacheData('menu', updates.menu),
      cacheData('inventory', updates.inventory)
    ]);

    // Sync offline orders
    const offlineOrders = await getCachedData('orders');
    if (offlineOrders.length > 0) {
      await syncOfflineOrders(offlineOrders);
    }

    res.json({
      syncedAt: new Date(),
      updates
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};