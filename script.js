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
function calculateFixedFee(initialNav, currentNav, fixedFeeRate) {
    const averageNav = (initialNav + currentNav) / 2;
    return averageNav * fixedFeeRate;
}

// Function to calculate Other Expenses based on the average NAV after Fixed Fee
function calculateOtherExpenses(navAfterFixedFee, initialNav, otherExpensesRate) {
    const averageNav = (navAfterFixedFee + initialNav) / 2;
    return averageNav * otherExpensesRate;
}

// Function to calculate Performance Fee based on the Hurdle Rate
function calculatePerformanceFee(navAfterFees, hurdleRate, highWatermark, performanceFeeRate) {
    const hurdleAmount = highWatermark * (1 + hurdleRate);
    if (navAfterFees > hurdleAmount) {
        const excessGain = navAfterFees - hurdleAmount;
        return excessGain * performanceFeeRate;
    }
    return 0;
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
        const navBeforeFees = yearEndNav * (1 + expectedReturn);

        // Calculate Fixed Fee
        const fixedFee = calculateFixedFee(yearEndNav, navBeforeFees, fixedFeeRate);

        // NAV after charging Fixed Fee
        const navAfterFixedFee = navBeforeFees - fixedFee;

        // Calculate Other Expenses
        const otherExpenses = calculateOtherExpenses(navAfterFixedFee, initialInvestment, otherExpensesRate);

        // NAV after charging Other Expenses
        const navAfterOtherExpenses = navAfterFixedFee - otherExpenses;

        // Calculate Performance Fee (only for 1% and 2% slabs)
        let performanceFee = 0;
        if (fixedFeeRate < 0.03) { // No performance fee for 3% slab
            performanceFee = calculatePerformanceFee(navAfterOtherExpenses, hurdleRate, highWatermark, performanceFeeRate);
        }

        // Total Fees for the Year
        const totalFees = fixedFee + otherExpenses + performanceFee;

        // Year-End NAV after charging all fees
        yearEndNav = navBeforeFees - totalFees;

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
                <td>₹${fixedFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${otherExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${performanceFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${totalFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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
