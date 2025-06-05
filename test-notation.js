// Test script to verify mathematical notation equivalency
// This will test if 2x³ and 2x^3 are treated as equivalent

// Copy the normalization and equivalency functions from the backend
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
  
  return equivalents;
}

// Test cases
console.log('=== Mathematical Notation Equivalency Tests ===\n');

// Test 1: Basic superscript to caret conversion
const test1_super = '2x³';
const test1_caret = '2x^3';
const norm1_super = normalizeExpression(test1_super);
const norm1_caret = normalizeExpression(test1_caret);

console.log('Test 1: Basic cubic notation');
console.log(`Original superscript: ${test1_super}`);
console.log(`Normalized superscript: ${norm1_super}`);
console.log(`Original caret: ${test1_caret}`);
console.log(`Normalized caret: ${norm1_caret}`);
console.log(`Are they equivalent? ${norm1_super === norm1_caret ? '✅ YES' : '❌ NO'}\n`);

// Test 2: More complex expressions
const test2_super = '3x² + 5x³';
const test2_caret = '3x^2 + 5x^3';
const norm2_super = normalizeExpression(test2_super);
const norm2_caret = normalizeExpression(test2_caret);

console.log('Test 2: Complex polynomial');
console.log(`Original superscript: ${test2_super}`);
console.log(`Normalized superscript: ${norm2_super}`);
console.log(`Original caret: ${test2_caret}`);
console.log(`Normalized caret: ${norm2_caret}`);
console.log(`Are they equivalent? ${norm2_super === norm2_caret ? '✅ YES' : '❌ NO'}\n`);

// Test 3: generateEquivalentExpressions function
console.log('Test 3: Equivalent expressions generation');
const original = '2x³';
const equivalents = generateEquivalentExpressions(original);
console.log(`Original: ${original}`);
console.log(`Generated equivalents: ${JSON.stringify(equivalents)}`);
console.log(`Contains caret version? ${equivalents.includes('2x^3') ? '✅ YES' : '❌ NO'}\n`);

// Test 4: Reverse conversion
const test4_caret = '4x^5';
const equivalents4 = generateEquivalentExpressions(test4_caret);
console.log('Test 4: Reverse conversion (caret to superscript)');
console.log(`Original: ${test4_caret}`);
console.log(`Generated equivalents: ${JSON.stringify(equivalents4)}`);
console.log(`Contains superscript version? ${equivalents4.includes('4x⁵') ? '✅ YES' : '❌ NO'}\n`);

// Test 5: Mixed exponents
const test5_mixed = 'x¹ + x² + x³ + x⁴ + x⁵';
const test5_caret = 'x^1 + x^2 + x^3 + x^4 + x^5';
const norm5_mixed = normalizeExpression(test5_mixed);
const norm5_caret = normalizeExpression(test5_caret);

console.log('Test 5: Mixed exponents');
console.log(`Original superscript: ${test5_mixed}`);
console.log(`Normalized superscript: ${norm5_mixed}`);
console.log(`Original caret: ${test5_caret}`);
console.log(`Normalized caret: ${norm5_caret}`);
console.log(`Are they equivalent? ${norm5_mixed === norm5_caret ? '✅ YES' : '❌ NO'}\n`);

console.log('=== Test Summary ===');
console.log('All tests should show ✅ YES for proper mathematical notation equivalency.');
