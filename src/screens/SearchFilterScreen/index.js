import React, { useState, useEffect } from 'react';
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
import { searchMemes } from '../../api/memeApi'; // Đảm bảo import đúng đường dẫn API

// Giữ nguyên danh mục theo code mẫu của Leader
const CATEGORIES = ['Tất cả', 'Programmer', 'Cat', 'Anime', 'Gaming', 'Trending'];

// Các gợi ý từ khóa phổ biến đa dạng chủ đề để bấm tìm nhanh
const QUICK_SUGGESTIONS = [
  { label: '🐶 Con chó', query: 'con chó' },
  { label: '🐱 Con mèo', query: 'con mèo' },
  { label: '💻 Lập trình', query: 'lập trình' },
  { label: '🎮 Chơi game', query: 'chơi game' },
  { label: '🦸 Siêu nhân', query: 'siêu nhân' },
  { label: '⚡ Pokémon', query: 'pokemon' },
  { label: '🦸‍♂️ Marvel', query: 'marvel' },
  { label: '💪 Gym', query: 'gym' },
  { label: '📱 iPhone', query: 'iphone' },
  { label: '🔫 Súng', query: 'súng' },
  { label: '💻 Laptop', query: 'laptop' },
  { label: '🚗 Xe hơi', query: 'xe' },
];

export default function SearchFilterScreen({ navigation }) {
  // --- PHẦN 1: GIỮ NGUYÊN HOÀN TOÀN CẤU TRÚC LOGIC CỦA LEADER ---
  const [keyword, setKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState('Tất cả');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (tag = selectedTag, text = keyword) => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const data = await searchMemes(text, tag, 1);
      setResults(data || []);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
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

  useEffect(() => {
    handleSearch(selectedTag, keyword);
  }, [selectedTag]);

  // --- PHẦN 2: TÙY CHỈNH UI (SỬ DỤNG LƯỚI 2 CỘT PINTEREST + DARK MODE) ---
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.memeCard}
      activeOpacity={0.8}
      // Giữ nguyên tham số navigate của Leader: { meme: item }
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
      {/* Thanh tìm kiếm */}
      <View style={styles.searchBoxContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tìm kiếm meme hài hước..."
          placeholderTextColor="#64748B"
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={() => handleSearch(selectedTag, keyword)}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => handleSearch(selectedTag, keyword)}
        >
          <Text style={styles.searchBtnText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* Dải Tag danh mục */}
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
              >
                <Text style={[styles.tagText, isActive && styles.tagTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Hiển thị danh sách kết quả dạng lưới 2 cột */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
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
          keyExtractor={(item, index) => item.id ? item.id.toString() : `search_${index}`}
          renderItem={renderItem}
          numColumns={2} // Chia 2 cột phong cách Pinterest
          columnWrapperStyle={styles.rowWrapper} // Khoảng cách giữa 2 cột
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// --- PHẦN 3: STYLES (KẾT HỢP DARK MODE CỦA LEADER VÀ GRID CỦA AI) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark mode background
  },
  searchBoxContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    fontSize: 14,
  },
  searchBtn: {
    height: 46,
    paddingHorizontal: 18,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
    paddingHorizontal: 14,
    paddingVertical: 7,
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
    fontSize: 12,
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
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
  },
  
  // -- STYLES DÀNH CHO LƯỚI MEME 2 CỘT (PINTEREST STYLE) --
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  rowWrapper: {
    justifyContent: 'space-between', // Chia đều 2 thẻ meme ra 2 bên
  },
  memeCard: {
    width: '48%', // Chiếm gần nửa màn hình
    backgroundColor: '#1E293B', // Tone màu nền card theo Leader
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
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 8,
    lineHeight: 20,
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