import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  tokenize,
  extractVariables,
  evaluateExpression,
  saveFormula,
  loadFormulas,
  deleteFormula,
} from "../formula";

// Mock localStorage for Node.js test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

describe("formula", () => {
  describe("tokenize", () => {
    it("tokenizes numbers", () => {
      const tokens = tokenize("42");
      expect(tokens).toEqual([{ type: "number", value: 42 }]);
    });

    it("tokenizes decimal numbers", () => {
      const tokens = tokenize("3.14");
      expect(tokens).toEqual([{ type: "number", value: 3.14 }]);
    });

    it("tokenizes variables", () => {
      const tokens = tokenize("x");
      expect(tokens).toEqual([{ type: "variable", name: "x" }]);
    });

    it("tokenizes multi-character variables", () => {
      const tokens = tokenize("rate");
      expect(tokens).toEqual([{ type: "variable", name: "rate" }]);
    });

    it("tokenizes operators", () => {
      const tokens = tokenize("x + y");
      expect(tokens).toEqual([
        { type: "variable", name: "x" },
        { type: "operator", value: "+" },
        { type: "variable", name: "y" },
      ]);
    });

    it("tokenizes parentheses", () => {
      const tokens = tokenize("(x)");
      expect(tokens).toEqual([
        { type: "paren", value: "(" },
        { type: "variable", name: "x" },
        { type: "paren", value: ")" },
      ]);
    });

    it("recognizes built-in functions", () => {
      const tokens = tokenize("sin(x)");
      expect(tokens).toEqual([
        { type: "function", name: "sin" },
        { type: "paren", value: "(" },
        { type: "variable", name: "x" },
        { type: "paren", value: ")" },
      ]);
    });

    it("throws on unexpected characters", () => {
      expect(() => tokenize("x @ y")).toThrow("Unexpected character: @");
    });
  });

  describe("extractVariables", () => {
    it("extracts single variable", () => {
      expect(extractVariables("x * 2")).toEqual(["x"]);
    });

    it("extracts multiple variables sorted", () => {
      expect(extractVariables("y + x * z")).toEqual(["x", "y", "z"]);
    });

    it("deduplicates variables", () => {
      expect(extractVariables("x + x")).toEqual(["x"]);
    });

    it("ignores function names", () => {
      expect(extractVariables("sin(x) + cos(y)")).toEqual(["x", "y"]);
    });

    it("returns empty for invalid expressions", () => {
      expect(extractVariables("@@@")).toEqual([]);
    });

    it("returns empty for pure numbers", () => {
      expect(extractVariables("2 + 3")).toEqual([]);
    });
  });

  describe("evaluateExpression", () => {
    it("evaluates simple addition", () => {
      expect(evaluateExpression("2 + 3", {})).toBe(5);
    });

    it("evaluates subtraction", () => {
      expect(evaluateExpression("10 - 4", {})).toBe(6);
    });

    it("evaluates multiplication", () => {
      expect(evaluateExpression("6 * 7", {})).toBe(42);
    });

    it("evaluates division", () => {
      expect(evaluateExpression("15 / 3", {})).toBe(5);
    });

    it("handles operator precedence", () => {
      expect(evaluateExpression("2 + 3 * 4", {})).toBe(14);
    });

    it("handles parentheses", () => {
      expect(evaluateExpression("(2 + 3) * 4", {})).toBe(20);
    });

    it("evaluates with variables", () => {
      expect(evaluateExpression("x * 2 + y", { x: 5, y: 3 })).toBe(13);
    });

    it("evaluates power operator", () => {
      expect(evaluateExpression("2 ^ 10", {})).toBe(1024);
    });

    it("evaluates nested functions", () => {
      expect(evaluateExpression("sqrt(9)", {})).toBe(3);
    });

    it("evaluates sin(0)", () => {
      expect(evaluateExpression("sin(0)", {})).toBe(0);
    });

    it("evaluates cos(0)", () => {
      expect(evaluateExpression("cos(0)", {})).toBe(1);
    });

    it("evaluates ln(1)", () => {
      expect(evaluateExpression("ln(1)", {})).toBe(0);
    });

    it("evaluates log(100)", () => {
      expect(evaluateExpression("log(100)", {})).toBe(2);
    });

    it("evaluates abs(-5)", () => {
      expect(evaluateExpression("abs(-5)", {})).toBe(5);
    });

    it("returns NaN for division by zero", () => {
      expect(evaluateExpression("1 / 0", {})).toBeNaN();
    });

    it("returns NaN for sqrt of negative", () => {
      expect(evaluateExpression("sqrt(-1)", {})).toBeNaN();
    });

    it("returns NaN for ln(0)", () => {
      expect(evaluateExpression("ln(0)", {})).toBeNaN();
    });

    it("throws for undefined variable", () => {
      expect(() => evaluateExpression("x + 1", {})).toThrow(
        "Undefined variable: x"
      );
    });

    it("handles unary minus", () => {
      expect(evaluateExpression("-5", {})).toBe(-5);
    });

    it("handles complex expressions", () => {
      expect(
        evaluateExpression("(x + y) * z - 1", { x: 2, y: 3, z: 4 })
      ).toBe(19);
    });

    it("handles chained addition/subtraction left to right", () => {
      expect(evaluateExpression("10 - 3 - 2", {})).toBe(5);
    });

    it("handles right-associative power", () => {
      expect(evaluateExpression("2 ^ 3 ^ 2", {})).toBe(512);
    });
  });

  describe("formula storage", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("saves and loads a formula", () => {
      saveFormula({
        name: "double",
        expression: "x * 2",
        variables: ["x"],
      });
      const formulas = loadFormulas();
      expect(formulas).toHaveLength(1);
      expect(formulas[0].name).toBe("double");
      expect(formulas[0].expression).toBe("x * 2");
    });

    it("overwrites formula with same name", () => {
      saveFormula({
        name: "f",
        expression: "x + 1",
        variables: ["x"],
      });
      saveFormula({
        name: "f",
        expression: "x + 2",
        variables: ["x"],
      });
      const formulas = loadFormulas();
      expect(formulas).toHaveLength(1);
      expect(formulas[0].expression).toBe("x + 2");
    });

    it("deletes a formula", () => {
      saveFormula({
        name: "a",
        expression: "x",
        variables: ["x"],
      });
      saveFormula({
        name: "b",
        expression: "y",
        variables: ["y"],
      });
      deleteFormula("a");
      const formulas = loadFormulas();
      expect(formulas).toHaveLength(1);
      expect(formulas[0].name).toBe("b");
    });

    it("returns empty array when nothing saved", () => {
      expect(loadFormulas()).toEqual([]);
    });

    it("handles corrupted localStorage", () => {
      localStorage.setItem("gastown-calculator-formulas", "not-json");
      expect(loadFormulas()).toEqual([]);
    });
  });
});
