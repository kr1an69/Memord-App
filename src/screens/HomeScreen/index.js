import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchTrendingMemes } from '../../api/memeApi';

export default function HomeScreen({ navigation }) {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const renderMemeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('DetailScreen', { meme: item })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardAuthor}>@{item.author}</Text>
          <Text style={styles.cardLikes}>❤️ {item.likes}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ Memord Khám Phá</Text>
        <Text style={styles.headerSubtitle}>Lướt meme mới nhất mỗi ngày</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Đang tải meme...</Text>
        </View>
      ) : (
        <FlatList
          data={memes}
          keyExtractor={(item, index) => item.id || `meme_${index}`}
          numColumns={2}
          renderItem={renderMemeItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4500']} />
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#334155',
  },
  cardInfo: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAuthor: {
    fontSize: 11,
    color: '#94A3B8',
    maxWidth: '65%',
  },
  cardLikes: {
    fontSize: 11,
    color: '#F43F5E',
    fontWeight: '600',
  },
});
