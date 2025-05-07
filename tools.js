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

// Placeholder for unimplemented tool actions
function noAction() {
    sound.error.cloneNode().play();
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
    onSwitchTo() {
        // Change the cursor sprite to match the current color
        cursor.changeAnim(brushTool.colors[brushTool.colorIndex].name);
    },
    onSwitchFrom() {
        // Remove all painting-related event listeners
        mainCanvas.off('pointerdown.brushPaint');
        mainCanvas.off('pointerup.brushPaint');
        mainCanvas.off('pointermove.brushPaint');  
    },
});

function brushPaint() {
    let isPainting = false; // Flag to check if painting is in progress
    let lastPointerPosition; // Store the last pointer position

    mainCanvas.on('pointerdown.brushPaint', (e) => {
        // Start painting when the pointer is pressed
        isPainting = true;
        lastPointerPosition = cursor.sprite.position();
    });

    mainCanvas.on('pointerup.paintPUp', (e) => {
        // Stop painting when the pointer is released
        isPainting = false;
    });

    mainCanvas.on('pointermove.paintPMove', (e) => {
        if (!isPainting) return; // Only paint if the pointer is pressed
        
        paintContext.globalCompositeOperation = 'source-over';
        paintContext.beginPath();

        sound.brushPaint.play();

        const localPos = {
            x: lastPointerPosition.x - paintImage.x(),
            y: lastPointerPosition.y - paintImage.y(),
        };

        paintContext.moveTo(localPos.x, localPos.y);
        const pos = cursor.sprite.position();
        const newLocalPos = {
            x: pos.x - paintImage.x(),
            y: pos.y - paintImage.y(),
        };
        paintContext.lineTo(newLocalPos.x, newLocalPos.y);
        paintContext.closePath();
        paintContext.stroke();
    
        lastPointerPosition = pos;
        // redraw manually
        paintLayer.batchDraw();
    });
}

brushTool.colors = [
    { name: 'idle', color: '#9614cc' }, // purple
    { name: 'red', color: '#c21f1f' },  // red
    { name: 'orange', color: '#e1721d' }, // orange
    { name: 'yellow', color: '#e6c245' }, // yellow
    { name: 'green', color: '#2aa822' },  // green
    { name: 'blue', color: '#2372cc' },   // blue
]

brushTool.colorIndex = 0; // Start with purple

function brushNextColor() {
    // Remove all painting-related event listeners
    mainCanvas.off('pointerdown.brushPaint');
    mainCanvas.off('pointermove.brushPaint');
    mainCanvas.off('pointerup.brushPaint');

    // change the brush color to the next in the list (purple, red, orange, yellow, green, blue...)
    if (brushTool.colorIndex < brushTool.colors.length - 1) {
        brushTool.colorIndex++;
        cursor.changeAnim(brushTool.colors[brushTool.colorIndex].name);
        paintContext.strokeStyle = brushTool.colors[brushTool.colorIndex].color;
    } else {
        brushTool.colorIndex = 0;
        cursor.changeAnim('idle');
        paintContext.strokeStyle = brushTool.colors[brushTool.colorIndex].color;
    }
    // Play sound
    sound.brushColorChange.cloneNode().play();
}


// Dog
const dogTool = new Tool({
    displayName: 'Dog',
    cursorImage: dogToolImage,
    cursorAnims: dogToolAnims,
    bubblePositionX: 164, 
    bubblePositionY: 150,
    leftClickAction: dogDecide,
    rightClickAction: noAction,
});

let dogTasty = [ brushImage ];

function dogDecide(target) {
    // Get target parent Entity
    targetEntity = getParentEntity(target);

    // Just bark if target is not an Entity
    if (!targetEntity) {
        dogBark();
        return;
    }

    // If clicking on 'food', eat
    if (dogTasty.includes(target.image())) {
        // If the target is tasty, eat it
        dogEat(targetEntity);
        return;
    }

    // Otherwise, bark
    dogBark();
}

function dogBark() {
    // Play a sound - bork
    sound.dogBark.cloneNode().play();
}


function dogEat(targetEntity) {
    sound.dogEat.cloneNode().play();
    targetEntity.destroy(); // Remove the target entity
}


// Person
const personTool = new Tool({
    displayName: 'Person',
    cursorImage: personToolImage,
    cursorAnims: personToolAnims,
    bubblePositionX: 98,
    bubblePositionY: 150,
    leftClickAction: noAction,
    rightClickAction: noAction,
});


// Save (temp name)
const saveTool = new Tool({
    displayName: 'Save',
    cursorImage: saveToolImage,
    cursorAnims: saveToolAnims,
    bubblePositionX: 186, 
    bubblePositionY: 150,
    leftClickAction: saveImage,
    rightClickAction: noAction,
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

    sound.save.cloneNode().play();
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
    cursorImage: timeToolImage,
    cursorAnims: timeToolAnims,
    bubblePositionX: 230, 
    bubblePositionY: 150,
    leftClickAction: timeAccelerate,
    rightClickAction: timeFreeze,
});

let timeAccelState = 0; // 0 = Neutral, 1 = Accelerating, 2 = Decelerating

function timeAccelerate() {     // Globally accelerate time while mouse held, slowly return to normal on mouse release 
    // Don't accelerating if decelerating
    if (timeAccelState == 2) {
        return;
    }

    timeAccelState = 1;

    cursor.changeAnim('accel');
    
    let accelInterval = 500;

    mainCanvas.on('pointerup.timeAccelerate', (e) => {
        mainCanvas.off('pointerup.timeAccelerate');
        clearTimeout(accelTimeout);
        decelerate(accelInterval);
        cursor.changeAnim('idle');
        cursor.changeFrameRate(2);
    })

    function accelerate() {
        sound.timeAccel.cloneNode().play();
        cursor.changeFrameRate(2 * timeFactor);
        timeFactor++;
        accelInterval = Math.max(50, accelInterval - 15); // prevent it from going too fast

        accelTimeout = setTimeout(accelerate, accelInterval);
    }

    let initialAccelInterval;
    let initialTimeFactor;

    function decelerate(accelInterval) {
        timeAccelState = 2;
        
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
            timeAccelState = 0;
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

function timeFreeze(target) {
    if (getParentEntity(target)) {
        timeFreezeEntity(target);
    } else {
        timeFreezeWorld();
    }
}

function timeFreezeEntity(target) {  // Freeze an entity in time
    let targetEntity = getParentEntity(target);
    if (targetEntity.frozen) {
        targetEntity.unfreeze();

        cursor.changeAnim('unfreeze');
        cursor.changeFrameRate(8);

        // Change animation back to idle after 500ms
        setTimeout(() => {
            cursor.changeAnim('idle');
            cursor.changeFrameRate(2);
        }, 500);
        
        sound.timeUnfreeze.play();
    } else if (targetEntity.grabbable) {  // (For now,) Use the Entity's grabbable variable to decide if we can freeze it
        targetEntity.freeze();

        cursor.changeAnim('freeze');
        cursor.changeFrameRate(8);

        // Change animation back to idle after 500ms
        setTimeout(() => {
            cursor.changeAnim('idle');
            cursor.changeFrameRate(2);
        }, 500);

        sound.timeFreeze.play();
    }
}

function timeFreezeWorld() {  // Freeze the whole world in time
    if (!worldFrozen) {
        worldFrozen = true;
        // Freeze all entities
        for (let i = 0; i < entitiesOnCanvas.length; i++) {
            entitiesOnCanvas[i].freeze();
        }

        cursor.changeAnim('freezeWorld');
        cursor.changeFrameRate(8);

        // Change animation back to idle after 500ms
        setTimeout(() => {
            cursor.changeAnim('idle');
            cursor.changeFrameRate(2);
        }, 500);

        sound.timeFreeze.play(); // Play sound
    } else {
        worldFrozen = false;
        // Unfreeze all entities
        for (let i = 0; i < entitiesOnCanvas.length; i++) {
            entitiesOnCanvas[i].unfreeze();
        }

        cursor.changeAnim('unfreezeWorld');
        cursor.changeFrameRate(8);

        // Change animation back to idle after 500ms
        setTimeout(() => {
            cursor.changeAnim('idle');
            cursor.changeFrameRate(2);
        }, 500);

        sound.timeUnfreeze.play(); // Play sound
    }
}