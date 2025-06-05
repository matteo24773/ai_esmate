// Test semplice per verificare che i dati mock siano corretti
console.log("=== VERIFICA DATI MOCK ===");

const mockData = {
  algebra: {
    'Beginner': [
      {
        problem: "x + 12 = 20",
        equation: "x + 12 = 20",
        description: "Solve for x:",
        difficulty: "Beginner", 
        topic: "algebra",
        steps: ['x = 20 - 12', 'x = 8'],
        solution: 'x = 8'
      }
    ]
  }
};

// Test normalizzazione
function normalizeExpression(expr) {
  return expr
    .replace(/\s+/g, '') // Remove all spaces
    .toLowerCase()
    .replace(/\*/g, '') // Remove multiplication signs
    .replace(/\+-/g, '-') // Replace +- with -
    .replace(/-\+/g, '-'); // Replace -+ with -
}

// Test validazione
function testValidation(userInput, expectedStep) {
  const normalizedUser = normalizeExpression(userInput);
  const normalizedExpected = normalizeExpression(expectedStep);
  
  console.log(`Input utente: "${userInput}"`);
  console.log(`Step atteso: "${expectedStep}"`);
  console.log(`Normalizzato utente: "${normalizedUser}"`);
  console.log(`Normalizzato atteso: "${normalizedExpected}"`);
  console.log(`Match: ${normalizedUser === normalizedExpected}`);
  console.log("---");
}

// Test dei casi specifici
const problem = mockData.algebra.Beginner[0];
console.log("Problema:", problem.problem);
console.log("Steps:", problem.steps);
console.log("");

testValidation("x=20-12", "x = 20 - 12");
testValidation("x = 20 - 12", "x = 20 - 12");
testValidation("x=20-12", "x=20-12");

console.log("=== TEST COMPLETATO ===");
