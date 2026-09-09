import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../utils/useFavorites';

export default function DetailScreen({ route, navigation }) {
  const meme = route.params?.meme || {
    title: 'Meme Mẫu',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    author: 'admin',
    likes: 100,
    category: 'Trending',
  };

  const [likes, setLikes] = useState(meme.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const isSaved = isFavorite(meme.id);

  const handleToggleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleToggleSave = () => {
    if (isSaved) {
      removeFavorite(meme.id);
      Alert.alert('Đã gỡ', 'Meme đã được xóa khỏi Bộ sưu tập.');
    } else {
      addFavorite(meme);
      Alert.alert('Đã lưu! 🎉', 'Meme đã được lưu vào Bộ sưu tập yêu thích!');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem meme "${meme.title}" này trên Memord nhé: ${meme.imageUrl}`,
        url: meme.imageUrl,
        title: meme.title,
      });
    } catch (error) {
      console.error('Lỗi khi chia sẻ:', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Thanh Header tùy chỉnh */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {meme.title}
        </Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ảnh Meme trung tâm */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: meme.imageUrl }} style={styles.mainImage} resizeMode="contain" />
        </View>

        {/* Thông tin Meme */}
        <View style={styles.infoCard}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryBadge}>#{meme.category}</Text>
            <Text style={styles.authorText}>Đăng bởi @{meme.author}</Text>
          </View>

          <Text style={styles.titleText}>{meme.title}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.statsLikes}>❤️ {likes} lượt yêu thích</Text>
          </View>

          {/* Hàng nút bấm Hành động */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={[styles.actionBtn, isLiked && styles.actionBtnActive]}
              onPress={handleToggleLike}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={22}
                color={isLiked ? '#FFFFFF' : '#F43F5E'}
              />
              <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                {isLiked ? 'Đã Thích' : 'Thích'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, isSaved && styles.actionBtnSaved]}
              onPress={handleToggleSave}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isSaved ? '#FFFFFF' : '#38BDF8'}
              />
              <Text style={[styles.actionText, isSaved && styles.actionTextActive]}>
                {isSaved ? 'Đã Lưu' : 'Lưu Bộ Sưu Tập'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 380,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    padding: 20,
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    color: '#38BDF8',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: '600',
    fontSize: 12,
  },
  authorText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 26,
    marginBottom: 12,
  },
  statsRow: {
    marginBottom: 20,
  },
  statsLikes: {
    color: '#FDA4AF',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  actionBtnSaved: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  actionText: {
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 14,
  },
  actionTextActive: {
    color: '#FFFFFF',
  },
});
