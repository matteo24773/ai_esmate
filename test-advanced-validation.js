/**
 * Advanced Math Validation Test
 * 
 * This script tests the validation logic on more advanced math topics like
 * derivatives, integrals, and other calculus concepts.
 */

const { 
  normalizeExpression, 
  areExpressionsEquivalent 
} = require('./src/enhanced-validation');

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
  
  if (!passed) {
    console.log(`Normalized expressions: "${normalizeExpression(expr1)}" vs "${normalizeExpression(expr2)}"`);
  }
  
  return passed;
}

// Group tests by advanced math category
const testGroups = {
  // Derivative notation tests
  derivativeNotation: [
    () => testEquivalence("y' = 2x", "dy/dx = 2x", true),
    () => testEquivalence("f'(x) = 2x + 1", "df/dx = 2x + 1", true),
    () => testEquivalence("d/dx(x^2) = 2x", "y' = 2x where y = x^2", true),
    () => testEquivalence("D_x[x^2 + 3x] = 2x + 3", "d/dx(x^2 + 3x) = 2x + 3", true),
  ],
  
  // Derivative rules
  derivativeRules: [
    () => testEquivalence("d/dx(x^3) = 3x^2", "f'(x) = 3x^2 where f(x) = x^3", true),
    () => testEquivalence("d/dx(sin(x)) = cos(x)", "d/dx sin x = cos x", true),
    () => testEquivalence("d/dx(e^x) = e^x", "d/dx exp(x) = exp(x)", true),
    () => testEquivalence("d/dx(ln(x)) = 1/x", "d/dx ln x = 1/x", true),
    () => testEquivalence("d/dx(u·v) = u·dv/dx + v·du/dx", "d/dx(uv) = u(dv/dx) + v(du/dx)", true),
  ],
  
  // Integral notation tests
  integralNotation: [
    () => testEquivalence("∫ 2x dx = x^2 + C", "int 2x dx = x^2 + C", true),
    () => testEquivalence("∫ 2x dx = x^2 + C", "integral of 2x with respect to x = x^2 + C", true),
    () => testEquivalence("∫_0^1 x^2 dx = 1/3", "int_0^1 x^2 dx = 1/3", true),
    () => testEquivalence("∫ f(x) dx = F(x) + C", "int f(x) dx = F(x) + C", true),
  ],
  
  // Integral rules
  integralRules: [
    () => testEquivalence("∫ x^n dx = x^(n+1)/(n+1) + C", "int x^n dx = x^(n+1)/(n+1) + C", true),
    () => testEquivalence("∫ sin(x) dx = -cos(x) + C", "int sin x dx = -cos x + C", true),
    () => testEquivalence("∫ e^x dx = e^x + C", "int exp(x) dx = exp(x) + C", true),
    () => testEquivalence("∫ 1/x dx = ln|x| + C", "int 1/x dx = ln|x| + C", true),
    () => testEquivalence("∫ u dv = uv - ∫ v du", "int u dv = uv - int v du", true),
  ],
  
  // Limits
  limits: [
    () => testEquivalence("lim_(x->0) sin(x)/x = 1", "lim x->0 sin(x)/x = 1", true),
    () => testEquivalence("lim_(x->∞) (1 + 1/x)^x = e", "lim x->inf (1 + 1/x)^x = e", true),
    () => testEquivalence("lim_(h->0) (f(x+h) - f(x))/h = f'(x)", "lim h->0 (f(x+h) - f(x))/h = f'(x)", true),
  ],
  
  // Trigonometric identities
  trigIdentities: [
    () => testEquivalence("sin^2(x) + cos^2(x) = 1", "sin^2 x + cos^2 x = 1", true),
    () => testEquivalence("sin(2x) = 2sin(x)cos(x)", "sin 2x = 2 sin x cos x", true),
    () => testEquivalence("cos(2x) = cos^2(x) - sin^2(x)", "cos 2x = cos^2 x - sin^2 x", true),
    () => testEquivalence("tan(x) = sin(x)/cos(x)", "tan x = sin x / cos x", true),
  ],
  
  // Algebraic manipulations in calculus
  algebraicCalculus: [
    () => testEquivalence("∫ (f(x) + g(x)) dx = ∫ f(x) dx + ∫ g(x) dx", 
                         "int (f(x) + g(x)) dx = int f(x) dx + int g(x) dx", true),
    () => testEquivalence("d/dx(f(x) + g(x)) = f'(x) + g'(x)", 
                         "d/dx(f(x) + g(x)) = d/dx f(x) + d/dx g(x)", true),
    () => testEquivalence("d/dx(f(g(x))) = f'(g(x)) · g'(x)", 
                         "d/dx(f ∘ g)(x) = f'(g(x)) · g'(x)", true),
  ]
};

// Run all tests
function runAllTests() {
  console.log('======== ADVANCED MATH VALIDATION TESTS ========');
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const [groupName, tests] of Object.entries(testGroups)) {
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
const allTestsPassed = runAllTests();
console.log(`\nOverall test result: ${allTestsPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);

// Exit with appropriate code for CI/CD integration
process.exit(allTestsPassed ? 0 : 1);
