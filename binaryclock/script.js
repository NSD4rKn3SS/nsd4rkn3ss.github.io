// Function to update the binary clock
function updateClock() {
    const time = new Date();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // Update hour digits
    updateByte("hour", hours);

    // Update minute digits
    updateByte("minute", minutes);

    // Update second digits
    updateByte("second", seconds);
}

// Function to update a byte (section) of the clock
function updateByte(section, value) {
    const byteElements = document.querySelectorAll(`#${section} .digit`);
    const binaryValue = value.toString(2).padStart(6, '0');

    for (let i = 0; i < byteElements.length; i++) {
        const digit = byteElements[i];
        const isActive = binaryValue.charAt(i) === '1';

        digit.textContent = binaryValue.charAt(i);

        if (isActive) {
            digit.classList.add('active');
        } else {
            digit.classList.remove('active');
        }
    }
}

// Update the clock every second
setInterval(updateClock, 1000);