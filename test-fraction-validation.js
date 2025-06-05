// Test the fraction validation functionality
const testUrl = 'http://localhost:54321/functions/v1/validate-step';

// Mock problem data similar to the 3x³ = 24 problem
const mockProblemData = {
  problem: "3x³ = 24",
  equation: "3x³ = 24",
  steps: [
    "x³ = 8",  // After dividing both sides by 3
    "x = 2"    // Final answer
  ]
};

async function testFractionValidation() {
  console.log('🧪 Testing Fraction Expression Validation\n');
  
  try {
    // Test 1: Original equation entry
    console.log('Test 1: Original equation entry');
    let response = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test-session-fraction',
        userStep: '3x³ = 24',
        mockData: {
          sessionData: {
            session_id: 'test-session-fraction',
            current_step: 0,
            is_completed: false,
            problem_data: mockProblemData
          }
        }
      })
    });
    
    let result = await response.json();
    console.log('Input: "3x³ = 24"');
    console.log('Result:', result);
    console.log('✅ Should be valid (original equation)\n');
    
    // Test 2: Fraction intermediate step - x³=24/3
    console.log('Test 2: Fraction intermediate step');
    response = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test-session-fraction',
        userStep: 'x³=24/3',
        mockData: {
          sessionData: {
            session_id: 'test-session-fraction',
            current_step: 0,
            is_completed: false,
            problem_data: mockProblemData
          }
        }
      })
    });
    
    result = await response.json();
    console.log('Input: "x³=24/3"');
    console.log('Result:', result);
    console.log('✅ Should be valid (equivalent to x³=8)\n');
    
    // Test 3: Caret notation with fraction - x^3=24/3
    console.log('Test 3: Caret notation with fraction');
    response = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test-session-fraction',
        userStep: 'x^3=24/3',
        mockData: {
          sessionData: {
            session_id: 'test-session-fraction',
            current_step: 0,
            is_completed: false,
            problem_data: mockProblemData
          }
        }
      })
    });
    
    result = await response.json();
    console.log('Input: "x^3=24/3"');
    console.log('Result:', result);
    console.log('✅ Should be valid (caret notation + fraction)\n');
    
    // Test 4: Standard step - x³=8
    console.log('Test 4: Standard expected step');
    response = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test-session-fraction',
        userStep: 'x³=8',
        mockData: {
          sessionData: {
            session_id: 'test-session-fraction',
            current_step: 0,
            is_completed: false,
            problem_data: mockProblemData
          }
        }
      })
    });
    
    result = await response.json();
    console.log('Input: "x³=8"');
    console.log('Result:', result);
    console.log('✅ Should be valid (exact match)\n');
    
    // Test 5: Invalid fraction step
    console.log('Test 5: Invalid fraction step');
    response = await fetch(testUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test-session-fraction',
        userStep: 'x³=24/2',
        mockData: {
          sessionData: {
            session_id: 'test-session-fraction',
            current_step: 0,
            is_completed: false,
            problem_data: mockProblemData
          }
        }
      })
    });
    
    result = await response.json();
    console.log('Input: "x³=24/2"');
    console.log('Result:', result);
    console.log('❌ Should be invalid (24/2 = 12, not 8)\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n💡 Make sure to start the Supabase Edge Function server:');
    console.log('supabase functions serve validate-step --no-verify-jwt');
  }
}

// Run the test
testFractionValidation();
