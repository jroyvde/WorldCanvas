// Factor for scaling up our small, pixelly canvas
const scaleFactor = 4;

// Base width and height for our canvas
const baseWidth = 240;
const baseHeight = 180;

// Establish our main canvas
const mainCanvas = new Konva.Stage({
    container: 'mainCanvas',
    width: baseWidth * scaleFactor,
    height: baseHeight * scaleFactor,
});

// Function for creating a layer, ensuring proper scaling, and adding to mainCanvas
function makeScaledLayer() {
    const newLayer = new Konva.Layer();
    newLayer.scale({ x: scaleFactor, y: scaleFactor });
    newLayer.imageSmoothingEnabled(false);
    mainCanvas.add(newLayer);
    return newLayer;
}

const mainLayer = makeScaledLayer();    // Layer for background and entities inside the canvas
const bubbleLayer = makeScaledLayer();  // Layer for tool bubbles and any other UI
const cursorLayer = makeScaledLayer();  // Layer for the cursor

// Add in background image
const backgroundImageNode = new Konva.Image({
    image: backgroundImage,
})
mainLayer.add(backgroundImageNode);

// Add in cursor
cursorLayer.add(cursor.sprite);
cursor.trackMouse(mainCanvas);

// Do not open browser context menu on right click
mainCanvas.on('contextmenu', (e) => {
    e.evt.preventDefault();
});

// Handle click events
mainCanvas.on('click', (e) => {
    if (e.target.image() != bubbleImage) {  // Make sure we're not clicking on a Tool Bubble
        if (e.evt.button === 2) {  // Right click
            if (activeTool.rightClickAction) {  // Make sure the active tool has a rightClickAction before trying to execute it
                activeTool.rightClickAction(e.target);
            }
        }
        else {  // Left click
            if (activeTool.leftClickAction) {  // Make sure the active tool has a leftClickAction before trying to execute it
                activeTool.leftClickAction(e.target);
            }
        }
    }
});

// Time factor. Can be manipulated once the player obtains the Time Tool. Default = 1
let timeFactor = 1;

// Enable (or not) debug mode keyboard shortcuts
let debugMode = 1;

// Switch to and give the default Tool
switchTool(defaultTool);
addTool(defaultTool);

// Handle key presses
addEventListener("keydown", (e) => {
    // Debug Mode keyboard commands
    if (debugMode) {
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
            newPerson = new Person(...chooseSpawnPoint());
        }
        if (e.key == "s") { // Press S to Save a .png of the canvas
            saveImage();
        }
        if (e.key == "d") { // Press D to spawn a Dog
            // spawn a dog
            newDog = new Dog(...chooseSpawnPoint());
        }
        if (e.key == "g") { // Press G to Give all tools
            addTool(brushTool);
            addTool(dogTool);
            addTool(saveTool);
            addTool(loveTool);
            addTool(timeTool);
        }
    }
    // Any other keyboard commands go below
    
})