const bubbleSpawnOffset = 50;
const bubbleRiseSpeed = 0.5;

let activeTool = null;
let defaultTool = grabTool;

function switchTool(tool) {
    if (tool != activeTool) {
        // Perform 'onSwitchFrom' tasks for the previous tool
        if (activeTool && activeTool.onSwitchFrom) {
            activeTool.onSwitchFrom();
        }
        // Change the cursor
        cursor.changeTool(tool);
        // Change the activeTool value
        activeTool = tool;
        // Perform 'onSwitchTo' tasks for the new tool
        if (activeTool.onSwitchTo != null) {
            activeTool.onSwitchTo();
        }
        // Play sound
        sound.select.play();
    }
}

// Add a tool to the user's screen
function addTool(tool) {
    if (!tool.obtained) {
        tool.obtained = true;               // mark the tool as obtained
        newBubble = new toolBubble(tool);   // add a new tool to the user's collection by having it appear
    }
}

class toolBubble {
    constructor(containedTool) {
        this.containedTool = containedTool;

        // Create Konva sprite for the tool inside the bubble
        this.innerSprite = new Konva.Sprite({
            x: containedTool.bubblePositionX,
            y: containedTool.bubblePositionY + bubbleSpawnOffset, // Spawn a bit below the destination, off-screen
            offsetX: 7,
            offsetY: 7,
            image: containedTool.cursorImage,
            animations: containedTool.cursorAnims,
            animation: Object.keys(containedTool.cursorAnims)[0],
            frameRate: 2,
            frameIndex: 0,
        });
        bubbleLayer.add(this.innerSprite);
        this.innerSprite.start();

        // Create Konva sprite for the bubble itself
        this.sprite = new Konva.Sprite({
            x: containedTool.bubblePositionX,
            y: containedTool.bubblePositionY + bubbleSpawnOffset, // Spawn a bit below the destination, off-screen
            offsetX: 12,
            offsetY: 12,
            image: bubbleImage,
            animations: bubbleAnims,
            animation: 'idle',
            frameRate: 2,
            frameIndex: 0,
        });

        bubbleLayer.add(this.sprite);
        this.sprite.start();

        // Animate rising up to the destination coordinates
        moveKonvaSprite(this.sprite, bubbleRiseSpeed, containedTool.bubblePositionX, containedTool.bubblePositionY, () => {
            // Any thing to do after the animation
            
        });

        // Animate contents rising up to the destination coordinates
        moveKonvaSprite(this.innerSprite, bubbleRiseSpeed, containedTool.bubblePositionX, containedTool.bubblePositionY);

        // Change tool when clicked
        this.sprite.on('mousedown', () => {
            if (activeTool != containedTool) {
                switchTool(this.containedTool);
                console.log(activeTool);
            }
        });
    }
}