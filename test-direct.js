// Test dell'espressione regolare interna
const userStep = 'x=20-12';
const correctStep = 'x = 20 - 12';

// Funzione di normalizzazione
function normalizeExpression(expr) {
    return expr
        .replace(/\s+/g, '') // Remove all spaces
        .toLowerCase()
        // Convert superscript notation to caret notation
        .replace(/¹/g, '^1').replace(/²/g, '^2').replace(/³/g, '^3')
        .replace(/⁴/g, '^4').replace(/⁵/g, '^5').replace(/⁶/g, '^6')
        .replace(/⁷/g, '^7').replace(/⁸/g, '^8').replace(/⁹/g, '^9').replace(/⁰/g, '^0')
        .replace(/\*/g, '') // Remove multiplication signs
        .replace(/\+-/g, '-') // Replace +- with -
        .replace(/-\+/g, '-'); // Replace -+ with -
}

const normalizedUserStep = normalizeExpression(userStep);
const normalizedCorrectStep = normalizeExpression(correctStep);

console.log('User step:', userStep);
console.log('Normalized:', normalizedUserStep);
console.log('Correct step:', correctStep);
console.log('Normalized correct:', normalizedCorrectStep);
console.log('Exact match?', normalizedUserStep === normalizedCorrectStep);

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
                feedback: 'Equation accepted.'
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
                feedback: 'Step accepted.'
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
