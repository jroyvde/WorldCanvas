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
            frameRate: 2 * timeFactor, // Need to get the multiplication happening in realtime somehow
            frameIndex: 0,
            draggable: true,
        });
        mainLayer.add(this.sprite);
        this.sprite.start();

        // Add object to the entitiesOnCanvas array, and remember unique entityIndex
        entitiesOnCanvas.push(this);
        this.entityIndex = entitiesOnCanvas.length - 1;
        this.sprite.id(this.entityIndex.toString());  // Use the sprite's ID to remember its parent's Index
        
        this.mappedTool = null; // Mapped Tool: Default = null; Set for each subclass

        this.frozen = false; // Frozen in time if true
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
}

// Being
class Being extends Entity {
    constructor(spawnX, spawnY) {

        super(spawnX, spawnY);

        // Properties applying to all Beings
        this.speed = 0.2;   // Base movement speed
        this.age = 0;       // Age: Internal age. Old from 80, dead at 100. Animals should age faster than people.
        this.love = 0;      // Love should influence whether beings will gravitate towards others of the same type. Should be between -1 and 1. 0 = neutral.

        // Only allow dragging if Grab Tool is active
        this.sprite.on('pointerover', function (e) {
            if (activeTool === grabTool) {
              e.target.draggable(true);
            } else {
              e.target.draggable(false);
            }
        });

        // Set default Roaming state
        this.state = 'roaming';
        this.startRoaming();
    }

    // Functions that can be used by all Beings

    // Change active behaviour state
    changeState(newState) {
        this.state = newState;
    }

    startRoaming() {
        if (this.state !== "roaming") return; // Ensure we are in the correct state
        
        let destinationX = Math.random() * mainLayer.width() / scaleFactor;
        let destinationY = Math.random() * mainLayer.height() / scaleFactor;

        if (destinationX < this.sprite.x()) {
            this.sprite.scaleX(-1);
        }
        else {
            this.sprite.scaleX(1);
        }

        let agedSpeed = this.speed - (this.age / 6);    // Slow down based on age
        moveKonvaSprite(this.sprite, agedSpeed, destinationX, destinationY, () => {
            setTimeout(() => this.startRoaming(), (3000 / timeFactor));
        });
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
    }

    // Dog-specific functions

    // Bark
    bark() {
        // Play a sound - bork
    }
}

// Person
class Person extends Being {
    constructor(spawnX, spawnY) {
        super(spawnX, spawnY);

        // Set Person image and animations
        this.sprite.image(personImage);
        this.sprite.animations(personAnims);
        this.sprite.animation('idle');
        this.sprite.offsetX(8);
        this.sprite.offsetY(32);

        // Set Mapped Tool
        this.mappedTool = personTool;

        // Any person-specific properties

    }

    // Person-specific functions
    
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
        this.sprite.frameRate(8);
        this.sprite.offsetX(8);
        this.sprite.offsetY(8);

        // Set Mapped Tool
        this.mappedTool = brushTool;
    }

    // Fall from the top of screen & animate
    fallFromTop() {
        this.sprite.animation('idle');
        console.log('*slide whistle*'); // Play a sound
        moveKonvaSprite(newBrush.sprite, 1, (baseWidth / 2), (baseHeight / 2), () => this.splatOnGround());
    }

    splatOnGround() {
        this.sprite.animation('landed');
        console.log('*splat*'); // Play a sound
    }
}