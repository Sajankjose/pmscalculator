function updateSliderValue(sliderId) {
    const slider = document.getElementById(sliderId);
    const output = document.getElementById(sliderId + '-output');
    output.innerHTML = slider.value + '%';
}

function formatInvestment() {
    let investment = document.getElementById('investment').value.replace(/,/g, '');
    if (investment < 5000000) {
        alert('Minimum investment amount is ₹50,00,000.');
        investment = 5000000;
    }
    document.getElementById('investment').value = parseInt(investment).toLocaleString('en-IN');
}

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

// Automatically generate the sliders when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateSliders();
});
