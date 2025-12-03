package tu

import (
	"math"
	"testing"
)

func EqualFloat(a, b float64) bool {
	return math.Abs(b-a) < 0.000001
}

func ExpectEqual[V comparable](t *testing.T, value, ref V, msg string) {
	t.Helper()
	if value != ref {
		t.Error(msg, "got", value, "expected", ref)
	}
}
func ExpectDiff[V comparable](t *testing.T, value, ref V, msg string) {
	t.Helper()
	if value == ref {
		t.Error(msg, "got", value, "expected not", ref)
	}
}
func ExpectEqualF(t *testing.T, value, ref float64, msg string) {
	t.Helper()
	if !EqualFloat(value, ref) {
		t.Error(msg, "got", value, "expected", ref)
	}
}
func ExpectDiffF(t *testing.T, value, ref float64, msg string) {
	t.Helper()
	if EqualFloat(value, ref) {
		t.Error(msg, "got", value, "expected not", ref)
	}
}
