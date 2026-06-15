import {
  canStoreRoutePhotos,
  createMemoryPhotoLibrary,
  getRoutePhotoLibrary,
  resetRoutePhotoLibraryForTests
} from "./photoLibrary";

describe("photoLibrary", () => {
  const originalIndexedDb = globalThis.indexedDB;

  afterEach(() => {
    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      value: originalIndexedDb
    });
    resetRoutePhotoLibraryForTests();
  });

  it("adds and lists photos by route", async () => {
    const library = createMemoryPhotoLibrary();
    const file = new File(["image"], "taiping.jpg", { type: "image/jpeg" });

    const added = await library.addRoutePhotos("qinling-taiping", "taiping-park", [file]);
    const photos = await library.listRoutePhotos("qinling-taiping");

    expect(added).toHaveLength(1);
    expect(photos).toMatchObject([
      {
        routeId: "qinling-taiping",
        stopId: "taiping-park",
        name: "taiping.jpg",
        type: "image/jpeg"
      }
    ]);
  });

  it("counts and deletes route photos", async () => {
    const library = createMemoryPhotoLibrary();
    const file = new File(["image"], "one.jpg", { type: "image/jpeg" });
    const [photo] = await library.addRoutePhotos("route-a", undefined, [file]);
    await library.addRoutePhotos("route-b", undefined, [file]);

    expect(await library.countPhotosByRoute()).toEqual({
      "route-a": 1,
      "route-b": 1
    });

    await library.deleteRoutePhoto(photo.id);

    expect(await library.countPhotosByRoute()).toEqual({
      "route-b": 1
    });
  });

  it("notifies subscribers after mutations", async () => {
    const library = createMemoryPhotoLibrary();
    const listener = vi.fn();
    const unsubscribe = library.subscribe(listener);

    const [photo] = await library.addRoutePhotos("route-a", undefined, [
      new File(["image"], "one.jpg", { type: "image/jpeg" })
    ]);
    await library.deleteRoutePhoto(photo.id);
    unsubscribe();
    await library.addRoutePhotos("route-a", undefined, [
      new File(["image"], "two.jpg", { type: "image/jpeg" })
    ]);

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("chooses the browser photo library from the current IndexedDB capability", async () => {
    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      value: undefined
    });
    resetRoutePhotoLibraryForTests();

    expect(canStoreRoutePhotos()).toBe(false);
    await expect(
      getRoutePhotoLibrary().addRoutePhotos("route-a", undefined, [
        new File(["image"], "one.jpg", { type: "image/jpeg" })
      ])
    ).rejects.toThrow("IndexedDB");

    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      value: { open: vi.fn() }
    });
    resetRoutePhotoLibraryForTests();

    expect(canStoreRoutePhotos()).toBe(true);
  });

  it("falls back to localStorage when IndexedDB is unavailable", async () => {
    const storage = new Map<string, string>();
    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      value: undefined
    });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key)
      }
    });
    resetRoutePhotoLibraryForTests();

    const [photo] = await getRoutePhotoLibrary().addRoutePhotos("route-a", "stop-a", [
      new File(["image"], "fallback.jpg", { type: "image/jpeg" })
    ]);
    const photos = await getRoutePhotoLibrary().listRoutePhotos("route-a");

    expect(photo.dataUrl).toContain("route-a");
    expect(photos).toMatchObject([
      {
        routeId: "route-a",
        stopId: "stop-a",
        name: "fallback.jpg"
      }
    ]);
  });
});
