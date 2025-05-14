// Enable (or not) debug mode keyboard shortcuts
let debugMode = 1;

// Switch to and give the default Tool
switchTool(defaultTool);
addTool(defaultTool);

// Give the Save Tool
addTool(saveTool);

// Handle key presses
addEventListener("keydown", (e) => {
    // Debug Mode keyboard commands
    if (debugMode) {
        if (e.key == "0") { // Press 0 to set worldState to 0 (Initial state)
            changeWorldState(0);
        }
        if (e.key == "1") { // Press 1 to set worldState to 1 (Environmental Tools Unlocked)
            changeWorldState(1);
        }
        if (e.key == "2") { // Press 2 to set worldState to 2 (Living Being Tools Unlocked)
            changeWorldState(2);
        }
        if (e.key == "3") { // Press 3 to set worldState to 3 (Concept Tools Unlocked)
            changeWorldState(3);
        }
        if (e.key == "4") { // Press 4 to set worldState to 4 (Void)
            changeWorldState(4);
        }
        if (e.key == "-") { // Press - to slow down time
            if ((timeFactor - 1) >= 1) {
                timeFactor--;
            }
        }
        if (e.key == "=") { // Press + to speed up time
            timeFactor++;
        }
        if (e.key == "p") { // Press P to spawn a Person
            // spawn a person
            spawnBeing("person");
        }
        if (e.key == "s") { // Press S to Save a .png of the canvas
            saveImage();
        }
        if (e.key == "d") { // Press D to spawn a Dog
            // spawn a dog
            spawnBeing("dog");
        }
        if (e.key == "g") { // Press G to Give all tools
            addTool(brushTool);
            addTool(dogTool);
            addTool(personTool);
            addTool(timeTool);
        }
    }
    // Any other keyboard commands go below
    
})