import { useState, useMemo } from "react";
import { Modal, View, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, X, Clock, Search as SearchIcon } from "lucide-react-native";
import { ThemedText } from "./themed-text";
import { Track } from "../../hooks/use-music-library";
import { useSearchHistoryStore } from "../../store/search-history-store";
import { colors, spacing, radius } from "../../constants/theme";

const HISTORY_PREVIEW_COUNT = 5;

type Props = {
  visible: boolean;
  onClose: () => void;
  tracks: Track[];
  onSelectTrack: (track: Track, index: number, list: Track[]) => void;
};

export function SearchModal({ visible, onClose, tracks, onSelectTrack }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);

  const history = useSearchHistoryStore((s) => s.history);
  const addSearch = useSearchHistoryStore((s) => s.addSearch);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return tracks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tracks, query]);

  const visibleHistory = showAllHistory ? history : history.slice(0, HISTORY_PREVIEW_COUNT);

  const handleClose = () => {
    setQuery("");
    setShowAllHistory(false);
    onClose();
  };

  const handleSelect = (track: Track, index: number, list: Track[]) => {
    if (query.trim()) addSearch(query);
    onSelectTrack(track, index, list);
    handleClose();
  };

  const handleHistoryTap = (term: string) => {
    setQuery(term);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        {/* Search bar header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.iconButton}>
            <ArrowLeft color={colors.cream} size={22} />
          </Pressable>

          <View style={styles.searchBar}>
            <SearchIcon color={colors.muted} size={18} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search your music"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              autoFocus
              onSubmitEditing={() => query.trim() && addSearch(query)}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <X color={colors.muted} size={18} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Body: either search results or search history */}
        {query.trim() ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: spacing.md }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <Pressable
                style={styles.resultRow}
                onPress={() => handleSelect(item, index, results)}
              >
                <ThemedText variant="body">{item.title}</ThemedText>
              </Pressable>
            )}
            ListEmptyComponent={
              <ThemedText variant="muted" style={{ marginTop: spacing.lg, textAlign: "center" }}>
                No songs found for "{query}"
              </ThemedText>
            }
          />
        ) : (
          <View style={{ paddingHorizontal: spacing.md }}>
            <ThemedText variant="title" style={{ fontSize: 18, marginBottom: spacing.sm }}>
              Recent Searches
            </ThemedText>

            {history.length === 0 ? (
              <ThemedText variant="muted">No recent searches yet.</ThemedText>
            ) : (
              <>
                {visibleHistory.map((term) => (
                  <Pressable
                    key={term}
                    style={styles.historyRow}
                    onPress={() => handleHistoryTap(term)}
                  >
                    <Clock color={colors.muted} size={16} />
                    <ThemedText variant="body" style={{ flex: 1 }}>
                      {term}
                    </ThemedText>
                  </Pressable>
                ))}

                {history.length > HISTORY_PREVIEW_COUNT && (
                  <Pressable onPress={() => setShowAllHistory((v) => !v)}>
                    <ThemedText variant="muted" style={{ color: colors.orange, marginTop: spacing.xs }}>
                      {showAllHistory ? "Show less" : `Show more (${history.length - HISTORY_PREVIEW_COUNT})`}
                    </ThemedText>
                  </Pressable>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  iconButton: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: colors.cream,
    fontSize: 15,
    paddingVertical: spacing.sm + 2,
  },
  resultRow: {
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
});