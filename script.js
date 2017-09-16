var prevCursorX, prevCursorY;
var isMouseDown = false;
var SCREEN_WIDTH = 128;
var SCREEN_HEIGHT = 64;
var bitmap = [];
var bigEndian = false;
var verticalByte = false;

var c0 = document.getElementById("canvas-0");
var ctx0 = c0.getContext("2d");

var c1 = document.getElementById("canvas-1");
var ctx1 = c1.getContext("2d");
 
function initBitmap(){
    for(var i = 0; i < SCREEN_HEIGHT; i++){
        var arr = new Array(SCREEN_WIDTH);
        arr.fill(0);
        bitmap.push(arr);
    }
}

function clearCanvas(ctx){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawBitmap(ctx){
    clearCanvas(ctx);
    
    for(var r = 0; r < SCREEN_HEIGHT; r++){
        for(var c = 0; c < SCREEN_WIDTH; c++){
            if(bitmap[r][c] === 1){
                drawCell(ctx, c, r, "white");
            }
        }
    }    
}

function clearBitmap(){
    bitmap = [];
    initBitmap();
}

function invertBitmapColor(){
    for(var r = 0; r < SCREEN_HEIGHT; r++){
        for(var c = 0; c < SCREEN_WIDTH; c++){
            bitmap[r][c] = bitmap[r][c] ? 0 : 1;  
        }
    }
}

function convertBitmapToHex(){
    var hexmap = [];

    for(var r = 0; r < SCREEN_HEIGHT;){
        for(var c = 0; c < SCREEN_WIDTH;){
            var bin = "";
            
            if(verticalByte){
                for(var i = r + 7; i >= r; i--){
                    bin += bitmap[i][c];
                }
            }
            else{
                for(var i = c; i < c + 8; i++){
                    bin += bitmap[r][i];
                }
            }

            if(bigEndian){
                bin = bin.split('').reverse().join('');
            }

            var hex = parseInt(bin, 2).toString(16);
            hexmap.push(parseInt(bin, 2) < 16 ? "0x0" + hex : "0x" + hex);

            verticalByte ? c++ : c += 8;
        }
        verticalByte ? r += 8 : r++;
    }
    
    return hexmap;
}

function convertHexmapToBitmap(hexmap){
    var arr = hexmap.split(',');
    var index = 0;

    clearBitmap();

    for(var r = 0; r < SCREEN_HEIGHT;){
        for(var c = 0; c < SCREEN_WIDTH;){
            var bin = parseInt(arr[index++].trim(), 16).toString(2);
            var padbin = "00000000".substring(0, 8 - bin.length) + bin;

            if(bigEndian){
                padbin = padbin.split('').reverse().join('');
            }
            
            if(verticalByte){
                for(var i = 7, j = 0; i >= 0; i--, j++){
                    bitmap[r + j][c] = parseInt(padbin.charAt(i));
                }
            }
            else{
                for(var i = 0; i < 8; i++){
                    bitmap[r][c + i] = parseInt(padbin.charAt(i));
                }
            }

            verticalByte ? c++ : c += 8;
        }
        verticalByte ? r += 8 : r++;
    }
}

function prettyPrint(hexmap){
    var str = "";

    for(var i = 0; i < hexmap.length; i++){
        if(i != 0 && i % 16 == 0){
            str += "\n";
        }
        
        str += hexmap[i];

        if(i != hexmap.length - 1){
            str += ",";
        }
    }

    return str;
}

function drawGrid(ctx){  
    var j = 0;

    ctx.strokeStyle = "#2d2d2d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(var i = 0; i < ctx.canvas.width; i+=12){
        if(i % 96 == 0){
            j++;
        }

        ctx.moveTo(i + 0.5 + j, 0);
        ctx.lineTo(i + 0.5 + j, ctx.canvas.height);

        if(i < ctx.canvas.height){
            ctx.moveTo(0, i + 0.5 + j);
            ctx.lineTo(ctx.canvas.width, i + 0.5 + j);
        }
    }
    ctx.stroke();

    ctx.strokeStyle = "#383838";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(var k = 0; k < ctx.canvas.width; k+=96){
        ctx.moveTo(++k, 0);
        ctx.lineTo(k, ctx.canvas.height);

        if(k < ctx.canvas.height){
            ctx.moveTo(0, k);
            ctx.lineTo(ctx.canvas.width, k);
        }
    }   
    ctx.stroke();
}

function getMousePosition(e){
    var rect = c0.getBoundingClientRect();

    var mouseX = Math.floor(e.clientX) - Math.floor(rect.left) - 2;
    var mouseY = Math.floor(e.clientY) - Math.floor(rect.top) - 2;

    var blockX = Math.floor(mouseX / 97);
    var blockY = Math.floor(mouseY / 97);

    var col = Math.floor((mouseX - blockX) / 12);
    var row = Math.floor((mouseY - blockY) / 12);

    return {
        col: Math.max(0, Math.min(col, 127)),
        row: Math.max(0, Math.min(row, 63))
    }
}

function drawCell(ctx, col, row, color){
    var blockX = Math.floor(col / 8);
    var blockY = Math.floor(row / 8);

    var x = (col * 12) + 2 + blockX;
    var y = (row * 12) + 2 + blockY;   

    if(color === "clear"){
        ctx.clearRect(x, y, 11, 11);
    }
    else{
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 11, 11);

        if(color === "white" && (col <= 127 && col >= 0) && (row <= 63 && row >= 0)){
            bitmap[row][col] = 1;
        }
    }
}

function drawCursor(e, ctx){
    var mPos = getMousePosition(e);
    
    drawCell(ctx, prevCursorX, prevCursorY, "clear");
    drawCell(ctx, mPos.col, mPos.row, "red");

    prevCursorX = mPos.col;
    prevCursorY = mPos.row;
}

function drawRect(ctx, x0, y0, x1, y1, color){
    if(x0 > x1){
        var temp = x1;
        x1 = x0;
        x0 = temp;
    }

    if(y0 > y1){
        var temp = y1;
        y1 = y0;
        y0 = temp;
    }

    for(var i = x0; i <= x1; i++){
        drawCell(ctx, i, y0, color);
        drawCell(ctx, i, y1, color);
    }

    for(var j = y0; j <= y1; j++){
        drawCell(ctx, x0, j, color);
        drawCell(ctx, x1, j, color);
    }
}

function getDistance(x0, y0, x1, y1){
    return Math.floor(Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)));
}

function drawCircle(ctx, x0, y0, x1, y1, color){
    var radius = getDistance(x0, y0, x1, y1); 
    var x = radius;
    var y = 0;
    var xChange = 1 - 2 * radius;
    var yChange = 1;
    var err = 0;

    while(x >= y){
        drawCell(ctx, x0 + x, y0 + y, color);
        drawCell(ctx, x0 + x, y0 - y, color);
        drawCell(ctx, x0 - x, y0 + y, color);
        drawCell(ctx, x0 - x, y0 - y, color);

        drawCell(ctx, x0 + y, y0 + x, color);
        drawCell(ctx, x0 + y, y0 - x, color);
        drawCell(ctx, x0 - y, y0 + x, color);
        drawCell(ctx, x0 - y, y0 - x, color);

        y++;
        err+= yChange;
        yChange += 2;

        if(2 * err + xChange > 0){
            x--;
            err+= xChange;
            xChange += 2;
        }
    }
}

function drawLine(ctx, x0, y0, x1, y1, color){ 
    var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
    if(steep){
        var t = x0; x0 = y0; y0 = t;
        var t = x1; x1 = y1; y1 = t;
    }

    var dx = x1 - x0;
    var dy = y1 - y0;
    var stepX = 1;
    var stepY = 1;   

    if(dx < 0){
        dx = -dx;
        stepX = -1;
    }

    if(dy < 0){
        dy = -dy;
        stepY = -1;
    }

    var f = 2 * dy - dx;
    for(; x0 < x1 || x0 > x1; x0 += stepX){
        steep ? drawCell(ctx, y0, x0, color) : drawCell(ctx, x0, y0, color);

        if(f >= 0){
            y0 += stepY;
            f -= 2 * dx;
        }
        f += 2 * dy;
    }

    steep ? drawCell(ctx, y0, x0, color) : drawCell(ctx, x0, y0, color);
}

function pencil(e, ctx){
    var mPos = getMousePosition(e)
    drawCell(ctx, mPos.col, mPos.row, "white");
}

function downDrag(onMove, onUp){
    function end(e){
        removeEventListener("mousemove", onMove);
        removeEventListener("mouseup", end);
        if(onUp){
            onUp(e);
        }
    }

    addEventListener("mousemove", onMove);
    addEventListener("mouseup", end);
}

var tools = {};

tools.Rectangle = function(e, ctx){
    var mPos = getMousePosition(e);
    var x0 = mPos.col, y0 = mPos.row;
    var prevRectX, prevRectY;

    downDrag(function(e){
        drawRect(ctx1, x0, y0, prevRectX, prevRectY, "clear");
        mPos = getMousePosition(e);
        drawRect(ctx1, x0, y0, mPos.col, mPos.row, "red");

        prevRectX = mPos.col;
        prevRectY = mPos.row;
    }, function(e){
        drawRect(ctx1, x0, y0, prevRectX, prevRectY, "clear");
        drawRect(ctx0, x0, y0, prevRectX, prevRectY, "white");
    });
}

tools.Circle = function(e, ctx){
    var mPos = getMousePosition(e);
    var x0 = mPos.col, y0 = mPos.row;
    var prevCircleX, prevCircleY;

    downDrag(function(e){
        drawCell(ctx1, x0, y0, "red");
        drawCircle(ctx1, x0, y0, prevCircleX, prevCircleY, "clear");
        mPos = getMousePosition(e);
        drawCircle(ctx1, x0, y0, mPos.col, mPos.row, "red");

        prevCircleX = mPos.col;
        prevCircleY = mPos.row;
    }, function(e){
        drawCell(ctx1, x0, y0, "clear");
        drawCircle(ctx1, x0, y0, prevCircleX, prevCircleY, "clear");
        drawCircle(ctx0, x0, y0, prevCircleX, prevCircleY, "white");
    });
}

tools.Line = function(e, ctx){
    var mPos = getMousePosition(e);
    var x0 = mPos.col, y0 = mPos.row;
    var prevX, prevY;

    downDrag(function(e){
        drawLine(ctx1, x0, y0, prevX, prevY, "clear");
        mPos = getMousePosition(e);
        drawLine(ctx1, x0, y0, mPos.col, mPos.row, "red");

        prevX = mPos.col;
        prevY = mPos.row;
    }, function(e){
        drawLine(ctx1, x0, y0, prevX, prevY, "clear");
        drawLine(ctx0, x0, y0, prevX, prevY, "white");
    });
}

var activeTool = "Rectangle";
c1.addEventListener("mousedown", function(e){
    tools[activeTool](e, ctx1);
    e.preventDefault();
});

c1.addEventListener("mousemove", function(e){
    drawCursor(e, ctx1);
});

document.getElementById("circle-tool-btn").addEventListener("click", function(e){
    activeTool = "Circle";
});

document.getElementById("rectangle-tool-btn").addEventListener("click", function(e){
    activeTool = "Rectangle";
});

document.getElementById("line-tool-btn").addEventListener("click", function(e){
    activeTool = "Line";
});

document.getElementById("clear-btn").addEventListener("click", function(e){
    clearBitmap();
    clearCanvas(ctx0);
});

document.getElementById("invert-btn").addEventListener("click", function(e){
    invertBitmapColor();
    drawBitmap(ctx0);
});

document.getElementById("read-btn").addEventListener("click", function(e){
    var input = document.getElementById("textarea").value;
    convertHexmapToBitmap(input);
    drawBitmap(ctx0);
});

document.getElementById("write-btn").addEventListener("click", function(e){
    var hexmap = convertBitmapToHex();
    document.getElementById("textarea").value = prettyPrint(hexmap);
});

document.getElementById("little-endian-btn").addEventListener("click", function(e){
    bigEndian = false;
});

document.getElementById("big-endian-btn").addEventListener("click", function(e){
    bigEndian = true;
});

document.getElementById("horizontal-btn").addEventListener("click", function(e){
    verticalByte = false;
});

document.getElementById("vertical-btn").addEventListener("click", function(e){
    verticalByte = true;
});


initBitmap();
drawGrid(ctx1);