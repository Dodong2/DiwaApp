import * as MediaLibrary from "expo-media-library/legacy";
import { useCallback, useEffect, useState } from "react";

export type Track = {
  id: string;
  title: string;
  uri: string;
  duration: number;
};

type PermissionState = "checking" | "granted" | "denied";

export function useMusicLibrary() {
  const [permission, setPermission] = useState<PermissionState>("checking");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTracks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 200,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      const mapped: Track[] = result.assets.map((asset) => ({
        id: asset.id,
        title: asset.filename.replace(/\.[^/.]+$/, ""), // strip file extension for display
        uri: asset.uri,
        duration: asset.duration,
      }));

      setTracks(mapped);
    } catch (error) {
      console.log("Failed to load tracks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestAccess = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === "granted") {
      setPermission("granted");
      await loadTracks();
    } else {
      setPermission("denied");
    }
  }, [loadTracks]);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.getPermissionsAsync();
      if (status === "granted") {
        setPermission("granted");
        await loadTracks();
      } else {
        setPermission("checking"); // will show the "grant permission" screen
      }
    })();
  }, [loadTracks]);

  return { permission, tracks, loading, requestAccess };
}
