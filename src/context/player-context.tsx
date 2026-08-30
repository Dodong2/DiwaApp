import { useEffect, useRef, ReactNode } from "react";
import { useAudioPlaylist, useAudioPlaylistStatus } from "expo-audio";
import { Track } from "../hooks/use-music-library";
import { usePlayerStore } from "../store/player-store";

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

  const stop = () => {
    playlist.pause();
    playlist.clear();
    queueRef.current = [];
    // Set this directly too, so the UI updates instantly instead of waiting
    // for the next async status tick from expo-audio.
    usePlayerStore.setState({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isExpanded: false,
    });
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