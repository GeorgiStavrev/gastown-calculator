import { describe, it, expect } from "vitest";
import {
  createInitialState,
  appendDigit,
  appendDecimal,
  setOperator,
  evaluate,
  clear,
  toggleSign,
  percentage,
  applyScientific,
} from "../calculator";

describe("calculator", () => {
  it("starts with 0", () => {
    const state = createInitialState();
    expect(state.display).toBe("0");
  });

  describe("appendDigit", () => {
    it("replaces initial 0", () => {
      const state = appendDigit(createInitialState(), "5");
      expect(state.display).toBe("5");
    });

    it("appends to existing digits", () => {
      let state = appendDigit(createInitialState(), "1");
      state = appendDigit(state, "2");
      expect(state.display).toBe("12");
    });

    it("resets display after operator", () => {
      let state = appendDigit(createInitialState(), "5");
      state = setOperator(state, "+");
      state = appendDigit(state, "3");
      expect(state.display).toBe("3");
    });
  });

  describe("appendDecimal", () => {
    it("adds decimal point", () => {
      const state = appendDecimal(createInitialState());
      expect(state.display).toBe("0.");
    });

    it("does not add duplicate decimal", () => {
      let state = appendDecimal(createInitialState());
      state = appendDecimal(state);
      expect(state.display).toBe("0.");
    });
  });

  describe("arithmetic", () => {
    it("adds two numbers", () => {
      let state = appendDigit(createInitialState(), "5");
      state = setOperator(state, "+");
      state = appendDigit(state, "3");
      state = evaluate(state);
      expect(state.display).toBe("8");
    });

    it("subtracts", () => {
      let state = appendDigit(createInitialState(), "9");
      state = setOperator(state, "-");
      state = appendDigit(state, "4");
      state = evaluate(state);
      expect(state.display).toBe("5");
    });

    it("multiplies", () => {
      let state = appendDigit(createInitialState(), "6");
      state = setOperator(state, "*");
      state = appendDigit(state, "7");
      state = evaluate(state);
      expect(state.display).toBe("42");
    });

    it("divides", () => {
      let state = appendDigit(createInitialState(), "8");
      state = setOperator(state, "/");
      state = appendDigit(state, "2");
      state = evaluate(state);
      expect(state.display).toBe("4");
    });

    it("shows Error on divide by zero", () => {
      let state = appendDigit(createInitialState(), "5");
      state = setOperator(state, "/");
      state = appendDigit(state, "0");
      state = evaluate(state);
      expect(state.display).toBe("Error");
    });

    it("chains operations", () => {
      let state = appendDigit(createInitialState(), "2");
      state = setOperator(state, "+");
      state = appendDigit(state, "3");
      state = setOperator(state, "*"); // evaluates 2+3=5, then sets *
      state = appendDigit(state, "4");
      state = evaluate(state);
      expect(state.display).toBe("20");
    });
  });

  describe("clear", () => {
    it("resets to initial state", () => {
      let state = appendDigit(createInitialState(), "5");
      state = setOperator(state, "+");
      state = clear();
      expect(state.display).toBe("0");
      expect(state.operator).toBeNull();
    });
  });

  describe("toggleSign", () => {
    it("negates positive number", () => {
      let state = appendDigit(createInitialState(), "5");
      state = toggleSign(state);
      expect(state.display).toBe("-5");
    });

    it("makes negative number positive", () => {
      let state = appendDigit(createInitialState(), "5");
      state = toggleSign(state);
      state = toggleSign(state);
      expect(state.display).toBe("5");
    });

    it("does nothing for zero", () => {
      const state = toggleSign(createInitialState());
      expect(state.display).toBe("0");
    });
  });

  describe("percentage", () => {
    it("divides by 100", () => {
      let state = appendDigit(createInitialState(), "5");
      state = appendDigit(state, "0");
      state = percentage(state);
      expect(state.display).toBe("0.5");
    });
  });

  describe("scientific functions", () => {
    it("sin(0) = 0", () => {
      const state = applyScientific(createInitialState(), "sin");
      expect(state.display).toBe("0");
    });

    it("cos(0) = 1", () => {
      const state = applyScientific(createInitialState(), "cos");
      expect(state.display).toBe("1");
    });

    it("tan(0) = 0", () => {
      const state = applyScientific(createInitialState(), "tan");
      expect(state.display).toBe("0");
    });

    it("ln(1) = 0", () => {
      let state = appendDigit(createInitialState(), "1");
      state = applyScientific(state, "ln");
      expect(state.display).toBe("0");
    });

    it("ln(0) = Error", () => {
      const state = applyScientific(createInitialState(), "ln");
      expect(state.display).toBe("Error");
    });

    it("log(100) = 2", () => {
      let state = appendDigit(createInitialState(), "1");
      state = appendDigit(state, "0");
      state = appendDigit(state, "0");
      state = applyScientific(state, "log");
      expect(state.display).toBe("2");
    });

    it("log(0) = Error", () => {
      const state = applyScientific(createInitialState(), "log");
      expect(state.display).toBe("Error");
    });

    it("sqrt(9) = 3", () => {
      let state = appendDigit(createInitialState(), "9");
      state = applyScientific(state, "sqrt");
      expect(state.display).toBe("3");
    });

    it("sqrt(-1) = Error", () => {
      let state = appendDigit(createInitialState(), "1");
      state = toggleSign(state);
      state = applyScientific(state, "sqrt");
      expect(state.display).toBe("Error");
    });

    it("square(5) = 25", () => {
      let state = appendDigit(createInitialState(), "5");
      state = applyScientific(state, "square");
      expect(state.display).toBe("25");
    });

    it("2^10 = 1024 (power operator)", () => {
      let state = appendDigit(createInitialState(), "2");
      state = setOperator(state, "^");
      state = appendDigit(state, "1");
      state = appendDigit(state, "0");
      state = evaluate(state);
      expect(state.display).toBe("1024");
    });

    it("0^0 = 1", () => {
      let state = setOperator(createInitialState(), "^");
      state = evaluate(state);
      expect(state.display).toBe("1");
    });
  });
});
