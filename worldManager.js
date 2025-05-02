// World State: 0 = Start, 1 = Environmental Tools Unlocked, 2 = Living Being Tools Unlocked, 3 = Concept Tools Unlocked, 4 = Void
let worldState = 0;

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
    // Call the function at the random index
    stateActions[worldState][randomInt]();
    // Check if worldState needs to update
    if (worldState < 1 && brushTool.obtained) {
        //worldState = 1; // Desired behaviour
        worldState = 2; // USER TESTING: Temporary behaviour
    }
}, 5000);

function spawnBeing(type) {
    if (type == "dog") {
        new Dog(...chooseSpawnPoint());
    }
    else if (type == "person") {
        new Person(...chooseSpawnPoint());
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