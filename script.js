// Function to format numbers with commas for readability
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Function to calculate Fixed Fee based on average NAV
function calculateFixedFee(averageNav, fixedFeeRate) {
    return averageNav * fixedFeeRate;
}

// Function to calculate Other Expenses based on the average NAV
function calculateOtherExpenses(openingNav, navAfterFixedFee, otherExpensesRate) {
    const averageNavOtherExpenses = (openingNav + navAfterFixedFee) / 2;
    return averageNavOtherExpenses * otherExpensesRate;
}

// Function to calculate Performance Fee based on the Hurdle Rate and High Watermark
function calculatePerformanceFee(fundPerformanceAboveHurdleRate, performanceFeeRate) {
    return fundPerformanceAboveHurdleRate > 0 ? fundPerformanceAboveHurdleRate * performanceFeeRate : 0;
}

// Function to calculate Fund Performance above High Watermark and Hurdle Rate
function calculateFundPerformance(navAfterOtherExpenses, highWatermark, hurdleRate) {
    const fundPerformanceAboveHighWatermark = navAfterOtherExpenses - highWatermark;
    const hurdleAmount = highWatermark * (1 + hurdleRate);
    const fundPerformanceAboveHurdleRate = fundPerformanceAboveHighWatermark - (hurdleAmount - highWatermark);
    return {
        fundPerformanceAboveHighWatermark,
        fundPerformanceAboveHurdleRate: fundPerformanceAboveHurdleRate > 0 ? fundPerformanceAboveHurdleRate : 0
    };
}

// Function to calculate and display results
function calculateResults() {
    let initialInvestment = parseFloat(document.getElementById('investment').value.replace(/,/g, ''));
    const fixedFeeRate = parseFloat(document.querySelector('input[name="fixedFee"]:checked').value) / 100;
    const otherExpensesRate = parseFloat(document.getElementById('otherExpenses').value) / 100;
    const performanceFeeRate = 0.2; // Performance Fee is 20% on gains over hurdle rate
    let hurdleRate = 0.1; // Default Hurdle Rate (10%)
    const period = parseInt(document.getElementById('period').value);

    let highWatermark = initialInvestment;
    let yearEndNav = initialInvestment;

    let totalFixedFees = 0;
    let totalOtherExpenses = 0;
    let totalPerformanceFees = 0;

    let resultHtml = `
        <table>
            <tr>
                <th style="width: 100px;">Year</th>
                <th>Fixed Fee (₹)</th>
                <th>Other Expenses (₹)</th>
                <th>Performance Fee (₹)</th>
                <th>Total Fees (₹)</th>
                <th>High Watermark (₹)</th>
                <th>Year End NAV (₹)</th>
            </tr>
    `;

    for (let i = 1; i <= period; i++) {
        const expectedReturn = parseFloat(document.getElementById(`return${i}`).value) / 100;

        // Calculate NAV after Expected Return
        const navBeforeFees = yearEndNav * (1 + expectedReturn);

        // Calculate the average NAV for the year (for Fixed Fee calculation)
        const averageNavFixedFee = (yearEndNav + navBeforeFees) / 2;

        // Calculate Fixed Fee based on the average NAV
        const fixedFee = calculateFixedFee(averageNavFixedFee, fixedFeeRate);

        // NAV after Fixed Fee is deducted
        const navAfterFixedFee = navBeforeFees - fixedFee;

        // Calculate Other Expenses based on the average NAV after Fixed Fee
        const otherExpenses = calculateOtherExpenses(yearEndNav, navAfterFixedFee, otherExpensesRate);

        // NAV after Other Expenses are deducted
        const navAfterOtherExpenses = navAfterFixedFee - otherExpenses;

        // Calculate Fund Performance above High Watermark and Hurdle Rate
        const {
            fundPerformanceAboveHighWatermark,
            fundPerformanceAboveHurdleRate
        } = calculateFundPerformance(navAfterOtherExpenses, highWatermark, hurdleRate);

        // Calculate Performance Fee (only for 1% and 2% slabs)
        let performanceFee = 0;
        if (fixedFeeRate < 0.03) {
            performanceFee = calculatePerformanceFee(fundPerformanceAboveHurdleRate, performanceFeeRate);
        }

        // Total Fees for the year (Fixed Fee + Other Expenses + Performance Fee)
        const totalFees = fixedFee + otherExpenses + performanceFee;

        // Year-End NAV after deducting all fees
        yearEndNav = navAfterOtherExpenses - performanceFee;

        // Update high watermark if Year-End NAV exceeds it
        highWatermark = Math.max(highWatermark, yearEndNav);

        // Accumulate totals for each fee type
        totalFixedFees += fixedFee;
        totalOtherExpenses += otherExpenses;
        totalPerformanceFees += performanceFee;

        // Append row data to the result table with formatted numbers, including High Watermark
        resultHtml += `
            <tr>
                <td>Year ${i}</td>
                <td>${formatCurrency(fixedFee)}</td>
                <td>${formatCurrency(otherExpenses)}</td>
                <td>${formatCurrency(performanceFee)}</td>
                <td>${formatCurrency(totalFees)}</td>
                <td>${formatCurrency(highWatermark)}</td>
                <td>${formatCurrency(yearEndNav)}</td>
            </tr>
        `;
    }

    // Total row for all fees
    resultHtml += `
        <tr>
            <td>Total</td>
            <td>${formatCurrency(totalFixedFees)}</td>
            <td>${formatCurrency(totalOtherExpenses)}</td>
            <td>${formatCurrency(totalPerformanceFees)}</td>
            <td>-</td>
            <td>-</td>
            <td>${formatCurrency(yearEndNav)}</td>
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
