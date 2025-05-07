// World State: 0 = Start, 1 = Environmental Tools Unlocked, 2 = Living Being Tools Unlocked, 3 = Concept Tools Unlocked, 4 = Void
let worldState = 0;

let worldFrozen = false; // Flag to indicate if the world is frozen

let timeOfDay = 12; // Time of day in hours (0-23)
let minutes = 0; // Minutes past the hour

// Progress the time of day
function tick() {
    // Stop ticking forever if worldState is 4
    if (worldState == 4) {
        return;
    }

    // Increment minutes, unless the world is frozen
    if (!worldFrozen) {
        minutes++;
    }

    setNightCastOpacity(); // Update opacity based on time of day
    if (minutes >= 60) {
        minutes = 0;
        timeOfDay++;
        if (timeOfDay >= 24) {
            timeOfDay = 0;
        }
    }
    const minuteTime = 1000 / timeFactor; // Calculate delay dynamically

    setTimeout(tick, minuteTime);
}

// Start ticking
tick();

function setNightCastOpacity() {
    const totalMinutes = timeOfDay * 60 + minutes; // Convert timeOfDay and minutes to total minutes in the day

    if (totalMinutes < 360) { // Before 6 AM (360 minutes)
        nightCastImageNode.opacity(0.75);
    } else if (totalMinutes >= 360 && totalMinutes < 480) { // Between 6 AM (360) and 8 AM (480)
        const progress = (totalMinutes - 360) / 120; // Progress from 0 to 1 over 120 minutes
        nightCastImageNode.opacity(0.75 - (0.75 * progress));
    } else if (totalMinutes >= 480 && totalMinutes < 1080) { // Between 8 AM (480) and 6 PM (1080)
        nightCastImageNode.opacity(0);
    } else if (totalMinutes >= 1080 && totalMinutes < 1200) { // Between 6 PM (1080) and 8 PM (1200)
        const progress = (totalMinutes - 1080) / 120; // Progress from 0 to 1 over 120 minutes
        nightCastImageNode.opacity(0 + (0.75 * progress));
    } else { // After 8 PM (1200 minutes)
        nightCastImageNode.opacity(0.75);
    }
}

// Function for handling world state changes
function changeWorldState(int) {
    if (int >= 0 && int <= 4) {
        worldState = int;
    }
    else {
        console.error("Invalid world state. Must be between 0 and 4.");
    }
}

// Array of 8 function references (possible actions each 5 seconds when in worldState 0)
let state0Actions = [
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
];

let state1Actions = [
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
];

let state2Actions = [
    () => { spawnBeing("dog") },
    () => { spawnBeing("person") },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
];

let state3Actions = [
    () => { spawnBeing("dog") },
    () => { spawnBeing("person") },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
];

let state4Actions = [
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
];

// Store the state action arrays in a single array for easier access
let stateActions = [
    state0Actions,
    state1Actions,
    state2Actions,
    state3Actions,
    state4Actions
];

// Interval running every 5 seconds, different behaviour depending on worldState
setInterval(() => {
    // Generate a random integer between 0 and 7
    let randomInt = Math.floor(Math.random() * 8);
    // Unless the world is frozen, call the function at the random index
    if (!worldFrozen) {
        stateActions[worldState][randomInt]();
    }
    // Check if worldState needs to update
    if (worldState < 1 && brushTool.obtained) {
        //worldState = 1; // Desired behaviour
        worldState = 2; // USER TESTING: Temporary behaviour
    }
}, 5000);

let activeBeings = 0;

function spawnBeing(type) {
    if (activeBeings >= 10) {
        return;
    }
    if (type == "dog") {
        new Dog(...chooseSpawnPoint());
        activeBeings++;
    }
    else if (type == "person") {
        new Person(...chooseSpawnPoint());
        activeBeings++;
    }
}

let brushDropped = false;

// Have the brush entity drop from the top of the screen
function dropBrush() {  
    if (!brushDropped) {
        brushDropped = true;

        newBrush = new Brush((baseWidth / 2), -20);
        newBrush.fallFromTop();
    }
}