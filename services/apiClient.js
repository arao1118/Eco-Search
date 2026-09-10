const request = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let message = 'Request failed.';
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
};

export default request;