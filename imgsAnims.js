// Library for Images and their associated Animations

// UI:

// Background
const backgroundImage = new Image();
backgroundImage.src = "./sprites/background.png"

const backgroundImageDesert = new Image();
backgroundImageDesert.src = "./sprites/background-desert.png"

const backgroundImageSnow = new Image();
backgroundImageSnow.src = "./sprites/background-snow.png"

// Night cast
const nightCastImage = new Image();
nightCastImage.src = "./sprites/nightCast.png"

// Bubble
const bubbleImage = new Image();
bubbleImage.src = "./sprites/bubble.png"

const bubbleAnims = {
  idle: [
    0, 0, 24, 24,   // frame 1
    24, 0, 24, 24,  // frame 2
    48, 0, 24, 24,  // frame 3
    72, 0, 24, 24,  // frame 4
  ],
};

// World freeze indicator
const worldFrozenImage = new Image();
worldFrozenImage.src = "./sprites/paused.png";

// ENTITIES:

// Dog
const dogImage = new Image();
dogImage.src = "./sprites/entities/dog.png";

const dogImagePainted = new Image();
dogImagePainted.src = "./sprites/entities/dog-painted.png";

const dogAnims = {
    idle: [
      0, 0, 16, 16,   // frame 1
      16, 0, 16, 16,  // frame 2
    ],
};

// Person
const personImage = new Image();  // Person 0 - Clyde
personImage.src = "./sprites/entities/person.png";

const personImagePainted = new Image();  // Person 0 - Clyde (painted)
personImagePainted.src = "./sprites/entities/person-painted.png";

const personImage1 = new Image(); // Person 1 - Manny
personImage1.src = "./sprites/entities/person-1.png";

const personImage1Painted = new Image();  // Person 1 - Manny (painted)
personImage1Painted.src = "./sprites/entities/person-1-painted.png";

const personImage2 = new Image(); // Person 2 - Suzanne
personImage2.src = "./sprites/entities/person-2.png";

const personImage2Painted = new Image();  // Person 2 - Suzanne (painted)
personImage2Painted.src = "./sprites/entities/person-2-painted.png";

const personImages = [personImage, personImage1, personImage2];

const personAnims = {
    idle: [
      0, 0, 16, 32,   // frame 1
      16, 0, 16, 32,  // frame 2
    ],
};

// Bird
const birdImage = new Image();
birdImage.src = "./sprites/entities/bird.png";

const birdAnims = {
    idle: [
      0, 0, 16, 16,   // frame 1
      16, 0, 16, 16,  // frame 2
    ],
};

// Brush
const brushImage = new Image();
brushImage.src = "./sprites/entities/brush.png";

const brushImagePainted = new Image();
brushImagePainted.src = "./sprites/entities/brush-painted.png";

const brushAnims = {
    idle: [
      0, 0, 16, 16,   // frame 1
    ],
    landing: [
      0, 16, 16, 16,   // frame 1
      16, 16, 16, 16,  // frame 2
      32, 16, 16, 16,  // frame 3
    ],
    landed: [
      0, 32, 16, 16,   // frame 1
    ],
};

// Poo
const pooImage = new Image();
pooImage.src = "./sprites/entities/poo.png";

const pooImagePainted = new Image();
pooImagePainted.src = "./sprites/entities/poo-painted.png";

const pooAnims = {
    idle: [
      0, 0, 16, 16,   // frame 1
    ],
};

// Foliage
const foliageImage = new Image();
foliageImage.src = "./sprites/entities/foliage.png";

const foliageImagePainted = new Image();
foliageImagePainted.src = "./sprites/entities/foliage-painted.png";

const foliageImageDesert = new Image();
foliageImageDesert.src = "./sprites/entities/foliage-desert.png";

const foliageImageDesertPainted = new Image();
foliageImageDesertPainted.src = "./sprites/entities/foliage-desert-painted.png";

const foliageImageSnow = new Image();
foliageImageSnow.src = "./sprites/entities/foliage-snow.png";

const foliageImageSnowPainted = new Image();
foliageImageSnowPainted.src = "./sprites/entities/foliage-snow-painted.png";

const foliageAnims = {
    idle: [
      0, 0, 16, 16,   // frame 1
      16, 0, 16, 16,  // frame 2
    ],
    stage1: [
      0, 16, 16, 16,   // frame 1
      16, 16, 16, 16,  // frame 2
    ],
    stage2: [
      0, 32, 16, 32,   // frame 1
      16, 32, 16, 32,  // frame 2
    ],
};

// Thought Bubble
const thoughtBubbleImage = new Image();
thoughtBubbleImage.src = "./sprites/entities/thoughtBubble.png"

const thoughtBubbleImagePainted = new Image();
thoughtBubbleImagePainted.src = "./sprites/entities/thoughtBubble-painted.png";

const thoughtBubbleAnims = {
    idle: [
      0, 0, 32, 24,   // frame 1
      32, 0, 32, 24,  // frame 2
    ],
};

// Map for painted equivalents of images
const paintedImages = new Map([
    [personImage, personImagePainted],
    [personImage1, personImage1Painted],
    [personImage2, personImage2Painted],
    [dogImage, dogImagePainted],
    [brushImage, brushImagePainted],
    [pooImage, pooImagePainted],
    [foliageImage, foliageImagePainted],
    [thoughtBubbleImage, thoughtBubbleImagePainted],
]);

// TOOLS:

// Default / placeholder tool art
const toolImage = new Image();
toolImage.src = "./sprites/tools/tool.png";

const toolAnims = {
  idle: [
    0, 0, 16, 16, // frame 1
  ],
}

// Grab tool
const grabToolImage = new Image();
grabToolImage.src = "./sprites/tools/grab.png";

const grabToolAnims = {
  idle: [
    0, 0, 16, 16,   // frame 1
  ],
  grabby: [
    0, 16, 16, 16,  // frame 1
    16, 16, 16, 16, // frame 2
  ],
  picking: [
    0, 32, 16, 16,  // frame 1
  ],
}

// Brush tool
const brushToolImage = new Image();
brushToolImage.src = "./sprites/tools/brush.png";

const brushToolAnims = {
  idle: [
    0, 0, 16, 16, // frame 1
  ],
  red: [
    0, 16, 16, 16, // frame 1
  ],
  orange: [
    0, 32, 16, 16, // frame 1
  ],
  yellow: [
    0, 48, 16, 16, // frame 1
  ],
  green: [
    0, 64, 16, 16, // frame 1
  ],
  blue: [
    0, 80, 16, 16, // frame 1
  ],
}

// Foliage tool
const foliageToolImage = new Image();
foliageToolImage.src = "./sprites/tools/foliage.png";

const foliageToolAnims = {
  idle: [
    0, 0, 16, 16, // frame 1
  ],
}

// Dog tool
const dogToolImage = new Image();
dogToolImage.src = "./sprites/tools/dog.png";

const dogToolAnims = {
  idle: [
    0, 0, 16, 16, // frame 1
  ],
}

// Person tool
const personToolImage = new Image();
personToolImage.src = "./sprites/tools/person.png";

const personToolAnims = {
  idle: [
    0, 0, 16, 16, // frame 1
  ],
}

// Save tool
const saveToolImage = new Image();
saveToolImage.src = "./sprites/tools/save.png";

const saveToolAnims = {
  idle: [
    0, 0, 16, 16, // frame 1
  ],
}

// Time tool
const timeToolImage = new Image();
timeToolImage.src = "./sprites/tools/time.png";

const timeToolAnims = {
  idle: [
    0, 0, 16, 16, // frame 1
  ],
  accel: [
    0, 16, 16, 16, // frame 1
    16, 16, 16, 16, // frame 2
    32, 16, 16, 16, // frame 3
    48, 16, 16, 16, // frame 4
  ],
  freeze: [
    0, 32, 16, 16, // frame 1
    16, 32, 16, 16, // frame 2
  ],
  unfreeze: [
    0, 48, 16, 16, // frame 1
    16, 48, 16, 16, // frame 2
  ],
  freezeWorld: [
    0, 64, 16, 16, // frame 1
    16, 64, 16, 16, // frame 2
  ],
  unfreezeWorld: [
    0, 80, 16, 16, // frame 1
    16, 80, 16, 16, // frame 2
  ],
}