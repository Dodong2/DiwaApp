import { create } from "zustand";

type MoodStore = {
  linkedAlbums: Record<string, string>; // folderName -> albumId
  linkAlbum: (folderName: string, albumId: string) => void;
};

export const useMoodStore = create<MoodStore>((set) => ({
  linkedAlbums: {},
  linkAlbum: (folderName, albumId) =>
    set((state) => ({
      linkedAlbums: { ...state.linkedAlbums, [folderName]: albumId },
    })),
}));
