// Enhanced local validation logic for math notation equivalency
// This file contains the enhanced validation logic that supports:
// - Original equation as valid first step
// - Superscript ↔ Caret notation equivalency (3x³ ≡ 3x^3)

// Helper function to normalize mathematical expressions for comparison
function normalizeExpression(expr) {
  if (!expr) return '';
  
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
    .replace(/-\+/g, '-') // Replace -+ with -
    // Add implied multiplication (but later we'll remove these symbols)
    .replace(/([a-z])([0-9])/g, '$1*$2') // Add implied multiplication between variable and number
    .replace(/([0-9])([a-z])/g, '$1*$2') // Add implied multiplication between number and variable
    // Normalize again by removing any remaining multiplication symbols to ensure consistent representation
    .replace(/\*/g, '');
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
    
    // Check if expressions are arithmetically equivalent
    if (areExpressionsEquivalent(userStep, correctSteps[i])) {
      return {
        isValid: true,
        nextStepIndex: i + 1,
        validationPath: 'arithmetic_equivalent',
        feedback: 'Corretto! Hai trovato una soluzione equivalente.'
      };
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
  
  // Replace -1* with just -
  if (expression.includes('-1*')) {
    equivalents.push(expression.replace(/-1\*/g, '-'));
  }
  
  // Replace - with -1*
  if (expression.includes('-') && !expression.includes('-1*')) {
    equivalents.push(expression.replace(/-(?=\w)/g, '-1*'));
  }
  
  // Replace (1*3) with 3
  if (expression.includes('(1*')) {
    equivalents.push(expression.replace(/\(1\*(\d+)\)/g, '$1'));
  }
  
  return equivalents;
}

// Helper function to evaluate simple arithmetic expressions
function evaluateSimpleExpression(expr) {
  try {
    // Remove spaces and normalize
    const cleaned = expr.replace(/\s+/g, '');
    
    // Handle simple division: a/b
    const divisionRegex = /^(\d+)\/(\d+)$/;
    const divisionMatch = divisionRegex.exec(cleaned);
    if (divisionMatch) {
      const numerator = parseInt(divisionMatch[1]);
      const denominator = parseInt(divisionMatch[2]);
      if (denominator !== 0) {
        return numerator / denominator;
      }
    }
    
    // Handle simple integers
    const intRegex = /^(\d+)$/;
    const intMatch = intRegex.exec(cleaned);
    if (intMatch) {
      return parseInt(intMatch[1]);
    }
    
    // Try general arithmetic evaluation
    if (/^[0-9+\-*/().]+$/.test(cleaned)) {
      return Function(`"use strict";return (${cleaned})`)();
    }
    
    return null;
  } catch (e) {
    console.error("Error in evaluateSimpleExpression:", e);
    return null;
  }
}

// Helper function to check if two mathematical expressions are equivalent
function areExpressionsEquivalent(expr1, expr2) {
  // Check if either expression is empty
  if (!expr1 || !expr2) return false;
  
  // First, try direct normalization comparison
  if (normalizeExpression(expr1) === normalizeExpression(expr2)) {
    return true;
  }
  
  // Extract both sides of equations for comparison
  const getEquationSides = (expr) => {
    const parts = expr.split('=').map(p => p.trim());
    return parts.length > 1 ? parts : [expr.trim(), expr.trim()];
  };

  const sides1 = getEquationSides(expr1);
  const sides2 = getEquationSides(expr2);
  
  // Check left sides for equality if both are equations
  if (sides1.length > 1 && sides2.length > 1) {
    const left1 = normalizeExpression(sides1[0]);
    const left2 = normalizeExpression(sides2[0]);
    
    // If left sides are equal, we just need to check right sides
    if (left1 === left2) {
      // Just need to check right sides
      const right1 = sides1[1];
      const right2 = sides2[1];
      
      // Try numeric evaluation
      try {
        const val1 = evaluateSimpleExpression(right1);
        const val2 = evaluateSimpleExpression(right2);
        if (val1 !== null && val2 !== null) {
          return Math.abs(val1 - val2) < 0.0001;
        }
      } catch (e) {
        console.error("Error evaluating expressions:", e);
      }
    }
  } else {
    // Handle non-equation expressions (like just "8" or "24/3")
    try {
      const val1 = evaluateSimpleExpression(expr1);
      const val2 = evaluateSimpleExpression(expr2);
      if (val1 !== null && val2 !== null) {
        return Math.abs(val1 - val2) < 0.0001;
      }
    } catch (e) {
      console.error("Error evaluating non-equation expressions:", e);
    }
  }

  return false;
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    normalizeExpression,
    validateMathStep,
    generateEquivalentExpressions,
    evaluateSimpleExpression,
    areExpressionsEquivalent
  };
}
