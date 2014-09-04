var earthCanvas = document.getElementById("earthcanvas");
var earthContext = earthCanvas.getContext("2d");
var moonCanvas = document.getElementById("mooncanvas");
var moonContext = moonCanvas.getContext("2d");
var mainCanvas = document.getElementById("maincanvas");
var mainContext = mainCanvas.getContext("2d");
var moonPhaseCanvas = document.getElementById("moonphasecanvas");
var moonPhaseContext = moonPhaseCanvas.getContext("2d");
var debug = document.getElementById("debug");
var moonImg = document.getElementById("moonphase");

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
var moonphase = new Image();
moonphase.src = "assets/Full_Moon_Luc_Viatour.jpg";
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
    //debug.innerHTML += "mouse down on " + e.pageX + ", " + e.pageY + "<br />";
    if ((e.pageX - leftMargin - moonx) * (e.pageX - leftMargin - moonx) +
        (e.pageY - topMargin - moony) * (e.pageY - topMargin - moony) < moonRadius * moonRadius) {
            selectedObject = "moon";
            //debug.innerHTML += "mouse down on Moon" + "<br />";
    }
    else if ((e.pageX - leftMargin - centerx) * (e.pageX - leftMargin - centerx) +
             (e.pageY - topMargin - centery) * (e.pageY - topMargin - centery) < 3*earthRadius * earthRadius) {
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

    drawMoonPhase();
}

function drawEarth() {
    earthContext.clearRect(0, 0, earthCanvas.width, earthCanvas.height);
    earthContext.save();
    earthContext.translate(centerx, centery);
    // Minus sign to rotate in the right direction, ie, counterclockwise.
    earthContext.rotate(-earthTheta);
    earthContext.translate(-centerx, -centery);
    earthContext.beginPath();
    earthContext.moveTo(centerx - earthRadius - 10, centery);
    earthContext.lineTo(centerx - earthRadius - 20, centery);
    earthContext.arc(centerx - earthRadius - 25, centery, 5, 0, 2 * Math.PI);
    earthContext.moveTo(centerx - earthRadius - 10, centery);
    earthContext.lineTo(centerx - earthRadius, centery + 5);
    earthContext.moveTo(centerx - earthRadius - 10, centery);
    earthContext.lineTo(centerx - earthRadius, centery - 5);
    earthContext.moveTo(centerx - earthRadius - 15, centery);
    earthContext.lineTo(centerx - earthRadius - 18, centery - 8);
    earthContext.moveTo(centerx - earthRadius - 15, centery);
    earthContext.lineTo(centerx - earthRadius - 18, centery + 8);
    earthContext.strokeStyle = "white";
    earthContext.stroke();
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

function pad(n, width, z) {
    // Pad a number with n leading zeros
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
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

    drawMoonPhase();
    //var cycleAngle = (Math.PI - moonOrbitalTheta) % (2 * Math.PI);
    //while (cycleAngle < 0) {
        //cycleAngle += 2 * Math.PI;
    //}
    //var cycleFrac = 2 * Math.round((1 - cycleAngle/(2 * Math.PI)) * 180);
    //moonImg.innerHTML = '<img src="assets/moon/m' + pad(cycleFrac, 3) + '.gif" alt="Image de la Lune" />'
    
    // Draw shadow on Moon
    moonContext.beginPath();
    moonContext.fillStyle = "rgba(0, 0, 0, 0.5)";
    moonContext.lineWidth = 2;
    moonContext.arc(moonx, moony, moonRadius, 1.5 * Math.PI, 0.5 * Math.PI);
    moonContext.moveTo(moonx, moony - moonRadius);
    moonContext.lineTo(moonx, moony + moonRadius);
    moonContext.fill();
}

var scaleFactorX;

function drawMoonPhase() {
    moonPhaseContext.clearRect(0, 0, moonPhaseCanvas.width, moonPhaseCanvas.height);
    moonPhaseContext.drawImage(moonphase, 0, 0, 200, 200);
    moonPhaseContext.save();
    scaleFactorX = (Math.abs(moonx - centerx)) / moonOrbitRadius;

    moonPhaseContext.fillStyle = "rgba(0, 0, 0, 0.8)";
    if (moony - centery >= 0 && moonx - centerx <= 0) {
        // Waxing crescent
        moonPhaseContext.scale(scaleFactorX, 1);
        moonPhaseContext.beginPath();
        moonPhaseContext.arc(moonPhaseCanvas.width / 2 / scaleFactorX,
                             moonPhaseCanvas.height / 2,
                             90, 1.5 * Math.PI, 0.5 * Math.PI);
        moonPhaseContext.restore();
        moonPhaseContext.fill();

        moonPhaseContext.beginPath();
        moonPhaseContext.rect(0, 0, moonPhaseCanvas.width / 2,
                              moonPhaseCanvas.height);
        moonPhaseContext.fill();
    }
    else if (moony - centery > 0) {
        // Waxing gibbous
        moonPhaseContext.scale(scaleFactorX, 1);
        moonPhaseContext.beginPath();
        moonPhaseContext.moveTo(0, moonPhaseCanvas.height);
        moonPhaseContext.lineTo(moonPhaseCanvas.width / 2 / scaleFactorX, 190);
        moonPhaseContext.arc(moonPhaseCanvas.width / 2 / scaleFactorX,
                             moonPhaseCanvas.height / 2,
                             90, 0.5 * Math.PI, 1.5 * Math.PI);
        moonPhaseContext.restore();
        moonPhaseContext.lineTo(0, 0);
        moonPhaseContext.closePath();
        moonPhaseContext.fill();
    }
    else if (moonx - centerx > 0) {
        // Waning gibbous
        moonPhaseContext.scale(scaleFactorX, 1);
        moonPhaseContext.beginPath();
        moonPhaseContext.moveTo(moonPhaseCanvas.width, 0);
        moonPhaseContext.lineTo(moonPhaseCanvas.width / 2 / scaleFactorX, 10);
        moonPhaseContext.arc(moonPhaseCanvas.width / 2 / scaleFactorX,
                             moonPhaseCanvas.height / 2,
                             90, 1.5 * Math.PI, 0.5 * Math.PI);
        moonPhaseContext.restore();
        moonPhaseContext.lineTo(moonPhaseCanvas.width, moonPhaseCanvas.height, 0);
        moonPhaseContext.lineTo(moonPhaseCanvas.width, 0);
        moonPhaseContext.closePath();
        moonPhaseContext.fill();
    }
    else {
        // Waning crescent
        moonPhaseContext.scale(scaleFactorX, 1);
        moonPhaseContext.beginPath();
        moonPhaseContext.arc(moonPhaseCanvas.width / 2 / scaleFactorX,
                             moonPhaseCanvas.height / 2,
                             90, 0.5 * Math.PI, 1.5 * Math.PI);
        moonPhaseContext.restore();
        moonPhaseContext.fill();

        moonPhaseContext.beginPath();
        moonPhaseContext.rect(moonPhaseCanvas.width / 2, 0, moonPhaseCanvas.width / 2,
                              moonPhaseCanvas.height);
        moonPhaseContext.fill();
    }
}

function animate() {
    var dt = Number(speedSlider.value);
    earthTheta += (earthOmega * dt) % (2 * Math.PI);
    moonOrbitalTheta += (moonOmega * dt);
    moonOrbitalTheta %= (2 * Math.PI);
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
