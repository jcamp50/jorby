const MIN_HALF_STARS = 1
const MAX_HALF_STARS = 10

export function displayStarsFromHalfStars(halfStars: number): number {
  return halfStars / 2
}

export function isValidRatingHalfStars(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_HALF_STARS && value <= MAX_HALF_STARS
}

export function ratingTextEquivalent(halfStars: number): string {
  return `${displayStarsFromHalfStars(halfStars)} out of 5 stars`
}
