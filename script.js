document.addEventListener('DOMContentLoaded', () => {
    // **DOM Elements**
    const addDebtBtn = document.getElementById('addDebtBtn');
    const debtsContainer = document.getElementById('debtsContainer');
    const resultBox = document.getElementById('resultBox');
    const resultSummary = document.getElementById('resultSummary');
    const scheduleTableContainer = document.getElementById('scheduleTableContainer');
    const paymentBreakdownContainer = document.getElementById('paymentBreakdownContainer');
    const progressBar = document.getElementById('progressBar');
    const achievementsContainer = document.getElementById('achievementsContainer');
    const tipsContainer = document.getElementById('tipsContainer');
    const monthlyIncomeInput = document.getElementById('monthlyIncome');
    const monthlyExpensesInput = document.getElementById('monthlyExpenses');
    const monthlySIPInput = document.getElementById('monthlySIP');
    const extraPaymentInput = document.getElementById('extraPayment');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const showDashboardBtn = document.getElementById('showDashboardBtn');
    const debtSummaryDashboard = document.getElementById('debtSummaryDashboard');
    const closeDashboardBtn = document.getElementById('closeDashboardBtn');
    const goalsForm = document.getElementById('goalsForm');
    const goalsList = document.getElementById('goalsList');

    // **Chart Instances Removed**
    // let paretoChart;
    // let paymentParetoChart;
    // let repaymentChart;
    let debtCount = 0;
    let typingTimer;                // Timer identifier for debouncing
    const typingInterval = 300;     // Time in ms

    // **Achievements Initialization**
    const achievements = [
        { id: 1, title: 'First Debt Added', description: 'Added your first debt.', unlocked: false },
        { id: 2, title: 'Debt Starter', description: 'Added 3 debts.', unlocked: false },
        { id: 3, title: 'Debt Crusher', description: 'Cleared your first debt.', unlocked: false },
        { id: 4, title: 'Financial Guru', description: 'Cleared all debts.', unlocked: false },
    ];

    // **Display Achievements**
    function displayAchievements() {
        achievementsContainer.innerHTML = '';
        achievements.forEach(ach => {
            if (ach.unlocked) {
                const achElement = document.createElement('div');
                achElement.classList.add('col-6', 'col-md-3', 'text-center', 'mb-4');
                achElement.innerHTML = `
                    <div class="achievement-badge mb-2 unlocked" title="${ach.description}">
                        🏆
                    </div>
                    <p>${ach.title}</p>
                `;
                achievementsContainer.appendChild(achElement);
            }
        });
    }

    // **Unlock Achievements**
    function unlockAchievements(criteria, currentDebts) {
        switch(criteria) {
            case 'add1Debt':
                if (!achievements[0].unlocked) {
                    achievements[0].unlocked = true;
                    displayAchievements();
                }
                break;
            case 'add3Debts':
                if (currentDebts >=3 && !achievements[1].unlocked) {
                    achievements[1].unlocked = true;
                    displayAchievements();
                }
                break;
            case 'clear1Debt':
                if (!achievements[2].unlocked) {
                    achievements[2].unlocked = true;
                    displayAchievements();
                }
                break;
            case 'clearAllDebts':
                if (!achievements[3].unlocked) {
                    achievements[3].unlocked = true;
                    displayAchievements();
                }
                break;
            default:
                break;
        }
    }

    // **Navbar Scroll Effect**
    window.addEventListener("scroll", function() {
        const navbar = document.querySelector(".navbar");
        const scrollTop = window.scrollY;
        const threshold = 100; /* adjust this value to change the trigger point */

        if (scrollTop > threshold) {
            navbar.classList.add("cloudy");
        } else {
            navbar.classList.remove("cloudy");
        }
    });

    // **Debounce Function**
    function debounce(func, delay) {
        return function(...args) {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // **Add Debt Field Function**
    function addDebtField() {
        debtCount++;
        unlockAchievements('add3Debts', debtCount);
        const debtBlock = document.createElement('div');
        debtBlock.classList.add('debt-block', 'position-relative', 'mb-4');
        debtBlock.innerHTML = `
            <button class="remove-debt-btn btn btn-danger btn-sm position-absolute top-0 end-0 m-2" type="button" title="Remove this debt" aria-label="Remove this debt">×</button>
            <div class="row g-3 align-items-center">
                <div class="col-md-6">
                    <label for="debtType${debtCount}" class="form-label">
                        Debt Type
                        <span class="tooltip-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="Select the type of debt.">ℹ️</span>
                    </label>
                    <select class="form-select debt-type" id="debtType${debtCount}" aria-label="Debt Type">
                        <option value="" selected disabled>Choose a Debt Type</option>
                        <option value="Car Loan">Car Loan</option>
                        <option value="Home Loan">Home Loan</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Student Loan">Student Loan</option>
                        <option value="Personal Loan">Personal Loan</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="debtAccount${debtCount}" class="form-label">
                        Account Name (Optional)
                        <span class="tooltip-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="Enter the name of the account or lender (e.g., SBI Card).">ℹ️</span>
                    </label>
                    <input type="text" class="form-control debt-account" id="debtAccount${debtCount}" placeholder="e.g. SBI Card" aria-label="Debt Account Name" />
                </div>
            </div>
            <div class="row g-3 align-items-center mt-2">
                <div class="col-md-4">
                    <label for="debtInterest${debtCount}" class="form-label">
                        Interest Rate (%)
                        <span class="tooltip-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="Enter the annual interest rate for this debt.">ℹ️</span>
                    </label>
                    <input type="number" class="form-control debt-interest" id="debtInterest${debtCount}" placeholder="e.g. 15" aria-label="Debt Interest Rate">
                    <small class="form-text text-muted">Enter the annual interest rate.</small>
                </div>
                <div class="col-md-4">
                    <label for="debtBalance${debtCount}" class="form-label">
                        Balance (₹)
                        <span class="tooltip-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="Enter the current balance of this debt.">ℹ️</span>
                    </label>
                    <input type="number" class="form-control debt-balance" id="debtBalance${debtCount}" placeholder="e.g. 100000" aria-label="Debt Balance">
                    <small class="form-text text-muted">Enter the current balance of the debt.</small>
                </div>
                <div class="col-md-4">
                    <label for="debtMinimum${debtCount}" class="form-label">
                        Minimum Payment (₹)
                        <span class="tooltip-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="Enter the minimum monthly payment required for this debt.">ℹ️</span>
                    </label>
                    <input type="number" class="form-control debt-minimum" id="debtMinimum${debtCount}" placeholder="e.g. 2000" aria-label="Debt Minimum Payment">
                    <small class="form-text text-muted">Enter the minimum monthly payment.</small>
                </div>
            </div>
        `;
        debtsContainer.appendChild(debtBlock);

        // Unlock achievement for adding first debt
        if (debtCount === 1) {
            unlockAchievements('add1Debt', debtCount);
        }

        // **Remove Debt Functionality**
        const removeBtn = debtBlock.querySelector('.remove-debt-btn');
        removeBtn.addEventListener('click', () => {
            debtBlock.remove();
            debtCount--;
            unlockAchievements('add3Debts', debtCount);
            calculateAndUpdate();
        });

        // **Event Listeners with Debouncing**
        const debtInterestInput = debtBlock.querySelector('.debt-interest');
        const debtBalanceInput = debtBlock.querySelector('.debt-balance');
        const debtMinimumInput = debtBlock.querySelector('.debt-minimum');

        debtInterestInput.addEventListener('input', debounce(calculateAndUpdate, typingInterval));
        debtBalanceInput.addEventListener('input', debounce(calculateAndUpdate, typingInterval));
        debtMinimumInput.addEventListener('input', debounce(calculateAndUpdate, typingInterval));

        // **Initialize Tooltips for New Inputs**
        const tooltipTriggerList = [].slice.call(debtBlock.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // **Trigger Calculation on Adding a New Debt**
        calculateAndUpdate();
    }

    // **Initialize Charts and Other Components Removed**
    // initializeParetoCharts();

    // **Initial Debt Field**
    addDebtBtn.addEventListener('click', addDebtField);
    addDebtField(); // add one debt field by default

    // **Get Current Input Values**
    function getCurrentInputs() {
        const monthlyIncome = parseFloat(monthlyIncomeInput.value) || 0;
        const monthlyExpenses = parseFloat(monthlyExpensesInput.value) || 0;
        const monthlySIP = parseFloat(monthlySIPInput.value) || 0;
        const extraPayment = parseFloat(extraPaymentInput.value) || 0;
        const method = document.querySelector('input[name="repaymentMethod"]:checked') ? document.querySelector('input[name="repaymentMethod"]:checked').value : 'snowball';

        const debtBlocks = debtsContainer.querySelectorAll('.debt-block');
        let debts = [];
        debtBlocks.forEach(block => {
            const type = block.querySelector('.debt-type').value;
            const accountName = block.querySelector('.debt-account').value || "";
            const balance = parseFloat(block.querySelector('.debt-balance').value) || 0;
            const interest = parseFloat(block.querySelector('.debt-interest').value) || 0;
            const minimum = parseFloat(block.querySelector('.debt-minimum').value) || 0;
            if (type && balance > 0) {
                debts.push({ type, accountName, balance, interest, minimum });
            }
        });

        return { monthlyIncome, monthlyExpenses, monthlySIP, extraPayment, method, debts };
    }

    // **Calculate and Update Results Dynamically**
    function calculateAndUpdate() {
        const { monthlyIncome, monthlyExpenses, monthlySIP, extraPayment, method, debts } = getCurrentInputs();

        const monthlyAvailable = monthlyIncome - monthlyExpenses;
        if (monthlyAvailable < 0) {
            resultSummary.innerHTML = `<p class="text-danger">Expenses exceed income. Please adjust.</p>`;
            resultBox.classList.add('active');
            return;
        }

        const monthlyAvailableAfterSIP = monthlyAvailable - monthlySIP;
        if (monthlyAvailableAfterSIP < 0) {
            resultSummary.innerHTML = `<p class="text-danger">SIP exceeds available funds. Please adjust.</p>`;
            resultBox.classList.add('active');
            return;
        }

        if (debts.length === 0) {
            resultSummary.innerHTML = `<p class="text-danger">Add at least one valid debt.</p>`;
            resultBox.classList.add('active');
            return;
        }

        // **Sort Debts Based on Selected Method**
        let sortedDebts = [...debts];
        if (method === 'snowball') {
            sortedDebts.sort((a, b) => a.balance - b.balance);
        } else if (method === 'avalanche') {
            sortedDebts.sort((a, b) => b.interest - a.interest);
        }

        // **Initialize Variables for Calculation**
        let schedule = [];
        let totalInterestPaid = 0;
        let month = -1;
        let allDebtsPaid = false;
        let paymentBreakdown = [];
        const numberOfDebts = sortedDebts.length;

        // **Month 0 Initial**
        let initialTotal = sortedDebts.reduce((sum, d) => sum + d.balance, 0);
        schedule.push({ month: 0, totalRemaining: initialTotal });
        paymentBreakdown.push({ month: 0, payments: new Array(numberOfDebts).fill(0) });

        // **Repayment Calculation Loop**
        while (!allDebtsPaid && month < 599) { // Limit to 50 years to prevent infinite loops
            month++;
            if (month === 0) continue;

            let monthlyPaymentLeft = monthlyAvailableAfterSIP;
            let monthlyDebtPayments = new Array(numberOfDebts).fill(0);

            // **Add Interest**
            sortedDebts.forEach((d, i) => {
                if (d.balance > 0) {
                    const monthlyInterestRate = (d.interest / 100) / 12 || 0;
                    const interestThisMonth = d.balance * monthlyInterestRate;
                    d.balance += interestThisMonth;
                    totalInterestPaid += interestThisMonth;
                }
            });

            // **Minimum Payments**
            for (let i = 0; i < sortedDebts.length; i++) {
                let d = sortedDebts[i];
                if (d.balance > 0 && d.minimum > 0 && monthlyPaymentLeft > 0) {
                    const payMin = Math.min(d.minimum, d.balance, monthlyPaymentLeft);
                    d.balance -= payMin;
                    monthlyPaymentLeft -= payMin;
                    monthlyDebtPayments[i] += payMin;
                }
            }

            // **Distribute Leftover Payments**
            if (monthlyPaymentLeft > 0) {
                if (method === 'prorata') {
                    let totalBal = sortedDebts.reduce((sum, d) => sum + (d.balance > 0 ? d.balance : 0), 0);
                    if (totalBal > 0) {
                        for (let i = 0; i < sortedDebts.length; i++) {
                            let d = sortedDebts[i];
                            if (d.balance > 0) {
                                let share = (d.balance / totalBal) * monthlyPaymentLeft;
                                let payPro = Math.min(share, d.balance);
                                d.balance -= payPro;
                                monthlyDebtPayments[i] += payPro;
                            }
                        }
                        monthlyPaymentLeft = 0;
                    }
                } else if (method === 'equal') {
                    let activeDebts = sortedDebts.filter(d => d.balance > 0).length;
                    if (activeDebts > 0) {
                        let eqShare = monthlyPaymentLeft / activeDebts;
                        for (let i = 0; i < sortedDebts.length; i++) {
                            let d = sortedDebts[i];
                            if (d.balance > 0 && monthlyPaymentLeft > 0) {
                                let payEq = Math.min(d.balance, eqShare);
                                d.balance -= payEq;
                                monthlyDebtPayments[i] += payEq;
                            }
                        }
                        monthlyPaymentLeft = 0;
                    }
                } else {
                    // **Snowball/Avalanche Leftover**
                    for (let i = 0; i < sortedDebts.length; i++) {
                        let d = sortedDebts[i];
                        if (d.balance > 0 && monthlyPaymentLeft > 0) {
                            const payRem = Math.min(d.balance, monthlyPaymentLeft);
                            d.balance -= payRem;
                            monthlyPaymentLeft -= payRem;
                            monthlyDebtPayments[i] += payRem;
                            if (monthlyPaymentLeft <= 0) break;
                        }
                    }
                }
            }

            // **Extra Payment for Snowball/Avalanche**
            if ((method === 'snowball' || method === 'avalanche') && extraPayment > 0 && monthlyPaymentLeft > 0) {
                for (let i = 0; i < sortedDebts.length; i++) {
                    let d = sortedDebts[i];
                    if (d.balance > 0 && monthlyPaymentLeft > 0) {
                        const payExtra = Math.min(extraPayment, d.balance, monthlyPaymentLeft);
                        d.balance -= payExtra;
                        monthlyPaymentLeft -= payExtra;
                        monthlyDebtPayments[i] += payExtra;
                        break;
                    }
                }
            }

            // **Update Schedule and Payment Breakdown**
            let totalRemaining = sortedDebts.reduce((sum, d) => sum + d.balance, 0);
            schedule.push({ month: month, totalRemaining: Math.max(totalRemaining, 0) });
            paymentBreakdown.push({ month: month, payments: monthlyDebtPayments.slice() });

            // **Check if All Debts Are Paid**
            if (totalRemaining <= 0.01) {
                allDebtsPaid = true;
                sortedDebts.forEach(d => d.balance = 0);
                unlockAchievements('clearAllDebts', debtCount);
            }
        }

        // **Calculate Time to Clear Debts**
        let monthsTaken = schedule.length - 1;
        let years = Math.floor(monthsTaken / 12);
        let remainderMonths = monthsTaken % 12;
        let debtFreeTime = years > 0 
            ? `${years} year(s) and ${remainderMonths} month(s)`
            : `${monthsTaken} month(s)`;

        // **Calculate Total Debt Remaining**
        const totalDebt = sortedDebts.reduce((sum, d) => sum + d.balance, 0);

        // **Update Summary**
        resultSummary.innerHTML = `
            <h3>Your Plan</h3>
            <p><strong>Monthly Income:</strong> ₹${formatCurrency(monthlyIncome)} | <strong>Expenses:</strong> ₹${formatCurrency(monthlyExpenses)}</p>
            <p><strong>SIP:</strong> ₹${formatCurrency(monthlySIP)} | <strong>Extra:</strong> ₹${formatCurrency(extraPayment)}</p>
            <p><strong>Method:</strong> ${capitalizeFirstLetter(method)}</p>
            <hr>
            <p><strong>Time to Clear Debts:</strong> ${debtFreeTime}</p>
            <p><strong>Total Interest Paid:</strong> ₹${formatCurrency(totalInterestPaid.toFixed(2))}</p>
            <hr>
            <p>Remember, this journey is about steady progress. Each month’s effort chips away at your debts. Soon, you’ll stand debt-free, enjoying financial peace like a gentle breeze on a warm evening.</p>
        `;

        // **Update Total Debt Display**
        document.getElementById('totalDebt').textContent = `₹${formatCurrency(totalDebt.toFixed(2))}`;

        // **Update Progress Bar**
        const initialDebt = schedule[0].totalRemaining;
        const finalDebt = schedule[schedule.length -1].totalRemaining;
        const progress = ((initialDebt - finalDebt) / initialDebt) * 100;
        progressBar.style.width = `${progress.toFixed(2)}%`;
        progressBar.textContent = `${progress.toFixed(2)}%`;

        // **Generate Schedule Table**
        let scheduleHTML = `
            <table class="table table-striped table-hover table-sm">
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Total Remaining Debt (₹)</th>
                    </tr>
                </thead>
                <tbody>
        `;
        schedule.forEach(row => {
            scheduleHTML += `
                <tr>
                    <td>${row.month}</td>
                    <td>₹${formatCurrency(row.totalRemaining.toFixed(2))}</td>
                </tr>
            `;
        });
        scheduleHTML += `
                </tbody>
            </table>
        `;
        scheduleTableContainer.innerHTML = scheduleHTML;

        // **Generate Payment Breakdown Table**
        let breakdownHTML = `
            <table class="table table-striped table-hover table-sm">
                <thead>
                    <tr>
                        <th>Month</th>
        `;
        sortedDebts.forEach((d, i) => {
            breakdownHTML += `<th>${d.type}${d.accountName ? ` (${d.accountName})` : ''}</th>`;
        });
        breakdownHTML += `
                    </tr>
                </thead>
                <tbody>
        `;

        paymentBreakdown.forEach(row => {
            breakdownHTML += `<tr><td>${row.month}</td>`;
            row.payments.forEach((amt, i) => {
                breakdownHTML += `<td>₹${formatCurrency(amt.toFixed(2))}</td>`;
            });
            breakdownHTML += `</tr>`;
        });
        breakdownHTML += `
                </tbody>
            </table>
        `;
        paymentBreakdownContainer.innerHTML = breakdownHTML;

        // **Update Debt Summary Dashboard**
        updateDebtSummary(totalDebt, totalInterestPaid, debtFreeTime, debtCount);

        // **Unlock Achievement for Clearing First Debt**
        if (monthsTaken > 0 && !achievements[2].unlocked) {
            unlockAchievements('clear1Debt', debtCount);
        }

        // **Show Result Box**
        resultBox.classList.add('active');
    }

    // **Capitalize First Letter Function**
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // **Format Currency Function**
    function formatCurrency(value) {
        return Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0 });
    }

    // **Add Event Listeners with Debouncing for Main Inputs**
    monthlyIncomeInput.addEventListener('input', debounce(calculateAndUpdate, typingInterval));
    monthlyExpensesInput.addEventListener('input', debounce(calculateAndUpdate, typingInterval));
    monthlySIPInput.addEventListener('input', debounce(calculateAndUpdate, typingInterval));
    extraPaymentInput.addEventListener('input', debounce(calculateAndUpdate, typingInterval));

    // **Initialize Tooltips**
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // **Display Achievements on Load**
    displayAchievements();

    // **Initialize Tips and Motivation**
    const tips = [
        "Stay consistent with your payments to see significant progress over time.",
        "Consider negotiating lower interest rates with your lenders.",
        "Prioritize high-interest debts to save more on interest payments.",
        "Track your progress regularly to stay motivated.",
        "Avoid taking on new debts while paying off existing ones.",
        "Celebrate small milestones to keep your morale high.",
        "Automate your payments to ensure timely debt clearance.",
        "Review and adjust your budget periodically for optimal results."
    ];

    const motivations = [
        "You're one step closer to financial freedom!",
        "Every payment counts. Keep going!",
        "Believe in your ability to overcome debt.",
        "Stay focused and determined. You can do this!",
        "Your future self will thank you for the efforts today."
    ];

    function displayTips() {
        tipsContainer.innerHTML = '';
        const allTips = [...tips, ...motivations];
        allTips.forEach(tip => {
            const tipCard = document.createElement('div');
            tipCard.classList.add('col-md-6', 'col-lg-4', 'mb-4');
            tipCard.innerHTML = `
                <div class="tip-card p-3 shadow-sm rounded">
                    <h5>💡 Tip</h5>
                    <p>${tip}</p>
                </div>
            `;
            tipsContainer.appendChild(tipCard);
        });
    }

    displayTips();

    // **Export Repayment Schedule as PDF**
    exportPdfBtn.addEventListener('click', () => {
        // Implement PDF export functionality using jsPDF or html2pdf.js
        // For demonstration, we'll alert the user.
        alert("PDF export feature is not implemented yet.");
    });

    // **Function to Update Debt Summary Dashboard**
    function updateDebtSummary(totalDebt, totalInterest, debtFreeTime, numberOfDebts) {
        document.getElementById('dashboardTotalDebt').textContent = `₹${formatCurrency(totalDebt.toFixed(2))}`;
        document.getElementById('dashboardTotalInterest').textContent = `₹${formatCurrency(totalInterest.toFixed(2))}`;
        document.getElementById('dashboardDebtFreeTime').textContent = `${debtFreeTime}`;
        document.getElementById('dashboardNumberOfDebts').textContent = `${numberOfDebts}`;
    }

    // **Show Debt Summary Dashboard**
    showDashboardBtn.addEventListener('click', () => {
        const debtSummaryModal = new bootstrap.Modal(debtSummaryDashboard);
        debtSummaryModal.show();
    });

    // **Close Debt Summary Dashboard**
    closeDashboardBtn.addEventListener('click', () => {
        const debtSummaryModal = bootstrap.Modal.getInstance(debtSummaryDashboard);
        debtSummaryModal.hide();
    });

    // **Financial Goals Functionality**
    goalsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('goalDescription').value.trim();
        const amount = parseFloat(document.getElementById('goalAmount').value) || 0;
        const deadline = document.getElementById('goalDeadline').value;

        if (description && amount > 0 && deadline) {
            addGoal(description, amount, deadline);
            goalsForm.reset();
        }
    });

    function addGoal(description, amount, deadline) {
        const goalItem = document.createElement('div');
        goalItem.classList.add('goal-item', 'mb-3');
        goalItem.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${description}</h5>
                    <p class="card-text"><strong>Amount:</strong> ₹${formatCurrency(amount)}</p>
                    <p class="card-text"><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</p>
                </div>
            </div>
        `;
        goalsList.appendChild(goalItem);
    }
});
