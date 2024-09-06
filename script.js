document.addEventListener("DOMContentLoaded", () => {
    //
    var addTrackButton = document.getElementById("new_track"),
        playButton = document.getElementById("playButton"),
        tracksSpan = document.getElementById("tracks_nb"),
        player = document.getElementById("player"),
        nbTracks = 1,
        screenCentreX = screen.availWidth / 2,
        screenCentreY = screen.availHeight / 2,
        unit = screen.availWidth / 16,
        rythmPattern = [];

    const root = document.documentElement;

    // function add track
    // Function to create and add a track with beats
    function createTrackWithBeats(trackNum, beatCount) {
        // delete if already exists
        const existingTrack = document.getElementById("track" + trackNum);
        if (existingTrack) {
            existingTrack.remove(); // Remove the pre-existing track
            // rythmPattern[trackNum] ? ;
        }

        // Create the track container
        const track = document.createElement("div");
        track.id = "track" + trackNum;
        track.className = "track"; // Add a class to apply CSS styles if needed
        track.style.position = "absolute";
        track.style.width = 5 + trackNum * 2.5 + "em";
        track.style.height = 5 + trackNum * 2.5 + "em";
        track.style.border = "1px solid var(--beat-color)";
        track.style.borderRadius = "50%";
        track.style.top = "50%";
        track.style.left = "50%";
        track.style.transform = "translate(-50%, -50%)";

        // Create and add beat elements
        for (let i = 1; i <= beatCount; i++) {
            const beat = document.createElement("div");
            beat.className = track.id + "beat"; // Add a class to apply CSS styles if needed
            // beat.id = `${track.id}Beat${i}`;
            beat.style.position = "absolute";
            beat.style.width = "1em";
            beat.style.height = "1em";
            beat.style.border = "1px solid var(--beat-color)";
            beat.style.borderRadius = "50%";
            beat.style.backgroundColor = "var(--test-color)";
            beat.style.top = "50%";
            beat.style.left = "50%";
            beat.style.transform = "translate(-50%, -50%)";
            beat.number = i;
            beat.track = trackNum;
            beat.played = false;
            beat.innerHTML = beat.number + "";
            track.appendChild(beat);
        }

        // Append the track
        player.appendChild(track);

        const beats = document.querySelectorAll("." + track.id + "beat");
        const trackRect = track.getBoundingClientRect(); // Get position and size of the track
        /*
        console.log("Top:", trackRect.top);
        console.log("Right:", trackRect.right);
        console.log("Bottom:", trackRect.bottom);
        console.log("Left:", trackRect.left);
        console.log("Width:", trackRect.width);
        console.log("Height:", trackRect.height); // ok
        */

        const trackRadius = Math.min(trackRect.width, trackRect.height) / 2; // same anyway
        const beatRadius = parseFloat(getComputedStyle(beats[0]).width) / 2; // Radius of the beat
        console.log("beatRadius:", beatRadius);
        const angleIncrement = 360 / beats.length; // Angle between each beat, en degrés comme css

        console.log(beats.length);
        rythmPattern[trackNum] = Array(beats.length).fill(false);
        console.log(rythmPattern);
        console.log(rythmPattern[trackNum]);

        beats.forEach((beat, index) => {
            const angle = angleIncrement * index - 90; // Angle for current beat, + rotation
            const x = trackRadius * Math.cos((angle * Math.PI) / 180); // X position relative en radian (trigo)
            const y = trackRadius * Math.sin((angle * Math.PI) / 180); // Y position relative to the center

            // Position the beat
            beat.style.position = "absolute";
            beat.style.transform = `translate(${x - beatRadius}px, ${y - beatRadius}px)`;

            // event to get rythm
            beat.addEventListener("click", function (event) {
                beat.played = !beat.played;
                if (beat.played) {
                    // color
                    beat.style.backgroundColor = "silver";
                    // rythm
                    rythmPattern[beat.track][beat.number - 1] = beat.played;
                } else {
                    // color
                    beat.style.backgroundColor = "black";
                    // rythm
                    rythmPattern[beat.track][beat.number - 1] = beat.played;
                }
                console.log(rythmPattern);
            });
        }); // fin fonction
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
        inputBeat.num = nbTracks;
        spanTrack.appendChild(inputBeat);

        div.appendChild(spanTrack);
        // insert it
        addTrackButton.parentNode.insertBefore(div, addTrackButton);
        //
        var value = inputBeat.value; // Get the final value after user has finished typing
        if (value && !div.isAdded) {
            div.isAdded = true;
            playButton.setAttribute("title", "Almost done!");

            // Call the function to create a track with beats
            createTrackWithBeats(nbTracks, inputBeat.value);

            // alert("Final value: " + value);
            tracksSpan.innerHTML = "Number of Tracks: " + nbTracks;
            root.style.setProperty("--beat-color", "silver");
            // increment track_nb
            nbTracks += 1;
        }
        // draw cirle

        // Add event listener to inputBeat to detect when the field is modified
        inputBeat.addEventListener("change", function () {
            // new value
            // redraw circle and everything
            createTrackWithBeats(inputBeat.num, inputBeat.value);
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
