const fs = require("fs");
const parse = require("./parse");

const bsor = fs.readFileSync("test.bsor"); // Read BSOR file
const parsedBsor = parse(bsor); // Parse BSOR

// console.log([parsedBsor]); // Log parsed BSOR
console.log("Parsed BSOR:");
console.log();
// Log info
console.log("Info:");
console.log(parsedBsor.info);
console.log();
// Log event counts
console.log("Frames count:", parsedBsor.framesCount);
console.log("Note count:", parsedBsor.noteCount);
console.log("Wall count:", parsedBsor.wallCount);
console.log("Height count (automatic height adjustment):", parsedBsor.heightCount);
console.log("Pause count:", parsedBsor.pauseCount);
console.log();

// Custom data
const averageFps = parsedBsor.frames.map(i => i.fps).reduce((prev, curr) => prev + curr) / parsedBsor.framesCount;
// Log custom
console.log("Average FPS", averageFps);