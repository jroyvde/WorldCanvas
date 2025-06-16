let timeFactor = 1;  // Time factor. Can be manipulated once the player obtains the Time Tool. Default = 1

let worldFrozen = false; // Flag to indicate if the world is frozen

let timeOfDay = 12; // Time of day in hours (0-23)
let minutes = 0; // Minutes past the hour

// Progress the time of day
function tick() {
    // Stop ticking forever if worldState is 4
    if (worldState == 4) {
        return;
    }

    // Increment minutes, unless the world is frozen
    if (!worldFrozen) {
        minutes++;
    }

    setNightCastOpacity(); // Update opacity based on time of day
    if (minutes >= 60) {
        minutes = 0;
        timeOfDay++;
        if (timeOfDay >= 24) {
            timeOfDay = 0;
        }
    }
    const minuteTime = 1000 / timeFactor; // Calculate delay dynamically

    setTimeout(tick, minuteTime);
}

// Start ticking
tick();

function setNightCastOpacity() {
    const totalMinutes = timeOfDay * 60 + minutes; // Convert timeOfDay and minutes to total minutes in the day

    if (totalMinutes < 360) { // Before 6 AM (360 minutes)
        nightCastImageNode.opacity(0.75);
    } else if (totalMinutes >= 360 && totalMinutes < 480) { // Between 6 AM (360) and 8 AM (480)
        const progress = (totalMinutes - 360) / 120; // Progress from 0 to 1 over 120 minutes
        nightCastImageNode.opacity(0.75 - (0.75 * progress));
    } else if (totalMinutes >= 480 && totalMinutes < 1080) { // Between 8 AM (480) and 6 PM (1080)
        nightCastImageNode.opacity(0);
    } else if (totalMinutes >= 1080 && totalMinutes < 1200) { // Between 6 PM (1080) and 8 PM (1200)
        const progress = (totalMinutes - 1080) / 120; // Progress from 0 to 1 over 120 minutes
        nightCastImageNode.opacity(0 + (0.75 * progress));
    } else { // After 8 PM (1200 minutes)
        nightCastImageNode.opacity(0.75);
    }
}