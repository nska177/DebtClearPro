document.addEventListener('DOMContentLoaded', () => {
    const addDebtBtn = document.getElementById('addDebtBtn');
    const debtsContainer = document.getElementById('debtsContainer');
    const resultBox = document.getElementById('resultBox');
    const resultSummary = document.getElementById('resultSummary');
    const scheduleTableContainer = document.getElementById('scheduleTableContainer');
    const paymentBreakdownContainer = document.getElementById('paymentBreakdownContainer');
    const repaymentChartEl = document.getElementById('repaymentChart');
    const progressBar = document.getElementById('progressBar');
    const achievementsContainer = document.getElementById('achievementsContainer');
    const monthlyIncomeInput = document.getElementById('monthlyIncome');
    const monthlyExpensesInput = document.getElementById('monthlyExpenses');
    const monthlySIPInput = document.getElementById('monthlySIP');
    const extraPaymentInput = document.getElementById('extraPayment');
    let repaymentChart;
    let debtCount = 0;
    let typingTimer;                // Timer identifier for debouncing
    const typingInterval = 300;     // Time in ms

    // Initialize Achievements
    const achievements = [
        { id: 1, title: 'First Debt Added', description: 'Added your first debt.', unlocked: false },
        { id: 2, title: 'Debt Starter', description: 'Added 3 debts.', unlocked: false },
        { id: 3, title: 'Debt Crusher', description: 'Cleared your first debt.', unlocked: false },
        { id: 4, title: 'Financial Guru', description: 'Cleared all debts.', unlocked: false },
    ];

    // Function to display achievements
    function displayAchievements() {
        achievementsContainer.innerHTML = '';
        achievements.forEach(ach => {
            if (ach.unlocked) {
                const achElement = document.createElement('div');
                achElement.classList.add('col-6', 'col-md-3', 'text-center');
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

    // Function to unlock achievements
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

    // Navbar Scroll Effect
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

    // Debounce function to limit the rate at which a function can fire.
    function debounce(func, delay) {
        return function(...args) {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Add Debt Field Function
    function addDebtField() {
        debtCount++;
        unlockAchievements('add3Debts', debtCount);
        const debtBlock = document.createElement('div');
        debtBlock.classList.add('debt-block', 'position-relative');
        debtBlock.innerHTML = `
            <button class="remove-debt-btn" type="button" title="Remove this debt" aria-label="Remove this debt">×</button>
            <div class="row g-3 align-items-center mt-2">
                <div class="col-md-6">
                    <label for="debtType${debtCount}" class="form-label">Debt Type</label>
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
                    <label for="debtAccount${debtCount}" class="form-label">Account Name (Optional)</label>
                    <input type="text" class="form-control debt-account" id="debtAccount${debtCount}" placeholder="e.g. SBI Card" aria-label="Debt Account Name" />
                </div>
            </div>
            <div class="row g-3 align-items-center mt-1">
                <div class="col-md-4">
                    <label for="debtInterest${debtCount}" class="form-label">Interest Rate (%)</label>
                    <input type="number" class="form-control debt-interest" id="debtInterest${debtCount}" placeholder="e.g. 15" aria-label="Debt Interest Rate">
                    <small class="form-text text-muted">Enter the annual interest rate.</small>
                </div>
                <div class="col-md-4">
                    <label for="debtBalance${debtCount}" class="form-label">Balance (₹)</label>
                    <input type="number" class="form-control debt-balance" id="debtBalance${debtCount}" placeholder="e.g. 100000" aria-label="Debt Balance">
                    <small class="form-text text-muted">Enter the current balance of the debt.</small>
                </div>
                <div class="col-md-4">
                    <label for="debtMinimum${debtCount}" class="form-label">Minimum Payment (₹)</label>
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

        const removeBtn = debtBlock.querySelector('.remove-debt-btn');
        removeBtn.addEventListener('click', () => {
            debtBlock.remove();
            debtCount--;
            unlockAchievements('add3Debts', debtCount);
            calculateAndUpdate();
        });

        // Add event listeners for inputs within the debt block with debouncing
        const debtInterestInput = debtBlock.querySelector('.debt-interest');
        const debtBalanceInput = debtBlock.querySelector('.debt-balance');
        const debtMinimumInput = debtBlock.querySelector('.debt-minimum');

        debtInterestInput.addEventListener('input', debounce(calculateAndUpdate, typingInterval));
        debtBalanceInput.addEventListener('input', debounce(calculateAndUpdate, typingInterval));
        debtMinimumInput.addEventListener('input', debounce(calculateAndUpdate, typingInterval));

        // Initialize tooltips for new inputs
        const tooltipTriggerList = [].slice.call(debtBlock.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Trigger calculation on adding a new debt
        calculateAndUpdate();
    }

    addDebtBtn.addEventListener('click', addDebtField);
    addDebtField(); // add one debt field by default

    // Get current input values
    function getCurrentInputs() {
        const monthlyIncome = parseFloat(monthlyIncomeInput.value) || 0;
        const monthlyExpenses = parseFloat(monthlyExpensesInput.value) || 0;
        const monthlySIP = parseFloat(monthlySIPInput.value) || 0;
        const extraPayment = parseFloat(extraPaymentInput.value) || 0;
        const method = document.querySelector('input[name="repaymentMethod"]:checked').value;

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

    // Calculate and update results dynamically
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

        // Sort debts based on selected method
        let sortedDebts = [...debts];
        if (method === 'snowball') {
            sortedDebts.sort((a, b) => a.balance - b.balance);
        } else if (method === 'avalanche') {
            sortedDebts.sort((a, b) => b.interest - a.interest);
        }

        let schedule = [];
        let totalInterestPaid = 0;
        let month = -1;
        let allDebtsPaid = false;
        let dataPoints = [];
        let paymentBreakdown = [];
        const numberOfDebts = sortedDebts.length;

        // Month 0 initial
        let initialTotal = sortedDebts.reduce((sum, d) => sum + d.balance, 0);
        schedule.push({ month: 0, totalRemaining: initialTotal });
        dataPoints.push(initialTotal);
        paymentBreakdown.push({ month: 0, payments: new Array(numberOfDebts).fill(0) });

        while (!allDebtsPaid && month < 599) { // Limit to 50 years to prevent infinite loops
            month++;
            if (month === 0) continue;

            let monthlyPaymentLeft = monthlyAvailableAfterSIP;
            let monthlyDebtPayments = new Array(numberOfDebts).fill(0);

            // Add interest
            sortedDebts.forEach((d, i) => {
                if (d.balance > 0) {
                    const monthlyInterestRate = (d.interest / 100) / 12 || 0;
                    const interestThisMonth = d.balance * monthlyInterestRate;
                    d.balance += interestThisMonth;
                    totalInterestPaid += interestThisMonth;
                }
            });

            // Minimum payments
            for (let i = 0; i < sortedDebts.length; i++) {
                let d = sortedDebts[i];
                if (d.balance > 0 && d.minimum > 0 && monthlyPaymentLeft > 0) {
                    const payMin = Math.min(d.minimum, d.balance, monthlyPaymentLeft);
                    d.balance -= payMin;
                    monthlyPaymentLeft -= payMin;
                    monthlyDebtPayments[i] += payMin;
                }
            }

            // Distribute leftover
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
                    // Snowball/Avalanche leftover
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

            // Extra payment for Snowball/Avalanche
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

            let totalRemaining = sortedDebts.reduce((sum, d) => sum + d.balance, 0);
            schedule.push({ month: month, totalRemaining: Math.max(totalRemaining, 0) });
            dataPoints.push(Math.max(totalRemaining, 0));

            paymentBreakdown.push({ month: month, payments: monthlyDebtPayments.slice() });

            if (totalRemaining <= 0.01) {
                allDebtsPaid = true;
                sortedDebts.forEach(d => d.balance = 0);
                unlockAchievements('clearAllDebts', debtCount);
            }
        }

        let monthsTaken = schedule.length - 1;
        let years = Math.floor(monthsTaken / 12);
        let remainderMonths = monthsTaken % 12;
        let debtFreeTime = years > 0 
            ? `${years} year(s) and ${remainderMonths} month(s)`
            : `${monthsTaken} month(s)`;

        resultSummary.innerHTML = `
            <h3>Your Plan</h3>
            <p><strong>Monthly Income:</strong> ₹${formatCurrency(monthlyIncome)} | <strong>Expenses:</strong> ₹${formatCurrency(monthlyExpenses)}</p>
            <p><strong>SIP:</strong> ₹${formatCurrency(monthlySIP)} | <strong>Extra:</strong> ₹${formatCurrency(extraPayment)}</p>
            <p><strong>Method:</strong> ${capitalizeFirstLetter(method)}</p>
            <hr>
            <p><strong>Time to Clear Debts:</strong> ${debtFreeTime}</p>
            <p><strong>Total Interest Paid:</strong> ₹${formatCurrency(totalInterestPaid)}</p>
            <hr>
            <p>Remember, this journey is about steady progress. Each month’s effort chips away at your debts. Soon, you’ll stand debt-free, enjoying financial peace like a gentle breeze on a warm evening.</p>
        `;

        // Update Progress Bar
        const initialDebt = schedule[0].totalRemaining;
        const finalDebt = schedule[schedule.length -1].totalRemaining;
        const progress = ((initialDebt - finalDebt) / initialDebt) * 100;
        progressBar.style.width = `${progress.toFixed(2)}%`;
        progressBar.textContent = `${progress.toFixed(2)}%`;

        // Schedule Table
        let scheduleHTML = `<table class="table table-striped table-hover table-sm">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Total Remaining Debt (₹)</th>
                                    </tr>
                                </thead>
                                <tbody>`;
        schedule.forEach(row => {
            scheduleHTML += `<tr>
                                <td>${row.month}</td>
                                <td>₹${formatCurrency(row.totalRemaining.toFixed(2))}</td>
                            </tr>`;
        });
        scheduleHTML += `</tbody></table>`;
        scheduleTableContainer.innerHTML = scheduleHTML;

        // Payment Breakdown
        let breakdownHTML = `<table class="table table-striped table-hover table-sm">
                                <thead>
                                    <tr>
                                        <th>Month</th>`;
        sortedDebts.forEach((d, i) => {
            breakdownHTML += `<th>${d.type}${d.accountName ? ` (${d.accountName})` : ''}</th>`;
        });
        breakdownHTML += `</tr></thead><tbody>`;

        paymentBreakdown.forEach(row => {
            breakdownHTML += `<tr><td>${row.month}</td>`;
            row.payments.forEach((amt, i) => {
                breakdownHTML += `<td>₹${formatCurrency(amt.toFixed(2))}</td>`;
            });
            breakdownHTML += `</tr>`;
        });
        breakdownHTML += `</tbody></table>`;
        paymentBreakdownContainer.innerHTML = breakdownHTML;

        // Chart
        if (repaymentChart) {
            repaymentChart.destroy();
        }
        repaymentChart = new Chart(repaymentChartEl, {
            type: 'line',
            data: {
                labels: dataPoints.map((_, i) => i),
                datasets: [{
                    label: 'Debt Over Time (₹)',
                    data: dataPoints,
                    borderColor: 'var(--color-accent)',
                    backgroundColor: 'rgba(23, 162, 184, 0.2)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { 
                        title: { 
                            display: true, 
                            text: 'Month' 
                        } 
                    },
                    y: { 
                        title: { 
                            display: true, 
                            text: 'Remaining Debt (₹)' 
                        }, 
                        beginAtZero: true 
                    }
                },
                plugins: { 
                    legend: { 
                        display: false 
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });

        // Update Achievements for clearing first debt
        if (monthsTaken > 0 && !achievements[2].unlocked) {
            unlockAchievements('clear1Debt', debtCount);
        }

        // Show Result Box
        resultBox.classList.add('active');
    }

    // Capitalize first letter of a string
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Format number as currency
    function formatCurrency(value) {
        return Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0 });
    }

    // Add event listeners with debouncing for main inputs
    const debouncedCalculate = debounce(calculateAndUpdate, typingInterval);

    monthlyIncomeInput.addEventListener('input', () => {
        calculateAndUpdate();
    });

    monthlyExpensesInput.addEventListener('input', () => {
        calculateAndUpdate();
    });

    monthlySIPInput.addEventListener('input', () => {
        calculateAndUpdate();
    });

    extraPaymentInput.addEventListener('input', () => {
        calculateAndUpdate();
    });

    // Initialize Achievements Display
    displayAchievements();

    // Initial Calculation
    calculateAndUpdate();
});
