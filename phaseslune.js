var earthCanvas = document.getElementById("earthcanvas");
var earthContext = earthCanvas.getContext("2d");
var moonCanvas = document.getElementById("mooncanvas");
var moonContext = moonCanvas.getContext("2d");
var mainCanvas = document.getElementById("maincanvas");
var mainContext = mainCanvas.getContext("2d");
var debug = document.getElementById("debug");

var leftPadding = 100;
var centerx = leftPadding + mainCanvas.height / 2;
var centery = mainCanvas.height / 2;

var earthPeriod = 24 * 3600;       // One complete rotation in 24h
var earthTheta = 0;                // Angular position for Earth
var earthOmega = 2 * Math.PI / earthPeriod  // Angular speed for Earth
var earthRadius = 35;

var moonRadius = 10;
var moonOrbitRadius = 200;
var moonPeriod = 29.5 * 24 * 3600; // One complete rotation in 29.5 days
var moonOrbitalTheta = Math.PI;    // Initial position: new Moon
var moonOmega = 2 * Math.PI / moonPeriod  // Angular speed for Moon
var moonx, moony;

var timer;

// Listeners for interaction with mouse
moonCanvas.addEventListener('mousedown', mouseDown, false);
moonCanvas.addEventListener('mousemove', mouseMove, false);
document.addEventListener('mouseup', mouseUp, false);   // button release could occur outside canvas
moonCanvas.addEventListener('touchstart', mouseDown, false);
moonCanvas.addEventListener('touchmove', mouseMove, false);
document.addEventListener('touchend', mouseUp, false);
var mouseIsDown = false;
var selectedObject;

// Load and draw images
var earth = new Image();
earth.src = "assets/earth_north.jpg";
var moon = new Image();
moon.src = "assets/moon_north.jpg";
window.addEventListener("load", initFigure); 

// Some variables to figure out where the canvas is on the page.
var boundingRect = moonCanvas.getBoundingClientRect();
var topMargin = boundingRect.top;
var leftMargin = boundingRect.left;

// Used for manually rotating Earth
var savedEarthTheta;

function mouseDown(e) {
    e.preventDefault();
    mouseIsDown = true;
    debug.innerHTML += "mouse down on " + e.pageX + ", " + e.pageY + "<br />";
    if ((e.pageX - leftMargin - moonx) * (e.pageX - leftMargin - moonx) +
        (e.pageY - topMargin - moony) * (e.pageY - topMargin - moony) < moonRadius * moonRadius) {
            selectedObject = "moon";
            //debug.innerHTML += "mouse down on Moon" + "<br />";
    }
    else if ((e.pageX - leftMargin - centerx) * (e.pageX - leftMargin - centerx) +
             (e.pageY - topMargin - centery) * (e.pageY - topMargin - centery) < earthRadius * earthRadius) {
            selectedObject = "earth";
            savedEarthTheta = earthTheta + Math.atan2(e.pageY - topMargin - centery,
                                                      e.pageX - leftMargin - centerx);
            //debug.innerHTML += "mouse down on Earth" + "<br />";
    }
    else {
        selectedObject = "";
        mouseIsDown = false;
        //debug.innerHTML += "mouse down on nothing" + "<br />";
    }
}

function mouseMove(e) {
    e.preventDefault();
    if (mouseIsDown) {
        if (selectedObject == "earth") {
            // Rotate Earth
            earthTheta = savedEarthTheta - Math.atan2(e.pageY - topMargin - centery,
                                    e.pageX - leftMargin - centerx);
            drawEarth();
        }
        else if (selectedObject == "moon") {
            moonx = e.pageX - leftMargin - centerx;
            moony = e.pageY - topMargin - centery;
            var r = Math.sqrt(moonx * moonx + moony * moony);
            moonx *= moonOrbitRadius / r;
            moony *= moonOrbitRadius / r;
            moonOrbitalTheta = Math.atan2(-moony, moonx);
            //debug.innerHTML = "move Moon to " + moonx + ", " + moony + "<br />";
            drawMoon();
        }
    }
}

function mouseUp(e) {
    mouseIsDown = false;
}

function initFigure() {
    // Draw Moon's orbit
    mainContext.strokeStyle = "#ddd";
    mainContext.beginPath();
    mainContext.arc(centerx, centery, moonOrbitRadius, 0, 2 * Math.PI);
    mainContext.stroke();

    // Draw Moon
    moon.onload = drawMoon();

    // Draw Earth
    earth.onload = drawEarth();
}

function drawEarth() {
    earthContext.save();
    earthContext.translate(centerx, centery);
    // Minus sign to rotate in the right direction, ie, counterclockwise.
    earthContext.rotate(-earthTheta);
    earthContext.translate(-centerx, -centery);
    earthContext.drawImage(earth, centerx - earthRadius, centery - earthRadius,
                           2 * earthRadius, 2 * earthRadius);
    earthContext.restore();

    // Draw shadow on Earth
    earthContext.beginPath();
    earthContext.fillStyle = "rgba(0, 0, 0, 0.5)";
    earthContext.lineWidth = 2;
    earthContext.arc(centerx, centery, earthRadius, 1.5 * Math.PI, 0.5 * Math.PI);
    earthContext.moveTo(centerx, centery - earthRadius);
    earthContext.lineTo(centerx, centery + earthRadius);
    earthContext.fill();
}

function drawMoon() {
    moonContext.clearRect(0, 0, moonCanvas.width, moonCanvas.height);
    // Position Moon on its orbit
    moonx = centerx + moonOrbitRadius * Math.cos(-moonOrbitalTheta);
    moony = centery + moonOrbitRadius * Math.sin(-moonOrbitalTheta);
    //moonContext.drawImage(moon, moonx - moonRadius, moony - moonRadius,
                          //2 * moonRadius, 2 * moonRadius);

    // Rotate Moon on its axis
    moonContext.save();
    moonContext.translate(moonx, moony);
    var moonTheta = moonOrbitalTheta - Math.PI;
    moonContext.rotate(-moonTheta);
    moonContext.translate(-moonx, -moony);
    moonContext.drawImage(moon, moonx - moonRadius, moony - moonRadius,
                          2 * moonRadius, 2 * moonRadius);
    moonContext.restore();
    
    // Draw shadow on Moon
    moonContext.beginPath();
    moonContext.fillStyle = "rgba(0, 0, 0, 0.5)";
    moonContext.lineWidth = 2;
    moonContext.arc(moonx, moony, moonRadius, 1.5 * Math.PI, 0.5 * Math.PI);
    moonContext.moveTo(moonx, moony - moonRadius);
    moonContext.lineTo(moonx, moony + moonRadius);
    moonContext.fill();
}

function animate() {
    var dt = Number(speedSlider.value);
    earthTheta += (earthOmega * dt) % (2 * Math.PI);
    moonOrbitalTheta += (moonOmega * dt) % (2 * Math.PI);
    drawEarth();
    drawMoon();

    timer = window.setTimeout(animate, 50);
}

function launchAnimation() {
    window.clearTimeout(timer);
    animate();
}

function pause() {
    window.clearTimeout(timer);
}

initFigure();
launchAnimation();
pause();
