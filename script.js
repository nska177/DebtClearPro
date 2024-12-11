document.addEventListener('DOMContentLoaded', () => {
    const addDebtBtn = document.getElementById('addDebtBtn');
    const debtsContainer = document.getElementById('debtsContainer');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultBox = document.getElementById('resultBox');
    const resultSummary = document.getElementById('resultSummary');
    const scheduleTableContainer = document.getElementById('scheduleTableContainer');
    const paymentBreakdownContainer = document.getElementById('paymentBreakdownContainer');
    const repaymentChartEl = document.getElementById('repaymentChart');
    let repaymentChart;
    let debtCount = 0;

    function addDebtField() {
        debtCount++;
        const debtBlock = document.createElement('div');
        debtBlock.classList.add('debt-block');
        debtBlock.innerHTML = `
            <button class="remove-debt-btn" type="button" title="Remove this debt">×</button>
            <div class="row g-3 align-items-center mt-2">
                <div class="col-md-6">
                    <label class="form-label">Debt Type</label>
                    <select class="form-select debt-type">
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
                    <label class="form-label">Account Name (Optional)</label>
                    <input type="text" class="form-control debt-account" placeholder="e.g. SBI Card" />
                </div>
            </div>
            <div class="row g-3 align-items-center mt-1">
                <div class="col-md-3">
                    <label class="form-label">Interest Rate (%)</label>
                    <input type="number" class="form-control debt-interest" placeholder="e.g. 15"/>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Balance (₹)</label>
                    <input type="number" class="form-control debt-balance" placeholder="e.g. 100000"/>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Minimum Payment (₹)</label>
                    <input type="number" class="form-control debt-minimum" placeholder="e.g. 2000"/>
                </div>
            </div>
        `;
        debtsContainer.appendChild(debtBlock);

        const removeBtn = debtBlock.querySelector('.remove-debt-btn');
        removeBtn.addEventListener('click', () => {
            debtBlock.remove();
        });
    }

    addDebtBtn.addEventListener('click', addDebtField);
    addDebtField(); // add one debt field by default

    calculateBtn.addEventListener('click', function() {
        const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value) || 0;
        const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value) || 0;
        const monthlySIP = parseFloat(document.getElementById('monthlySIP').value) || 0;
        const extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;
        const method = document.querySelector('input[name="repaymentMethod"]:checked').value;

        const monthlyAvailable = monthlyIncome - monthlyExpenses;
        if (monthlyAvailable < 0) {
            alert("Expenses exceed income. Please adjust.");
            return;
        }

        const monthlyAvailableAfterSIP = monthlyAvailable - monthlySIP;
        if (monthlyAvailableAfterSIP < 0) {
            alert("SIP exceeds available funds. Please adjust.");
            return;
        }

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

        if (debts.length === 0) {
            alert("Add at least one valid debt.");
            return;
        }

        if (method === 'snowball') {
            debts.sort((a, b) => a.balance - b.balance);
        } else if (method === 'avalanche') {
            debts.sort((a, b) => b.interest - a.interest);
        }

        let schedule = [];
        let totalInterestPaid = 0;
        let month = -1;
        let allDebtsPaid = false;
        let dataPoints = [];
        let paymentBreakdown = [];
        const numberOfDebts = debts.length;

        // Month 0 initial
        let initialTotal = debts.reduce((sum, d) => sum + d.balance, 0);
        schedule.push({ month: 0, totalRemaining: initialTotal });
        dataPoints.push(initialTotal);
        paymentBreakdown.push({ month: 0, payments: new Array(numberOfDebts).fill(0) });

        while (!allDebtsPaid && month < 599) {
            month++;
            if (month === 0) continue;

            let monthlyPaymentLeft = monthlyAvailableAfterSIP;
            let monthlyDebtPayments = new Array(numberOfDebts).fill(0);

            // Add interest
            debts.forEach((d, i) => {
                if (d.balance > 0) {
                    const monthlyInterestRate = (d.interest / 100) / 12 || 0;
                    const interestThisMonth = d.balance * monthlyInterestRate;
                    d.balance += interestThisMonth;
                    totalInterestPaid += interestThisMonth;
                }
            });

            // Minimum payments
            for (let i = 0; i < debts.length; i++) {
                let d = debts[i];
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
                    let totalBal = debts.reduce((sum, d) => sum + (d.balance > 0 ? d.balance : 0), 0);
                    if (totalBal > 0) {
                        for (let i = 0; i < debts.length; i++) {
                            let d = debts[i];
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
                    let activeDebts = debts.filter(d => d.balance > 0).length;
                    if (activeDebts > 0) {
                        let eqShare = monthlyPaymentLeft / activeDebts;
                        for (let i = 0; i < debts.length; i++) {
                            let d = debts[i];
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
                    for (let i = 0; i < debts.length; i++) {
                        let d = debts[i];
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
                for (let i = 0; i < debts.length; i++) {
                    let d = debts[i];
                    if (d.balance > 0 && monthlyPaymentLeft > 0) {
                        const payExtra = Math.min(extraPayment, d.balance, monthlyPaymentLeft);
                        d.balance -= payExtra;
                        monthlyPaymentLeft -= payExtra;
                        monthlyDebtPayments[i] += payExtra;
                        break;
                    }
                }
            }

            let totalRemaining = debts.reduce((sum, d) => sum + d.balance, 0);
            schedule.push({ month: month, totalRemaining: Math.max(totalRemaining, 0) });
            dataPoints.push(Math.max(totalRemaining, 0));

            paymentBreakdown.push({ month: month, payments: monthlyDebtPayments.slice() });

            if (totalRemaining <= 0.01) {
                allDebtsPaid = true;
                debts.forEach(d => d.balance = 0);
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
            <p><strong>Monthly Income:</strong> ₹${monthlyIncome.toFixed(2)} | <strong>Expenses:</strong> ₹${monthlyExpenses.toFixed(2)}</p>
            <p><strong>SIP:</strong> ₹${monthlySIP.toFixed(2)} | <strong>Extra:</strong> ₹${extraPayment.toFixed(2)}</p>
            <p><strong>Method:</strong> ${method.charAt(0).toUpperCase() + method.slice(1)}</p>
            <hr>
            <p><strong>Time to Clear Debts:</strong> ${debtFreeTime}</p>
            <p><strong>Total Interest Paid:</strong> ₹${totalInterestPaid.toFixed(2)}</p>
            <hr>
            <p>Remember, this journey is about steady progress. Each month’s effort chips away at your debts. Soon, you’ll stand debt-free, enjoying financial peace like a gentle breeze on a warm evening.</p>
        `;

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
                                <td>${row.totalRemaining.toFixed(2)}</td>
                            </tr>`;
        });
        scheduleHTML += `</tbody></table>`;
        scheduleTableContainer.innerHTML = scheduleHTML;

        // Payment Breakdown
        let breakdownHTML = `<table class="table table-striped table-hover table-sm">
                                <thead>
                                    <tr>
                                        <th>Month</th>`;
        debts.forEach((d, i) => {
            breakdownHTML += `<th>${d.type}${d.accountName ? ` (${d.accountName})` : ''}</th>`;
        });
        breakdownHTML += `</tr></thead><tbody>`;

        paymentBreakdown.forEach(row => {
            breakdownHTML += `<tr><td>${row.month}</td>`;
            row.payments.forEach((amt, i) => {
                breakdownHTML += `<td>₹${amt.toFixed(2)}</td>`;
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
                    borderColor: '#78b589',
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Month' } },
                    y: { title: { display: true, text: 'Remaining Debt (₹)' }, beginAtZero: true }
                },
                plugins: { legend: { display: false } }
            }
        });

        resultBox.classList.add('active');
    });
});
