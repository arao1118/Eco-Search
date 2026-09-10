import request from './apiClient';

export const fetchUserCart = async (_userId) => {
  const { items } = await request('/cart');
  return items;
};

export const syncCartToStorage = async (_userId, items) => {
  await request('/cart', { method: 'PUT', body: JSON.stringify({ items }) });
};

export const addItemToCloudCart = async (userId, product, currentItems) => {
  const newCart = [...currentItems];
  const existing = newCart.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else newCart.push({ ...product, quantity: 1 });
  await syncCartToStorage(userId, newCart);
  return newCart;
};

export const updateItemQuantityInCloud = async (userId, productId, delta, currentItems) => {
  const newCart = currentItems.map((item) => (
    item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
  ));
  await syncCartToStorage(userId, newCart);
  return newCart;
};

export const removeItemFromCloudCart = async (userId, productId, currentItems) => {
  const newCart = currentItems.filter((item) => item.id !== productId);
  await syncCartToStorage(userId, newCart);
  return newCart;
};