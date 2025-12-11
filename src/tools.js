console.log('tools.js loaded')

// Library for all the Tools we can use

// Tool base class
class Tool {
    constructor({displayName, cursorImage, cursorAnims, bubblePositionX, bubblePositionY, leftClickAction, rightClickAction, onSwitchTo, onSwitchFrom}) {
        this.displayName = displayName
        this.cursorImage = cursorImage
        this.cursorAnims = cursorAnims
        this.bubblePositionX = bubblePositionX      // Coordinates the tool will appear in once unlocked
        this.bubblePositionY = bubblePositionY
        this.leftClickAction = leftClickAction      // Function to run on left click
        this.rightClickAction = rightClickAction    // Function to run on right click
        this.onSwitchTo = onSwitchTo                // Function that will run right after we switch to the tool
        this.onSwitchFrom = onSwitchFrom            // Function that will run just before switching away from the tool
        this.obtained = false
    }
}

// Function: Placeholder for unimplemented tool actions
function noAction() {
    sound.error.cloneNode().play()
}

// Tools

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
        let dragging = false
        mainStage.on('dragstart.grabTool', (e) => {
            dragging = true
            cursor.changeAnim('picking')
            cursor.changeOffset(6, 12)
            sound.grabPick.play()   // Play sound
        })
        mainStage.on('dragend.grabTool', (e) => {
            dragging = false
            cursor.changeAnim('grabby')
            cursor.changeOffset(0, 0)
        })
        mainStage.on('pointerover.grabTool', (e) => {
            if (getParentEntity(e.target)) {
                const targetEntity = getParentEntity(e.target)
                if (!dragging && (targetEntity.grabbable || targetEntity.mappedTool)) {
                    cursor.changeAnim('grabby')
                }
                else {
                    cursor.changeAnim('idle')
                }
            } else {
                cursor.changeAnim('idle')
            }
        })
    },

    onSwitchFrom() {
        // Stop animating the hand
        mainStage.off('dragstart.grabTool')
        mainStage.off('dragend.grabTool')
        mainStage.off('pointerover.grabTool')
    },
})

function extractTool(target) {
    if (getParentEntity(target)) {
        let targetEntity = getParentEntity(target)
        if (targetEntity.mappedTool) {
            if (!targetEntity.mappedTool.obtained) {
                addTool(targetEntity.mappedTool)
            }
            switchTool(targetEntity.mappedTool)
        } else {
            return
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
        cursor.changeAnim(brushTool.colors[brushTool.colorIndex].name)
    },
    onSwitchFrom() {
        // Remove all painting-related event listeners
        mainStage.off('pointerdown.paintPDown')
        mainStage.off('pointerup.paintPUp')
        mainStage.off('pointermove.paintPMove')
    },
})

function brushPaint(target) {
    // If the target is an Entity, paint it
    if (getParentEntity(target)) {
        paintEntity(target)
        return
    }

    let isPainting = false  // Flag to check if painting is in progress
    let lastPointerPosition // Store the last pointer position

    mainStage.on('pointerdown.paintPDown', (e) => {
        // Start painting when the pointer is pressed
        isPainting = true
        lastPointerPosition = cursor.sprite.position()
    })

    mainStage.on('pointerup.paintPUp', (e) => {
        // Stop painting when the pointer is released
        isPainting = false
        mainStage.off('pointerdown.paintPDown')
        mainStage.off('pointerup.paintPUp')
        mainStage.off('pointermove.paintPMove')
    })

    mainStage.on('pointermove.paintPMove', (e) => {
        if (!isPainting) return // Only paint if the pointer is pressed
        
        paintContext.globalCompositeOperation = 'source-over'
        paintContext.beginPath()

        sound.brushPaint.play()

        const localPos = {
            x: lastPointerPosition.x - paintImage.x(),
            y: lastPointerPosition.y - paintImage.y(),
        }

        paintContext.moveTo(localPos.x, localPos.y)
        const pos = cursor.sprite.position()
        const newLocalPos = {
            x: pos.x - paintImage.x(),
            y: pos.y - paintImage.y(),
        }
        paintContext.lineTo(newLocalPos.x, newLocalPos.y)
        paintContext.closePath()
        paintContext.stroke()
    
        lastPointerPosition = pos
        // redraw manually
        layer.batchDraw()
    })
}

brushTool.colors = [
    { name: 'idle', color: '#9614cc' },     // purple
    { name: 'red', color: '#c21f1f' },      // red
    { name: 'orange', color: '#e1721d' },   // orange
    { name: 'yellow', color: '#e6c245' },   // yellow
    { name: 'green', color: '#2aa822' },    // green
    { name: 'blue', color: '#2372cc' },     // blue
]

brushTool.colorIndex = 0    // Start with purple

function brushNextColor() {
    worldFlags.brushColorChanged = true // Update World Flags

    // Remove all painting-related event listeners
    mainStage.off('pointerdown.brushPaint')
    mainStage.off('pointermove.brushPaint')
    mainStage.off('pointerup.brushPaint')

    // change the brush color to the next in the list (purple, red, orange, yellow, green, blue...)
    if (brushTool.colorIndex < brushTool.colors.length - 1) {
        brushTool.colorIndex++
        cursor.changeAnim(brushTool.colors[brushTool.colorIndex].name)
        paintContext.strokeStyle = brushTool.colors[brushTool.colorIndex].color
    } else {
        brushTool.colorIndex = 0
        cursor.changeAnim('idle')
        paintContext.strokeStyle = brushTool.colors[brushTool.colorIndex].color
    }
    // Play sound
    sound.brushColorChange.cloneNode().play()
}

function paintEntity(target) {
    // Get the target entity
    let targetEntity = getParentEntity(target)
    if (targetEntity) {
        targetEntity.setColor(hexColorToRGB(brushTool.colors[brushTool.colorIndex].color))
        sound.brushPaint.play() // Play sound
    }
}

// Foliage
const foliageTool = new Tool({
    displayName: 'Foliage',
    cursorImage: foliageToolImage,
    cursorAnims: foliageToolAnims,
    bubblePositionX: 170, 
    bubblePositionY: 160,
    leftClickAction: foliagePlant,
    rightClickAction: foliageChangeClimate,
    onSwitchTo() {
        
    },
    onSwitchFrom() {
        // Remove all planting-related event listeners
        mainStage.off('pointerdown.plantPDown')
        mainStage.off('pointerup.plantPUp')
        mainStage.off('pointermove.plantPMove')
    },
})

// Function: Plant foliage
function foliagePlant(target) {
    let isPlanting = false  // Flag to check if planting is in progress
    let lastPointerPosition // Store the last pointer position

    mainStage.on('pointerdown.plantPDown', (e) => {
        // Plant one Foliage right away on pointer down
        newFoliage = new Foliage(cursor.sprite.x(), cursor.sprite.y())
        sound.foliagePlant.cloneNode().play()
        // Start painting
        isPlanting = true
        lastPointerPosition = cursor.sprite.position()
    })

    mainStage.on('pointerup.plantPUp', (e) => {
        // Stop painting when the pointer is released
        mainStage.off('pointerdown.plantPDown')
        mainStage.off('pointerup.plantPUp')
        mainStage.off('pointermove.plantPMove')
        isPlanting = false
    })

    mainStage.on('pointermove.plantPMove', (e) => {
        // Only paint if the pointer is pressed
        if (!isPlanting) return
        // Only plant if the distance from the previous plant is great enough
        if (((Math.abs(cursor.sprite.x() - lastPointerPosition.x)) + (Math.abs(cursor.sprite.y() - lastPointerPosition.y))) < 20) return

        newFoliage = new Foliage(cursor.sprite.x(), cursor.sprite.y())
        sound.foliagePlant.cloneNode().play()
    
        lastPointerPosition = cursor.sprite.position()
    })
}

// Function: Change the climate of either a targeted Foliage, or the world
function foliageChangeClimate(target) {
    if (getParentEntity(target)) {
        const targetEntity = getParentEntity(target)
        
        if (targetEntity.growthStage != null) {  // If the entity is a Foliage, change its climate type
            targetEntity.changeClimateType()
            sound.foliageGrow.cloneNode().play()
        } else {  // Otherwise, do nothing
            sound.error.cloneNode().play()
        }
    } else {
        sound.climateChange.cloneNode().play()  // Play sound
        changeClimate() // Change the world's climate
    }
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
})

let dogTasty = [ brushImage, brushImagePainted ]    // Dog Entities will pursue and eat entities with these images
let dogSortOfTasty = [ pooImage, pooImagePainted, foliageImage, foliageImagePainted, foliageImageDesert, foliageImageDesertPainted, foliageImageSnow, foliageImageSnowPainted ] // Only the Dog Tool will eat these

function dogDecide(target) {
    // Get target parent Entity
    targetEntity = getParentEntity(target)

    // Just bark if target is not an Entity
    if (!targetEntity) {
        dogBark()
        return
    }

    // If target is painted, lick it
    if ([...paintedImages.values()].includes(targetEntity.sprite.image())) {
        dogLick(targetEntity)
        return
    }

    // If clicking on 'food', eat
    if (dogTasty.includes(target.image()) || dogSortOfTasty.includes(target.image())) {
        // If the target is tasty, eat it
        dogEat(targetEntity)
        return
    }

    // Otherwise, bark
    dogBark()
}

// Function: Bark
function dogBark() {
    // Play a sound - bork
    sound.dogBark.cloneNode().play()
}

// Function: Eat
function dogEat(targetEntity) {
    sound.dogEat.cloneNode().play() // Play sound
    // If the entity is a Foliage with a growthStage of 1 or higher, prune it instead of destroying it
    targetEntity.growthStage > 0 ? targetEntity.prune() : targetEntity.destroy()
}

// Function: Licks and removes paint from the target entity
function dogLick(targetEntity) {
    targetEntity.clearColor()           // Clear the color of the target entity
    sound.dogLick.cloneNode().play()    // Play sound
}

// Function: Makes a Poo
function dogPoop() {
    // Play sound
    sound.dogPoop.cloneNode().play()
    // Create a Poo
    const cursorPos = cursor.sprite.position()
    const pooPos = {
        x: cursorPos.x + 16,
        y: cursorPos.y + 16,
    }
    let newPoo = new Poo(pooPos.x, pooPos.y)
    newPoo.fertilize()  // Trigger the fertilize check on the new Poo
}

// Person
const personTool = new Tool({
    displayName: 'Person',
    cursorImage: personToolImage,
    cursorAnims: personToolAnims,
    bubblePositionX: 45,
    bubblePositionY: 160,
    leftClickAction: personRandomize,
    rightClickAction: personClear,
})

let randomizeInterval = null    // Store the interval ID

// Function: Randomize
function personRandomize(target) {
    // Don't randomize if the interval is already running
    if (randomizeInterval) return
    // Update World Flags
    worldFlags.personToolUsed = true            
    // Play sound
    sound.personRandomize.cloneNode().play()    

    // Randomize 5 times in rapid succession
    let count = 0
    randomizeInterval = setInterval(() => {
        if (count >= 5) {
            clearInterval(randomizeInterval)
            randomizeInterval = null    // Reset the interval ID
            return
        }
        count++
        personRandomizeStep()
    }, 100)
}

// Function: Individual randomize steps, run 5 times by randomize
function personRandomizeStep() {
    // Randomize the Climate
    changeClimate('Random')

    // Use the entitiesOnCanvas array as is, to avoid an endless loop
    const entitiesSnapshot = [...entitiesOnCanvas]

    // Loop through all entities and randomize them
    for (let i = 0; i < entitiesSnapshot.length; i++) {
        if (entitiesSnapshot[i] != null) {
            // If the Entity is Foliage, randomize its Climate Type
            if (entitiesSnapshot[i].climateType != null) {
                entitiesSnapshot[i].changeClimateType('Random')
            }
            // If the Entity has Variants, change to a random one
            if (dogImages.includes(entitiesSnapshot[i].sprite.image())) {
                entitiesSnapshot[i].sprite.image(chooseVariant(dogImages))
            }
            if (dogImagesPainted.includes(entitiesSnapshot[i].sprite.image())) {
                entitiesSnapshot[i].sprite.image(chooseVariant(dogImagesPainted))
            }
            if (personImages.includes(entitiesSnapshot[i].sprite.image())) {
                entitiesSnapshot[i].sprite.image(chooseVariant(personImages))
            }
            if (personImagesPainted.includes(entitiesSnapshot[i].sprite.image())) {
                entitiesSnapshot[i].sprite.image(chooseVariant(personImagesPainted))
            }
            // If the Entity is painted, change the paint to a random color
            if ([...paintedImages.values()].includes(entitiesSnapshot[i].sprite.image())) {
                randomColor = brushTool.colors[Math.floor(Math.random() * brushTool.colors.length)]
                entitiesSnapshot[i].setColor(hexColorToRGB(randomColor.color))
            }
        }
    }
}

// Function: Clears the canvas of all entities and paint
function personClear() {
    worldFlags.personToolUsed = true    // Update World Flags
    
    sound.personClear.cloneNode().play()

    playClearAnim(cursor.sprite.x() + 8, cursor.sprite.y() + 8)

    setTimeout(() => {
        paintContext.clearRect(0, 0, paintCanvas.width, paintCanvas.height)
        layer.batchDraw()

        const entitiesSnapshot = [...entitiesOnCanvas]

        entitiesOnCanvas = []
        activeBeings = 0
        activeDogs = 0

        for (let i = 0; i < entitiesSnapshot.length; i++) {
            if (entitiesSnapshot[i] != null) {
                entitiesSnapshot[i].destroy()
            }
        }
    }, 1000)
}

// Save
const saveTool = new Tool({
    displayName: 'Save',
    cursorImage: saveToolImage,
    cursorAnims: saveToolAnims,
    bubblePositionX: 145, 
    bubblePositionY: 160,
    leftClickAction: saveImage,
    rightClickAction: saveUploadBackground,
})

// Function: Save the canvas as an image to the user's computer
function saveImage() {
    bubbleGroup.visible(false)
    winCtrlGroup.visible(false)
    cursorGroup.visible(false)
    
    mainStage.draw()

    html2canvas(document.getElementById('stage-container')).then((canvas) => {
        const canvasCapture = canvas.toDataURL({
            mimeType: 'image/png',
        })
        let link = document.createElement('a')
        link.href = canvasCapture
        link.download = 'WorldCanvas.png'
        link.click()
    })

    bubbleGroup.visible(true)
    winCtrlGroup.visible(true)
    cursorGroup.visible(true)

    sound.save.cloneNode().play()
}

// Function: Let the user upload their own image as the background
function saveUploadBackground() {
    // Create hidden file input
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    fileInput.style.display = 'none'

    // Handle file input change
    fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()

        reader.onload = function (e) {
            const img = new Image()
            img.onload = function () {
                // Calculate scale to cover the canvas
                const scale = Math.max(baseWidth / img.width, baseHeight / img.height)

                const newWidth = img.width * scale
                const newHeight = img.height * scale

                // Calculate offset to center the image
                const offsetX = (baseWidth - newWidth) / 2
                const offsetY = (baseHeight - newHeight) / 2

                backgroundImageNode.image(img)
                backgroundImageNode.width(newWidth)
                backgroundImageNode.height(newHeight)
                backgroundImageNode.x(offsetX)
                backgroundImageNode.y(offsetY)

                backgroundGroup.draw()

                sound.saveUpload.cloneNode().play()
            }
            img.src = e.target.result
        }
        reader.readAsDataURL(file)
    })

    // Play sound
    sound.saveUploadDialog.cloneNode().play()
    // Trigger the file input
    fileInput.click()
}

// Time - Accelerates time on the whole world or specific entities. Can also freeze entities.
const timeTool = new Tool({
    displayName: 'Time',
    cursorImage: timeToolImage,
    cursorAnims: timeToolAnims,
    bubblePositionX: 195, 
    bubblePositionY: 160,
    leftClickAction: timeAccelerate,
    rightClickAction: timeFreeze,
})

let timeAccelState = 0  // 0 = Neutral, 1 = Accelerating, 2 = Decelerating

// Function: Globally accelerate time while mouse held, slowly return to normal on mouse release 
function timeAccelerate() {     
    // Don't accelerating if decelerating
    if (timeAccelState == 2) return

    timeAccelState = 1
    cursor.changeAnim('accel')
    let accelInterval = 500

    mainStage.on('pointerup.timeAccelerate', (e) => {
        mainStage.off('pointerup.timeAccelerate')
        clearTimeout(accelTimeout)
        decelerate(accelInterval)
        cursor.changeAnim('idle')
        cursor.changeFrameRate(2)
    })

    function accelerate() {
        sound.timeAccel.cloneNode().play()
        cursor.changeFrameRate(2 * timeFactor)
        timeFactor++
        accelInterval = Math.max(50, accelInterval - 15)    // prevent it from going too fast

        accelTimeout = setTimeout(accelerate, accelInterval)
    }

    let initialAccelInterval
    let initialTimeFactor

    function decelerate(accelInterval) {
        timeAccelState = 2
        
        if (initialAccelInterval === undefined) {
            initialAccelInterval = accelInterval
            initialTimeFactor = timeFactor
        }

        sound.timeAccel.cloneNode().play()
    
        // Map accelInterval linearly to timeFactor
        let t = (accelInterval - 500) / (initialAccelInterval - 500)
        t = Math.max(0, Math.min(1, t)) // Clamp between 0 and 1
        timeFactor = 1 + (initialTimeFactor - 1) * t
    
        if (accelInterval >= 500) { // slightly above 1 to allow rounding errors
            timeAccelState = 0
            timeFactor = 1
            return
        }
    
        accelInterval += 15
        accelTimeout = setTimeout(() => {
            decelerate(accelInterval)
        }, accelInterval)
    }

    accelerate()
}

// Function: Time Freeze - Determine whether targeting an entity or the world
function timeFreeze(target) {
    getParentEntity(target) ? timeFreezeEntity(target) : timeFreezeWorld()
}

// Function: Freeze a specific entity in time
function timeFreezeEntity(target) {  
    let targetEntity = getParentEntity(target)
    if (targetEntity.frozen) {
        targetEntity.unfreeze()

        cursor.changeAnim('unfreeze')
        cursor.changeFrameRate(8)

        // Change animation back to idle after 500ms
        setTimeout(() => {
            cursor.changeAnim('idle')
            cursor.changeFrameRate(2)
        }, 500)
    
        sound.timeUnfreeze.play()
    } else if (targetEntity) {  // Can add any conditions for Entities being freezable or not here
        targetEntity.freeze()

        cursor.changeAnim('freeze')
        cursor.changeFrameRate(8)

        // Change animation back to idle after 500ms
        setTimeout(() => {
            cursor.changeAnim('idle')
            cursor.changeFrameRate(2)
        }, 500)

        sound.timeFreeze.play()
    }
}

// Function: Freeze the whole world in time
function timeFreezeWorld() {  
    if (!worldFrozen) {
        worldFrozen = true
        worldFrozenImageNode.opacity(1)
        // Freeze all entities
        for (const entity of entitiesOnCanvas) {
            if (entity != null) entity.freeze()
        }        

        cursor.changeAnim('freezeWorld')
        cursor.changeFrameRate(8)

        // Change animation back to idle after 500ms
        setTimeout(() => {
            cursor.changeAnim('idle')
            cursor.changeFrameRate(2)
        }, 500)

        sound.timeFreeze.play() // Play sound
    } else {
        worldFrozen = false
        worldFrozenImageNode.opacity(0)
        // Unfreeze all entities
        for (const entity of entitiesOnCanvas) {
            if (entity != null) entity.unfreeze()
        }        

        cursor.changeAnim('unfreezeWorld')
        cursor.changeFrameRate(8)

        // Change animation back to idle after 500ms
        setTimeout(() => {
            cursor.changeAnim('idle')
            cursor.changeFrameRate(2)
        }, 500)

        sound.timeUnfreeze.play()   // Play sound
    }
}