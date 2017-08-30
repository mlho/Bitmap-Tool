var prevCursorX;
var prevCursorY;

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

function pencil(e, ctx){
    var mPos = getMousePosition(e)
    drawCell(ctx, mPos.col, mPos.row, "white");
}

c1.addEventListener("click", function(e){
    pencil(e, ctx0);
}, false);

c1.addEventListener("mousemove", function(e){
    drawCursor(e, ctx1);
}, false);

drawGrid();