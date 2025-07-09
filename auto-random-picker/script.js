/////////////
//  FIELDS //
/////////////

let sbDebugMode = false;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const sbServerPort = urlParams.get("port") || 8080;
const sbServerAddress = urlParams.get("server") || "127.0.0.1";

/////////////////
// GLOBAL VARS //
/////////////////

let widgetVisibility = false;
let animationSpeed = 0.5;
let emotes = [];
let currentDisplayName = "";
let currentMessage = "";

///////////////////////////////////
// SRTEAMER.BOT WEBSOCKET SERVER //
///////////////////////////////////

// This is the main function that connects to the Streamer.bot websocke server
function connectws() {
	if ("WebSocket" in window) {
		const ws = new WebSocket("ws://" + sbServerAddress + ":" + sbServerPort + "/");
        };
}   
