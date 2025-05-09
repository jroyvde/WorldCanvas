console.log('entities.js loaded');

// Library for our Entities

// Array containing all Entities
let entitiesOnCanvas = [  ];


// Entity - For both Beings and Inanimate Entities
class Entity {
    constructor(spawnX, spawnY) {
        this.sprite = new Konva.Sprite({
            x: spawnX,
            y: spawnY,
            frameRate: 2, // Default frame rate
            frameIndex: 0,
            draggable: true,
        });

        mainLayer.add(this.sprite);
        this.sprite.start();

        // Add object to the entitiesOnCanvas array, and remember unique entityIndex
        entitiesOnCanvas.push(this);
        this.entityIndex = entitiesOnCanvas.length - 1;
        this.sprite.id(this.entityIndex.toString());  // Use the sprite's ID to remember its parent's Index

        this.variant = 0;
        
        this.mappedTool = null; // Mapped Tool: Default = null; Set for each subclass

        this.frozen = false; // Frozen in time if true

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
        this.sprite.destroy();
        entitiesOnCanvas[this.entityIndex] = null; // Remove from the array
        this.sprite = null; // Remove reference to the sprite
        this.frozen = true; // Set frozen to true to prevent any further actions

        // If this is a Being, decrement the activeBeings count
        if (this.love) {
            activeBeings--;
        }
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
        let destinationX = Math.random() * mainLayer.width() / scaleFactor;
        let destinationY = Math.random() * mainLayer.height() / scaleFactor;

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
        this.sprite.image(dogImage);
        this.sprite.animations(dogAnims);
        this.sprite.animation('idle');
        this.sprite.offsetX(8);
        this.sprite.offsetY(16);

        // Set Mapped Tool
        this.mappedTool = dogTool;

        // Any dog-specific properties
        this.excitement = 0; // Excitement makes the doggo very fast. Default = 0, Max = 1
        this.tasty = dogTasty; // This array lives in tools.js for now.
    }

    // Dog-specific functions

    // Assess the environment and decide what to do
    assess() {
        // Check for tasty things in the entity array
        for (let i = 0; i < entitiesOnCanvas.length; i++) {
            if (entitiesOnCanvas[i] && dogTasty.includes(entitiesOnCanvas[i].sprite.image())) {
                // If we find a tasty thing, go to it
                this.goToAndEat(entitiesOnCanvas[i]);
                return;
            }
        }
        // If we don't find anything tasty, just roam
        this.roam();
    }

    // Bark
    bark() {
        // Play a sound - bork
    }

    // Go to a tasty thing and eat it
    goToAndEat(food) {
        this.turnToFace(food.sprite.x()); // Turn to face the food
        moveKonvaSprite(this.sprite, this.speed*3, food.sprite.x(), food.sprite.y(), () => {
            // If the food is still there when we get there, eat it
            if (entitiesOnCanvas[food.entityIndex] != null) {
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
        this.sprite.image(chooseVariant(personImages));
        this.sprite.animations(personAnims);
        this.sprite.animation('idle');
        this.sprite.offsetX(8);
        this.sprite.offsetY(32);

        // Set Mapped Tool
        this.mappedTool = personTool;

        // Any person-specific properties

    }

    // Person-specific functions

    // Assess the environment and decide what to do
    assess() {
        this.roam();
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
        this.sprite.animation('idle');
        this.sprite.frameRate(2);
        this.sprite.offsetX(8);
        this.sprite.offsetY(8);

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