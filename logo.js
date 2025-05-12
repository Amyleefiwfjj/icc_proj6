let shapes = [];
let selectedShape = null;
let shapeType = 'circle';

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvas-container');
}

function draw() {
    background(255);
    shapes.forEach(shape => shape.display());
    if (selectedShape) selectedShape.showBorder();
}

window.selectShape = function (type) {
    shapeType = type;
}
function mousePressed() {
    if (shapeType) {
        let shape = new Shape(mouseX, mouseY, 50, shapeType);
        shapes.push(shape);
        selectedShape = shape;
    } else {
        selectedShape = shapes.find(s => s.isHovered(mouseX, mouseY));
    }
}

class Shape {
    constructor(x, y, size, type) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.type = type;
    }

    display() {
        fill(100, 150, 200);
        noStroke();
        if (this.type === 'circle') ellipse(this.x, this.y, this.size);
        if (this.type === 'rectangle') rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }

    showBorder() {
        stroke(0);
        noFill();
        if (this.type === 'circle') ellipse(this.x, this.y, this.size + 4);
        if (this.type === 'rectangle') rect(this.x - this.size / 2 - 2, this.y - this.size / 2 - 2, this.size + 4, this.size + 4);
    }

    isHovered(mx, my) {
        if (this.type === 'circle') return dist(mx, my, this.x, this.y) < this.size / 2;
        if (this.type === 'rectangle') return mx > this.x - this.size / 2 && mx < this.x + this.size / 2 && my > this.y - this.size / 2 && my < this.y + this.size / 2;
    }
}