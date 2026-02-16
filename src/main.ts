import {
  type CalculatorState,
  type Operator,
  createInitialState,
  appendDigit,
  appendDecimal,
  setOperator,
  evaluate,
  clear,
  toggleSign,
  percentage,
  applyScientific,
} from "./calculator";

let state: CalculatorState = createInitialState();
let activeOperator: string | null = null;

const display = document.getElementById("display")!;
const calculator = document.querySelector(".calculator")!;
const modeToggle = document.getElementById("mode-toggle")!;

function updateDisplay() {
  display.textContent = formatDisplay(state.display);

  document.querySelectorAll(".btn-operator").forEach((btn) => {
    const value = (btn as HTMLElement).dataset.value;
    btn.classList.toggle("active", value === activeOperator);
  });
}

function formatDisplay(value: string): string {
  if (value === "Error") return value;

  const num = parseFloat(value);
  if (isNaN(num)) return value;

  if (value.endsWith(".") || value.endsWith(".0")) return value;

  if (Math.abs(num) >= 1e12) return num.toExponential(4);

  return value;
}

function handleAction(action: string, value?: string) {
  switch (action) {
    case "digit":
      state = appendDigit(state, value!);
      activeOperator = null;
      break;
    case "decimal":
      state = appendDecimal(state);
      activeOperator = null;
      break;
    case "operator":
      state = setOperator(state, value! as Operator);
      activeOperator = value!;
      break;
    case "equals":
      state = evaluate(state);
      activeOperator = null;
      break;
    case "clear":
      state = clear();
      activeOperator = null;
      break;
    case "toggle-sign":
      state = toggleSign(state);
      break;
    case "percentage":
      state = percentage(state);
      break;
    case "scientific":
      state = applyScientific(state, value!);
      activeOperator = null;
      break;
  }
  updateDisplay();
}

// Mode toggle
modeToggle.addEventListener("click", () => {
  calculator.classList.toggle("scientific");
});

// Button click handler (covers both basic and scientific grids)
document.querySelectorAll(".buttons, .scientific-buttons").forEach((grid) => {
  grid.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("button");
    if (!btn) return;

    const action = btn.dataset.action!;
    const value = btn.dataset.value;
    handleAction(action, value);
  });
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    handleAction("digit", e.key);
  } else if (e.key === ".") {
    handleAction("decimal");
  } else if (e.key === "+" || e.key === "-") {
    handleAction("operator", e.key);
  } else if (e.key === "*") {
    handleAction("operator", "*");
  } else if (e.key === "/") {
    e.preventDefault();
    handleAction("operator", "/");
  } else if (e.key === "Enter" || e.key === "=") {
    handleAction("equals");
  } else if (e.key === "Escape") {
    handleAction("clear");
  } else if (e.key === "Backspace") {
    handleAction("clear");
  }
});
