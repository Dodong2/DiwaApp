import * as MediaLibrary from "expo-media-library/legacy";
import { useCallback, useEffect, useState } from "react";

export type PhotoAlbum = {
  id: string;
  title: string;
  assetCount: number;
};

export function usePhotoAlbums() {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const result = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: false,
      });
      setAlbums(
        result
          .filter((a) => a.assetCount > 0)
          .map((a) => ({ id: a.id, title: a.title, assetCount: a.assetCount })),
      );
    } catch (error) {
      console.log("Failed to load photo albums:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  return { albums, loading, reload: loadAlbums };
}

// Fetches one random photo URI from a given album — used to show art on a MoodCard.
export async function getRandomPhotoFromAlbum(
  albumId: string,
): Promise<string | null> {
  try {
    const result = await MediaLibrary.getAssetsAsync({
      album: albumId,
      mediaType: MediaLibrary.MediaType.photo,
      first: 100,
    });
    if (result.assets.length === 0) return null;
    const random =
      result.assets[Math.floor(Math.random() * result.assets.length)];
    return random.uri;
  } catch (error) {
    console.log("Failed to get photo from album:", error);
    return null;
  }
}
