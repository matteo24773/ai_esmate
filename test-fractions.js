// Test per verificare la validazione di espressioni frazionarie
// Test case: 3x³ = 24 con step intermedio x^3=24/3

// Simula le funzioni dal backend aggiornato
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

function evaluateSimpleExpression(expr) {
  try {
    // Remove spaces and normalize
    const cleaned = expr.replace(/\s+/g, '');
    
    // Handle simple division: a/b
    const divisionMatch = cleaned.match(/^(\d+)\/(\d+)$/);
    if (divisionMatch) {
      const numerator = parseInt(divisionMatch[1]);
      const denominator = parseInt(divisionMatch[2]);
      if (denominator !== 0) {
        return numerator / denominator;
      }
    }
    
    // Handle simple integers
    const intMatch = cleaned.match(/^(\d+)$/);
    if (intMatch) {
      return parseInt(intMatch[1]);
    }
    
    return null;
  } catch {
    return null;
  }
}

function areExpressionsEquivalent(expr1, expr2) {
  // Extract the right side of equations for comparison
  const getRightSide = (expr) => {
    const parts = expr.split('=');
    return parts.length > 1 ? parts[1].trim() : expr.trim();
  };
  
  const right1 = getRightSide(expr1);
  const right2 = getRightSide(expr2);
  
  const val1 = evaluateSimpleExpression(right1);
  const val2 = evaluateSimpleExpression(right2);
  
  if (val1 !== null && val2 !== null) {
    return Math.abs(val1 - val2) < 0.0001; // Handle floating point precision
  }
  
  return false;
}

function checkIntermediateStep(userStep, correctSteps, currentStepIndex) {
  const normalizedUserStep = normalizeExpression(userStep);
  
  // Check if the user step is mathematically equivalent to any upcoming step
  for (let i = currentStepIndex; i < correctSteps.length; i++) {
    const normalizedCorrectStep = normalizeExpression(correctSteps[i]);
    
    // Check if they are equivalent expressions (e.g., x³=24/3 equivalent to x³=8)
    if (areExpressionsEquivalent(userStep, correctSteps[i])) {
      return {
        isValid: true,
        nextStepIndex: i + 1,
        feedback: 'Good algebraic step! This is equivalent to the expected answer.'
      };
    }
    
    // Check if the left side matches and right side is algebraically equivalent
    const userParts = userStep.split('=');
    const correctParts = correctSteps[i].split('=');
    
    if (userParts.length === 2 && correctParts.length === 2) {
      const userLeft = normalizeExpression(userParts[0]);
      const correctLeft = normalizeExpression(correctParts[0]);
      
      if (userLeft === correctLeft) {
        // Same left side, check if right sides are equivalent
        if (areExpressionsEquivalent(userParts[1], correctParts[1])) {
          return {
            isValid: true,
            nextStepIndex: i + 1,
            feedback: 'Excellent! Your algebraic expression is mathematically equivalent.'
          };
        }
      }
    }
  }
  
  return {
    isValid: false,
    nextStepIndex: currentStepIndex
  };
}

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
  
  // Check for partial progress (intermediate valid steps)
  const intermediateValidation = checkIntermediateStep(userStep, correctSteps, currentStepIndex);
  if (intermediateValidation.isValid) {
    return {
      isValid: true,
      nextStepIndex: intermediateValidation.nextStepIndex,
      validationPath: 'intermediate_step',
      feedback: intermediateValidation.feedback
    };
  }
  
  return {
    isValid: false,
    nextStepIndex: currentStepIndex,
    feedback: 'This step doesn\'t seem correct. Try simplifying the current expression or check your algebra.'
  };
}

// Test data
const problemData = {
  problem: '3x³ = 24',
  steps: ['x³ = 8', 'x = ∛8', 'x = 2'],
  correctAnswer: 'x = 2'
};

console.log('=== TEST VALIDAZIONE ESPRESSIONI FRAZIONARIE ===');
console.log('Problema:', problemData.problem);
console.log('Passi attesi:', problemData.steps);
console.log('');

// Test delle funzioni helper
console.log('=== TEST FUNZIONI HELPER ===');
console.log('evaluateSimpleExpression("24/3"):', evaluateSimpleExpression("24/3"));
console.log('evaluateSimpleExpression("8"):', evaluateSimpleExpression("8"));
console.log('areExpressionsEquivalent("x³=24/3", "x³=8"):', areExpressionsEquivalent("x³=24/3", "x³=8"));
console.log('areExpressionsEquivalent("x^3=24/3", "x³=8"):', areExpressionsEquivalent("x^3=24/3", "x³=8"));
console.log('');

// Test case: Step intermedio con frazione
console.log('=== TEST STEP INTERMEDIO CON FRAZIONE ===');

function testStep(description, userInput, expectedValid) {
  console.log(`${description}:`);
  console.log(`Input: "${userInput}"`);
  
  const result = validateMathStep(userInput, problemData.steps, 0, problemData.problem);
  
  const status = result.isValid ? '✅ VALIDO' : '❌ INVALIDO';
  const expected = expectedValid ? '✅' : '❌';
  const match = result.isValid === expectedValid ? '✅' : '❌';
  
  console.log(`Risultato: ${status} (atteso: ${expected}) ${match}`);
  console.log(`Percorso: ${result.validationPath || 'none'}`);
  console.log(`Prossimo step: ${result.nextStepIndex}`);
  if (result.feedback) {
    console.log(`Feedback: ${result.feedback}`);
  }
  console.log('');
}

// Test 1: Equazione originale
testStep('Equazione originale', '3x³ = 24', true);

// Test 2: Step intermedio con frazione (NUOVO)
testStep('Step intermedio con frazione', 'x^3=24/3', true);

// Test 3: Step intermedio con frazione e superscript
testStep('Step intermedio con frazione superscript', 'x³=24/3', true);

// Test 4: Step standard
testStep('Step standard x³=8', 'x³ = 8', true);

// Test 5: Step standard con caret
testStep('Step standard x^3=8', 'x^3 = 8', true);

// Test 6: Secondo step
testStep('Secondo step', 'x = ∛8', true);

// Test 7: Risposta finale
testStep('Risposta finale', 'x = 2', true);

// Test 8: Frazione sbagliata
testStep('Frazione sbagliata', 'x^3=25/3', false);

// Test 9: Variabile sbagliata
testStep('Variabile sbagliata', 'y^3=24/3', false);

console.log('=== FLUSSO COMPLETO ===');
console.log('Simulazione flusso utente con step intermedio:');

let currentStep = 0;

console.log('\\n1. Utente inserisce equazione originale: "3x³ = 24"');
let result = validateMathStep('3x³ = 24', problemData.steps, currentStep, problemData.problem);
console.log(`   ${result.isValid ? '✅' : '❌'} ${result.feedback || ''}`);
if (result.isValid) currentStep = result.nextStepIndex;

console.log('\\n2. Utente inserisce step intermedio: "x^3=24/3"');
result = validateMathStep('x^3=24/3', problemData.steps, currentStep, problemData.problem);
console.log(`   ${result.isValid ? '✅' : '❌'} ${result.feedback || ''}`);
if (result.isValid) currentStep = result.nextStepIndex;

console.log('\\n3. Utente inserisce step finale: "x = 2"');
result = validateMathStep('x = 2', problemData.steps, currentStep, problemData.problem);
console.log(`   ${result.isValid ? '✅' : '❌'} ${result.feedback || ''}`);
if (result.isValid) currentStep = result.nextStepIndex;

console.log('\\n=== RISULTATO FINALE ===');
console.log(`Problema completato! Step totali: ${currentStep}/${problemData.steps.length}`);
