import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchTrendingMemes } from '../../api/memeApi';

// --------------------------------------------------
// 1. COMPONENT CARD TỐI GIẢN (Chuẩn video mẫu)
// --------------------------------------------------
const MemeCard = memo(({ item, index, navigation }) => {
  const [imgLoading, setImgLoading] = useState(true);
  
  // Tạo chiều cao ngẫu nhiên (hoặc dựa vào index) để tạo độ so le
  // Các mức height: 180, 240, 300
  const heights = [180, 260, 220, 320];
  const imageHeight = heights[index % 4];

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('DetailScreen', { meme: item })}
    >
      <View style={[styles.imageWrapper, { height: imageHeight }]}>
        {imgLoading && (
          <ActivityIndicator style={styles.imageLoader} size="small" color="#94A3B8" />
        )}
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.memeImage, { height: imageHeight }]}
          resizeMode="cover"
          onLoadEnd={() => setImgLoading(false)}
        />
      </View>
      
      {/* Footer nhỏ gọn với dấu 3 chấm giống video */}
      <View style={styles.cardFooter}>
         <Text style={styles.dotsIcon}>•••</Text>
      </View>
    </TouchableOpacity>
  );
});

// --------------------------------------------------
// 2. COMPONENT CHÍNH (HomeScreen)
// --------------------------------------------------
export default function HomeScreen({ navigation }) {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMemes = async () => {
    try {
      const data = await fetchTrendingMemes(50);
      setMemes(data);
    } catch (error) {
      console.error('Lỗi khi tải memes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMemes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMemes();
  };

  const handleLoadMore = async () => {
    if (loadingMore || loading || refreshing) return;
    
    setLoadingMore(true);
    try {
      const newMemes = await fetchTrendingMemes(50);
      setMemes(prevMemes => {
        const uniqueNewMemes = newMemes.filter(
          newMeme => !prevMemes.some(existingMeme => existingMeme.id === newMeme.id)
        );
        return [...prevMemes, ...uniqueNewMemes];
      });
    } catch (error) {
      console.error('Lỗi khi tải thêm memes:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Thuật toán phát hiện cuộn đến đáy của ScrollView
  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 50; // Kích hoạt load data khi cách đáy 50px
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  // Kỹ thuật chia đôi mảng dữ liệu để làm Masonry
  const leftColumnMemes = memes.filter((_, index) => index % 2 === 0);
  const rightColumnMemes = memes.filter((_, index) => index % 2 !== 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ Memord Khám Phá</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Đang tải meme...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4500" />
          }
          onScroll={({ nativeEvent }) => {
            if (isCloseToBottom(nativeEvent)) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={400} // Tối ưu hiệu năng khi cuộn
        >
          <View style={styles.masonryContainer}>
            {/* CỘT TRÁI */}
            <View style={styles.column}>
              {leftColumnMemes.map((item, index) => (
                <MemeCard key={item.id || `left_${index}`} item={item} index={index} navigation={navigation} />
              ))}
            </View>

            {/* CỘT PHẢI */}
            <View style={styles.column}>
              {rightColumnMemes.map((item, index) => (
                // Đảo index một chút để cột phải có độ cao lệch với cột trái
                <MemeCard key={item.id || `right_${index}`} item={item} index={index + 1} navigation={navigation} />
              ))}
            </View>
          </View>

          {/* Vòng xoay Loading More dưới đáy */}
          {loadingMore && (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="large" color="#FF4500" />
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// --------------------------------------------------
// 3. STYLE PREMIUM & MASONRY
// --------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Giữ nguyên nền đen
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  masonryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8, // Padding 2 bên lề màn hình
  },
  column: {
    flex: 1,
    paddingHorizontal: 6, // Khoảng cách giữa 2 cột
  },
  cardContainer: {
    backgroundColor: '#FFFFFF', // Nền thẻ màu trắng/sáng theo mẫu
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoader: {
    position: 'absolute',
  },
  memeImage: {
    width: '100%',
  },
  cardFooter: {
    height: 36,
    backgroundColor: '#FFFFFF', // Hoặc để màu #1E293B nếu bạn muốn thẻ tối hẳn
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
  },
  dotsIcon: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '900',
    letterSpacing: 2,
  },
  footerLoader: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});