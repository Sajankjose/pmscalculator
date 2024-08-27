// Function to update the percentage value displayed next to the slider
function updateSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const output = document.getElementById(sliderId + '-output');
    output.innerHTML = slider.value + '%';
}

// Function to calculate the fees and NAV based on the input values
function calculateFees() {
    // Retrieve input values
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
    let totalFees = 0;
    let yearEndNav = investment;
    let resultTable = `
        <table>
            <tr>
                <th>Particulars</th>
                <th>Fixed Fee</th>
                <th>Other Expenses</th>
                <th>High Watermark</th>
                <th>Total Fees + Other Expenses</th>
                <th>Year End NAV</th>
            </tr>
    `;

    for (let i = 0; i < period; i++) {
        // Calculate the year-end NAV
        yearEndNav = highWatermark * (1 + returns[i]);

        // Calculate the fees
        const fixedFee = highWatermark * fixedFeeRate;
        const otherExpenses = highWatermark * otherExpensesRate;
        const totalYearlyFees = fixedFee + otherExpenses;

        totalFixedFees += fixedFee;
        totalOtherExpenses += otherExpenses;
        totalFees += totalYearlyFees;

        // Update the high watermark
        highWatermark = Math.max(highWatermark, yearEndNav);

        // Append the results for the current year to the table
        resultTable += `
            <tr>
                <td>Year ${i + 1}</td>
                <td>INR ${fixedFee.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                <td>INR ${otherExpenses.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                <td>INR ${highWatermark.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                <td>INR ${totalYearlyFees.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                <td>INR ${yearEndNav.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            </tr>
        `;
    }

    // Append the totals row to the table
    resultTable += `
        <tr>
            <td>Total</td>
            <td>INR ${totalFixedFees.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            <td>INR ${totalOtherExpenses.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            <td>-</td>
            <td>INR ${totalFees.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
            <td>-</td>
        </tr>
    `;
    resultTable += '</table>';

    // Display the result table in the HTML
    document.getElementById('result').innerHTML = resultTable;
}

// Event listeners for the sliders to update the percentage values when they are changed
document.getElementById('return1').addEventListener('input', function() { updateSliderValue('return1'); });
document.getElementById('return2').addEventListener('input', function() { updateSliderValue('return2'); });
document.getElementById('return3').addEventListener('input', function() { updateSliderValue('return3'); });
document.getElementById('return4').addEventListener('input', function() { updateSliderValue('return4'); });
document.getElementById('return5').addEventListener('input', function() { updateSliderValue('return5'); });
document.getElementById('return6').addEventListener('input', function() { updateSliderValue('return6'); });
