import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>❤️ Meme Yêu Thích</Text>
        <Text style={styles.headerSubtitle}>Bộ sưu tập lưu trữ cá nhân</Text>
      </View>

      {/* Giao diện trạng thái rỗng (Empty State) */}
      <View style={styles.emptyContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="bookmark-outline" size={48} color="#64748B" />
        </View>
        <Text style={styles.emptyTitle}>Chưa có meme nào được lưu!</Text>
        <Text style={styles.emptyDesc}>
          Hãy khám phá bảng tin và bấm lưu các meme bạn thấy tâm đắc nhất nhé.
        </Text>

        <TouchableOpacity
          style={styles.exploreBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text style={styles.exploreBtnText}>Khám phá ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF4500',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
