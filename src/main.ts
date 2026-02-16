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
import {
  extractVariables,
  evaluateExpression,
  saveFormula,
  loadFormulas,
  deleteFormula,
} from "./formula";

let state: CalculatorState = createInitialState();
let activeOperator: string | null = null;
const history: CalculatorState[] = [];
const MAX_HISTORY = 100;

const display = document.getElementById("display")!;
const calculator = document.querySelector(".calculator")!;
const modeToggle = document.getElementById("mode-toggle")!;
const formulaToggle = document.getElementById("formula-toggle")!;
const formulaExpression = document.getElementById("formula-expression") as HTMLInputElement;
const formulaVariables = document.getElementById("formula-variables")!;
const formulaList = document.getElementById("formula-list")!;
const formulaEval = document.getElementById("formula-eval")!;
const formulaSave = document.getElementById("formula-save")!;
const undoBtn = document.getElementById("undo-btn")!;
const themeToggle = document.getElementById("theme-toggle")!;

function updateDisplay() {
  display.textContent = formatDisplay(state.display);

  document.querySelectorAll(".btn-operator").forEach((btn) => {
    const value = (btn as HTMLElement).dataset.value;
    btn.classList.toggle("active", value === activeOperator);
  });

  undoBtn.classList.toggle("disabled", history.length === 0);
}

function pushHistory() {
  history.push(state);
  if (history.length > MAX_HISTORY) {
    history.shift();
  }
}

function undo() {
  const prev = history.pop();
  if (prev) {
    state = prev;
    activeOperator = state.operator;
    updateDisplay();
  }
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
  if (action === "undo") {
    undo();
    return;
  }

  pushHistory();

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

// Formula mode toggle
formulaToggle.addEventListener("click", () => {
  calculator.classList.toggle("formula-mode");
  if (calculator.classList.contains("formula-mode")) {
    renderFormulaList();
  }
});

// Formula expression input - update variable fields on typing
formulaExpression.addEventListener("input", () => {
  const vars = extractVariables(formulaExpression.value);
  renderVariableInputs(vars);
});

function renderVariableInputs(vars: string[]) {
  formulaVariables.innerHTML = "";
  for (const v of vars) {
    const div = document.createElement("div");
    div.className = "formula-var";
    const label = document.createElement("label");
    label.textContent = v + " =";
    const input = document.createElement("input");
    input.type = "number";
    input.dataset.variable = v;
    input.placeholder = "0";
    div.appendChild(label);
    div.appendChild(input);
    formulaVariables.appendChild(div);
  }
}

function getVariableValues(): Record<string, number> {
  const values: Record<string, number> = {};
  formulaVariables.querySelectorAll("input").forEach((input) => {
    const name = (input as HTMLInputElement).dataset.variable!;
    const val = parseFloat((input as HTMLInputElement).value);
    values[name] = isNaN(val) ? 0 : val;
  });
  return values;
}

// Evaluate formula
formulaEval.addEventListener("click", () => {
  const expr = formulaExpression.value.trim();
  if (!expr) return;
  try {
    const values = getVariableValues();
    const result = evaluateExpression(expr, values);
    const resultStr = isNaN(result) ? "Error" : String(result);
    display.textContent = formatDisplay(resultStr);
    state = {
      ...state,
      display: resultStr,
      currentOperand: resultStr,
      shouldResetDisplay: true,
    };
  } catch {
    display.textContent = "Error";
  }
});

// Save formula
formulaSave.addEventListener("click", () => {
  const expr = formulaExpression.value.trim();
  if (!expr) return;
  const name = prompt("Formula name:");
  if (!name) return;
  const vars = extractVariables(expr);
  saveFormula({ name, expression: expr, variables: vars });
  renderFormulaList();
});

function renderFormulaList() {
  const formulas = loadFormulas();
  formulaList.innerHTML = "";
  for (const f of formulas) {
    const item = document.createElement("div");
    item.className = "formula-item";

    const nameSpan = document.createElement("span");
    nameSpan.className = "formula-item-name";
    nameSpan.textContent = f.name;

    const exprSpan = document.createElement("span");
    exprSpan.className = "formula-item-expr";
    exprSpan.textContent = f.expression;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "formula-item-delete";
    deleteBtn.textContent = "\u00D7";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteFormula(f.name);
      renderFormulaList();
    });

    item.addEventListener("click", () => {
      formulaExpression.value = f.expression;
      renderVariableInputs(f.variables);
    });

    item.appendChild(nameSpan);
    item.appendChild(exprSpan);
    item.appendChild(deleteBtn);
    formulaList.appendChild(item);
  }
}

// Undo button
undoBtn.addEventListener("click", () => {
  handleAction("undo");
});

// Theme toggle
themeToggle.addEventListener("click", () => {
  calculator.classList.toggle("pixel");
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
  } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    handleAction("undo");
  }
});
