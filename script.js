// Function to format numbers with commas for readability (e.g., ₹87,510.62)
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Function to update the slider values dynamically
function updateSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const output = document.getElementById(sliderId + '-output');
    output.innerHTML = slider.value + '%';
}

// Function to format the investment input with commas and validate minimum
function formatInvestment() {
    let investment = document.getElementById('investment').value.replace(/,/g, '');
    if (investment < 5000000) {
        alert('Minimum investment amount is ₹50,00,000.');
        investment = 5000000;
    }
    document.getElementById('investment').value = parseInt(investment).toLocaleString('en-IN');
}

// Function to dynamically generate sliders based on the number of years
function updateSliders() {
    const period = parseInt(document.getElementById('period').value);
    const maxPeriod = 6;

    if (period < 1 || period > maxPeriod) {
        alert(`Please enter a period between 1 and ${maxPeriod} years.`);
        document.getElementById('period').value = 6; // Reset to a default value
        return;
    }

    const sliderContainer = document.getElementById('sliderContainer');
    sliderContainer.innerHTML = ''; // Clear existing sliders

    for (let i = 1; i <= period; i++) {
        const sliderGroup = document.createElement('div');
        sliderGroup.className = 'form-group';

        const label = document.createElement('label');
        label.htmlFor = `return${i}`;
        label.innerText = `Expected Return in Year ${i} (%):`;
        sliderGroup.appendChild(label);

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = `return${i}`;
        slider.min = '0';
        slider.max = '100';
        slider.value = '10'; // Default value
        slider.oninput = function() { updateSliderValue(slider.id); };
        sliderGroup.appendChild(slider);

        const rangeOutput = document.createElement('div');
        rangeOutput.className = 'range-output';
        rangeOutput.id = `return${i}-output`;
        rangeOutput.innerText = '10%'; // Default output
        sliderGroup.appendChild(rangeOutput);

        sliderContainer.appendChild(sliderGroup);
    }
}

// Function to calculate Fixed Fee based on average NAV
function calculateFixedFee(averageNav, fixedFeeRate) {
    return averageNav * fixedFeeRate;
}

// Function to calculate Other Expenses based on the corrected NAV after Fixed Fee
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
    // Fund performance above High Watermark
    const fundPerformanceAboveHighWatermark = navAfterOtherExpenses - highWatermark;

    // Calculate hurdle rate performance (difference between High Watermark and Hurdle Rate)
    const hurdleAmount = highWatermark * (1 + hurdleRate);
    const fundPerformanceAboveHurdleRate = fundPerformanceAboveHighWatermark - (hurdleAmount - highWatermark);

    return {
        fundPerformanceAboveHighWatermark,
        fundPerformanceAboveHurdleRate: fundPerformanceAboveHurdleRate > 0 ? fundPerformanceAboveHurdleRate : 0 // Ensure it's not negative
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
    }

    let highWatermark = initialInvestment; // Initialize high watermark as initial investment
    let yearEndNav = initialInvestment; // Initialize NAV for year-end

    let totalFixedFees = 0;
    let totalOtherExpenses = 0;
    let totalPerformanceFees = 0;

    // Table structure to display results with updated Year column width
    let resultHtml = `
        <table>
            <tr>
                <th style="width: 100px;">Year</th> <!-- Adjusted width for Year column -->
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
