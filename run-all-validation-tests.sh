#!/bin/bash
# run-all-validation-tests.sh
# A script to run all validation tests for the math tutoring application

echo "===== RUNNING ALL VALIDATION TESTS ====="
echo ""

# Function to run a test and report results
run_test() {
  TEST_NAME=$1
  TEST_CMD=$2
  
  echo "🧪 Running $TEST_NAME..."
  echo "$ $TEST_CMD"
  echo "---------------------------------"
  eval $TEST_CMD
  
  if [ $? -eq 0 ]; then
    echo "✅ $TEST_NAME PASSED"
  else
    echo "❌ $TEST_NAME FAILED"
    FAILED_TESTS="$FAILED_TESTS\n- $TEST_NAME"
  fi
  echo ""
}

# Initialize failed tests variable
FAILED_TESTS=""

# Run Enhanced Validation Tests
run_test "Enhanced Validation" "node test-enhanced-validation.js"

# Run Validation Consistency Tests
run_test "Validation Consistency" "node test-validation-consistency.js"

# Run Advanced Validation Tests
run_test "Advanced Math Validation" "node test-advanced-validation.js"

# Run Comprehensive Debug Validation
run_test "Debug Validation (All Tests)" "node debug-validation.js --all"

# Run Simple Debug Tests
run_test "Simple Debug Tests" "node test-simple-debug.js"

# Check for failed tests
if [ -z "$FAILED_TESTS" ]; then
  echo "🎉 ALL VALIDATION TESTS PASSED! 🎉"
else
  echo "❌ SOME VALIDATION TESTS FAILED:"
  echo -e "$FAILED_TESTS"
  echo ""
  echo "Please check the output above for more details."
  exit 1
fi

exit 0
