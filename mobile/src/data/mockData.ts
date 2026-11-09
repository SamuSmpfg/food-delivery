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
  offers: string[]
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

export type ChefOrder = {
  id: string
  name: string
  category: string
  price: number
  rating: number
  numberOfRating: string
  deliveryMode: string
}

export type RunningOrder = {
  orderId: string
  class: string
  title: string
  price: number
}

export type IngredientCategory = 'Basic' | 'Fruit'

export type Ingredient = {
  id: string
  name: string
  category: IngredientCategory
}

export type DataType = {
  label: string;
  value: number;
};

export type Notification = {
  id: string,
  name: string,
  notificationCategory: string,
  time: string
}

export type Messages = {
  id: string,
  name: string,
  lastMessage: string,
  status: boolean,
  time: string,
  notificationsNumber: number | false
}

export type Reviews = {
  id: string,
  date: string,
  title: string,
  rating: number,
  comment: string
}

export const data: DataType[] = [
  {label: '10AM', value: 1000},
  {label: '11AM', value: 1200},
  {label: '12PM', value: 900},
  {label: '01PM', value: 1500},
  {label: '02PM', value: 1200},
  {label: '03PM', value: 1400},
  {label: '04PM', value: 1300},
];


const LOREM =
  'Maecenas sed diam eget risus varius blandit sit amet non magna. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.'

export const KEYWORDS: Keyword[] = [
  { id: '1', name: 'Burger' },
  { id: '2', name: 'Sandwich' },
  { id: '3', name: 'Pizza' },
  { id: '4', name: 'Coffee' },
  { id: '5', name: 'Ice Cream' },
]

export const INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Salt', category: 'Basic' },
  { id: '2', name: 'Chicken', category: 'Basic' },
  { id: '3', name: 'Onion', category: 'Basic' },
  { id: '4', name: 'Garlic', category: 'Basic' },
  { id: '5', name: 'Peppers', category: 'Basic' },
  { id: '6', name: 'Ginger', category: 'Basic' },
  { id: '7', name: 'Avocado', category: 'Fruit' },
  { id: '8', name: 'Apple', category: 'Fruit' },
  { id: '9', name: 'Blueberry', category: 'Fruit' },
  { id: '10', name: 'Broccoli', category: 'Fruit' },
  { id: '11', name: 'Orange', category: 'Fruit' },
  { id: '12', name: 'Walnut', category: 'Fruit' },
]

export const NOTIFICATIONS: Notification[] = [
  {id: '1', name: 'Tanbir Ahamed', notificationCategory: 'Placed a new Order', time: '20 min ago'},
  {id: '2', name: 'Salim Smith', notificationCategory: 'Left a 5 star review', time: '20 min ago'},
  {id: '3', name: 'Royal Bengol', notificationCategory: 'Agreed to cancel', time: '20 min ago'},
  {id: '4', name: 'Pabel Vuiya', notificationCategory: 'Placed a new Order', time: '20 min ago'},
]

export const MESSAGES: Messages[] = [
  {id: '1', name: 'Royal Parvej', lastMessage: 'Sounds Awesome!', status: true, time: '19:37', notificationsNumber: 1},
  {id: '2', name: 'Cameron Williamson', lastMessage: 'Ok, just hurry up a little bit...😊', status: true, time: '19:37', notificationsNumber: 2},
  {id: '3', name: 'Ralph Edwards', lastMessage: 'Thanks dude.', status: true, time: '19:37', notificationsNumber: false},
  {id: '4', name: 'Cody Fisher', lastMessage: 'How is it going...?', status: true, time: '19:37', notificationsNumber: false},
  {id: '5', name: 'Eleanor Pena', lastMessage: 'Thanks for the awesome food man...!', status: false, time: '19:37', notificationsNumber: false},
]
 
export const REVIEWS: Reviews[] = [
  {id: '1', date: '20/12/2020', title: 'Great Food and Service', rating: 5, comment: 'This Food so tasty & delicious. Breakfast so fast Delivered in my place. Chef is very friendly. I’m really like chef for Home Food Order. Thanks.'},

  {id: '2', date: '20/12/2020', title: 'Awesome and Nice', rating: 4, comment: 'This Food so tasty & delicious. Breakfast so fast Delivered in my place.'},

    {id: '3', date: '20/12/2020', title: 'Awesome and Nice', rating: 3, comment: 'This Food so tasty & delicious.'},

    {id: '4', date: '20/12/2020', title: 'Awesome and Nice', rating: 2, comment: 'This Food so tasty & delicious. Breakfast so fast Delivered in my place.'},

    {id: '5', date: '20/12/2020', title: 'Awesome and Nice', rating: 1, comment: 'This Food so tasty & delicious. Breakfast so fast Delivered in my place.'},

    {id: '6', date: '20/12/2020', title: 'Awesome and Nice', rating: 0, comment: 'This Food so tasty & delicious. Breakfast so fast Delivered in my place.'},
]

export const RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'Pansi Restaurant', rating: 4.7, delivery: 'Free', time: '20 min', description: LOREM, offers: ['Delivery', 'Pick Up', 'Online payment available'] },
  { id: '2', name: 'American Spicy Burger Shop', rating: 4.3, delivery: 'Free', time: '25 min', description: LOREM, offers: ['Delivery', 'Offer', 'Online payment available'] },
  { id: '3', name: 'Cafenio Coffee Club', rating: 4.0, delivery: 'Free', time: '30 min', description: LOREM, offers: ['Pick Up', 'Offer'] },
  { id: '4', name: 'Uttora Coffee House', rating: 4.5, delivery: 'Free', time: '20 min', description: LOREM, offers: ['Delivery', 'Pick Up', 'Offer', 'Online payment available'] },
  { id: '5', name: 'Rose Garden', rating: 4.6, delivery: 'Free', time: '15 min', description: LOREM, offers: ['Delivery', 'Online payment available'] },
  { id: '6', name: 'Kaji Firm Kitchen', rating: 4.2, delivery: 'Free', time: '35 min', description: LOREM, offers: ['Delivery', 'Pick Up'] },
  { id: '7', name: 'Kabab Restaurant', rating: 4.4, delivery: 'Free', time: '25 min', description: LOREM, offers: ['Delivery', 'Pick Up', 'Offer'] },
]

const restaurantName = (restaurantId: string) =>
  RESTAURANTS.find((restaurant) => restaurant.id === restaurantId)?.name ?? ''

const RAW_FOODS: Omit<Food, 'restaurant'>[] = [
  { id: '1', name: 'Burger Bistro', restaurantId: '5', category: 'Burger', price: 40, description: LOREM },
  { id: '2', name: "Smokin' Burger", restaurantId: '3', category: 'Burger', price: 60, description: LOREM },
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

export const CHEF_ORDERS: ChefOrder[] = [
  { id: '1', name: 'Burger Bistro', category: 'Breakfast', price: 40, rating: 3.9, numberOfRating: '(08 Reviews)', deliveryMode: 'Pick Up' },
  { id: '2', name: "Smokin' Burger", category: 'Lunch', price: 60, rating: 4.5, numberOfRating: '(10 Reviews)', deliveryMode: 'Drop Off' },
  { id: '3', name: 'Buffalo Burgers', category: 'Dinner', price: 75, rating: 2.5, numberOfRating: '(15 Reviews)', deliveryMode: 'Pick Up' },
  { id: '4', name: 'Bullseye Burgers', category: 'Lunch', price: 94, rating: 4.9, numberOfRating: '(13 Reviews)', deliveryMode: 'Drop Off' },
]

export const RUNNING: RunningOrder[] = Array.from({ length: 20 }, (_, index) => {
  const base = CHEF_ORDERS[index % CHEF_ORDERS.length]
  return {
    orderId: String(240000 + index),
    class: base.category.toUpperCase(),
    title: base.name,
    price: base.price,
  }
})

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