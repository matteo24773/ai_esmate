// Enhanced local validation logic for math notation equivalency
// This file contains the enhanced validation logic that supports:
// - Original equation as valid first step
// - Superscript ↔ Caret notation equivalency (3x³ ≡ 3x^3)

// Helper function to normalize mathematical expressions for comparison
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

// Enhanced step validation with original equation support
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
        feedback: 'Perfetto! Hai riaffermato il problema. Ora procedi con il prossimo passaggio.'
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
  
  // Check for mathematically equivalent expressions
  const equivalentExpressions = generateEquivalentExpressions(userStep);
  
  for (let i = currentStepIndex; i < correctSteps.length; i++) {
    const normalizedCorrectStep = normalizeExpression(correctSteps[i]);
    
    for (const equivalent of equivalentExpressions) {
      if (normalizeExpression(equivalent) === normalizedCorrectStep) {
        return {
          isValid: true,
          nextStepIndex: i + 1,
          validationPath: 'equivalent_expression'
        };
      }
    }
  }
  
  return {
    isValid: false,
    nextStepIndex: currentStepIndex,
    feedback: 'Questo passaggio non sembra corretto. Prova a semplificare l\'espressione attuale o controlla l\'algebra.'
  };
}

// Generate mathematically equivalent expressions
function generateEquivalentExpressions(expression) {
  const equivalents = [expression];
  
  // Convert between superscript and caret notation
  let caretVersion = expression
    .replace(/¹/g, '^1')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/⁵/g, '^5')
    .replace(/⁶/g, '^6')
    .replace(/⁷/g, '^7')
    .replace(/⁸/g, '^8')
    .replace(/⁹/g, '^9')
    .replace(/⁰/g, '^0');
    
  let superscriptVersion = expression
    .replace(/\^1/g, '¹')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^4/g, '⁴')
    .replace(/\^5/g, '⁵')
    .replace(/\^6/g, '⁶')
    .replace(/\^7/g, '⁷')
    .replace(/\^8/g, '⁸')
    .replace(/\^9/g, '⁹')
    .replace(/\^0/g, '⁰');
  
  if (caretVersion !== expression) {
    equivalents.push(caretVersion);
  }
  
  if (superscriptVersion !== expression) {
    equivalents.push(superscriptVersion);
  }
  
  // Add more algebraic equivalences here as needed
  // For example: 2*x ≡ 2x, x*1 ≡ x, etc.
  
  return equivalents;
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    normalizeExpression,
    validateMathStep,
    generateEquivalentExpressions
  };
}
