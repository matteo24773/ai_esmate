import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';
// Import mathjs for symbolic math evaluation
import * as math from 'https://cdn.jsdelivr.net/npm/mathjs@11.8.0/lib/esm/math.js';

// Helper function to normalize mathematical expressions for comparison
function normalizeExpression(expr: string): string {
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

// Advanced step validation with multiple acceptable paths
function validateMathStep(userStep: string, correctSteps: string[], currentStepIndex: number, originalEquation?: string): {
  isValid: boolean;
  nextStepIndex: number;
  feedback?: string;
  validationPath?: string;
} {  const normalizedUserStep = normalizeExpression(userStep);
  
  // Check if user step matches the original equation (allows re-stating the problem)
  if (originalEquation) {
    const normalizedOriginal = normalizeExpression(originalEquation);
    if (normalizedUserStep === normalizedOriginal) {
      return {
        isValid: true,
        nextStepIndex: currentStepIndex, // Stay at same step index
        validationPath: 'original_equation',
        feedback: 'Good start! Now proceed with the next step.'
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
  // For example: "2x = -3" and "2x = -1*3" are equivalent
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
  }
  
  // Check for partial progress (intermediate valid steps)
  const intermediateValidation = checkIntermediateStep(userStep, correctSteps, currentStepIndex);
  if (intermediateValidation.isValid) {
    return intermediateValidation;
  }
  
  return {
    isValid: false,
    nextStepIndex: currentStepIndex,
    feedback: 'This step doesn\'t seem correct. Try simplifying the current expression or check your algebra.'
  };
}

// Generate mathematically equivalent expressions
function generateEquivalentExpressions(expression: string): string[] {
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
  
  // Add more equivalence rules as needed
  return equivalents;
}

// Helper function to evaluate simple arithmetic expressions
function evaluateSimpleExpression(expr: string): number | null {
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
    
    return null;
  } catch {
    return null;
  }
}

// Helper: evaluate simple arithmetic (supports +, -, *, /, parentheses)
function evalArithmetic(expr: string): number | null {
  try {
    // Only allow safe characters
    if (/^[0-9xX+\-*/(). ]+$/.test(expr)) {
      // Normalize the expression: remove spaces
      const normalized = expr.replace(/\s+/g, '');
      
      // Handle basic arithmetic operations
      if (/^[0-9+\-*/().]+$/.test(normalized)) {
        // eslint-disable-next-line no-eval
        return Function(`"use strict";return (${normalized})`)();
      }
      
      // If variables are present, replace with 1 for simple equivalence checking
      // eslint-disable-next-line no-eval
      return Function(`"use strict";return (${normalized.replace(/[xX]/g, '1')})`)();
    }
  } catch (e) {
    console.error("Error in evalArithmetic:", e);
  }
  return null;
}

// Helper function to check if two mathematical expressions are equivalent
function areExpressionsEquivalent(expr1: string, expr2: string): boolean {
  // Check if either expression is empty
  if (!expr1 || !expr2) return false;
  
  // First, try direct normalization comparison
  if (normalizeExpression(expr1) === normalizeExpression(expr2)) {
    return true;
  }
  
  // Extract both sides of equations for comparison
  const getEquationSides = (expr: string) => {
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
      
      // Try numeric evaluation (arithmetic)
      try {
        // Try evaluating both expressions as arithmetic
        const val1 = evalArithmetic(right1);
        const val2 = evalArithmetic(right2);
        if (val1 !== null && val2 !== null) {
          return Math.abs(val1 - val2) < 0.0001;
        }
        
        // Fallback: try simple expression evaluation
        const fallback1 = evaluateSimpleExpression(right1);
        const fallback2 = evaluateSimpleExpression(right2);
        if (fallback1 !== null && fallback2 !== null) {
          return Math.abs(fallback1 - fallback2) < 0.0001;
        }
      } catch (e) {
        console.error("Error evaluating expressions:", e);
      }
    }
  } else {
    // Handle non-equation expressions (like just "8" or "24/3")
    try {
      // Try numeric evaluation (arithmetic)
      const val1 = evalArithmetic(expr1);
      const val2 = evalArithmetic(expr2);
      if (val1 !== null && val2 !== null) {
        return Math.abs(val1 - val2) < 0.0001;
      }
      
      // Fallback: simple evaluation
      const fallback1 = evaluateSimpleExpression(expr1);
      const fallback2 = evaluateSimpleExpression(expr2);
      if (fallback1 !== null && fallback2 !== null) {
        return Math.abs(fallback1 - fallback2) < 0.0001;
      }
    } catch (e) {
      console.error("Error evaluating non-equation expressions:", e);
    }
  }

  return false;
}

// Check if user step is a valid intermediate step
function checkIntermediateStep(userStep: string, correctSteps: string[], currentStepIndex: number): {
  isValid: boolean;
  nextStepIndex: number;
  feedback?: string;
} {
  const normalizedUserStep = normalizeExpression(userStep);
  
  // Check if the user step is mathematically equivalent to any upcoming step
  for (let i = currentStepIndex; i < correctSteps.length; i++) {
    const normalizedCorrectStep = normalizeExpression(correctSteps[i]);
    
    // Check if they are equivalent expressions (e.g., x³=24/3 equivalent to x³=8)
    if (areExpressionsEquivalent(userStep, correctSteps[i])) {
      return {
        isValid: true,
        nextStepIndex: i + 1,
        feedback: 'Good algebraic step! This is equivalent to the expected answer.'
      };
    }
    
    // Check if the left side matches and right side is algebraically equivalent
    const userParts = userStep.split('=');
    const correctParts = correctSteps[i].split('=');
    
    if (userParts.length === 2 && correctParts.length === 2) {
      const userLeft = normalizeExpression(userParts[0]);
      const correctLeft = normalizeExpression(correctParts[0]);
      
      if (userLeft === correctLeft) {
        // Same left side, check if right sides are equivalent
        if (areExpressionsEquivalent(userParts[1], correctParts[1])) {
          return {
            isValid: true,
            nextStepIndex: i + 1,
            feedback: 'Excellent! Your algebraic expression is mathematically equivalent.'
          };
        }
      }
    }
  }
  
  return {
    isValid: false,
    nextStepIndex: currentStepIndex
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { sessionId, userStep } = await req.json();
    
    if (!sessionId || !userStep) {
      return new Response(
        JSON.stringify({ error: 'Missing sessionId or userStep' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('math_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }), 
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    if (sessionData.is_completed) {
      return new Response(
        JSON.stringify({ 
          error: 'Session already completed',
          isCompleted: true 
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Validate the step
    const problemData = sessionData.problem_data;
    const currentStepIndex = sessionData.current_step;    const validation = validateMathStep(
      userStep, 
      problemData.steps, 
      currentStepIndex,
      problemData.problem ?? problemData.equation
    );

    // Update session in database
    const newStepIndex = validation.isValid ? validation.nextStepIndex : currentStepIndex;
    const isCompleted = newStepIndex >= problemData.steps.length;    const { error: updateError } = await supabase
      .from('math_sessions')
      .update({
        current_step: newStepIndex,
        is_completed: isCompleted,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Session update error:', updateError);
    }

    // Record the step attempt
    const { error: stepError } = await supabase
      .from('step_attempts')
      .insert({
        session_id: sessionId,
        step_number: currentStepIndex,
        user_input: userStep,
        is_correct: validation.isValid,
        feedback: validation.feedback,
        validation_path: validation.validationPath,
        created_at: new Date().toISOString()
      });

    if (stepError) {
      console.error('Step attempt recording error:', stepError);
    }    // Prepare response
    const response: any = {
      isValid: validation.isValid,
      currentStep: newStepIndex,
      totalSteps: problemData.steps.length,
      isCompleted: isCompleted,
      feedback: validation.feedback,
      validationPath: validation.validationPath
    };

    // If step is valid and not completed, provide next hint
    if (validation.isValid && !isCompleted && newStepIndex < problemData.steps.length) {
      response.nextHint = problemData.steps[newStepIndex];
    }

    // If completed, provide completion message
    if (isCompleted) {
      response.completionMessage = "Congratulations! You've solved the problem correctly!";
      response.correctAnswer = problemData.correctAnswer;
    }

    return new Response(
      JSON.stringify(response), 
      { 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
});
