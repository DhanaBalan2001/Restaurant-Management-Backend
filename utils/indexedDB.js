import { openDB } from 'idb';

const DB_NAME = 'restaurantDB';
const DB_VERSION = 1;

export const initDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores
      db.createObjectStore('menu', { keyPath: 'id' });
      db.createObjectStore('orders', { keyPath: 'id' });
      db.createObjectStore('inventory', { keyPath: 'id' });
    },
  });
  return db;
};

export const cacheData = async (storeName, data) => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await Promise.all(data.map(item => store.put(item)));
  await tx.done;
};

export const getCachedData = async (storeName) => {
  const db = await initDB();
  return db.getAll(storeName);
};
