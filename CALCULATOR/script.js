let display = document.getElementById('display');
let currentInput = '0';
let shouldResetDisplay = false;

function updateDisplay() {
    display.textContent = currentInput;
}

function appendToDisplay(value) {
    if (shouldResetDisplay) {
        currentInput = '0';
        shouldResetDisplay = false;
    }

    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else {
        // Prevent multiple operators in a row
        const lastChar = currentInput.slice(-1);
        const operators = ['+', '-', '*', '/'];
        
        if (operators.includes(value) && operators.includes(lastChar)) {
            currentInput = currentInput.slice(0, -1) + value;
        } else {
            currentInput += value;
        }
    }
    
    updateDisplay();
}

function clearDisplay() {
    currentInput = '0';
    shouldResetDisplay = false;
    updateDisplay();
}

function deleteLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

function calculate() {
    try {
        // Replace × with * for calculation
        let expression = currentInput.replace(/×/g, '*');
        
        // Remove any trailing operators
        expression = expression.replace(/[+\-*/]+$/, '');
        
        // Don't calculate if expression is empty or just a number
        if (!expression || !/[+\-*/]/.test(expression)) {
            return;
        }
        
        // Simple math parser instead of eval for safety
        let result = evaluateExpression(expression);
        
        // Handle division by zero and other edge cases
        if (!isFinite(result)) {
            currentInput = 'Error';
        } else {
            // Round to avoid floating point precision issues
            result = Math.round(result * 100000000) / 100000000;
            currentInput = result.toString();
        }
        
        shouldResetDisplay = true;
        updateDisplay();
    } catch (error) {
        currentInput = 'Error';
        shouldResetDisplay = true;
        updateDisplay();
    }
}

function evaluateExpression(expr) {
    // Simple expression evaluator
    // Handle order of operations: multiplication and division first
    let tokens = expr.match(/(\d+\.?\d*|[+\-*/])/g);
    if (!tokens) return 0;
    
    // Convert numbers
    for (let i = 0; i < tokens.length; i++) {
        if (!isNaN(tokens[i])) {
            tokens[i] = parseFloat(tokens[i]);
        }
    }
    
    // Handle multiplication and division first
    for (let i = 1; i < tokens.length; i += 2) {
        if (tokens[i] === '*') {
            tokens[i-1] = tokens[i-1] * tokens[i+1];
            tokens.splice(i, 2);
            i -= 2;
        } else if (tokens[i] === '/') {
            if (tokens[i+1] === 0) throw new Error('Division by zero');
            tokens[i-1] = tokens[i-1] / tokens[i+1];
            tokens.splice(i, 2);
            i -= 2;
        }
    }
    
    // Handle addition and subtraction
    for (let i = 1; i < tokens.length; i += 2) {
        if (tokens[i] === '+') {
            tokens[i-1] = tokens[i-1] + tokens[i+1];
            tokens.splice(i, 2);
            i -= 2;
        } else if (tokens[i] === '-') {
            tokens[i-1] = tokens[i-1] - tokens[i+1];
            tokens.splice(i, 2);
            i -= 2;
        }
    }
    
    return tokens[0];
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
        appendToDisplay(key);
    } else if (key === '.') {
        appendToDisplay('.');
    } else if (key === '+') {
        appendToDisplay('+');
    } else if (key === '-') {
        appendToDisplay('-');
    } else if (key === '*') {
        appendToDisplay('*');
    } else if (key === '/') {
        event.preventDefault(); // Prevent browser search
        appendToDisplay('/');
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

