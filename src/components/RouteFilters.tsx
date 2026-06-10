import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DurationType } from "@/domain/routes";
import { colors, radius, spacing } from "@/styles/theme";

const durationOptions: Array<{ label: string; value: DurationType }> = [
  { label: "今天半日", value: "half_day" },
  { label: "今天一日", value: "one_day" },
  { label: "周末两日", value: "weekend" }
];

type RouteFiltersProps = {
  durationType: DurationType;
  selectedTags: string[];
  tags: string[];
  onDurationChange: (durationType: DurationType) => void;
  onToggleTag: (tag: string) => void;
};

export function RouteFilters({
  durationType,
  selectedTags,
  tags,
  onDurationChange,
  onToggleTag
}: RouteFiltersProps) {
  return (
    <View style={styles.container}>
      <View style={styles.segment}>
        {durationOptions.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onDurationChange(option.value)}
            style={[
              styles.segmentItem,
              durationType === option.value && styles.segmentItemActive
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                durationType === option.value && styles.segmentTextActive
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagRow}
      >
        {tags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <Pressable
              key={tag}
              onPress={() => onToggleTag(tag)}
              style={[styles.tag, active && styles.tagActive]}
            >
              <Text style={[styles.tagText, active && styles.tagTextActive]}>
                {tag}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  segmentItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center"
  },
  segmentItemActive: {
    backgroundColor: colors.primary
  },
  segmentText: {
    color: colors.muted,
    fontWeight: "700"
  },
  segmentTextActive: {
    color: "#ffffff"
  },
  tagRow: {
    gap: spacing.sm,
    paddingRight: spacing.lg
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border
  },
  tagActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark
  },
  tagText: {
    color: colors.muted,
    fontWeight: "600"
  },
  tagTextActive: {
    color: "#ffffff"
  }
});
