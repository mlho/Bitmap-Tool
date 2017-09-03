var prevCursorX, prevCursorY;
var isMouseDown = false;

var c0 = document.getElementById("canvas-0");
var ctx0 = c0.getContext("2d");

var c1 = document.getElementById("canvas-1");
var ctx1 = c1.getContext("2d");
    
function drawGrid(){  
    var j = 0;

    ctx0.strokeStyle = "#2d2d2d";
    ctx0.lineWidth = 1;
    ctx0.beginPath();
    for(var i = 0; i < c0.width; i+=12){
        if(i % 96 == 0){
            j++;
        }

        ctx0.moveTo(i + 0.5 + j, 0);
        ctx0.lineTo(i + 0.5 + j, c0.height);

        if(i < c0.height){
            ctx0.moveTo(0, i + 0.5 + j);
            ctx0.lineTo(c0.width, i + 0.5 + j);
        }
    }
    ctx0.stroke();

    ctx0.strokeStyle = "#383838";
    ctx0.lineWidth = 2;
    ctx0.beginPath();
    for(var k = 0; k < c0.width; k+=96){
        ctx0.moveTo(++k, 0);
        ctx0.lineTo(k, c0.height);

        if(k < c0.height){
            ctx0.moveTo(0, k);
            ctx0.lineTo(c0.width, k);
        }
    }   
    ctx0.stroke();
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
        col: col,
        row: row
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
    }
}

function drawCursor(e, ctx){
    var mPos = getMousePosition(e);
    
    drawCell(ctx, prevCursorX, prevCursorY, "clear");
    drawCell(ctx, mPos.col, mPos.row, "red");

    prevCursorX = mPos.col;
    prevCursorY = mPos.row;
}

function drawRect(ctx, startX, startY, endX, endY, color){
    if(startX > endX){
        var temp = endX;
        endX = startX;
        startX = temp;
    }

    if(startY > endY){
        var temp = endY;
        endY = startY;
        startY = temp;
    }

    for(var i = startX; i <= endX; i++){
        drawCell(ctx, i, startY, color);
        drawCell(ctx, i, endY, color);
    }

    for(var j = startY; j <= endY; j++){
        drawCell(ctx, startX, j, color);
        drawCell(ctx, endX, j, color);
    }
}

function getDistance(x0, y0, x1, y1){
    return Math.floor(Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)));
}

function drawCircle(ctx, startX, startY, endX, endY, color){
    var radius = getDistance(startX, startY, endX, endY); 
    var x = radius;
    var y = 0;
    var xChange = 1 - 2 * radius;
    var yChange = 1;
    var err = 0;

    while(x >= y){
        drawCell(ctx, startX + x, startY + y, color);
        drawCell(ctx, startX + x, startY - y, color);
        drawCell(ctx, startX - x, startY + y, color);
        drawCell(ctx, startX - x, startY - y, color);

        drawCell(ctx, startX + y, startY + x, color);
        drawCell(ctx, startX + y, startY - x, color);
        drawCell(ctx, startX - y, startY + x, color);
        drawCell(ctx, startX - y, startY - x, color);

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
    var startX = mPos.col, startY = mPos.row;
    var prevRectX, prevRectY;

    downDrag(function(e){
        drawRect(ctx1, startX, startY, prevRectX, prevRectY, "clear");
        mPos = getMousePosition(e);
        drawRect(ctx1, startX, startY, mPos.col, mPos.row, "red");

        prevRectX = mPos.col;
        prevRectY = mPos.row;
    }, function(e){
        drawRect(ctx1, startX, startY, prevRectX, prevRectY, "clear");
        drawRect(ctx0, startX, startY, prevRectX, prevRectY, "white");
    });
}

tools.Circle = function(e, ctx){
    var mPos = getMousePosition(e);
    var startX = mPos.col, startY = mPos.row;
    var prevCircleX, prevCircleY;

    downDrag(function(e){
        drawCell(ctx1, startX, startY, "red");
        drawCircle(ctx1, startX, startY, prevCircleX, prevCircleY, "clear");
        mPos = getMousePosition(e);
        drawCircle(ctx1, startX, startY, mPos.col, mPos.row, "red");

        prevCircleX = mPos.col;
        prevCircleY = mPos.row;
    }, function(e){
        drawCell(ctx1, startX, startY, "clear");
        drawCircle(ctx1, startX, startY, prevCircleX, prevCircleY, "clear");
        drawCircle(ctx0, startX, startY, prevCircleX, prevCircleY, "white");
    });
}

c1.addEventListener("mousedown", function(e){
    tools.Rectangle(e, ctx1);
});

c1.addEventListener("mousemove", function(e){
    drawCursor(e, ctx1);
});

drawGrid();