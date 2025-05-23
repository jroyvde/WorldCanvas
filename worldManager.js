// World State: 0 = Start, 1 = Environmental Tools Unlocked, 2 = Living Being Tools Unlocked, 3 = Concept Tools Unlocked, 4 = Void
let worldState = 0;

// World Flags
let worldFlags = {
    brushColorChanged: false,
    climateChanged: false,
    foliageFertilized: false,
    personToolUsed: false,
};

// Climates
let climates = [
    { name: 'Field', backgroundImage: backgroundImage, foliageImage: foliageImage },
    { name: 'Desert', backgroundImage: backgroundImageDesert, foliageImage: foliageImageDesert },
    { name: 'Snow', backgroundImage: backgroundImageSnow, foliageImage: foliageImageSnow },
    //{ name: 'Japan', backgroundImage: backgroundImageJapan, },
    //{ name: 'Autumn', backgroundImage: backgroundImageAutumn, },
];
let currentClimate = climates[0];  // Set default Climate to 'Field'

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

// Change the Climate. Can take an integer, string, or no argument.
function changeClimate(input) {
    const newClimate = parseClimate(input);

    if (newClimate === currentClimate) {
        console.log(`Climate is already ${currentClimate.name}, no change made.`);
        return;
    }

    worldFlags.climateChanged = true;  // Update World Flags

    currentClimate = newClimate;
    // Change background image
    backgroundImageNode.image(newClimate.backgroundImage);
    // Reset background image properties incase they have been tampered with by a custom background
    backgroundImageNode.width(baseWidth);
    backgroundImageNode.height(baseHeight);
    backgroundImageNode.x(0);
    backgroundImageNode.y(0);

    console.log(`New Climate is ${currentClimate.name}`);

    // Loop through all Foliage Entities and change their climateType to match
    const entitiesSnapshot = [...entitiesOnCanvas];
    for (let i = 0; i < entitiesSnapshot.length; i++) {
        if (entitiesSnapshot[i] != null) {
            if (entitiesSnapshot[i].climateType) {  // Check if the entity is Foliage
                entitiesSnapshot[i].changeClimateType(currentClimate);
            }
        }
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
    () => { bloomFoliage() },
    () => { bloomFoliage() },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
];

let state2Actions = [
    () => { spawnBeing("dog") },
    () => { if (dogTool.obtained && worldFlags.foliageFertilized) { spawnBeing("person") } },
    () => { bloomFoliage() },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
];

let state3Actions = [
    () => { spawnBeing("dog") },
    () => { spawnBeing("person") },
    () => { makePersonThink() },
    () => { bloomFoliage() },
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
    if (worldState < 1 && brushTool.obtained && worldFlags.brushColorChanged) {
        worldState = 1;
    } else if (worldState < 2 && foliageTool.obtained && worldFlags.climateChanged) {
        worldState = 2;
    } else if (worldState < 3 && dogTool.obtained && personTool.obtained && worldFlags.foliageFertilized && worldFlags.personToolUsed) {
        worldState = 3
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
    if (!brushDropped && navigator.userActivation.isActive) {
        brushDropped = true;

        newBrush = new Brush((baseWidth / 2), -20);
        newBrush.fallFromTop();
    }
}

// Create a Foliage entity at a random location
function bloomFoliage() {  
    let randomX = (Math.random() * (baseWidth - 32)) + 16;
    let randomY = (Math.random() * (baseHeight - 32)) + 16;
    newFoliage = new Foliage(randomX, randomY);
}

let existingThoughtBubble;

// Find a Person entity and run the 'think' function on it
function makePersonThink() {
    // If the Time Tool has been obtained by now, take the opportunity to get rid of the Thought Bubble
    if (timeTool.obtained) {
        if (existingThoughtBubble) {
            existingThoughtBubble.destroy();
        }
        return;
    }
    // If there is already an existing Thought Bubble, don't make a new one
    if (existingThoughtBubble) {
        return;
    }
    // Use the entitiesOnCanvas array as is, to avoid the possibility of an endless loop
    const entitiesSnapshot = [...entitiesOnCanvas];
    // Loop through the Entity list until we find a Person
    for (let i = 0; i < entitiesSnapshot.length; i++) {
        if (entitiesSnapshot[i] != null) {
            // Check if the entity is a Person
            if (entitiesSnapshot[i].thinkAboutTime != null) {
                existingThoughtBubble = entitiesSnapshot[i].thinkAboutTime();   // Make them think about time
                return;  // Return so that this only happens to one person
            }
        }
    }
}