// Test specifico per il problema che l'utente sta vedendo
const fs = require('fs');
const vm = require('vm');

// Carica il codice JavaScript dal file HTML
const htmlContent = fs.readFileSync('math-question.html', 'utf8');
const jsMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
const jsCode = jsMatch[1];

// Configura environment per simulare il browser
const sandbox = {
    console: console,
    document: {
        getElementById: function(id) {
            if (id === 'equation') return { textContent: '' };
            if (id === 'user-input') return { value: '' };
            if (id === 'feedback') return { textContent: '', style: {} };
            if (id === 'progress') return { textContent: '' };
            if (id === 'submit-btn') return { disabled: false };
            return null;
        },
        addEventListener: function() {},
        createElement: function() { return { style: {} }; }
    },
    window: {},
    MathJax: {
        typesetPromise: function() { return Promise.resolve(); }
    },
    fetch: function() {
        return Promise.resolve({
            ok: false,
            json: function() { return Promise.resolve({}); }
        });
    }
};

// Esegui il codice nel sandbox
vm.createContext(sandbox);
vm.runInContext(jsCode, sandbox);

// Helper per stampare i risultati dei test
function printResult(isValid, message) {
    if (isValid) {
        console.log('\x1b[32m✓ VALIDO\x1b[0m', message ? `- ${message}` : '');
    } else {
        console.log('\x1b[31m✗ NON VALIDO\x1b[0m', message ? `- ${message}` : '');
    }
}

// Test del problema specifico
console.log("=== TEST PROBLEMA SPECIFICO ===");
console.log("Problema: x + 12 = 20");
console.log("Input utente: x=20-12");

// Simula i dati del problema attuale
sandbox.currentProblem = {
    problem: "x + 12 = 20",
    equation: "x + 12 = 20",
    steps: [
        "x = 20 - 12",
        "x = 8"
    ],
    solution: "x = 8"
};
sandbox.currentStepIndex = 0;

// Test della validazione
// Simula la sessione corrente
sandbox.currentSession = {
    currentStep: 0,
    isCompleted: false
};

// Test diretto della funzione validateMathStepLocal
const result = sandbox.validateMathStepLocal("x=20-12", sandbox.currentProblem.steps, sandbox.currentSession.currentStep, sandbox.currentProblem.equation);
console.log("Risultato validazione diretta:", result.isValid);
printResult(result.isValid, result.feedback);

// Test usando handleDevelopmentValidation
const validationResult = sandbox.handleDevelopmentValidation("x=20-12");
console.log("Risultato handleDevelopmentValidation:", validationResult);

// Test anche con spazi
const result2 = sandbox.validateMathStepLocal("x = 20 - 12", sandbox.currentProblem.steps, sandbox.currentSession.currentStep, sandbox.currentProblem.equation);
console.log("Risultato validazione (con spazi):", result2.isValid);
printResult(result2.isValid, result2.feedback);

// Test normalizzazione
if (sandbox.validateMathStepLocal && typeof sandbox.validateMathStepLocal === 'function') {
    console.log("Test della funzione validateMathStepLocal:");
    
    // Funzione di normalizzazione interna
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
    
    console.log("Normalizzazione 'x=20-12':", normalizeExpression("x=20-12"));
    console.log("Normalizzazione 'x = 20 - 12':", normalizeExpression("x = 20 - 12"));
    console.log("Normalizzazione step target:", normalizeExpression("x = 20 - 12"));
    
    const step1 = normalizeExpression("x=20-12");
    const step2 = normalizeExpression("x = 20 - 12");
    const targetStep = normalizeExpression("x = 20 - 12");
    
    console.log("Step1 === targetStep:", step1 === targetStep);
    console.log("Step2 === targetStep:", step2 === targetStep);
}
