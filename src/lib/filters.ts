import { FOODS } from '../data/mockData'
import type { Food, Restaurant } from '../data/mockData'
import type { RestaurantFilters } from '../components/FilterModal'

export const PRICE_TIER_LIMITS = [30, 60]

const priceTierOf = (price: number) => {
  if (price <= PRICE_TIER_LIMITS[0]) return 1
  if (price <= PRICE_TIER_LIMITS[1]) return 2
  return 3
}

const tierOfPricing = (pricing: string) => pricing.length

const maxMinutesOf = (value: string): number | null => {
  const matches = value.match(/\d+/g)
  if (!matches) return null
  return Math.max(...matches.map(Number))
}

export const hasActiveFilters = (filters: RestaurantFilters | null): boolean => {
  if (!filters) return false
  return (
    filters.offers.length > 0 ||
    !!filters.deliverTime ||
    !!filters.pricing ||
    !!filters.rating
  )
}

const matchesRestaurantCriteria = (restaurant: Restaurant, filters: RestaurantFilters) => {
  if (filters.rating && restaurant.rating < filters.rating) return false

  if (filters.deliverTime) {
    const maxTime = maxMinutesOf(filters.deliverTime)
    const time = maxMinutesOf(restaurant.time)
    if (maxTime !== null && time !== null && time > maxTime) return false
  }

  if (
    filters.offers.length > 0 &&
    !filters.offers.every((offer) => restaurant.offers.includes(offer))
  ) {
    return false
  }

  return true
}

export const matchesRestaurantFilters = (
  restaurant: Restaurant,
  filters: RestaurantFilters | null
): boolean => {
  if (!filters || !hasActiveFilters(filters)) return true

  if (!matchesRestaurantCriteria(restaurant, filters)) return false

  // Preço: o restaurante precisa ter pelo menos um prato na faixa escolhida
  if (filters.pricing) {
    const tier = tierOfPricing(filters.pricing)
    const hasDishInTier = FOODS.some(
      (food) => food.restaurantId === restaurant.id && priceTierOf(food.price) === tier
    )
    if (!hasDishInTier) return false
  }

  return true
}

export const matchesFoodFilters = (
  food: Food,
  restaurant: Restaurant | undefined,
  filters: RestaurantFilters | null,
  options: { includeRestaurantCriteria?: boolean } = {}
): boolean => {
  if (!filters || !hasActiveFilters(filters)) return true
  const { includeRestaurantCriteria = true } = options

  if (filters.pricing && priceTierOf(food.price) !== tierOfPricing(filters.pricing)) {
    return false
  }

  if (includeRestaurantCriteria && restaurant && !matchesRestaurantCriteria(restaurant, filters)) {
    return false
  }

  return true
}