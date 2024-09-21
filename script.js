// Function to calculate Performance Fee based on the Hurdle Rate and High Watermark
function calculatePerformanceFee(fundPerformanceAboveHurdleRate, performanceFeeRate) {
    // Apply 20% performance fee to the amount above the hurdle rate, if it's positive
    return fundPerformanceAboveHurdleRate > 0 ? fundPerformanceAboveHurdleRate * performanceFeeRate : 0;
}

// Function to calculate Fund Performance above High Watermark and Hurdle Rate
function calculateFundPerformance(navAfterOtherExpenses, highWatermark, hurdleRate) {
    // Fund performance above High Watermark
    const fundPerformanceAboveHighWatermark = navAfterOtherExpenses - highWatermark;

    // Calculate hurdle rate performance (difference between High Watermark and Hurdle Rate)
    const hurdleAmount = highWatermark * (1 + hurdleRate);
    const fundPerformanceAboveHurdleRate = fundPerformanceAboveHighWatermark - (hurdleAmount - highWatermark);

    // Ensure Fund Performance Above Hurdle Rate is not negative
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

    // Set hurdle rate based on the selected fixed fee slab
    if (fixedFeeRate === 0.02) {
        hurdleRate = 0.15; // 15% hurdle rate for the 2% fixed fee slab
    } else if (fixedFeeRate === 0.03) {
        hurdleRate = 0; // No performance fee for 3% fixed fee
    }

    let highWatermark = initialInvestment; // Initialize high watermark
    let yearEndNav = initialInvestment; // Initialize NAV for year-end

    let totalFixedFees = 0;
    let totalOtherExpenses = 0;
    let totalPerformanceFees = 0;

    // Table structure to display results
    let resultHtml = `
        <table>
            <tr>
                <th>Year</th>
                <th>Fixed Fee (₹)</th>
                <th>Other Expenses (₹)</th>
                <th>Performance Fee (₹)</th>
                <th>Total Fees (₹)</th>
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
        if (fixedFeeRate < 0.03) { // Performance Fee applicable only for 1% and 2% slabs
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

        // Append row data to the result table
        resultHtml += `
            <tr>
                <td>Year ${i}</td>
                <td>₹${fixedFee.toFixed(2).toLocaleString('en-IN')}</td>
                <td>₹${otherExpenses.toFixed(2).toLocaleString('en-IN')}</td>
                <td>₹${performanceFee.toFixed(2).toLocaleString('en-IN')}</td>
                <td>₹${totalFees.toFixed(2).toLocaleString('en-IN')}</td>
                <td>₹${yearEndNav.toFixed(2).toLocaleString('en-IN')}</td>
            </tr>
        `;
    }

    // Total row for all fees
    resultHtml += `
        <tr>
            <td>Total</td>
            <td>₹${totalFixedFees.toFixed(2).toLocaleString('en-IN')}</td>
            <td>₹${totalOtherExpenses.toFixed(2).toLocaleString('en-IN')}</td>
            <td>₹${totalPerformanceFees.toFixed(2).toLocaleString('en-IN')}</td>
            <td>-</td>
            <td>₹${yearEndNav.toFixed(2).toLocaleString('en-IN')}</td>
        </tr>
    `;
    resultHtml += '</table>';

    // Display the result in the HTML
    document.getElementById('result').innerHTML = resultHtml;
}
