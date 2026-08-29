import { Screen } from "../../components/ui/screen";
import { ThemedText } from "../../components/ui/themed-text";

export default function DownloadScreen() {
  return (
    <Screen>
      <ThemedText variant="title" className="mt-4">Download</ThemedText>
      <ThemedText variant="title" className="mt-5 bg-red-500">This is Download</ThemedText>
    </Screen>
  );
}