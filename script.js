function updateSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const output = document.getElementById(sliderId + '-output');
    output.innerHTML = slider.value + '%';
}

function validateOtherExpenses() {
    const otherExpenses = parseFloat(document.getElementById('otherExpenses').value);
    if (otherExpenses < 0.20 || otherExpenses > 0.50) {
        alert('Other Expenses must be between 0.20% and 0.50%');
        document.getElementById('otherExpenses').value = 0.20;
    }
}

function updateSliders() {
    const period = parseInt(document.getElementById('period').value);
    const maxPeriod = 20;

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

function calculateResults() {
    const investment = parseFloat(document.getElementById('investment').value);
    const fixedFeeOption = parseFloat(document.querySelector('input[name="fixedFee"]:checked').value);
    const otherExpensesRate = parseFloat(document.getElementById('otherExpenses').value) / 100;
    const period = parseInt(document.getElementById('period').value);

    let highWatermark = investment;
    let totalFixedFees = 0;
    let totalOtherExpenses = 0;
    let totalPerformanceFees = 0;
    let totalFees = 0;
    let yearEndNav = investment;
    let resultHtml = `
        <table>
            <tr>
                <th>Year</th>
                <th>Fixed Fee (₹)</th>
                <th>Other Expenses (₹)</th>
                <th>Performance Fee (₹)</th>
                <th>High Watermark (₹)</th>
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
        
        // Calculate fixed fee and performance fee based on the selected option
        if (fixedFeeOption === 1) { // Option 3: 1% Flat fee + Performance Fee > 10% return
            fixedFee = averageNav * 0.01;
            hurdleRate = 0.10;
            if (expectedReturn > hurdleRate) {
                const hurdleAmount = highWatermark * (1 + hurdleRate);
                const excessReturn = navBeforeFees - hurdleAmount;
                performanceFee = excessReturn * 0.20;
            }
        } else if (fixedFeeOption === 2) { // Option 2: 2% Flat fee + Performance Fee > 15% return
            fixedFee = averageNav * 0.02;
            hurdleRate = 0.15;
            if (expectedReturn > hurdleRate) {
                const hurdleAmount = highWatermark * (1 + hurdleRate);
                const excessReturn = navBeforeFees - hurdleAmount;
                performanceFee = excessReturn * 0.20;
            }
        } else if (fixedFeeOption === 3) { // Option 1: 3% Flat fee
            fixedFee = averageNav * 0.03;
        }

        // Calculate other expenses
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
        totalFees += totalYearlyFees;

        resultHtml += `
            <tr>
                <td>Year ${i}</td>
                <td>₹${fixedFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${otherExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>
                    ₹${performanceFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })} <br>
                    <small>(High Watermark: ₹${highWatermark.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, Hurdle Rate: ${hurdleRate * 100}%)</small>
                </td>
                <td>₹${totalYearlyFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td>₹${yearEndNav.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
        `;
    }

    resultHtml += `
        <tr>
            <td>Total</td>
            <td>₹${totalFixedFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>₹${totalOtherExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>₹${totalPerformanceFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td colspan="2">-</td>
        </tr>
    `;
    resultHtml += '</table>';

    document.getElementById('result').innerHTML = resultHtml;
}

// Initialize sliders when the page loads
document.addEventListener('DOMContentLoaded', updateSliders);
