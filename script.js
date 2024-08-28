function updateSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const output = document.getElementById(sliderId + '-output');
    output.innerHTML = slider.value + '%';
}

function generatePDF() {
    const investment = parseFloat(document.getElementById('investment').value);
    const fixedFeeRate = parseFloat(document.getElementById('fixedFee').value) / 100;
    const otherExpensesRate = parseFloat(document.getElementById('otherExpenses').value) / 100;
    const hurdleRate = 0.10; // 10% Hurdle Rate
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

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add Geojit Logo
    doc.addImage("https://www.geojit.com/img/Geojit_logo.svg", "SVG", 10, 10, 50, 15);

    // Add Title
    doc.setFontSize(16);
    doc.text("PMS Fee Calculator", 10, 40);

    // Add User Input Summary
    doc.setFontSize(12);
    doc.text("User Inputs:", 10, 50);
    doc.text(`Initial Investment: ₹${investment.toLocaleString('en-IN')}`, 10, 60);
    doc.text(`Fixed Fee: ${fixedFeeRate * 100}%`, 10, 70);
    doc.text(`Other Expenses: ${otherExpensesRate * 100}%`, 10, 80);
    doc.text(`Period of Investment: ${period} Years`, 10, 90);
    doc.text(`Expected Returns: ${returns.map(r => (r * 100).toFixed(2) + '%').join(', ')}`, 10, 100);

    const data = [];
    for (let i = 0; i < period; i++) {
        // Calculate the NAV before fees
        let navBeforeFees = highWatermark * (1 + returns[i]);

        // Fixed Fee Calculation
        const averageNavFixedFee = (highWatermark + navBeforeFees) / 2;
        const fixedFee = averageNavFixedFee * fixedFeeRate;

        // Other Expenses Calculation
        const averageNavOtherExpenses = (highWatermark + navBeforeFees) / 2;
        const otherExpenses = averageNavOtherExpenses * otherExpensesRate;

        // Performance Fee Calculation
        let performanceFee = 0;
        const fundPerformanceAboveHurdleRate = navBeforeFees - highWatermark * (1 + hurdleRate);
        if (fundPerformanceAboveHurdleRate > 0) {
            performanceFee = fundPerformanceAboveHurdleRate * 0.20;
        }

        // Total Fees + Other Expenses
        const totalYearlyFees = fixedFee + otherExpenses + performanceFee;

        // Calculate Year End NAV after fees
        yearEndNav = navBeforeFees - totalYearlyFees;

        // Update High Watermark
        highWatermark = Math.max(highWatermark, yearEndNav);

        // Accumulate totals for each fee type
        totalFixedFees += fixedFee;
        totalOtherExpenses += otherExpenses;
        totalPerformanceFees += performanceFee;
        totalFees += totalYearlyFees;

        data.push([
            `Year ${i + 1}`,
            `₹${fixedFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            `₹${otherExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            `₹${highWatermark.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            `₹${performanceFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            `₹${totalYearlyFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            `₹${yearEndNav.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        ]);
    }

    // Generate Table in PDF
    doc.autoTable({
        head: [['Particulars', 'Fixed Fee', 'Other Expenses', 'High Watermark', 'Performance Fee', 'Total Fees + Other Expenses', 'Year End NAV']],
        body: data,
        startY: 110
    });

    // Add Footer Content
    doc.setFontSize(10);
    doc.text("Note:", 10, doc.autoTable.previous.finalY + 20);
    doc.text("Fixed fees are charged on a quarterly basis", 10, doc.autoTable.previous.finalY + 30);
    doc.text("Performance Fee is charged upon completion of 365 days from the investment date", 10, doc.autoTable.previous.finalY + 40);
    doc.text("All fees and charges are exclusive of GST.", 10, doc.autoTable.previous.finalY + 50);

    doc.text("Geojit Financial Services Ltd., Registered Office: 34/659-P, Civil Line Road, Padivattom, Kochi-682024, Kerala, India", 10, doc.autoTable.previous.finalY + 70);
    doc.text("Phone: +91 484-2901000. Website: www.geojit.com. Portfolio Manager: INP000003203", 10, doc.autoTable.previous.finalY + 80);

    // Save the PDF
    doc.save('PMS_Fee_Calculator.pdf');
}
