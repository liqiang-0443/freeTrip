import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRoutePhotoLibrary,
  type LocalRoutePhoto,
  type PhotoCountByRoute
} from "@/services/photoLibrary";

export function useRoutePhotos(routeId: string | undefined) {
  const [storedPhotos, setStoredPhotos] = useState<LocalRoutePhoto[]>([]);
  const [sessionPhotos, setSessionPhotos] = useState<LocalRoutePhoto[]>([]);
  const [error, setError] = useState<string | undefined>();
  const photos = useMemo(
    () => mergePhotos(storedPhotos, sessionPhotos),
    [sessionPhotos, storedPhotos]
  );

  const refresh = useCallback(() => {
    if (!routeId) {
      setStoredPhotos([]);
      setSessionPhotos([]);
      return;
    }

    getRoutePhotoLibrary()
      .listRoutePhotos(routeId)
      .then((nextPhotos) => {
        setStoredPhotos(nextPhotos);
        setError(undefined);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "照片读取失败。");
      });
  }, [routeId]);

  useEffect(() => {
    refresh();
    return getRoutePhotoLibrary().subscribe(refresh);
  }, [refresh]);

  const addPhotos = useCallback(
    async (stopId: string | undefined, files: ArrayLike<File>) => {
      if (!routeId) {
        return [];
      }

      const previews = Array.from(files).map((file) =>
        createSessionPhoto(routeId, stopId, file)
      );
      setSessionPhotos((current) => mergePhotos(current, previews));

      try {
        const added = await getRoutePhotoLibrary().addRoutePhotos(routeId, stopId, files);
        setSessionPhotos((current) =>
          current.filter((photo) => !previews.some((preview) => preview.id === photo.id))
        );
        refresh();
        return added;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "照片保存失败，但已保留当前预览。");
        return previews;
      }
    },
    [refresh, routeId]
  );

  return {
    photos,
    error,
    addPhotos,
    refresh
  };
}

function createSessionPhoto(
  routeId: string,
  stopId: string | undefined,
  file: File
): LocalRoutePhoto {
  return {
    id: `session-${routeId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    routeId,
    stopId,
    name: file.name || "photo",
    type: file.type || "image/jpeg",
    size: file.size,
    addedAt: new Date().toISOString(),
    dataUrl:
      typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(file)
        : ""
  };
}

function mergePhotos(left: LocalRoutePhoto[], right: LocalRoutePhoto[]) {
  const seen = new Set<string>();
  return [...left, ...right].filter((photo) => {
    if (seen.has(photo.id)) {
      return false;
    }
    seen.add(photo.id);
    return true;
  });
}

export function useRoutePhotoCounts() {
  const [counts, setCounts] = useState<PhotoCountByRoute>({});

  const refresh = useCallback(() => {
    getRoutePhotoLibrary().countPhotosByRoute().then(setCounts).catch(() => setCounts({}));
  }, []);

  useEffect(() => {
    refresh();
    return getRoutePhotoLibrary().subscribe(refresh);
  }, [refresh]);

  return counts;
}
