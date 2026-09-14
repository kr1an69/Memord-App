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
// Từ điển đồng nghĩa Anh - Việt phục vụ tìm kiếm thông minh
const SYNONYM_MAP = {
  cat: ['mèo', 'cat', 'meow', 'kitten', 'happy_cat', 'meow_funny'],
  mèo: ['mèo', 'cat', 'meow', 'kitten', 'happy_cat', 'meow_funny'],
  code: ['code', 'programmer', 'dev', 'bug', 'lập trình', 'client', 'boss', 'review', 'senior_dev', 'bug_hunter', 'code_architect', 'ui_ux_ninja'],
  dev: ['code', 'programmer', 'dev', 'bug', 'lập trình', 'senior_dev', 'bug_hunter', 'code_architect'],
  bug: ['bug', 'fix 1 bug', 'code', 'dev', 'lập trình', 'bug_hunter'],
  'lập trình': ['code', 'programmer', 'dev', 'bug', 'lập trình', 'senior_dev'],
  programmer: ['code', 'programmer', 'dev', 'bug', 'lập trình', 'senior_dev', 'code_architect'],
  anime: ['anime', 'wibu', 'otaku', 'gacha', 'ssr', 'main anime', 'otaku_king', 'anime_fan99'],
  game: ['game', 'gaming', 'chơi game', 'gánh team', 'ranked', 'pro_gamer', 'ranked_warrior'],
  gaming: ['game', 'gaming', 'chơi game', 'gánh team', 'ranked', 'pro_gamer', 'ranked_warrior'],
  trending: ['trending', 'thứ 2', 'deadline', 'monday_blues', 'thịnh hành'],
};

/**
 * Kiểm tra xem một meme (title, category, author) có khớp với keyword tìm kiếm hay không
 */
const matchesQuery = (meme, queryStr) => {
  if (!queryStr || queryStr.trim() === '') return true;
  const q = queryStr.toLowerCase().trim();
  const title = (meme.title || '').toLowerCase();
  const category = (meme.category || '').toLowerCase();
  const author = (meme.author || '').toLowerCase();

  // 1. Phù hợp trực tiếp trong tiêu đề, thể loại hoặc tác giả
  if (title.includes(q) || category.includes(q) || author.includes(q)) {
    return true;
  }

  // 2. Phù hợp qua từ điển đồng nghĩa Anh - Việt
  const synonyms = SYNONYM_MAP[q];
  if (synonyms && Array.isArray(synonyms)) {
    return synonyms.some(
      (syn) => title.includes(syn) || category.includes(syn) || author.includes(syn)
    );
  }

  // 3. Tách từ ghép để tìm từng từ nhỏ (ví dụ "mèo hài" -> tìm "mèo")
  const words = q.split(/\s+/).filter((w) => w.length > 1);
  if (words.length > 1) {
    return words.some((w) => title.includes(w) || category.includes(w));
  }

  return false;
};

/**
 * Search hoặc Filter Meme theo từ khóa và chủ đề cho SearchFilterScreen
 * @param {string} query Từ khóa tìm kiếm
 * @param {string} category Thể loại (Programmer | Cat | Anime | Gaming | Trending | Tất cả)
 * @returns {Promise<Array>} Danh sách meme phù hợp
 */
export const searchMemes = async (query = '', category = 'Tất cả') => {
  try {
    const cleanQuery = query ? query.trim() : '';

    // 1. Xác định Subreddit mục tiêu dựa trên Category & Query
    let targetSubreddits = [];

    if (category && category !== 'Tất cả' && SUBREDDIT_MAP[category]) {
      const mapped = SUBREDDIT_MAP[category];
      targetSubreddits = Array.isArray(mapped) ? mapped : [mapped];
    } else {
      // Nếu là "Tất cả", thử phân tích từ khóa để chọn Subreddit phù hợp nhất
      const qLower = cleanQuery.toLowerCase();
      if (qLower.includes('cat') || qLower.includes('mèo')) {
        targetSubreddits = ['catmemes', 'cats'];
      } else if (qLower.includes('dog') || qLower.includes('chó')) {
        targetSubreddits = ['dogmemes'];
      } else if (qLower.includes('code') || qLower.includes('dev') || qLower.includes('bug') || qLower.includes('lập trình')) {
        targetSubreddits = ['ProgrammerHumor', 'codingmemes'];
      } else if (qLower.includes('anime') || qLower.includes('wibu')) {
        targetSubreddits = ['Animemes', 'goodanimemes'];
      } else if (qLower.includes('game') || qLower.includes('gaming')) {
        targetSubreddits = ['wholesomememes', 'gamingmemes'];
      } else {
        targetSubreddits = ['memes', 'dankmemes', 'me_irl', 'funny'];
      }
    }

    // 2. Fetch meme từ Online API
    const subToFetch = targetSubreddits[Math.floor(Math.random() * targetSubreddits.length)] || 'memes';
    let onlineMemes = [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${BASE_MEME_API}/${subToFetch}/40?t=${Date.now()}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.memes)) {
          onlineMemes = data.memes
            .filter((m) => !m.nsfw)
            .map((item, idx) => normalizeMeme(item, idx, category !== 'Tất cả' ? category : subToFetch));
        }
      }
    } catch (e) {
      console.warn('[MemeApi] Online fetch failed, fallback to mock data:', e.message);
    }

    // 3. Lọc danh sách online theo Query
    let filteredOnline = onlineMemes.filter((m) => matchesQuery(m, cleanQuery));

    // 4. Lọc dữ liệu Mock chuẩn bị sẵn
    let filteredMock = MOCK_MEMES.filter((m) => {
      // Lọc theo Category (nếu chọn cụ thể)
      if (category && category !== 'Tất cả') {
        const catMatch = m.category.toLowerCase() === category.toLowerCase();
        if (!catMatch) return false;
      }
      // Lọc theo Query
      return matchesQuery(m, cleanQuery);
    });

    // 5. Kết hợp kết quả (Ưu tiên online, sau đó ghép mock để kết quả luôn phong phú)
    const combined = [...filteredOnline, ...filteredMock];

    // Lọc trùng lặp ID
    const seenIds = new Set();
    const finalResults = combined.filter((m) => {
      if (!m.id || seenIds.has(m.id)) return false;
      seenIds.add(m.id);
      return true;
    });

    // 6. Nếu kết quả vẫn rỗng khi tìm kiếm cụ thể, trả về các meme cùng danh mục hoặc MOCK_MEMES ngẫu nhiên để không bị trống màn hình
    if (finalResults.length === 0) {
      if (category && category !== 'Tất cả') {
        return MOCK_MEMES.filter((m) => m.category.toLowerCase() === category.toLowerCase());
      }
      return MOCK_MEMES;
    }

    return finalResults;
  } catch (error) {
    console.warn('[MemeApi] Lỗi tìm kiếm, trả về mock fallback:', error.message);
    return MOCK_MEMES.filter((m) => matchesQuery(m, query));
  }
};