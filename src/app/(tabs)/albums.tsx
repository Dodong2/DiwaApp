import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { ListMusic, Plus, Search } from "lucide-react-native";
import { Screen } from "../../components/ui/screen";
import { ThemedText } from "../../components/ui/themed-text";
import { LibraryTile } from "../../components/ui/library-tile";
import { MoodCard } from "../../components/ui/mood-card";
import { CreateFolderModal } from "../../components/ui/create-folder-modal";
import { AlbumPlayerModal } from "../../components/ui/album-player-modal";
import { SearchModal } from "../../components/ui/search-modal";
import { useMusicLibrary } from "../../hooks/use-music-library";
import { useFoldersStore, Folder } from "../../store/folders-store";
import { usePlayerActions } from "../../store/player-store";
import { useAlbumSearchHistoryStore } from "../../store/search-history-store";
import { colors, spacing } from "../../constants/theme";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";

export default function AlbumsScreen() {
  const { tracks } = useMusicLibrary();
  const folders = useFoldersStore((s) => s.folders);
  const actions = usePlayerActions();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);

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

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 140, gap: spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <ThemedText variant="title">Albums</ThemedText>
          <AnimatedIconButton onPress={() => setSearchVisible(true)}>
            <Search color={colors.cream} size={22} />
          </AnimatedIconButton>
        </View>

        <View style={{ flexDirection: "row", gap: spacing.md }}>
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
        </View>

        {folders.length > 0 && (
          <View style={{ gap: spacing.md }}>
            {folders.map((folder) => (
              <MoodCard
                key={folder.id}
                title={folder.name}
                subtitle={`${folder.trackIds.length} songs`}
                linkedAlbumId={folder.linkedAlbumId}
                fallbackImageUri={`https://picsum.photos/seed/${folder.id}/600/800`}
                trackIds={folder.trackIds}
                onPlay={() => handlePlayFolder(folder.id)}
                onPressImage={() => setActiveFolderId(folder.id)}
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
    </Screen>
  );
}