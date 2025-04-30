console.log('canvasManager.js loaded');

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
    imageSmoothingEnabled: false,
});

// Function for creating a layer, ensuring proper scaling, and adding to mainCanvas
function makeScaledLayer(scaleSetting) {
    const newLayer = new Konva.Layer();
    if (scaleSetting != 'noscale') {
        newLayer.scale({ x: scaleFactor, y: scaleFactor });
    }
    newLayer.imageSmoothingEnabled(false);
    mainCanvas.add(newLayer);
    return newLayer;
}

const backgroundLayer = makeScaledLayer('noscale');
const mainLayer = makeScaledLayer();    // Layer for background and entities inside the canvas
const bubbleLayer = makeScaledLayer();  // Layer for tool bubbles and any other UI
const cursorLayer = makeScaledLayer();  // Layer for the cursor

// Add in background image
const backgroundImageNode = new Konva.Image({
    image: backgroundImage,
})
backgroundLayer.add(backgroundImageNode);

// Add in cursor
cursorLayer.add(cursor.sprite);
cursor.trackMouse(mainCanvas);

// Do not open browser context menu on right click
mainCanvas.on('contextmenu', (e) => {
    e.evt.preventDefault();
});

// Handle click events
mainCanvas.on('pointerdown', (e) => {
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