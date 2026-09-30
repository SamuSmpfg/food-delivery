export type Keyword = {
  id: string
  name: string
}

export type Category = {
  id: string
  name: string
}

export type Restaurant = {
  id: string
  name: string
  rating: number
  delivery: string
  time: string
  description: string
}

export type Food = {
  id: string
  name: string
  restaurantId: string
  restaurant: string
  category: string
  price: number
  description: string
}

const LOREM =
  'Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.'

export const KEYWORDS: Keyword[] = [
  { id: '1', name: 'Burger' },
  { id: '2', name: 'Sandwich' },
  { id: '3', name: 'Pizza' },
  { id: '4', name: 'Coffee' },
  { id: '5', name: 'Ice Cream' },
]

export const RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Pansi Restaurant', rating: 4.7, delivery: 'Free', time: '20 min', description: LOREM },
  { id: '2', name: 'American Spicy Burger Shop', rating: 4.3, delivery: 'Free', time: '25 min', description: LOREM },
  { id: '3', name: 'Cafenio Coffee Club', rating: 4.0, delivery: 'Free', time: '30 min', description: LOREM },
  { id: '4', name: 'Uttora Coffe House', rating: 4.5, delivery: 'Free', time: '20 min', description: LOREM },
  { id: '5', name: 'Rose Garden', rating: 4.6, delivery: 'Free', time: '15 min', description: LOREM },
  { id: '6', name: 'Kaji Firm Kitchen', rating: 4.2, delivery: 'Free', time: '35 min', description: LOREM },
  { id: '7', name: 'Kabab Restaurant', rating: 4.4, delivery: 'Free', time: '25 min', description: LOREM },
]

const restaurantName = (restaurantId: string) =>
  RESTAURANTS.find((restaurant) => restaurant.id === restaurantId)?.name ?? ''

const RAW_FOODS: Omit<Food, 'restaurant'>[] = [
  { id: '1', name: 'Burger Bistro', restaurantId: '5', category: 'Burger', price: 40, description: LOREM },
  { id: '2', name: "Smokin' Burger", restaurantId: '3', category: 'Coffee', price: 60, description: LOREM },
  { id: '3', name: 'Buffalo Burgers', restaurantId: '6', category: 'Burger', price: 75, description: LOREM },
  { id: '4', name: 'Bullseye Burgers', restaurantId: '7', category: 'Burger', price: 94, description: LOREM },
  { id: '5', name: 'Smash Burger', restaurantId: '2', category: 'Burger', price: 55, description: LOREM },
  { id: '6', name: 'European Pizza', restaurantId: '4', category: 'Pizza', price: 45, description: LOREM },
  { id: '7', name: 'Buffalo Pizza', restaurantId: '3', category: 'Pizza', price: 52, description: LOREM },
  { id: '8', name: 'Chicken Wrap', restaurantId: '1', category: 'Sandwich', price: 30, description: LOREM },
  { id: '9', name: 'Club Sandwich', restaurantId: '1', category: 'Sandwich', price: 28, description: LOREM },
  { id: '10', name: 'Vanilla Ice Cream', restaurantId: '5', category: 'Ice Cream', price: 18, description: LOREM },
  { id: '11', name: 'Classic Hot Dog', restaurantId: '7', category: 'Hot Dog', price: 22, description: LOREM },
  { id: '12', name: 'Chili Dog', restaurantId: '2', category: 'Hot Dog', price: 26, description: LOREM },
]

export const FOODS: Food[] = RAW_FOODS.map((food) => ({
  ...food,
  restaurant: restaurantName(food.restaurantId),
}))

export const CATEGORIES: Category[] = [
  { id: '1', name: 'All' },
  ...Array.from(new Set(FOODS.map((food) => food.category))).map((name, index) => ({
    id: String(index + 2),
    name,
  })),
]

const FAST_FOOD_IDS = ['6', '7', '5', '8']

export const FAST_FOODS: Food[] = FAST_FOOD_IDS
  .map((id) => FOODS.find((food) => food.id === id))
  .filter((food): food is Food => Boolean(food))

export const chunk = <T,>(array: T[], size: number): T[][] => {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}