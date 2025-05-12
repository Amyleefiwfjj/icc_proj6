const TOOL = { SELECT: 'select', CIRCLE: 'circle', RECT: 'rect', TEXT: 'text' };
const HANDLE = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']; // 8개
const HANDLE_SIZE = 8;

let currentTool = TOOL.SELECT;
let shapes = [];
let selectedShape = null;
let isDragging = false;
let isResizing = false;
let activeHandle = null;
let fonts = {};
let currentFontName = 'Sans';
let currentFont;

function preload(){
    fonts['1'] = loadFont('');
    fonts['1'] = loadFont('');
    fonts['1'] = loadFont('');
    fonts['1'] = loadFont('');
    fonts['1'] = loadFont('');
    fonts['1'] = loadFont('');
}
document.querySelectorAll('#toolbar .btn').forEach(btn => {
    btn.onclick = () => setTool(btn.dataset.tool);
});
function setTool(t) {
    currentTool = t;
    document.querySelectorAll('#toolbar .btn')
        .forEach(b => b.classList.toggle('active', b.dataset.tool === t));
}
function keyPressed() {
    if (key === 'v' || key === 'V') setTool(TOOL.SELECT);
    if (key === 'c' || key === 'C') setTool(TOOL.CIRCLE);
    if (key === 'r' || key === 'R') setTool(TOOL.RECT);
    if (key === 't' || key === 'T') setTool(TOOL.TEXT);
}

function setup() {
    createCanvas(800, 600).parent('canvas-container');
}
function draw() {
    background(255);
    shapes.forEach(s => s.display());
    if (selectedShape) {
        selectedShape.showBorder();
        selectedShape.showHandles();
    }
    cursor(isResizing ? MOVE : (currentTool === TOOL.SELECT ? ARROW : CROSS));
}

function mousePressed() {
    const clicked = [...shapes].reverse().find(s => s.isHovered(mouseX, mouseY));
    if (clicked) {
        selectedShape = clicked;
        activeHandle = selectedShape.handleHit(mouseX, mouseY);

        if (activeHandle !== null) {
            isResizing = true;
        } else {
            isDragging = true;
        }
        return;   // 여기서 끝
    }

    /* B) 빈 공간을 클릭했는데, 그리기 툴이 켜져 있으면 새 도형 생성 */
    if (currentTool !== TOOL.SELECT) {
        const tp = currentTool === TOOL.CIRCLE ? 'circle'
            : currentTool === TOOL.RECT ? 'rect'
                : 'text';
        if (tp === 'text') {
            const txt = prompt('삽입할 글자를 입력하세요:', 'Text');
            if (!txt) return;                 // 취소 시 무시
            const shp = new Shape(mouseX, mouseY, 0, 0, tp, txt);
            shapes.push(shp);
            selectedShape = shp;
            setTool(TOOL.SELECT);
            return;
        }
        const shp = new Shape(mouseX, mouseY, 80, 80, tp);
        shapes.push(shp);
        selectedShape = shp;

        setTool(TOOL.SELECT);     // 새로 그린 뒤 자동으로 선택 툴로 전환
    }
}


function mouseDragged() {
    if (!selectedShape) return;

    if (isDragging) {
        selectedShape.x = mouseX;
        selectedShape.y = mouseY;
    }
    else if (isResizing && activeHandle !== null) {
        selectedShape.resizeByHandle(activeHandle, mouseX, mouseY);
    }
}

function mouseReleased() {
    isDragging = false;
    isResizing = false;
    activeHandle = null;
}

/* --------- 도형 클래스 --------- */
class Shape {
    constructor(x, y, w, h, type, textContent = '') {
        this.x = x; this.y = y;  // 중심
        this.w = w; this.h = h;  // 폭, 높이
        this.type = type;      // 'circle' 또는 'rect'
        this.text = textContent;
        if (this.type === 'text') {
            textSize(20);
            this.w = textWidth(this.text) + 12;
            this.h = 28;
        }
    }

    /* 도형 본체 */
    display() {
        push();
        fill(100, 150, 200); noStroke();
        if (this.type === 'circle') {
            fill(100, 150, 200); noStroke();
            ellipse(this.x, this.y, this.w);
        } else if (this.type === 'rect') {
            fill(100, 150, 200); noStroke();
            rectMode(CORNER);
            rect(this.left(), this.top(), this.w, this.h);
        } else {
            fill(0); noStroke();
            textAlign(CENTER, CENTER);
            textSize(20);
            text(this.text, this.x, this.y);
        }
        pop();
    }

    /* 테두리 */
    showBorder() {
        push();
        stroke(0); noFill();
        if (this.type === 'circle') {
            ellipse(this.x, this.y, this.w + 4);
        } else if (this.type === 'rect') {
            rectMode(CORNER);
            rect(this.left() - 2, this.top() - 2, this.w + 4, this.h + 4);
        } else {
            rectMode(CORNER);
            rect(this.left() - 2, this.top() - 2, this.w + 4, this.h + 4);
        }
        pop();
    }

    /* 핸들 */
    showHandles() {
        push();
        rectMode(CENTER);
        fill(255); stroke(0);
        if (this.type !== 'text') {
            this.getHandles().forEach(({ x, y }) =>
                rect(x, y, HANDLE_SIZE, HANDLE_SIZE)
            );
        } pop();
    }


    /* --- 위치 계산 --- */
    left() { return this.x - this.w / 2; }
    right() { return this.x + this.w / 2; }
    top() { return this.y - this.h / 2; }
    bottom() { return this.y + this.h / 2; }

    /* --- Hit-test --- */
    isHovered(mx, my) {
        if (this.type === 'circle')
            return dist(mx, my, this.x, this.y) < this.w / 2;
        return mx > this.left() && mx < this.right() && my > this.top() && my < this.bottom();
    }
    getHandles() {
        const l = this.left(), r = this.right(), t = this.top(), b = this.bottom(), cX = this.x, cY = this.y;

        if (this.type === 'text') return [];
        return [
            { x: l, y: t },         // nw
            { x: cX, y: t },        // n
            { x: r, y: t },         // ne
            { x: r, y: cY },        // e
            { x: r, y: b },         // se
            { x: cX, y: b },        // s
            { x: l, y: b },         // sw
            { x: l, y: cY },        // w
        ];
    }
    handleHit(mx, my) {
        const idx = this.getHandles().findIndex(
            h => abs(mx - h.x) <= HANDLE_SIZE / 2 && abs(my - h.y) <= HANDLE_SIZE / 2
        );
        return idx === -1 ? null : idx;
    }


    /* --- 리사이즈 --- */
    resizeByHandle(idx, mx, my) {
        if (this.type === 'text') return;
        let l = this.left(), r = this.right(), t = this.top(), b = this.bottom();
        // 좌표에 따라 해당 변 조정
        switch (HANDLE[idx]) {
            case 'nw': l = mx; t = my; break;
            case 'n': t = my; break;
            case 'ne': r = mx; t = my; break;
            case 'e': r = mx; break;
            case 'se': r = mx; b = my; break;
            case 's': b = my; break;
            case 'sw': l = mx; b = my; break;
            case 'w': l = mx; break;
        }
        // 최소 크기 제한
        const MIN = 10;
        this.w = max(MIN, r - l);
        this.h = max(MIN, b - t);
        // 원 ⇒ 정비례로 유지
        if (this.type === 'circle') {
            const d = max(this.w, this.h);
            this.w = this.h = d;
            // 원은 중심 기준만 이동
            this.x = (l + r) / 2;
            this.y = (t + b) / 2;
        } else {
            // 사각형은 bbox 기준
            this.x = (l + r) / 2;
            this.y = (t + b) / 2;
        }
    }
}
