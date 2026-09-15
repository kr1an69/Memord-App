import React, { useState, useEffect, memo, useRef, useCallback } from 'react';
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
// 1. COMPONENT CARD (Đã cập nhật UI theo ý đồng đội)
// --------------------------------------------------
const MemeCard = memo(({ item, index, navigation }) => {
  const [imgLoading, setImgLoading] = useState(true);
  
  const heights = [180, 260, 220, 320];
  const imageHeight = heights[index % 4];

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { width: COLUMN_WIDTH }]}
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
      
      {/* Footer mới: Xóa 3 chấm, nền tối, thêm Title */}
      <View style={styles.cardFooter}>
         <Text style={styles.memeTitle} numberOfLines={2}>
           {item.title || 'Meme không tiêu đề'}
         </Text>
      </View>
    </TouchableOpacity>
  );
});

// --------------------------------------------------
// 2. COMPONENT CHÍNH
// --------------------------------------------------
export default function HomeScreen({ navigation }) {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const isFetchingRef = useRef(false);

  const loadMemes = async () => {
    try {
      const data = await fetchTrendingMemes(20);
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
    if (isFetchingRef.current || loading || refreshing) return;
    
    isFetchingRef.current = true;
    setLoadingMore(true);
    
    try {
      const newMemes = await fetchTrendingMemes(20);
      setMemes(prevMemes => {
        const uniqueNewMemes = newMemes.filter(
          newMeme => !prevMemes.some(existingMeme => existingMeme.id === newMeme.id)
        );
        return [...prevMemes, ...uniqueNewMemes];
      });
    } catch (error) {
      console.error('Lỗi khi tải thêm memes:', error);
    } finally {
      isFetchingRef.current = false;
      setLoadingMore(false);
    }
  };

  const renderItem = useCallback(({ item, index }) => (
    <MemeCard item={item} index={index} navigation={navigation} />
  ), [navigation]);

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  };

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
        <FlatList
          data={memes}
          keyExtractor={(item, index) => item.id ? item.id.toString() : `meme_${index}`}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4500" />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          
          initialNumToRender={8}      
          maxToRenderPerBatch={6}     
          windowSize={5}              
          removeClippedSubviews={true} 
        />
      )}
    </SafeAreaView>
  );
}

// --------------------------------------------------
// 3. STYLES (Đã tinh chỉnh lại màu nền và Title)
// --------------------------------------------------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC', letterSpacing: 0.5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94A3B8', marginTop: 12, fontSize: 14, fontWeight: '500' },
  listContent: { paddingHorizontal: 12, paddingBottom: 24 },
  columnWrapper: { justifyContent: 'space-between' },
  
  // Sửa nền card thành xám không gian thay vì trắng
  cardContainer: { 
    backgroundColor: '#1E293B', 
    borderRadius: 16, 
    marginBottom: 12, 
    overflow: 'hidden' 
  },
  imageWrapper: { width: '100%', backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  imageLoader: { position: 'absolute' },
  memeImage: { width: '100%' },
  
  // Footer mới: Padding gọn gàng, căn chữ qua trái
  cardFooter: { 
    paddingVertical: 12, 
    paddingHorizontal: 12, 
    justifyContent: 'center', 
    alignItems: 'flex-start',
  },
  // Style cho Title mới thêm
  memeTitle: { 
    fontSize: 14, 
    color: '#F1F5F9', // Màu chữ sáng để nổi trên nền tối
    fontWeight: '600', 
    lineHeight: 20,
  },
  footerLoader: { paddingVertical: 20, justifyContent: 'center', alignItems: 'center' },
});