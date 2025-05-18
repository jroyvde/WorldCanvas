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
    bubblePositionY: 160,
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


// Brush - Allows the user to paint. Can change the colour of Entities
const brushTool = new Tool({
    displayName: 'Brush',
    cursorImage: brushToolImage,
    cursorAnims: brushToolAnims,
    bubblePositionX: 95, 
    bubblePositionY: 160,
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

function brushPaint(target) {
    // If the target is an Entity, paint it
    if (getParentEntity(target)) {
        paintEntity(target);
        return;
    }

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

function paintEntity(target) {
    // Get the target entity
    let targetEntity = getParentEntity(target);
    if (targetEntity) {
        targetEntity.setColor(hexColorToRGB(brushTool.colors[brushTool.colorIndex].color));
        sound.brushPaint.play(); // Play sound
    }
}


// Foliage
const foliageTool = new Tool({
    displayName: 'Foliage',
    cursorImage: foliageToolImage,
    cursorAnims: foliageToolAnims,
    bubblePositionX: 170, 
    bubblePositionY: 160,
    leftClickAction: foliageDecide,
    rightClickAction: noAction,
    onSwitchTo() {
        
    },
    onSwitchFrom() {

    },
});

function foliageDecide(target) {
    foliageCreate(target);
}

function foliageCreate(target) {
    newFoliage = new Foliage(cursor.sprite.x(), cursor.sprite.y());
    sound.foliagePlant.cloneNode().play();
}

function foliageChangeEnvironment(target) {

}


// Dog
const dogTool = new Tool({
    displayName: 'Dog',
    cursorImage: dogToolImage,
    cursorAnims: dogToolAnims,
    bubblePositionX: 70, 
    bubblePositionY: 160,
    leftClickAction: dogDecide,
    rightClickAction: dogPoop,
});

let dogTasty = [ brushImage, brushImagePainted ];  // Dog Entities will pursue and eat entities with these images
let dogSortOfTasty = [ pooImage, pooImagePainted, foliageImage, foliageImagePainted ];  // Only the Dog Tool will eat these

function dogDecide(target) {
    // Get target parent Entity
    targetEntity = getParentEntity(target);

    // Just bark if target is not an Entity
    if (!targetEntity) {
        dogBark();
        return;
    }

    // If target is painted, lick it
    if ([...paintedImages.values()].includes(targetEntity.sprite.image())) {
        dogLick(targetEntity);
        return;
    }

    // If clicking on 'food', eat
    if (dogTasty.includes(target.image()) || dogSortOfTasty.includes(target.image())) {
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
    sound.dogEat.cloneNode().play();  // Play sound
    // If the entity is a Foliage with a growthStage of 1 or higher, prune it instead of destroying it
    if (targetEntity.growthStage > 0) {
        targetEntity.prune();
    } else {
        targetEntity.destroy();  // Remove the target entity
    }
}

function dogLick(targetEntity) {
    targetEntity.clearColor();  // Clear the color of the target entity
    sound.dogLick.cloneNode().play();  // Play sound
}

function dogPoop() {

    sound.dogPoop.cloneNode().play();  // Play sound

    // Create a poop
    const cursorPos = cursor.sprite.position();
    const pooPos = {
        x: cursorPos.x + 16,
        y: cursorPos.y + 16,
    };
    let newPoo = new Poo(pooPos.x, pooPos.y);
    newPoo.fertilize();  // Trigger the fertilize check on the new Poo
}


// Person
const personTool = new Tool({
    displayName: 'Person',
    cursorImage: personToolImage,
    cursorAnims: personToolAnims,
    bubblePositionX: 45,
    bubblePositionY: 160,
    leftClickAction: personRandomize,
    rightClickAction: noAction,
});

let randomizeInterval = null; // Store the interval ID

function personRandomize(target) {
    // Don't randomize if the interval is already running
    if (randomizeInterval) {
        return;
    }

    sound.personRandomize.cloneNode().play();  // Play sound

    // Determine if we are targeting a specific Entity or not
    let targetEntity;
    if (getParentEntity(target)) {
        targetEntity = getParentEntity(target);
    } else {
        targetEntity = null;
    }

    // Randomize 5 times in rapid succession
    let count = 0;
    randomizeInterval = setInterval(() => {
        if (count >= 5) {
            clearInterval(randomizeInterval);
            randomizeInterval = null; // Reset the interval ID
            return;
        }
        count++;
        personRandomizeStep(targetEntity);
    }, 100);
}

function personRandomizeStep(targetEntity) {
    // Use the entitiesOnCanvas array as is, to avoid an endless loop
    const entitiesSnapshot = [...entitiesOnCanvas];

    // Loop through all entities and randomize them
    for (let i = 0; i < entitiesSnapshot.length; i++) {
        if (entitiesSnapshot[i] != null) {
            // Store the entity's position
            let x = entitiesSnapshot[i].sprite.x();
            let y = entitiesSnapshot[i].sprite.y();
            // Check if the entity is painted, store its color information if so
            let colorInfo = null;
            if ([...paintedImages.values()].includes(entitiesSnapshot[i].sprite.image())) {
                colorInfo = {
                    r: entitiesSnapshot[i].sprite.red(),
                    g: entitiesSnapshot[i].sprite.green(),
                    b: entitiesSnapshot[i].sprite.blue(),
                };
            }
            // Destroy the entity
            entitiesSnapshot[i].destroy();
            // Create a new entity of a random type
            let randomEntity = validRandomEntities[Math.floor(Math.random() * validRandomEntities.length)];
            let newEntity = new randomEntity(x, y);
            // If the entity was painted, paint the new entity with the same color
            if (colorInfo) {
                newEntity.setColor(colorInfo);
            }
        }
    }
}


// Save
const saveTool = new Tool({
    displayName: 'Save',
    cursorImage: saveToolImage,
    cursorAnims: saveToolAnims,
    bubblePositionX: 145, 
    bubblePositionY: 160,
    leftClickAction: saveImage,
    rightClickAction: noAction,
});

// Save the canvas as an image to the user's computer
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

// Let the user upload their own image as the background
function saveUploadBackground() {

}


// Love - Increases love on entities. (Alternate mode to decrease love?)
const loveTool = new Tool({
    displayName: 'Love',
    cursorImage: toolImage,
    cursorAnims: toolAnims,
    bubblePositionX: 208, 
    bubblePositionY: 160,
    leftClickAction: null,
});


// Time - Accelerates time on the whole world or specific entities. Can also freeze entities.
const timeTool = new Tool({
    displayName: 'Time',
    cursorImage: timeToolImage,
    cursorAnims: timeToolAnims,
    bubblePositionX: 195, 
    bubblePositionY: 160,
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
        worldFrozenImageNode.opacity(1);
        // Freeze all entities
        for (const entity of entitiesOnCanvas) {
            if (entity != null) {
                entity.freeze();
            }
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
        worldFrozenImageNode.opacity(0);
        // Unfreeze all entities
        for (const entity of entitiesOnCanvas) {
            if (entity != null) {
                entity.unfreeze();
            }
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