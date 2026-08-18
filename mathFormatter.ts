/**
 * Utility to clean and format mathematical, physical, and chemical expressions.
 * Completely eliminates unwanted LaTeX markers, dollar signs ($$$, $$, $, \$, \$$),
 * raw markdown artifact combinations (**$$, $$**, **$, $**, etc.),
 * LaTeX environments (\begin{...}, \end{...}), and transforms LaTeX commands
 * into clean, readable, professional Unicode typography.
 */

export function cleanMathText(text: string | null | undefined): string {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);

  let cleaned = text;

  // 1. Remove escaped or unescaped combinations of asterisks and dollar signs (**$$, $$**, **$, $**, *$, $*, etc.)
  cleaned = cleaned
    .replace(/\*{1,3}\s*\${1,4}/g, '')
    .replace(/\${1,4}\s*\*{1,3}/g, '')
    .replace(/\\+\${1,4}/g, '')
    .replace(/\${1,4}/g, '');

  // 2. Remove LaTeX brackets \[ \], \( \), and delimiter markers
  cleaned = cleaned
    .replace(/\\\[\s*/g, '')
    .replace(/\s*\\\]/g, '')
    .replace(/\\\(\s*/g, '')
    .replace(/\s*\\\)/g, '')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}');

  // 3. Strip LaTeX environments (\begin{aligned}, \end{aligned}, \begin{cases}, etc.)
  cleaned = cleaned
    .replace(/\\begin\{[a-zA-Z*]+\}/g, '')
    .replace(/\\end\{[a-zA-Z*]+\}/g, '')
    .replace(/\\displaystyle/g, '')
    .replace(/\\limits/g, '')
    .replace(/\\nolimits/g, '');

  // 4. Clean formatting commands (\text{...}, \textbf{...}, \mathrm{...}, etc.)
  cleaned = cleaned
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    .replace(/\\textit\{([^}]+)\}/g, '$1')
    .replace(/\\underline\{([^}]+)\}/g, '$1')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\mathit\{([^}]+)\}/g, '$1')
    .replace(/\\mathsf\{([^}]+)\}/g, '$1')
    .replace(/\\mathtt\{([^}]+)\}/g, '$1')
    .replace(/\\boldsymbol\{([^}]+)\}/g, '$1');

  // 5. Replace fractions: \frac{a}{b} -> (a / b)
  cleaned = cleaned
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\tfrac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');

  // 6. Replace square roots: \sqrt{x} -> √(x), \sqrt[n]{x} -> ⁿ√(x)
  cleaned = cleaned
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt\s+([0-9a-zA-Z]+)/g, '√($1)');

  // 7. Limits, Integrals, Sums
  cleaned = cleaned
    .replace(/\\lim_\{([^}]+)\}/g, 'lim($1)')
    .replace(/\\lim\s*_\s*([^\s]+)/g, 'lim($1)')
    .replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, '∫[$1 → $2]')
    .replace(/\\int/g, '∫')
    .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '∑[$1 → $2]')
    .replace(/\\sum/g, '∑')
    .replace(/\\prod/g, '∏');

  // 8. Vectors and overlines
  cleaned = cleaned
    .replace(/\\vec\{([^}]+)\}/g, 'vec($1)')
    .replace(/\\overrightarrow\{([^}]+)\}/g, 'vec($1)')
    .replace(/\\overline\{([^}]+)\}/g, '[$1]');

  // 9. Standard mathematical, logical and chemical symbols
  cleaned = cleaned
    .replace(/\\pm/g, '±')
    .replace(/\\mp/g, '∓')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '∙')
    .replace(/\\div/g, '÷')
    .replace(/\\leq/g, '≤')
    .replace(/\\le(?![a-zA-Z])/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\ge(?![a-zA-Z])/g, '≥')
    .replace(/\\neq/g, '≠')
    .replace(/\\ne(?![a-zA-Z])/g, '≠')
    .replace(/\\approx/g, '≈')
    .replace(/\\equiv/g, '≡')
    .replace(/\\sim/g, '~')
    .replace(/\\infty/g, '∞')
    .replace(/\\propto/g, '∝')
    .replace(/\\leftrightarrow/g, '↔')
    .replace(/\\rightleftharpoons/g, '⇌')
    .replace(/\\Longleftrightarrow/g, '⟺')
    .replace(/\\Leftrightarrow/g, '⇔')
    .replace(/\\iff(?![a-zA-Z])/g, '⇔')
    .replace(/\\implies(?![a-zA-Z])/g, '⇒')
    .replace(/\\Longrightarrow/g, '⟹')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\to(?![a-zA-Z])/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\Leftarrow/g, '⇐')
    .replace(/\\in(?![a-zA-Z])/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\subseteq/g, '⊆')
    .replace(/\\supset/g, '⊃')
    .replace(/\\cup/g, '∪')
    .replace(/\\cap/g, '∩')
    .replace(/\\emptyset/g, '∅')
    .replace(/\\forall/g, '∀')
    .replace(/\\exists/g, '∃')
    .replace(/\\partial/g, '∂')
    .replace(/\\nabla/g, '∇')
    .replace(/\\circ/g, '°')
    .replace(/\\degree/g, '°')
    .replace(/\\textdegree/g, '°');

  // 10. Greek letters
  cleaned = cleaned
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\Theta/g, 'Θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\Pi/g, 'Π')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\Lambda/g, 'Λ')
    .replace(/\\mu/g, 'µ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\Gamma/g, 'Γ')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\varepsilon/g, 'ε')
    .replace(/\\phi/g, 'φ')
    .replace(/\\Phi/g, 'Φ')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\tau/g, 'τ')
    .replace(/\\eta/g, 'η')
    .replace(/\\zeta/g, 'ζ')
    .replace(/\\chi/g, 'χ')
    .replace(/\\psi/g, 'ψ')
    .replace(/\\Psi/g, 'Ψ');

  // 11. Number sets: ℝ, ℕ, ℤ, ℂ, ℚ
  cleaned = cleaned
    .replace(/\\mathbb\{R\}/g, 'ℝ')
    .replace(/\\mathbb\{N\}/g, 'ℕ')
    .replace(/\\mathbb\{Z\}/g, 'ℤ')
    .replace(/\\mathbb\{C\}/g, 'ℂ')
    .replace(/\\mathbb\{Q\}/g, 'ℚ');

  // 12. Delimiters
  cleaned = cleaned
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    .replace(/\\left\\{/g, '{')
    .replace(/\\right\\}/g, '}')
    .replace(/\\left\|/g, '|')
    .replace(/\\right\|/g, '|')
    .replace(/\\left\./g, '')
    .replace(/\\right\./g, '')
    .replace(/\\quad/g, '  ')
    .replace(/\\qquad/g, '    ')
    .replace(/\\,/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\:/g, ' ');

  // 13. Convert basic superscripts
  cleaned = cleaned
    .replace(/\^2(?![0-9])/g, '²')
    .replace(/\^3(?![0-9])/g, '³')
    .replace(/\^4(?![0-9])/g, '⁴')
    .replace(/\^5(?![0-9])/g, '⁵')
    .replace(/\^6(?![0-9])/g, '⁶')
    .replace(/\^7(?![0-9])/g, '⁷')
    .replace(/\^8(?![0-9])/g, '⁸')
    .replace(/\^9(?![0-9])/g, '⁹')
    .replace(/\^0(?![0-9])/g, '⁰')
    .replace(/\^1(?![0-9])/g, '¹')
    .replace(/\^n(?![a-zA-Z])/g, 'ⁿ')
    .replace(/\^\{2\}/g, '²')
    .replace(/\^\{3\}/g, '³')
    .replace(/\^\{4\}/g, '⁴')
    .replace(/\^\{5\}/g, '⁵')
    .replace(/\^\{n\}/g, 'ⁿ')
    .replace(/\^\{0\}/g, '⁰')
    .replace(/\^\{1\}/g, '¹')
    .replace(/\^\{\+?\}/g, '⁺')
    .replace(/\^\{(-|–)\}/g, '⁻')
    .replace(/\^\{([^}]+)\}/g, '^($1)');

  // 14. Convert basic subscripts
  cleaned = cleaned
    .replace(/_0(?![0-9])/g, '₀')
    .replace(/_1(?![0-9])/g, '₁')
    .replace(/_2(?![0-9])/g, '₂')
    .replace(/_3(?![0-9])/g, '₃')
    .replace(/_4(?![0-9])/g, '₄')
    .replace(/_5(?![0-9])/g, '₅')
    .replace(/_\{0\}/g, '₀')
    .replace(/_\{1\}/g, '₁')
    .replace(/_\{2\}/g, '₂')
    .replace(/_\{3\}/g, '₃')
    .replace(/_\{4\}/g, '₄')
    .replace(/_\{5\}/g, '₅')
    .replace(/_\{([^}]+)\}/g, '_($1)');

  // 15. Clean any residual markdown double asterisks around standalone formulas/numbers
  // e.g. "** Δ = 5 **" -> "Δ = 5", "**Réponse :**" -> "Réponse :"
  cleaned = cleaned
    .replace(/^\s*\*\*\s*/gm, '') // leading ** on a line
    .replace(/\s*\*\*\s*$/gm, '') // trailing ** on a line
    .replace(/\*\*\s*([^*]+?)\s*\*\*/g, '$1'); // inner **text** -> text

  // 16. Remove residual stray dollar signs or backslashes
  cleaned = cleaned
    .replace(/\$/g, '')
    .replace(/\\\\/g, '\n')
    .replace(/\\([a-zA-Z]+)/g, '$1') // remove dangling LaTeX command prefixes
    .replace(/\s{2,}/g, ' ');

  return cleaned.trim();
}

/**
 * Deep sanitizes all string fields in an object (steps, finalAnswer, etc.)
 */
export function sanitizeMathObject<T>(obj: T): T {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return cleanMathText(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeMathObject(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj as any)) {
      result[key] = sanitizeMathObject((obj as any)[key]);
    }
    return result as T;
  }
  return obj;
}
