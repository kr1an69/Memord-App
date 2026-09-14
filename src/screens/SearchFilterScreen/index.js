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

// Các gợi ý từ khóa phổ biến để bấm tìm nhanh
const QUICK_SUGGESTIONS = [
  { label: '🐱 Mèo', query: 'cat' },
  { label: '💻 Code', query: 'code' },
  { label: '🎮 Gaming', query: 'game' },
  { label: '🌸 Anime', query: 'anime' },
  { label: '🐛 Fix Bug', query: 'bug' },
];

export default function SearchFilterScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState('Tất cả');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Hàm thực hiện tìm kiếm chính
  const handleSearch = useCallback(async (tag = selectedTag, text = keyword) => {
    setLoading(true);
    try {
      const data = await searchMemes(text, tag);
      setResults(data || []);
    } catch (error) {
      console.error('[SearchFilterScreen] Lỗi tìm kiếm:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTag, keyword]);

  // Tự động tìm kiếm khi đổi Tag danh mục
  useEffect(() => {
    handleSearch(selectedTag, keyword);
  }, [selectedTag]);

  // Debounce tìm kiếm tự động khi gõ chữ (sau 350ms)
  const handleTextChange = (text) => {
    setKeyword(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(selectedTag, text);
    }, 350);
  };

  // Nút submit tìm kiếm (khi bấm Nút Tìm hoặc Enter)
  const onSubmitSearch = () => {
    Keyboard.dismiss();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    handleSearch(selectedTag, keyword);
  };

  // Nút xóa sạch từ khóa (Clear X)
  const handleClearKeyword = () => {
    setKeyword('');
    handleSearch(selectedTag, '');
  };

  // Chọn từ khóa gợi ý nhanh
  const handleSelectSuggestion = (query) => {
    setKeyword(query);
    handleSearch(selectedTag, query);
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
            placeholder="Tìm theo từ khóa (Mèo, Code, Bug, Anime)..."
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

      {/* 2. Dải Tag danh mục nằm ngang */}
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

      {/* 3. Header thống kê số lượng kết quả */}
      {!loading && results.length > 0 && (
        <View style={styles.resultHeader}>
          <Text style={styles.resultHeaderCount}>
            Tìm thấy <Text style={styles.countHighlight}>{results.length}</Text> meme phù hợp
          </Text>
        </View>
      )}

      {/* 4. Danh sách kết quả hoặc Trạng thái Loading / Empty State */}
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
  resultHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultHeaderCount: {
    color: '#94A3B8',
    fontSize: 13,
  },
  countHighlight: {
    color: '#38BDF8',
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