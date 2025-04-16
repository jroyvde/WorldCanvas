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

    onSwitchTo() {
        let dragging = false;
        // Animate the hand based on what it's doing
        mainCanvas.on('dragstart', (e) => {
            dragging = true;
            cursor.changeAnim('picking');
            cursor.changeOffset(6, 12);
            // Play sound
            sound.pick.play();
        })
        mainCanvas.on('dragend', (e) => {
            dragging = false;
            cursor.changeAnim('grabby');
            cursor.changeOffset(0, 0);
        })
        mainCanvas.on('pointerenter', (e) => {
            if (!dragging && e.target && (e.target.image() == (dogImage) ||
            e.target.image() == (personImage))) {
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

// Brush - Allows the user to paint. Colour-tints certain objects
const brushTool = new Tool({
    displayName: 'Brush',
    cursorImage: brushToolImage,
    cursorAnims: brushToolAnims,
    bubblePositionX: 142, 
    bubblePositionY: 150,
    leftClickAction: brushPaint,
});

function brushPaint() {
    // paint
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
    const canvasCapture = mainLayer.toDataURL({
        mimeType: 'image/png',
    });
    
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
    leftClickAction: null,
    rightClickAction: freezeEntity,
});

function freezeEntity() {       // Freeze an entity in time
    console.log('freeze');
}