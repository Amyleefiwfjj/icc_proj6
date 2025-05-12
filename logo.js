/* ----------------- 툴 상태 ----------------- */
const TOOL = { SELECT: 'select', CIRCLE: 'circle', RECT: 'rect' };
let currentTool = TOOL.SELECT;

const shapes = [];
let selectedShape = null;
let isDragging = false;
let isResizing = false;

/* ---------- 툴바(버튼) 이벤트 ---------- */
document.querySelectorAll('#toolbar .btn').forEach(btn => {
    btn.onclick = () => setTool(btn.dataset.tool);
});
function setTool(t) {
    currentTool = t;
    document.querySelectorAll('#toolbar .btn')
        .forEach(b => b.classList.toggle('active', b.dataset.tool === t));
}

/* ---------- 단축키 ---------- */
function keyPressed() {
    if (key === 'v' || key === 'V') setTool(TOOL.SELECT);
    if (key === 'c' || key === 'C') setTool(TOOL.CIRCLE);
    if (key === 'r' || key === 'R') setTool(TOOL.RECT);
}

/* ---------- p5.js 기본 ---------- */
function setup() {
    createCanvas(800, 600).parent('canvas-container');
}
function draw() {
    background(255);
    shapes.forEach(s => s.display());
    if (selectedShape) selectedShape.showBorder();
    cursor(currentTool === TOOL.SELECT ? ARROW : CROSS);
}

/* ---------- 마우스 ---------- */
function mousePressed() {
    /* Shift + 경계 → 리사이즈 시작 */
    if (selectedShape && keyIsDown(SHIFT) && selectedShape.isOnBorder(mouseX, mouseY)) {
        isResizing = true; return;
    }
    /* 선택 툴: hit-test → 이동 */
    if (currentTool === TOOL.SELECT) {
        selectedShape = shapes.find(s => s.isHovered(mouseX, mouseY));
        if (selectedShape) { isDragging = true; return; }
    }
    /* 그리기 툴: 새 도형 */
    if (currentTool !== TOOL.SELECT) {
        const type = currentTool === TOOL.CIRCLE ? 'circle' : 'rect';
        const s = new Shape(mouseX, mouseY, 50, type);
        shapes.push(s); selectedShape = s;
        // setTool(TOOL.SELECT);  // ← 필요하면 자동 선택툴로 복귀
    }
}
function mouseDragged() {
    if (!selectedShape) return;
    if (isDragging) { selectedShape.x = mouseX; selectedShape.y = mouseY; }
    else if (isResizing) { selectedShape.resize(mouseX, mouseY); }
}
function mouseReleased() { isDragging = false; isResizing = false; }

/* ---------- 도형 클래스 ---------- */
class Shape {
    constructor(x, y, size, type) { this.x = x; this.y = y; this.size = size; this.type = type; }
    /* 렌더 */
    display() {
        fill(100, 150, 200); noStroke();
        if (this.type === 'circle') ellipse(this.x, this.y, this.size);
        else rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }
    showBorder() {
        stroke(0); noFill();
        if (this.type === 'circle') ellipse(this.x, this.y, this.size + 4);
        else rect(this.x - this.size / 2 - 2, this.y - this.size / 2 - 2, this.size + 4, this.size + 4);
    }
    /* hit-test */
    isHovered(mx, my) {
        if (this.type === 'circle') return dist(mx, my, this.x, this.y) < this.size / 2;
        return mx > this.x - this.size / 2 && mx < this.x + this.size / 2 &&
            my > this.y - this.size / 2 && my < this.y + this.size / 2;
    }
    isOnBorder(mx, my) {
        if (!this.isHovered(mx, my)) return false;
        if (this.type === 'circle')
            return abs(dist(mx, my, this.x, this.y) - this.size / 2) < 4;
        const l = this.x - this.size / 2, r = this.x + this.size / 2, t = this.y - this.size / 2, b = this.y + this.size / 2;
        return abs(mx - l) < 4 || abs(mx - r) < 4 || abs(my - t) < 4 || abs(my - b) < 4;
    }
    /* 리사이즈 */
    resize(mx, my) {
        if (this.type === 'circle') {
            this.size = constrain(2 * dist(mx, my, this.x, this.y), 10, 400);
        } else {
            const half = max(abs(mx - this.x), abs(my - this.y));
            this.size = constrain(2 * half, 10, 400);
        }
    }
}
