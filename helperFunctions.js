function moveKonvaSprite(sprite, speed, endX, endY, onComplete) {
    let moveAnim;

    // Create animation logic in a function to allow re-creation
    function startMovement() {
        moveAnim = new Konva.Animation(function(frame) {
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

    // Stop movement on drag
    function handleDragMove() {
        if (moveAnim) moveAnim.stop();
    }

    // Resume movement after drag ends
    function handleDragEnd() {
        if (moveAnim) moveAnim.stop(); // Stop old one just in case
        startMovement(); // Recreate and start fresh animation
    }

    // Attach event listeners only once
    sprite.on('dragmove.move', handleDragMove);
    sprite.on('dragend.move', handleDragEnd);

    // Optional: Cleanup function to remove these specific event listeners
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