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
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { searchMemes } from '../../api/memeApi';

const CATEGORIES = ['Tất cả', 'Programmer', 'Cat', 'Anime', 'Gaming', 'Trending'];

export default function SearchFilterScreen({ navigation }) {
  const [keyword, setKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState('Tất cả');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (tag = selectedTag, text = keyword) => {
    setLoading(true);
    try {
      const data = await searchMemes(text, tag);
      setResults(data);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(selectedTag, keyword);
  }, [selectedTag]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemRow}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('DetailScreen', { meme: item })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} resizeMode="cover" />
      <View style={styles.itemBody}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.itemMeta}>
          <Text style={styles.badge}>{item.category}</Text>
          <Text style={styles.itemLikes}>❤️ {item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsContainer}>
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Không tìm thấy meme phù hợp 😿</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => item.id || `search_${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  thumbImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  itemBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#0F172A',
    color: '#38BDF8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '600',
  },
  itemLikes: {
    color: '#F43F5E',
    fontSize: 12,
    fontWeight: '600',
  },
});
