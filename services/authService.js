import request from './apiClient';

export const registerUser = async (name, email, password) => {
  const { user } = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });
  return user;
};

export const loginUser = async (email, password) => {
  const { user } = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return user;
};

export const logoutUser = async () => {
  await request('/auth/logout', { method: 'POST' });
};

export const subscribeToAuthChanges = (callback) => {
  request('/auth/me')
    .then(({ user }) => callback(user))
    .catch(() => callback(null));
  return () => {};
};