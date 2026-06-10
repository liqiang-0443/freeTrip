import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { routeSeed } from "@/data/routes.seed";
import { useUserRoutes } from "@/hooks/useUserRoutes";
import { colors, radius, spacing } from "@/styles/theme";

export default function LibraryScreen() {
  const { states } = useUserRoutes();
  const savedRoutes = routeSeed.filter((route) => {
    const state = states[route.id];
    return state?.collected || state?.plannedDate || state?.visitedAt;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>我的路线库</Text>
        <Text style={styles.subtitle}>收藏、计划和去过的路线会在这里沉淀。</Text>

        {savedRoutes.length === 0 ? (
          <EmptyState title="还没有保存路线" body="从推荐页收藏或计划一条路线后，这里会出现你的个人路线库。" />
        ) : (
          savedRoutes.map((route) => {
            const state = states[route.id];
            return (
              <Link key={route.id} href={`/route/${route.id}`} style={styles.item}>
                <Text style={styles.itemTitle}>{route.title}</Text>
                <View style={styles.badges}>
                  {state?.collected ? <Text style={styles.badge}>已收藏</Text> : null}
                  {state?.plannedDate ? <Text style={styles.badge}>计划 {state.plannedDate}</Text> : null}
                  {state?.visitedAt ? <Text style={styles.badge}>去过 {state.visitedAt}</Text> : null}
                  {state?.photos?.length ? <Text style={styles.badge}>照片 {state.photos.length}</Text> : null}
                </View>
              </Link>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    paddingTop: spacing.md
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md
  },
  item: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg
  },
  itemTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.md
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  badge: {
    color: colors.primaryDark,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    overflow: "hidden",
    fontWeight: "700"
  }
});
