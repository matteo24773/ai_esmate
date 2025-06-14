// Test dell'espressione regolare interna
const userStep = 'x=20-12';
const correctStep = 'x = 20 - 12';

// Funzione di normalizzazione
function normalizeExpression(expr) {
    if (!expr) return '';
    
    return expr
        .replace(/\s+/g, '') // Remove all spaces
        .toLowerCase()
        // Convert superscript notation to caret notation
        .replace(/¹/g, '^1').replace(/²/g, '^2').replace(/³/g, '^3')
        .replace(/⁴/g, '^4').replace(/⁵/g, '^5').replace(/⁶/g, '^6')
        .replace(/⁷/g, '^7').replace(/⁸/g, '^8').replace(/⁹/g, '^9').replace(/⁰/g, '^0')
        .replace(/\*/g, '') // Remove multiplication signs
        .replace(/\+-/g, '-') // Replace +- with -
        .replace(/-\+/g, '-') // Replace -+ with -
        // Add implied multiplication (but later we'll remove these symbols)
        .replace(/([a-z])([0-9])/g, '$1*$2') // Add implied multiplication between variable and number
        .replace(/([0-9])([a-z])/g, '$1*$2') // Add implied multiplication between number and variable
        // Normalize again by removing any remaining multiplication symbols to ensure consistent representation
        .replace(/\*/g, '');
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

// Mock dell'oggetto problem
const problem = {
    equation: "x + 12 = 20",
    steps: [
        "x = 20 - 12",
        "x = 8"
    ]
};

// Mock della funzione di validazione
function validateMathStepLocal(userStep, correctSteps, currentStepIndex, originalEquation) {
    const normalizedUserStep = normalizeExpression(userStep);
    
    // Controllo dell'equazione originale
    if (originalEquation) {
        const normalizedOriginal = normalizeExpression(originalEquation);
        if (normalizedUserStep === normalizedOriginal) {
            console.log('✅ Equazione originale accettata');
            return {
                isValid: true,
                nextStepIndex: currentStepIndex,
                feedback: 'Equation accepted.',
                validationPath: 'original_equation'
            };
        }
    }
    
    // Controllo degli step corretti
    for (let i = currentStepIndex; i < correctSteps.length; i++) {
        const normalizedCorrectStep = normalizeExpression(correctSteps[i]);
        
        if (normalizedUserStep === normalizedCorrectStep) {
            console.log(`✅ Step matched: ${correctSteps[i]}`);
            return {
                isValid: true,
                nextStepIndex: i + 1,
                feedback: 'Step accepted.',
                validationPath: 'exact_match'
            };
        }
        
        // Check if expressions are arithmetically equivalent
        if (areExpressionsEquivalent(userStep, correctSteps[i])) {
            console.log(`✅ Equivalent step matched: ${correctSteps[i]}`);
            return {
                isValid: true,
                nextStepIndex: i + 1,
                feedback: 'Equivalent step accepted.',
                validationPath: 'arithmetic_equivalent'
            };
        }
    }
    
    console.log('❌ No match found');
    return {
        isValid: false,
        nextStepIndex: currentStepIndex,
        feedback: 'This step doesn\'t seem correct.'
    };
}

// Test con il passo corretto
const result = validateMathStepLocal(userStep, problem.steps, 0, problem.equation);
console.log('Validation result:', result);

// Test other variants
const variants = ["x = 20 - 12", "x= 20-12", "x =20 - 12", "x=20 - 12"];
for (const variant of variants) {
    const result = validateMathStepLocal(variant, problem.steps, 0, problem.equation);
    console.log(`Test "${variant}":`, result.isValid ? '✅ VALID' : '❌ INVALID');
}
