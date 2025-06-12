/**
 * Debug Validation Script
 * 
 * This script tests the enhanced validation logic against various types of mathematical expressions
 * to ensure that the validation system correctly handles different notations and equivalences.
 * 
 * Usage:
 * node debug-validation.js [options]
 * 
 * Options:
 *  --all           Run all tests (default)
 *  --basic         Run only basic arithmetic tests
 *  --notation      Run only notation variation tests
 *  --fractions     Run only fraction tests
 *  --whitespace    Run only whitespace formatting tests
 *  --variables     Run only variable and coefficient tests
 *  --multiple      Run only multiple variable tests
 *  --complex       Run only complex expression tests
 *  --evaluation    Run only evaluation tests
 *  --verbose       Show detailed output for all tests
 */

const { 
  normalizeExpression, 
  areExpressionsEquivalent, 
  evaluateSimpleExpression 
} = require('./src/enhanced-validation');

// Process command line arguments
const args = process.argv.slice(2);
const options = {
  all: args.length === 0 || args.includes('--all'),
  basic: args.includes('--basic'),
  notation: args.includes('--notation'),
  fractions: args.includes('--fractions'),
  whitespace: args.includes('--whitespace'),
  variables: args.includes('--variables'),
  multiple: args.includes('--multiple'),
  complex: args.includes('--complex'),
  evaluation: args.includes('--evaluation'),
  verbose: args.includes('--verbose')
};

// If any specific test is requested, disable 'all'
if (options.basic || options.notation || options.fractions || options.whitespace || 
    options.variables || options.multiple || options.complex || options.evaluation) {
  options.all = false;
}

/**
 * Tests a pair of expressions for equivalence
 * @param {string} expr1 - First expression
 * @param {string} expr2 - Second expression
 * @param {boolean} expectedResult - Expected result of the equivalence check
 * @returns {boolean} - Whether the test passed
 */
function testEquivalence(expr1, expr2, expectedResult) {
  const result = areExpressionsEquivalent(expr1, expr2);
  const passed = result === expectedResult;
  
  console.log(`Testing: "${expr1}" ≡ "${expr2}"`);
  console.log(`Expected: ${expectedResult}, Got: ${result}, ${passed ? '✓ PASSED' : '✗ FAILED'}`);
  
  if (!passed || options.verbose) {
    console.log(`Normalized expressions: "${normalizeExpression(expr1)}" vs "${normalizeExpression(expr2)}"`);
    try {
      console.log(`Evaluated values: ${evaluateSimpleExpression(expr1)} vs ${evaluateSimpleExpression(expr2)}`);
    } catch (error) {
      console.log(`Evaluation error: ${error.message}`);
    }
  }
  
  return passed;
}

/**
 * Tests an expression evaluation
 * @param {string} expr - Expression to evaluate
 * @param {number} expectedValue - Expected numerical result
 * @returns {boolean} - Whether the test passed
 */
function testEvaluation(expr, expectedValue) {
  try {
    const result = evaluateSimpleExpression(expr);
    const passed = Math.abs(result - expectedValue) < 0.0001; // Allow for small floating point differences
    
    console.log(`Evaluating: "${expr}"`);
    console.log(`Expected: ${expectedValue}, Got: ${result}, ${passed ? '✓ PASSED' : '✗ FAILED'}`);
    
    if (!passed || options.verbose) {
      console.log(`Normalized expression: "${normalizeExpression(expr)}"`);
    }
    
    return passed;
  } catch (error) {
    console.log(`Evaluating: "${expr}"`);
    console.log(`Error: ${error.message}, ✗ FAILED`);
    return false;
  }
}

// Group tests by category
const testGroups = {
  // Basic arithmetic expressions
  basicArithmetic: [
    () => testEquivalence("x = 10 + 5", "x = 15", true),
    () => testEquivalence("x = 20 - 12", "x = 8", true),
    () => testEquivalence("x = 4 * 5", "x = 20", true),
    () => testEquivalence("x = 15 / 3", "x = 5", true),
    () => testEquivalence("x = 2^3", "x = 8", true),
    () => testEquivalence("x = 3 + 4 * 2", "x = 11", true),
    () => testEquivalence("x = (3 + 4) * 2", "x = 14", true),
    () => testEquivalence("x = 10 + 5", "x = 16", false),
  ],
  
  // Notation variations
  notationVariations: [
    () => testEquivalence("x = 2 * 3", "x = 2·3", true),
    () => testEquivalence("x = 2 * 3", "x = 2(3)", true),
    () => testEquivalence("x = 2 * 3", "x = 2×3", true),
    () => testEquivalence("x = 2*y", "x = 2y", true),
    () => testEquivalence("x = 2(3 + 4)", "x = 2 * 7", true),
    () => testEquivalence("x = 2(y + z)", "x = 2y + 2z", true),
    () => testEquivalence("x = a * b * c", "x = abc", true),
  ],
  
  // Fractions
  fractions: [
    () => testEquivalence("x = 1/2", "x = 0.5", true),
    () => testEquivalence("x = 2/4", "x = 1/2", true),
    () => testEquivalence("x = 0.25", "x = 1/4", true),
    () => testEquivalence("x = 2 + 1/2", "x = 2.5", true),
    () => testEquivalence("x = (1 + 1) / 2", "x = 1", true),
    () => testEquivalence("x = (a + b) / c", "x = a/c + b/c", true),
  ],
  
  // Whitespace and formatting
  whitespaceAndFormatting: [
    () => testEquivalence("x=10+5", "x = 15", true),
    () => testEquivalence("x  =  20  -  12", "x = 8", true),
    () => testEquivalence("x=4*5", "x=20", true),
    () => testEquivalence("x = 10 + 5", " x=15 ", true),
  ],
  
  // Variables and coefficients
  variablesAndCoefficients: [
    () => testEquivalence("y = 2x", "y = 2 * x", true),
    () => testEquivalence("y = 2x + 3", "y = 2 * x + 3", true),
    () => testEquivalence("y = x^2", "y = x * x", true),
    () => testEquivalence("y = 2(x + 1)", "y = 2x + 2", true),
    () => testEquivalence("y = 2x + 3x", "y = 5x", true),
    () => testEquivalence("y = 2x + 3x", "y = 5 * x", true),
  ],
  
  // Equations with multiple variables
  multipleVariables: [
    () => testEquivalence("z = x + y", "z = y + x", true),
    () => testEquivalence("z = 2x + 3y", "z = 3y + 2x", true),
    () => testEquivalence("z = x * y", "z = y * x", true),
    () => testEquivalence("z = (x + y) * 2", "z = 2x + 2y", true),
    () => testEquivalence("z = x^2 + 2xy + y^2", "z = (x + y)^2", true),
  ],
  
  // Complex expressions
  complexExpressions: [
    () => testEquivalence("w = (x + y) * (x - y)", "w = x^2 - y^2", true),
    () => testEquivalence("w = (x + 2) * (x - 3)", "w = x^2 - x - 6", true),
    () => testEquivalence("w = 2(x + 3)^2", "w = 2x^2 + 12x + 18", true),
    () => testEquivalence("w = (x + 1)^2 - (x - 1)^2", "w = 4x", true),
  ],
  
  // Evaluation tests
  evaluation: [
    () => testEvaluation("10 + 5", 15),
    () => testEvaluation("20 - 12", 8),
    () => testEvaluation("4 * 5", 20),
    () => testEvaluation("15 / 3", 5),
    () => testEvaluation("2^3", 8),
    () => testEvaluation("3 + 4 * 2", 11),
    () => testEvaluation("(3 + 4) * 2", 14),
    () => testEvaluation("2.5 + 3.5", 6),
    () => testEvaluation("10 / 4", 2.5),
    () => testEvaluation("2 * (3 + 4)", 14),
  ]
};

// Determine which test groups to run
const groupsToRun = {};
if (options.all) {
  Object.assign(groupsToRun, testGroups);
} else {
  if (options.basic) groupsToRun.basicArithmetic = testGroups.basicArithmetic;
  if (options.notation) groupsToRun.notationVariations = testGroups.notationVariations;
  if (options.fractions) groupsToRun.fractions = testGroups.fractions;
  if (options.whitespace) groupsToRun.whitespaceAndFormatting = testGroups.whitespaceAndFormatting;
  if (options.variables) groupsToRun.variablesAndCoefficients = testGroups.variablesAndCoefficients;
  if (options.multiple) groupsToRun.multipleVariables = testGroups.multipleVariables;
  if (options.complex) groupsToRun.complexExpressions = testGroups.complexExpressions;
  if (options.evaluation) groupsToRun.evaluation = testGroups.evaluation;
}

// Run selected tests
function runTests() {
  console.log('======== VALIDATION DEBUG TESTS ========');
  console.log('Options:', options);
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const [groupName, tests] of Object.entries(groupsToRun)) {
    console.log(`\n=== ${groupName} ===`);
    let groupPassed = 0;
    
    for (const test of tests) {
      if (test()) {
        groupPassed++;
      }
      totalTests++;
    }
    
    passedTests += groupPassed;
    console.log(`${groupName}: ${groupPassed}/${tests.length} tests passed`);
  }
  
  console.log('\n======== TEST SUMMARY ========');
  console.log(`Total: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
  
  return passedTests === totalTests;
}

// Run the tests
const allTestsPassed = runTests();
console.log(`\nOverall test result: ${allTestsPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);

// Exit with appropriate code for CI/CD integration
process.exit(allTestsPassed ? 0 : 1);