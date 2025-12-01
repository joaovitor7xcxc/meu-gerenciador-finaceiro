const mobileBtn = document.querySelector(".mobile-menu-btn");
const mobileMenu = document.querySelector(".mobile-menu");

mobileBtn.addEventListener("click", () => {
    mobileMenu.style.display =
        mobileMenu.style.display === "block" ? "none" : "block";
});

const successAlert = document.getElementById("successAlert");
const errorAlert = document.getElementById("errorAlert");

function showAlert(alertElement) {
    alertElement.style.display = "flex";
    setTimeout(() => {
        alertElement.style.display = "none";
    }, 3000);
}

let incomeTotal = 0;
let expenseTotal = 0;

const incomeDisplay = document.getElementById("totalIncome");
const expenseDisplay = document.getElementById("totalExpense");
const balanceDisplay = document.getElementById("totalBalance");

const transactionList = document.getElementById("transactionList");
const emptyState = document.getElementById("emptyState");

const form = document.getElementById("transactionForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

let transactions = [];

function loadData() {
    const data = JSON.parse(localStorage.getItem("transactions")) || [];
    const totals = JSON.parse(localStorage.getItem("totals")) || {
        income: 0,
        expense: 0
    };

    transactions = data;
    incomeTotal = totals.income;
    expenseTotal = totals.expense;

    if (transactions.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    transactions.forEach(t => {
        renderTransaction(t);
    });

    updateValues();
}
loadData();

function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("totals", JSON.stringify({
        income: incomeTotal,
        expense: expenseTotal
    }));
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;

    if (!title || !amount || !type) {
        showAlert(errorAlert);
        return;
    }

    const newTransaction = {
        id: Date.now(),
        title,
        amount,
        type
    };

    transactions.push(newTransaction);
    renderTransaction(newTransaction);

    if (type === "income") {
        incomeTotal += amount;
    } else {
        expenseTotal += amount;
    }

    updateValues();
    saveData();
    showAlert(successAlert);

    form.reset();
});

function renderTransaction(t) {
    emptyState.style.display = "none";

    const item = document.createElement("div");
    item.classList.add("transaction-item");
    item.dataset.id = t.id;

    Object.assign(item.style, {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        padding: "12px 15px",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
        fontSize: "15px"
    });

    const color = t.type === "income" ? "#1b8f3a" : "#c62828";
    const signal = t.type === "income" ? "+" : "-";

    item.innerHTML = `
        <span>${t.title}</span>
        <strong style="color: ${color}">${signal} R$ ${t.amount.toFixed(2)}</strong>
        <button class="delete-btn" style="
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #444;
        ">
            <i class="fas fa-trash"></i>
        </button>
    `;

    item.querySelector(".delete-btn").addEventListener("click", () => {
        removeTransaction(t.id);
    });

    transactionList.appendChild(item);
}

function removeTransaction(id) {
    const t = transactions.find(x => x.id === id);
    if (!t) return;

    if (t.type === "income") {
        incomeTotal -= t.amount;
    } else {
        expenseTotal -= t.amount;
    }

    transactions = transactions.filter(x => x.id !== id);

    const element = transactionList.querySelector(`[data-id="${id}"]`);
    if (element) element.remove();

    updateValues();
    saveData();

    if (transactions.length === 0) {
        emptyState.style.display = "block";
    }
}

function updateValues() {
    const balance = incomeTotal - expenseTotal;

    incomeDisplay.textContent = "R$ " + incomeTotal.toFixed(2);
    expenseDisplay.textContent = "R$ " + expenseTotal.toFixed(2);
    balanceDisplay.textContent = "R$ " + balance.toFixed(2);
}
