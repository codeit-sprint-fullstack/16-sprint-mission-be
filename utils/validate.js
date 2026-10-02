export const validateQuery = ({
    page = 1,
    pageSize = 10,
    orderBy = 'recent',
    keyword = ''
  }) => {
  // page, pageSize 검증
  page = Number(page);
  pageSize = Number(pageSize);

  const isWholeNumber = (num) => {
    if (!Number.isInteger(num) || num < 0) return false;
    return true;
  };
  
  if (isWholeNumber(page)) page = 1;
  if (isWholeNumber(pageSize)) pageSize = 10;
  if (pageSize > 100) pageSize = 100;
  
  // orderBy recent로 고정
  orderBy = 'recent';
  
  // keyword 앞뒤 공백제거 + 특수문자 이스케이프
  keyword = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  return {
    page,
    pageSize,
    orderBy,
    keyword
  }
};