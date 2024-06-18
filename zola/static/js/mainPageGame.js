// next time I want to make a game, remind me to not half-ass a collision system in js again...

const canvas = document.getElementById("main-page-game-canvas");
const ctx = canvas.getContext("2d");
// pixel filtering (no blur when resizing)
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

// ----------------------------------------- //
// game resources

var spritesheetReady = false;
const spritesheet = new Image();
spritesheet.addEventListener("load", () => {
    spritesheetReady = true;
});
spritesheet.src = "/images/main-page-game/spritesheet-outline.png";

var spritesheetKeysReady = false;
const spritesheetKeys = new Image();
spritesheetKeys.addEventListener("load", () => {
    spritesheetKeysReady = true;
});
spritesheetKeys.src = "/images/main-page-game/spritesheet-keys.png";

// ----------------------------------------- //
// globals

const SPRITE_W = 6;
const SPRITE_H = 8;

const ANIM_FRAMES = 8;

var spriteX = 32;
var spriteY = 0;

var velocityY = 0;

var isWDown = false;
var isADown = false;
var isSDown = false;
var isDDown = false;

var isJumpDown = "unpressed";
var isMoveLeft = false;
var isMoveRight = false;

var lastMoveDirection = "right";

var frameNum = 0;

var animationHeightList = [8, 16, 24, 32];
var animationWidthOffsetList = [0, 1, 0, 0];

// top bottom left right
var colliders = [
    { 
        top: canvas.height - 6*4,
        bottom: canvas.height - 6*2,
        left: canvas.width - 8*4,
        right: canvas.width - 8*2 - 2
    },
    { 
        top: canvas.height - 6*2,
        bottom: canvas.height,
        left: canvas.width - 8*6,
        right: canvas.width,
    },
    { 
        top: canvas.height - 4*2,
        bottom: canvas.height,
        left: 0,
        right: 24,
    },
    { 
        top: canvas.height - 4*4,
        bottom: canvas.height - 4*2,
        left: 0,
        right: 16,
    },
    { 
        top: canvas.height - 4*6,
        bottom: canvas.height - 4*4,
        left: 0,
        right: 8,
    },
];

// ----------------------------------------- //
// physics helpers

// returns the top most intersection
function verticalLineAABBIntersect(vline, aabb) {
    if (vline < aabb.left || vline > aabb.right) {
        return null;
    } else {
        return aabb.top;
    }
}

function AABBIntersect(a, b) {
    return (
        a.left <= b.right &&
        a.right >= b.left &&
        a.top <= b.bottom &&
        a.bottom >= b.top
    );
}

// uses the player's rect & assumes x,y are in the center of the player rect
function closestPositionInCollider(x, y, col) {
    if (x < col[2] && y < col[0]) {
        return (x + SPRITE_W/2) > col[2] && (x + SPRITE_W/2) < col[3] && (y + SPRITE_H/2) > col[0] && (y + SPRITE_H/2) < col[1];
    } else if (x > col[3] && y < col[0]) {
        return (x - SPRITE_W/2) > col[2] && (x - SPRITE_W/2) < col[3] && (y + SPRITE_H/2) > col[0] && (y + SPRITE_H/2) < col[1];
    } else if (x < col[2] && y > col[1]) {
        return (x + SPRITE_W/2) > col[2] && (x + SPRITE_W/2) < col[3] && (y - SPRITE_H/2) > col[0] && (y - SPRITE_H/2) < col[1];
    } else if (x > col[3] && y > col[1]) {
        return (x - SPRITE_W/2) > col[2] && (x - SPRITE_W/2) < col[3] && (y - SPRITE_H/2) > col[0] && (y - SPRITE_H/2) < col[1];
    }
}

function distanceToGround(playerRect) {
    // start with distance to floor
    let closestDistance = 150 - playerRect.bottom;
    let xPosLeft = playerRect.left + 2;
    let xPosRight = playerRect.right - 2;
    
    for (let i = 0; i < colliders.length; i++) {
        let col = colliders[i];
        let colTopLeft = verticalLineAABBIntersect(xPosLeft, col);
        let colTopRight = verticalLineAABBIntersect(xPosRight, col);
        if (colTopLeft !== null) {
            let distanceToCol = colTopLeft - playerRect.bottom;
            if (distanceToCol >= 0 && distanceToCol <= closestDistance)
                closestDistance = distanceToCol;
        }
        if (colTopRight !== null) {
            let distanceToCol = colTopRight - playerRect.bottom;
            if (distanceToCol >= 0 && distanceToCol <= closestDistance)
                closestDistance = distanceToCol;
        }
    }

    return closestDistance;
}

// xPos & yPos are the bottom left corner of the sprite box (weird stupid y pos though)
// this function is a clusterfuck, I'm sorry haha
function movementIntersectsCollider(playerRect, xMove, yMove) {
    if (yMove == 0 && xMove == 0) return [0, 0];

    let translatedPlayerRect = {
        top: playerRect.top + yMove,
        bottom: playerRect.bottom + yMove,
        left: playerRect.left + xMove,
        right: playerRect.right + xMove,
    };

    // center position
    let xPos = playerRect.left + SPRITE_W;
    let yPos = playerRect.top + SPRITE_H;

    for (let i = 0; i < colliders.length; i++) {
        let col = colliders[i];
        if (AABBIntersect(translatedPlayerRect, col)) {
            if (yPos < col.top) {
                if (xMove == 0) {
                    //shortcut
                    return [0, -(translatedPlayerRect.bottom - col.top)];
                }
                let xIntersectWithTop = (col.top - yPos-SPRITE_H) * (xMove / yMove);
                if (xIntersectWithTop >= col.left && xIntersectWithTop <= col.right) {
                    return [0, -(translatedPlayerRect.bottom - col.top)];
                } else if (xPos < col.left) {
                    return [-(translatedPlayerRect.right - col.left), 0];
                } else if (xPos > col.right) {
                    return [-(translatedPlayerRect.left - col.right), 0];
                }
            } else if (yPos > col.bottom) {
                if (xMove == 0) {
                    //shortcut
                    return [0, -(translatedPlayerRect.top - col.bottom)];
                }
                let xIntersectWithBot = (col.bottom - yPos+SPRITE_H) * (xMove / yMove);
                if (xIntersectWithBot >= col.left && xIntersectWithBot <= col.right) {
                    return [0, -(translatedPlayerRect.top - col.bottom)];
                } else if (xPos < col.left) {
                    return [-(translatedPlayerRect.right - col.left), 0];
                } else if (xPos > col.right) {
                    return [-(translatedPlayerRect.left - col.right), 0];
                }
            } else if (xPos < col.left) {
                return [-(translatedPlayerRect.right - col.left), 0];
            } else if (xPos > col.right) {
                return [-(translatedPlayerRect.left - col.right), 0];
            }
        }
    }
    return [0, 0];
}

// ----------------------------------------- //
// animation

const DEBUG = false;

function update() {
    if (spritesheetReady && spritesheetKeysReady) { 
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var xMove = 0;
        if (isMoveLeft) {
            xMove = -2;
            lastMoveDirection = "left";
            isMovingX = true;
        } else if (isMoveRight) {
            xMove = 2;
            lastMoveDirection = "right";
            isMovingX = true;
        } else {
            isMovingX = false;
        }

        if (isJumpDown == "pressed") {
            isJumpDown = "used";
            velocityY = 5;
        }

        // check if run into wall or ground before moving & correct movement
        playerRect = {
            top: canvas.height + spriteY - SPRITE_H * 2,
            bottom: canvas.height + spriteY,
            left: spriteX,
            right: spriteX + SPRITE_W * 2,
        };
        let [updateX, updateY] = movementIntersectsCollider(playerRect, xMove, velocityY);

        let yAmountMoved = velocityY - updateY;

        spriteX += (xMove + updateX);
        spriteY -= (velocityY - updateY);

        updatedPlayerRect = {
            top: canvas.height + spriteY - SPRITE_H * 2,
            bottom: canvas.height + spriteY,
            left: spriteX,
            right: spriteX + SPRITE_W * 2,
        };

        // collide with left & right edges of screen
        if (spriteX < 0)
            spriteX = 0;
        else if (spriteX > (canvas.width - SPRITE_W * 2))
            spriteX = canvas.width - SPRITE_W * 2;

        if (distanceToGround(playerRect) <= -yAmountMoved) {
            // touched ground
            velocityY = 0;
            spriteY += distanceToGround(playerRect) + yAmountMoved;
            isJumpDown = "unpressed";
        } else {
            // in the air
            isMovingX = false;
    
            // update velocity if you're in the air
            velocityY -= 0.5;
        }

        // draw player
        ctx.drawImage(
            spritesheet,
            1 + (isJumpDown == "used" ? 15 : 0) + (lastMoveDirection == "left" ? 8 : 0) + (isMovingX ? -animationWidthOffsetList[Math.floor(frameNum/ANIM_FRAMES) % 3] : 0),
            0 + (isJumpDown == "used" ? 1 : 0) + (isMovingX ? animationHeightList[Math.floor(frameNum/ANIM_FRAMES) % 3] : 0),

            SPRITE_W + (isJumpDown == "used" ? 2 : 0) + 2 * (isMovingX ? animationWidthOffsetList[Math.floor(frameNum/ANIM_FRAMES) % 3] : 0), 
            SPRITE_H + (isJumpDown == "used" ? -2 : 0),

            0 + spriteX + (isJumpDown == "used" ? -2 : 0) - 2 * (isMovingX ? animationWidthOffsetList[Math.floor(frameNum/ANIM_FRAMES) % 3] : 0), 
            canvas.height - SPRITE_H*2 + spriteY + 2,

            (SPRITE_W + (isJumpDown == "used" ? 2 : 0)) * 2 + 4 * (isMovingX ? animationWidthOffsetList[Math.floor(frameNum/ANIM_FRAMES) % 3] : 0),
            (SPRITE_H + (isJumpDown == "used" ? -2 : 0)) * 2,
        );

        if (DEBUG) {
            ctx.fillStyle = "#fff0005f";
            ctx.fillRect(spriteX, canvas.height - SPRITE_H*2 + spriteY, SPRITE_W * 2, SPRITE_H * 2);
            ctx.fillStyle = "#f00f0f5f";
            ctx.fillRect(spriteX, canvas.height + spriteY, SPRITE_W * 2, distanceToGround(updatedPlayerRect));
        }

        // draw button display:

        // d
        ctx.drawImage(
            spritesheetKeys,
            1 + 8*3, 1 + (isDDown ? 6 : 0),
            7, 5,
            canvas.width - 14 - 2, canvas.height - 10 - 2, 
            14, 10,
        );

        // s
        ctx.drawImage(
            spritesheetKeys,
            1 + 8*2, 1 + (isSDown ? 6 : 0),
            7, 5,
            canvas.width - 14 - 2 - 8*2, canvas.height - 10 - 2, 
            14, 10,
        );

        // a
        ctx.drawImage(
            spritesheetKeys,
            1 + 8, 1 + (isADown ? 6 : 0),
            7, 5,
            canvas.width - 14 - 2 - 8*4, canvas.height - 10 - 2, 
            14, 10,
        );

        // w
        ctx.drawImage(
            spritesheetKeys,
            1, 1 + (isWDown ? 6 : 0),
            7, 5,
            canvas.width - 14 - 2 - 8*2, canvas.height - 10 - 2 - 6*2, 
            14, 10,
        );

        // draw blocks:

        ctx.drawImage(
            spritesheet,
            45, 1 + 4,
            4, 4,
            0, canvas.height - 4*2, 
            8, 8,
        );

        ctx.drawImage(
            spritesheet,
            45 + 4, 1 + 4,
            4, 4,
            8, canvas.height - 4*2, 
            8, 8,
        );

        ctx.drawImage(
            spritesheet,
            45 + 4, 1,
            4, 4,
            16, canvas.height - 4*2, 
            8, 8,
        );

        ctx.drawImage(
            spritesheet,
            45, 1 + 4,
            4, 4,
            0, canvas.height - 4*4, 
            8, 8,
        );

        ctx.drawImage(
            spritesheet,
            45, 1,
            4, 4,
            8, canvas.height - 4*4, 
            8, 8,
        );

        ctx.drawImage(
            spritesheet,
            45 + 4, 1 + 4,
            4, 4,
            0, canvas.height - 4*6, 
            8, 8,
        );

        if (DEBUG)
            for (let i = 0; i < colliders.length; i++) {
                ctx.fillStyle = "#0000ff77";
                ctx.fillRect(
                    colliders[i].left, 
                    colliders[i].top, 
                    colliders[i].right - colliders[i].left, 
                    colliders[i].bottom - colliders[i].top
                );
            }
    }

    frameNum += 1;
    window.requestAnimationFrame(update);
}

// ---------------------------------------------------- //
// inputs

document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() == "w") {
        if (isJumpDown == "unpressed") {
            isJumpDown = "pressed";
            frameNum = 0;
        }
        isWDown = true;
    } else if (event.key.toLowerCase() == "a") {
        isMoveLeft = true;
        isADown = true;
    } else if (event.key.toLowerCase() == "s") {
        isSDown = true;
    } else if (event.key.toLowerCase() == "d") {
        isMoveRight = true;
        isDDown = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key.toLowerCase() == "w") {
        //isJumpDown = "unpressed";
        isWDown = false;
    } else if (event.key.toLowerCase() == "a") {
        isMoveLeft = false;
        isADown = false;
    } else if (event.key.toLowerCase() == "s") {
        isSDown = false;
    } else if (event.key.toLowerCase() == "d") {
        isMoveRight = false;
        isDDown = false;
    }
});
  
window.requestAnimationFrame(update);
