// Test per simulare il flusso completo dell'applicazione
// Testa la nuova logica che permette di inserire l'equazione originale

// Simula l'Environment delle Edge Functions
global.Deno = {
  env: {
    get: (key) => {
      const env = {
        'SUPABASE_URL': 'https://test-project.supabase.co',
        'SUPABASE_SERVICE_ROLE_KEY': 'test-key'
      };
      return env[key];
    }
  },
  serve: (handler) => {
    global.testHandler = handler;
    console.log('Mock Deno.serve initialized');
  }
};

// Mock Supabase client
const mockSupabaseClient = {
  from: (table) => ({
    select: (columns) => ({
      eq: (column, value) => ({
        single: () => {
          if (table === 'math_sessions' && column === 'session_id') {
            return {
              data: {
                session_id: 'test-session',
                current_step: 0,
                is_completed: false,
                problem_data: {
                  id: 'alg_cubic_test',
                  problem: '3x³ = 24',
                  description: 'Solve the cubic equation:',
                  correctAnswer: 'x = 2',
                  steps: ['x³ = 8', 'x = ∛8', 'x = 2'],
                  difficulty: 'Advanced'
                }
              },
              error: null
            };
          }
          return { data: null, error: 'Not found' };
        }
      })
    }),
    update: (data) => ({
      eq: (column, value) => ({
        select: () => ({
          single: () => ({ error: null })
        })
      })
    }),
    insert: (data) => ({ error: null })
  })
};

// Mock the createClient function
global.createClient = () => mockSupabaseClient;

// Load the Edge Function
const fs = require('fs');
const path = require('path');

// Read and evaluate the Edge Function code
const functionCode = fs.readFileSync(
  path.join(__dirname, 'supabase', 'functions', 'validate-step', 'index.ts'),
  'utf8'
);

// Remove the import statements for this test
const cleanCode = functionCode
  .replace(/import.*?;/g, '')
  .replace(/import.*?\n.*?;/g, '');

// Evaluate the function code
eval(cleanCode);

// Test function
async function testValidateStep(userStep, expectedResult) {
  console.log(`\n=== Testing: "${userStep}" ===`);
  
  const mockRequest = {
    method: 'POST',
    json: async () => ({
      sessionId: 'test-session',
      userStep: userStep
    })
  };
  
  try {
    const response = await global.testHandler(mockRequest);
    const responseData = JSON.parse(await response.text());
    
    console.log(`✅ Response:`, responseData);
    
    if (responseData.isValid === expectedResult.isValid) {
      console.log(`✅ Validation result correct: ${responseData.isValid}`);
    } else {
      console.log(`❌ Expected ${expectedResult.isValid}, got ${responseData.isValid}`);
    }
    
    if (responseData.validationPath) {
      console.log(`📍 Validation path: ${responseData.validationPath}`);
    }
    
    if (responseData.feedback) {
      console.log(`💬 Feedback: ${responseData.feedback}`);
    }
    
  } catch (error) {
    console.error(`❌ Error testing "${userStep}":`, error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting comprehensive validation tests...\n');
  
  console.log('Problem: 3x³ = 24');
  console.log('Expected steps: ["x³ = 8", "x = ∛8", "x = 2"]');
  
  // Test 1: Original equation with superscript
  await testValidateStep('3x³ = 24', { isValid: true });
  
  // Test 2: Original equation with caret notation  
  await testValidateStep('3x^3 = 24', { isValid: true });
  
  // Test 3: First step with superscript
  await testValidateStep('x³ = 8', { isValid: true });
  
  // Test 4: First step with caret notation
  await testValidateStep('x^3 = 8', { isValid: true });
  
  // Test 5: Second step
  await testValidateStep('x = ∛8', { isValid: true });
  
  // Test 6: Final answer
  await testValidateStep('x = 2', { isValid: true });
  
  // Test 7: Wrong input
  await testValidateStep('2x³ = 24', { isValid: false });
  
  console.log('\n🎉 Tests completed!');
}

// Mock Response object
global.Response = class {
  constructor(body, options) {
    this.body = body;
    this.options = options;
  }
  
  async text() {
    return this.body;
  }
};

runTests().catch(console.error);
