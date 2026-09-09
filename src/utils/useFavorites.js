/**
 * useFavorites.js
 * Custom Hook quan ly danh sach Meme yeu thich toan cuc (in-memory store).
 *
 * Co che hoat dong:
 *  - Dung mot mang `_favorites` nam ngoai React (module-level) de gia lap global state
 *    ma khong can Redux / Context API phuc tap.
 *  - Moi component dung hook nay se dang ky mot listener; khi danh sach thay doi,
 *    tat ca listener duoc thong bao va component tu re-render.
 *
 * Cach dung:
 *  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
 */

import { useState, useEffect, useCallback } from 'react';

// --- Module-level global store ------------------------------------------------
let _favorites = []; // Mang meme da luu
const _listeners = new Set(); // Tap hop cac setter cua tung component

/** Thong bao cho tat ca component dang dung hook cap nhat lai UI */
const _notify = () => {
  _listeners.forEach((setter) => setter([..._favorites]));
};

// --- Public API ---------------------------------------------------------------

/** Them meme vao danh sach yeu thich (bo qua neu da ton tai) */
export const addFavorite = (meme) => {
  if (!meme || _favorites.some((m) => m.id === meme.id)) return;
  _favorites = [meme, ..._favorites];
  _notify();
};

/** Xoa meme khoi danh sach yeu thich theo id */
export const removeFavorite = (memeId) => {
  _favorites = _favorites.filter((m) => m.id !== memeId);
  _notify();
};

/** Kiem tra mot meme co dang duoc luu hay khong */
export const isFavorite = (memeId) => _favorites.some((m) => m.id === memeId);

// --- Hook --------------------------------------------------------------------

/**
 * Hook de cac component subscribe vao danh sach yeu thich.
 * @returns {{ favorites, addFavorite, removeFavorite, isFavorite }}
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([..._favorites]);

  useEffect(() => {
    _listeners.add(setFavorites);
    // Dong bo ngay lan dau mount
    setFavorites([..._favorites]);
    return () => {
      _listeners.delete(setFavorites);
    };
  }, []);

  const handleAdd = useCallback((meme) => addFavorite(meme), []);
  const handleRemove = useCallback((memeId) => removeFavorite(memeId), []);
  const handleCheck = useCallback((memeId) => isFavorite(memeId), []);

  return {
    favorites,
    addFavorite: handleAdd,
    removeFavorite: handleRemove,
    isFavorite: handleCheck,
  };
};
