window.addEventListener("load", main, true);

var currentLevel = -1;

//const gravity value
var GRAVITY = 0.5;

var stage;
var player;

//boss values, level is difficulty
var boss = null;
var bossLevel = 1;
var bossHP = 0;
var BOSS_MAX_HP = 30;

//enumeration of entity types
var EntType = {
    PLAYER: 0,
    SLIME: 1,
    TURTLE: 2,
    GARBAGE: 3,
    JUMPING: 4,
    HANGING: 5,
    BOSS: 6
};

//enumeration of platform types
//Grass tiles are the regular ground found commonly around areas
//Bouncy tiles will only be active if cleaned
//Slick tiles (rock) will be active if cleaned
//Sticky tiles will only be active if not cleaned
var TileType = {
    DIRTY_GRASS_TILE: 0,
    DIRTY_BOUNCY_TILE: 2,
    DIRTY_SLICK_TILE: 1,
    DIRTY_STICKY_TILE: 3,
    CLEAN_GRASS_TILE: 4,
    CLEAN_BOUNCY_TILE: 5,
    CLEAN_SLICK_TILE: 6,
    CLEAN_STICKY_TILE: 7
};

//arrays of platforms, enemies, and particles, respectively
var blocks = new Array();
var enemies = new Array();
var particles = new Array();

//flags
var facingRight = true;
var rightKey = false;
var leftKey = false;
var onGround = true;
var bossOnGround = true;
var playerDead = false;
var levelLoaded = false;

var ss;
var ess;
var gss;
var bss;
var background;
var mouseInterval;
var manifest;

//audio values
var currentAudioSrc = null;
var currentAudioInstance = null;

//structure of levels
var levels = [
  { name:"level1",  map:"/library/projects/renu/resources/images/level1.png",   music:"levelMusic", volume:0.2 },
  { name:"level2",  map:"/library/projects/renu/resources/images/level2.png",   music:"levelMusic", volume:0.2 },
  { name:"level3",  map:"/library/projects/renu/resources/images/level3.png",   music:"levelMusic", volume:0.2 },
  { name:"level4",  map:"/library/projects/renu/resources/images/level4.png",   music:"levelMusic", volume:0.2 },
  { name:"level5",  map:"/library/projects/renu/resources/images/level5.png",   music:"levelMusic", volume:0.2 },
  { name:"boss",    map:"/library/projects/renu/resources/images/boss.png",     music:"bossMusic",  volume:1.0 }
];

function main() {
    // create a new stage and point it at our canvas:
    stage = new createjs.Stage("myCanvas");
  var canvas = document.getElementById("myCanvas");
  canvas.style.cursor = "url('/library/projects/renu/resources/images/crosshair.png') 8 8, pointer";

    //basic enemy sprite sheet
    ess = new createjs.SpriteSheet({
        "animations":
            {
                "idle": [0, 2, "idle", 15]
            },
        "images": ["/library/projects/renu/resources/images/slime.png"],
        "frames":
            {
                "height": 388,
                "width": 462.3,
                "regX": 0,
                "regY": 0,
                "count": 3
            }
    });

    //"turtle" sprite sheet
    tss = new createjs.SpriteSheet({
        "animations":
            {
                "idle": [0, 0, "idle", 15]
            },
        "images": ["/library/projects/renu/resources/images/testenemy.png"],
        "frames":
            {
                "height": 149,
                "width": 119,
                "regX": 0,
                "regY": 0,
                "count": 1
            }
    });

    //garbage sprite sheet
    gss = new createjs.SpriteSheet({
        "animations":
            {
                "idle": [0, 0, "idle", 15]
            },
        "images": ["/library/projects/renu/resources/images/garbage.png"],
        "frames":
            {
                "height": 149,
                "width": 119,
                "regX": 0,
                "regY": 0,
                "count": 1
            }
    });

    //boss sprite sheet
    bss = new createjs.SpriteSheet({
        "animations":
            {
                "idle": [0, 1, "idle", 15]
            },
        "images": ["/library/projects/renu/resources/images/piss.png"],
        "frames":
            {
                "height": 615,
                "width": 812,
                "regX": 0,
                "regY": 0,
                "count": 2
            }
    });

    //player sprite sheet
    ss = new createjs.SpriteSheet({
        "animations":
        {
            "idle_r": [4],
            "idle_l": [7],
            "walk_r": [0, 5, "walk_r", 4],
            "walk_l": [6, 11, "walk_l", 4]
        },
        "images": ["/library/projects/renu/resources/images/spritesheet.png"],
        "frames":
            {
                "height": 357,
                "width": 240,
                "regX": 0,
                "regY": 0,
                "count": 18
            }
    });

    var img = new Image();
    img.src = "/library/projects/renu/resources/images/background.png";
    background = new createjs.Bitmap(img);
    img.onload = function () {
        background.scaleX = 1024 / background.image.width;
        background.scaleY = 768 / background.image.height;
    }

    //structure of audio info
    manifest = [
    { id: "splash", src: "/library/projects/renu/resources/sound/screen music.ogg" },
        { id: "levelMusic", src: "/library/projects/renu/resources/sound/8-bit Trip CUT.ogg" },
        { id: "bossMusic", src: "/library/projects/renu/resources/sound/Destination of the Heart FINAL CUT.ogg" },
        { id: "bubbles", src: "/library/projects/renu/resources/sound/bubbles.ogg" },
        { id: "win", src: "/library/projects/renu/resources/sound/boss end clip.ogg" },
    ];

    //preload of game using PreloadJS
    var preload = new createjs.LoadQueue();
    preload.onComplete = function () {
    progress.parentNode.style.display = "none";
        var img = new Image();
        img.src = "/library/projects/renu/resources/images/splashmenu.jpg";
        var menu = new createjs.Bitmap(img);
        img.onload = function () {
            menu.scaleX = 1024 / menu.image.width;
            menu.scaleY = 768 / menu.image.height;
            stage.addChild(menu);
            createjs.Ticker.setFPS(60);
            createjs.Ticker.addListener(function () { stage.update(); });
        }
        stage.onMouseDown = function () {
            nextLevel();
            stage.onMouseDown = null;
        };
        //play instance of splash when loaded/started
    currentAudioInstance = createjs.Sound.play("splash", createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 0.2);
    }
  preload.onProgress = function(e) {
    var progress = document.getElementById("progress");
    var percent = preload.progress * 100;
    // TODO: PROGRESS BAR
    progress.value = percent;
  };

    preload.installPlugin(createjs.Sound);
    preload.loadManifest(manifest);
}

function disableSelect(e) {
  console.log("yes");
  if (e.preventDefaults) { e.preventDefault(); }
  return false;
}

//main game loop
function gameLoop() {
    var i, j, k;

    if (boss != null) {
        boss.update();

        if (bossOnGround) {
            boss.position.y -= 1;
            boss.velocity.y = -15;
            bossOnGround = false;
        }
        if (bossHP <= 0) {
            stage.removeChild(boss.animation);
            boss = null;
        }
    }

    //update enemies
    for (i = 0; i < enemies.length; ++i)
        enemies[i].update();
    //update particles
    for (i = 0; i < particles.length; ++i) {
        var p = particles[i];
        if (p.position.y > 768) {
            stage.removeChild(p.sprite);
            particles.splice(i--, 1);
        }
        else
            p.update();
    }

    //update player
    if (!playerDead) {
        if (rightKey)
            player.acceleration.x += 0.25;
        if (leftKey)
            player.acceleration.x -= 0.25;

        player.update();

        //particle check against the ground
        for (i = 0; i < particles.length; ++i) {
            for (j = 0; j < blocks.length; ++j) {
                if (AABB(particles[i], blocks[j])) {
                    stage.removeChild(particles[i].sprite);
                    particles.splice(i--, 1);
                    //identification of block type
                    for (k = 0; k < blocks.length; ++k) {
                        switch (blocks[j].tileType) {
                            case TileType.DIRTY_GRASS_TILE:
                                blocks[j].clean(TileType.CLEAN_GRASS_TILE, 0.5, "/library/projects/renu/resources/images/cleanblock.png");
                                break;
                            case TileType.DIRTY_BOUNCY_TILE:
                                blocks[j].clean(TileType.CLEAN_GRASS_TILE, 0.5, "/library/projects/renu/resources/images/testblock.png");
                                break;
                            case TileType.DIRTY_SLICK_TILE:
                                blocks[j].clean(TileType.CLEAN_SLICK_TILE, 0.001, "/library/projects/renu/resources/images/cleantilewall.png");
                                break;
                            case TileType.DIRTY_STICKY_TILE:
                                blocks[j].clean(TileType.CLEAN_SLICK_TILE, 1.0, "/library/projects/renu/resources/images/testtilewall.png");
                                break;
                        }
                    }
                    break;
                }
            }
        }
        //collisions with boss
        if (boss != null) {
            for (i = 0; i < particles.length; ++i) {
                if (AABB(particles[i], boss)) {
                    stage.removeChild(particles[i].sprite);
                    particles.splice(i--, 1);
                    bossHP--;
                    break;
                }
            }

            if (AABB(player, boss)) {
                playerDead = true;
            }
        }
        //particle collisions with enemy
        for (i = 0; i < particles.length; ++i) {
            for (j = 0; j < enemies.length; ++j) {
                if (AABB(particles[i], enemies[j])) {
                    stage.removeChild(particles[i].sprite);
                    particles.splice(i--, 1);
                    stage.removeChild(enemies[j].animation);
                    enemies.splice(j--, 1);
                    break;
                }
            }
        }
        //enemy collisions with player
        for (i = 0; i < enemies.length; ++i) {
            if (AABB(player, enemies[i]))
                playerDead = true;
        }

        //reset player when death occurs
        if (playerDead) {
            death();
        }
    }

    for (i = 0; i < blocks.length; ++i) {
        if (player != null) {
            if (AABB(player, blocks[i])) {
                var a = player;
                var b = blocks[i];

                var aex = a.size.x / 2;
                var bex = b.size.x / 2;
                var aey = a.size.y / 2;
                var bey = b.size.y / 2;

                var ax = a.position.x + aex;
                var bx = b.position.x + bex;
                var ay = a.position.y + aey;
                var by = b.position.y + bey;

                // L, R, T, B
                var ar = [ax - aex, ax + aex, ay - aey, ay + aey];
                var br = [bx - bex, bx + bex, by - bey, by + bey];

                // R-L, L-R, B-T, T-B
                var dr = [ ar[1] - br[0], ar[0] - br[1], ar[2] - br[3], ar[3] - br[2] ];
        var dra = [ Math.abs(dr[0]), Math.abs(dr[1]), Math.abs(dr[2]), Math.abs(dr[3]) ];

                var dx = bx - ax;
                var dy = by - ay;

        var pen = Number.MAX_VALUE;
        var minSide = -1;
        if ( b.l && (0 < dra[0] && dra[0] < 2 * bex) && dra[0] < Math.abs(pen)) { pen = dr[0]; minSide = 0; } // Right
        if ( b.r && (0 < dra[1] && dra[1] < 2 * bex) && dra[1] < Math.abs(pen)) { pen = dr[1]; minSide = 1; } // Left
        if ( b.b && (0 < dra[2] && dra[2] < 2 * bey) && dra[2] < Math.abs(pen)) { pen = dr[2]; minSide = 2; } // Bottom
        if ( b.t && (0 < dra[3] && dra[3] < 2 * bey) && dra[3] < Math.abs(pen)) { pen = dr[3]; minSide = 3; } // Top
        switch(minSide)
        {
          case 0:
          {
            player.position.x -= pen + 0.1;
            player.velocity.x -= pen;
                        player.velocity.x = 0;
            break;
          }
          case 1:
          {
            player.position.x -= pen - 0.1;
            player.velocity.x -= pen;
            player.velocity.x = 0;
            break;
          }
          case 2:
          {
            player.position.y -= pen + 0.1;
            player.velocity.y -= pen;
            break;
          }
          case 3:
          {
            player.position.y -= pen - 0.1;
            player.velocity.y -= pen;
            player.velocity.y = 0;
            a.friction = b.friction;
            onGround = true;
            break;
          }
        }
            }
        }

        for (j = 0; j < enemies.length; ++j) {
            //no move behavior for default slime enemies, so skip

            //"turtles"
            if (enemies[j].type == EntType.TURTLE) {
                if (AABB(enemies[j], blocks[i])) {
                    var a = enemies[j];
                    var b = blocks[i];

                    var aex = a.size.x / 2;
                    var bex = b.size.x / 2;

                    var ax = a.position.x + aex;
                    var bx = b.position.x + bex;

                    //L, R
                    var ar = [ax - aex, ax + aex];
                    var br = [bx - bex, bx + bex];

                    //R-L, L-R
                    var dr = [ar[1] - br[0], ar[0] - br[1]];

                    if (b.l) { // Moving Right
                        a.velocity.x -= dr[1];
                        a.position.x -= dr[1] - 1;
                        a.velocity.x = 3;
                    }
                    else if (b.r) { // Moving Left
                        a.velocity.x -= dr[0];
                        a.position.x -= dr[0] + 1;
                        a.velocity.x = -3;
                    }
                }
            }

            //vertically jumping garbage cans
            if (enemies[j].type == EntType.GARBAGE) {
                if (AABB(enemies[j], blocks[i])) {
                    var a = enemies[j];
                    var b = blocks[i];

                    var aey = a.size.y / 2;
                    var bey = b.size.y / 2;

                    var ay = a.position.y + aey;
                    var by = b.position.y + bey;

                    //T, B
                    var ar = [ay - aey, ay + aey];
                    var br = [by - bey, by + bey];

                    //B-T, T-B
                    var dr = [ar[1] - br[0], ar[0] - br[1]];

                    if (b.b) { //Moving Up
                        a.velocity.y -= dr[2];
                        a.position.y -= dr[2];
                        a.velocity.y = 1;
                    }
                    else if (b.t) { //Moving Down
                        a.velocity.y -= dr[3];
                        a.position.y -= dr[3];
                        a.velocity.y = 0;
                    }
                }
            }

            //jumping vertical + horizontal
            if (enemies[j].type == EntType.JUMPING) {
                if (AABB(enemies[j], blocks[i])) {
                    var a = enemies[j];
                    var b = blocks[i];

                    var aex = a.size.x / 2;
                    var bex = b.size.x / 2;
                    var aey = a.size.y / 2;
                    var bey = b.size.y / 2;

                    var ax = a.position.x + aex;
                    var bx = b.position.x + bex;
                    var ay = a.position.y + aey;
                    var by = b.position.y + bey;

                    // L, R, T, B
                    var ar = [ax - aex, ax + aex, ay - aey, ay + aey];
                    var br = [bx - bex, bx + bex, by - bey, by + bey];

                    // R-L, L-R, B-T, T-B
                    var dr = [ar[1] - br[0], ar[0] - br[1], ar[2] - br[3], ar[3] - br[2]];

                    var dx = bx - ax;
                    var dy = by - ay;

                    if (Math.abs(dx) > Math.abs(dy)) {
                        if (b.l && Math.abs(dr[0]) < Math.abs(dr[1])) { // Moving Right
                            a.velocity.x -= dr[0];
                            a.position.x -= dr[0] + 1;
                            a.velocity.x = -2;
                        }
                        else if (b.r) { // Moving Left
                            a.velocity.x -= dr[1];
                            a.position.x -= dr[1] - 1;
                            a.velocity.x = 2;
                        }
                    } else {
                        if (b.b && Math.abs(dr[2]) < Math.abs(dr[3])) { // Moving Up
                            a.velocity.y -= dr[2];
                            a.position.y -= dr[2];
                            a.velocity.y = 0;
                        }
                        else if (b.t) { // Moving Down
                            a.velocity.y -= dr[3];
                            a.position.y -= dr[3];
                            a.velocity.y = 0;
                        }
                    }
                }
            }

            //hanging with reach
            if (enemies[j].type == EntType.HANGING) {

            }
        }

        //the piss boss
        if (boss != null) {
            if (AABB(boss, blocks[i])) {
                var a = boss;
                var b = blocks[i];

                var aex = a.size.x / 2;
                var bex = b.size.x / 2;
                var aey = a.size.y / 2;
                var bey = b.size.y / 2;

                var ax = a.position.x + aex;
                var bx = b.position.x + bex;
                var ay = a.position.y + aey;
                var by = b.position.y + bey;

                // L, R, T, B
                var ar = [ax - aex, ax + aex, ay - aey, ay + aey];
                var br = [bx - bex, bx + bex, by - bey, by + bey];

                // R-L, L-R, B-T, T-B
                var dr = [ar[1] - br[0], ar[0] - br[1], ar[2] - br[3], ar[3] - br[2]];

                var dx = bx - ax;
                var dy = by - ay;

                if (Math.abs(dx) > Math.abs(dy)) {
                    if (b.l && Math.abs(dr[0]) < Math.abs(dr[1])) {     // Moving Right
                        a.velocity.x -= dr[0];
                        a.position.x -= dr[0] + 1;
                        a.velocity.x = -3;
                    }
                    else if (b.r) {                                     // Moving Left
                        a.velocity.x -= dr[1];
                        a.position.x -= dr[1] - 1;
                        a.velocity.x = 3;
                    }
                } else {
                    if (b.b && Math.abs(dr[2]) < Math.abs(dr[3])) {     // Moving Up
                        a.velocity.y -= dr[2];
                        a.position.y -= dr[2];
                        a.velocity.y = 0;
                    }
                    else if (b.t) {                                     // Moving Down
                        a.velocity.y -= dr[3];
                        a.position.y -= dr[3];
                        a.velocity.y = 0;
                        bossOnGround = true;
                    }
                }
            }
        }
    }

    if (boss == null && enemies.length == 0 && levelLoaded)
        nextLevel();

    stage.update();
}

function death() {
    window.removeEventListener("keydown", keyDown, false);
    window.removeEventListener("keyup", keyUp, false);
    stage.onMouseDown = null;
    stage.onMouseUp = null;

    var px = player.position.x + player.size.x / 2;
    var py = player.position.y + player.size.y / 2;

    stage.removeChild(player.animation);

    //particle animation for death
    for (j = 0; j < 250; j++) {
        particles.push(new particle(px, py, 6, 6, Math.random() * (6 + 6) - 6, Math.random() * (6 + 6) - 6, "/library/projects/renu/resources/images/particle.png"));
    }
    player = null;
    reloadMap();
}

function mouseDown(mouseEvent) {
    if (!playerDead && currentLevel != levels.length)
        spawnParticle();

    mouseInterval = window.setInterval(function () {
        if (!playerDead && currentLevel != levels.length) {
            spawnParticle();
        }
        else
            window.clearInterval(mouseInterval);
    }, 180);
}

function spawnParticle() {
    //play bubble sound effect when firing
    createjs.Sound.play("bubbles", createjs.Sound.INTERRUPT_NONE, 0, 0, 0, 1);
    var x;
    //particles spawn based on player direction
    if (facingRight)
        x = player.position.x + player.size.x;
    else
        x = player.position.x;
    var y = player.position.y + (player.size.y / 2);
    var vx = stage.mouseX - x;
    var vy = stage.mouseY - y;
    var l = Math.sqrt((vx * vx) + (vy * vy));
    vx /= l; vy /= l;
    vx *= 15; vy *= 15;
    particles.push(new particle(x, y, 12, 12, vx, vy, "/library/projects/renu/resources/images/particle.png"));
}

function mouseUp(mouseEvent) {
    window.clearInterval(mouseInterval);
}

function keyDown(event) {
    switch (event.keyCode) {
        case 37: // left
        case 65: // left (A)
            if (!leftKey) {
                player.animation.gotoAndPlay("walk_l");
                facingRight = false;
            }
            leftKey = true;
            break;
        case 39: // right
        case 68: // right (D)
            if (!rightKey) {
                player.animation.gotoAndPlay("walk_r");
                facingRight = true;
            }
            rightKey = true;
            break;
        case 38: // up
        case 87: // up (W)
        case 32: // space
            if (onGround) {
                player.velocity.y = -10;
                player.animation.gotoAndPlay("jump");
                onGround = false;
            }
            break;
        case 75: // kill (k)
            playerDead = true;
            death();
            break;
    }
}

//AABB collisions
function AABB(a, b) {
    var aex = a.size.x / 2;
    var aey = a.size.y / 2;
    var bex = b.size.x / 2;
    var bey = b.size.y / 2;
    var ax = a.position.x + aex;
    var ay = a.position.y + aey;
    var bx = b.position.x + bex;
    var by = b.position.y + bey;

    if (Math.abs(ax - bx) > aex + bex) return false;
    if (Math.abs(ay - by) > aey + bey) return false;
    return true;
}

function keyUp(event) {
    switch (event.keyCode) {
        case 37: // left
        case 65: // left (A)
            leftKey = false;
            player.acceleration.x = 0;

            if (rightKey) {
                player.animation.gotoAndPlay("walk_r");
                facingRight = true;
            }
            else {
                player.animation.gotoAndPlay("idle_l");
                facingRight = false;
            }
            break;
        case 39: // right
        case 68: // right (D)
            rightKey = false;
            player.acceleration.x = 0;
            if (leftKey) {
                player.animation.gotoAndPlay("walk_l");
                facingRight = false;
            }
            else {
                player.animation.gotoAndPlay("idle_r");
                facingRight = true;
            }
            break;
    }
}

function entity(ss, width, height, type) {
    this.position = new createjs.Point(0, 0);
    this.size = new createjs.Point(width, height);
    this.type = type;
    this.velocity = new createjs.Point(0, 0);
    this.acceleration = new createjs.Point(0, 0);
    this.animation = new createjs.BitmapAnimation(ss);
    this.animation.scaleX = (width / ss._frameWidth);
    this.animation.scaleY = (height / ss._frameHeight);
    this.friction = 0;
    stage.addChild(this.animation);

    this.update = function () {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        if (this === player && onGround)
            this.velocity.x += (this.velocity.x > 0 ? -1 : 1) * Math.min(this.friction, Math.abs(this.velocity.x));
        this.velocity.x = (this.velocity.x > 0 ? 1 : -1) * Math.min(Math.abs(this.velocity.x), 5);
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.animation.x = this.position.x;
        this.animation.y = this.position.y;
    }
}

function platform(x, y, width, height, l, r, t, b, tileType, friction, imagePath) {
    this.position = new createjs.Point(x, y);
    this.size = new createjs.Point(width, height);
    this.tileType = tileType;
    this.friction = friction;
    this.l = l;
    this.r = r;
    this.t = t;
    this.b = b;
    var img = new Image();
    img.src = imagePath;
    var sprite = new createjs.Bitmap(img);
    this.sprite = sprite;
    stage.addChild(this.sprite);
    img.onload = function () {
        sprite.scaleX = width / sprite.image.width;
        sprite.scaleY = height / sprite.image.height;
    }
    sprite.x = x;
    sprite.y = y;

    this.clean = function (newTileType, newFriction, newImgPath) {
        this.tileType = newTileType;
        this.friction = newFriction;
        var img = new Image();
        img.src = newImgPath;
        var oldSprite = this.sprite;
        var sprite = new createjs.Bitmap(img);
        this.sprite = sprite;
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        img.onload = function () {
            sprite.scaleX = width / sprite.image.width;
            sprite.scaleY = height / sprite.image.height;
            stage.removeChild(oldSprite);
            stage.addChild(sprite);
        }
    }
}

function particle(x, y, width, height, vx, vy, imagePath) {
    this.position = new createjs.Point(x, y);
    this.size = new createjs.Point(width, height);
    this.velocity = new createjs.Point(vx, vy);
    this.acceleration = new createjs.Point(0, GRAVITY);
    var img = new Image();
    img.src = imagePath;
    var sprite = new createjs.Bitmap(img);
    this.sprite = sprite;
    stage.addChild(this.sprite);
    img.onload = function () {
        sprite.scaleX = width / sprite.image.width;
        sprite.scaleY = height / sprite.image.height;
    }
    this.update = function () {
        this.velocity.x += this.acceleration.x;
        this.velocity.y += this.acceleration.y;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        sprite.x = this.position.x;
        sprite.y = this.position.y;
    }
}

function loadMap(mapName) {
    createjs.Ticker.removeAllListeners();
    window.removeEventListener("keydown", keyDown, false);
    window.removeEventListener("keyup", keyUp, false);
    stage.onMouseDown = null;
    stage.onMouseUp = null;

    stage.removeAllChildren();
    enemies.splice(0, enemies.length);
    blocks.splice(0, blocks.length);
    particles.splice(0, particles.length);

    var img = new Image();
    img.onload = function () {
        var canvas = document.getElementById("mapData");
        canvas.width = img.width;
        canvas.height = img.height;
        var context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);
        var imgData = context.getImageData(0, 0, canvas.width, canvas.height);

        for (var y = 0; y < canvas.height; y++)
            for (var x = 0; x < canvas.width; x++) {
                var rgba = [imgData.data[(x + (y * canvas.width)) * 4], imgData.data[1 + ((x + (y * canvas.width)) * 4)], imgData.data[2 + ((x + (y * canvas.width)) * 4)], imgData.data[3 + ((x + (y * canvas.width)) * 4)]];
                //spawn grass tile
                if (rgba[0] == 0 && rgba[1] == 0 && rgba[2] == 0 && rgba[3] == 255) {
                    var p = new platform(x * 32, y * 32, 32, 32,
                        x > 0 ? !((imgData.data[((x - 1) + (y * canvas.width)) * 4] == 0) && (imgData.data[1 + (((x - 1) + (y * canvas.width)) * 4)] == 0) && (imgData.data[2 + (((x - 1) + (y * canvas.width)) * 4)] == 0) && (imgData.data[3 + (((x-1) + (y * canvas.width)) * 4)] == 255)) : false,
                        x < canvas.width - 1 ? !((imgData.data[((x + 1) + (y * canvas.width)) * 4] == 0) && (imgData.data[1 + (((x + 1) + (y * canvas.width)) * 4)] == 0) && (imgData.data[2 + (((x + 1) + (y * canvas.width)) * 4)] == 0) && (imgData.data[3 + (((x + 1) + (y * canvas.width)) * 4)] == 255)) : false,
                        y > 0 ? !((imgData.data[(x + ((y-1) * canvas.width)) * 4] == 0) && (imgData.data[1 + ((x + ((y-1) * canvas.width)) * 4)] == 0) && (imgData.data[2 + ((x + ((y-1) * canvas.width)) * 4)] == 0) && (imgData.data[3 + ((x + ((y-1) * canvas.width)) * 4)] == 255)) : false,
                        y < canvas.height - 1 ? !((imgData.data[(x + ((y + 1) * canvas.width)) * 4] == 0) && (imgData.data[1 + ((x + ((y + 1) * canvas.width)) * 4)] == 0) && (imgData.data[2 + ((x + ((y + 1) * canvas.width)) * 4)] == 0) && (imgData.data[3 + ((x + ((y + 1) * canvas.width)) * 4)] == 255)) : false,
                        TileType.DIRTY_GRASS_TILE,
                        0.1,
                        "/library/projects/renu/resources/images/block.png");
                    blocks.push(p);
                }

                //spawn bouncy tile

                //spawn slick tile
                else if (rgba[0] == 128 && rgba[1] == 128 && rgba[2] == 128 && rgba[3] == 255) {
                    var p = new platform(x * 32, y * 32, 32, 32,
                        x > 0 ? !((imgData.data[((x - 1) + (y * canvas.width)) * 4] == 0) && (imgData.data[1 + (((x - 1) + (y * canvas.width)) * 4)] == 0) && (imgData.data[2 + (((x - 1) + (y * canvas.width)) * 4)] == 0) && (imgData.data[3 + (((x - 1) + (y * canvas.width)) * 4)] == 255)) : false,
                        x < canvas.width - 1 ? !((imgData.data[((x + 1) + (y * canvas.width)) * 4] == 0) && (imgData.data[1 + (((x + 1) + (y * canvas.width)) * 4)] == 0) && (imgData.data[2 + (((x + 1) + (y * canvas.width)) * 4)] == 0) && (imgData.data[3 + (((x + 1) + (y * canvas.width)) * 4)] == 255)) : false,
                        y > 0 ? !((imgData.data[(x + ((y - 1) * canvas.width)) * 4] == 0) && (imgData.data[1 + ((x + ((y - 1) * canvas.width)) * 4)] == 0) && (imgData.data[2 + ((x + ((y - 1) * canvas.width)) * 4)] == 0) && (imgData.data[3 + ((x + ((y - 1) * canvas.width)) * 4)] == 255)) : false,
                        y < canvas.height - 1 ? !((imgData.data[(x + ((y + 1) * canvas.width)) * 4] == 0) && (imgData.data[1 + ((x + ((y + 1) * canvas.width)) * 4)] == 0) && (imgData.data[2 + ((x + ((y + 1) * canvas.width)) * 4)] == 0) && (imgData.data[3 + ((x + ((y + 1) * canvas.width)) * 4)] == 255)) : false,
                        TileType.DIRTY_SLICK_TILE,
                        0.1,
                        "/library/projects/renu/resources/images/grosstile.png");
                    blocks.push(p);
                }

                //spawn sticky tile

                //spawn default slime enemy
                else if (rgba[0] == 255 && rgba[1] == 0 && rgba[2] == 0 && rgba[3] == 255) {
                    var e = new entity(ess, 43, 36, EntType.SLIME);
                    e.position.x = x * 32;
                    e.position.y = y * 32;
                    e.animation.gotoAndPlay("idle");
                    enemies.push(e);
                }
                //spawn "turtle" enemy
                else if (rgba[0] == 136 && rgba[1] == 0 && rgba[2] == 21 && rgba[3] == 255) {
                    var e = new entity(tss, 43, 36, EntType.TURTLE);
                    e.position.x = x * 32;
                    e.position.y = y * 32;
                    e.animation.gotoAndPlay("idle");
                    e.velocity.x = -3;
                    enemies.push(e);
                }
                //spawn garbage enemy
                else if (rgba[0] == 255 && rgba[1] == 201 && rgba[2] == 14 && rgba[3] == 255) {
                    var e = new entity(gss, 43, 36, EntType.GARBAGE);
                    e.position.x = x * 32;
                    e.position.y = y * 32;
                    e.animation.gotoAndPlay("idle");
                    e.acceleration.y = GRAVITY;
                    enemies.push(e);
                }

                //spawn left/right jumping enemies
                //spawn hanging enemies

                //spawn boss
                else if (rgba[0] == 0 && rgba[1] == 0 && rgba[2] == 255 && rgba[3] == 255) {
                    var e = new entity(bss, 297, 229, EntType.BOSS);
                    e.position.x = (x * 32) - (297 / 2);
                    e.position.y = (y * 32) - 229;
                    e.animation.gotoAndPlay("idle");
                    boss = e;
                    boss.velocity.x = 3;
                    boss.acceleration.y = GRAVITY;
                }
                //spawn player
                else if (rgba[0] == 0 && rgba[1] == 255 && rgba[2] == 0 && rgba[3] == 255) {
                    player = new entity(ss, 45, 68, EntType.PLAYER);
                    player.position.x = x * 32;
                    player.position.y = (y * 32) - 90;
                    player.animation.gotoAndPlay("idle_r");
                    facingRight = true;
                    player.acceleration.y = GRAVITY;
                }
            }
        createjs.Ticker.setFPS(60);
        createjs.Ticker.addListener(gameLoop);
        window.addEventListener("keydown", keyDown, false);
        window.addEventListener("keyup", keyUp, false);
        stage.onMouseDown = mouseDown;
        stage.onMouseUp = mouseUp;
        levelLoaded = true;
        facingRight = true;
        rightKey = false;
        leftKey = false;
        onGround = true;
        bossOnGround = true;
        playerDead = false;
    }
    img.src = mapName;
    stage.addChild(background);
}

function reloadMap() {
    levelLoaded = false;

  var intervalFunc = window.setInterval(function () {
      if (currentLevel == levels.length-2)
        bossHP = BOSS_MAX_HP;
            loadMap(levels[currentLevel].map);
            window.clearInterval(intervalFunc);
        }, 3000);
}

function nextLevel() {
  var intervalFunc;
  levelLoaded = false;
  currentLevel++;
  if (currentLevel != levels.length) {
    intervalFunc = window.setInterval(function () {
            loadMap(levels[currentLevel].map);
      if (currentAudioSrc != levels[currentLevel].music) {
        currentAudioSrc = levels[currentLevel].music;
        currentAudioInstance.stop();
        currentAudioInstance = createjs.Sound.play(levels[currentLevel].music, createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 0.2);
      }
      if (currentLevel == levels.length-2)
        bossHP = BOSS_MAX_HP;

            window.clearInterval(intervalFunc);
        }, 1000);
  }
  else {
    currentLevel = -1;

    currentAudioInstance.stop();
    currentAudioInstance = createjs.Sound.play("win", createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 0.2);

    var img = new Image();
    img.src = "/library/projects/renu/resources/images/winscreen.png";
    var menu = new createjs.Bitmap(img);
    img.onload = function () {
      menu.scaleX = 1024 / menu.image.width;
      menu.scaleY = 768 / menu.image.height;
      stage.addChild(menu);
      createjs.Ticker.setFPS(60);
      createjs.Ticker.addListener(function () { stage.update(); });
    }
    var wintimer = window.setInterval(function () {
      stage.onMouseDown = function () {
        nextLevel();
        stage.onMouseDown = null;
      };
      window.clearInterval(wintimer);
    }, 5000);
  }
}