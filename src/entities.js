console.log('entities.js loaded');

// Library for our Entities

// Array containing all Entities
let entitiesOnCanvas = [];

// Entity - For both Beings and Inanimate Entities
class Entity {
    constructor(spawnX, spawnY) {
        this.sprite = new Konva.Sprite({
            x: spawnX,
            y: spawnY,
            width: 16,
            height: 16,
            frameRate: 2, // Default frame rate
            frameIndex: 0,
            draggable: true,
        });

        entitiesGroup.add(this.sprite);
        this.sprite.start();

        // Add object to the entitiesOnCanvas array, and remember unique entityIndex
        entitiesOnCanvas.push(this);
        this.entityIndex = entitiesOnCanvas.length - 1;
        this.sprite.id(this.entityIndex.toString());  // Use the sprite's ID to remember its parent's Index

        this.variant = 0;
        
        this.mappedTool = null; // Mapped Tool: Default = null; Set for each subclass

        this.frozen = false; // Frozen in time if true
        this.destroyed = false; // Destroyed if true

        this.grabbable = true; // Can be dragged if true

        // Only allow dragging if Grab Tool is active
        this.sprite.on('pointerover', (e) => {
            if ((activeTool === grabTool) && (this.grabbable)) {
                e.target.draggable(true);
            } else {
                e.target.draggable(false);
            }
        });
    }

    // Functions that can be used by all Entities
    // Freeze in time
    freeze() {
        this.frozen = true;
        this.sprite.stop();
    }

    // Unfreeze
    unfreeze() {
        this.frozen = false;
        this.sprite.start();
    }

    // Destroy / remove the Entity
    destroy() {
        this.sprite.remove();
        entitiesOnCanvas[this.entityIndex] = null; // Replace its spot in the array with null
        this.destroyed = true; // Set destroyed flag

        // If this is a Being, decrement the activeBeings count
        if (this.love) {
            activeBeings--;
        }
    }

    // Set the color of the entity
    setColor({r, g, b}) {
        // Set the image to the painted version, using our paintedImages lookup table
        if (paintedImages.has(this.sprite.image())) {
            this.sprite.image(paintedImages.get(this.sprite.image()));
        }

        // Set the new color for the entity
        this.sprite.red(r);
        this.sprite.green(g);
        this.sprite.blue(b);

        // Cache the sprite with the new color
        this.sprite.cache({ imageSmoothingEnabled: false });
        this.sprite.filters([Konva.Filters.RGB]);

        // Work-around to keep the animation going
        // Get rid of any existing interval to avoid multiple intervals running at once
        if (this.paintedAnimInterval) {
            clearInterval(this.paintedAnimInterval);  // Clear any existing interval
            this.paintedAnimInterval = null;  // Reset the interval variable
        }
        // Set a new interval to keep the sprite caching
        this.paintedAnimInterval = setInterval(() => {
            this.sprite.cache({ imageSmoothingEnabled: false });
        }, 1000 / this.sprite.frameRate());
    }

    // Clear the color of the entity
    clearColor() {
        if (![...paintedImages.values()].includes(this.sprite.image())) {
            return;  // If the entity is not painted, do nothing
        }

        const paintedImage = this.sprite.image();
        let unpaintedImage = null;

        // Find the key (unpainted image) for the given value (painted image)
        for (const [key, value] of paintedImages.entries()) {
            if (value === paintedImage) {
                unpaintedImage = key;
                break;
            }
        }

        // If an unpainted version is found, update the entity's sprite
        if (unpaintedImage) {
            this.sprite.image(unpaintedImage);
        }

        this.sprite.clearCache();  // Clear the cache to restore normal rendering
        this.sprite.filters([]);  // Remove the RGB filter
        clearInterval(this.paintedAnimInterval);  // Stop the painted animation interval
        this.paintedAnimInterval = null;  // Reset the interval variable
    }
}


// Being
class Being extends Entity {
    constructor(spawnX, spawnY) {

        super(spawnX, spawnY);

        // Properties applying to all Beings
        this.speed = 0.2;   // Base movement speed
        this.age = 0;       // Age: Internal age. Old from 80, dead at 100. Animals should age faster than people.
        this.love = 0;      // Love should influence whether beings will gravitate towards others of the same type. Should be between -1 and 1. 0 = neutral.

        // Begin behaviour cycle
        this.assess();
    }

    // Functions that can be used by all Beings

    roam() {
        let destinationX = Math.random() * worldLayer.width() / scaleFactor;
        let destinationY = Math.random() * worldLayer.height() / scaleFactor;

        this.turnToFace(destinationX);

        //let agedSpeed = this.speed - (this.age / 6);    // Slow down based on age
        moveKonvaSprite(this.sprite, this.speed, destinationX, destinationY, () => {
            setTimeout(() => this.assess(), (3000 / timeFactor));
        });
    }

    turnToFace(targetX) {
        if (targetX < this.sprite.x()) {
            this.sprite.scaleX(-1);
        }
        else {
            this.sprite.scaleX(1);
        }
    }
}


class Inanimate extends Entity {
    constructor(spawnX, spawnY) {
        super(spawnX, spawnY);
    }
}


// Dog
class Dog extends Being {
    constructor(spawnX, spawnY) {

        super(spawnX, spawnY);

        // Set Dog image and animations
        this.sprite.image(chooseVariant(dogImages));
        this.sprite.animations(dogAnims);
        this.sprite.animation('idle');
        this.sprite.offsetX(8);
        this.sprite.offsetY(16);

        // Set Mapped Tool
        this.mappedTool = dogTool;

        // Event reactions
        this.sprite.on('dragstart', (e) => {
            if (this.frozen) {
                return;
            }
            sound.dogShock.cloneNode().play(); // Play a sound
        });

        // Any dog-specific properties
        this.excitement = 0; // Excitement makes the doggo very fast. Default = 0, Max = 1
        this.tasty = dogTasty; // This array lives in tools.js for now.
    }

    // Dog-specific functions

    // Assess the environment and decide what to do
    assess() {
        // If destroyed, never do anything ever again
        if (this.destroyed) {
            return;
        }

        // Check for tasty things in the entity array
        for (let i = 0; i < entitiesOnCanvas.length; i++) {
            if (entitiesOnCanvas[i] && dogTasty.includes(entitiesOnCanvas[i].sprite.image())) {
                // If we find a tasty thing, go to it
                this.goToAndEat(entitiesOnCanvas[i]);
                return;
            }
        }
        // Otherwise, bark/poop with a random chance
        if (Math.random() < 0.05) {
            this.poop();
            return;
        }
        if (Math.random() < 0.2) {
            this.bark();
            return;
        }
        // Otherwise, just roam
        this.roam();
    }

    // Bark
    bark() {
        sound.dogBark.cloneNode().play(); // Play a sound
        setTimeout(() => this.assess(), (3000 / timeFactor));  // Assess again
    }

    // Poop
    poop() {
        sound.dogPoop.cloneNode().play(); // Play a sound
        let spawnX = this.sprite.x();
        let spawnY = this.sprite.y();
        // Offset the spawn point a bit from this.sprite
        if (this.sprite.scaleX() < 0) {
            spawnX += 8;
        } else {
            spawnX -= 8;
        }
        let newPoo = new Poo(spawnX, spawnY); // Create a new Poo entity
        // If the dog is painted, paint the Poo the same color
        if ([...paintedImages.values()].includes(this.sprite.image())) {
            newPoo.setColor({r: this.sprite.red(), g: this.sprite.green(), b: this.sprite.blue()});
        }
        setTimeout(() => this.assess(), (3000 / timeFactor));  // Assess again
    }

    // Go to a tasty thing and eat it
    goToAndEat(food) {
        this.turnToFace(food.sprite.x()); // Turn to face the food

        const expectedX = food.sprite.x();
        const expectedY = food.sprite.y();

        moveKonvaSprite(this.sprite, this.speed*3, expectedX, expectedY, () => {
            // If the food is still there when we get there, eat it
            if ((entitiesOnCanvas[food.entityIndex] != null) && (food.sprite.x() === expectedX) && (food.sprite.y() === expectedY)) {
                this.eat(food);
            }
            setTimeout(() => this.assess(), (3000 / timeFactor));  // Assess again
        });
    }

    // Eat an entity, destroying it
    eat(food) {
        sound.dogEat.cloneNode().play();
        food.destroy(); // Remove the target entity
    }
}

// Person
class Person extends Being {
    constructor(spawnX, spawnY) {
        super(spawnX, spawnY);

        // Set Person image and animations
        this.sprite.width(16);
        this.sprite.height(32);
        this.sprite.image(chooseVariant(personImages));
        this.sprite.animations(personAnims);
        this.sprite.animation('idle');
        this.sprite.offsetX(8);
        this.sprite.offsetY(32);

        // Set Mapped Tool
        this.mappedTool = personTool;

        // Event reactions
        this.sprite.on('dragstart', (e) => {
            if (this.frozen) {
                return;
            }
            sound.personShock.cloneNode().play(); // Play a sound
        });

        // Any person-specific properties

    }

    // Person-specific functions

    // Assess the environment and decide what to do
    assess() {
        // If destroyed, never do anything ever again
        if (this.destroyed) {
            return;
        }

        this.roam();
    }

    // Create the thought bubble that gives the Time tool
    thinkAboutTime() {
        let newThoughtBubble = new ThoughtBubble(this.sprite.x(), this.sprite.y());
        newThoughtBubble.trackPerson(this);

        return newThoughtBubble;
    }
}


// Bird
class Bird extends Being {

}


// Brush - Paintbrush that falls down near the beginning
class Brush extends Inanimate {
    constructor(spawnX, spawnY) {
        super(spawnX, spawnY);

        // Set Brush image and animations
        this.sprite.image(brushImage);
        this.sprite.animations(brushAnims);
        this.sprite.animation('landed');
        this.sprite.frameRate(2);
        this.sprite.offsetX(8);
        this.sprite.offsetY(16);

        // Set Mapped Tool
        this.mappedTool = brushTool;
    }

    // Fall from the top of screen & animate
    fallFromTop() {
        this.sprite.animation('idle');
        moveKonvaSprite(newBrush.sprite, 1, (baseWidth / 2), (baseHeight / 2), () => this.splatOnGround());
    }

    splatOnGround() {
        this.sprite.animation('landed');
        sound.brushSplat.play(); // Play a sound
    }
}


// Poo
class Poo extends Inanimate {
    constructor(spawnX, spawnY) {
        super(spawnX, spawnY);

        // Set Brush image and animations
        this.sprite.image(pooImage);
        this.sprite.animations(pooAnims);
        this.sprite.animation('idle');
        this.sprite.frameRate(2);
        this.sprite.offsetX(8);
        this.sprite.offsetY(16);

        // Set Mapped Tool
        this.mappedTool = dogTool;

        // Event reactions
        this.sprite.on('dragend', (e) => {
            this.fertilize();
        });
    }

    // Poo-specific functions

    // Fertilize
    fertilize() {
        // Use the entitiesOnCanvas array as is, to avoid the possibility of an endless loop
        const entitiesSnapshot = [...entitiesOnCanvas];

        // Loop through all entities
        for (let i = 0; i < entitiesSnapshot.length; i++) {
            if (entitiesSnapshot[i] != null) {
                // Check if the entity is a Foliage
                if (entitiesSnapshot[i].growthStage != null) {
                    // Store the Foliage's position
                    let foliageX = entitiesSnapshot[i].sprite.x();
                    let foliageY = entitiesSnapshot[i].sprite.y();
                    // Compare the Foliage's position to the Poo's position
                    if ((foliageX >= this.sprite.x() - 8 && foliageX <= this.sprite.x() + 8) && (foliageY >= this.sprite.y() - 8 && foliageY <= this.sprite.y() + 8)) {
                        entitiesSnapshot[i].grow();  // Grow the Foliage
                        setTimeout(() => this.destroy(), 100);  // Wait a moment before destroying - things break if something is destroyed while it's still being grabbed
                    }
                }
            }
        }
    }
}


// Foliage
class Foliage extends Inanimate {
    constructor(spawnX, spawnY) {
        super(spawnX, spawnY);

        // Set Foliage image and animations
        this.sprite.image(currentClimate.foliageImage);
        this.sprite.animations(foliageAnims);
        this.sprite.animation('idle');
        this.sprite.frameRate(2);
        this.sprite.offsetX(8);
        this.sprite.offsetY(16);

        // Not grabbable
        this.grabbable = false;

        // Set Mapped Tool
        this.mappedTool = foliageTool;

        // Any Foliage-specific properties
        this.growthStage = 0;  // Growth stage
        this.climateType = currentClimate;  // Climate type
    }

    grow() {
        if (this.growthStage >= 2) {
            return;
        }
        worldFlags.foliageFertilized = true;  // Update World Flags
        sound.foliageGrow.cloneNode().play();
        this.growthStage++;
        if (this.growthStage == 1) {
            this.sprite.animation('stage1');

        } else if (this.growthStage == 2) {
            this.sprite.animation('stage2');
            this.sprite.offsetY(32);
            this.sprite.height(32);
        }
        // If the Foliage is painted, cache it right away to avoid issues with animations
        if (this.paintedAnimInterval) {
            this.sprite.cache({ imageSmoothingEnabled: false });
        }
    }

    prune() {
        if (this.growthStage <= 0) {
            return;
        }
        this.growthStage--;
        if (this.growthStage == 1) {
            this.sprite.animation('stage1');
            this.sprite.offsetX(8);
            this.sprite.offsetY(16);
        } else if (this.growthStage == 0) {
            this.sprite.animation('idle');
        }
    }

    changeClimateType(input) {
        const newClimateType = parseClimate(input, this.climateType);

        if (newClimateType === this.climateType) {
            return;
        }

        this.climateType = newClimateType;

        if ([...paintedImages.values()].includes(this.sprite.image())) {
            this.sprite.image(paintedImages.get(this.climateType.foliageImage));
        } else {
            this.sprite.image(this.climateType.foliageImage);
        }

        // If the Foliage is painted, cache it right away to avoid issues with animations
        if (this.paintedAnimInterval) {
            this.sprite.cache({ imageSmoothingEnabled: false });
        }
    }
}


// Thought Bubble
class ThoughtBubble extends Inanimate {
    constructor(spawnX, spawnY) {
        super(spawnX, spawnY);

        // Set Foliage image and animations
        this.sprite.width(32);
        this.sprite.height(24);
        this.sprite.image(thoughtBubbleImage);
        this.sprite.animations(thoughtBubbleAnims);
        this.sprite.animation('idle');
        this.sprite.frameRate(2);
        this.sprite.offsetX(16);
        this.sprite.offsetY(16);

        // Not grabbable
        this.grabbable = false;

        // Set Mapped Tool
        this.mappedTool = timeTool;

        // Any Thought Bubble-specific properties

    }

    trackPerson(person) {
        let trackInterval = setInterval(() => {
            this.sprite.x(person.sprite.x() - 4);
            this.sprite.y(person.sprite.y() - 32);
        }, 10);
    }
}


let validRandomEntities = [ Dog, Person, Brush, Poo, Foliage ]; // List of valid entities to randomize to with the Person Tool