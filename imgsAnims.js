// Library for Images and their associated Animations

// UI:

// Background
const backgroundImage = new Image();
backgroundImage.src = "./sprites/background.png"

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

// ENTITIES:

// Dog
const dogImage = new Image();
dogImage.src = "./sprites/entities/dog.png";

const dogAnims = {
    idle: [
      0, 0, 16, 16,   // frame 1
      16, 0, 16, 16,  // frame 2
    ],
};

// Person
const personImage = new Image();
personImage.src = "./sprites/entities/person.png";

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

// Paint
const paintImage = new Image();
paintImage.src = "./sprites/entities/paint.png";

const paintAnims = {
    idle: [
      0, 0, 6, 6,   // frame 1
    ],
    red: [
      0, 6, 6, 6,   // frame 1
    ],
    orange: [
      0, 12, 6, 6,   // frame 1
    ],
    yellow: [
      0, 18, 6, 6,   // frame 1
    ],
    green: [
      0, 24, 6, 6,   // frame 1
    ],
    blue: [
      0, 30, 6, 6,   // frame 1
    ],
};

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
}