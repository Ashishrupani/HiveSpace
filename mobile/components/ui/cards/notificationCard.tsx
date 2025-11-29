import React from "react";
import { View, Text, StyleSheet } from "react-native";
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
}

export default function NotificationsCard({
  notifications,
  onPressViewAll,
}: NotificationsProps) {
  const hasNotifications = notifications && notifications.length > 0;

  return (
    <DashboardCard>
      <View style={styles.headerRow}>
        <Text style={[cardStyles.labelBold, { color: Colors.light.text }, styles.title]}>
          Notifications
        </Text>
        {/* Optional "View all" in the future */}
      </View>

      {!hasNotifications && (
        <Text style={styles.emptyText}>
          No new notifications. You’re all caught up!
        </Text>
      )}

      {hasNotifications &&
        notifications.map((n) => (
          <View key={n.id} style={styles.itemRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={16} color="#4B5563" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {n.title}
              </Text>
              <Text style={styles.itemBody} numberOfLines={1}>
                {n.body}
              </Text>
            </View>
            <Text style={styles.timeAgo}>{n.timeAgo}</Text>
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
  emptyText: {
    fontSize: 13,
    color: "rgba(0,0,0,0.6)",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  itemBody: {
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
  },
  timeAgo: {
    fontSize: 11,
    color: "rgba(0,0,0,0.5)",
    marginLeft: 6,
  },
});
