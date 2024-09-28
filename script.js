// Function to calculate and display results with corrected performance fee calculation
function calculateResults() {
    let initialInvestment = parseFloat(document.getElementById('investment').value.replace(/,/g, ''));
    const fixedFeeRate = parseFloat(document.querySelector('input[name="fixedFee"]:checked').value) / 100;
    const otherExpensesRate = parseFloat(document.getElementById('otherExpenses').value) / 100;
    const performanceFeeRate = 0.2; // Performance Fee is 20% on gains over hurdle rate
    let hurdleRate = 0.1; // Default Hurdle Rate (10%)
    const period = parseInt(document.getElementById('period').value);

    // Set hurdle rate based on the selected fixed fee slab
    if (fixedFeeRate === 0.02) {
        hurdleRate = 0.15; // 15% hurdle rate for the 2% fixed fee slab
    }

    let highWatermark = initialInvestment; // Initialize high watermark as the initial investment
    let yearEndNav = initialInvestment; // Initialize NAV for year-end
    let previousHighWatermark = highWatermark;

    let totalFixedFees = 0;
    let totalOtherExpenses = 0;
    let totalPerformanceFees = 0;

    // Table structure to display results with updated Year column width
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

        // Calculate High Watermark for the current year
        highWatermark = Math.max(previousHighWatermark, navAfterOtherExpenses);

        // Calculate Fund Performance above High Watermark and Hurdle Rate
        const {
            fundPerformanceAboveHighWatermark,
            fundPerformanceAboveHurdleRate
        } = calculateFundPerformance(navAfterOtherExpenses, previousHighWatermark, hurdleRate);

        // Calculate Performance Fee (only for 1% and 2% slabs)
        let performanceFee = 0;
        if (fixedFeeRate < 0.03) { // Performance Fee applicable only for 1% and 2% slabs
            performanceFee = calculatePerformanceFee(fundPerformanceAboveHurdleRate, performanceFeeRate);
        }

        // Total Fees for the year (Fixed Fee + Other Expenses + Performance Fee)
        const totalFees = fixedFee + otherExpenses + performanceFee;

        // Year-End NAV after deducting all fees
        yearEndNav = navAfterOtherExpenses - performanceFee;

        // Store the High Watermark for the next iteration
        previousHighWatermark = highWatermark;

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
