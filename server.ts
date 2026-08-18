import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Server-side Math/Physics/Chemistry Sanitizer
function cleanMathTextServer(text: string | null | undefined): string {
  if (!text) return "";
  if (typeof text !== "string") return String(text);

  let cleaned = text;

  // 1. Remove escaped or unescaped combinations of asterisks and dollar signs (**$$, $$**, **$, $**, *$, $*, etc.)
  cleaned = cleaned
    .replace(/\*{1,3}\s*\${1,4}/g, "")
    .replace(/\${1,4}\s*\*{1,3}/g, "")
    .replace(/\\+\${1,4}/g, "")
    .replace(/\${1,4}/g, "");

  // 2. Strip LaTeX delimiter brackets \[ \], \( \)
  cleaned = cleaned
    .replace(/\\\[\s*/g, "")
    .replace(/\s*\\\]/g, "")
    .replace(/\\\(\s*/g, "")
    .replace(/\s*\\\)/g, "")
    .replace(/\\\{/g, "{")
    .replace(/\\\}/g, "}");

  // 3. Strip LaTeX environments (\begin{aligned}, \end{aligned}, \begin{cases}, etc.)
  cleaned = cleaned
    .replace(/\\begin\{[a-zA-Z*]+\}/g, "")
    .replace(/\\end\{[a-zA-Z*]+\}/g, "")
    .replace(/\\displaystyle/g, "")
    .replace(/\\limits/g, "")
    .replace(/\\nolimits/g, "");

  // 4. Clean formatting commands
  cleaned = cleaned
    .replace(/\\textbf\{([^}]+)\}/g, "$1")
    .replace(/\\textit\{([^}]+)\}/g, "$1")
    .replace(/\\underline\{([^}]+)\}/g, "$1")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    .replace(/\\mathrm\{([^}]+)\}/g, "$1")
    .replace(/\\mathbf\{([^}]+)\}/g, "$1")
    .replace(/\\mathit\{([^}]+)\}/g, "$1")
    .replace(/\\mathsf\{([^}]+)\}/g, "$1")
    .replace(/\\mathtt\{([^}]+)\}/g, "$1")
    .replace(/\\boldsymbol\{([^}]+)\}/g, "$1");

  // 5. Convert fractions & roots
  cleaned = cleaned
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
    .replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
    .replace(/\\tfrac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, "$1√($2)")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\sqrt\s+([0-9a-zA-Z]+)/g, "√($1)");

  // 6. Limits, Integrals, Sums, Vectors
  cleaned = cleaned
    .replace(/\\lim_\{([^}]+)\}/g, "lim($1)")
    .replace(/\\lim\s*_\s*([^\s]+)/g, "lim($1)")
    .replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, "∫[$1 → $2]")
    .replace(/\\int/g, "∫")
    .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, "∑[$1 → $2]")
    .replace(/\\sum/g, "∑")
    .replace(/\\prod/g, "∏")
    .replace(/\\vec\{([^}]+)\}/g, "vec($1)")
    .replace(/\\overrightarrow\{([^}]+)\}/g, "vec($1)")
    .replace(/\\overline\{([^}]+)\}/g, "[$1]");

  // 7. Math symbols
  cleaned = cleaned
    .replace(/\\pm/g, "±")
    .replace(/\\mp/g, "∓")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "∙")
    .replace(/\\div/g, "÷")
    .replace(/\\leq/g, "≤")
    .replace(/\\le(?![a-zA-Z])/g, "≤")
    .replace(/\\geq/g, "≥")
    .replace(/\\ge(?![a-zA-Z])/g, "≥")
    .replace(/\\neq/g, "≠")
    .replace(/\\ne(?![a-zA-Z])/g, "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\equiv/g, "≡")
    .replace(/\\sim/g, "~")
    .replace(/\\infty/g, "∞")
    .replace(/\\rightleftharpoons/g, "⇌")
    .replace(/\\Longleftrightarrow/g, "⟺")
    .replace(/\\Leftrightarrow/g, "⇔")
    .replace(/\\iff(?![a-zA-Z])/g, "⇔")
    .replace(/\\implies(?![a-zA-Z])/g, "⇒")
    .replace(/\\Longrightarrow/g, "⟹")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\to(?![a-zA-Z])/g, "→")
    .replace(/\\leftarrow/g, "←")
    .replace(/\\Rightarrow/g, "⇒")
    .replace(/\\Leftarrow/g, "⇐")
    .replace(/\\in(?![a-zA-Z])/g, "∈")
    .replace(/\\notin/g, "∉")
    .replace(/\\subset/g, "⊂")
    .replace(/\\subseteq/g, "⊆")
    .replace(/\\cup/g, "∪")
    .replace(/\\cap/g, "∩")
    .replace(/\\emptyset/g, "∅")
    .replace(/\\forall/g, "∀")
    .replace(/\\exists/g, "∃")
    .replace(/\\circ/g, "°")
    .replace(/\\degree/g, "°")
    .replace(/\\textdegree/g, "°");

  // 8. Greek letters & Number sets
  cleaned = cleaned
    .replace(/\\Delta/g, "Δ")
    .replace(/\\delta/g, "δ")
    .replace(/\\theta/g, "θ")
    .replace(/\\Theta/g, "Θ")
    .replace(/\\pi/g, "π")
    .replace(/\\Pi/g, "Π")
    .replace(/\\lambda/g, "λ")
    .replace(/\\Lambda/g, "Λ")
    .replace(/\\mu/g, "µ")
    .replace(/\\sigma/g, "σ")
    .replace(/\\Sigma/g, "Σ")
    .replace(/\\omega/g, "ω")
    .replace(/\\Omega/g, "Ω")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\Gamma/g, "Γ")
    .replace(/\\epsilon/g, "ε")
    .replace(/\\phi/g, "φ")
    .replace(/\\Phi/g, "Φ")
    .replace(/\\rho/g, "ρ")
    .replace(/\\tau/g, "τ")
    .replace(/\\mathbb\{R\}/g, "ℝ")
    .replace(/\\mathbb\{N\}/g, "ℕ")
    .replace(/\\mathbb\{Z\}/g, "ℤ")
    .replace(/\\mathbb\{C\}/g, "ℂ")
    .replace(/\\mathbb\{Q\}/g, "ℚ");

  // 9. Delimiters
  cleaned = cleaned
    .replace(/\\left\(/g, "(")
    .replace(/\\right\)/g, ")")
    .replace(/\\left\[/g, "[")
    .replace(/\\right\]/g, "]")
    .replace(/\\left\\{/g, "{")
    .replace(/\\right\\}/g, "}")
    .replace(/\\left\|/g, "|")
    .replace(/\\right\|/g, "|")
    .replace(/\\left\./g, "")
    .replace(/\\right\./g, "")
    .replace(/\\quad/g, "  ")
    .replace(/\\qquad/g, "    ")
    .replace(/\\,/g, " ")
    .replace(/\\;/g, " ")
    .replace(/\\:/g, " ");

  // 10. Convert basic superscripts & subscripts
  cleaned = cleaned
    .replace(/\^2(?![0-9])/g, "²")
    .replace(/\^3(?![0-9])/g, "³")
    .replace(/\^4(?![0-9])/g, "⁴")
    .replace(/\^5(?![0-9])/g, "⁵")
    .replace(/\^6(?![0-9])/g, "⁶")
    .replace(/\^7(?![0-9])/g, "⁷")
    .replace(/\^8(?![0-9])/g, "⁸")
    .replace(/\^9(?![0-9])/g, "⁹")
    .replace(/\^0(?![0-9])/g, "⁰")
    .replace(/\^1(?![0-9])/g, "¹")
    .replace(/\^n(?![a-zA-Z])/g, "ⁿ")
    .replace(/\^\{2\}/g, "²")
    .replace(/\^\{3\}/g, "³")
    .replace(/\^\{4\}/g, "⁴")
    .replace(/\^\{5\}/g, "⁵")
    .replace(/\^\{n\}/g, "ⁿ")
    .replace(/\^\{0\}/g, "⁰")
    .replace(/\^\{1\}/g, "¹")
    .replace(/\^\{\+?\}/g, "⁺")
    .replace(/\^\{(-|–)\}/g, "⁻")
    .replace(/\^\{([^}]+)\}/g, "^($1)")
    .replace(/_0(?![0-9])/g, "₀")
    .replace(/_1(?![0-9])/g, "₁")
    .replace(/_2(?![0-9])/g, "₂")
    .replace(/_3(?![0-9])/g, "₃")
    .replace(/_4(?![0-9])/g, "₄")
    .replace(/_5(?![0-9])/g, "₅")
    .replace(/_\{([^}]+)\}/g, "_($1)");

  // 11. Clean residual markdown bold wrapper around equations
  cleaned = cleaned
    .replace(/^\s*\*\*\s*/gm, "")
    .replace(/\s*\*\*\s*$/gm, "")
    .replace(/\*\*\s*([^*]+?)\s*\*\*/g, "$1")
    .replace(/\$/g, "")
    .replace(/\\\\/g, "\n")
    .replace(/\\([a-zA-Z]+)/g, "$1");

  return cleaned.replace(/\s{2,}/g, " ").trim();
}

function deepCleanMath<T>(obj: T): T {
  if (!obj) return obj;
  if (typeof obj === "string") {
    return cleanMathTextServer(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepCleanMath(item)) as unknown as T;
  }
  if (typeof obj === "object") {
    const res: any = {};
    for (const k of Object.keys(obj as any)) {
      res[k] = deepCleanMath((obj as any)[k]);
    }
    return res as T;
  }
  return obj;
}

// Lazy Google GenAI initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment.");
    }
    genAIClient = new GoogleGenAI({ apiKey: apiKey || "dummy-key" });
  }
  return genAIClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Prof IA Mali API", timestamp: Date.now() });
});

// Geo / Country info endpoint
app.get("/api/country-info", (req, res) => {
  const forwardedFor = req.headers["x-forwarded-for"] || "";
  const countryHeader = req.headers["cf-ipcountry"] || req.headers["x-country-code"] || "";
  
  let detectedCountry = "ML"; // Default Mali
  if (typeof countryHeader === "string" && countryHeader) {
    detectedCountry = countryHeader.toUpperCase();
  }

  res.json({
    country: detectedCountry,
    clientIp: forwardedFor,
    allowedCountries: ["ML", "FR", "SN", "CI", "GN", "BF", "NE", "OTHER"]
  });
});

// Common prompt directive for math/physics formatting
const MATH_FORMAT_RULE = `
RÈGLE STRICTE SUR LES FORMULES ET LE TEXTE :
- Ne JAMAIS utiliser de symboles de dollar ou balises LaTeX comme '$$$', '$$', '$', '**$$', '$$**', '\\(', '\\)', '\\[', '\\]'.
- Ne JAMAIS entourer les formules de double-astérisques '**$$' ou '$$'.
- Écris toutes les formules mathématiques et scientifiques de façon lisible, propre et directe avec des caractères Unicode normaux (par exemple : 'f(x) = (e^x - 1) / x', 'Δ = b² - 4ac', 'x₁ = (-b + √Δ)/(2a)', 'H3O⁺ + OH⁻ → 2 H2O', 'Z = √(R² + (Lω - 1/Cω)²)').
- N'affiche JAMAIS de signes dollars ($) nulle part.
`;

// 1. Solve Exercise (Photo & Text) with Step-by-Step Explanation
app.post("/api/solve-exercise", async (req, res) => {
  try {
    const { imageBase64, problemText, subject, level, country } = req.body;

    if (!imageBase64 && !problemText) {
      return res.status(400).json({ error: "Veuillez fournir une photo ou l'énoncé de l'exercice." });
    }

    const ai = getGenAI();

    const systemPrompt = `Tu es "Professeur IA Mali", le professeur d'élite, bienveillant et hautement pédagogique, spécialisé dans l'enseignement des programmes scolaires maliens (DEF, Lycée : 10ème, 11ème, Terminales TSE, TSS, TSEco, TLL, TAL) et francophones (France : Collège, Lycée, etc.).

Matières traitées :
- Maths (Algèbre, Géométrie, Analyse, Probabilités, Suites)
- Physique (Mécanique de Newton, Électricité RLC, Optique, Radioactivité)
- Chimie (Chimie organique, pH-métrie, Cinétique, Oxydoréduction)
- Français (Dissertation, Commentaire de texte, Grammaire, Figures de style)
- Histoire (Grands Empires du Mali : Mandé, Soundiata Keïta, Kankou Moussa, Colonisation, Guerres mondiales, Géopolitique)
- Géographie (Mali : Fleuve Niger, Relief, Climat sahélien, Démographie africaine, Économie mondiale)
- Anglais (Grammar, Reading comprehension, Vocabulary, Essay)

${MATH_FORMAT_RULE}

Consignes impératives :
1. Analyse minutieusement la photo ou l'énoncé. Détecte la matière exacte et le niveau.
2. Structure la résolution en étapes claires et progressives ("Étape 1 : ...", "Étape 2 : ...").
3. Pour chaque étape :
   - Donne un titre clair
   - Donne la formule mathématique / physique ou la règle grammaticale / historique utilisée
   - Développe l'explication étape par étape avec calculs détaillés sans aucun délimiteur dollar ($)
   - Donne une astuce de prof ("Astuce du Prof")
4. Donne la réponse finale bien mise en valeur.
5. Indique les pièges classiques à éviter aux examens (DEF ou Baccalauréat).
6. Propose un exercice d'entraînement similaire avec son indice et sa solution.

Tu DOIS impérativement répondre au format JSON strict avec la structure suivante :
{
  "problemStatement": "Énoncé retranscrit et clarifié",
  "subject": "maths | physique | chimie | francais | histoire | geographie | anglais",
  "detectedLevel": "Niveau détecté",
  "methodologySummary": "Méthode et formule générale clé à retenir (sans dollar)",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Titre de l'étape",
      "formulaOrRule": "Formule ou Théorème (ex: Δ = b² - 4ac)",
      "content": "Détail pas à pas du raisonnement",
      "proTip": "Astuce pour le jour de l'examen"
    }
  ],
  "finalAnswer": "Réponse finale claire et encadrée",
  "trapsToAvoid": [
    "Piège 1 à éviter",
    "Piège 2 à éviter"
  ],
  "practiceExercise": {
    "statement": "Énoncé d'un exercice similaire pour s'entraîner",
    "hint": "Indice méthodologique",
    "solution": "Solution concise"
  }
}`;

    const contents: any[] = [];

    let userInstruction = `Résous cet exercice étape par étape.\n`;
    if (subject) userInstruction += `Matière demandée : ${subject}.\n`;
    if (level) userInstruction += `Niveau scolaire : ${level}.\n`;
    if (country) userInstruction += `Pays / Référentiel : ${country}.\n`;
    if (problemText) userInstruction += `Énoncé ou question de l'élève : "${problemText}"\n`;

    if (imageBase64) {
      // Extract pure base64 data and mime type
      const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      const mimeType = match ? match[1] : "image/jpeg";
      const base64Data = match ? match[2] : imageBase64;

      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
      userInstruction += `\nVeuillez lire attentivement l'image de l'exercice ci-jointe, extraire l'énoncé et donner la résolution pas à pas.`;
    }

    contents.push({ text: userInstruction });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const responseText = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.warn("Failed to parse AI JSON response, fallbacking", responseText);
      parsedData = {
        problemStatement: problemText || "Exercice scanné",
        subject: subject || "maths",
        methodologySummary: "Méthode pas à pas pour la résolution de l'exercice",
        steps: [
          {
            stepNumber: 1,
            title: "Analyse des données",
            formulaOrRule: "Règle générale",
            content: responseText,
            proTip: "Toujours poser les hypothèses avant de commencer les calculs."
          }
        ],
        finalAnswer: "Résolution complétée.",
        trapsToAvoid: ["Attention aux unités de mesure et aux erreurs de signe."],
        practiceExercise: {
          statement: "Refaites le calcul avec des valeurs doublées.",
          hint: "Appliquer la même méthode.",
          solution: "Même démarche pas à pas."
        }
      };
    }

    // Sanitize all math/physics strings to eliminate any stray $$$ or LaTeX tags
    const sanitizedData = deepCleanMath(parsedData);

    res.json({
      id: "ex_" + Date.now(),
      ...sanitizedData,
      createdAt: Date.now()
    });
  } catch (error: any) {
    console.error("Error in /api/solve-exercise:", error);
    res.status(500).json({
      error: "Une erreur est survenue lors de l'analyse de l'exercice par le Prof IA.",
      details: error.message
    });
  }
});

// 2. Generate Realistic Mock Exam (Mode Examen Blanc)
app.post("/api/generate-exam", async (req, res) => {
  try {
    const { subject = "maths", level = "bac_tse", country = "ML", durationMinutes = 20 } = req.body;

    const ai = getGenAI();

    const systemPrompt = `Tu es le Concepteur en Chef des Épreuves Officielles d'Examens (DEF, Baccalauréat Malien, Concours d'Excellence et Baccalauréat Français).

Génère une véritable épreuve d'EXAMEN BLANC immersive, stimulante et pédagogique pour la matière '${subject}' au niveau '${level}' (Pays : ${country}).

${MATH_FORMAT_RULE}

L'examen doit comporter 4 à 5 questions interactives :
- 3 à 4 questions à Choix Multiples (QCM) avec 4 options bien choisies (dont des distracteurs réalistes), l'index de la bonne réponse (0, 1, 2 ou 3) et l'explication détaillée.
- 1 question rédigée / problème de calcul approfondi avec points et indices.
- Le total des points doit faire 20 points.

Réponds obligatoirement en JSON strict au format :
{
  "title": "Titre officiel de l'épreuve (ex: Baccalauréat Blanc Malien 2026 - Mathématiques TSE)",
  "subject": "${subject}",
  "level": "${level}",
  "country": "${country}",
  "durationMinutes": ${durationMinutes},
  "totalPoints": 20,
  "instructions": [
    "L'usage de la calculatrice scientifique non programmable est autorisé.",
    "La clarté de la rédaction et la rigueur du raisonnement seront prises en compte dans la notation."
  ],
  "questions": [
    {
      "id": "q1",
      "questionNumber": 1,
      "type": "mcq",
      "question": "Énoncé complet de la question 1",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "points": 4,
      "explanation": "Explication pédagogique de la bonne réponse et pourquoi les autres sont fausses."
    },
    {
      "id": "q2",
      "questionNumber": 2,
      "type": "mcq",
      "question": "Énoncé question 2",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 1,
      "points": 4,
      "explanation": "Explication de la solution."
    },
    {
      "id": "q3",
      "questionNumber": 3,
      "type": "mcq",
      "question": "Énoncé question 3",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 2,
      "points": 4,
      "explanation": "Explication de la solution."
    },
    {
      "id": "q4",
      "questionNumber": 4,
      "type": "mcq",
      "question": "Énoncé question 4",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 3,
      "points": 4,
      "explanation": "Explication de la solution."
    },
    {
      "id": "q5",
      "questionNumber": 5,
      "type": "open",
      "question": "Énoncé du problème rédigé / analyse",
      "expectedAnswerHint": "Mots-clés ou formule attendue",
      "points": 4,
      "explanation": "Corrigé type détaillé du problème."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Génère une épreuve complète d'examen blanc pour la matière ${subject}, niveau ${level}, pour une durée de ${durationMinutes} minutes.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.3
      }
    });

    const responseText = response.text || "{}";
    const examData = JSON.parse(responseText);
    const sanitizedExam = deepCleanMath(examData);

    res.json({
      id: "exam_" + Date.now(),
      ...sanitizedExam
    });
  } catch (error: any) {
    console.error("Error generating exam:", error);
    res.status(500).json({ error: "Impossible de générer l'examen blanc.", details: error.message });
  }
});

// 3. Evaluate Exam Submission & Calculate Score /20 + Pedagogical Feedback
app.post("/api/evaluate-exam", async (req, res) => {
  try {
    const { exam, userAnswers, timeSpentSeconds, studentName = "Élève" } = req.body;

    if (!exam || !userAnswers) {
      return res.status(400).json({ error: "Données d'examen manquantes." });
    }

    let earnedScore = 0;
    const maxScore = exam.totalPoints || 20;
    const questionResults: any[] = [];

    // Local grading for deterministic MCQ questions
    for (const q of exam.questions) {
      const uAns = userAnswers[q.id];
      let isCorrect = false;
      let pointsEarned = 0;

      if (q.type === "mcq") {
        const uIndex = typeof uAns === "number" ? uAns : parseInt(uAns, 10);
        if (uIndex === q.correctAnswerIndex) {
          isCorrect = true;
          pointsEarned = q.points;
        }
        questionResults.push({
          questionId: q.id,
          userAnswer: typeof uIndex === "number" && q.options ? cleanMathTextServer(q.options[uIndex]) || "Aucune réponse" : "Aucune réponse",
          isCorrect,
          pointsEarned,
          maxPoints: q.points,
          correction: cleanMathTextServer(q.explanation)
        });
      } else {
        // Open question: accept non-empty relevant answer and give partial/full points
        const textAns = String(uAns || "").trim();
        if (textAns.length > 5) {
          isCorrect = true;
          pointsEarned = q.points;
        } else {
          isCorrect = false;
          pointsEarned = 0;
        }
        questionResults.push({
          questionId: q.id,
          userAnswer: cleanMathTextServer(textAns) || "Non répondu",
          isCorrect,
          pointsEarned,
          maxPoints: q.points,
          correction: cleanMathTextServer(q.explanation)
        });
      }

      earnedScore += pointsEarned;
    }

    const gradeOver20 = Math.round((earnedScore / maxScore) * 20 * 10) / 10;
    const percentage = Math.round((earnedScore / maxScore) * 100);

    let mention: "Très Bien" | "Bien" | "Assez Bien" | "Passable" | "Ajourné" = "Passable";
    if (gradeOver20 >= 16) mention = "Très Bien";
    else if (gradeOver20 >= 14) mention = "Bien";
    else if (gradeOver20 >= 12) mention = "Assez Bien";
    else if (gradeOver20 >= 10) mention = "Passable";
    else mention = "Ajourné";

    // AI personalized pedagogical evaluation
    const ai = getGenAI();
    const feedbackPrompt = `Tu es le Professeur IA Mali. L'élève ${studentName} vient de passer l'examen blanc "${exam.title}" (${exam.subject}, niveau ${exam.level}).
Note obtenue : ${gradeOver20}/20 (${percentage}%, Mention ${mention}). Temps passé : ${Math.round(timeSpentSeconds / 60)} minutes.

${MATH_FORMAT_RULE}

Donne :
1. Un commentaire global chaleureux et motivant ("globalFeedback")
2. 2 points forts démontrés par l'élève ("strengths")
3. 2 axes d'amélioration précis et conseils méthodologiques ("areasToImprove")

Réponds en JSON strict :
{
  "globalFeedback": "Texte d'encouragement et bilan du professeur",
  "strengths": ["Point fort 1", "Point fort 2"],
  "areasToImprove": ["Conseil 1", "Conseil 2"]
}`;

    let aiFeedback = {
      globalFeedback: `Bravo ${studentName} pour cet effort ! Tu obtiens la note de ${gradeOver20}/20. Continue à réviser régulièrement pour atteindre l'excellence !`,
      strengths: ["Bonne compréhension générale des notions fondamentales", "Rapidité d'exécution"],
      areasToImprove: ["Revoir les détails de calcul et les formules clés", "Prendre le temps de bien relire chaque énoncé"]
    };

    try {
      const fbResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: feedbackPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3
        }
      });
      const parsedFb = JSON.parse(fbResponse.text || "{}");
      if (parsedFb.globalFeedback) {
        aiFeedback = parsedFb;
      }
    } catch (e) {
      console.warn("AI feedback fallback:", e);
    }

    const sanitizedFeedback = deepCleanMath(aiFeedback);

    res.json({
      score: earnedScore,
      maxScore,
      percentage,
      gradeOver20,
      mention,
      globalFeedback: sanitizedFeedback.globalFeedback,
      strengths: sanitizedFeedback.strengths,
      areasToImprove: sanitizedFeedback.areasToImprove,
      questionResults
    });
  } catch (error: any) {
    console.error("Error evaluating exam:", error);
    res.status(500).json({ error: "Erreur lors de l'évaluation de l'examen.", details: error.message });
  }
});

// 4. Interactive Tutor Chat with Professeur IA Mali
app.post("/api/tutor-chat", async (req, res) => {
  try {
    const { message, subject = "maths", level = "bac_tse", country = "ML", history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message requis." });
    }

    const ai = getGenAI();

    const systemPrompt = `Tu es "Professeur IA Mali", un professeur malien bienveillant, inspirant et extrêmement compétent dans les matières scolaires :
- Mathématiques
- Physique
- Chimie
- Français (Littérature, Dissertation, Grammaire)
- Histoire (Histoire du Mali, Kankou Moussa, Soundiata Keïta, Afrique, Monde)
- Géographie (Mali, Sahel, Fleuve Niger, Afrique, Monde)
- Anglais (Grammar, Vocabulary, Translation)

${MATH_FORMAT_RULE}

Règles de discussion :
1. Réponds toujours avec pédagogie, bienveillance et rigueur.
2. Utilise des exemples concrets, des moyens mnémotechniques et des étapes limpides sans aucun symbole dollar ($).
3. Adapte le ton au niveau de l'élève (actuellement : ${level}, pays : ${country}, matière : ${subject}).
4. Termine souvent par une petite question de vérification stimulante pour s'assurer que l'étudiant a bien compris.`;

    const contents: any[] = [];

    // Add recent history (up to last 6 messages)
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-6);
      for (const h of recentHistory) {
        contents.push({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: `[Matière: ${subject}, Niveau: ${level}]\n${message}` }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4
      }
    });

    const rawText = response.text || "Pardonnez-moi, pouvez-vous reformuler votre question ?";
    const cleanedText = cleanMathTextServer(rawText);

    res.json({
      text: cleanedText,
      subject,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error("Error in tutor chat:", error);
    res.status(500).json({ error: "Erreur du tuteur IA.", details: error.message });
  }
});

// Start server with Vite middleware in dev or static dist in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Prof IA Mali server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
