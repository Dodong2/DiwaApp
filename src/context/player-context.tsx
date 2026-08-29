import { useAudioPlaylist, useAudioPlaylistStatus } from "expo-audio";
import { ReactNode, useEffect, useRef } from "react";
import { Track } from "../hooks/use-music-library";
import { usePlayerStore } from "../store/player-store";

// This component's only job is to own the expo-audio hooks (which MUST live
// inside a React component) and mirror their state into the Zustand store.
// Nothing renders here visually — it's a silent bridge, mounted once at the app root.
export function PlayerProvider({ children }: { children: ReactNode }) {
  const playlist = useAudioPlaylist({ sources: [], loop: "all" });
  const status = useAudioPlaylistStatus(playlist);
  const queueRef = useRef<Track[]>([]);

  const playQueue = (tracks: Track[], startIndex: number) => {
    playlist.clear();
    tracks.forEach((t) => playlist.add({ uri: t.uri, name: t.title }));
    queueRef.current = tracks;
    playlist.skipTo(startIndex);
    playlist.play();
  };

  const togglePlayPause = () => {
    if (usePlayerStore.getState().isPlaying) {
      playlist.pause();
    } else {
      playlist.play();
    }
  };

  // Register the actions once — they close over `playlist`, which stays the
  // same instance for this component's lifetime.
  useEffect(() => {
    usePlayerStore.setState({
      actions: {
        playQueue,
        togglePlayPause,
        next: () => playlist.next(),
        previous: () => playlist.previous(),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push every status change from expo-audio into the store.
  useEffect(() => {
    usePlayerStore.setState({
      currentTrack: queueRef.current[status.currentIndex] ?? null,
      isPlaying: status.playing,
      currentTime: status.currentTime,
      duration: status.duration,
    });
  }, [status.currentIndex, status.playing, status.currentTime, status.duration]);

  return <>{children}</>;
}