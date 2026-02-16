export interface Formula {
  name: string;
  expression: string;
  variables: string[];
}

type Token =
  | { type: "number"; value: number }
  | { type: "variable"; name: string }
  | { type: "operator"; value: string }
  | { type: "paren"; value: "(" | ")" }
  | { type: "function"; name: string };

const FUNCTIONS = ["sin", "cos", "tan", "ln", "log", "sqrt", "abs"];

export function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const expr = expression.replace(/\s+/g, "");

  while (i < expr.length) {
    const ch = expr[i];

    if ((ch >= "0" && ch <= "9") || ch === ".") {
      let num = "";
      while (i < expr.length && ((expr[i] >= "0" && expr[i] <= "9") || expr[i] === ".")) {
        num += expr[i++];
      }
      tokens.push({ type: "number", value: parseFloat(num) });
      continue;
    }

    if ((ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_") {
      let name = "";
      while (
        i < expr.length &&
        ((expr[i] >= "a" && expr[i] <= "z") ||
          (expr[i] >= "A" && expr[i] <= "Z") ||
          (expr[i] >= "0" && expr[i] <= "9") ||
          expr[i] === "_")
      ) {
        name += expr[i++];
      }
      if (FUNCTIONS.includes(name)) {
        tokens.push({ type: "function", name });
      } else {
        tokens.push({ type: "variable", name });
      }
      continue;
    }

    if ("+-*/^".includes(ch)) {
      tokens.push({ type: "operator", value: ch });
      i++;
      continue;
    }

    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${ch}`);
  }

  return tokens;
}

export function extractVariables(expression: string): string[] {
  try {
    const tokens = tokenize(expression);
    const vars = new Set<string>();
    for (const token of tokens) {
      if (token.type === "variable") {
        vars.add(token.name);
      }
    }
    return Array.from(vars).sort();
  } catch {
    return [];
  }
}

export function evaluateExpression(
  expression: string,
  variables: Record<string, number>
): number {
  const tokens = tokenize(expression);
  let pos = 0;

  function peek(): Token | undefined {
    return tokens[pos];
  }

  function consume(): Token {
    return tokens[pos++];
  }

  function parseTerm(): number {
    let left = parsePower();
    while (
      peek()?.type === "operator" &&
      ((peek() as any).value === "*" || (peek() as any).value === "/")
    ) {
      const op = consume() as { type: "operator"; value: string };
      const right = parsePower();
      if (op.value === "*") left = left * right;
      else left = right === 0 ? NaN : left / right;
    }
    return left;
  }

  function parsePower(): number {
    let base = parseUnary();
    if (peek()?.type === "operator" && (peek() as any).value === "^") {
      consume();
      const exp = parsePower(); // right-associative
      base = Math.pow(base, exp);
    }
    return base;
  }

  function parseUnary(): number {
    if (peek()?.type === "operator" && (peek() as any).value === "-") {
      consume();
      return -parseUnary();
    }
    if (peek()?.type === "operator" && (peek() as any).value === "+") {
      consume();
      return parseUnary();
    }
    return parseAtom();
  }

  function parseAtom(): number {
    const token = peek();
    if (!token) throw new Error("Unexpected end of expression");

    if (token.type === "number") {
      consume();
      return token.value;
    }

    if (token.type === "variable") {
      consume();
      if (!(token.name in variables)) {
        throw new Error(`Undefined variable: ${token.name}`);
      }
      return variables[token.name];
    }

    if (token.type === "function") {
      consume();
      if (peek()?.type !== "paren" || (peek() as any).value !== "(") {
        throw new Error(`Expected ( after function ${token.name}`);
      }
      consume(); // (
      const arg = parseAddSub();
      if (peek()?.type !== "paren" || (peek() as any).value !== ")") {
        throw new Error(`Expected ) after function argument`);
      }
      consume(); // )
      return applyFunction(token.name, arg);
    }

    if (token.type === "paren" && token.value === "(") {
      consume();
      const result = parseAddSub();
      if (peek()?.type !== "paren" || (peek() as any).value !== ")") {
        throw new Error("Mismatched parentheses");
      }
      consume();
      return result;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }

  function applyFunction(name: string, value: number): number {
    switch (name) {
      case "sin": return Math.sin(value);
      case "cos": return Math.cos(value);
      case "tan": return Math.tan(value);
      case "ln": return value <= 0 ? NaN : Math.log(value);
      case "log": return value <= 0 ? NaN : Math.log10(value);
      case "sqrt": return value < 0 ? NaN : Math.sqrt(value);
      case "abs": return Math.abs(value);
      default: throw new Error(`Unknown function: ${name}`);
    }
  }

  function parseAddSub(): number {
    let left = parseTerm();
    while (
      peek()?.type === "operator" &&
      ((peek() as any).value === "+" || (peek() as any).value === "-")
    ) {
      const op = consume() as { type: "operator"; value: string };
      const right = parseTerm();
      if (op.value === "+") left = left + right;
      else left = left - right;
    }
    return left;
  }

  const result = parseAddSub();

  if (pos < tokens.length) {
    throw new Error("Unexpected tokens after expression");
  }

  return result;
}

const STORAGE_KEY = "gastown-calculator-formulas";

export function saveFormula(formula: Formula): void {
  const formulas = loadFormulas();
  const existing = formulas.findIndex((f) => f.name === formula.name);
  if (existing >= 0) {
    formulas[existing] = formula;
  } else {
    formulas.push(formula);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formulas));
}

export function loadFormulas(): Formula[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function deleteFormula(name: string): void {
  const formulas = loadFormulas().filter((f) => f.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formulas));
}
