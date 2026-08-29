import { useState } from "react";
import { ScrollView } from "react-native";
import { AlbumPickerModal } from "../../components/ui/album-picker-modal";
import { MoodCard } from "../../components/ui/mood-card";
import { Screen } from "../../components/ui/screen";
import { ThemedText } from "../../components/ui/themed-text";
import { spacing } from "../../constants/theme";
import { useMoodStore } from "../../store/mood-store";

export default function AlbumsScreen() {
  // 1. State: is the "pick a photo album" modal currently open?
  //    (same useState you already know from React)
  const [pickerVisible, setPickerVisible] = useState(false);

  // 2. Zustand store: which folder name is currently waiting for an album pick.
  //    We need this because the modal is shared — we have to remember
  //    WHICH card was tapped before the modal opens.
  const [activeFolderName, setActiveFolderName] = useState<string | null>(null);

  // 3. Pull the saved links (folderName -> albumId) and the setter function
  //    from the Zustand store. Think of this like useContext, but simpler.
  const linkedAlbums = useMoodStore((s) => s.linkedAlbums);
  const linkAlbum = useMoodStore((s) => s.linkAlbum);

  // 4. Called when a MoodCard's image is tapped — remember which folder,
  //    then open the modal.
  const handlePressImage = (folderName: string) => {
    setActiveFolderName(folderName);
    setPickerVisible(true);
  };

  // 5. Called when the user picks an album inside the modal.
  const handleSelectAlbum = (albumId: string) => {
    if (activeFolderName) {
      linkAlbum(activeFolderName, albumId);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 140, gap: spacing.md }}>
        <ThemedText variant="title">Folders</ThemedText>

        {/* For now we only have one hardcoded folder ("Calm") to test with.
            Later this will be replaced by a real list of folders the user created. */}
        <MoodCard
          title="Calm"
          subtitle="12 songs • your relaxed side"
          linkedAlbumId={linkedAlbums["Calm"]}
          fallbackImageUri="https://picsum.photos/seed/calm/600/800"
          onPlay={() => console.log("play calm folder")}
          onPressImage={() => handlePressImage("Calm")}
        />
      </ScrollView>

      {/* The modal itself — it's invisible until pickerVisible is true. */}
      <AlbumPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelectAlbum}
      />
    </Screen>
  );
}