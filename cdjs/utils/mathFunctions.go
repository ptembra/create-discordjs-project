package utils

import "math"

// @param {int} Value To Clamp
// @param {int} Upper Boundary
// @param {int} Lower Boundary
func ClampInt(value int, min int, max int) int {
	valueFloat := float64(value)
	minFloat := float64(min)
	maxFloat := float64(max)
	clampedValue := math.Round(math.Min(math.Max(valueFloat, minFloat), maxFloat))
	return int(clampedValue)
}
