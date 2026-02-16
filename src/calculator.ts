export type Operator = "+" | "-" | "*" | "/" | "^";

export interface CalculatorState {
  display: string;
  previousOperand: string;
  currentOperand: string;
  operator: Operator | null;
  shouldResetDisplay: boolean;
}

export function createInitialState(): CalculatorState {
  return {
    display: "0",
    previousOperand: "",
    currentOperand: "0",
    operator: null,
    shouldResetDisplay: false,
  };
}

export function appendDigit(
  state: CalculatorState,
  digit: string
): CalculatorState {
  if (state.shouldResetDisplay) {
    return {
      ...state,
      currentOperand: digit,
      display: digit,
      shouldResetDisplay: false,
    };
  }

  const newOperand =
    state.currentOperand === "0" ? digit : state.currentOperand + digit;

  return {
    ...state,
    currentOperand: newOperand,
    display: newOperand,
  };
}

export function appendDecimal(state: CalculatorState): CalculatorState {
  if (state.shouldResetDisplay) {
    return {
      ...state,
      currentOperand: "0.",
      display: "0.",
      shouldResetDisplay: false,
    };
  }

  if (state.currentOperand.includes(".")) return state;

  const newOperand = state.currentOperand + ".";
  return {
    ...state,
    currentOperand: newOperand,
    display: newOperand,
  };
}

export function setOperator(
  state: CalculatorState,
  op: Operator
): CalculatorState {
  if (state.operator && !state.shouldResetDisplay) {
    const result = evaluate(state);
    return {
      ...result,
      operator: op,
      previousOperand: result.currentOperand,
      shouldResetDisplay: true,
    };
  }

  return {
    ...state,
    operator: op,
    previousOperand: state.currentOperand,
    shouldResetDisplay: true,
  };
}

export function evaluate(state: CalculatorState): CalculatorState {
  if (!state.operator || !state.previousOperand) return state;

  const prev = parseFloat(state.previousOperand);
  const curr = parseFloat(state.currentOperand);
  let result: number;

  switch (state.operator) {
    case "+":
      result = prev + curr;
      break;
    case "-":
      result = prev - curr;
      break;
    case "*":
      result = prev * curr;
      break;
    case "/":
      result = curr === 0 ? NaN : prev / curr;
      break;
    case "^":
      result = Math.pow(prev, curr);
      break;
  }

  const display = isNaN(result) ? "Error" : String(result);

  return {
    display,
    currentOperand: display,
    previousOperand: "",
    operator: null,
    shouldResetDisplay: true,
  };
}

export function clear(): CalculatorState {
  return createInitialState();
}

export function toggleSign(state: CalculatorState): CalculatorState {
  if (state.currentOperand === "0") return state;

  const newOperand = state.currentOperand.startsWith("-")
    ? state.currentOperand.slice(1)
    : "-" + state.currentOperand;

  return {
    ...state,
    currentOperand: newOperand,
    display: newOperand,
  };
}

export function percentage(state: CalculatorState): CalculatorState {
  const value = parseFloat(state.currentOperand) / 100;
  const display = String(value);

  return {
    ...state,
    currentOperand: display,
    display,
  };
}

export function applyScientific(
  state: CalculatorState,
  fn: string
): CalculatorState {
  const value = parseFloat(state.currentOperand);
  let result: number;

  switch (fn) {
    case "sin":
      result = Math.sin(value);
      break;
    case "cos":
      result = Math.cos(value);
      break;
    case "tan":
      result = Math.tan(value);
      break;
    case "ln":
      result = value <= 0 ? NaN : Math.log(value);
      break;
    case "log":
      result = value <= 0 ? NaN : Math.log10(value);
      break;
    case "sqrt":
      result = value < 0 ? NaN : Math.sqrt(value);
      break;
    case "square":
      result = value * value;
      break;
    default:
      return state;
  }

  const display = isNaN(result) ? "Error" : String(result);

  return {
    ...state,
    currentOperand: display,
    display,
    shouldResetDisplay: true,
  };
}
