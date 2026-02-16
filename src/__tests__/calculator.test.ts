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
});
