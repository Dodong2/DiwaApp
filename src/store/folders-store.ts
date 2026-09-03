import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { zustandMMKVStorage } from "../lib/mmkv-storage";

export type Folder = {
  id: string;
  name: string;
  trackIds: string[];
  linkedAlbumId?: string;
};

type FoldersStore = {
  folders: Folder[];
  addFolder: (name: string, trackIds: string[]) => void;
  linkAlbum: (folderId: string, albumId: string) => void;
  removeTrackFromFolder: (folderId: string, trackId: string) => void;
  addTrackToFolder: (folderId: string, trackId: string) => void;
  renameFolder: (folderId: string, newName: string) => void;
  deleteFolders: (folderIds: string[]) => void;
};

export const useFoldersStore = create<FoldersStore>()(
  persist(
    (set) => ({
      folders: [],

      addFolder: (name, trackIds) =>
        set((state) => ({
          folders: [
            ...state.folders,
            { id: Date.now().toString(), name, trackIds },
          ],
        })),

      linkAlbum: (folderId, albumId) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId ? { ...f, linkedAlbumId: albumId } : f
          ),
        })),

      removeTrackFromFolder: (folderId, trackId) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId
              ? { ...f, trackIds: f.trackIds.filter((id) => id !== trackId) }
              : f
          ),
        })),

      addTrackToFolder: (folderId, trackId) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId && !f.trackIds.includes(trackId)
              ? { ...f, trackIds: [...f.trackIds, trackId] }
              : f
          ),
        })),

      renameFolder: (folderId, newName) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId && newName.trim() ? { ...f, name: newName.trim() } : f
          ),
        })),

      deleteFolders: (folderIds) =>
        set((state) => ({
          folders: state.folders.filter((f) => !folderIds.includes(f.id)),
        })),
    }),
    {
      name: "diwa-folders", // this is the actual key used in MMKV storage
      storage: createJSONStorage(() => zustandMMKVStorage),
    }
  )
);