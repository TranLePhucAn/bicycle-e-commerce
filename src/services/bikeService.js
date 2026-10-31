import bikes from '../data/bikes.json'

const bikeImages = import.meta.glob('../assets/images/*', {
  eager: true,
  import: 'default',
  query: '?url',
})

function getBikeWithImage(bike) {
  const imagePath = `../assets/images/${bike.image}`
  const image = bikeImages[imagePath]

  if (!image) {
    throw new Error(`Không tìm thấy ảnh của xe: src/assets/images/${bike.image}`)
  }

  return { ...bike, image }
}

export function loadBikes() {
  return bikes.map(getBikeWithImage)
}

export function getBikeById(id) {
  const bike = bikes.find((bike) => bike.id === id)
  return bike ? getBikeWithImage(bike) : null
}

export function getBikeCategories() {
  return [...new Set(bikes.map((bike) => bike.category))]
}

export function getBikesByCategory(category) {
  return bikes
    .filter((bike) => bike.category === category)
    .map(getBikeWithImage)
}

export function getBikesGroupedByCategory() {
  return loadBikes().reduce((groups, bike) => {
    if (!groups[bike.category]) {
      groups[bike.category] = []
    }

    groups[bike.category].push(bike)
    return groups
  }, {})
}
