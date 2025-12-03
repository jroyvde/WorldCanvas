console.log('canvasManager.js loaded');

// Use only right mouse button for dragging. Might change this, or not.
Konva.dragButtons = [2];

// Base width and height for our canvas (static)
const baseWidth = 240;
const baseHeight = 180;

// Calculate and set the initial factor for scaling up our small, pixelly canvas
let scaleFactor = Math.floor(parseInt(window.innerHeight) / baseHeight);

// Get the mainCanvas element's style so we can keep an eye on it and update things accordingly
const canvasElement = document.getElementById("mainCanvas");
const canvasElemStyle = getComputedStyle(canvasElement);

// Set initial container element dimensions
canvasElement.style.width = `${baseWidth * scaleFactor}px`;
canvasElement.style.height = `${baseHeight * scaleFactor}px`;

// Establish our main canvas
const mainCanvas = new Konva.Stage({
    container: 'mainCanvas',
    width: baseWidth * scaleFactor,
    height: baseHeight * scaleFactor,
    imageSmoothingEnabled: false,
});

// Listen for pointerup events on the window and fire them on the mainCanvas.
window.addEventListener('pointerup', (e) => {
    mainCanvas.fire('pointerup');
});

// Function to update the scaleFactor, and the scale of our Stage and Layers
function updateScaleFactor() {
    // Calculate the new scaleFactor
    let targetFactor = Math.max(1, Math.floor(parseInt(window.innerHeight) / baseHeight));

    // Decrease the new scaleFactor if it's too wide for the current window size
    while (baseWidth * targetFactor > window.innerWidth && targetFactor > 1) {
        targetFactor--;
    }

    // Return if the new scaleFactor would be the same as the current one
    if (targetFactor === scaleFactor) {
        return;
    }

    // Otherwise, set scaleFactor to the new value
    scaleFactor = targetFactor;

    // Update the container element
    canvasElement.style.width = `${baseWidth * scaleFactor}px`;
    canvasElement.style.height = `${baseHeight * scaleFactor}px`;

    // Then update the main Stage
    mainCanvas.width(baseWidth * scaleFactor);
    mainCanvas.height(baseHeight * scaleFactor);

    // Then iterate through layers and update their scales
    mainCanvas.getLayers().forEach((layer) => {
        layer.scale({
            x: scaleFactor,
            y: scaleFactor
        });
    });
}

updateScaleFactor();  // Run once to set everything right

// Listen for window resize events and run the updateScaleFactor function
window.addEventListener('resize', updateScaleFactor);

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

const backgroundLayer = makeScaledLayer();
const paintLayer = makeScaledLayer();  // Layer for paint
const mainLayer = makeScaledLayer();    // Layer for background and entities inside the canvas
const castLayer = makeScaledLayer();  // Layer for night cast, any other casts
const bubbleLayer = makeScaledLayer();  // Layer for tool bubbles and any other UI
const cursorLayer = makeScaledLayer();  // Layer for the cursor

// Add in background image
const backgroundImageNode = new Konva.Image({
    image: backgroundImage,
})
backgroundLayer.add(backgroundImageNode);

// Add in night cast image
const nightCastImageNode = new Konva.Image({
    image: nightCastImage,
    opacity: 0,
    listening: false,  // Don't want to interact with the night cast image
})
castLayer.add(nightCastImageNode);

// Add time freeze indicator
const worldFrozenImageNode = new Konva.Image({
    x: 4,
    y: 4,
    image: worldFrozenImage,
    opacity: 0,
    listening: false,  // Don't want to interact with the time freeze image
})
bubbleLayer.add(worldFrozenImageNode);

// Add in introductory modal
const modalImageNode = new Konva.Image({
    x: 0,
    y: 0,
    image: modalImage,
})
cursorLayer.add(modalImageNode);

// Add in introductory modal button
const modalButtonSprite = new Konva.Sprite({
    x: 104,
    y: 112,
    image: modalButtonImage,
    animations: modalButtonAnims,
    animation: 'idle',
    framerate: 2,
})

modalButtonSprite.on('click', () => {
    // Hide the modal and button
    modalImageNode.opacity(0);
    modalImageNode.listening(false);
    modalButtonSprite.opacity(0);
    modalButtonSprite.listening(false);
});

modalButtonSprite.on('mouseover', () => {
    modalButtonSprite.animation('hover');
});

modalButtonSprite.on('mouseout', () => {
    modalButtonSprite.animation('idle');
});

cursorLayer.add(modalButtonSprite);

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

// Re-order shapes based on Y position
function updateZIndices() {
  const shapes = mainLayer.getChildren();

  // Sort shapes by their y position
  const sorted = shapes.slice().sort((a, b) => a.y() - b.y());

  // Reorder them by moving each to top in sorted order
  sorted.forEach(shape => {
    shape.moveToTop();
  });
}

let zOrderUpdateTimer;
// Function to initiate Z-sorting interval
function scheduleZIndexUpdate() {
  clearInterval(zOrderUpdateTimer);
  zOrderUpdateTimer = setInterval(() => {
    updateZIndices();
  }, 200);
}
scheduleZIndexUpdate();  // Run right away

// Painting
const paintCanvas = document.createElement('canvas');
paintCanvas.width = baseWidth;
paintCanvas.height = baseHeight;

const paintImage = new Konva.Image({
    image: paintCanvas,
    width: baseWidth,
    height: baseHeight,
});
paintLayer.add(paintImage);

const paintContext = paintCanvas.getContext('2d');
paintContext.strokeStyle = '#9614cc';
paintContext.lineJoin = 'round';
paintContext.lineWidth = 3;

// Play the Clear animation
function playClearAnim(x, y) {
    // Create a circle in the center with radius 0
    const circle = new Konva.Circle({
        x: x,
        y: y,
        radius: 0,
        fill: 'white',
        listening: false,
    });

    castLayer.add(circle);
    castLayer.draw();

    circle.to({
        radius: 300,
        duration: 1,
        easing: Konva.Easings.EaseInOut,
        onFinish: () => {
            circle.to({
                opacity: 0,
                duration: 0.1,
                easing: Konva.Easings.EaseInOut,
                onFinish: () => { circle.destroy() }
            });
        }
    });
}