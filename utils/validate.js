export const validate = ({ name, description, price, tags, createdAt, updatedAt }) => {
  if (!name || !description) return false;
  if (name.trim().length < 1 || name.length > 10) return false;
  if (description.trim().length < 10 || description.length > 100) return false;
  if (typeof price !== 'number' || price < 0) return false;
  if (!Array.isArray(tags) || !tags.every(tag => tag.length <= 5)) return false;
  if (createdAt || updatedAt) return false;
  return true;
}