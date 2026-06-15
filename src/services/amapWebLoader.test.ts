import {
  getAmapWebKey,
  loadAmapWebSdk,
  resetAmapWebLoaderForTests,
  type AmapWebApi
} from "./amapWebLoader";

describe("amapWebLoader", () => {
  const originalKey = process.env.EXPO_PUBLIC_AMAP_WEB_KEY;
  const originalWindow = globalThis.window;

  afterEach(() => {
    process.env.EXPO_PUBLIC_AMAP_WEB_KEY = originalKey;
    resetAmapWebLoaderForTests();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow
    });
  });

  it("returns undefined when the web key is blank", () => {
    process.env.EXPO_PUBLIC_AMAP_WEB_KEY = " ";

    expect(getAmapWebKey()).toBeUndefined();
  });

  it("rejects with a setup message when key is missing", async () => {
    delete process.env.EXPO_PUBLIC_AMAP_WEB_KEY;

    await expect(loadAmapWebSdk()).rejects.toThrow("EXPO_PUBLIC_AMAP_WEB_KEY");
  });

  it("reuses an existing browser AMap object", async () => {
    const amap = { Map: function Map() {} } as unknown as AmapWebApi;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { AMap: amap }
    });

    await expect(loadAmapWebSdk("demo-key")).resolves.toBe(amap);
  });
});
