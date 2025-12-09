// Enable (or not) debug mode keyboard shortcuts
let debugMode = 0

// Switch to and give the default Tool
switchTool(defaultTool, true)
addTool(defaultTool, true)

// Give the Save Tool
addTool(saveTool, true)

// Handle key presses
addEventListener('keydown', (e) => {
    // Debug Mode keyboard commands
    if (debugMode) {
        if (e.key == '0') { // Press 0 to set worldState to 0 (Initial state)
            changeWorldState(0)
        }
        if (e.key == '1') { // Press 1 to set worldState to 1 (Environmental Tools Unlocked)
            changeWorldState(1)
        }
        if (e.key == '2') { // Press 2 to set worldState to 2 (Living Being Tools Unlocked)
            changeWorldState(2)
        }
        if (e.key == '3') { // Press 3 to set worldState to 3 (Concept Tools Unlocked)
            changeWorldState(3)
        }
        if (e.key == '4') { // Press 4 to set worldState to 4 (Void)
            changeWorldState(4)
        }
        if (e.key == '-') { // Press - to slow down time
            if ((timeFactor - 1) >= 1) {
                timeFactor--
            }
        }
        if (e.key == '=' || e.key == '+') { // Press + to speed up time
            timeFactor++
        }
        if (e.key == 't' || e.key == 'T') { // Press T to make a person Think about Time (won't work if Time Tool is already obtained)
            makePersonThink()
        }
        if (e.key == 'p' || e.key == 'P') { // Press P to spawn a Person
            spawnBeing('person')
        }
        if (e.key == 's' || e.key == 'S') { // Press S to Save a .png of the canvas
            saveImage()
        }
        if (e.key == 'd' || e.key == 'D') { // Press D to spawn a Dog
            spawnBeing('dog')
        }
        if (e.key == 'g' || e.key == 'G') { // Press G to Give all tools (and set all World Flags to true)
            addTool(brushTool)
            addTool(foliageTool)
            addTool(dogTool)
            addTool(personTool)
            addTool(timeTool)
            worldFlags.brushColorChanged = true
            worldFlags.climateChanged = true
            worldFlags.foliageFertilized = true
            worldFlags.personToolUsed =  true
        }
        if (e.key == 'c' || e.key == 'C') { // Press C to increment the Climate
            changeClimate()
        }
        if (e.key == 'b' || e.key == 'B') { // Press B to Bloom a foliage somewhere
            bloomFoliage()
        }
    }
    // Any other keyboard commands go below
    if (e.key == '`' || e.key == '~') { // Press ~ to toggle Debug Mode
            debugMode = !debugMode
            sound.debugMode.cloneNode().play()
    }
})