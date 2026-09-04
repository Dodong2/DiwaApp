import { useEffect, useRef, ReactNode, useState } from "react";
import { useAudioPlaylist, useAudioPlaylistStatus } from "expo-audio";
import { Asset } from "expo-asset";
import {
  MediaControl,
  PlaybackState,
  Command,
  MediaControlEvent,
} from "expo-media-control";
import { Track } from "../hooks/use-music-library";
import { usePlayerStore, RepeatMode } from "../store/player-store";
import { useFoldersStore } from "../store/folders-store";

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
  const queueRef = useRef<Track[]>([]);
  const originalQueueRef = useRef<Track[]>([]);

  // React to the ACTUAL resolved track (by id), not the raw numeric index —
  // the index alone can stay at the same number (e.g. 0) across two
  // genuinely different tracks/queues, which was silently breaking the
  // metadata updates below.
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  // Real local file:// URI for the app logo, resolved once via expo-asset
  // (Image.resolveAssetSource alone can return a Metro dev-server HTTP URL
  // during development, which the native module can't load as artwork).
  const [logoUri, setLogoUri] = useState<string | null>(null);
  useEffect(() => {
    const asset = Asset.fromModule(require("../../assets/images/logo.png"));
    asset.downloadAsync().then(() => {
      const uri = asset.localUri ?? asset.uri;
      console.log("📱 JS: Resolved logo asset URI:", uri);
      setLogoUri(uri);
    });
  }, []);

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
    MediaControl.updatePlaybackState(PlaybackState.STOPPED);
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

  // --- expo-media-control setup ---
  // Simplified to ONLY play/pause, per what was actually asked for — no
  // next/previous/stop buttons cluttering the notification.
  useEffect(() => {
    MediaControl.enableMediaControls({
      capabilities: [Command.PLAY, Command.PAUSE],
      compactCapabilities: [Command.PLAY],
    });

    const removeListener = MediaControl.addListener((event: MediaControlEvent) => {
      if (event.command === Command.PLAY || event.command === Command.PAUSE) {
        togglePlayPause();
      }
    });

    return () => {
      removeListener();
      MediaControl.disableMediaControls();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Metadata — now correctly re-fires whenever the actual track (by id)
  // changes, and waits for a real resolved logo URI before using it.
  useEffect(() => {
    if (!currentTrack || !logoUri) return;

    const sourceFolderId = usePlayerStore.getState().currentSourceFolderId;
    const folder = sourceFolderId
      ? useFoldersStore.getState().folders.find((f) => f.id === sourceFolderId)
      : null;

    MediaControl.updateMetadata({
      title: currentTrack.title,
      artist: folder ? folder.name : "Diwa",
      album: folder ? folder.name : "All Music",
      artwork: { uri: logoUri },
    });
  }, [currentTrack?.id, logoUri]);

  // Play/pause state — deliberately not tied to currentTime (avoids
  // spamming the native side every 500ms, which the library's docs warn
  // against — it interrupts the notification's own progress animation).
  useEffect(() => {
    if (!currentTrack) return;
    MediaControl.updatePlaybackState(
      status.playing ? PlaybackState.PLAYING : PlaybackState.PAUSED,
      status.currentTime,
      status.playing ? 1.0 : 0.0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.playing, currentTrack?.id]);

  return <>{children}</>;
}