import { create } from "zustand";

export type Folder = {
  id: string;
  name: string;
  trackIds: string[];
  linkedAlbumId?: string; // photo album linked for art, set later via AlbumPickerModal
};

type FoldersStore = {
  folders: Folder[];
  addFolder: (name: string, trackIds: string[]) => void;
  linkAlbum: (folderId: string, albumId: string) => void;
  removeTrackFromFolder: (folderId: string, trackId: string) => void;
  addTrackToFolder: (folderId: string, trackId: string) => void;
};

export const useFoldersStore = create<FoldersStore>((set) => ({
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
}));