import { useCallback, useEffect, useState } from "react";
import {
  getRoutePhotoLibrary,
  type LocalRoutePhoto,
  type PhotoCountByRoute
} from "@/services/photoLibrary";

export function useRoutePhotos(routeId: string | undefined) {
  const [photos, setPhotos] = useState<LocalRoutePhoto[]>([]);
  const [error, setError] = useState<string | undefined>();

  const refresh = useCallback(() => {
    if (!routeId) {
      setPhotos([]);
      return;
    }

    getRoutePhotoLibrary()
      .listRoutePhotos(routeId)
      .then((nextPhotos) => {
        setPhotos(nextPhotos);
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

      const added = await getRoutePhotoLibrary().addRoutePhotos(routeId, stopId, files);
      refresh();
      return added;
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
