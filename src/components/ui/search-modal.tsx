import { useState, useMemo, ReactNode } from "react";
import { Modal, View, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, X, Clock, Search as SearchIcon } from "lucide-react-native";
import { ThemedText } from "./themed-text";
import { formatRelativeDate } from "../../utils/format-date";
import { colors, spacing, radius } from "../../constants/theme";

const HISTORY_PREVIEW_COUNT = 5;

type SearchHistoryEntry = { term: string; timestamp: number };

// The shape any history store hook must return — both useMusicSearchHistoryStore
// and useAlbumSearchHistoryStore (and any future one) match this shape.
type SearchHistoryStoreHook = () => {
  history: SearchHistoryEntry[];
  addSearch: (query: string) => void;
};

type Props<T> = {
  visible: boolean;
  onClose: () => void;
  items: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string; // main text, also what's matched against the query
  getSubLabel?: (item: T) => string; // optional smaller line under the main label
  onSelect: (item: T, index: number, list: T[]) => void;
  useHistoryStore: SearchHistoryStoreHook;
  placeholder?: string;
  emptyLabel?: string; // e.g. "songs" or "albums", used in "No {emptyLabel} found for ..."
};

export function SearchModal<T>({
  visible,
  onClose,
  items,
  getId,
  getLabel,
  getSubLabel,
  onSelect,
  useHistoryStore,
  placeholder = "Search",
  emptyLabel = "results",
}: Props<T>) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);

  const { history, addSearch } = useHistoryStore();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return items.filter((item) => getLabel(item).toLowerCase().includes(q));
  }, [items, query, getLabel]);

  const visibleHistory = showAllHistory ? history : history.slice(0, HISTORY_PREVIEW_COUNT);

  const handleClose = () => {
    setQuery("");
    setShowAllHistory(false);
    onClose();
  };

  const handleSelect = (item: T, index: number, list: T[]) => {
    if (query.trim()) addSearch(query);
    onSelect(item, index, list);
    handleClose();
  };

  const handleHistoryTap = (term: string) => {
    setQuery(term);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.iconButton}>
            <ArrowLeft color={colors.cream} size={22} />
          </Pressable>

          <View style={styles.searchBar}>
            <SearchIcon color={colors.muted} size={18} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
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

        {query.trim() ? (
          <FlatList
            data={results}
            keyExtractor={getId}
            contentContainerStyle={{ paddingHorizontal: spacing.md }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <Pressable
                style={styles.resultRow}
                onPress={() => handleSelect(item, index, results)}
              >
                <ThemedText variant="body">{getLabel(item)}</ThemedText>
                {getSubLabel && (
                  <ThemedText variant="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    {getSubLabel(item)}
                  </ThemedText>
                )}
              </Pressable>
            )}
            ListEmptyComponent={
              <ThemedText variant="muted" style={{ marginTop: spacing.lg, textAlign: "center" }}>
                No {emptyLabel} found for "{query}"
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
                {visibleHistory.map((entry) => (
                  <Pressable
                    key={entry.term}
                    style={styles.historyRow}
                    onPress={() => handleHistoryTap(entry.term)}
                  >
                    <Clock color={colors.muted} size={16} />
                    <ThemedText variant="body" style={{ flex: 1 }}>
                      {entry.term}
                    </ThemedText>
                    <ThemedText variant="muted" style={{ fontSize: 12 }}>
                      {formatRelativeDate(entry.timestamp)}
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
    transform: [{ scale: 0.9 }],
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