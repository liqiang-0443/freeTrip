export type LocalRoutePhoto = {
  id: string;
  routeId: string;
  stopId?: string;
  name: string;
  type: string;
  size: number;
  addedAt: string;
  dataUrl: string;
};

export type PhotoCountByRoute = Record<string, number>;

export type PhotoLibrary = {
  addRoutePhotos: (
    routeId: string,
    stopId: string | undefined,
    files: ArrayLike<File>
  ) => Promise<LocalRoutePhoto[]>;
  listRoutePhotos: (routeId: string) => Promise<LocalRoutePhoto[]>;
  countPhotosByRoute: () => Promise<PhotoCountByRoute>;
  deleteRoutePhoto: (photoId: string) => Promise<void>;
  subscribe: (listener: () => void) => () => void;
};

const DB_NAME = "freetrip-photo-library";
const DB_VERSION = 1;
const STORE_NAME = "photos";

let routePhotoLibrary: PhotoLibrary | undefined;

export function getRoutePhotoLibrary(): PhotoLibrary {
  routePhotoLibrary ??= canStoreRoutePhotos()
    ? createIndexedDbPhotoLibrary()
    : canUseLocalStorage()
      ? createLocalStoragePhotoLibrary()
    : createUnsupportedPhotoLibrary();
  return routePhotoLibrary;
}

export function resetRoutePhotoLibraryForTests() {
  routePhotoLibrary = undefined;
}

export function createIndexedDbPhotoLibrary(): PhotoLibrary {
  const listeners = new Set<() => void>();

  return {
    async addRoutePhotos(routeId, stopId, files) {
      const db = await openPhotoDb();
      const photos = await Promise.all(
        Array.from(files).map(async (file) => ({
          id: createPhotoId(routeId),
          routeId,
          stopId,
          name: file.name || "photo",
          type: file.type || "image/jpeg",
          size: file.size,
          addedAt: new Date().toISOString(),
          dataUrl: await readFileAsDataUrl(file)
        }))
      );

      await transactionComplete(db, STORE_NAME, "readwrite", (store) => {
        photos.forEach((photo) => store.put(photo));
      });
      notify(listeners);
      return photos;
    },

    async listRoutePhotos(routeId) {
      const db = await openPhotoDb();
      return readByRouteId(db, routeId);
    },

    async countPhotosByRoute() {
      const db = await openPhotoDb();
      const photos = await readAllPhotos(db);
      return photos.reduce<PhotoCountByRoute>((counts, photo) => {
        counts[photo.routeId] = (counts[photo.routeId] ?? 0) + 1;
        return counts;
      }, {});
    },

    async deleteRoutePhoto(photoId) {
      const db = await openPhotoDb();
      await transactionComplete(db, STORE_NAME, "readwrite", (store) => {
        store.delete(photoId);
      });
      notify(listeners);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

export function createMemoryPhotoLibrary(): PhotoLibrary {
  const listeners = new Set<() => void>();
  const photos = new Map<string, LocalRoutePhoto>();

  return {
    async addRoutePhotos(routeId, stopId, files) {
      const added = Array.from(files).map((file) => ({
        id: createPhotoId(routeId),
        routeId,
        stopId,
        name: file.name || "photo",
        type: file.type || "image/jpeg",
        size: file.size,
        addedAt: new Date().toISOString(),
        dataUrl: `memory://${routeId}/${file.name || "photo"}`
      }));

      added.forEach((photo) => photos.set(photo.id, photo));
      notify(listeners);
      return added;
    },

    async listRoutePhotos(routeId) {
      return Array.from(photos.values()).filter((photo) => photo.routeId === routeId);
    },

    async countPhotosByRoute() {
      return Array.from(photos.values()).reduce<PhotoCountByRoute>((counts, photo) => {
        counts[photo.routeId] = (counts[photo.routeId] ?? 0) + 1;
        return counts;
      }, {});
    },

    async deleteRoutePhoto(photoId) {
      photos.delete(photoId);
      notify(listeners);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

export function createLocalStoragePhotoLibrary(): PhotoLibrary {
  const listeners = new Set<() => void>();
  const key = "freetrip:route-photos:v1";

  return {
    async addRoutePhotos(routeId, stopId, files) {
      const existing = readLocalStoragePhotos(key);
      const added = await Promise.all(
        Array.from(files).map(async (file) => ({
          id: createPhotoId(routeId),
          routeId,
          stopId,
          name: file.name || "photo",
          type: file.type || "image/jpeg",
          size: file.size,
          addedAt: new Date().toISOString(),
          dataUrl: await readFileAsDataUrlWithFallback(file, routeId)
        }))
      );

      writeLocalStoragePhotos(key, [...existing, ...added]);
      notify(listeners);
      return added;
    },

    async listRoutePhotos(routeId) {
      return readLocalStoragePhotos(key).filter((photo) => photo.routeId === routeId);
    },

    async countPhotosByRoute() {
      return readLocalStoragePhotos(key).reduce<PhotoCountByRoute>((counts, photo) => {
        counts[photo.routeId] = (counts[photo.routeId] ?? 0) + 1;
        return counts;
      }, {});
    },

    async deleteRoutePhoto(photoId) {
      writeLocalStoragePhotos(
        key,
        readLocalStoragePhotos(key).filter((photo) => photo.id !== photoId)
      );
      notify(listeners);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

function createUnsupportedPhotoLibrary(): PhotoLibrary {
  const subscribe = () => () => undefined;

  return {
    async addRoutePhotos() {
      throw new Error("当前浏览器不支持 IndexedDB，无法保存本地照片。");
    },
    async listRoutePhotos() {
      return [];
    },
    async countPhotosByRoute() {
      return {};
    },
    async deleteRoutePhoto() {
      return undefined;
    },
    subscribe
  };
}

export function canStoreRoutePhotos() {
  return typeof indexedDB !== "undefined";
}

function canUseLocalStorage() {
  return typeof localStorage !== "undefined";
}

function createPhotoId(routeId: string) {
  return `${routeId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("routeId", "routeId", { unique: false });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB 打开失败。"));
  });
}

function transactionComplete(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  write: (store: IDBObjectStore) => void
) {
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    write(transaction.objectStore(storeName));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB 写入失败。"));
  });
}

function readByRouteId(db: IDBDatabase, routeId: string): Promise<LocalRoutePhoto[]> {
  return new Promise((resolve, reject) => {
    const request = db
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME)
      .index("routeId")
      .getAll(routeId);
    request.onsuccess = () => resolve(request.result as LocalRoutePhoto[]);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB 读取失败。"));
  });
}

function readAllPhotos(db: IDBDatabase): Promise<LocalRoutePhoto[]> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as LocalRoutePhoto[]);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB 读取失败。"));
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("图片读取失败。"));
    reader.readAsDataURL(file);
  });
}

async function readFileAsDataUrlWithFallback(file: File, routeId: string): Promise<string> {
  if (typeof FileReader === "undefined") {
    return `memory://${routeId}/${file.name || "photo"}`;
  }

  return readFileAsDataUrl(file);
}

function readLocalStoragePhotos(key: string): LocalRoutePhoto[] {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LocalRoutePhoto[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalStoragePhotos(key: string, photos: LocalRoutePhoto[]) {
  localStorage.setItem(key, JSON.stringify(photos));
}

function notify(listeners: Set<() => void>) {
  listeners.forEach((listener) => listener());
}
