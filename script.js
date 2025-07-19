let users = JSON.parse(localStorage.getItem("users")) || {};
let expenses = JSON.parse(localStorage.getItem("expenses")) || {};
let currentUser = localStorage.getItem("currentUser") || null;

document.addEventListener("DOMContentLoaded", () => {
  if (currentUser) {
    showMain();
  }
});

function signup() {
  const username = usernameInput().value;
  const password = passwordInput().value;

  if (users[username]) {
    showAuthMessage("User already exists.");
    return;
  }

  users[username] = password;
  localStorage.setItem("users", JSON.stringify(users));
  showAuthMessage("Sign up successful! Please login.");
}

function login() {
  const username = usernameInput().value;
  const password = passwordInput().value;

  if (users[username] && users[username] === password) {
    currentUser = username;
    localStorage.setItem("currentUser", currentUser);
    showMain();
  } else {
    showAuthMessage("Invalid credentials.");
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  location.reload();
}

function showAuthMessage(msg) {
  document.getElementById("auth-message").innerText = msg;
}

function showMain() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("main-section").style.display = "block";
  document.getElementById("currentUser").innerText = currentUser;
  renderTable();
  updateChart();
}

function usernameInput() {
  return document.getElementById("username");
}

function passwordInput() {
  return document.getElementById("password");
}

function addExpense() {
  const category = document.getElementById("category").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const comments = document.getElementById("comments").value.trim();

  if (!category || isNaN(amount)) {
    alert("Please enter valid category and amount.");
    return;
  }

  const time = new Date().toLocaleString();
  const userExpenses = expenses[currentUser] || [];

  userExpenses.unshift({
    id: Date.now(),
    category,
    amount,
    createdAt: time,
    updatedAt: time,
    comments
  });

  expenses[currentUser] = userExpenses;
  localStorage.setItem("expenses", JSON.stringify(expenses));

  renderTable();
  updateChart();

  document.getElementById("category").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("comments").value = "";
}

function renderTable() {
  const tableBody = document.getElementById("expenseTable");
  tableBody.innerHTML = "";

  (expenses[currentUser] || []).forEach(exp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${exp.category}</td>
      <td>${exp.amount}</td>
      <td>${exp.createdAt}</td>
      <td>${exp.updatedAt}</td>
      <td>${exp.comments}</td>
      <td>
        <button onclick="editExpense(${exp.id})">Edit</button>
        <button onclick="deleteExpense(${exp.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function editExpense(id) {
  const userExpenses = expenses[currentUser];
  const expense = userExpenses.find(e => e.id === id);

  const newCategory = prompt("Edit category:", expense.category);
  const newAmount = prompt("Edit amount:", expense.amount);
  const newComments = prompt("Edit comments:", expense.comments);

  if (newCategory && newAmount && !isNaN(parseFloat(newAmount))) {
    expense.category = newCategory;
    expense.amount = parseFloat(newAmount);
    expense.comments = newComments || "";
    expense.updatedAt = new Date().toLocaleString();

    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderTable();
    updateChart();
  }
}

function deleteExpense(id) {
  expenses[currentUser] = expenses[currentUser].filter(e => e.id !== id);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  renderTable();
  updateChart();
}

function updateChart() {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  const userExpenses = expenses[currentUser] || [];

  const totals = {};
  userExpenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals),
        backgroundColor: [
          "#f94144", "#f3722c", "#f9c74f", "#90be6d", "#43aa8b", "#577590"
        ]
      }]
    }
  });
}
