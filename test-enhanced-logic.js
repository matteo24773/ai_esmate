// Test per verificare la logica migliorata dei passaggi matematici
// Test case: 3x³ = 24 con possibilità di inserire l'equazione originale

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

// Simula la funzione validateMathStep aggiornata dal backend
function validateMathStep(userStep, correctSteps, currentStepIndex, originalEquation) {
  const normalizedUserStep = normalizeExpression(userStep);
  
  // Check if user step matches the original equation (allows re-stating the problem)
  if (originalEquation) {
    const normalizedOriginal = normalizeExpression(originalEquation);
    if (normalizedUserStep === normalizedOriginal) {
      return {
        isValid: true,
        nextStepIndex: currentStepIndex, // Stay at same step index
        validationPath: 'original_equation',
        feedback: 'Good start! Now proceed with the next step.'
      };
    }
  }
  
  // Check if user step matches any of the remaining correct steps
  for (let i = currentStepIndex; i < correctSteps.length; i++) {
    const normalizedCorrectStep = normalizeExpression(correctSteps[i]);
    
    if (normalizedUserStep === normalizedCorrectStep) {
      return {
        isValid: true,
        nextStepIndex: i + 1,
        validationPath: 'exact_match'
      };
    }
  }
  
  return {
    isValid: false,
    nextStepIndex: currentStepIndex,
    feedback: 'This step doesn\'t seem correct. Try simplifying the current expression or check your algebra.'
  };
}

// Test problem data come definito nel backend
const problemData = {
  problem: '3x³ = 24',
  steps: ['x³ = 8', 'x = ∛8', 'x = 2'],
  correctAnswer: 'x = 2'
};

console.log('=== TEST ENHANCED STEP LOGIC ===');
console.log('Problem:', problemData.problem);
console.log('Expected steps:', problemData.steps);
console.log('');

// Test step validation con la nuova logica
function testScenario(description, userStep, currentStepIndex) {
  console.log(`${description}:`);
  console.log(`  Input: "${userStep}" at step ${currentStepIndex}`);
  
  const result = validateMathStep(
    userStep, 
    problemData.steps, 
    currentStepIndex, 
    problemData.problem
  );
  
  console.log(`  Result: ${result.isValid ? '✅ VALID' : '❌ INVALID'}`);
  console.log(`  Next step index: ${result.nextStepIndex}`);
  console.log(`  Validation path: ${result.validationPath || 'none'}`);
  if (result.feedback) {
    console.log(`  Feedback: ${result.feedback}`);
  }
  console.log('');
}

// Test del flusso completo come vorrebbe l'utente:
// 1. 3x³ = 24 (equazione originale)
// 2. x³ = 8 (primo step)
// 3. x = 2 (risultato finale)

console.log('=== SCENARIO: COMPLETE WORKFLOW ===');
testScenario('Step 1: User enters original equation', '3x³ = 24', 0);
testScenario('Step 2: User enters original equation with caret', '3x^3 = 24', 0);
testScenario('Step 3: User enters first solution step', 'x³ = 8', 0);
testScenario('Step 4: User enters first solution step with caret', 'x^3 = 8', 0);
testScenario('Step 5: User enters second solution step', 'x = ∛8', 1);
testScenario('Step 6: User enters final answer', 'x = 2', 2);

console.log('=== SCENARIO: SKIPPING STEPS ===');
testScenario('Skip to final answer from start', 'x = 2', 0);
testScenario('Skip to second step from start', 'x = ∛8', 0);

console.log('=== SCENARIO: WRONG INPUTS ===');
testScenario('Wrong equation', '2x³ = 24', 0);
testScenario('Wrong step', 'x³ = 10', 0);
