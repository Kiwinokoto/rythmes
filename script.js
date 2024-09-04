var addTrackButton = document.getElementById("new_track");

function createTrack() {
    // this.number = 42
    // this.beat = diameter;
}

addTrackButton.addEventListener("click", function (event) {
    // event.preventDefault(); // Not necessary here (button)

    track_nb = nbTracks + 1;
    // alert(track_nb);

    // create a new track (form input)
    var div = document.createElement("div");
    div.className = "param";
    div.isAdded = false;

    var labelTrack = document.createElement("label");
    labelTrack.innerHTML = "Track " + track_nb + ": ";
    div.appendChild(labelTrack);

    var labelBeat = document.createElement("label");
    labelBeat.setAttribute("for", "beat-" + track_nb);
    labelBeat.innerHTML = "Beat ";
    div.appendChild(labelBeat);

    var inputBeat = document.createElement("input");
    inputBeat.type = "number";
    inputBeat.setAttribute("name", "beat-" + track_nb);
    inputBeat.setAttribute("id", "beat-" + track_nb); // Set an ID to match the 'for' attribute in the label
    div.appendChild(inputBeat);

    // insert it
    addTrackButton.parentNode.insertBefore(div, addTrackButton);
    //
    var playButton = document.getElementById("playButton");
    playButton.setAttribute("title", "Choose a beat (>0)");

    // Add event listener to inputBeat to detect when the field is filled
    inputBeat.addEventListener("change", function () {
        var value = inputBeat.value; // Get the final value after user has finished typing
        if (value) {
            playButton.setAttribute("title", "Well done!");
            // alert("Final value: " + value);
            // increment nb tracks
        }
    });
});

/*

function CreateStar(name, diameter, colorcenter, colormiddle, colorborder) {
	this.name = name;
	this.diameter = diameter;
	this.colorcenter = colorcenter;
	this.colormiddle = colormiddle;
	this.colorborder = colorborder;
	var div = document.createElement("div");
	div.style.position = "absolute";
	div.id = name;
	div.className = "disk";
	div.style.backgroundImage = "radial-gradient(circle at center," + colorcenter + "," + colormiddle + "," + colorborder + ")";
	div.style.height = diameter + "px";
	div.style.width = diameter + "px";
	div.style.left = "50%";
	div.style.bottom = "50%";
	div.style.marginLeft = Math.round(-diameter/2) + "px";
	div.style.marginBottom = Math.round(-diameter/2) + "px";
	div.title = name;
	system.appendChild(div);
}
var sun = new CreateStar("Sun", Math.round(1392684*etailles/2), "orange", "yellow", "white"); // diamètre réél 1 392 684 km



var bigbang = Date.now(); // remember start time

let timer = setInterval(function() {
	// how much time passed from the start?
	// draw the animation at the moment timePassed
	orbit(mercury);
	orbit(venus);
	orbit(terra);
	orbit(mars);
}, 20);

function orbit(planet) {
	var div = document.getElementById(planet.name);
	let timePassed = Date.now() - bigbang;
	div.style.marginLeft = Math.round(-planet.diameter/2 + (sun.diameter/2 + planet.ADS)*Math.cos(timePassed/(10*planet.revolution))) + "px";
	div.style.marginBottom = Math.round(-planet.diameter/2 + (sun.diameter/2 + planet.ADS)*Math.sin(timePassed/(10*planet.revolution))) + "px";
}

*/
