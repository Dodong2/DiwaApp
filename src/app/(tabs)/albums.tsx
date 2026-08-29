import { useState } from "react";
import { View, ScrollView } from "react-native";
import { ListMusic, Plus } from "lucide-react-native";
import { Screen } from "../../components/ui/screen";
import { ThemedText } from "../../components/ui/themed-text";
import { LibraryTile } from "../../components/ui/library-tile";
import { MoodCard } from "../../components/ui/mood-card";
import { CreateFolderModal } from "../../components/ui/create-folder-modal";
import { AlbumPickerModal } from "../../components/ui/album-picker-modal";
import { useMusicLibrary } from "../../hooks/use-music-library";
import { useFoldersStore } from "../../store/folders-store";
import { usePlayerActions } from "../../store/player-store";
import { colors, spacing } from "../../constants/theme";

export default function AlbumsScreen() {
  const { tracks } = useMusicLibrary();
  const folders = useFoldersStore((s) => s.folders);
  const linkAlbum = useFoldersStore((s) => s.linkAlbum);
  const actions = usePlayerActions();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [albumPickerVisible, setAlbumPickerVisible] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  const handlePlayAllMusic = () => {
    if (tracks.length > 0) actions?.playQueue(tracks, 0);
  };

  const handlePressFolderImage = (folderId: string) => {
    setActiveFolderId(folderId);
    setAlbumPickerVisible(true);
  };

  const handleSelectAlbum = (albumId: string) => {
    if (activeFolderId) linkAlbum(activeFolderId, albumId);
  };

  const handlePlayFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;
    // resolve trackIds back into full Track objects, in the order they were added
    const folderTracks = folder.trackIds
      .map((id) => tracks.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => Boolean(t));
    if (folderTracks.length > 0) actions?.playQueue(folderTracks, 0);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 140, gap: spacing.md }}>
        <ThemedText variant="title">Albums</ThemedText>

        {/* Two static tiles: ALL MUSIC and + to create a new folder */}
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

        {/* User-created folders */}
        {folders.length > 0 && (
          <View style={{ gap: spacing.md }}>
            {folders.map((folder) => (
              <MoodCard
                key={folder.id}
                title={folder.name}
                subtitle={`${folder.trackIds.length} songs`}
                linkedAlbumId={folder.linkedAlbumId}
                fallbackImageUri={`https://picsum.photos/seed/${folder.id}/600/800`}
                onPlay={() => handlePlayFolder(folder.id)}
                onPressImage={() => handlePressFolderImage(folder.id)}
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

      <AlbumPickerModal
        visible={albumPickerVisible}
        onClose={() => setAlbumPickerVisible(false)}
        onSelect={handleSelectAlbum}
      />
    </Screen>
  );
}