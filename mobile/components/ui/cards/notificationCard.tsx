import React from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import DashboardCard from "./dashboardCard";
import { Ionicons } from "@expo/vector-icons";
import cardStyles from "../../../constants/styles/card-styles";
import {colors, Colors} from "@/constants/theme";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timeAgo: string;
}

interface NotificationsProps {
  notifications: NotificationItem[];
  onPressViewAll?: () => void;
  width?: number | string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export default function NotificationsCard({
  notifications,
  onPressViewAll,
  width,
  height,
  style,
}: NotificationsProps) {
  const hasNotifications = notifications && notifications.length > 0;

  return (
    <DashboardCard width={width} height={height} style={style}>
      <View style={styles.headerRow}>
        <View style={styles.headerLabel}>
          <Ionicons
            name="notifications-outline"
            size={18}
            color="#2563EB"
            style={styles.headerIcon}
          />
          <Text style={[cardStyles.labelBold, { color: Colors.light.text }, styles.title]}>
            Notifications
          </Text>
        </View>
      </View>

      {!hasNotifications && (
        <Text style={styles.emptyText}>
          No new notifications. You’re all caught up!
        </Text>
      )}

      {hasNotifications &&
        notifications.map((n) => (
          <View key={n.id} style={styles.itemRow}>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
                {n.title}
              </Text>
            </View>
          </View>
        ))}
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
  },
  headerLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    marginRight: 8,
  },
  emptyText: {
    fontSize: 13,
    color: "rgba(0,0,0,0.6)",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
});
