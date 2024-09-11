function updateSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const output = document.getElementById(sliderId + '-output');
    output.innerHTML = slider.value + '%';
}

function formatInvestment() {
    let investment = document.getElementById('investment').value.replace(/,/g, '');
    if (investment < 5000000) {
        alert('Minimum investment amount is ₹50,00,000.');
        investment = 5000000;
    }
    document.getElementById('investment').value = parseInt(investment).toLocaleString('en-IN');
}

function calculateResults() {
    let investment = parseFloat(document.getElementById('investment').value.replace(/,/g, ''));
    const fixedFeeOption = parseFloat(document.querySelector('input[name="fixedFee"]:checked').value);
    const otherExpensesRate = parseFloat(document.getElementById('otherExpenses').value) / 100;
    const period = parseInt(document.getElementById('period').value);

    let highWatermark = investment;
    let totalFixedFees = 0;
    let totalOtherExpenses = 0;
    let totalPerformanceFees = 0;
    let yearEndNav = investment;

    // Table structure to display results
    let resultHtml = `
        <table>
            <tr>
                <th>Year</th>
                <th>Fixed Fee (₹)</th>
                <th>Other Expenses (₹)</th>
                <th>High Watermark (₹)</th>
                <th>Performance Fee (₹)</th>
                <th>Total Fees + Other Expenses (₹)</th>
                <th>Year End NAV (₹)</th>
            </tr>
    `;

    for (let i = 1; i <= period; i++) {
        const expectedReturn = parseFloat(document.getElementById(`return${i}`).value) / 100;
        const navBeforeFees = highWatermark * (1 + expectedReturn);

        // Calculate average NAV
        const averageNav = (highWatermark + navBeforeFees) / 2;
        let fixedFee = 0;
        let performanceFee = 0;
        let hurdleRate = 0;

        // Fixed fee calculation based on selected option
        if (fixedFeeOption === 1) {
            fixedFee = averageNav * 0.01;
            hurdleRate = 0.10;
            if (expectedReturn > hurdleRate) {
                const hurdleAmount = highWatermark * (1 + hurdleRate);
                const excessReturn = navBeforeFees - hurdleAmount;
                performanceFee = excessReturn * 0.20;
            }
        } else if (fixedFeeOption === 2) {
            fixedFee = averageNav * 0.02;
            hurdleRate = 0.15;
            if (expectedReturn > hurdleRate) {
                const hurdleAmount = highWatermark * (1 + hurdleRate);
                const excessReturn = navBeforeFees - hurdleAmount;
                performanceFee = excessReturn * 0.20;
            }
        } else if (fixedFeeOption === 3) {
            fixedFee = averageNav * 0.03;
        }

        // Calculate other expenses based on average NAV
        const otherExpenses = averageNav * otherExpensesRate;

        // Total fees for the year
        const totalYearlyFees = fixedFee + otherExpenses + performanceFee;

        // Calculate Year End NAV after fees
        yearEndNav = navBeforeFees - totalYearlyFees;

        // Update High Watermark if Year End NAV exceeds it
        highWatermark = Math.max(highWatermark, yearEndNav);

        // Accumulate totals for each fee type
        totalFixedFees += fixedFee;
        totalOtherExpenses += otherExpenses;
        totalPerformanceFees += performanceFee;

        // Append row data to the result table
        resultHtml += `
            <tr>
                <td>Year ${i}</td>
                <td>₹${fixedFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${otherExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${highWatermark.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${performanceFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${totalYearlyFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${yearEndNav.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
        `;
    }

    // Total row for all fees
    resultHtml += `
        <tr>
            <td>Total</td>
            <td>₹${totalFixedFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>₹${totalOtherExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>-</td>
            <td>₹${totalPerformanceFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>-</td>
            <td>₹${yearEndNav.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
    `;
    resultHtml += '</table>';

    // Display the result in the HTML
    document.getElementById('result').innerHTML = resultHtml;
}

// Automatically generate the sliders when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateSliders();
});
