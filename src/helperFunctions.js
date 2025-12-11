console.log('helperFunctions.js loaded')

// Find out what a Sprite's parent Entity is
const getParentEntity = (sprite) => {
    entityIndex = parseInt(sprite.id())
    return entitiesOnCanvas[entityIndex]
}

// Choose a variant image for a new entity  
const chooseVariant = (images) => {
    let variant = Math.floor(Math.random() * images.length)
    return images[variant]
}

// Move a Konva sprite from one point to another
const moveKonvaSprite = (sprite, speed, endX, endY, onComplete) => {
    // Declare the variables locally
    let moveTween = null
    let stoppedBecauseFrozen = false

    // Function: Create a new Tween and play it
    const startNewTween = () => {
        // Update start coordinates
        const startX = sprite.x()
        const startY = sprite.y()

        // Calclute the duration for the tween based on distance and speed
        const distance = (Math.abs(startX - endX) + Math.abs(startY - endY)) / 2
        const tweenDuration = (distance / (speed * 50)) / timeFactor

        // Declare the new Tween
        moveTween = new Konva.Tween({
            node: sprite,
            duration: tweenDuration,
            x: endX,
            y: endY,
            easing: Konva.Easings.Linear,
            onFinish: handleMoveEnd
        })

        // Play the new Tween
        moveTween.play()
    }

    startNewTween() // Start the initial Tween

    // Function: Runs on start of a drag
    const handleDragStart = () => {
        if (moveTween) moveTween.destroy(); moveTween = null
    }

    // Function: Runs at the end of a drag
    const handleDragEnd = () => {
        if (stoppedBecauseFrozen) return
        if (typeof getParentEntity(sprite).turnToFace === 'function') getParentEntity(sprite).turnToFace(endX)    // Re-calculate facing direction
        startNewTween()
    }

    // Listen for drag events, and run relevant functions
    sprite.on('dragstart.move', handleDragStart)
    sprite.on('dragend.move', handleDragEnd)

    // Interval to run periodically while the movement is active
    let moveInterval = setInterval(() => {
        // Check if an Entity has been frozen or unfrozen and respond accordingly
        if (getParentEntity(sprite)) {  // Check if the sprite actually belongs to an Entity
            if (getParentEntity(sprite).frozen && !stoppedBecauseFrozen) {  // Check if the parent Entity has been frozen
                stoppedBecauseFrozen = true
                handleDragStart()
            } else if (!getParentEntity(sprite).frozen && stoppedBecauseFrozen) {   // Check if the parent Entity has been un-frozen
                stoppedBecauseFrozen = false
                handleDragEnd()
            }
        }
        // If the timeFactor is being altered, continously re-start the Tween to keep its speed in sync
        if (timeFactor != 1 && !stoppedBecauseFrozen && !sprite.isDragging()) {
            if (moveTween) moveTween.destroy(); moveTween = null
            startNewTween()
        }
    }, 100)

    // Function: To run once the movement completes
    function handleMoveEnd() {
        // Destoy the running Tween
        if (moveTween) moveTween.destroy(); moveTween = null
        // Clean-up
        clearInterval(moveInterval)
        sprite.off('dragstart.move')
        sprite.off('dragend.move')
        // Run onComplete function if it exists
        if (typeof onComplete === 'function') onComplete()
    }
}

// Choose a random spawn point for Beings, just outside the canvas
const chooseSpawnPoint = () => {
    const edge = Math.floor(Math.random() * 4)  // 0 = top, 1 = right, 2 = bottom, 3 = left
    let x, y
  
    switch (edge) {
      case 0: // Top
        x = Math.random() * baseWidth
        y = -20
        break
      case 1: // Right
        x = baseWidth + 20
        y = Math.random() * baseHeight
        break
      case 2: // Bottom
        x = Math.random() * baseWidth
        y = baseHeight + 20
        break
      case 3: // Left
        x = -20
        y = Math.random() * baseHeight
        break
    }
  
    return [x, y]
}

// Take a hex color as a string and return an RGB color object
const hexColorToRGB = (hex) => {
    // Remove the '#' character if present
    hex = hex.replace('#', '')
    // Parse the hex color string into RGB components
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    return { r, g, b }
}

// Function to allow referencing Climates in different formats
const parseClimate = (input, referenceClimate) => {
    // If no reference climate is provided, assume it should be the world's current climate
    if (!referenceClimate) referenceClimate = currentClimate

    let parsedClimate

    // 1. If the input is a direct object reference, simply use that
    if (climates.includes(input)) parsedClimate = input

    // 2. If input is a number, use the climate at that index
    else if (typeof input === 'number' && input >= 0 && input < climates.length) {
        parsedClimate = climates[input]
    }

    // 3. Otherwise, if the input is a string...
    else if (typeof input === 'string') {  
        // Check if the string reads 'Random', and choose a random climate if so
        if (input == 'Random') {
            parsedClimate = climates[Math.floor(Math.random() * climates.length)]
        }
        // Otherwise, find the climate with the name matching the string
        else {
            parsedClimate = climates.find(climate => climate.name === input)
            if (!parsedClimate) {
                console.warn(`No climate found with name "${input}"`)
                return
            }
        }
    }

    // 4. If the input is blank, simply use the climate with the index after the current one
    else {  
        const currentIndex = climates.indexOf(referenceClimate)
        const nextIndex = (currentIndex + 1) % climates.length
        parsedClimate = climates[nextIndex]
    }

    return parsedClimate
}