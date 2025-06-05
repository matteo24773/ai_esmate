import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

// Exercise problems database
const exerciseProblems = {
  algebra: [
    {
      id: 'alg_1',
      problem: "2x + 5 = 13",
      description: "Solve for x:",
      correctAnswer: 4,
      steps: [
        "2x + 5 = 13",
        "Subtract 5 from both sides",
        "2x = 8", 
        "Divide both sides by 2",
        "x = 4"
      ],
      difficulty: "Beginner"
    },
    {
      id: 'alg_2',
      problem: "3x - 7 = 14",
      description: "Solve for x:",
      correctAnswer: 7,
      steps: [
        "3x - 7 = 14",
        "Add 7 to both sides",
        "3x = 21",
        "Divide both sides by 3", 
        "x = 7"
      ],
      difficulty: "Beginner"
    },    {
      id: 'alg_3',
      problem: "x² - 5x + 6 = 0",
      description: "Solve the quadratic equation:",
      correctAnswer: "x = 2 or x = 3",
      steps: [
        "x² - 5x + 6 = 0",
        "Factor the quadratic",
        "(x - 2)(x - 3) = 0",
        "Set each factor to zero",
        "x = 2 or x = 3"
      ],
      difficulty: "Intermediate"
    },
    {
      id: 'alg_4',
      problem: "4x - 12 = 20",
      description: "Solve for x:",
      correctAnswer: 8,
      steps: [
        "4x - 12 = 20",
        "Add 12 to both sides",
        "4x = 32",
        "Divide both sides by 4",
        "x = 8"
      ],
      difficulty: "Beginner"
    },
    {
      id: 'alg_5',
      problem: "x³ - 6x² + 11x - 6 = 0",
      description: "Solve the cubic equation:",
      correctAnswer: "x = 1, x = 2, or x = 3",
      steps: [
        "x³ - 6x² + 11x - 6 = 0",
        "Try x = 1: 1 - 6 + 11 - 6 = 0 ✓",
        "Factor out (x - 1): (x - 1)(x² - 5x + 6) = 0",
        "Factor quadratic: (x - 1)(x - 2)(x - 3) = 0",
        "x = 1, x = 2, or x = 3"
      ],
      difficulty: "Advanced"
    }
  ],
  derivatives: [
    {
      id: 'der_1',
      problem: "f(x) = 3x²",
      description: "Find the derivative:",
      correctAnswer: "f'(x) = 6x",
      steps: [
        "f(x) = 3x²",
        "Apply power rule: d/dx(x^n) = nx^(n-1)",
        "f'(x) = 3 × 2x^(2-1)",
        "f'(x) = 6x"
      ],
      difficulty: "Beginner"
    },
    {
      id: 'der_2',
      problem: "f(x) = x³ + 2x² - 5x + 1",
      description: "Find the derivative:",
      correctAnswer: "f'(x) = 3x² + 4x - 5",
      steps: [
        "f(x) = x³ + 2x² - 5x + 1",
        "Apply power rule to each term",
        "f'(x) = 3x² + 4x - 5 + 0",
        "f'(x) = 3x² + 4x - 5"
      ],
      difficulty: "Intermediate"
    },
    {
      id: 'der_3',
      problem: "f(x) = sin(2x) + cos(x)",
      description: "Find the derivative:",
      correctAnswer: "f'(x) = 2cos(2x) - sin(x)",
      steps: [
        "f(x) = sin(2x) + cos(x)",
        "Apply chain rule to sin(2x): d/dx[sin(2x)] = cos(2x) × 2",
        "Apply basic rule to cos(x): d/dx[cos(x)] = -sin(x)",
        "f'(x) = 2cos(2x) - sin(x)"
      ],
      difficulty: "Intermediate"
    },
    {
      id: 'der_4',
      problem: "f(x) = e^(x²) · ln(x)",
      description: "Find the derivative using product rule:",
      correctAnswer: "f'(x) = e^(x²) · (2x·ln(x) + 1/x)",
      steps: [
        "f(x) = e^(x²) · ln(x)",
        "Use product rule: (uv)' = u'v + uv'",
        "u = e^(x²), u' = 2x·e^(x²)",
        "v = ln(x), v' = 1/x",
        "f'(x) = 2x·e^(x²)·ln(x) + e^(x²)·(1/x)",
        "f'(x) = e^(x²) · (2x·ln(x) + 1/x)"
      ],
      difficulty: "Advanced"
    }  ],
  geometry: [
    {
      id: 'geo_1',
      problem: "Circle with radius r = 5",
      description: "Find the area:",
      correctAnswer: "A = 25π",
      steps: [
        "Given: r = 5",
        "Use formula: A = πr²",
        "A = π × 5²",
        "A = π × 25",
        "A = 25π"
      ],
      difficulty: "Beginner"
    },
    {
      id: 'geo_2',
      problem: "Triangle with sides a=3, b=4, c=5",
      description: "Find the area using Heron's formula:",
      correctAnswer: "A = 6",
      steps: [
        "Given: a=3, b=4, c=5",
        "Calculate semi-perimeter: s = (3+4+5)/2 = 6",
        "Use Heron's formula: A = √[s(s-a)(s-b)(s-c)]",
        "A = √[6(6-3)(6-4)(6-5)]",
        "A = √[6 × 3 × 2 × 1] = √36 = 6"
      ],
      difficulty: "Intermediate"
    },
    {
      id: 'geo_3',
      problem: "Regular hexagon with side length 4",
      description: "Find the area:",
      correctAnswer: "A = 24√3",
      steps: [
        "Given: side length s = 4",
        "For regular hexagon: A = (3√3/2) × s²",
        "A = (3√3/2) × 4²",
        "A = (3√3/2) × 16",
        "A = 24√3"
      ],
      difficulty: "Advanced"
    }
  ],
  statistics: [
    {
      id: 'stat_1',
      problem: "Data set: [2, 4, 6, 8, 10]",
      description: "Find the mean (average):",
      correctAnswer: "Mean = 6",
      steps: [
        "Data: [2, 4, 6, 8, 10]",
        "Sum all values: 2 + 4 + 6 + 8 + 10 = 30",
        "Count values: n = 5",
        "Mean = Sum ÷ Count",
        "Mean = 30 ÷ 5 = 6"
      ],
      difficulty: "Beginner"
    },
    {
      id: 'stat_2',
      problem: "Data set: [10, 12, 14, 16, 18]",
      description: "Find the standard deviation:",
      correctAnswer: "σ ≈ 2.83",
      steps: [
        "Data: [10, 12, 14, 16, 18]",
        "Mean = (10+12+14+16+18)/5 = 14",
        "Variance = [(10-14)² + (12-14)² + (14-14)² + (16-14)² + (18-14)²]/5",
        "Variance = [16 + 4 + 0 + 4 + 16]/5 = 8",
        "Standard deviation = √8 ≈ 2.83"
      ],
      difficulty: "Intermediate"
    },
    {
      id: 'stat_3', 
      problem: "Normal distribution with μ=100, σ=15",
      description: "Find P(X < 115):",
      correctAnswer: "P(X < 115) ≈ 0.8413",
      steps: [
        "Given: μ=100, σ=15, find P(X < 115)",
        "Standardize: Z = (X - μ)/σ = (115 - 100)/15",
        "Z = 15/15 = 1",
        "P(X < 115) = P(Z < 1)",
        "From standard normal table: P(Z < 1) ≈ 0.8413"
      ],
      difficulty: "Advanced"
    }  ],
  integrals: [
    {
      id: 'int_1',
      problem: "∫ 2x dx",
      description: "Find the integral:",
      correctAnswer: "x² + C",
      steps: [
        "∫ 2x dx",
        "Apply power rule: ∫ x^n dx = x^(n+1)/(n+1) + C",
        "∫ 2x dx = 2 ∫ x dx",
        "= 2 × x²/2 + C",
        "= x² + C"
      ],
      difficulty: "Beginner"
    },
    {
      id: 'int_2',
      problem: "∫ (3x² + 4x - 1) dx",
      description: "Find the integral:",
      correctAnswer: "x³ + 2x² - x + C",
      steps: [
        "∫ (3x² + 4x - 1) dx",
        "Integrate term by term",
        "∫ 3x² dx + ∫ 4x dx - ∫ 1 dx",
        "= 3 × x³/3 + 4 × x²/2 - x + C",
        "= x³ + 2x² - x + C"
      ],
      difficulty: "Beginner"
    },
    {
      id: 'int_3',
      problem: "∫ x sin(x) dx",
      description: "Find the integral using integration by parts:",
      correctAnswer: "sin(x) - x cos(x) + C",
      steps: [
        "∫ x sin(x) dx",
        "Use integration by parts: ∫ u dv = uv - ∫ v du",
        "Let u = x, dv = sin(x) dx",
        "Then du = dx, v = -cos(x)",
        "∫ x sin(x) dx = x(-cos(x)) - ∫ (-cos(x)) dx",
        "= -x cos(x) + ∫ cos(x) dx",
        "= -x cos(x) + sin(x) + C",
        "= sin(x) - x cos(x) + C"
      ],
      difficulty: "Intermediate"
    },
    {
      id: 'int_4',
      problem: "∫ e^x cos(x) dx",
      description: "Find the integral using integration by parts:",
      correctAnswer: "(e^x/2)(sin(x) + cos(x)) + C",
      steps: [
        "∫ e^x cos(x) dx",
        "Use integration by parts twice",
        "Let u = e^x, dv = cos(x) dx",
        "du = e^x dx, v = sin(x)",
        "∫ e^x cos(x) dx = e^x sin(x) - ∫ e^x sin(x) dx",
        "For ∫ e^x sin(x) dx, use parts again:",
        "u = e^x, dv = sin(x) dx → du = e^x dx, v = -cos(x)",
        "∫ e^x sin(x) dx = -e^x cos(x) + ∫ e^x cos(x) dx",
        "Substituting back: ∫ e^x cos(x) dx = e^x sin(x) + e^x cos(x) - ∫ e^x cos(x) dx",
        "2∫ e^x cos(x) dx = e^x(sin(x) + cos(x))",
        "∫ e^x cos(x) dx = (e^x/2)(sin(x) + cos(x)) + C"
      ],
      difficulty: "Advanced"
    },
    {
      id: 'int_5',
      problem: "∫ 1/(x² + 4) dx",
      description: "Find the integral:",
      correctAnswer: "(1/2) arctan(x/2) + C",
      steps: [
        "∫ 1/(x² + 4) dx",
        "Recognize form: ∫ 1/(x² + a²) dx = (1/a) arctan(x/a) + C",
        "Here a² = 4, so a = 2",
        "∫ 1/(x² + 4) dx = (1/2) arctan(x/2) + C"
      ],
      difficulty: "Intermediate"
    },
    {
      id: 'int_6',
      problem: "∫ x²/(x³ + 1) dx",
      description: "Find the integral using substitution:",
      correctAnswer: "(1/3) ln|x³ + 1| + C",
      steps: [
        "∫ x²/(x³ + 1) dx",
        "Use substitution: let u = x³ + 1",
        "Then du = 3x² dx, so x² dx = du/3",
        "∫ x²/(x³ + 1) dx = ∫ (1/u)(du/3)",
        "= (1/3) ∫ 1/u du",
        "= (1/3) ln|u| + C",
        "= (1/3) ln|x³ + 1| + C"
      ],
      difficulty: "Advanced"
    }
  ]
};

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
    const { topic, difficulty } = await req.json();
    
    if (!topic || !exerciseProblems[topic]) {
      return new Response(
        JSON.stringify({ error: 'Invalid topic' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Get problems from topic and filter by difficulty if specified
    const topicProblems = exerciseProblems[topic];
    let filteredProblems = topicProblems;
    
    if (difficulty) {
      filteredProblems = topicProblems.filter(problem => problem.difficulty === difficulty);
      
      // If no problems found for the difficulty, fall back to all problems
      if (filteredProblems.length === 0) {
        console.warn(`No problems found for difficulty "${difficulty}" in topic "${topic}", using all problems`);
        filteredProblems = topicProblems;
      }
    }

    // Get random problem from filtered problems
    const randomIndex = Math.floor(Math.random() * filteredProblems.length);
    const selectedProblem = filteredProblems[randomIndex];

    // Generate session ID
    const sessionId = crypto.randomUUID();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store session in database
    const { data: sessionData, error: sessionError } = await supabase
      .from('math_sessions')
      .insert({
        session_id: sessionId,
        problem_id: selectedProblem.id,
        topic: topic,
        problem_data: selectedProblem,
        current_step: 0,
        is_completed: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }), 
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    // Return problem data without revealing steps
    const response = {
      sessionId: sessionId,
      problemId: selectedProblem.id,
      problem: selectedProblem.problem,
      description: selectedProblem.description,
      difficulty: selectedProblem.difficulty,
      topic: topic,
      totalSteps: selectedProblem.steps.length
    };

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
