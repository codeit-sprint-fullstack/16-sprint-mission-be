export function toProductResponse(product, { summary = false } = {}) {
  const response = { id: product.id, name: product.name, price: product.price, createdAt: product.createdAt };
  if (!summary) {
    response.description = product.description;
    response.tags = product.tags;
  }
  return response;
}

export function toArticleResponse(article) {
  return {
    id: article.id,
    title: article.title,
    content: article.content,
    image: article.image,
    likeCount: article.likeCount,
    createdAt: article.createdAt,
  };
}

export function toCommentResponse(comment) {
  return { id: comment.id, content: comment.content, createdAt: comment.createdAt };
}
