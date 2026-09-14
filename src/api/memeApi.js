import { Platform } from 'react-native';
import { MOCK_MEMES } from '../constants/mockMemes.js';
import { SUBREDDIT_POOL } from '../constants/subreddits.js';

const BASE_MEME_API = 'https://meme-api.com/gimme';

// ------------------------------- TAnh (Trần Tuấn Anh - Module 1) -----------------------------------
// Map các category sang subreddit tương ứng trên Reddit để fetch ảnh chuẩn chủ đề
const SUBREDDIT_MAP = {
  Programmer: 'ProgrammerHumor',
  Cat: 'catmemes',
  Anime: 'Animemes',
  Gaming: 'wholesomememes',
  Trending: 'memes',
};

// function shuffle meme array for random subreddits
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
  height: Math.floor(Math.random() * 250) + 600, // Tỉ lệ ngẫu nhiên 600-850 để hỗ trợ giao diện so le Pinterest
});

/**
 * Lấy danh sách trending memes cho HomeScreen
 * @param {number} count Số lượng meme cần lấy (mặc định 20)
 * @returns {Promise<Array>} Danh sách các meme đã chuẩn hóa
 */
export const fetchTrendingMemes = async (count = 50) => {
  try {
    // 1. Bốc ngẫu nhiên 4 subreddit khác nhau từ SUBREDDIT_POOL
    const chosenSubreddits = shuffleArray(SUBREDDIT_POOL).slice(0, 4);
    const countPerSub = Math.ceil(count / chosenSubreddits.length); // ~12-13 bài mỗi sub

    // 2. Tạo danh sách các yêu cầu fetch song song kèm bẻ cache ?t=...
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

    // 3. Dùng allSettled: cái nào lỗi kệ nó, gom toàn bộ kết quả thành công
    const settleResults = await Promise.allSettled(fetchPromises);
    const combinedMemes = [];
    settleResults.forEach((result) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        combinedMemes.push(...result.value);
      }
    });
    // 4. Nếu có dữ liệu online, lọc trùng ID và xáo trộn ngẫu nhiên
    if (combinedMemes.length > 0) {
      const seenIds = new Set();
      const uniqueMemes = combinedMemes.filter((m) => {
        if (seenIds.has(m.id)) return false;
        seenIds.add(m.id);
        return true;
      });
      return shuffleArray(uniqueMemes);
    }
    // Fallback: Nếu mất mạng hoàn toàn thì xáo trộn mock data
    return shuffleArray(MOCK_MEMES);
  } catch (error) {
    console.warn('[MemeApi] Lỗi mạng, kích hoạt Fallback Mock:', error.message);
    return shuffleArray(MOCK_MEMES);
  }
};

// ------------------------------- Khoa (Vũ Đăng Khoa - Module 3: Search & Filter API) -----------------------------------

// Bộ nhớ đệm RAM Cache riêng cho Search API
const responseCache = new Map();
const CACHE_TTL_MS = 90 * 1000;

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
  responseCache.set(key, { data, timestamp: Date.now() });
  if (responseCache.size > 60) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
};

// Hàm gửi request kèm timeout tự động cho Search
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

// Map danh mục sang các Subreddit tương ứng cho Search & Filter
const KHOA_SUBREDDIT_MAP = {
  Programmer: ['ProgrammerHumor', 'programmingmemes', 'softwareengineeringmemes', 'coder'],
  Cat: ['catmemes', 'cats', 'Meow_irl', 'Catmemes'],
  Anime: ['Animemes', 'goodanimemes', 'anime_irl', 'AnimeMeme'],
  Gaming: ['gaming', 'GamingMemes', 'wholesomememes', 'dankmemes'],
  Trending: ['memes', 'dankmemes', 'me_irl', 'wholesomememes', 'funny'],
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

/**
 * Chuẩn hóa 1 bài post từ Reddit API trực tiếp (reddit.com/r/{sub}/hot.json)
 * Hỗ trợ phân tích ảnh trực tiếp, preview image, imgur và Reddit gallery
 */
const parseRedditDirectPost = (item, index, categoryTag = 'Reddit') => {
  if (!item || !item.data) return null;
  const p = item.data;
  if (p.over_18 || p.is_video) return null;
  let imageUrl = p.url_overridden_by_dest || p.url || '';

  if (p.is_gallery && p.media_metadata) {
    const firstMediaId = Object.keys(p.media_metadata)[0];
    if (firstMediaId && p.media_metadata[firstMediaId]?.s?.u) {
      imageUrl = p.media_metadata[firstMediaId].s.u;
    }
  }

  if (!imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && p.preview?.images?.[0]?.source?.url) {
    imageUrl = p.preview.images[0].source.url;
  }
  imageUrl = (imageUrl || '').replace(/&amp;/g, '&');

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
 * Hàm tìm kiếm TRỰC TIẾP trên Reddit cho SearchFilterScreen (Thuộc Module 3 - Vũ Đăng Khoa)
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
    const isWeb = Platform.OS === 'web';
    const cleanNoAccents = removeVietnameseAccents(rawQuery).toLowerCase().trim();
    let fetchedMemes = [];

    // 1. Xác định danh sách Subreddit mục tiêu dựa trên từ khóa hoặc danh mục
    let targetSubs = [];
    if (cleanNoAccents !== '') {
      const words = cleanNoAccents.split(/\s+/).filter(Boolean);
      const mainWord = words[0].replace(/[^a-z0-9]/g, '');
      if (mainWord.length > 1) {
        targetSubs = [`${mainWord}memes`, mainWord, 'memes', 'dankmemes', 'wholesomememes'];
      } else {
        targetSubs = ['memes', 'dankmemes', 'wholesomememes', 'funny'];
      }
    } else if (category !== 'Tất cả' && KHOA_SUBREDDIT_MAP[category]) {
      targetSubs = KHOA_SUBREDDIT_MAP[category];
    } else {
      targetSubs = ['memes', 'dankmemes', 'wholesomememes', 'funny', 'me_irl'];
    }

    // Luân phiên chọn các Subreddit theo phân trang
    const itemsPerPage = 2;
    const startIndex = ((page - 1) * itemsPerPage) % targetSubs.length;
    const selectedSubs = targetSubs.slice(startIndex, startIndex + itemsPerPage);

    // 2. Tải bài viết từ các Subreddit mục tiêu (Kết nối trực tiếp Reddit trên Mobile)
    const subPromises = selectedSubs.map(async (sub) => {
      try {
        if (!isWeb) {
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
        // Fallback sang BASE_MEME_API cho Web hoặc khi kết nối trực tiếp bị sập
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
      if (cleanNoAccents !== '') {
        const titleClean = removeVietnameseAccents(m.title || '').toLowerCase();
        return titleClean.includes(cleanNoAccents);
      }
      return true;
    });

    // 4. Lọc bài viết liên quan từ khóa nếu có query
    let candidates = [...fetchedMemes, ...filteredMock];
    if (cleanNoAccents !== '') {
      const queryWords = cleanNoAccents.split(/\s+/).filter((w) => w.length > 1);
      if (queryWords.length > 0) {
        const matched = candidates.filter((m) => {
          const titleClean = removeVietnameseAccents(m.title || '').toLowerCase();
          const catClean = (m.category || '').toLowerCase();
          return queryWords.some((w) => titleClean.includes(w) || catClean.includes(w));
        });
        if (matched.length > 0) {
          candidates = matched;
        }
      }
    }

    // 5. Khử trùng lặp tuyệt đối theo ID & Image URL
    const seenIds = new Set();
    const seenUrls = new Set();
    const finalResults = candidates.filter((m) => {
      if (!m || !m.id || !m.imageUrl) return false;
      const idStr = String(m.id);
      if (seenIds.has(idStr) || seenUrls.has(m.imageUrl)) return false;
      seenIds.add(idStr);
      seenUrls.add(m.imageUrl);
      return true;
    });

    if (page === 1 && finalResults.length > 0) {
      setCachedData(cacheKey, finalResults);
    }

    return finalResults;
  } catch (error) {
    console.warn('[MemeApi] Lỗi tìm kiếm, fallback MOCK:', error.message);
    return MOCK_MEMES.filter((m) => {
      if (category !== 'Tất cả' && m.category.toLowerCase() !== category.toLowerCase()) return false;
      if (query.trim() !== '') {
        const titleClean = removeVietnameseAccents(m.title || '').toLowerCase();
        const queryClean = removeVietnameseAccents(query).toLowerCase();
        return titleClean.includes(queryClean);
      }
      return true;
    });
  }
};
