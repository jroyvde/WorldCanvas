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

    changeTool(tool) {      // Change the image and animation set to match the chosen tool
        this.sprite.image(tool.cursorImage);
        this.sprite.animations(tool.cursorAnims);
        this.sprite.animation(Object.keys(tool.cursorAnims)[0]);
    },

    changeAnim(animName) {  // Play a different animation belonging to the current tool
        this.sprite.animation(animName);
        this.sprite.start();
    },

    changeOffset(x, y) {    // Change offset, e.g., when 'pinching' Beings
        this.sprite.offsetX(x);
        this.sprite.offsetY(y);
    },

    trackMouse(stage) {
        const container = stage.container();
    
        container.addEventListener('pointermove', (e) => {
            let pos = stage.getPointerPosition();
            pos.x = pos.x / scaleFactor;
            pos.y = pos.y / scaleFactor;
            if (pos) {
                this.sprite.position(pos);
                this.sprite.getLayer().batchDraw();
            }
        });
    }
};