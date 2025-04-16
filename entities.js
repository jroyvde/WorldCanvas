// Library for our Entities

// Being
class Being {
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
        
        this.mappedTool = null; // Mapped Tool: Default = null; Set for each subclass

        // Properties applying to all Beings
        this.speed = 0.2;   // Base movement speed
        this.age = 0.5;     // Age: Internal age. Baby -> Adult -> Old
        this.love = 0;      // Love should influence whether beings will gravitate towards others of the same type.

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

        moveKonvaSprite(this.sprite, this.speed, destinationX, destinationY, () => {
            setTimeout(() => this.startRoaming(), (3000 / timeFactor));
        });
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
        // this.mappedTool = personTool;

        // Any person-specific properties

    }

    // Person-specific functions
    
}

// Bird
class Bird extends Being {

}