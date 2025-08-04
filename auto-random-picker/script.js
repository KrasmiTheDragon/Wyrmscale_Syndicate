const ws = new WebSocket('ws://127.0.0.1:8080');

ws.onopen = () => {
    console.log('Connected to Streamer.bot WebSocket');
    ws.send(JSON.stringify({
        request: 'Subscribe',
        id: 'my-subscribe-id',
        events: { 'General': ['Custom'] }
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received data:', data);

    if (data.event === 'CharacterUpdate') {
        // Handle R6S (attacker and defender)
        if (data.r6Attacker && data.r6Defender) {
            document.getElementById('defenderImage').src = `https://cdn.r6roulette.de/attacker/${data.r6Attacker.replace(/ /g, '_')}.png`;
            document.getElementById('attackerName').textContent = data.r6Attacker;
            document.getElementById('defenderImage').src = `https://cdn.r6roulette.de/defender/${data.r6Defender.replace(/ /g, '_')}.png`;
            document.getElementById("defenderName").textContent = data.r6Defender;
            document.getElementById('attackerSection').style.display = 'block';
            document.getElementById('defenderSection').style.display = 'block';
            document.getElementById('singleSection').style.display = 'none';
			location.reload();
        }
        // Handle single character games (e.g., Apex)
        else if (data.apex) {
            document.getElementById('singleImage').src = `https://example.com/${data.apex.replace(/ /g, '_')}.png`;
            document.getElementById('singleName').textContent = data.apex;
            document.getElementById('singleSection').style.display = 'block';
            document.getElementById('attackerSection').style.display = 'none';
            document.getElementById('defenderSection').style.display = 'none';
			location.reload();
        }
    }
};

ws.onclose = () => console.log('Disconnected from Streamer.bot WebSocket');
ws.onerror = (error) => console.error('WebSocket error:', error);