// Find out what a Sprite's parent Entity is
function getParentEntity(sprite) {
    entityIndex = parseInt(sprite.id());
    return entitiesOnCanvas[entityIndex];
}

// Choose a variant image for a new entity  
function chooseVariant(images) {
    let variant = Math.floor(Math.random() * images.length);
    return images[variant];
    // Remember variant spawned so we can prefer variants that haven't been used

}

// Move a Konva sprite from one point to another
function moveKonvaSprite(sprite, speed, endX, endY, onComplete) {
    let paused = false;
    let savedSpeed = null;

    let moveAnim;

    // Create animation logic in a function to allow re-creation
    function startMovement() {
        moveAnim = new Konva.Animation(function(frame) {

            // Respond to freezing and un-freezing of parent Entities
            if (getParentEntity(sprite)) {  // Check if the sprite actually belongs to an Entity
                if (getParentEntity(sprite).frozen && !paused) {  // Check if the parent Entity has been frozen
                    paused = true;
                    savedSpeed = speed;
                    speed = 0;
                } else if (!getParentEntity(sprite).frozen && paused) {
                    paused = false;
                    speed = savedSpeed;
                    handleDragEnd();
                }
            }

            let dx = endX - sprite.x();
            let dy = endY - sprite.y();
            let distance = Math.sqrt(dx * dx + dy * dy);
            let moveStep = speed * timeFactor;

            if (distance > moveStep) {
                sprite.x(sprite.x() + (dx / distance) * moveStep);
                sprite.y(sprite.y() + (dy / distance) * moveStep);
            } else {
                sprite.x(endX);
                sprite.y(endY);
                moveAnim.stop();
                cleanup(); // Remove event listeners
                if (typeof onComplete === "function") {
                    onComplete();
                }
            }
        }, mainLayer);

        moveAnim.start();
    }

    // Start the initial movement
    startMovement();

    // Listen for drag events, and run relevant functions
    sprite.on('dragmove.move', handleDragMove);
    sprite.on('dragend.move', handleDragEnd);

    // Stop movement on drag
    function handleDragMove() {
        if (moveAnim) moveAnim.stop();
    }

    // Resume movement after drag ends
    function handleDragEnd() {
        if (moveAnim) moveAnim.stop(); // Stop old one just in case
        startMovement(); // Recreate and start fresh animation
    }

    // Cleanup function to remove these specific event listeners
    function cleanup() {
        sprite.off('dragmove.move');
        sprite.off('dragend.move');
    }
}

// Choose a random spawn point for Beings, just outside the canvas
function chooseSpawnPoint() {
    const edge = Math.floor(Math.random() * 4); // 0 = top, 1 = right, 2 = bottom, 3 = left
    let x, y;
  
    switch (edge) {
      case 0: // Top
        x = Math.random() * baseWidth;
        y = -20;
        break;
      case 1: // Right
        x = baseWidth + 20;
        y = Math.random() * baseHeight;
        break;
      case 2: // Bottom
        x = Math.random() * baseWidth;
        y = baseHeight + 20;
        break;
      case 3: // Left
        x = -20;
        y = Math.random() * baseHeight;
        break;
    }
  
    return [x, y];
}

function hexColorToRGB(hex) {
    // Remove the '#' character if present
    hex = hex.replace('#', '');

    // Parse the hex color string into RGB components
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}

function parseClimate(input, referenceClimate) {
    // If no reference climate is provided, assume it should be the world's current climate
    if (!referenceClimate) {
        referenceClimate = currentClimate;
    }

    let parsedClimate;

    // 1. If the input is a direct object reference, simply use that
    if (climates.includes(input)) {
        parsedClimate = input;
    }
    // 2. If input is a number, use the climate at that index
    else if (typeof input === 'number' && input >= 0 && input < climates.length) {
        parsedClimate = climates[input];
    }
    // 3. Otherwise, if the input is a string...
    else if (typeof input === 'string') {  
        // Check if the string reads 'Random', and choose a random climate if so
        if (input == 'Random') {
            parsedClimate = climates[Math.floor(Math.random() * climates.length)];
            //if (parsedClimate === referenceClimate) { return parseClimate('Random') }
        }
        // Otherwise, find the climate with the name matching the string
        else {
            parsedClimate = climates.find(climate => climate.name === input);
            if (!parsedClimate) {
                console.warn(`No climate found with name "${input}"`);
                return;
            }
        }
    }
    // 4. If the input is blank, simply use the climate with the index after the current one
    else {  
        const currentIndex = climates.indexOf(referenceClimate);
        const nextIndex = (currentIndex + 1) % climates.length;
        parsedClimate = climates[nextIndex];
    }

    return parsedClimate;
}