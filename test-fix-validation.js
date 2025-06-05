// Test specifico per verificare la fix del problema di validazione
const fs = require('fs');
const vm = require('vm');

// Carica il codice JavaScript
const jsContent = fs.readFileSync('src/math-question.js', 'utf8');

// Configura environment per simulare il browser
const sandbox = {
    console: console,
    document: {
        getElementById: function(id) {
            return { 
                textContent: '', 
                value: '', 
                innerHTML: '',
                style: {},
                disabled: false,
                appendChild: function() {},
                scrollTop: 0,
                scrollHeight: 100,
                classList: {
                    toggle: function() {},
                    add: function() {},
                    remove: function() {}
                }
            };
        },
        addEventListener: function() {},
        createElement: function() { 
            return { 
                style: {},
                className: '',
                innerHTML: '',
                appendChild: function() {}
            }; 
        },
        querySelectorAll: function() { return []; }
    },
    window: {},
    sessionStorage: {
        getItem: function() { return 'algebra'; }
    },
    localStorage: {
        getItem: function() { return null; }
    },
    fetch: function() {
        return Promise.resolve({
            ok: false,
            json: function() { return Promise.resolve({}); }
        });
    },
    // Mock delle funzioni del modulo supabase
    supabase: {
        auth: {
            getSession: function() {
                return Promise.resolve({ data: { session: null } });
            }
        }
    }
};

// Aggiungi le funzioni di import come no-op
sandbox.import = function() { return Promise.resolve({}); };

// Esegui il codice nel sandbox
vm.createContext(sandbox);

try {
    // Simula il caricamento del modulo
    const moduleCode = jsContent.replace(/^import.*$/gm, '// $&');
    vm.runInContext(moduleCode, sandbox);
} catch (error) {
    console.error('Errore nel caricamento del codice:', error.message);
}

// Test della validazione del problema specifico
console.log("=== TEST PROBLEMA SPECIFICO: x + 12 = 20 ===");

// Simula l'inizializzazione del problema in modalità sviluppo
if (sandbox.useDevelopmentFallback) {
    console.log("✓ Funzione useDevelopmentFallback trovata");
    
    // Simula l'inizializzazione
    sandbox.useDevelopmentFallback('algebra', 'Beginner');
    
    // Verifica che currentProblem sia stato impostato correttamente
    if (sandbox.currentProblem) {
        console.log("✓ currentProblem creato:", {
            problem: sandbox.currentProblem.problem,
            steps: sandbox.currentProblem.steps,
            solution: sandbox.currentProblem.solution
        });
        
        // Test della validazione se il problema è quello giusto
        if (sandbox.currentProblem.problem === "x + 12 = 20" && sandbox.validateMathStepLocal) {
            console.log("\n=== TEST VALIDAZIONE ===");
            
            const userInput = "x=20-12";
            const result = sandbox.validateMathStepLocal(
                userInput,
                sandbox.currentProblem.steps,
                0,
                sandbox.currentProblem.problem
            );
            
            console.log(`Input utente: "${userInput}"`);
            console.log(`Risultato validazione:`, result);
            
            if (result.isValid) {
                console.log("✅ SUCCESS: La validazione funziona correttamente!");
            } else {
                console.log("❌ FAILURE: La validazione non funziona");
            }
            
            // Test anche con spazi
            const userInputSpaces = "x = 20 - 12";
            const result2 = sandbox.validateMathStepLocal(
                userInputSpaces,
                sandbox.currentProblem.steps,
                0,
                sandbox.currentProblem.problem
            );
            
            console.log(`Input utente (con spazi): "${userInputSpaces}"`);
            console.log(`Risultato validazione:`, result2);
            
            if (result2.isValid) {
                console.log("✅ SUCCESS: La validazione con spazi funziona!");
            } else {
                console.log("❌ FAILURE: La validazione con spazi non funziona");
            }
        } else {
            console.log("⚠️  Il problema generato non è quello atteso o validateMathStepLocal non trovata");
            console.log("Problema attuale:", sandbox.currentProblem.problem);
        }
    } else {
        console.log("❌ currentProblem non creato");
    }
} else {
    console.log("❌ Funzione useDevelopmentFallback non trovata");
}

console.log("\n=== TEST COMPLETATO ===");
