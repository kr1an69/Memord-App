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

// Cấu hình kho chủ đề thông minh mở rộng (Phủ sóng hơn 20+ chủ đề hot nhất)
const TOPIC_CONFIG = [
  {
    name: 'Guns',
    subreddits: ['gunmemes', 'guns', 'Firearms'],
    keywords: ['súng', 'sung', 'gun', 'guns', 'weapon', 'firearm', 'ak47', 'bắn súng', 'ban sung'],
    mockCategory: 'General',
  },
  {
    name: 'Superhero',
    subreddits: ['marvelmemes', 'DC_Cinematic', 'superhero', 'ComicBookMemes'],
    keywords: ['siêu nhân', 'sieu nhan', 'superhero', 'marvel', 'dc', 'batman', 'spiderman', 'avengers', 'ironman', 'thor'],
    mockCategory: 'General',
  },
  {
    name: 'Gym',
    subreddits: ['gymmemes', 'fitness30plus', 'bodybuilding'],
    keywords: ['gym', 'fitness', 'tập gym', 'tap gym', 'thể hình', 'workout', 'muscle', 'tạ', 'tập tạ', 'chạy bộ'],
    mockCategory: 'General',
  },
  {
    name: 'iPhone / Apple',
    subreddits: ['iphone', 'apple', 'macbook', 'ios'],
    keywords: ['iphone', 'apple', 'ios', 'điện thoại', 'dien thoai', 'ipad', 'macbook', 'airpods'],
    mockCategory: 'General',
  },
  {
    name: 'Laptop / PC',
    subreddits: ['pcmasterrace', 'techsupportgurus', 'laptops', 'technology'],
    keywords: ['laptop', 'pc', 'máy tính', 'may tinh', 'tech', 'setup', 'card đồ họa', 'gpu', 'ram', 'cpu'],
    mockCategory: 'Programmer',
  },
  {
    name: 'Cars',
    subreddits: ['carMemes', 'cars', 'auto'],
    keywords: ['xe', 'xe hơi', 'xe hoi', 'car', 'cars', 'oto', 'ô tô', 'driver', 'racing', 'bánh xe'],
    mockCategory: 'General',
  },
  {
    name: 'Food',
    subreddits: ['foodmemes', 'FoodPorn', 'eat'],
    keywords: ['đồ ăn', 'do an', 'thức ăn', 'thuc an', 'food', 'pizza', 'burger', 'ăn', 'an uống', 'nấu ăn'],
    mockCategory: 'General',
  },
  {
    name: 'School',
    subreddits: ['schoolmemes', 'students', 'college'],
    keywords: ['trường', 'truong', 'học', 'hoc', 'school', 'student', 'thi', 'kiểm tra', 'homework', 'giáo viên', 'thầy', 'cô'],
    mockCategory: 'General',
  },
  {
    name: 'Money',
    subreddits: ['wallstreetbets', 'financialindependence', 'money'],
    keywords: ['tiền', 'tien', 'money', 'lương', 'luong', 'dollar', 'giàu', 'nghèo', 'crypto', 'bitcoin'],
    mockCategory: 'General',
  },
  {
    name: 'Work',
    subreddits: ['workmemes', 'jobs', 'office'],
    keywords: ['đi làm', 'di lam', 'công việc', 'cong viec', 'work', 'job', 'boss', 'sếp', 'đồng nghiệp', 'ot', 'tăng ca'],
    mockCategory: 'General',
  },
  {
    name: 'Sleep',
    subreddits: ['sleep', 'bed'],
    keywords: ['ngủ', 'ngu', 'sleep', 'buồn ngủ', 'buon ngu', 'mệt', 'tỉnh dậy', 'báo thức'],
    mockCategory: 'General',
  },
  {
    name: 'Love',
    subreddits: ['relationship_memes', 'love'],
    keywords: ['tình yêu', 'tinh yeu', 'love', 'crush', 'bạn gái', 'bạn trai', 'người yêu', 'ex', 'thất tình'],
    mockCategory: 'General',
  },
  {
    name: 'Sports',
    subreddits: ['sports', 'footballmemes', 'soccer'],
    keywords: ['thể thao', 'the thao', 'football', 'soccer', 'bóng đá', 'bong da', 'messi', 'ronaldo', 'nba'],
    mockCategory: 'General',
  },
  {
    name: 'Movies',
    subreddits: ['MovieMemes', 'movies', 'cinema'],
    keywords: ['phim', 'movie', 'movies', 'cinema', 'rạp chiếu phim', 'hollywood'],
    mockCategory: 'General',
  },
  {
    name: 'Music',
    subreddits: ['musicmemes', 'Music'],
    keywords: ['nhạc', 'nhac', 'music', 'bài hát', 'ca sĩ', 'guitar'],
    mockCategory: 'General',
  },
  {
    name: 'Dog',
    subreddits: ['dogmemes', 'dogs', 'rarepuppers', 'doge', 'Doggos', 'lookatmydog'],
    keywords: ['chó', 'cho', 'cún', 'cun', 'dog', 'puppy', 'doge', 'gâu', 'con chó', 'chó con', 'husky', 'shiba'],
    mockCategory: 'Dog',
  },
  {
    name: 'Cat',
    subreddits: ['catmemes', 'cats', 'Meow_irl', 'cat', 'catsimulator', 'Catmemes'],
    keywords: ['mèo', 'meo', 'cat', 'kitten', 'kitty', 'meow', 'con mèo', 'mèo con', 'miu', 'mun'],
    mockCategory: 'Cat',
  },
  {
    name: 'Programmer',
    subreddits: ['ProgrammerHumor', 'programmingmemes', 'softwareengineeringmemes', 'coder', 'programmer'],
    keywords: ['code', 'dev', 'programmer', 'bug', 'lập trình', 'lap trinh', 'coder', 'phần mềm', 'fix bug', 'senior', 'junior'],
    mockCategory: 'Programmer',
  },
  {
    name: 'Anime',
    subreddits: ['Animemes', 'goodanimemes', 'anime_irl', 'AnimeMeme'],
    keywords: ['anime', 'wibu', 'otaku', 'manga', 'hoạt hình', 'waifu'],
    mockCategory: 'Anime',
  },
  {
    name: 'Gaming',
    subreddits: ['gaming', 'GamingMemes', 'wholesomememes', 'dankmemes', 'me_irl'],
    keywords: ['game', 'gaming', 'chơi game', 'choi game', 'game thủ', 'gánh team', 'ranked', 'pro', 'liên quân', 'lmht', 'valorant', 'pubg'],
    mockCategory: 'Gaming',
  },
];

// function shuffle meme array for random subreddits
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

// ------------------------------- Khoa (Search & Filter API - Siêu tốc & Đa chủ đề 100%) -----------------------------------

/**
 * Hàm Tìm kiếm & Lọc Meme không giới hạn (hỗ trợ phân trang page vô tận & hơn 20+ chủ đề)
 * @param {string} query Từ khóa tìm kiếm (vd: "súng", "siêu nhân", "gym", "iphone", "laptop", "con chó", "con mèo", "lập trình")
 * @param {string} category Danh mục được lọc (Programmer | Cat | Anime | Gaming | Trending | Tất cả)
 * @param {number} page Trang hiện tại (1, 2, 3...)
 * @returns {Promise<Array>} Danh sách Meme chuẩn Schema
 */
export const searchMemes = async (query = '', category = 'Tất cả', page = 1) => {
  try {
    const rawQuery = (query || '').trim();
    const qLower = rawQuery.toLowerCase();

    // 1. Nhận diện chủ đề từ từ khóa tiếng Việt / tiếng Anh trong kho 20+ chủ đề
    let matchedTopic = null;
    if (qLower) {
      matchedTopic = TOPIC_CONFIG.find((topic) =>
        topic.keywords.some((kw) => qLower.includes(kw) || kw.includes(qLower))
      );
    }

    // 2. Xác định danh sách Subreddit mục tiêu dựa trên chủ đề hoặc từ khóa trực tiếp
    let targetSubList = ['memes', 'dankmemes', 'me_irl', 'wholesomememes', 'funny'];

    if (matchedTopic) {
      targetSubList = matchedTopic.subreddits;
    } else if (category !== 'Tất cả' && SUBREDDIT_MAP[category]) {
      targetSubList = Array.isArray(SUBREDDIT_MAP[category])
        ? SUBREDDIT_MAP[category]
        : [SUBREDDIT_MAP[category]];
    } else if (qLower.length > 2) {
      // Nếu không khớp bảng từ khóa, thử dùng chính từ khóa làm tên Subreddit (vd: "robot", "coffee", "space")
      const cleanWord = qLower.replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 2) {
        targetSubList = [cleanWord, 'memes', 'dankmemes'];
      }
    }

    // Luân phiên chọn Subreddit theo số trang (page)
    const subIndex = Math.max(0, page - 1) % targetSubList.length;
    const targetSub = targetSubList[subIndex] || 'memes';

    // 3. Gọi API lấy 50 Meme từ Subreddit công khai
    let onlineMemes = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${BASE_MEME_API}/${targetSub}/50?t=${Date.now()}_${page}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.memes)) {
          onlineMemes = data.memes
            .filter((m) => !m.nsfw)
            .map((item, idx) => normalizeMeme(item, `p${page}_${idx}`, matchedTopic ? matchedTopic.name : category));
        }
      }
    } catch (e) {
      console.warn('[MemeApi] Lỗi kết nối online, chuyển sang fallback:', e.message);
    }

    // 4. Lọc dữ liệu Online
    let filteredOnline = onlineMemes;
    if (!matchedTopic && qLower !== '') {
      const matchedByTitle = onlineMemes.filter((m) => {
        const title = (m.title || '').toLowerCase();
        return title.includes(qLower);
      });
      if (matchedByTitle.length > 0) {
        filteredOnline = matchedByTitle;
      } else if (onlineMemes.length > 0) {
        filteredOnline = onlineMemes.slice(0, 25);
      }
    }

    // 5. Lọc dữ liệu Mock tương ứng
    let filteredMock = MOCK_MEMES.filter((m) => {
      if (category !== 'Tất cả' && m.category.toLowerCase() !== category.toLowerCase()) return false;
      if (qLower !== '') {
        if (matchedTopic && matchedTopic.mockCategory !== 'General') {
          return (
            m.category.toLowerCase() === matchedTopic.mockCategory.toLowerCase() ||
            (m.title || '').toLowerCase().includes(qLower)
          );
        }
        return (m.title || '').toLowerCase().includes(qLower);
      }
      return true;
    });

    // 6. Gộp kết quả
    const combined = [...filteredOnline, ...filteredMock];
    return combined;
  } catch (error) {
    console.warn('[MemeApi] Search warning:', error.message);
    return MOCK_MEMES;
  }
};