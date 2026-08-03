// ===================================
// CrediLoan v3.0
// Part 1
// ===================================

import { login, logout } from "./auth.js"

import {
    saveTransaction,
    loadTransactions,
    updateTransaction,
    deleteTransaction,
    syncTransactions
} from "./firestore.js";

import {
    restoreTransactions
} from "./firestore.js";

// ----------------------
// APP DATA
// ----------------------

let transactions = [];
let editIndex = -1;

// ----------------------
// PIN LOCK
// ----------------------

let appPin = localStorage.getItem("appPin");

if (!appPin) {
    appPin = "1234";
    localStorage.setItem("appPin", appPin);
}

function checkPin() {

    const pin = document.getElementById("pinInput").value.trim();

console.log("Entered:", pin, "Saved:", appPin);

    if (pin === appPin) {

        document.getElementById("pinScreen")
            .style.display = "none";

        initApp();

    } else {

        alert("Wrong PIN");

    }

}

// ----------------------
// APP START
// ----------------------

async function initApp() {

    transactions = await loadTransactions();

    loadData();

}

// ----------------------
// SAVE
// ----------------------

async function saveNewTransaction() {

    const name =
        document.getElementById("name").value.trim();

    const amount =
        parseFloat(
            document.getElementById("amount").value
        );

    const paid =
        parseFloat(
            document.getElementById("paidAmount").value
        ) || 0;

    const type =
        document.getElementById("type").value;

    const due =
        document.getElementById("dueDate").value;

    const status =
        document.getElementById("status").value;

    const note =
        document.getElementById("note").value;

    if (name == "" || isNaN(amount)) {

        alert("Fill all required fields");

        return;

    }

    const item = {

        name,
        amount,
        paid,
        remaining: amount - paid,
        type,
        due,
        status,
        note,

        date: new Date().toISOString(),
time: new Date().toLocaleTimeString()

    };

    if (editIndex == -1) {

        await saveTransaction(item);

    } else {

        await updateTransaction(
            transactions[editIndex].id,
            item
        );

        editIndex = -1;

    }

    clearForm();

    transactions = await syncTransactions();
loadData();

}

// ----------------------
// CLEAR
// ----------------------

function clearForm() {

    document.getElementById("name").value = "";

    document.getElementById("amount").value = "";

    document.getElementById("paidAmount").value = "";

    document.getElementById("type").value = "Receive";

    document.getElementById("dueDate").value = "";

    document.getElementById("status").value = "Pending";

    document.getElementById("note").value = "";

}

// ===================================
// LOAD DATA
// ===================================

function loadData() {

    const history =
        document.getElementById("history");

    history.innerHTML = "";

    let receive = 0;
    let pay = 0;

    let today = 0;
    let week = 0;
    let month = 0;

    const now = new Date();

    transactions.forEach((item, index) => {

        if (item.type === "Receive") {

            receive += Number(item.remaining);

        } else {

            pay += Number(item.remaining);

        }

        const d = new Date(item.date);

        if (d.toDateString() === now.toDateString()) {

            today += Number(item.remaining);

        }

        const diff =
            Math.abs(now - d) /
            (1000 * 60 * 60 * 24);

        if (diff <= 7) {

            week += Number(item.remaining);

        }

        if (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
        ) {

            month += Number(item.remaining);

        }

        history.innerHTML += `

<div class="transaction">

<h3>${item.name}</h3>

<p><b>Type:</b> ${item.type}</p>

<p><b>Total:</b> Rs. ${item.amount}</p>

<p><b>Paid:</b> Rs. ${item.paid}</p>

<p><b>Remaining:</b> Rs. ${item.remaining}</p>

<p><b>Due:</b> ${item.due || "-"}</p>

<p><b>Status:</b> ${item.status}</p>

<p>${item.date} ${item.time}</p>

<p>${item.note}</p>

<div class="actions">

<button onclick="editTransaction(${index})">
Edit
</button>

<button onclick="removeTransaction(${index})">
Delete
</button>

</div>

</div>

`;

    });

    // Dashboard

    document.getElementById("totalReceive").innerHTML =
        "Rs. " + receive;

    document.getElementById("totalPay").innerHTML =
        "Rs. " + pay;

    document.getElementById("balance").innerHTML =
        "Rs. " + (receive - pay);

    // Reports

    document.getElementById("todayReport").innerHTML =
        "Rs. " + today;

    document.getElementById("weekReport").innerHTML =
        "Rs. " + week;

    document.getElementById("monthReport").innerHTML =
        "Rs. " + month;

    // Due Reminder

    transactions.forEach(item => {

        if (!item.due) return;

        const due = new Date(item.due);

        const todayDate = new Date();

        todayDate.setHours(0,0,0,0);
        due.setHours(0,0,0,0);

        if (
            item.status === "Pending" &&
            due <= todayDate
        ) {

            alert(
    "Reminder\n\n" +
    item.name +
    "\nDue Date: " +
    item.due
);

        }

    });

}

// ===================================
// SEARCH
// ===================================

function searchData(){

    const text =
        document
        .getElementById("search")
        .value
        .toLowerCase();

    const cards =
        document.querySelectorAll(".transaction");

    transactions.forEach((item,index)=>{

        cards[index].style.display =

        item.name
        .toLowerCase()
        .includes(text)

        ? "block"

        : "none";

    });

}

// ===================================
// EDIT
// ===================================

function editTransaction(index){

    const item = transactions[index];

    document.getElementById("name").value = item.name;
    document.getElementById("amount").value = item.amount;
    document.getElementById("paidAmount").value = item.paid;
    document.getElementById("type").value = item.type;
    document.getElementById("dueDate").value = item.due;
    document.getElementById("status").value = item.status;
    document.getElementById("note").value = item.note;

    editIndex = index;

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}

// ===================================
// DELETE
// ===================================

async function removeTransaction(index){

    if(!confirm("Delete this transaction?")) return;

    await deleteTransaction(
        transactions[index].id
    );

    transactions = await syncTransactions();
loadData();

}

// ===================================
// DARK MODE
// ===================================

function toggleDarkMode(){

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );

}

if(localStorage.getItem("darkMode")=="true"){

    document.body.classList.add("dark");

}

// ===================================
// PDF
// ===================================

async function downloadPDF(){

    const {jsPDF}=window.jspdf;

    const pdf=new jsPDF();

    pdf.setFontSize(18);

    pdf.text("CrediLoan Report",20,20);

    let y=35;

    transactions.forEach((item,i)=>{

        pdf.setFontSize(11);

        pdf.text(
            `${i+1}. ${item.name}`,
            20,
            y
        );

        y+=7;

        pdf.text(
            `${item.type} | Total:${item.amount} | Remaining:${item.remaining}`,
            20,
            y
        );

        y+=7;

        pdf.text(
            `Status:${item.status}`,
            20,
            y
        );

        y+=10;

        if(y>270){

            pdf.addPage();

            y=20;

        }

    });

    pdf.save("CrediLoan_Report.pdf");

}

function changePin() {

    const oldPin = prompt("Current PIN");

    if (oldPin !== appPin) {
        alert("Wrong PIN");
        return;
    }

    const newPin = prompt("Enter New 4 Digit PIN");

    if (!newPin || newPin.length !== 4) {
        alert("PIN must be 4 digits");
        return;
    }

    appPin = newPin;
    localStorage.setItem("appPin", appPin);

    alert("PIN Updated Successfully");
}

// ===================================
// GLOBAL FUNCTIONS
// ===================================

window.checkPin = checkPin;
window.changePin = changePin;
window.saveNewTransaction = saveNewTransaction;
window.editTransaction = editTransaction;
window.removeTransaction = removeTransaction;
window.searchData = searchData;
window.downloadPDF = downloadPDF;
window.toggleDarkMode = toggleDarkMode;
window.login = login;
window.logout = logout;

// Backup
function backupData() {

    const blob = new Blob(
        [JSON.stringify(transactions)],
        { type: "application/json" }
    );

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = "CrediLoan_Backup.json";

    a.click();

}

// Restore
function restoreData(event) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = async function(e){

    const backup = JSON.parse(e.target.result);

    await restoreTransactions(backup);

    transactions = await syncTransactions();

    loadData();

    alert("Backup Restored Successfully");

};

    reader.readAsText(file);

}

// Global
window.backupData = backupData;
window.restoreData = restoreData;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => console.log("Service Worker Registered"))
      .catch(err => console.log(err));
  });
}

