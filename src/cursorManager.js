console.log('cursorManager.js loaded')

const cursor = {
    sprite: new Konva.Sprite({
        x: 50,
        y: 50,
        offsetX: 0,
        offsetY: 0,
        image: defaultTool.cursorImage,
        animations: defaultTool.cursorAnims,
        animation: Object.keys(defaultTool.cursorAnims)[0],
        frameRate: 2,
        frameIndex: 0,
        listening: false,
    }),

    // Change the image and animation set to match the chosen tool
    changeTool(tool) {  
        this.sprite.image(tool.cursorImage)
        this.sprite.animations(tool.cursorAnims)
        this.sprite.animation(Object.keys(tool.cursorAnims)[0])
    },

    // Play a different animation belonging to the current tool
    changeAnim(animName) {
        // Make sure the animation exists for the current tool
        if (!this.sprite.animations()[animName]) {
            console.error(`Animation ${animName} does not exist for the current tool. (${this.sprite.image().src})`)
            return
        }
        this.sprite.animation(animName)
        this.sprite.start()
    },

    // Change offset, e.g., when picking things up
    changeOffset(x, y) {
        this.sprite.offsetX(x)
        this.sprite.offsetY(y)
    },

    // Change the animation frame rate
    changeFrameRate(rate) {
        this.sprite.frameRate(rate)
    },

    // Have the cursor follow the mouse's position
    trackMouse(stage) {
        const container = stage.container()
    
        container.addEventListener('pointermove', (e) => {
            let pos = stage.getPointerPosition()
            pos.x = pos.x / scaleFactor
            pos.y = pos.y / scaleFactor
            if (pos) {
                this.sprite.position(pos)
                this.sprite.getLayer().batchDraw()
            }
        })
    }
}