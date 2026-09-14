import { Platform } from 'react-native';
import { MOCK_MEMES } from '../constants/mockMemes.js';
import { SUBREDDIT_POOL } from '../constants/subreddits.js';

const BASE_MEME_API = 'https://meme-api.com/gimme';

// ----------------------------------------------------------------------------------
// BỘ NHỚ ĐỆM TẠM THỜI (RAM CACHE)
// ----------------------------------------------------------------------------------
const responseCache = new Map();
const CACHE_TTL_MS = 90 * 1000; // 90 giây TTL

const getCachedData = (key) => {
  const item = responseCache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL_MS) {
    return item.data;
  }
  responseCache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  if (!data || data.length === 0) return;
  responseCache.set(key, {
    data,
    timestamp: Date.now(),
  });
  if (responseCache.size > 60) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
};

// Hàm gửi request kèm timeout tự động
const fetchWithTimeout = async (url, options = {}, timeoutMs = 6000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};

// Map các category sang nhiều Subreddit tương ứng trên Reddit để luân phiên tải ảnh
const SUBREDDIT_MAP = {
  Programmer: ['ProgrammerHumor', 'programmingmemes', 'softwareengineeringmemes', 'coder'],
  Cat: ['catmemes', 'cats', 'Meow_irl', 'Catmemes'],
  Anime: ['Animemes', 'goodanimemes', 'anime_irl', 'AnimeMeme'],
  Gaming: ['gaming', 'GamingMemes', 'wholesomememes', 'dankmemes'],
  Trending: ['memes', 'dankmemes', 'me_irl', 'wholesomememes', 'funny'],
};

// Map từ khóa thông dụng/tên meme sang các Subreddit chuyên đề tương ứng trên Reddit
const TOPIC_SUBREDDITS = {
  doge: ['dogelore', 'dogemining', 'memes', 'dankmemes'],
  shrek: ['shrek', 'shrekmemes', 'dankmemes'],
  pepe: ['pepe', 'dankmemes', 'memes'],
  pokemon: ['pokemonmemes', 'pokemon', 'memes'],
  marvel: ['marvelmemes', 'marvel', 'memes'],
  batman: ['batmanmemes', 'batman', 'memes'],
  cat: ['catmemes', 'cats', 'Meow_irl', 'Catmemes'],
  dog: ['dogmemes', 'dogs', 'rarepuppers'],
  gaming: ['gaming', 'GamingMemes', 'dankmemes'],
  game: ['gaming', 'GamingMemes', 'dankmemes'],
  programmer: ['ProgrammerHumor', 'programmingmemes', 'softwareengineeringmemes', 'coder'],
  developer: ['ProgrammerHumor', 'programmingmemes', 'coder'],
  code: ['ProgrammerHumor', 'programmingmemes', 'coder'],
  anime: ['Animemes', 'goodanimemes', 'anime_irl', 'AnimeMeme'],
  gym: ['bodybuildingmemes', 'gymmemes', 'fitness'],
  car: ['carmemes', 'cars'],
  food: ['foodmemes', 'food'],
  iphone: ['apple', 'iOSmemes', 'memes'],
  apple: ['apple', 'iOSmemes', 'memes'],
  laptop: ['pcmasterrace', 'memes'],
  pc: ['pcmasterrace', 'memes'],
  money: ['wallstreetbets', 'memes'],
  school: ['schoolmemes', 'memes'],
  student: ['schoolmemes', 'memes'],
  boss: ['workmemes', 'memes'],
  job: ['workmemes', 'memes'],
};

// Bảng từ điển dịch từ khóa tiếng Việt thông dụng sang tiếng Anh cho Reddit Search API
const VIETNAMESE_SEARCH_MAP = {
  // Cụm từ dài (Ưu tiên dịch trước)
  'lập trình viên': 'programmer developer',
  'lap trinh vien': 'programmer developer',
  'con chó': 'dog',
  'con cho': 'dog',
  'con mèo': 'cat',
  'con meo': 'cat',
  'chơi game': 'gaming',
  'choi game': 'gaming',
  'máy tính': 'pc computer',
  'may tinh': 'pc computer',
  'đi làm': 'work job',
  'di lam': 'work job',
  'tình yêu': 'love relationship',
  'tinh yeu': 'love relationship',
  'thể thao': 'sports',
  'the thao': 'sports',
  'bóng đá': 'football soccer',
  'bong da': 'football soccer',
  'siêu nhân': 'superhero',
  'sieu nhan': 'superhero',
  'xe hơi': 'car',
  'xe hoi': 'car',
  'ô tô': 'car',
  'o to': 'car',
  'đồ ăn': 'food',
  'do an': 'food',
  'thức ăn': 'food',
  'thuc an': 'food',
  'công việc': 'work job',
  'cong viec': 'work job',
  'hài hước': 'funny',
  'hai huoc': 'funny',

  // Từ đơn thông dụng
  'chó': 'dog',
  'cho': 'dog',
  'mèo': 'cat',
  'meo': 'cat',
  'lập trình': 'programmer',
  'lap trinh': 'programmer',
  'code': 'programmer',
  'dev': 'developer',
  'game': 'gaming',
  'súng': 'gun',
  'sung': 'gun',
  'laptop': 'laptop',
  'xe': 'car',
  'trường': 'school',
  'truong': 'school',
  'học': 'student',
  'hoc': 'student',
  'tiền': 'money',
  'tien': 'money',
  'ngủ': 'sleep',
  'ngu': 'sleep',
  'phim': 'movie',
  'nhạc': 'music',
  'nhac': 'music',
  'nhỏ': 'small cute',
  'nho': 'small cute',
  'lớn': 'big',
  'lon': 'big',
  'béo': 'fat',
  'beo': 'fat',
  'ngáo': 'derp funny',
  'ngao': 'derp funny',
  'vui': 'funny happy',
  'khóc': 'crying sad',
  'khoc': 'crying sad',
  'buồn': 'sad',
  'buon': 'sad',
  'sếp': 'boss',
  'sep': 'boss',
  'lương': 'salary money',
  'luong': 'salary money',
};

// Hàm loại bỏ dấu tiếng Việt chuẩn xác
const removeVietnameseAccents = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

// Danh sách từ khóa đã sắp xếp ưu tiên cụm từ dài thay thế trước
const SORTED_VIETNAMESE_KEYS = Object.keys(VIETNAMESE_SEARCH_MAP).sort((a, b) => b.length - a.length);

/**
 * Thuật toán dịch và xử lý từ khóa tiếng Việt thông minh cho Reddit Search
 */
const translateVietnameseQuery = (query) => {
  if (!query) return '';
  const qLower = query.toLowerCase().trim();

  // 1. Nếu khớp 100% từ khóa có sẵn trong dictionary
  if (VIETNAMESE_SEARCH_MAP[qLower]) {
    const translated = VIETNAMESE_SEARCH_MAP[qLower];
    return translated.includes('meme') ? translated : `${translated} meme`;
  }

  // 2. Thay thế linh hoạt các cụm từ ghép và từ đơn xuất hiện trong câu
  let translatedText = qLower;
  let hasReplacement = false;

  for (const key of SORTED_VIETNAMESE_KEYS) {
    if (translatedText.includes(key)) {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      translatedText = translatedText.replace(regex, VIETNAMESE_SEARCH_MAP[key]);
      hasReplacement = true;
    }
  }

  translatedText = translatedText.replace(/\s+/g, ' ').trim();

  // 3. Nếu từ khóa chứa tiếng Việt chưa dịch được (từ lạ), tự động loại bỏ dấu tiếng Việt
  if (!hasReplacement) {
    translatedText = removeVietnameseAccents(qLower);
  }

  // 4. Đảm bảo câu truy vấn luôn kèm 'meme' nếu chưa có
  if (!translatedText.toLowerCase().includes('meme')) {
    translatedText = `${translatedText} meme`;
  }

  return translatedText;
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
 * Hỗ trợ phân tích ảnh trực tiếp, preview image, imgur và Reddit gallery
 */
const parseRedditDirectPost = (item, index, categoryTag = 'Reddit') => {
  if (!item || !item.data) return null;
  const p = item.data;
  // Lọc bỏ bài NSFW (nhạy cảm) hoặc bài chỉ là video/text
  if (p.over_18 || p.is_video) return null;
  let imageUrl = p.url_overridden_by_dest || p.url || '';
  // Hỗ trợ trích xuất ảnh đầu tiên nếu bài viết thuộc dạng Reddit Gallery
  if (p.is_gallery && p.media_metadata) {
    const firstMediaId = Object.keys(p.media_metadata)[0];
    if (firstMediaId && p.media_metadata[firstMediaId]?.s?.u) {
      imageUrl = p.media_metadata[firstMediaId].s.u;
    }
  }
  // Fallback sang preview image nếu URL gốc là liên kết ngoài không có định dạng ảnh
  if (!imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && p.preview?.images?.[0]?.source?.url) {
    imageUrl = p.preview.images[0].source.url;
  }
  imageUrl = (imageUrl || '').replace(/&amp;/g, '&');
  // Kiểm tra tính hợp lệ của liên kết ảnh
  const isValidImage =
    imageUrl.startsWith('http') &&
    (imageUrl.match(/\.(jpg|jpeg|png|gif|webp)/i) ||
      imageUrl.includes('i.redd.it') ||
      imageUrl.includes('i.imgur.com') ||
      imageUrl.includes('preview.redd.it') ||
      imageUrl.includes('external-preview.redd.it'));
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
 * Tự động chọn luồng TRỰC TIẾP Reddit trên Mobile và Fallback Web
 */
export const fetchTrendingMemes = async (count = 50) => {
  const cacheKey = `trending_${count}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  try {
    const chosenSubreddits = shuffleArray(SUBREDDIT_POOL).slice(0, 4);
    const countPerSub = Math.ceil(count / chosenSubreddits.length);
    const isWeb = Platform.OS === 'web';
    const fetchPromises = chosenSubreddits.map(async (sub) => {
      try {
        if (!isWeb) {
          // Trên Mobile App: Truy cập TRỰC TIẾP Reddit subreddit hot.json
          const redditUrl = `https://www.reddit.com/r/${sub}/hot.json?limit=${countPerSub}&raw_json=1`;
          const res = await fetchWithTimeout(redditUrl, {
            headers: {
              'User-Agent': 'android:com.memord.app:v1.0.0 (by /u/memord_dev)',
              'Accept': 'application/json',
            },
          }, 6000);
          if (res.ok) {
            const data = await res.json();
            if (data?.data?.children && Array.isArray(data.data.children)) {
              return data.data.children
                .map((item, idx) => parseRedditDirectPost(item, idx, sub))
                .filter(Boolean);
            }
          }
        }
        // Fallback sang BASE_MEME_API (cho Web hoặc nếu direct fetch sập)
        const res = await fetchWithTimeout(`${BASE_MEME_API}/${sub}/${countPerSub}?t=${Date.now()}`, {}, 6000);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.memes)) {
            return data.memes
              .filter((m) => !m.nsfw)
              .map((item, idx) => normalizeMeme(item, idx, sub));
          }
        }
      } catch (err) {
        // Bỏ qua lỗi lẻ của từng sub
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
        if (!m || !m.id || !m.imageUrl || seenIds.has(m.id)) return false;
        seenIds.add(m.id);
        return true;
      });
      const resultData = shuffleArray(uniqueMemes);
      setCachedData(cacheKey, resultData);
      return resultData;
    }
    return shuffleArray(MOCK_MEMES);
  } catch (error) {
    console.warn('[MemeApi] Lỗi mạng, kích hoạt Fallback Mock:', error.message);
    return shuffleArray(MOCK_MEMES);
  }
};

// ------------------------------- Khoa (Search & Filter API - Reddit Direct Search Tối Ưu) -----------------------------------
/**
 * Hàm tìm kiếm TRỰC TIẾP trên Reddit (Phản hồi tức thì, không bị lỗi 403 Forbidden của Reddit Search)
 * @param {string} query Từ khóa tìm kiếm từ người dùng
 * @param {string} category Danh mục được chọn (Programmer | Cat | Anime | Gaming | Trending | Tất cả)
 * @param {number} page Trang hiện tại (1, 2, 3...)
 * @returns {Promise<Array>} Danh sách Meme chuẩn Schema
 */
export const searchMemes = async (query = '', category = 'Tất cả', page = 1) => {
  const rawQuery = (query || '').trim();
  const cacheKey = `search_${rawQuery.toLowerCase()}_${category}_${page}`;

  if (page === 1) {
    const cached = getCachedData(cacheKey);
    if (cached) return cached;
  }

  try {
    const qLower = rawQuery.toLowerCase();
    const isWeb = Platform.OS === 'web';
    let fetchedMemes = [];

    // 1. Xác định danh sách Subreddit mục tiêu dựa trên từ khóa hoặc danh mục
    let targetSubs = [];
    if (rawQuery !== '') {
      const translated = translateVietnameseQuery(rawQuery).replace(/\bmeme\b/g, '').trim();
      const firstWord = (translated.split(' ')[0] || qLower).toLowerCase();
      const cleanWord = firstWord.replace(/[^a-z0-9]/g, '');

      if (TOPIC_SUBREDDITS[cleanWord]) {
        targetSubs = TOPIC_SUBREDDITS[cleanWord];
      } else if (cleanWord.length > 1) {
        targetSubs = [`${cleanWord}memes`, cleanWord, 'memes', 'dankmemes'];
      } else {
        targetSubs = ['memes', 'dankmemes', 'wholesomememes', 'funny'];
      }
    } else if (category !== 'Tất cả' && SUBREDDIT_MAP[category]) {
      targetSubs = SUBREDDIT_MAP[category];
    } else {
      targetSubs = ['memes', 'dankmemes', 'wholesomememes', 'funny', 'me_irl'];
    }

    // Luân phiên chọn các Subreddit theo phân trang
    const itemsPerPage = 2;
    const startIndex = ((page - 1) * itemsPerPage) % targetSubs.length;
    const selectedSubs = targetSubs.slice(startIndex, startIndex + itemsPerPage);

    // 2. Tải bài viết từ các Subreddit chuyên đề (100% dữ liệu từ Reddit)
    const subPromises = selectedSubs.map(async (sub) => {
      try {
        if (!isWeb) {
          // Trên Mobile: Kết nối trực tiếp Subreddit hot.json trên Reddit 100% (không dính lỗi 403 search)
          const redditSubUrl = `https://www.reddit.com/r/${sub}/hot.json?limit=30&raw_json=1`;
          const res = await fetchWithTimeout(redditSubUrl, {
            headers: {
              'User-Agent': 'android:com.memord.app:v1.0.0 (by /u/memord_dev)',
              'Accept': 'application/json',
            },
          }, 5000);
          if (res.ok) {
            const json = await res.json();
            if (json?.data?.children && Array.isArray(json.data.children)) {
              return json.data.children
                .map((item, idx) => parseRedditDirectPost(item, idx, category !== 'Tất cả' ? category : sub))
                .filter(Boolean);
            }
          }
        }
        // Fallback sang BASE_MEME_API cho Web hoặc khi Fetch trực tiếp bị sập
        const res = await fetchWithTimeout(`${BASE_MEME_API}/${sub}/30`, {}, 5000);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.memes)) {
            return data.memes
              .filter((m) => !m.nsfw && m.url)
              .map((item, idx) => normalizeMeme(item, `sub_${page}_${idx}`, category !== 'Tất cả' ? category : sub));
          }
        }
      } catch (e) { }
      return [];
    });

    const subResults = await Promise.allSettled(subPromises);
    subResults.forEach((r) => {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        fetchedMemes.push(...r.value);
      }
    });

    // 3. Dự phòng offline từ MOCK_MEMES
    const filteredMock = MOCK_MEMES.filter((m) => {
      if (category !== 'Tất cả' && m.category.toLowerCase() !== category.toLowerCase()) return false;
      if (qLower !== '') {
        const titleLower = (m.title || '').toLowerCase();
        return titleLower.includes(qLower);
      }
      return true;
    });

    // 4. Khử trùng lặp theo ID & Image URL
    const combinedAll = [...fetchedMemes, ...filteredMock];
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

    const output = finalResults.length > 0 ? finalResults : filteredMock;
    if (page === 1) {
      setCachedData(cacheKey, output);
    }
    return output;
  } catch (error) {
    console.warn('[MemeApi] Lỗi tìm kiếm:', error.message);
    return MOCK_MEMES;
  }
};