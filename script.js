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
        yearEndNav = highWatermark * (1 + returns[i]);

        const fixedFee = highWatermark * fixedFeeRate;
        const otherExpenses = highWatermark * otherExpensesRate;
        const totalYearlyFees = fixedFee + otherExpenses;

        totalFixedFees += fixedFee;
        totalOtherExpenses += otherExpenses;
        totalFees += totalYearlyFees;

        highWatermark = Math.max(highWatermark, yearEndNav);

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

    document.getElementById('result').innerHTML = resultTable;
}
