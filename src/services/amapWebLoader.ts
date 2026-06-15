export type AmapWebApi = {
  Map: new (container: HTMLElement, options?: Record<string, unknown>) => AmapWebMap;
  Marker: new (options?: Record<string, unknown>) => AmapWebOverlay;
  Polyline: new (options?: Record<string, unknown>) => AmapWebOverlay;
  LngLat: new (longitude: number, latitude: number) => unknown;
  Pixel: new (x: number, y: number) => unknown;
};

export type AmapWebMap = {
  destroy: () => void;
  setFitView: (overlays?: AmapWebOverlay[]) => void;
};

export type AmapWebOverlay = {
  setMap: (map: AmapWebMap | null) => void;
  on?: (eventName: string, handler: () => void) => void;
};

declare global {
  interface Window {
    AMap?: AmapWebApi;
  }
}

const SDK_ID = "amap-web-sdk";

let sdkPromise: Promise<AmapWebApi> | undefined;

export function getAmapWebKey(): string | undefined {
  const key = process.env.EXPO_PUBLIC_AMAP_WEB_KEY?.trim();
  return key || undefined;
}

export function loadAmapWebSdk(key = getAmapWebKey()): Promise<AmapWebApi> {
  if (!key) {
    return Promise.reject(new Error("缺少 EXPO_PUBLIC_AMAP_WEB_KEY，无法加载高德 Web 地图。"));
  }

  if (typeof window !== "undefined" && window.AMap) {
    return Promise.resolve(window.AMap);
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("高德 Web 地图只能在浏览器环境中加载。"));
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SDK_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.AMap) {
          resolve(window.AMap);
        } else {
          reject(new Error("高德 Web 地图脚本已加载，但 AMap 对象不存在。"));
        }
      });
      existingScript.addEventListener("error", () => {
        reject(new Error("高德 Web 地图脚本加载失败。"));
      });
      return;
    }

    const script = document.createElement("script");
    script.id = SDK_ID;
    script.async = true;
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`;
    script.addEventListener("load", () => {
      if (window.AMap) {
        resolve(window.AMap);
      } else {
        reject(new Error("高德 Web 地图脚本已加载，但 AMap 对象不存在。"));
      }
    });
    script.addEventListener("error", () => {
      reject(new Error("高德 Web 地图脚本加载失败。"));
    });

    document.head.appendChild(script);
  });

  return sdkPromise;
}

export function resetAmapWebLoaderForTests() {
  sdkPromise = undefined;
}
