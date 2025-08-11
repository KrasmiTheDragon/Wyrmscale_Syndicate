let ws;
let reconnectInterval = null;

function connectWebSocket() {
    ws = new WebSocket('ws://127.0.0.1:8080');
    const statusOverlay = document.getElementById('statusOverlay');
    const characterContainer = document.querySelector('.character-container');
    const fadeContainer = document.querySelector('.character-fade-container');
    let hideTimeout = null;

    statusOverlay.textContent = "Connecting...";
    statusOverlay.className = "status-overlay";
    characterContainer.classList.remove('visible');
    fadeContainer.classList.remove('visible');

    ws.onopen = () => {
        statusOverlay.textContent = "Connected";
        statusOverlay.className = "status-overlay connected";
        setTimeout(() => {
            statusOverlay.classList.add('hide');
        }, 1500);
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        characterContainer.classList.remove('visible');

       

        console.log("Subscribe to events");
        ws.send(
	        JSON.stringify({
	    	request: "Subscribe",
	    	id: "subscribe-events-id",
    		// This is the list of Streamer.bot websocket events to subscribe to
	    	// See full list of events here:
	    	// https://wiki.streamer.bot/en/Servers-Clients/WebSocket-Server/Requests 
	    	events: {
	    		general: [
	    			"Custom"
			]
		}
	})
);

       
    };

    ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received:', data);

    // Handle subscription response
    if (data.id && data.status) {
        if (data.status === 'ok') {
            console.log(`Request ${data.id} succeeded`);
        } else {
            console.error(`Request ${data.id} failed: ${data.error}`);
        }
    }

    // Handle GetEvents response
    if (data.id && data.id.includes('-events')) {
        console.log('Available events:', data.events);
        if (!data.events?.Custom?.includes('CharacterUpdate')) {
            console.warn('CharacterUpdate event not found. Verify event name/category.');
        }
    }

    // Handle CharacterUpdate event
    if (data.event?.type === 'CharacterUpdate' && data.event?.source === 'Custom') {
        statusOverlay.classList.add('hide');
        characterContainer.classList.add('visible');
        fadeContainer.classList.add('visible');

        // Handle R6S (attacker and defender)
        if (data.data?.r6Attacker && data.data?.r6Defender) {
            document.getElementById('Title').textContent = "Next character is:";
            document.getElementById('attackerImage').src = `https://cdn.r6roulette.de/attacker/${data.data.r6Attacker.replace(/ /g, '_')}.png`;
            document.getElementById('attackerName').textContent = data.data.r6Attacker;
            document.getElementById('defenderImage').src = `https://cdn.r6roulette.de/defender/${data.data.r6Defender.replace(/ /g, '_')}.png`;
            document.getElementById('defenderName').textContent = data.data.r6Defender;
            document.getElementById('attackerSection').style.display = 'block';
            document.getElementById('defenderSection').style.display = 'block';
            document.getElementById('singleSection').style.display = 'none';
        }
        // Handle Apex Legends
        else if (data.data?.apex) {
            document.getElementById('Title').textContent = "Next character is:";
            document.getElementById('singleImage').src = `https://example.com/${data.data.apex.replace(/ /g, '_')}.png`; // Update URL
            document.getElementById('singleName').textContent = data.data.apex;
            document.getElementById('singleSection').style.display = 'block';
            document.getElementById('attackerSection').style.display = 'none';
            document.getElementById('defenderSection').style.display = 'none';
        }
        // Handle Overwatch 2
        else if (data.data?.owTank && data.data?.owDps && data.data?.owSupport) {
            document.getElementById('Title').textContent = "Next character is:";
            document.getElementById('singleName').textContent = `Tank: ${data.data.owTank}, DPS: ${data.data.owDps}, Support: ${data.data.owSupport}`;
            document.getElementById('singleImage').src = `https://example.com/overwatch.png`; // Update with actual image URL
            document.getElementById('singleSection').style.display = 'block';
            document.getElementById('attackerSection').style.display = 'none';
            document.getElementById('defenderSection').style.display = 'none';
        }

        // Reset hide timeout
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            fadeContainer.classList.remove('visible');
        }, 30000);
    }
};

    ws.onclose = () => {
        statusOverlay.textContent = "Connecting...";
        statusOverlay.className = "status-overlay";
        statusOverlay.style.background = "red";
        statusOverlay.classList.remove('hide');
        characterContainer.classList.remove('visible');
        fadeContainer.classList.remove('visible');
        if (!reconnectInterval) {
            reconnectInterval = setInterval(() => {
                connectWebSocket();
            }, 2000);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        statusOverlay.textContent = "Error";
        statusOverlay.className = "status-overlay";
        statusOverlay.style.background = "red";
        statusOverlay.classList.remove('hide');
        characterContainer.classList.remove('visible');
        fadeContainer.classList.remove('visible');
        // Let onclose handle reconnection
    };
}

connectWebSocket();