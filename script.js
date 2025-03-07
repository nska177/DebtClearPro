document.addEventListener("DOMContentLoaded", function() {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const addDebtBtn = document.getElementById("addDebtBtn");
    const debtsContainer = document.getElementById("debtsContainer");
    const progressBar = document.getElementById("progressBar");
    const resultSummary = document.getElementById("resultSummary");
    let totalDebt = 0;

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });

    addDebtBtn.addEventListener("click", () => {
        const debtDiv = document.createElement("div");
        debtDiv.innerHTML = `
            <input type='text' placeholder='Debt Name'>
            <input type='number' class='debtAmount' placeholder='Amount'>
            <button class='removeDebt'>❌</button>
        `;
        debtsContainer.appendChild(debtDiv);
        updateDebt();
    });

    debtsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("removeDebt")) {
            event.target.parentElement.remove();
            updateDebt();
        }
    });

    function updateDebt() {
        const debtInputs = document.querySelectorAll(".debtAmount");
        totalDebt = 0;
        debtInputs.forEach(input => {
            totalDebt += Number(input.value) || 0;
        });
        resultSummary.textContent = `Total Debt: ₹${totalDebt}`;
        progressBar.style.width = totalDebt ? `${Math.min(100, (500000 - totalDebt) / 5000)}%` : "0%";
    }

    debtsContainer.addEventListener("input", updateDebt);
});
