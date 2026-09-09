import { MOCK_MEMES } from '../constants/mockMemes.js';
import { SUBREDDIT_POOL } from '../constants/subreddits.js';

const BASE_MEME_API = 'https://meme-api.com/gimme';

// ------------------------------- TAnh -----------------------------------
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

// ------------------------------- Khoa -----------------------------------
/**
 * Search or filter Meme theo từ khóa và chủ đề cho SearchFilterScreen
 * @param {string} query Từ khóa tìm kiếm
 * @param {string} category Thể loại (Programmer | Anime | Cat | Gaming | Trending | Tất cả)
 * @returns {Promise<Array>} Danh sách meme 
 */
export const searchMemes = async (query = '', category = 'Tất cả') => {
  try {
    // Nếu có chọn thể loại cụ thể khác "Tất cả", thử fetch theo subreddit tương ứng
    const targetSubreddit = SUBREDDIT_MAP[category];
    if (targetSubreddit) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${BASE_MEME_API}/${targetSubreddit}/25`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.memes) && data.memes.length > 0) {
          let list = data.memes.filter((m) => !m.nsfw).map((item, idx) => normalizeMeme(item, idx, category));
          if (query && query.trim() !== '') {
            const lowerQ = query.toLowerCase().trim();
            list = list.filter((m) => m.title.toLowerCase().includes(lowerQ));
          }
          if (list.length > 0) return list;
        }
      }
    }

    // Fallback: Lấy ra từ MOCK_MEMES
    let filtered = [...MOCK_MEMES];
    if (category && category !== 'Tất cả') {
      filtered = filtered.filter((m) => m.category.toLowerCase() === category.toLowerCase());
    }
    if (query && query.trim() !== '') {
      const lowerQ = query.toLowerCase().trim();
      filtered = filtered.filter((m) => m.title.toLowerCase().includes(lowerQ));
    }
    return filtered;
  } catch (error) {
    console.warn('[MemeApi] Error search, fallback mock:', error.message);
    return MOCK_MEMES;
  }
};
