import { cacheData, getCachedData } from '../utils/indexedDB.js';
import { getUpdatedData, syncOfflineOrders } from '../services/syncService.js';

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
    let syncResults = { success: [], failed: [] };
    
    if (offlineOrders.length > 0) {
      syncResults = await syncOfflineOrders(offlineOrders);
    }

    res.json({
      syncedAt: new Date(),
      updates,
      syncResults: {
        successCount: syncResults.success.length,
        failedCount: syncResults.failed.length,
        failedOrders: syncResults.failed
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};