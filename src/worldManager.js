console.log('worldManager.js loaded')

// World State: 0 = Start, 1 = Foliage can spawn, 2 = Beings can spawn, 3 = People can think, 4 = Void (Unused)
let worldState = 0

// World Flags
const worldFlags = {
    brushColorChanged: false,
    climateChanged: false,
    foliageFertilized: false,
    personToolUsed: false,
}

// Climates
const climates = [
    { name: 'Field', backgroundImage: backgroundImage, foliageImage: foliageImage },
    { name: 'Desert', backgroundImage: backgroundImageDesert, foliageImage: foliageImageDesert },
    { name: 'Snow', backgroundImage: backgroundImageSnow, foliageImage: foliageImageSnow },
    // { name: 'Japan', backgroundImage: backgroundImageJapan, },
    // { name: 'Autumn', backgroundImage: backgroundImageAutumn, },
    //
]
let currentClimate = climates[0]    // Set default Climate to 'Field'

// Function: Handle world state changes
const changeWorldState = (int) => {
    if (int >= 0 && int <= 4) {
        worldState = int
    }
    else {
        console.error('Invalid world state. Must be between 0 and 4.')
    }
}

// Function: Change the Climate. Can take an integer, string, or no argument.
const changeClimate = (input) => {
    const newClimate = parseClimate(input)

    if (newClimate === currentClimate) {
        console.log(`Climate is already ${currentClimate.name}, no change made.`)
        return
    }

    worldFlags.climateChanged = true    // Update World Flags

    currentClimate = newClimate

    // Change background image
    backgroundImageNode.image(newClimate.backgroundImage)

    // Reset background image properties incase they have been tampered with by a custom background
    backgroundImageNode.width(baseWidth)
    backgroundImageNode.height(baseHeight)
    backgroundImageNode.x(0)
    backgroundImageNode.y(0)

    console.log(`New Climate is ${currentClimate.name}`)

    // Loop through all Foliage Entities and change their climateType to match
    const entitiesSnapshot = [...entitiesOnCanvas]
    for (let i = 0; i < entitiesSnapshot.length; i++) {
        if (entitiesSnapshot[i] != null) {
            if (entitiesSnapshot[i].climateType) {  // Check if the entity is Foliage
                entitiesSnapshot[i].changeClimateType(currentClimate)
            }
        }
    }
}

// Array of 8 function references (possible actions each 5 seconds when in worldState 0)
const state0Actions = [
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
    () => { dropBrush() },
]

const state1Actions = [
    () => { bloomFoliage() },
    () => { bloomFoliage() },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
]

const state2Actions = [
    () => { spawnBeing('dog') },
    () => { if (dogTool.obtained && worldFlags.foliageFertilized) { spawnBeing('person') } },
    () => { bloomFoliage() },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
]

const state3Actions = [
    () => { spawnBeing('dog') },
    () => { spawnBeing('person') },
    () => { makePersonThink() },
    () => { bloomFoliage() },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
]

const state4Actions = [
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
    () => {  },
]

// Store the state action arrays in a single array for easier access
const stateActions = [
    state0Actions,
    state1Actions,
    state2Actions,
    state3Actions,
    state4Actions
]

// Interval running every 5 seconds, different behaviour depending on worldState
setInterval(() => {
    // Generate a random integer between 0 and 7
    const randomInt = Math.floor(Math.random() * 8)
    // Unless the world is frozen, call the function at the random index
    if (!worldFrozen) {
        stateActions[worldState][randomInt]()
    }
    // Check if worldState needs to update
    if (worldState < 1 && brushTool.obtained && worldFlags.brushColorChanged) {
        worldState = 1
    } else if (worldState < 2 && foliageTool.obtained && worldFlags.climateChanged) {
        worldState = 2
    } else if (worldState < 3 && dogTool.obtained && personTool.obtained && worldFlags.foliageFertilized && worldFlags.personToolUsed) {
        worldState = 3
    }
}, 5000)

let activeBeings = 0

// Function: Spawn a Being of a given type
const spawnBeing = (type) => {
    if (activeBeings >= 10) return
    if (type == 'dog') {
        new Dog(...chooseSpawnPoint())
        activeBeings++
    }
    else if (type == 'person') {
        new Person(...chooseSpawnPoint())
        activeBeings++
    }
}

let brushDropped = false

// Function: Have the brush entity drop from the top of the screen
const dropBrush = () => {  
    if (!brushDropped && navigator.userActivation.isActive) {
        brushDropped = true

        newBrush = new Brush((baseWidth / 2), -20)
        newBrush.fallFromTop()
    }
}

// Function: Create a Foliage entity at a random location
const bloomFoliage = () => {  
    let randomX = (Math.random() * (baseWidth - 32)) + 16
    let randomY = (Math.random() * (baseHeight - 32)) + 16
    newFoliage = new Foliage(randomX, randomY)
}

let existingThoughtBubble

// Function: Find a Person entity and run the 'think' function on it
const makePersonThink = () => {
    // If the Time Tool has been obtained by now, take the opportunity to get rid of the Thought Bubble
    if (timeTool.obtained) {
        if (existingThoughtBubble) existingThoughtBubble.destroy()
        return
    }
    // If there is already an existing Thought Bubble, don't make a new one
    if (existingThoughtBubble) return
    // Use the entitiesOnCanvas array as is, to avoid the possibility of an endless loop
    const entitiesSnapshot = [...entitiesOnCanvas]
    // Loop through the Entity list until we find a Person
    for (let i = 0; i < entitiesSnapshot.length; i++) {
        if (entitiesSnapshot[i] != null) {
            // Check if the entity is a Person
            if (entitiesSnapshot[i].thinkAboutTime != null) {
                existingThoughtBubble = entitiesSnapshot[i].thinkAboutTime()    // Make them think about time
                return                                                          // Return so that this only happens to one person
            }
        }
    }
}