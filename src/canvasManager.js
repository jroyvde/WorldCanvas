console.log('canvasManager.js loaded')

// Identify context (browser or desktop)
let desktopMode = false
if (typeof process !== 'undefined' && process.versions && Boolean(process.versions.nw)) {
    desktopMode = true
}

// Use only right mouse button for dragging.
Konva.dragButtons = [2]

// Base width and height for our Stage (static)
const baseWidth = 240
const baseHeight = 180

// Calculate and set the initial factor for scaling up our small, pixelly Stage
let maxScale = null // Set to an integer to cap the maximum scale factor
let scaleFactor = Math.min(Math.floor(parseInt(window.innerHeight) / baseHeight), maxScale)

// Get the stage-container element's style so we can keep an eye on it and update things accordingly
const containerElement = document.getElementById('stage-container')
const containerElemStyle = getComputedStyle(containerElement)

// Set initial container element dimensions
containerElement.style.width = `${baseWidth * scaleFactor}px`
containerElement.style.height = `${baseHeight * scaleFactor}px`

// Set initial background image scaling (Currently not used)
document.getElementById('content').style.backgroundSize = `${144 * scaleFactor}px ${128 * scaleFactor}px`

// Establish our main Stage
const mainStage = new Konva.Stage({
    container: containerElement,
    width: baseWidth * scaleFactor,
    height: baseHeight * scaleFactor,
    imageSmoothingEnabled: false,
})

// Listen for pointerup events on the window and fire them on the mainStage
window.addEventListener('pointerup', (e) => {
    mainStage.fire('pointerup')
})

// Function to update the scaleFactor, stage dimensions, and layer scaling
const updateScaleFactor = () => {
    // Decide whether to round the corners with our mask or not
    if (parseInt(window.innerHeight) % baseHeight) {
        containerElement.style.maskImage = 'url("./cornerMask.svg")'
    } else {
        containerElement.style.maskImage = ''
    }

    // Calculate the new scaleFactor
    let targetFactor = Math.max(1, Math.floor(parseInt(window.innerHeight) / baseHeight))

    // Decrease the new scaleFactor until it fits within the current window size
    while (baseWidth * targetFactor > window.innerWidth && targetFactor > 1) {
        targetFactor--
    }

    // Return if the new scaleFactor would be the same as the current one
    if (targetFactor === scaleFactor) return

    // Cap the scaleFactor to maxScale to prevent runaway performance issues
    if (typeof maxScale === 'number' && targetFactor > maxScale) targetFactor = maxScale

    // Otherwise, set scaleFactor to the new value
    scaleFactor = targetFactor

    // Update the container element
    containerElement.style.width = `${baseWidth * scaleFactor}px`
    containerElement.style.height = `${baseHeight * scaleFactor}px`

    // Update background image scaling
    document.getElementById('content').style.backgroundSize = `${144 * scaleFactor}px ${128 * scaleFactor}px`

    // Then update the main Stage
    mainStage.width(baseWidth * scaleFactor)
    mainStage.height(baseHeight * scaleFactor)

    // Then iterate through layers and update their scales
    mainStage.getLayers().forEach((layer) => {
        layer.scale({
            x: scaleFactor,
            y: scaleFactor
        })
    })
}

updateScaleFactor() // Run once to set everything right

// Listen for window resize events and run the updateScaleFactor function
window.addEventListener('resize', updateScaleFactor)

// Function for creating a layer, ensuring proper scaling, and adding to mainStage
const makeScaledLayer = (scaleSetting) => {
    const newLayer = new Konva.Layer()
    newLayer.scale({ x: scaleFactor, y: scaleFactor })
    newLayer.imageSmoothingEnabled(false)
    mainStage.add(newLayer)
    return newLayer
}

const layer = makeScaledLayer() // Create the (currently sole) layer

// Create all the Groups we need
const backgroundGroup = new Konva.Group()
const paintGroup = new Konva.Group()
const entitiesGroup = new Konva.Group()
const castGroup = new Konva.Group()
const bubbleGroup = new Konva.Group()
const modalGroup = new Konva.Group()
const modalBtnGroup = new Konva.Group()
const winCtrlGroup = new Konva.Group()
const cursorGroup = new Konva.Group()
// Then add them to the layer in the order we want them to display (bottom to top)
layer.add(backgroundGroup, paintGroup, entitiesGroup, castGroup, bubbleGroup, modalGroup, modalBtnGroup, winCtrlGroup, cursorGroup)

// Create and add background image
const backgroundImageNode = new Konva.Image({
    image: backgroundImage,
})
backgroundGroup.add(backgroundImageNode)

// Create and add night cast image
const nightCastImageNode = new Konva.Image({
    image: nightCastImage,
    opacity: 0,
    listening: false,  // Don't want to interact with the night cast image
})
castGroup.add(nightCastImageNode)

// Create and add time freeze indicator
const worldFrozenImageNode = new Konva.Image({
    x: 4,
    y: 4,
    image: worldFrozenImage,
    opacity: 0,
    listening: false,  // Don't want to interact with the time freeze image
})
bubbleGroup.add(worldFrozenImageNode)

// Create and add fullscreen button
const fullscreenButtonSprite = new Konva.Sprite({
    x: desktopMode ? 204 : 220,
    y: 4,
    image: cornerButtonsImage,
    animations: cornerButtonsAnims,
    animation: 'fullscreenIdle',
    framerate: '2',
})
winCtrlGroup.add(fullscreenButtonSprite)

// Add fullscreen button event handling
fullscreenButtonSprite.on('click', (e) => {
    if (e.evt.button !== 0) return  // Do nothing unless it's a left click
    
    if (document.fullscreenElement === null) {
        sound.fullscreen.cloneNode().play()
        document.body.requestFullscreen()
    } else {
        sound.fullscreen.cloneNode().play()
        document.exitFullscreen()
    }
})

fullscreenButtonSprite.on('mouseover', () => {
    fullscreenButtonSprite.animation('fullscreenHover')
})

fullscreenButtonSprite.on('mouseout', () => {
    fullscreenButtonSprite.animation('fullscreenIdle')
})

// Create and add exit button
const exitButtonSprite = new Konva.Sprite({
    x: 220,
    y: 4,
    image: cornerButtonsImage,
    animations: cornerButtonsAnims,
    animation: 'exitIdle',
    framerate: '2',
})
if (desktopMode) winCtrlGroup.add(exitButtonSprite) // Only add to group if running in deskop mode

// Add exit button event handling
exitButtonSprite.on('click', (e) => {
    if (!desktopMode || e.evt.button !== 0) return  // Do nothing unless it's a left click, and in desktop mode

    sound.exit.cloneNode().play()
    setTimeout(() => { nw.Window.get().close(true) }, 500)
})

exitButtonSprite.on('mouseover', () => {
    exitButtonSprite.animation('exitHover')
})

exitButtonSprite.on('mouseout', () => {
    exitButtonSprite.animation('exitIdle')
})

// Create and add introductory modal
const modalImageNode = new Konva.Image({
    x: 0,
    y: 0,
    image: modalImage,
})
modalGroup.add(modalImageNode)

// Create and add modal button
const modalButtonSprite = new Konva.Sprite({
    x: 104,
    y: 112,
    image: modalButtonImage,
    animations: modalButtonAnims,
    animation: 'idle',
    framerate: 2,
})
modalBtnGroup.add(modalButtonSprite)

// Add modal button event handling
modalButtonSprite.on('click', () => {
    // Hide the modal and button
    modalImageNode.opacity(0)
    modalImageNode.listening(false)
    modalButtonSprite.opacity(0)
    modalButtonSprite.listening(false)
})

modalButtonSprite.on('mouseover', () => {
    modalButtonSprite.animation('hover')
})

modalButtonSprite.on('mouseout', () => {
    modalButtonSprite.animation('idle')
})

// Add cursor and begin pointer tracking
cursorGroup.add(cursor.sprite)
cursor.trackMouse(mainStage)

// Do not open browser context menu on right click
mainStage.on('contextmenu', (e) => {
    e.evt.preventDefault()
})

// Handle click events
mainStage.on('pointerdown', (e) => {
    if ((e.target.image() != bubbleImage) && (e.target.image() != cornerButtonsImage)) {  // Make sure we're not clicking on a Tool Bubble, or the corner buttons
        if (e.evt.button === 2) {  // Right click
            if (activeTool.rightClickAction) {  // Make sure the active tool has a rightClickAction before trying to execute it
                activeTool.rightClickAction(e.target)
            }
        }
        else {  // Left click
            if (activeTool.leftClickAction) {  // Make sure the active tool has a leftClickAction before trying to execute it
                activeTool.leftClickAction(e.target)
            }
        }
    }
})

// Function to re-order shapes based on Y position
const updateZIndices = () => {
  const shapes = entitiesGroup.getChildren()                    // Get an array of shapes in the entities Group
  const sorted = shapes.slice().sort((a, b) => a.y() - b.y())   // Sort shapes by their y position
  sorted.forEach(shape => {                                     // Reorder them by moving each to top in sorted order
    shape.moveToTop()
  })
}

let zOrderUpdateTimer

// Function to initiate Z-sorting interval
const scheduleZIndexUpdate = () => {
  clearInterval(zOrderUpdateTimer)
  zOrderUpdateTimer = setInterval(() => {
    updateZIndices()
  }, 200)
}
scheduleZIndexUpdate()  // Run right away

// Painting
const paintCanvas = document.createElement('canvas')
paintCanvas.width = baseWidth
paintCanvas.height = baseHeight

const paintImage = new Konva.Image({
    image: paintCanvas,
    width: baseWidth,
    height: baseHeight,
})
paintGroup.add(paintImage)

const paintContext = paintCanvas.getContext('2d')
paintContext.strokeStyle = '#9614cc'
paintContext.lineJoin = 'round'
paintContext.lineWidth = 3

// Function to play the Clear animation (used by the Person Tool)
const playClearAnim = (x, y) => {
    // Create a circle in the center with radius 0
    const circle = new Konva.Circle({
        x: x,
        y: y,
        radius: 0,
        fill: 'white',
        listening: false,
    })

    // Add circle to the Cast Group
    castGroup.add(circle)

    // Animate the circle to enlarge and disappear
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
            })
        }
    })
}