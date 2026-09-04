import { useEffect, useRef, ReactNode } from "react";
import { useAudioPlaylist, useAudioPlaylistStatus } from "expo-audio";
import { Track } from "../hooks/use-music-library";
import { usePlayerStore, RepeatMode } from "../store/player-store";

// Simple Fisher-Yates shuffle — no library needed for this.
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playlist = useAudioPlaylist({ sources: [], loop: "all" });
  const status = useAudioPlaylistStatus(playlist);

  // `queueRef` = whatever order is CURRENTLY loaded into the native playlist
  // (may be shuffled). `originalQueueRef` = the canonical, un-shuffled order
  // as the user originally requested it — needed so we can restore it when
  // shuffle is turned back off.
  const queueRef = useRef<Track[]>([]);
  const originalQueueRef = useRef<Track[]>([]);

  // Internal helper: loads a given track order into the native playlist,
  // starting at a given index. Does NOT touch originalQueueRef — only the
  // public playQueue (a fresh request from a screen) does that.
  const loadQueue = (tracks: Track[], startIndex: number) => {
    playlist.clear();
    tracks.forEach((t) => playlist.add({ uri: t.uri, name: t.title }));
    queueRef.current = tracks;
    playlist.skipTo(startIndex);
    playlist.play();
  };

  const playQueue = (tracks: Track[], startIndex: number, sourceFolderId?: string) => {
    originalQueueRef.current = tracks;
    usePlayerStore.setState({
      isShuffled: false,
      currentSourceFolderId: sourceFolderId ?? null,
    });
    loadQueue(tracks, startIndex);
  };

  const togglePlayPause = () => {
    if (usePlayerStore.getState().isPlaying) {
      playlist.pause();
    } else {
      playlist.play();
    }
  };

  const stop = () => {
    playlist.pause();
    playlist.clear();
    queueRef.current = [];
    originalQueueRef.current = [];
    usePlayerStore.setState({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isExpanded: false,
      isShuffled: false,
      currentSourceFolderId: null,
    });
  };

  const toggleShuffle = () => {
    const currentId = usePlayerStore.getState().currentTrack?.id;
    const willBeShuffled = !usePlayerStore.getState().isShuffled;

    if (willBeShuffled) {
      const shuffled = shuffleArray(originalQueueRef.current);
      const idx = Math.max(0, shuffled.findIndex((t) => t.id === currentId));
      loadQueue(shuffled, idx);
    } else {
      const idx = Math.max(0, originalQueueRef.current.findIndex((t) => t.id === currentId));
      loadQueue(originalQueueRef.current, idx);
    }

    usePlayerStore.setState({ isShuffled: willBeShuffled });
  };

  const cycleRepeatMode = () => {
    const order: RepeatMode[] = ["off", "all", "one"];
    const current = usePlayerStore.getState().repeatMode;
    const next = order[(order.indexOf(current) + 1) % order.length];

    playlist.loop = next === "off" ? "none" : next === "all" ? "all" : "single";
    usePlayerStore.setState({ repeatMode: next });
  };

  useEffect(() => {
    usePlayerStore.setState({
      actions: {
        playQueue,
        togglePlayPause,
        next: () => playlist.next(),
        previous: () => playlist.previous(),
        stop,
        seekTo: (seconds: number) => {
          playlist.seekTo(seconds);
        },
        toggleShuffle,
        cycleRepeatMode,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
