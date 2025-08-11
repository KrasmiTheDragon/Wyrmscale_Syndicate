// Configuration - Replace with your own keys
const TWITCH_CLIENT_ID = 'YOUR_TWITCH_CLIENT_ID'; // Register at https://dev.twitch.tv/console/apps
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Get from https://console.developers.google.com/

// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode') || '';
const orientation = urlParams.get('orientation') || 'horizontal';
const usernames = mode.split(',').map(u => u.trim()).filter(u => u);

const twitchUser = usernames[0] || null;
const ytUser = usernames[1] || null;
const kickUser = usernames[2] || null;

const metricsDiv = document.getElementById('metrics');
if (orientation === 'vertical') {
    metricsDiv.classList.add('vertical');
}

if (!twitchUser && !ytUser && !kickUser) {
    metricsDiv.innerHTML = '<p>No usernames provided. Use ?mode=twitch_user,youtube_user,kick_user</p>';
    document.body.style.justifyContent = 'center';
}

// Function to fetch Twitch data
async function fetchTwitchData(user) {
    if (!user) return { followers: 0, subs: 0, viewers: 0 };
    try {
        const channelRes = await fetch(`https://api.twitch.tv/kraken/channels/${user}`, {
            headers: { 'Client-ID': TWITCH_CLIENT_ID }
        });
        const channelData = await channelRes.json();
        const followers = channelData.followers || 0;

        const streamRes = await fetch(`https://api.twitch.tv/kraken/streams/${user}`, {
            headers: { 'Client-ID': TWITCH_CLIENT_ID }
        });
        const streamData = await streamRes.json();
        const viewers = streamData.stream ? streamData.stream.viewers : 0;

        // Subs not publicly available without auth, set to 0
        const subs = 0;

        return { followers, subs, viewers };
    } catch (error) {
        console.error('Twitch fetch error:', error);
        return { followers: 0, subs: 0, viewers: 0 };
    }
}

// Function to fetch YouTube data
async function fetchYouTubeData(user) {
    if (!user) return { subs: 0, members: 0, viewers: 0 };
    try {
        // Get channel ID and subs
        const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername=${user}&key=${YOUTUBE_API_KEY}`);
        const channelData = await channelRes.json();
        const channelItem = channelData.items[0];
        const subs = parseInt(channelItem ? channelItem.statistics.subscriberCount : 0) || 0;
        const channelId = channelItem ? channelItem.id : null;

        // Members not publicly available, set to 0
        const members = 0;

        // Get live viewers
        let viewers = 0;
        if (channelId) {
            const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${YOUTUBE_API_KEY}`);
            const searchData = await searchRes.json();
            if (searchData.items.length > 0) {
                const videoId = searchData.items[0].id.videoId;
                const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`);
                const videoData = await videoRes.json();
                viewers = parseInt(videoData.items[0]?.liveStreamingDetails?.concurrentViewers || 0) || 0;
            }
        }

        return { subs, members, viewers };
    } catch (error) {
        console.error('YouTube fetch error:', error);
        return { subs: 0, members: 0, viewers: 0 };
    }
}

// Function to fetch Kick data
async function fetchKickData(user) {
    if (!user) return { followers: 0, subs: 0, viewers: 0 };
    try {
        const res = await fetch(`https://kick.com/api/v2/channels/${user}`);
        const data = await res.json();
        const followers = data.followers_count || 0;
        const subs = data.subscribers_count || 0;
        const viewers = data.livestream ? data.livestream.viewer_count : 0;
        return { followers, subs, viewers };
    } catch (error) {
        console.error('Kick fetch error:', error);
        return { followers: 0, subs: 0, viewers: 0 };
    }
}

// Fetch all data and update display
async function loadMetrics() {
    const [twitchData, ytData, kickData] = await Promise.all([
        fetchTwitchData(twitchUser),
        fetchYouTubeData(ytUser),
        fetchKickData(kickUser)
    ]);

    const heartTotal = twitchData.followers + ytData.subs + kickData.followers;
    const starTotal = twitchData.subs + ytData.members + kickData.subs;
    const personTotal = twitchData.viewers + ytData.viewers + kickData.viewers;

    metricsDiv.innerHTML = `
        <div class="metric">
            <div class="emoji">❤️</div>
            <div class="number">${heartTotal.toLocaleString()}</div>
        </div>
        <div class="metric">
            <div class="emoji">⭐</div>
            <div class="number">${starTotal.toLocaleString()}</div>
        </div>
        <div class="metric">
            <div class="emoji">👥</div>
            <div class="number">${personTotal.toLocaleString()}</div>
        </div>
    `;
}

loadMetrics();