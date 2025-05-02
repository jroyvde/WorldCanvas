console.log('tools.js loaded');
// Library for all the Tools we can use

// Tool base class
class Tool {
    constructor({displayName, cursorImage, cursorAnims, bubblePositionX, bubblePositionY, leftClickAction, rightClickAction, onSwitchTo, onSwitchFrom}) {
        this.displayName = displayName;
        this.cursorImage = cursorImage;
        this.cursorAnims = cursorAnims;
        this.bubblePositionX = bubblePositionX;     // Coordinates the tool will appear in once unlocked
        this.bubblePositionY = bubblePositionY;
        this.leftClickAction = leftClickAction;     // Function to run on left click
        this.rightClickAction = rightClickAction;   // Function to run on right click
        this.onSwitchTo = onSwitchTo;               // Function that will run right after we switch to the tool
        this.onSwitchFrom = onSwitchFrom;           // Function that will run just before switching away from the tool

        this.obtained = false;
    }
}

// Grab - Allows the user to pick things up and move them around
const grabTool = new Tool({
    displayName: 'Grab',
    cursorImage: grabToolImage,
    cursorAnims: grabToolAnims,
    bubblePositionX: 120, 
    bubblePositionY: 150,
    leftClickAction: extractTool,

    onSwitchTo() {
        // Animate the hand based on what it's doing
        let dragging = false;
        mainCanvas.on('dragstart', (e) => {
            dragging = true;
            cursor.changeAnim('picking');
            cursor.changeOffset(6, 12);
            // Play sound
            sound.grabPick.play();
        })
        mainCanvas.on('dragend', (e) => {
            dragging = false;
            cursor.changeAnim('grabby');
            cursor.changeOffset(0, 0);
        })
        mainCanvas.on('pointerenter', (e) => {
            if (!dragging && e.target.draggable()) {
                cursor.changeAnim('grabby');
            }
            else {
                cursor.changeAnim('idle');
            }
        });
    },

    onSwitchFrom() {
        // Stop animating the hand
        mainCanvas.off('pointerenter');
    },
});

function extractTool(target) {
    if (getParentEntity(target)) {
        let targetEntity = getParentEntity(target);
        if (targetEntity.mappedTool) {
            if (!targetEntity.mappedTool.obtained) {
                addTool(targetEntity.mappedTool);
            }
            switchTool(targetEntity.mappedTool);
        } else {
            return;
        }
    }
}

// Brush - Allows the user to paint. Colour-tints certain objects
const brushTool = new Tool({
    displayName: 'Brush',
    cursorImage: brushToolImage,
    cursorAnims: brushToolAnims,
    bubblePositionX: 142, 
    bubblePositionY: 150,
    leftClickAction: brushPaint,
    rightClickAction: brushNextColor,
    onSwitchFrom() {
        // Remove all painting-related event listeners
        mainCanvas.off('pointerdown.brushPaint');
        mainCanvas.off('pointermove.brushPaint');
        mainCanvas.off('pointerup.brushPaint');

        // Reset color to default
        brushDefaultColor();
    },
});

function brushPaint() {
    let lastPointerPosition = null; // Store the last pointer position

    mainCanvas.on('pointerdown.brushPaint', (e) => {
        // Start painting when the pointer is pressed
        lastPointerPosition = cursor.sprite.position();
        paintAt(lastPointerPosition.x, lastPointerPosition.y);

        mainCanvas.on('pointermove.brushPaint', onPointerMove);
    });

    mainCanvas.on('pointerup.paintPUp', (e) => {
        // Stop painting when the pointer is released
        mainCanvas.off('pointermove.brushPaint', onPointerMove);
        lastPointerPosition = null;
    });

    function onPointerMove(e) {
        const currentPointerPosition = cursor.sprite.position();
        if (lastPointerPosition) {
            drawLineBetween(lastPointerPosition, currentPointerPosition);
        }
        lastPointerPosition = currentPointerPosition;
    }

    function paintAt(x, y) {
        const newPaint = new Paint(x, y, brushTool.colors[brushTool.colorIndex]);
    }

    function drawLineBetween(start, end) {
        const distance = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        const steps = Math.ceil(distance / 2); // Adjust step size for smoothness
        const deltaX = (end.x - start.x) / steps;
        const deltaY = (end.y - start.y) / steps;

        for (let i = 0; i <= steps; i++) {
            const x = start.x + deltaX * i;
            const y = start.y + deltaY * i;
            paintAt(x, y);
        }
    }
}

brushTool.colors = [
    'idle', // purple
    'red',  // red
    'orange', // orange
    'yellow', // yellow
    'green', // green
    'blue', // blue
]

brushTool.colorIndex = 0; // Start with purple

function brushNextColor() {
    // change the brush color to the next in the list (purple, red, orange, yellow, green, blue...)
    if (brushTool.colorIndex < brushTool.colors.length - 1) {
        brushTool.colorIndex++;
        cursor.changeAnim(brushTool.colors[brushTool.colorIndex]);
    } else {
        brushTool.colorIndex = 0;
        cursor.changeAnim('idle');
    }
    // Play sound
}

function brushDefaultColor() {
    // Set the brush to the default color (purple)
    brushTool.colorIndex = 0;
    cursor.changeAnim('idle');
}

// Dog
const dogTool = new Tool({
    displayName: 'Dog',
    cursorImage: dogToolImage,
    cursorAnims: dogToolAnims,
    bubblePositionX: 164, 
    bubblePositionY: 150,
    leftClickAction: dogDecide,
});

function dogDecide(target) {
    // If clicking on a being, X
    // If clicking on 'food', eat
    // Otherwise, bark
}

function dogBark() {

}

function dogEat(target) {

}

// Person
const personTool = new Tool({
    displayName: 'Person',
    cursorImage: personToolImage,
    cursorAnims: personToolAnims,
    bubblePositionX: 98,
    bubblePositionY: 150,
});

// Save (temp name)
const saveTool = new Tool({
    displayName: 'Save',
    cursorImage: toolImage,
    cursorAnims: toolAnims,
    bubblePositionX: 186, 
    bubblePositionY: 150,
    leftClickAction: saveImage,
});

function saveImage() {
    cursorLayer.visible(false);
    bubbleLayer.visible(false);

    const canvasCapture = mainCanvas.toDataURL({
        mimeType: 'image/png',
    });

    cursorLayer.visible(true);
    bubbleLayer.visible(true);

    let link = document.createElement('a');
    link.href = canvasCapture;
    link.download = 'WorldCanvas.png';
    link.click();
}

// Love - Increases love on entities. (Alternate mode to decrease love?)
const loveTool = new Tool({
    displayName: 'Love',
    cursorImage: toolImage,
    cursorAnims: toolAnims,
    bubblePositionX: 208, 
    bubblePositionY: 150,
    leftClickAction: null,
});

// Time - Accelerates time on the whole world or specific entities. Can also freeze entities.
const timeTool = new Tool({
    displayName: 'Time',
    cursorImage: toolImage,
    cursorAnims: toolAnims,
    bubblePositionX: 230, 
    bubblePositionY: 150,
    leftClickAction: timeAccelerate,
    rightClickAction: timeFreezeEntity,
});

function timeAccelerate() {     // Globally accelerate time while mouse held, slowly return to normal on mouse release 
    let accelInterval = 500;

    mainCanvas.on('pointerup.timeAccelerate', (e) => {
        mainCanvas.off('pointerup.timeAccelerate');
        clearTimeout(accelTimeout);
        decelerate(accelInterval);
    })

    function accelerate() {
        sound.timeAccel.cloneNode().play();
        timeFactor++;
        accelInterval = Math.max(50, accelInterval - 15); // prevent it from going too fast

        accelTimeout = setTimeout(accelerate, accelInterval);
    }

    let initialAccelInterval;
    let initialTimeFactor;

    function decelerate(accelInterval) {
        if (initialAccelInterval === undefined) {
            initialAccelInterval = accelInterval;
            initialTimeFactor = timeFactor;
        }

        sound.timeAccel.cloneNode().play();
    
        // Map accelInterval linearly to timeFactor
        let t = (accelInterval - 500) / (initialAccelInterval - 500);
        t = Math.max(0, Math.min(1, t)); // Clamp between 0 and 1
        timeFactor = 1 + (initialTimeFactor - 1) * t;
    
        if (accelInterval >= 500) { // slightly above 1 to allow rounding errors
            timeFactor = 1;
            return;
        }
    
        accelInterval += 15;
        accelTimeout = setTimeout(() => {
            decelerate(accelInterval);
        }, accelInterval);
    }

    accelerate();
}

function timeFreezeEntity(target) {   // Freeze an entity in time
    if (getParentEntity(target)) {
        let targetEntity = getParentEntity(target);
        if (targetEntity.frozen) {
            targetEntity.unfreeze();
            sound.timeUnfreeze.play();
        } else {
            targetEntity.freeze();
            sound.timeFreeze.play();
        }
    }
}