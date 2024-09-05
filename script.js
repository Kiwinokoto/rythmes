document.addEventListener("DOMContentLoaded", () => {
    //
    var addTrackButton = document.getElementById("new_track"),
        playButton = document.getElementById("playButton"),
        tracksSpan = document.getElementById("tracks_nb"),
        nbTracks = tracks_nb + 1, // = 0 + 1
        xcentre = screen.availWidth / 2,
        ycentre = screen.availHeight / 2,
        unit = screen.availWidth / 16,
        needle = document.getElementById("needle"),
        track1 = document.getElementById("firstTrack"),
        beats = document.querySelectorAll(".beat"),
        trackRadius = track1.offsetWidth / 2, // Radius of the track
        centerX = track1.offsetWidth / 2, // Center X of the track
        centerY = track1.offsetHeight / 2, // Center Y of the track
        angleIncrement = 360 / beats.length; // Angle between each beat

    beats.forEach((beat, index) => {
        var angle = angleIncrement * index; // Angle for current beat
        var x = trackRadius * Math.cos((angle * Math.PI) / 180); // X position
        var y = trackRadius * Math.sin((angle * Math.PI) / 180); // Y position

        // Position the beat
        beat.style.transform = `translate(${centerX + x}px, ${centerY + y}px)`; // almost there
    });

    function createNeedle() {
        // delete previous needle ?
    }

    function createTrack(division, orbit) {
        // this.number = 42
        // this.beat = diameter;
    }

    addTrackButton.addEventListener("click", function (event) {
        // event.preventDefault(); // Not necessary here (button)

        // create a new track (form input)
        var div = document.createElement("div");
        div.id = "trackDiv-" + nbTracks;
        div.beat = 2 + nbTracks;
        div.className = "param";
        div.isAdded = false;

        var spanTrack = document.createElement("span");
        spanTrack.innerHTML = "Track " + nbTracks + ": ";

        var labelBeat = document.createElement("label");
        labelBeat.setAttribute("for", "beat-" + nbTracks);
        labelBeat.innerHTML = "Beat ";
        spanTrack.appendChild(labelBeat);

        var inputBeat = document.createElement("input");
        inputBeat.type = "number";
        inputBeat.setAttribute("name", "beat-" + nbTracks);
        inputBeat.id = "beat-" + nbTracks; // Set an ID to match the 'for' attribute in the label
        inputBeat.value = div.beat;
        spanTrack.appendChild(inputBeat);

        div.appendChild(spanTrack);
        // insert it
        addTrackButton.parentNode.insertBefore(div, addTrackButton);
        //
        var value = inputBeat.value; // Get the final value after user has finished typing
        if (value && !div.isAdded) {
            div.isAdded = true;
            playButton.setAttribute("title", "Almost done!");
            // alert("Final value: " + value);
            // increment track_nb
            nbTracks += 1;
            tracksSpan.innerHTML = "Number of Tracks: " + (nbTracks - 1);
        }
        // draw cirle

        // Add event listener to inputBeat to detect when the field is modified
        inputBeat.addEventListener("change", function () {
            // new value
            // redraw circle
        });
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
