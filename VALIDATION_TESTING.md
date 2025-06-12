# Math Validation Testing Infrastructure

This directory contains a suite of testing tools for the math validation system in the tutoring application. These tools help ensure that the validation logic correctly handles various mathematical notations and equivalences.

## Test Files

| File | Description |
|------|-------------|
| `test-enhanced-validation.js` | Core tests for the enhanced validation system |
| `test-advanced-validation.js` | Tests for advanced math topics (derivatives, integrals, etc.) |
| `test-validation-consistency.js` | Tests to ensure frontend and backend validation stay in sync |
| `debug-validation.js` | Comprehensive debug validation with configurable options |
| `test-simple-debug.js` | Simple tests for quick debugging |
| `run-all-validation-tests.sh` | Shell script to run all validation tests together |

## Running Tests

### All Tests

To run all validation tests at once:

```bash
./run-all-validation-tests.sh
```

### Individual Tests

Run any individual test file with Node.js:

```bash
node test-enhanced-validation.js
node test-advanced-validation.js
node test-validation-consistency.js
```

### Debug Validation

The debug validation script (`debug-validation.js`) has several command-line options:

```bash
# Run all tests
node debug-validation.js --all

# Run specific test categories
node debug-validation.js --basic      # Basic arithmetic tests
node debug-validation.js --notation   # Notation variation tests
node debug-validation.js --fractions  # Fraction tests
node debug-validation.js --whitespace # Whitespace formatting tests
node debug-validation.js --variables  # Variable and coefficient tests
node debug-validation.js --multiple   # Multiple variable tests
node debug-validation.js --complex    # Complex expression tests
node debug-validation.js --evaluation # Evaluation tests

# Show detailed output for all tests
node debug-validation.js --verbose
```

You can also combine options:

```bash
node debug-validation.js --basic --fractions --verbose
```

## Test Categories

### Basic Arithmetic Tests
- Simple addition, subtraction, multiplication, division
- Order of operations and parentheses
- Exponents

### Notation Variations
- Different multiplication notations (*, ·, ×)
- Implied multiplication
- Distribution of terms

### Fractions
- Decimal equivalence
- Fraction simplification
- Mixed fractions

### Whitespace and Formatting
- Different spacing styles
- Equal sign spacing
- Consistent normalization

### Variables and Coefficients
- Variable multiplication
- Coefficients
- Powers and exponents

### Multiple Variables
- Expressions with multiple variables
- Commutative property
- Distribution across variables

### Complex Expressions
- Factoring
- Expanding expressions
- Quadratic expressions

### Advanced Math
- Derivatives
- Integrals
- Trigonometric identities
- Limits
- Algebraic manipulation in calculus

## Adding New Tests

To add new test cases:
1. Identify the appropriate test file for your test case
2. Add your test to the corresponding test group
3. Ensure the expected behavior is correctly specified
4. Run the tests to verify your additions

## Debugging Failed Tests

When tests fail, the scripts provide detailed output to help diagnose the issue:
- The expressions being compared
- The normalized versions of the expressions
- The evaluated numerical values (where applicable)
- The expected vs. actual results

For more verbose output, use the `--verbose` flag with `debug-validation.js`.
