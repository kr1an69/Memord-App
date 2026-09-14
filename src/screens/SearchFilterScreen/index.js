import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchMemes } from '../../api/memeApi';

// Danh mục chuẩn theo quy ước dự án
const CATEGORIES = ['Tất cả', 'Programmer', 'Cat', 'Anime', 'Gaming', 'Trending'];

// Các gợi ý từ khóa phổ biến đa dạng chủ đề để bấm tìm nhanh
const QUICK_SUGGESTIONS = [
  { label: '🐶 Con chó', query: 'con chó' },
  { label: '🐱 Con mèo', query: 'con mèo' },
  { label: '💻 Lập trình', query: 'lập trình' },
  { label: '🎮 Chơi game', query: 'chơi game' },
  { label: '🦸 Siêu nhân', query: 'siêu nhân' },
  { label: '💪 Gym', query: 'gym' },
  { label: '📱 iPhone', query: 'iphone' },
  { label: '🔫 Súng', query: 'súng' },
  { label: '💻 Laptop', query: 'laptop' },
  { label: '🚗 Xe hơi', query: 'xe' },
];

export default function SearchFilterScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState('Tất cả');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const searchTimeoutRef = useRef(null);
  const pageRef = useRef(1);

  // Hàm thực hiện tìm kiếm chính (Reset lại về trang 1)
  const handleSearch = useCallback(async (tag = selectedTag, text = keyword) => {
    setLoading(true);
    pageRef.current = 1;
    try {
      const data = await searchMemes(text, tag, 1);
      // Lọc trùng tuyệt đối theo ID và URL ảnh ngay trong lần tải đầu
      const seenIds = new Set();
      const seenUrls = new Set();
      const uniqueData = (data || []).filter((m) => {
        if (!m || !m.id || !m.imageUrl) return false;
        const idStr = String(m.id);
        if (seenIds.has(idStr) || seenUrls.has(m.imageUrl)) return false;
        seenIds.add(idStr);
        seenUrls.add(m.imageUrl);
        return true;
      });
      setResults(uniqueData);
    } catch (error) {
      console.error('[SearchFilterScreen] Lỗi tìm kiếm:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTag, keyword]);

  // Tải thêm ảnh vô hạn khi người dùng cuộn tới cuối danh sách (Chỉ lấy bài 100% MỚI, KHÔNG LẶP LẠI)
  const handleLoadMore = async () => {
    if (loadingMore || loading || results.length === 0) return;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;
    try {
      const categoryToSearch = keyword.trim() !== '' ? 'Tất cả' : selectedTag;
      const moreMemes = await searchMemes(keyword, categoryToSearch, nextPage);
      if (moreMemes && moreMemes.length > 0) {
        pageRef.current = nextPage;
        setResults((prev) => {
          // Kiểm tra tập hợp các ID và Link ảnh đã có trên màn hình
          const existingIds = new Set(prev.map((m) => String(m.id)));
          const existingUrls = new Set(prev.map((m) => m.imageUrl));

          // Chỉ giữ lại những meme chưa từng xuất hiện (Không trùng ID & Không trùng Link ảnh)
          const strictlyNew = moreMemes.filter((m) => {
            if (!m || !m.id || !m.imageUrl) return false;
            const idStr = String(m.id);
            if (existingIds.has(idStr) || existingUrls.has(m.imageUrl)) return false;
            return true;
          });

          if (strictlyNew.length > 0) {
            return [...prev, ...strictlyNew];
          }
          // Nếu tất cả bài trong trang này đã xuất hiện rồi, giữ nguyên danh sách (tuyệt đối không lặp bài cũ)
          return prev;
        });
      }
    } catch (err) {
      console.warn('[SearchFilterScreen] Lỗi tải thêm ảnh:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Tự động tìm kiếm khi đổi Tag danh mục (khi chưa nhập từ khóa)
  useEffect(() => {
    if (keyword.trim() === '') {
      handleSearch(selectedTag, '');
    }
  }, [selectedTag]);

  // Debounce tìm kiếm tự động khi gõ chữ (sau 350ms)
  const handleTextChange = (text) => {
    setKeyword(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      // Khi gõ từ khóa: Ẩn Filter và tìm tự do trên tất cả danh mục ('Tất cả')
      const categoryToSearch = text.trim() !== '' ? 'Tất cả' : selectedTag;
      handleSearch(categoryToSearch, text);
    }, 350);
  };

  // Nút submit tìm kiếm (khi bấm Nút Tìm hoặc Enter)
  const onSubmitSearch = () => {
    Keyboard.dismiss();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    const categoryToSearch = keyword.trim() !== '' ? 'Tất cả' : selectedTag;
    handleSearch(categoryToSearch, keyword);
  };

  // Nút xóa sạch từ khóa (Clear X)
  const handleClearKeyword = () => {
    setKeyword('');
    handleSearch(selectedTag, '');
  };

  // Chọn từ khóa gợi ý nhanh
  const handleSelectSuggestion = (query) => {
    setKeyword(query);
    handleSearch('Tất cả', query);
  };

  // Render thẻ Meme dạng 2 cột Pinterest
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.memeCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('DetailScreen', { meme: item })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.memeImage}
        resizeMode="cover"
      />
      <View style={styles.memeInfo}>
        <Text style={styles.memeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.memeMeta}>
          <Text style={styles.badge}>{item.category || selectedTag}</Text>
          <Text style={styles.memeLikes}>❤️ {item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Thanh tìm kiếm với nút Xóa & Nút Tìm */}
      <View style={styles.searchBoxContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Tìm kiếm meme..."
            placeholderTextColor="#64748B"
            value={keyword}
            onChangeText={handleTextChange}
            onSubmitEditing={onSubmitSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={handleClearKeyword} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={onSubmitSearch} activeOpacity={0.7}>
          <Text style={styles.searchBtnText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Dải Tag danh mục nằm ngang (Chỉ hiện khi CHƯA gõ từ khóa tìm kiếm) */}
      {keyword.trim() === '' && (
        <View style={styles.tagsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedTag === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.tagPill, isActive && styles.tagPillActive]}
                  onPress={() => setSelectedTag(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 3. Danh sách kết quả hoặc Trạng thái Loading / Empty State */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tìm kiếm meme hot nhất...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>😿</Text>
          <Text style={styles.emptyTitle}>Chưa tìm thấy meme vừa ý?</Text>
          <Text style={styles.emptySub}>Thử tìm kiếm với các từ khóa gợi ý bên dưới:</Text>

          <View style={styles.suggestionsContainer}>
            {QUICK_SUGGESTIONS.map((item) => (
              <TouchableOpacity
                key={item.query}
                style={styles.suggestionChip}
                onPress={() => handleSelectSuggestion(item.query)}
              >
                <Text style={styles.suggestionChipText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => (item.id ? String(item.id) : `search_${index}`)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.rowWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  searchBoxContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#F8FAFC',
    fontSize: 14,
  },
  clearBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchBtn: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  tagsWrapper: {
    marginVertical: 12,
  },
  tagsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tagPillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  tagText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  tagTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  suggestionChipText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  rowWrapper: {
    justifyContent: 'space-between',
  },
  memeCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  memeImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#334155',
  },
  memeInfo: {
    padding: 10,
  },
  memeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
    lineHeight: 18,
  },
  memeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#0F172A',
    color: '#38BDF8',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '600',
  },
  memeLikes: {
    color: '#F43F5E',
    fontSize: 12,
    fontWeight: '600',
  },
});