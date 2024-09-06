<?php
session_start();

// debug mode
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include("functions.php");

setInitialValues("tempo", 30); // create session variables
setInitialValues("tracks_nb", 0);
// setInitialValues("nbHidden", $_SESSION["nbSensors"] + 1);

// $_SESSION["firstTime"] = true;

?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="style.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rythmes</title>
    <!-- <link rel="icon" type="image/png" href="./pics/favicon.png" /> -->
</head>
<body>
    <div class="page">

        <form class="settings">
            <div class="param">
                <label for="tempo">Tempo (BPM):</label>
                <input type="number" id="tempo" name="tempo"
                value = "<?php echo $_SESSION["tempo"]; ?>" min="1" required>
            </div>

            <div class="param">
                <span id="tracks_nb">
                    Number of Tracks:<?php echo " " . $_SESSION['tracks_nb']; ?>
                </span>
            </div>

            <div class="param" id="new_track">
                <button type="button">Add New Track</button>
            </div>

            <div class="play">
                <button type="button" id="playButton" title="Add a track first" disabled >Play</button>
            </div>
        </form>

        <div id="player">
            <div id="needle"></div>
            <div id="needleCenter"></div>
        </div>

        <div class="sons">
            <p>in a moment</p>
        </div>

    </div>
    <?php phpToJs('tracks_nb'); ?>
    <script src="script.js"></script>
</body>
</html>