import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchTrendingMemes } from '../../api/memeApi';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 2 - 16;

// --------------------------------------------------
// COMPONENT CARD RIÊNG BIỆT (Xử lý việc load từng ảnh)
// --------------------------------------------------
const MemeCard = memo(({ item, index, navigation }) => {
  const [imgLoading, setImgLoading] = useState(true);
  const imageHeight = index % 2 === 0 ? 220 : 160;

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { width: COLUMN_WIDTH }]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('DetailScreen', { meme: item })}
    >
      <View style={[styles.imageWrapper, { height: imageHeight }]}>
        {/* Hiển thị xoay vòng nhỏ khi ảnh đang tải */}
        {imgLoading && (
          <ActivityIndicator style={styles.imageLoader} size="small" color="#94A3B8" />
        )}
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.memeImage, { height: imageHeight }]}
          resizeMode="cover"
          onLoadEnd={() => setImgLoading(false)} // Tắt loading khi tải xong
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.titleText} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.authorText} numberOfLines={1}>
            @{item.author}
          </Text>
          <Text style={styles.likesText}>❤️ {item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// --------------------------------------------------
// COMPONENT CHÍNH (HomeScreen)
// --------------------------------------------------
export default function HomeScreen({ navigation }) {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // State mới cho Load More

  // Load data ban đầu
  const loadMemes = async () => {
    try {
      const data = await fetchTrendingMemes(50); // Thay 20 thành 50 theo yêu cầu
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

  // Hàm xử lý cuộn xuống đáy (Load More / Cuộn vô hạn)
  const handleLoadMore = async () => {
    // Chặn gọi API liên tục nếu đang tải rồi
    if (loadingMore || loading || refreshing) return;
    
    setLoadingMore(true);
    try {
      const newMemes = await fetchTrendingMemes(50); // Lấy thêm 50 meme nữa
      
      setMemes(prevMemes => {
        // Loại bỏ các meme trùng id để tránh lặp
        const uniqueNewMemes = newMemes.filter(
          newMeme => !prevMemes.some(existingMeme => existingMeme.id === newMeme.id)
        );
        // Đắp data mới vô dưới đáy
        return [...prevMemes, ...uniqueNewMemes];
      });
    } catch (error) {
      console.error('Lỗi khi tải thêm memes:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Giao diện loading dưới đáy danh sách
  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />; // Đệm thêm một chút khoảng trống dưới đáy
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  };

  const renderMemeItem = ({ item, index }) => (
    <MemeCard item={item} index={index} navigation={navigation} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ Memord Khám Phá</Text>
        <Text style={styles.headerSubtitle}>Lướt meme mới nhất mỗi ngày</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Đang tải meme...</Text>
        </View>
      ) : (
        <FlatList
          data={memes}
          keyExtractor={(item, index) => item.id ? item.id.toString() : `meme_${index}`}
          renderItem={renderMemeItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          // --- THÊM PULL-TO-REFRESH ---
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={['#FF4500']} 
              tintColor="#FF4500" 
            />
          }
          // --- THÊM LOAD MORE Ở ĐÂY ---
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </SafeAreaView>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
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
  headerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
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
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoader: {
    position: 'absolute', // Để loading spinner nằm chính giữa background
  },
  memeImage: {
    width: '100%',
  },
  cardContent: {
    padding: 12,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 11,
    color: '#94A3B8',
    flex: 1,
    paddingRight: 8,
    fontWeight: '500',
  },
  likesText: {
    fontSize: 12,
    color: '#F43F5E',
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});