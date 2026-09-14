import { MOCK_MEMES } from '../constants/mockMemes.js';
import { SUBREDDIT_POOL } from '../constants/subreddits.js';
const BASE_MEME_API = 'https://meme-api.com/gimme';
// Map các category sang nhiều Subreddit tương ứng trên Reddit để luân phiên tải ảnh
const SUBREDDIT_MAP = {
  Programmer: ['ProgrammerHumor', 'programmingmemes', 'softwareengineeringmemes', 'coder'],
  Cat: ['catmemes', 'cats', 'Meow_irl', 'Catmemes'],
  Anime: ['Animemes', 'goodanimemes', 'anime_irl', 'AnimeMeme'],
  Gaming: ['gaming', 'GamingMemes', 'wholesomememes', 'dankmemes'],
  Trending: ['memes', 'dankmemes', 'me_irl', 'wholesomememes', 'funny'],
};
// Bảng dịch từ khóa tiếng Việt thông dụng sang tiếng Anh cho Reddit Search API
const VIETNAMESE_SEARCH_MAP = {
  'chó': 'dog meme',
  'con chó': 'dog meme',
  'mèo': 'cat meme',
  'con mèo': 'cat meme',
  'lập trình': 'programmer meme',
  'code': 'programmer meme',
  'dev': 'developer meme',
  'chơi game': 'gaming meme',
  'game': 'gaming meme',
  'siêu nhân': 'superhero meme',
  'súng': 'gun meme',
  'laptop': 'laptop meme',
  'máy tính': 'pc master race meme',
  'xe': 'car meme',
  'xe hơi': 'car meme',
  'ô tô': 'car meme',
  'đồ ăn': 'food meme',
  'thức ăn': 'food meme',
  'trường': 'school meme',
  'học': 'student meme',
  'tiền': 'money meme',
  'công việc': 'work job meme',
  'đi làm': 'work meme',
  'ngủ': 'sleep meme',
  'tình yêu': 'love relationship meme',
  'thể thao': 'sports meme',
  'bóng đá': 'football soccer meme',
  'phim': 'movie cinema meme',
  'nhạc': 'music meme',
  'hài hước': 'funny meme',
};
// Hàm xáo trộn mảng ngẫu nhiên
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
/**
 * Normalize dữ liệu trả về từ Meme-API hoặc Reddit sang đúng schema của Memord
 */
const normalizeMeme = (item, index, defaultCategory = 'Trending') => ({
  id: item.postLink ? String(item.postLink).split('/').filter(Boolean).pop() : `meme_${Date.now()}_${index}`,
  title: item.title || 'No title',
  imageUrl: item.url || item.imageUrl,
  author: item.author || 'Unknown',
  likes: typeof item.ups === 'number' ? item.ups : Math.floor(Math.random() * 2000) + 100,
  category: item.subreddit || defaultCategory,
  width: 600,
  height: Math.floor(Math.random() * 250) + 600,
});
/**
 * Chuẩn hóa 1 bài post từ Reddit API trực tiếp (reddit.com/search.json)
 */
const parseRedditDirectPost = (item, index, categoryTag = 'Reddit') => {
  if (!item || !item.data) return null;
  const p = item.data;
  // Lọc bỏ bài NSFW (nhạy cảm) hoặc bài chỉ là video/text
  if (p.over_18 || p.is_video) return null;
  // Tìm URL hình ảnh trực tiếp từ Reddit post
  let imageUrl = p.url || '';
  if (!imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && p.preview?.images?.[0]?.source?.url) {
    imageUrl = p.preview.images[0].source.url;
  }
  imageUrl = (imageUrl || '').replace(/&amp;/g, '&');
  // Kiểm tra liên kết ảnh hợp lệ
  const isValidImage =
    imageUrl.startsWith('http') &&
    (imageUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) ||
      imageUrl.includes('i.redd.it') ||
      imageUrl.includes('i.imgur.com') ||
      imageUrl.includes('preview.redd.it'));
  if (!isValidImage) return null;
  return {
    id: p.id ? `rd_${p.id}` : `rd_${Date.now()}_${index}`,
    title: p.title || 'Meme from Reddit',
    imageUrl: imageUrl,
    author: p.author ? `u/${p.author}` : 'Reddit User',
    likes: typeof p.ups === 'number' ? p.ups : p.score || Math.floor(Math.random() * 2000) + 100,
    category: p.subreddit ? `r/${p.subreddit}` : categoryTag,
    width: 600,
    height: Math.floor(Math.random() * 250) + 600,
  };
};
/**
 * Lấy danh sách trending memes cho HomeScreen
 */
export const fetchTrendingMemes = async (count = 50) => {
  try {
    const chosenSubreddits = shuffleArray(SUBREDDIT_POOL).slice(0, 4);
    const countPerSub = Math.ceil(count / chosenSubreddits.length);
    const fetchPromises = chosenSubreddits.map(async (sub) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${BASE_MEME_API}/${sub}/${countPerSub}?t=${Date.now()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`Lỗi fetch subreddit: ${sub}`);
      const data = await res.json();
      if (data && Array.isArray(data.memes)) {
        return data.memes
          .filter((m) => !m.nsfw)
          .map((item, idx) => normalizeMeme(item, idx, sub));
      }
      return [];
    });
    const settleResults = await Promise.allSettled(fetchPromises);
    const combinedMemes = [];
    settleResults.forEach((result) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        combinedMemes.push(...result.value);
      }
    });
    if (combinedMemes.length > 0) {
      const seenIds = new Set();
      const uniqueMemes = combinedMemes.filter((m) => {
        if (seenIds.has(m.id)) return false;
        seenIds.add(m.id);
        return true;
      });
      return shuffleArray(uniqueMemes);
    }
    return shuffleArray(MOCK_MEMES);
  } catch (error) {
    console.warn('[MemeApi] Lỗi mạng, kích hoạt Fallback Mock:', error.message);
    return shuffleArray(MOCK_MEMES);
  }
};
// ------------------------------- Khoa (Search & Filter API - Reddit Direct Search 100%) -----------------------------------
/**
 * Hàm tìm kiếm TRỰC TIẾP trên kho dữ liệu khổng lồ của Reddit (Không giới hạn bất kỳ chủ đề nào)
 * Cho phép tìm kiếm MỌI từ khóa/chủ đề bất kỳ (vd: "pikachu", "dragon ball", "elon musk", "coffee", "physics", "superhero"...)
 * @param {string} query Từ khóa tìm kiếm từ người dùng
 * @param {string} category Danh mục được chọn (Programmer | Cat | Anime | Gaming | Trending | Tất cả)
 * @param {number} page Trang hiện tại (1, 2, 3...)
 * @returns {Promise<Array>} Danh sách Meme chuẩn Schema từ Reddit
 */
export const searchMemes = async (query = '', category = 'Tất cả', page = 1) => {
  try {
    const rawQuery = (query || '').trim();
    const qLower = rawQuery.toLowerCase();
    // 1. Tự động chuyển đổi tiếng Việt cơ bản (nếu có) hoặc giữ nguyên từ khóa của người dùng
    let searchTerms = qLower;
    if (VIETNAMESE_SEARCH_MAP[qLower]) {
      searchTerms = VIETNAMESE_SEARCH_MAP[qLower];
    } else if (qLower && !qLower.includes('meme')) {
      searchTerms = `${qLower} meme`;
    }
    let redditMemes = [];
    // 2. TRUY VẤN TRỰC TIẾP CƠ SỞ DỮ LIỆU CỦA REDDIT (Toàn bộ Reddit, KHÔNG GIỚI HẠN CHỦ ĐỀ)
    if (rawQuery !== '') {
      const searchUrls = [
        `https://www.reddit.com/search.json?q=${encodeURIComponent(searchTerms)}&sort=relevance&limit=50&raw_json=1`,
        `https://www.reddit.com/r/memes+dankmemes+wholesomememes+funny+me_irl/search.json?q=${encodeURIComponent(qLower)}&restrict_sr=1&sort=relevance&limit=50&raw_json=1`,
      ];
      const searchPromises = searchUrls.map(async (url) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const res = await fetch(url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Mobile; React Native App; Memord/1.0)',
            },
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            const json = await res.json();
            if (json && json.data && Array.isArray(json.data.children)) {
              return json.data.children
                .map((item, idx) => parseRedditDirectPost(item, idx, category))
                .filter(Boolean);
            }
          }
        } catch (e) {
          // Bỏ qua lỗi kết nối đơn lẻ
        }
        return [];
      });
      const results = await Promise.allSettled(searchPromises);
      results.forEach((r) => {
        if (r.status === 'fulfilled' && Array.isArray(r.value)) {
          redditMemes.push(...r.value);
        }
      });
    }
    // 3. KẾT NỐI THEO DẠNG SUBREDDIT ĐỘNG KHI TÌM THEO TAG HOẶC TÌM THEO TỪ KHÓA ĐỘC LẠ
    let categorySubMemes = [];
    let targetSubs = ['memes', 'dankmemes', 'wholesomememes', 'funny', 'me_irl'];
    if (category !== 'Tất cả' && SUBREDDIT_MAP[category]) {
      targetSubs = SUBREDDIT_MAP[category];
    } else if (rawQuery) {
      const cleanWord = qLower.replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 1) {
        targetSubs = [`${cleanWord}memes`, cleanWord, 'memes', 'dankmemes'];
      }
    }
    const itemsPerPage = 2;
    const startIndex = ((page - 1) * itemsPerPage) % targetSubs.length;
    const selectedSubs = targetSubs.slice(startIndex, startIndex + itemsPerPage);
    const subPromises = selectedSubs.map(async (sub) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(`${BASE_MEME_API}/${sub}/25?t=${Date.now()}_${page}_${sub}`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.memes)) {
            return data.memes
              .filter((m) => !m.nsfw && m.url)
              .map((item, idx) => normalizeMeme(item, `sub_${page}_${idx}`, category !== 'Tất cả' ? category : sub));
          }
        }
      } catch (e) {
        // Bỏ qua lỗi fallback
      }
      return [];
    });
    const subResults = await Promise.allSettled(subPromises);
    subResults.forEach((r) => {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        categorySubMemes.push(...r.value);
      }
    });
    // 4. Lọc dữ liệu Mock tương ứng để dự phòng offline tuyệt đối
    const filteredMock = MOCK_MEMES.filter((m) => {
      if (category !== 'Tất cả' && m.category.toLowerCase() !== category.toLowerCase()) return false;
      if (qLower !== '') {
        const titleLower = (m.title || '').toLowerCase();
        return titleLower.includes(qLower);
      }
      return true;
    });
    // 5. Gộp kết quả và khử trùng lặp theo ID & Image URL
    const combinedAll = [...redditMemes, ...categorySubMemes, ...filteredMock];
    const seenIds = new Set();
    const seenUrls = new Set();
    const finalResults = combinedAll.filter((m) => {
      if (!m || !m.id || !m.imageUrl) return false;
      const idStr = String(m.id);
      if (seenIds.has(idStr) || seenUrls.has(m.imageUrl)) return false;
      seenIds.add(idStr);
      seenUrls.add(m.imageUrl);
      return true;
    });
    return finalResults.length > 0 ? finalResults : filteredMock;
  } catch (error) {
    console.warn('[MemeApi] Lỗi tìm kiếm:', error.message);
    return MOCK_MEMES;
  }
};