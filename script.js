function updateSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const output = document.getElementById(sliderId + '-output');
    output.innerHTML = slider.value + '%';
}

function calculateFees() {
    const investment = parseFloat(document.getElementById('investment').value);
    const fixedFeeRate = parseFloat(document.getElementById('fixedFee').value) / 100;
    const otherExpensesRate = parseFloat(document.getElementById('otherExpenses').value) / 100;
    const period = parseInt(document.getElementById('period').value);
    const returns = [
        parseFloat(document.getElementById('return1').value) / 100,
        parseFloat(document.getElementById('return2').value) / 100,
        parseFloat(document.getElementById('return3').value) / 100,
        parseFloat(document.getElementById('return4').value) / 100,
        parseFloat(document.getElementById('return5').value) / 100,
        parseFloat(document.getElementById('return6').value) / 100
    ];

    let highWatermark = investment;
    let totalFixedFees = 0;
    let totalOtherExpenses = 0;
    let totalPerformanceFees = 0;
    let totalFees = 0;
    let yearEndNav = investment;
    let resultTable = `
        <table>
            <tr>
                <th>Particulars</th>
                <th>Fixed Fee</th>
                <th>Other Expenses</th>
                <th>High Watermark</th>
                <th>Performance Fee</th>
                <th>Total Fees + Other Expenses</th>
                <th>Year End NAV</th>
            </tr>
    `;

    for (let i = 0; i < period; i++) {
        // Calculate the Fixed Fee
        const fixedFee = highWatermark * fixedFeeRate;
        // Calculate the Other Expenses
        const otherExpenses = highWatermark * otherExpensesRate;

        // Calculate the Performance Fee only if the return exceeds 10%
        let performanceFee = 0;
        if (returns[i] > 0.10) {
            const excessReturn = returns[i] - 0.10;
            performanceFee = highWatermark * excessReturn * 0.20;
        }

        // Total Fees + Other Expenses
        const totalYearlyFees = fixedFee + performanceFee + otherExpenses;

        // Update Year End NAV
        yearEndNav = highWatermark * (1 + returns[i]) - totalYearlyFees;

        // Update the High Watermark if the Year End NAV exceeds it
        highWatermark = Math.max(highWatermark, yearEndNav);

        // Accumulate totals for each fee type
        totalFixedFees += fixedFee;
        totalOtherExpenses += otherExpenses;
        totalPerformanceFees += performanceFee;
        totalFees += totalYearlyFees;

        resultTable += `
            <tr>
                <td>Year ${i + 1}</td>
                <td>INR ${fixedFee.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                <td>INR ${otherExpenses.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                <td>INR ${highWatermark.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                <td>INR ${performanceFee.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                <td>INR ${totalYearlyFees.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                <td>INR ${yearEndNav.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            </tr>
        `;
    }

    resultTable += `
        <tr>
            <td>Total</td>
            <td>INR ${totalFixedFees.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            <td>INR ${totalOtherExpenses.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            <td>-</td>
            <td>INR ${totalPerformanceFees.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            <td>INR ${totalFees.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            <td>-</td>
        </tr>
    `;
    resultTable += '</table>';

    document.getElementById('result').innerHTML = resultTable;
}

// Event listeners for the sliders to update the percentage values when they are changed
document.getElementById('return1').addEventListener('input', function() { updateSliderValue('return1'); });
document.getElementById('return2').addEventListener('input', function() { updateSliderValue('return2'); });
document.getElementById('return3').addEventListener('input', function() { updateSliderValue('return3'); });
document.getElementById('return4').addEventListener('input', function() { updateSliderValue('return4'); });
document.getElementById('return5').addEventListener('input', function() { updateSliderValue('return5'); });
document.getElementById('return6').addEventListener('input', function() { updateSliderValue('return6'); });
