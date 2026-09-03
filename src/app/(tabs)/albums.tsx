import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { EaseView } from "react-native-ease";
import { ListMusic, Plus, Search, CheckSquare, Trash2 } from "lucide-react-native";
import { Screen } from "../../components/ui/screen";
import { ThemedText } from "../../components/ui/themed-text";
import { LibraryTile } from "../../components/ui/library-tile";
import { MoodCard } from "../../components/ui/mood-card";
import { CreateFolderModal } from "../../components/ui/create-folder-modal";
import { AlbumPlayerModal } from "../../components/ui/album-player-modal";
import { SearchModal } from "../../components/ui/search-modal";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import { AnimatedIconButton } from "../../components/ui/animated-icon-button";
import { useMusicLibrary } from "../../hooks/use-music-library";
import { useFoldersStore, Folder } from "../../store/folders-store";
import { usePlayerActions } from "../../store/player-store";
import { useAlbumSearchHistoryStore } from "../../store/search-history-store";
import { useToastStore } from "../../store/toast-store";
import { colors, spacing } from "../../constants/theme";

export default function AlbumsScreen() {
  const { tracks } = useMusicLibrary();
  const folders = useFoldersStore((s) => s.folders);
  const deleteFolders = useFoldersStore((s) => s.deleteFolders);
  const actions = usePlayerActions();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);

  // Selection mode: entered via long-press on a card.
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const activeFolder = folders.find((f) => f.id === activeFolderId) ?? null;

  const handlePlayAllMusic = () => {
    if (tracks.length > 0) actions?.playQueue(tracks, 0);
  };

  const handlePlayFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;
    const folderTracks = folder.trackIds
      .map((id) => tracks.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t));
    if (folderTracks.length > 0) actions?.playQueue(folderTracks, 0);
  };

  const handleLongPressCard = (folderId: string) => {
    setSelectionMode(true);
    setSelectedIds([folderId]);
  };

  const toggleSelect = (folderId: string) => {
    setSelectedIds((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedIds.length === folders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(folders.map((f) => f.id));
    }
  };

  const handleDeletePress = () => {
    if (selectedIds.length === 0) {
      // nothing selected — treat as "exit selection mode" instead of showing a pointless confirm dialog
      setSelectionMode(false);
      return;
    }
    setConfirmDeleteVisible(true);
  };

  const handleConfirmDelete = () => {
    const count = selectedIds.length;
    deleteFolders(selectedIds);
    setConfirmDeleteVisible(false);
    setSelectionMode(false);
    setSelectedIds([]);
    useToastStore.getState().show(`Deleted ${count} album${count > 1 ? "s" : ""}`);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 140, gap: spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <ThemedText variant="title">Albums</ThemedText>
          <Pressable onPress={() => setSearchVisible(true)} style={{ padding: 4 }}>
            <Search color={colors.cream} size={22} />
          </Pressable>
        </View>

        {/* This row crossfades between the two normal tiles and the
            select-all/delete buttons — both are always mounted, only their
            opacity/pointerEvents change, so the transition animates smoothly
            instead of the layout abruptly swapping. */}
        <View style={{ height: 190 }}>
          <EaseView
            style={{ position: "absolute", left: 0, right: 0, flexDirection: "row", gap: spacing.md }}
            animate={{ opacity: selectionMode ? 0 : 1 }}
            transition={{ type: "timing", duration: 200 }}
            pointerEvents={selectionMode ? "none" : "auto"}
          >
            <LibraryTile
              label="All Music"
              icon={<ListMusic color={colors.orange} size={28} />}
              onPress={handlePlayAllMusic}
            />
            <LibraryTile
              label="New Folder"
              icon={<Plus color={colors.orange} size={28} />}
              onPress={() => setCreateModalVisible(true)}
              variant="dashed"
            />
          </EaseView>

          <EaseView
            style={{ position: "absolute", left: 0, right: 0, flexDirection: "row", gap: spacing.md }}
            animate={{ opacity: selectionMode ? 1 : 0 }}
            transition={{ type: "timing", duration: 200 }}
            pointerEvents={selectionMode ? "auto" : "none"}
          >
            <LibraryTile
              label={selectedIds.length === folders.length ? "Deselect" : "Select all"}
              icon={<CheckSquare color={colors.orange} size={28} />}
              onPress={handleSelectAllToggle}
            />
            <LibraryTile
              label={`Delete${selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}`}
              icon={<Trash2 color={colors.orange} size={28} />}
              onPress={handleDeletePress}
            />
          </EaseView>
        </View>

        {folders.length > 0 && (
          <View style={{ gap: spacing.md }}>
            {folders.map((folder) => (
              <MoodCard
                key={folder.id}
                title={folder.name}
                songCount={folder.trackIds.length}
                linkedAlbumId={folder.linkedAlbumId}
                fallbackImageUri={`https://picsum.photos/seed/${folder.id}/600/800`}
                trackIds={folder.trackIds}
                onPlay={() => handlePlayFolder(folder.id)}
                onPressImage={() => setActiveFolderId(folder.id)}
                selectionMode={selectionMode}
                selected={selectedIds.includes(folder.id)}
                onLongPress={() => handleLongPressCard(folder.id)}
                onToggleSelect={() => toggleSelect(folder.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <CreateFolderModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        availableTracks={tracks}
      />

      <AlbumPlayerModal
        visible={activeFolderId !== null}
        onClose={() => setActiveFolderId(null)}
        folder={activeFolder}
        allTracks={tracks}
      />

      <SearchModal<Folder>
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        items={folders}
        getId={(f) => f.id}
        getLabel={(f) => f.name}
        getSubLabel={(f) => `${f.trackIds.length} songs`}
        onSelect={(folder) => setActiveFolderId(folder.id)}
        useHistoryStore={useAlbumSearchHistoryStore}
        placeholder="Search your albums"
        emptyLabel="albums"
      />

      <ConfirmDialog
        visible={confirmDeleteVisible}
        title="Delete selected albums?"
        message={`This will remove ${selectedIds.length} album${selectedIds.length > 1 ? "s" : ""} from Diwa. This can't be undone.`}
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteVisible(false)}
      />
    </Screen>
  );
}