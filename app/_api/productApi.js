const BASE_URL = '/api';

export const getProducts = async ({
  offset = 0,
  limit = 10,
  keyword = '',
  signal,
}) => {
  const query = new URLSearchParams({
    offset,
    limit,
    keyword,
  });

  const response = await fetch(
    `${BASE_URL}/products?${query.toString()}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error('상품 목록을 불러오는데 실패했습니다.');
  }

  return response.json();
};

export const createProduct = async (productData) => {
  const response = await fetch(
    `${BASE_URL}/products`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    }
  );

  if (!response.ok) {
    throw new Error('상품 등록에 실패했습니다.');
  }

  return response.json();
};

export const getProduct = async (productId, { signal } = {}) => {
  const response = await fetch(
    `${BASE_URL}/products/${productId}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error('상품 정보를 불러오는데 실패했습니다.');
  }

  return response.json();
};
