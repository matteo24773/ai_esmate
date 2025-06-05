// Test per verificare la logica dei passaggi matematici
// Test case: 3x³ = 24

// Simula la funzione normalizeExpression dal backend
function normalizeExpression(expr) {
  return expr
    .replace(/\s+/g, '') // Remove all spaces
    .toLowerCase()
    // Convert superscript notation to caret notation for equivalency
    .replace(/¹/g, '^1')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/⁵/g, '^5')
    .replace(/⁶/g, '^6')
    .replace(/⁷/g, '^7')
    .replace(/⁸/g, '^8')
    .replace(/⁹/g, '^9')
    .replace(/⁰/g, '^0')
    .replace(/\*/g, '') // Remove multiplication signs
    .replace(/\(1\)/g, '1') // Replace (1) with 1
    .replace(/1\*/g, '') // Remove 1* multiplications
    .replace(/\*1/g, '') // Remove *1 multiplications
    .replace(/\+-/g, '-') // Replace +- with -
    .replace(/-\+/g, '-'); // Replace -+ with -
}

// Test problem data come definito in math-question.html
const problemData = {
  equation: '3x³ = 24',
  steps: ['x³ = 8', 'x = ∛8', 'x = 2'],
  solution: 'x = 2'
};

console.log('=== TEST STEP LOGIC ===');
console.log('Problem:', problemData.equation);
console.log('Expected steps:', problemData.steps);
console.log('');

// Test normalization
console.log('=== NORMALIZATION TESTS ===');
console.log('3x³ = 24 normalized:', normalizeExpression('3x³ = 24'));
console.log('3x^3 = 24 normalized:', normalizeExpression('3x^3 = 24'));
console.log('x³ = 8 normalized:', normalizeExpression('x³ = 8'));
console.log('x^3 = 8 normalized:', normalizeExpression('x^3 = 8'));
console.log('');

// Test step validation simulation
function testStepValidation(userStep, currentStepIndex) {
  console.log(`Testing: "${userStep}" at step ${currentStepIndex}`);
  
  const normalizedUserStep = normalizeExpression(userStep);
  
  // Check if user step matches any of the remaining correct steps
  for (let i = currentStepIndex; i < problemData.steps.length; i++) {
    const normalizedCorrectStep = normalizeExpression(problemData.steps[i]);
    
    if (normalizedUserStep === normalizedCorrectStep) {
      console.log(`✅ Match found at step ${i}: ${problemData.steps[i]}`);
      return { isValid: true, nextStepIndex: i + 1 };
    }
  }
  
  // Check if user step matches the original equation (should be allowed)
  const normalizedProblem = normalizeExpression(problemData.equation);
  if (normalizedUserStep === normalizedProblem) {
    console.log(`✅ Match found with original equation: ${problemData.equation}`);
    return { isValid: true, nextStepIndex: currentStepIndex }; // Stay at same step
  }
  
  console.log(`❌ No match found`);
  return { isValid: false, nextStepIndex: currentStepIndex };
}

// Test scenarios
console.log('=== STEP VALIDATION TESTS ===');
console.log('Scenario 1: User enters original equation first');
testStepValidation('3x³ = 24', 0);
console.log('');

console.log('Scenario 2: User enters original equation with caret notation');
testStepValidation('3x^3 = 24', 0);
console.log('');

console.log('Scenario 3: User enters first expected step');
testStepValidation('x³ = 8', 0);
console.log('');

console.log('Scenario 4: User enters first expected step with caret notation');
testStepValidation('x^3 = 8', 0);
console.log('');

console.log('Scenario 5: User enters second step');
testStepValidation('x = ∛8', 0);
console.log('');

console.log('Scenario 6: User enters final answer');
testStepValidation('x = 2', 0);
