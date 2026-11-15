import { apiRequest } from './apiClient';
import localBikesData from '../data/bikes.json';

const bikeImages = import.meta.glob('../assets/images/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
});

function withImage(bike) {
  if (!bike) return bike;

  // Nếu bike.image đã là URL hoặc data URI hoặc path tuyệt đối
  if (typeof bike.image === 'string' && /^(https?:|data:|blob:|\/assets\/|\/src\/)/i.test(bike.image)) {
    return bike;
  }

  const fileName = typeof bike.image === 'string' ? bike.image.split('/').pop() : 'bike01.png';
  const imagePath = `../assets/images/${fileName}`;
  const resolvedImage = bikeImages[imagePath];

  // Fallback an toàn: nếu không tìm thấy file ảnh, dùng ảnh đầu tiên hoặc đường dẫn tương đối, không ném lỗi
  const image = resolvedImage || bikeImages['../assets/images/bike01.png'] || `/src/assets/images/${fileName}`;

  return { ...bike, image };
}

export async function loadBikes() {
  try {
    const result = await apiRequest('/api/bikes');
    if (result && Array.isArray(result.bikes)) {
      return result.bikes.map(withImage);
    }
  } catch (error) {
    console.warn('Không thể kết nối máy chủ API (/api/bikes), chuyển sang dữ liệu nội bộ:', error);
  }

  // Fallback sang dữ liệu tĩnh nếu backend chưa bật
  return localBikesData.map(withImage);
}

export async function getBikeById(id) {
  try {
    const result = await apiRequest(`/api/bikes/${encodeURIComponent(id)}`);
    if (result?.bike) return withImage(result.bike);
  } catch {
    // Fallback sang dữ liệu nội bộ
  }

  const localBike = localBikesData.find((b) => b.id === id);
  return localBike ? withImage(localBike) : null;
}

export async function getBikeCategories() {
  const bikes = await loadBikes();
  return [...new Set(bikes.map((bike) => bike.category))];
}

export async function getBikesByCategory(category) {
  const bikes = await loadBikes();
  return bikes.filter((bike) => bike.category === category);
}

export async function getBikesGroupedByCategory() {
  return (await loadBikes()).reduce((groups, bike) => {
    if (!groups[bike.category]) groups[bike.category] = [];
    groups[bike.category].push(bike);
    return groups;
  }, {});
}
