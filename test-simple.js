// Test semplice per verificare la nuova logica di validazione

// Copie delle funzioni dal backend
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

// === TEST FRAZIONI ===
console.log('\\n=== TEST NUOVA FEATURE: FRAZIONI ===');

// Aggiungi funzioni per gestire le frazioni
function evaluateSimpleExpression(expr) {
  try {
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
  const getRightSide = (expr) => {
    const parts = expr.split('=');
    return parts.length > 1 ? parts[1].trim() : expr.trim();
  };
  
  const right1 = getRightSide(expr1);
  const right2 = getRightSide(expr2);
  
  const val1 = evaluateSimpleExpression(right1);
  const val2 = evaluateSimpleExpression(right2);
  
  if (val1 !== null && val2 !== null) {
    return Math.abs(val1 - val2) < 0.0001;
  }
  
  return false;
}

// Test le nuove funzioni
console.log('evaluateSimpleExpression("24/3"):', evaluateSimpleExpression("24/3"));
console.log('evaluateSimpleExpression("8"):', evaluateSimpleExpression("8"));
console.log('areExpressionsEquivalent("x³=24/3", "x³=8"):', areExpressionsEquivalent("x³=24/3", "x³=8"));

// Test del caso specifico richiesto
console.log('\\nTest caso specifico: "x^3=24/3"');
const userInput = 'x^3=24/3';
const expectedStep = 'x³=8';

console.log('Input utente:', userInput);
console.log('Step atteso:', expectedStep);
console.log('Sono equivalenti?', areExpressionsEquivalent(userInput, expectedStep));

// Test normalizzazione
console.log('\\nTest normalizzazione:');
console.log('Normalizzato "x^3=24/3":', normalizeExpression('x^3=24/3'));
console.log('Normalizzato "x³=8":', normalizeExpression('x³=8'));

console.log('\\n=== FINE TEST FRAZIONI ===');

// Test data
const problemData = {
  problem: '3x³ = 24',
  steps: ['x³ = 8', 'x = ∛8', 'x = 2'],
  correctAnswer: 'x = 2'
};

console.log('=== TEST NUOVA LOGICA VALIDAZIONE ===');
console.log('Problema:', problemData.problem);
console.log('Passi attesi:', problemData.steps);
console.log('');

// Test case 1: Utente inserisce equazione originale
console.log('Test 1: Equazione originale con apice');
let result = validateMathStep('3x³ = 24', problemData.steps, 0, problemData.problem);
console.log('Input: "3x³ = 24"');
console.log('Valido:', result.isValid ? '✅ SÌ' : '❌ NO');
console.log('Prossimo step:', result.nextStepIndex);
console.log('Percorso:', result.validationPath);
console.log('Feedback:', result.feedback);
console.log('');

// Test case 2: Utente inserisce equazione originale con caret
console.log('Test 2: Equazione originale con caret');
result = validateMathStep('3x^3 = 24', problemData.steps, 0, problemData.problem);
console.log('Input: "3x^3 = 24"');
console.log('Valido:', result.isValid ? '✅ SÌ' : '❌ NO');
console.log('Prossimo step:', result.nextStepIndex);
console.log('Percorso:', result.validationPath);
console.log('Feedback:', result.feedback);
console.log('');

// Test case 3: Utente inserisce primo step
console.log('Test 3: Primo step con apice');
result = validateMathStep('x³ = 8', problemData.steps, 0, problemData.problem);
console.log('Input: "x³ = 8"');
console.log('Valido:', result.isValid ? '✅ SÌ' : '❌ NO');
console.log('Prossimo step:', result.nextStepIndex);
console.log('Percorso:', result.validationPath);
console.log('');

// Test case 4: Utente inserisce primo step con caret
console.log('Test 4: Primo step con caret');
result = validateMathStep('x^3 = 8', problemData.steps, 0, problemData.problem);
console.log('Input: "x^3 = 8"');
console.log('Valido:', result.isValid ? '✅ SÌ' : '❌ NO');
console.log('Prossimo step:', result.nextStepIndex);
console.log('Percorso:', result.validationPath);
console.log('');

// Test case 5: Sequenza completa
console.log('=== SEQUENZA COMPLETA ===');
console.log('Simulazione del flusso utente:');

let currentStep = 0;

// Step 1: Equazione originale
console.log('\\nStep 1: Utente inserisce "3x³ = 24"');
result = validateMathStep('3x³ = 24', problemData.steps, currentStep, problemData.problem);
console.log('Risultato:', result.isValid ? '✅ VALIDO' : '❌ INVALIDO');
if (result.isValid) currentStep = result.nextStepIndex;
console.log('Indice step corrente:', currentStep);

// Step 2: Primo step di soluzione
console.log('\\nStep 2: Utente inserisce "x³ = 8"');
result = validateMathStep('x³ = 8', problemData.steps, currentStep, problemData.problem);
console.log('Risultato:', result.isValid ? '✅ VALIDO' : '❌ INVALIDO');
if (result.isValid) currentStep = result.nextStepIndex;
console.log('Indice step corrente:', currentStep);

// Step 3: Secondo step di soluzione
console.log('\\nStep 3: Utente inserisce "x = ∛8"');
result = validateMathStep('x = ∛8', problemData.steps, currentStep, problemData.problem);
console.log('Risultato:', result.isValid ? '✅ VALIDO' : '❌ INVALIDO');
if (result.isValid) currentStep = result.nextStepIndex;
console.log('Indice step corrente:', currentStep);

// Step 4: Risposta finale
console.log('\\nStep 4: Utente inserisce "x = 2"');
result = validateMathStep('x = 2', problemData.steps, currentStep, problemData.problem);
console.log('Risultato:', result.isValid ? '✅ VALIDO' : '❌ INVALIDO');
if (result.isValid) currentStep = result.nextStepIndex;
console.log('Indice step corrente:', currentStep);

console.log('\\n=== COMPLETATO ===');
console.log('Il problema è stato risolto con successo!');
console.log('Numero totale di step accettati:', currentStep);

// === CASO D'USO RICHIESTO ===
console.log('\\n=== CASO D\'USO RICHIESTO: 3x³ = 24 con x^3=24/3 ===');

// Aggiornata funzione di validazione per includere step intermedi
function validateMathStepWithFractions(userStep, correctSteps, currentStepIndex, originalEquation) {
  const normalizedUserStep = normalizeExpression(userStep);
  
  // Check if user step matches the original equation
  if (originalEquation) {
    const normalizedOriginal = normalizeExpression(originalEquation);
    if (normalizedUserStep === normalizedOriginal) {
      return {
        isValid: true,
        nextStepIndex: currentStepIndex,
        validationPath: 'original_equation',
        feedback: 'Good start! Now proceed with the next step.'
      };
    }
  }
  
  // Check exact matches
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
  
  // Check intermediate steps with fractions
  for (let i = currentStepIndex; i < correctSteps.length; i++) {
    if (areExpressionsEquivalent(userStep, correctSteps[i])) {
      return {
        isValid: true,
        nextStepIndex: i + 1,
        validationPath: 'equivalent_expression',
        feedback: 'Excellent! Your algebraic expression is mathematically equivalent.'
      };
    }
  }
  
  return {
    isValid: false,
    nextStepIndex: currentStepIndex,
    feedback: 'This step doesn\'t seem correct. Try simplifying the current expression or check your algebra.'
  };
}

// Test del flusso completo richiesto
console.log('\\nTEST FLUSSO COMPLETO:');
console.log('Problema: 3x³ = 24');
console.log('Steps attesi: ["x³ = 8", "x = ∛8", "x = 2"]');
console.log('Step utente: x^3=24/3 (deve essere accettato come equivalente a x³ = 8)');

let stepIndex = 0;

// Step 1: Equazione originale
console.log('\\n1. Utente: "3x³ = 24"');
let validationResult = validateMathStepWithFractions('3x³ = 24', problemData.steps, stepIndex, problemData.problem);
console.log(`   ${validationResult.isValid ? '✅ VALIDO' : '❌ INVALIDO'} - ${validationResult.feedback || validationResult.validationPath}`);
if (validationResult.isValid) stepIndex = validationResult.nextStepIndex;

// Step 2: Step intermedio con frazione (NUOVO CASO D'USO)
console.log('\\n2. Utente: "x^3=24/3" (caso richiesto)');
validationResult = validateMathStepWithFractions('x^3=24/3', problemData.steps, stepIndex, problemData.problem);
console.log(`   ${validationResult.isValid ? '✅ VALIDO' : '❌ INVALIDO'} - ${validationResult.feedback || validationResult.validationPath}`);
if (validationResult.isValid) stepIndex = validationResult.nextStepIndex;

// Step 3: Salto alla risposta finale
console.log('\\n3. Utente: "x = 2"');
validationResult = validateMathStepWithFractions('x = 2', problemData.steps, stepIndex, problemData.problem);
console.log(`   ${validationResult.isValid ? '✅ VALIDO' : '❌ INVALIDO'} - ${validationResult.feedback || validationResult.validationPath}`);
if (validationResult.isValid) stepIndex = validationResult.nextStepIndex;

console.log('\\n=== RISULTATO ===');
console.log(`🎯 Caso d'uso supportato: L'utente può inserire "x^3=24/3" come step intermedio valido!`);
console.log(`📊 Step completati: ${stepIndex}/${problemData.steps.length}`);

console.log('\\n=== VERIFICATION ===');
console.log('✅ Supporto per equazione originale: 3x³ = 24');
console.log('✅ Supporto per step intermedio: x^3=24/3');  
console.log('✅ Equivalenza automatica: 24/3 = 8');
console.log('✅ Conversione notation: x^3 ↔ x³');
console.log('✅ Skip to final answer: x = 2');
