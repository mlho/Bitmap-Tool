var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
    
function drawGrid(){  
    var j = 0;

    ctx.strokeStyle = "#2d2d2d";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(var i = 0; i < c.width; i+=12){
        if(i % 96 == 0){
            j++;
        }

        ctx.moveTo(i + 0.5 + j, 0);
        ctx.lineTo(i + 0.5 + j, c.height);

        if(i < c.height){
            ctx.moveTo(0, i + 0.5 + j);
            ctx.lineTo(c.width, i + 0.5 + j);
        }
    }
    ctx.stroke();

    ctx.strokeStyle = "#383838";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(var k = 0; k < c.width; k+=96){
        ctx.moveTo(++k, 0);
        ctx.lineTo(k, c.height);

        if(k < c.height){
            ctx.moveTo(0, k);
            ctx.lineTo(c.width, k);
        }
    }   
    ctx.stroke();
}

function getMousePosition(e){
    var rect = c.getBoundingClientRect();

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

function drawCell(col, row, color){
    var blockX = Math.floor(col / 8);
    var blockY = Math.floor(row / 8);

    var x = (col * 12) + 2 + blockX;
    var y = (row * 12) + 2 + blockY;   

    ctx.fillStyle = color;
    ctx.fillRect(x, y, 11, 11);
}

function pencil(e){
    var mPos = getMousePosition(e)
    drawCell(mPos.col, mPos.row, "white");
}

c.addEventListener("click", pencil, false);

drawGrid();