function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function updateClock() {
    const now = new Date();
    const mode = getQueryParam('mode');
    let time, date;

    // Handle time format and seconds
    if (mode === '24h') {
        time = now.toLocaleTimeString('en-US', { hour12: true });
    } else {
        time = now.toLocaleTimeString('en-US', { hour12: false });
    }
    if (mode === 'noseconds') {
        time = time.replace(/\s*:\d{2}$/, ''); // Remove seconds 
    }

    // Handle date and layout
    date = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase().replace(/,/g, '');
    const container = document.querySelector('.clock-container');
    if (mode === 'single') {
        container.classList.add('single-line');
    } else {
        container.classList.remove('single-line');
    }

    document.getElementById('clock').textContent = time;
    document.getElementById('date').textContent = date;
}

setInterval(updateClock, 1000);
updateClock();