import { MOCK_MEMES } from '../constants/mockMemes.js';

const BASE_MEME_API = 'https://meme-api.com/gimme';

// Map các category sang subreddit tương ứng trên Reddit để fetch ảnh chuẩn chủ đề
const SUBREDDIT_MAP = {
  Programmer: 'ProgrammerHumor',
  Cat: 'catmemes',
  Anime: 'Animemes',
  Gaming: 'wholesomememes',
  Trending: 'memes',
};

/**
 * Chuẩn hóa dữ liệu trả về từ Meme-API hoặc Reddit sang đúng schema chuẩn của Memord
 */
const normalizeMeme = (item, index, defaultCategory = 'Trending') => ({
  id: item.postLink ? String(item.postLink).split('/').filter(Boolean).pop() : `meme_${Date.now()}_${index}`,
  title: item.title || 'Meme không tiêu đề',
  imageUrl: item.url || item.imageUrl,
  author: item.author || 'Ẩn danh',
  likes: typeof item.ups === 'number' ? item.ups : Math.floor(Math.random() * 2000) + 100,
  category: item.subreddit || defaultCategory,
  width: 600,
  height: Math.floor(Math.random() * 250) + 600, // Tỉ lệ ngẫu nhiên 600-850 để hỗ trợ giao diện so le Pinterest
});

/**
 * Lấy danh sách Meme thịnh hành cho HomeScreen
 * @param {number} count Số lượng meme cần lấy (mặc định 20)
 * @returns {Promise<Array>} Danh sách các meme đã chuẩn hóa
 */
export const fetchTrendingMemes = async (count = 20) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(`${BASE_MEME_API}/${count}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API trả về mã lỗi: ${response.status}`);
    }

    const data = await response.json();
    if (data && Array.isArray(data.memes) && data.memes.length > 0) {
      // Lọc bỏ các ảnh NSFW nếu có
      const validMemes = data.memes
        .filter((m) => !m.nsfw)
        .map((item, idx) => normalizeMeme(item, idx, 'Trending'));
      
      if (validMemes.length > 0) {
        return validMemes;
      }
    }
    return MOCK_MEMES;
  } catch (error) {
    console.warn('[MemeApi] Lỗi fetch online, kích hoạt Fallback Mock Data:', error.message);
    return MOCK_MEMES;
  }
};

/**
 * Tìm kiếm hoặc lọc Meme theo từ khóa và chủ đề cho SearchFilterScreen
 * @param {string} query Từ khóa tìm kiếm
 * @param {string} category Thể loại (Programmer | Anime | Cat | Gaming | Trending | Tất cả)
 * @returns {Promise<Array>} Danh sách meme phù hợp
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

    // Fallback: Lọc từ MOCK_MEMES nội bộ
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
    console.warn('[MemeApi] Lỗi tìm kiếm, fallback về mock:', error.message);
    return MOCK_MEMES;
  }
};
