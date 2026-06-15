import { useCallback, useEffect, useState } from "react";
import {
  routePhotoLibrary,
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

    routePhotoLibrary
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
    return routePhotoLibrary.subscribe(refresh);
  }, [refresh]);

  const addPhotos = useCallback(
    async (stopId: string | undefined, files: ArrayLike<File>) => {
      if (!routeId) {
        return [];
      }

      const added = await routePhotoLibrary.addRoutePhotos(routeId, stopId, files);
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
    routePhotoLibrary.countPhotosByRoute().then(setCounts).catch(() => setCounts({}));
  }, []);

  useEffect(() => {
    refresh();
    return routePhotoLibrary.subscribe(refresh);
  }, [refresh]);

  return counts;
}
