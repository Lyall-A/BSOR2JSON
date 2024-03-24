function parse(bsor) {
    if (!bsor) throw new Error();

    let globalOffset = 0;

    function byte(offset = globalOffset) {
        globalOffset++;
        return bsor[offset];
    }
    function int(offset = globalOffset) {
        globalOffset+=4;
        return bsor.readInt32LE(offset);
    }
    function float(offset = globalOffset) {
        globalOffset+=4;
        return bsor.readFloatLE(offset);
    }
    function long(offset = globalOffset) {
        globalOffset+=8;
        return bsor.readBigInt64LE(offset);
    }
    function bool(offset = globalOffset) {
        globalOffset++;
        return bsor[offset] ? true : false;
    }
    function string(offset = globalOffset) {
        const count = int(offset);
        offset+=4;
        globalOffset+=count;
        return bsor.subarray(offset, offset + count).toString();
    }
    function Vector3(offset = globalOffset) {
        const x = float(offset);
        offset+=4;
        const y = float(offset);
        offset+=4;
        const z = float(offset);
        offset+=4;
        return { x, y, z };
        // return [x, y, z];
    }

    const parsed = { };

    parsed.magicNumber = int();
    parsed.fileVersion = byte();

    // Info structure
    if (byte() != 0) throw new Error();
    const info = { };
    info.version = string();
    info.gameVersion = string();
    info.timestamp = string();

    info.playerID = string();
    info.playerName = string();
    info.platform = string();

    info.trackingSystem = string();
    info.hmd = string();
    info.controller = string();

    info.hash = string();
    info.songName = string();
    info.mapper = string();
    info.difficulty = string();

    info.score = int();
    info.mode = string();
    info.enviroment = string();
    info.modifiers = string().split(",").filter(i => i)
    info.jumpDistance = float();
    info.leftHanded = bool();
    info.height = float();

    info.startTime = float();
    info.failTime = float();
    info.speed = float();

    parsed.info = info;

    // Frames
    if (byte() != 1) throw new Error();
    parsed.framesCount = int();
    const frames = [];
    for (let i = 0; i < parsed.framesCount; i++) {
        const frame = { };

        frame.time = float();
        frame.fps = int();

        frame.head = { };
        frame.head.position = { x: float(), y: float(), z: float() };
        frame.head.rotation = { x: float(), y: float(), z: float(), w: float() };
        // frame.head.position = [ float(), float(), float() ];
        // frame.head.rotation = [ float(), float(), float(), float() ];

        frame.leftHand = {};
        frame.leftHand.position = { x: float(), y: float(), z: float() };
        frame.leftHand.rotation = { x: float(), y: float(), z: float(), w: float() };
        // frame.leftHand.position = [ float(), float(), float() ];
        // frame.leftHand.rotation = [ float(), float(), float(), float() ];

        frame.rightHand = { };
        frame.rightHand.position = { x: float(), y: float(), z: float() };
        frame.rightHand.rotation = { x: float(), y: float(), z: float(), w: float() };
        // frame.rightHand.position = [ float(), float(), float() ];
        // frame.rightHand.rotation = [ float(), float(), float(), float() ];

        frames.push(frame);
    }
    parsed.frames = frames;

    // Note event
    if (byte() != 2) throw new Error();
    parsed.noteCount = int();
    const notes = [];
    for (let i = 0; i < parsed.noteCount; i++) {
        const note = { };

        note.noteID = int();
        note.eventTime = float();
        note.spawnTime = float();
        note.eventType = int();
        if (note.eventType == 0 || note.eventType == 1) {
            note.speedOK = bool();
            note.directionOK = bool();
            note.saberTypeOK = bool();
            note.wasCutTooSoon = bool();
            note.saberSpeed = float();
            note.saberDir = Vector3();
            note.saberType = int();
            note.timeDeviation = float();
            note.cutDirDeviation = float();
            note.cutPoint = Vector3();
            note.cutNormal = Vector3();
            note.cutDistanceToCenter = float();
            note.cutAngle = float();
            note.beforeCutRating = float();
            note.afterCutRating = float();
        }

        notes.push(note);
    }
    parsed.notes = notes;
    
    // Wall event
    if (byte() != 3) throw new Error();
    parsed.wallCount = int();
    const walls = [];
    for (let i = 0; i < parsed.wallCount; i++) {
        const wall = { };

        wall.wallID = int();
        wall.energy = float();
        wall.time = float();
        wall.spawnTime = float();

        walls.push(wall);
    }
    parsed.walls = walls;

    // Automatic height
    if (byte() != 4) throw new Error();
    parsed.heightCount = int();
    const heights = [];
    for (let i = 0; i < parsed.heightCount; i++) {
        const height = { };

        height.height = float();
        height.time = float();

        heights.push(height);
    }
    parsed.heights = heights;

    // Pause
    if (byte() != 5) throw new Error();
    parsed.pauseCount = int();
    const pauses = [];
    for (let i = 0; i < parsed.pauseCount; i++) {
        const pause = { };

        pause.duration = long();
        pause.time = float();

        pauses.push(pause);
    }
    parsed.pauses = pauses;

    return parsed; // return parsed
}

module.exports = parse;

/** BSOR file structure
0x442d3d69                     - int, unique magic number.
1                              - byte, file version.

0                              - byte, info structure start.
{                              - Info structure
  version                      - string, Mod version
  gameVersion                  - string, Game version
  timestamp;                   - string, play start unix timestamp.
  
  playerID;                    - string, player platform unique id.
  playerName;                  - string, player platform name.
  platform;                    - string, oculus or steam.

  trackingSytem;               - string, tracking system type. (OpenVR, Oculus, etc.)
  hmd;                         - string, headset type. (Oculus Quest, Valve Index, etc.)
  controller;                  - string, controllers type. (Oculus touch, etc)

  hash;                        - string, map hash.
  songName;                    - string, song name.
  mapper;                      - string, mapper name.
  difficulty;                  - string, difficulty name. (Easy, ExpertPlus, etc).

  score                        - int, total unmodified score.
  mode                         - string, game mode. (Standard, OneSaber, Lawless, etc.)
  environment                  - string, environment name. (The beginning, etc.)
  modifiers                    - comma separated string, game modifiers. (FS, GN, etc.)
  jumpDistance                 - float, note jump distance.
  leftHanded                   - bool
  height                       - float, static height

  startTime                    - float, song start time (practice mode).
  failTime                     - float, song fail time (only if failed).
  speed                        - float, song speed (practice mode).
}

1                              - byte, frames array start.
framesCount                    - int, frames count.
{                              - Frame structure
  time                         - float, song time
  fps                          - int, player's FPS
  {                            - Head structure
    {x, y, z}                  - 3 floats, position.
    {x, y, z, w}               - 4 floats, rotation.
  }
  {                            - Left hand structure
    {x, y, z}                  - 3 floats, position.
    {x, y, z, w}               - 4 floats, rotation.
  }
  {                            - Right hand structure
    {x, y, z}                  - 3 floats, position.
    {x, y, z, w}               - 4 floats, rotation.
  }
}

2                              - byte, note events array start.
noteCount                      - int, note events count.
{                              - Note event structure.
  noteID                       - int, scoringType*10000 + lineIndex*1000 + noteLineLayer*100 + colorType*10 + cutDirection.  
      Where scoringType is game value + 2. Standard values: 
        Normal = 0, 
        Ignore = 1, 
        NoScore = 2, 
        Normal = 3, 
        SliderHead = 4, 
        SliderTail = 5, 
        BurstSliderHead = 6, 
        BurstSliderElement = 7
  eventTime                    - float, song time of event 
  spawnTime                    - float, spawn time of note
  eventType                    - int, good = 0,bad = 1,miss = 2,bomb = 3
  {                            - Cut info structure (only for Good and Bad!)
    bool speedOK;
    bool directionOK;
    bool saberTypeOK;
    bool wasCutTooSoon;
    float saberSpeed;
    Vector3 saberDir;
    int saberType;
    float timeDeviation;
    float cutDirDeviation;
    Vector3 cutPoint;
    Vector3 cutNormal;
    float cutDistanceToCenter;
    float cutAngle;
    float beforeCutRating;
    float afterCutRating;
  }
}

3                              - byte, wall events array start
wallCount                      - int, wall events count
{
  wallID                       - int, lineIndex*100 + obstacleType*10 + width
  energy                       - float, energy at the end of event
  time                         - float, song time of event 
  spawnTime                    - float, spawn time of wall
}

4                              - byte, automatic height array start
heightCount                    - int, height change events count
{
  height                       - float, height value
  time                         - float, song time
}

5                              - byte, pause array start
pauseCount                     - int, pauses count
{
  duration                     - long, duration in seconds
  time                         - float, pause start time
}
 */