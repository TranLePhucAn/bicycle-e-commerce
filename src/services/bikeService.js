import bikes from '../data/bikes.json'

const bikeImages = import.meta.glob('../assets/images/*.png', {
  eager: true,
  import: 'default',
  query: '?url',
})

function withImage(bike) {
  const imagePath = `../assets/images/${bike.image}`
  const image = bikeImages[imagePath]

  if (!image) {
    throw new Error(`Bike image not found: ${imagePath}`)
  }

  return { ...bike, image }
}

export function loadBikes() {
  return bikes.map(withImage)
}

export function getBikeById(id) {
  const bike = bikes.find((item) => item.id === id)
  return bike ? withImage(bike) : null
}

export function getBikeCategories() {
  return [...new Set(bikes.map((bike) => bike.category))]
}

export function getBikesByCategory(category) {
  return bikes
    .filter((bike) => bike.category === category)
    .map(withImage)
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