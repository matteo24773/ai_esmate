// Test for enhanced validation logic
// Specifically testing arithmetic equivalence in validation

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
    console.log('Evaluating:', expr, '→', cleaned);
    
    // Handle simple division: a/b
    const divisionRegex = /^(\d+)\/(\d+)$/;
    const divisionMatch = divisionRegex.exec(cleaned);
    if (divisionMatch) {
      const numerator = parseInt(divisionMatch[1]);
      const denominator = parseInt(divisionMatch[2]);
      if (denominator !== 0) {
        console.log(`  Division: ${numerator}/${denominator} = ${numerator / denominator}`);
        return numerator / denominator;
      }
    }
    
    // Handle simple integers
    const intRegex = /^(\d+)$/;
    const intMatch = intRegex.exec(cleaned);
    if (intMatch) {
      console.log(`  Integer: ${intMatch[1]}`);
      return parseInt(intMatch[1]);
    }
    
    // Try general arithmetic evaluation
    if (/^[0-9+\-*/().]+$/.test(cleaned)) {
      const result = Function(`"use strict";return (${cleaned})`)();
      console.log(`  Arithmetic: ${cleaned} = ${result}`);
      return result;
    }
    
    console.log(`  Could not evaluate: ${cleaned}`);
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
  
  console.log(`\nComparing: "${expr1}" and "${expr2}"`);
  
  // First, try direct normalization comparison
  const norm1 = normalizeExpression(expr1);
  const norm2 = normalizeExpression(expr2);
  console.log(`  Normalized: "${norm1}" and "${norm2}"`);
  
  if (norm1 === norm2) {
    console.log('  → Exact match after normalization');
    return true;
  }
  
  // Extract both sides of equations for comparison
  const getEquationSides = (expr) => {
    const parts = expr.split('=').map(p => p.trim());
    return parts.length > 1 ? parts : [expr.trim(), expr.trim()];
  };

  const sides1 = getEquationSides(expr1);
  const sides2 = getEquationSides(expr2);
  
  console.log(`  Split: "${sides1}" and "${sides2}"`);
  
  // Check left sides for equality if both are equations
  if (sides1.length > 1 && sides2.length > 1) {
    const left1 = normalizeExpression(sides1[0]);
    const left2 = normalizeExpression(sides2[0]);
    
    console.log(`  Left sides: "${left1}" and "${left2}"`);
    
    // If left sides are equal, we just need to check right sides
    if (left1 === left2) {
      console.log('  → Left sides match, checking right sides');
      // Just need to check right sides
      const right1 = sides1[1];
      const right2 = sides2[1];
      
      // Try numeric evaluation
      try {
        console.log(`  Checking right sides: "${right1}" and "${right2}"`);
        const val1 = evaluateSimpleExpression(right1);
        const val2 = evaluateSimpleExpression(right2);
        console.log(`  Evaluated to: ${val1} and ${val2}`);
        
        if (val1 !== null && val2 !== null) {
          const result = Math.abs(val1 - val2) < 0.0001;
          console.log(`  → Numeric equivalence: ${result ? 'Yes' : 'No'}`);
          return result;
        }
      } catch (e) {
        console.error("Error evaluating expressions:", e);
      }
    }
  } else {
    // Handle non-equation expressions (like just "8" or "24/3")
    try {
      console.log('  Checking as non-equation expressions');
      const val1 = evaluateSimpleExpression(expr1);
      const val2 = evaluateSimpleExpression(expr2);
      console.log(`  Evaluated to: ${val1} and ${val2}`);
      
      if (val1 !== null && val2 !== null) {
        const result = Math.abs(val1 - val2) < 0.0001;
        console.log(`  → Numeric equivalence: ${result ? 'Yes' : 'No'}`);
        return result;
      }
    } catch (e) {
      console.error("Error evaluating non-equation expressions:", e);
    }
  }

  console.log('  → No equivalence found');
  return false;
}

// Test validation function
function validateMathStep(userStep, correctSteps, currentStepIndex, originalEquation) {
    const normalizedUserStep = normalizeExpression(userStep);
    
    // Check if user step matches the original equation
    if (originalEquation) {
        const normalizedOriginal = normalizeExpression(originalEquation);
        if (normalizedUserStep === normalizedOriginal) {
            return {
                isValid: true,
                nextStepIndex: currentStepIndex,
                feedback: 'Original equation accepted.',
                validationPath: 'original_equation'
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
                feedback: 'Step accepted.',
                validationPath: 'exact_match'
            };
        }
        
        // Check if expressions are arithmetically equivalent
        if (areExpressionsEquivalent(userStep, correctSteps[i])) {
            return {
                isValid: true,
                nextStepIndex: i + 1,
                feedback: 'Equivalent step accepted.',
                validationPath: 'arithmetic_equivalent'
            };
        }
    }
    
    return {
        isValid: false,
        nextStepIndex: currentStepIndex,
        feedback: 'This step doesn\'t seem correct.'
    };
}

// Test cases
console.log('=== Testing Arithmetic Equivalence ===');
const test1 = areExpressionsEquivalent('x=20-12', 'x=8');
console.log('x=20-12 equivalent to x=8?', test1 ? '✅ YES' : '❌ NO');

const test2 = areExpressionsEquivalent('x=24/3', 'x=8');
console.log('x=24/3 equivalent to x=8?', test2 ? '✅ YES' : '❌ NO');

const test3 = areExpressionsEquivalent('x=16/2', 'x=8'); 
console.log('x=16/2 equivalent to x=8?', test3 ? '✅ YES' : '❌ NO');

const test4 = areExpressionsEquivalent('3x³=24', 'x³=8');
console.log('3x³=24 equivalent to x³=8?', test4 ? '✅ YES' : '❌ NO');

const test5 = areExpressionsEquivalent('x³=24/3', 'x³=8');
console.log('x³=24/3 equivalent to x³=8?', test5 ? '✅ YES' : '❌ NO');

// Test problem validation
console.log('\n=== Testing Problem Validation ===');
const problem = {
    equation: "x + 12 = 20",
    steps: [
        "x = 20 - 12",
        "x = 8"
    ]
};

// Test with problematic inputs
const inputs = [
    { input: 'x=20-12', expected: true },
    { input: 'x = 8', expected: true },
    { input: 'x=8', expected: true },
    { input: 'x= 20 - 12', expected: true },
    { input: 'x=24/3', expected: true },
    { input: 'x=16/2', expected: true },
    { input: 'x=4*2', expected: true },
    { input: 'x=21-13', expected: false } // Should fail, not equivalent to any step
];

for (const test of inputs) {
    const result = validateMathStep(test.input, problem.steps, 0, problem.equation);
    console.log(`Test "${test.input}": ${result.isValid ? '✅ VALID' : '❌ INVALID'} ${result.isValid === test.expected ? '(as expected)' : '(UNEXPECTED)'}`);
    if (result.isValid) {
        console.log(`  Validation path: ${result.validationPath}`);
    }
}

// Test specifically for the cubic equation case
console.log('\n=== Testing Cubic Equation ===');
const cubicProblem = {
    equation: "3x³ = 24",
    steps: [
        "x³ = 8",
        "x = 2"
    ]
};

const cubicInputs = [
    { input: '3x³ = 24', expected: true },
    { input: 'x³ = 8', expected: true },
    { input: 'x³=24/3', expected: true },
    { input: 'x=2', expected: true }
];

for (const test of cubicInputs) {
    const result = validateMathStep(test.input, cubicProblem.steps, 0, cubicProblem.equation);
    console.log(`Test "${test.input}": ${result.isValid ? '✅ VALID' : '❌ INVALID'} ${result.isValid === test.expected ? '(as expected)' : '(UNEXPECTED)'}`);
    if (result.isValid) {
        console.log(`  Validation path: ${result.validationPath}`);
    }
}
