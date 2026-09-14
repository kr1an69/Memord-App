/**
 * FavoritesScreen/index.js
 * Module 5 - Tran Minh Hieu
 *
 * Man hinh Bo suu tap Meme Yeu thich
 * Requirements:
 *  1. Hien thi danh sach meme da luu tu DetailScreen
 *  2. Nut Xoa (thung rac) de go meme khoi danh sach
 *  3. Empty State than thien khi chua co meme nao duoc luu
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../utils/useFavorites';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_GAP = 12;
const HORIZONTAL_PADDING = 16;
const ITEM_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

// ============================================================
// Sub-component: Tung the meme trong luoi
// ============================================================
const MemeCard = ({ item, onRemove, onPress }) => {
  const aspectRatio = item.width && item.height ? item.width / item.height : 0.75;
  const itemHeight = ITEM_WIDTH / aspectRatio;

  return (
    <TouchableOpacity
      style={[styles.card, { width: ITEM_WIDTH }]}
      activeOpacity={0.85}
      onPress={() => onPress(item)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={[styles.cardImage, { height: itemHeight }]}
        resizeMode="cover"
      />
      {/* Overlay gradient phia duoi */}
      <View style={styles.cardOverlay}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.likesRow}>
              <Ionicons name="heart" size={12} color="#FF4500" />
              <Text style={styles.likesText}>
                {item.likes >= 1000
                  ? `${(item.likes / 1000).toFixed(1)}k`
                  : item.likes}
              </Text>
            </View>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
        </View>

        {/* Nut Xoa */}
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => onRemove(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ============================================================
// Sub-component: Empty State
// ============================================================
const EmptyState = ({ onExplore }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.iconCircle}>
      <Ionicons name="bookmark-outline" size={52} color="#64748B" />
    </View>
    <Text style={styles.emptyTitle}>Ban chua luu meme nao ca!</Text>
    <Text style={styles.emptyDesc}>
      Hay kham pha them nhe{'\n'}Tim thay meme ua thich va bam Luu o trang Chi tiet.
    </Text>
    <TouchableOpacity style={styles.exploreBtn} activeOpacity={0.8} onPress={onExplore}>
      <Ionicons name="sparkles" size={18} color="#FFFFFF" />
      <Text style={styles.exploreBtnText}>Kham pha ngay</Text>
    </TouchableOpacity>
  </View>
);

// ============================================================
// Main Screen Component
// ============================================================
export default function FavoritesScreen({ navigation }) {
  const { favorites, removeFavorite } = useFavorites();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Dieu huong toi DetailScreen khi bam vao 1 meme
  const handlePressItem = useCallback(
    (meme) => {
      navigation.navigate('DetailScreen', { meme });
    },
    [navigation],
  );

  // Xoa 1 meme (co confirm dialog)
  const handleRemoveSingle = useCallback(
    (meme) => {
      Alert.alert(
        'Go khoi Bo suu tap?',
        `"${meme.title}" se bi xoa khoi danh sach yeu thich.`,
        [
          { text: 'Huy', style: 'cancel' },
          {
            text: 'Xoa',
            style: 'destructive',
            onPress: () => removeFavorite(meme.id),
          },
        ],
      );
    },
    [removeFavorite],
  );

  const handleExplore = useCallback(() => {
    navigation.navigate('HomeTab');
  }, [navigation]);

  // Render tung item trong FlatList
  const renderItem = useCallback(
    ({ item }) => (
      <MemeCard item={item} onRemove={handleRemoveSingle} onPress={handlePressItem} />
    ),
    [handleRemoveSingle, handlePressItem],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bo suu tap</Text>
          <Text style={styles.headerSubtitle}>
            {favorites.length > 0
              ? `${favorites.length} meme da luu`
              : 'Chua co meme nao'}
          </Text>
        </View>
        {favorites.length > 0 && (
          <TouchableOpacity
            style={styles.clearAllBtn}
            onPress={() =>
              Alert.alert('Xoa tat ca?', 'Toan bo meme yeu thich se bi xoa.', [
                { text: 'Huy', style: 'cancel' },
                {
                  text: 'Xoa tat ca',
                  style: 'destructive',
                  onPress: () => favorites.forEach((m) => removeFavorite(m.id)),
                },
              ])
            }
          >
            <Ionicons name="trash" size={16} color="#FF4500" />
            <Text style={styles.clearAllText}>Xoa tat ca</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Noi dung chinh ─── */}
      {favorites.length === 0 ? (
        <EmptyState onExplore={handleExplore} />
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Khong can pull-to-refresh vi day la local state
        />
      )}
    </SafeAreaView>
  );
}

// ============================================================
// Styles
// ============================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
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
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4500',
  },
  clearAllText: {
    color: '#FF4500',
    fontSize: 13,
    fontWeight: '600',
  },

  // --- FlatList ---
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 14,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: COLUMN_GAP,
  },

  // --- MemeCard ---
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
  },
  cardImage: {
    width: '100%',
    backgroundColor: '#1E293B',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 24,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(11, 19, 43, 0.82)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 5,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  likesText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#334155',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  categoryText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,69,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Empty State ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF4500',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
