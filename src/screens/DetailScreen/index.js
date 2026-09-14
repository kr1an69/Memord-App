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
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Import các icon tùy chỉnh từ thư mục assets
const iconBack = require('../../../assets/back.png');
const iconLoveRed = require('../../../assets/love.png');
const iconLoveBlack = require('../../../assets/love1.png');
const iconSave = require('../../../assets/save.png');
const iconShare = require('../../../assets/share.png');

export default function DetailScreen({ route, navigation }) {
  // 1. Nhận dữ liệu meme từ navigation params với fallback an toàn
  const meme = route.params?.meme || {
    id: 'meme_default',
    title: 'Meme Mẫu Memord',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    author: 'memord_user',
    likes: 1250,
    category: 'Trending',
    width: 600,
    height: 600,
  };

  // State quản lý tương tác người dùng
  const [likes, setLikes] = useState(Number(meme.likes) || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // State xem ảnh toàn màn hình & phóng to (Fullscreen Lightbox)
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  // Hàm hiển thị thông báo tương thích cả Web và Mobile
  const showToast = (title, message) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Xử lý sự kiện Thả Tim (Like): Đổi màu tim và tăng/giảm 1 like
  const handleToggleLike = () => {
    if (isLiked) {
      setLikes((prev) => Math.max(0, prev - 1));
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  // Xử lý sự kiện Lưu vào Bộ sưu tập: Đổi trạng thái icon thành "Đã lưu"
  const handleToggleSave = () => {
    const nextState = !isSaved;
    setIsSaved(nextState);

    if (nextState) {
      showToast('Bộ sưu tập', 'Đã lưu meme vào bộ sưu tập yêu thích! 🎉');
    } else {
      showToast('Bộ sưu tập', 'Đã gỡ meme khỏi bộ sưu tập yêu thích.');
    }
  };

  // Xử lý sự kiện Chia sẻ (Share) qua Native Share Dialog
  const handleShare = async () => {
    const shareMessage = `Xem meme "${meme.title}" này trên Memord nhé:\n${meme.imageUrl}`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: meme.title,
          text: shareMessage,
          url: meme.imageUrl,
        });
      } else if (Share && Share.share) {
        await Share.share({
          message: shareMessage,
          url: meme.imageUrl,
          title: meme.title,
        });
      } else {
        showToast('Chia sẻ', shareMessage);
      }
    } catch (error) {
      console.warn('Lỗi khi chia sẻ meme:', error);
    }
  };

  // Tính chiều cao ảnh theo tỷ lệ gốc
  const imageAspectHeight =
    meme.width && meme.height
      ? Math.min(Math.round((SCREEN_WIDTH * meme.height) / meme.width), 460)
      : 360;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Thanh Header Điều hướng */}
      <View style={styles.header}>
        {/* Nút Quay lại (Back) */}
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Image source={iconBack} style={styles.headerIcon} resizeMode="contain" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {meme.title || 'Chi tiết Meme'}
        </Text>

        {/* Nút Chia sẻ ở Header */}
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={handleShare}
        >
          <Image source={iconShare} style={styles.headerIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.mainScrollView}
      >
        {/* 2. Khung hiển thị ảnh Meme to, rõ nét (Chạm vào để mở Fullscreen) */}
        <TouchableOpacity
          style={[styles.imageCard, { height: imageAspectHeight }]}
          activeOpacity={0.95}
          onPress={() => setIsViewerVisible(true)}
        >
          {imageLoading && (
            <View style={styles.imageLoader}>
              <ActivityIndicator size="small" color="#FF4500" />
            </View>
          )}
          {meme.imageUrl ? (
            <Image
              source={{ uri: meme.imageUrl }}
              style={styles.memeImage}
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
          ) : null}

          {/* Icon kính lúp tối giản ở góc ảnh */}
          <View style={styles.zoomHintBadge}>
            <Text style={styles.zoomHintIcon}>🔍</Text>
          </View>
        </TouchableOpacity>

        {/* 3. Thẻ Thông tin chi tiết & Các nút hành động */}
        <View style={styles.detailCard}>
          {/* Tag phân loại & Tác giả */}
          <View style={styles.metaRow}>
            <View style={styles.badgeContainer}>
              <Text style={styles.categoryBadge}>#{meme.category || 'Meme'}</Text>
            </View>

            <View style={styles.authorBadge}>
              <Text style={styles.authorName}>Đăng bởi @{meme.author || 'ẩn danh'}</Text>
            </View>
          </View>

          {/* Tiêu đề Meme */}
          <Text style={styles.memeTitle}>{meme.title || 'Không có tiêu đề'}</Text>

          {/* Thống kê số lượt thích */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Image
                source={isLiked ? iconLoveRed : iconLoveBlack}
                style={[
                  styles.statHeartIcon,
                  !isLiked && { tintColor: '#94A3B8' },
                ]}
                resizeMode="contain"
              />
              <Text style={[styles.statValue, isLiked && styles.statValueLiked]}>
                {likes.toLocaleString()} lượt thích
              </Text>
            </View>

            {meme.category ? (
              <View style={styles.statItem}>
                <Text style={styles.statCategory}>🔥 {meme.category}</Text>
              </View>
            ) : null}
          </View>

          {/* Hàng nút bấm Hành động (Like, Save, Share) */}
          <View style={styles.actionsRow}>
            {/* Nút Thả Tim (Like) */}
            <TouchableOpacity
              style={[styles.actionBtn, isLiked && styles.likeBtnActive]}
              activeOpacity={0.8}
              onPress={handleToggleLike}
            >
              <Image
                source={isLiked ? iconLoveRed : iconLoveBlack}
                style={[
                  styles.actionIcon,
                  !isLiked && { tintColor: '#F43F5E' },
                ]}
                resizeMode="contain"
              />
              <Text style={[styles.actionBtnText, isLiked && styles.actionBtnTextActive]}>
                {isLiked ? 'Đã Thích' : 'Thích'}
              </Text>
            </TouchableOpacity>

            {/* Nút Lưu vào Bộ sưu tập (Save) */}
            <TouchableOpacity
              style={[styles.actionBtn, isSaved && styles.saveBtnActive]}
              activeOpacity={0.8}
              onPress={handleToggleSave}
            >
              <Image
                source={iconSave}
                style={[
                  styles.actionIcon,
                  { tintColor: isSaved ? '#FFFFFF' : '#38BDF8' },
                ]}
                resizeMode="contain"
              />
              <Text style={[styles.actionBtnText, isSaved && styles.actionBtnTextActive]}>
                {isSaved ? 'Đã Lưu' : 'Lưu'}
              </Text>
            </TouchableOpacity>

            {/* Nút Chia sẻ (Share) */}
            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.8}
              onPress={handleShare}
            >
              <Image
                source={iconShare}
                style={[styles.actionIcon, { tintColor: '#F8FAFC' }]}
                resizeMode="contain"
              />
              <Text style={styles.shareBtnText}>Chia sẻ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 4. Modal Xem ảnh Toàn Màn Hình & Phóng To */}
      {isViewerVisible && (
        <Modal
          visible={isViewerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsViewerVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            {/* Header của Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {meme.title || 'Chi tiết ảnh'}
              </Text>
              <TouchableOpacity
                style={styles.closeModalBtn}
                activeOpacity={0.8}
                onPress={() => setIsViewerVisible(false)}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* ScrollView hỗ trợ Pinch-to-Zoom */}
            <ScrollView
              style={styles.zoomScrollView}
              contentContainerStyle={styles.zoomContentContainer}
              minimumZoomScale={1}
              maximumZoomScale={4}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              centerContent={true}
            >
              <Image
                source={{ uri: meme.imageUrl }}
                style={styles.modalFullImage}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0B132B',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: '#F8FAFC',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  imageCard: {
    width: '100%',
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imageLoader: {
    position: 'absolute',
    zIndex: 1,
  },
  memeImage: {
    width: '100%',
    height: '100%',
  },
  zoomHintBadge: {
    position: 'absolute',
    bottom: 20,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  zoomHintIcon: {
    fontSize: 14,
  },
  detailCard: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeContainer: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryBadge: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  memeTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 28,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statHeartIcon: {
    width: 18,
    height: 18,
  },
  statValue: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  statValueLiked: {
    color: '#FDA4AF',
  },
  statCategory: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  likeBtnActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  saveBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  actionBtnText: {
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 13,
  },
  actionBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: '#334155',
    borderRadius: 12,
  },
  shareBtnText: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 13,
  },
  /* Styles tối giản cho Fullscreen Lightbox */
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 10,
  },
  modalTitle: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
  },
  closeModalBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeModalText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  zoomScrollView: {
    flex: 1,
  },
  zoomContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.85,
  },
});
