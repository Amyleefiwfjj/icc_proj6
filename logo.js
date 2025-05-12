/* ---------- 상수 ---------- */
const TOOL = { SELECT: 'select', CIRCLE: 'circle', RECT: 'rect', TEXT: 'text' };
const HANDLE = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const HANDLE_SIZE = 8, PALETTE_COLS = 5;

/* ---------- 전역 ---------- */
let currentTool = TOOL.SELECT, shapes = [], selected = null;
let drag = false, resize = false, activeHandle = null;

let currentColor = '#007bff';
let fonts = {}, curFontName = '1', curFontSize = 20, curFont;

/* ---------- preload ---------- */
function preload() { for (let i = 1; i <= 6; i++) fonts[i] = loadFont(`fonts/${i}.ttf`); }

/* ---------- setup / resize ---------- */
function setup() {
    createCanvas(windowWidth - 260, windowHeight).parent('canvas-wrap');
    curFont = fonts[curFontName];
    initToolbar();
    buildPalette();            // 🔹 JSON / lastLogo 로딩 제거
}
function windowResized() { resizeCanvas(windowWidth - 260, windowHeight); }

/* ---------- draw ---------- */
function draw() {
    background('#fff');
    shapes.forEach(s => s.display());
    if (selected) { selected.showBorder(); selected.showHandles(); }
}

/* ---------- UI ---------- */
function initToolbar() {
    document.querySelectorAll('[data-tool]')
        .forEach(b => b.onclick = () => setTool(b.dataset.tool));

    fontSelect.onchange = e => setFont(e.target.value);
    fontSize.oninput = e => curFontSize = +e.target.value || 20;

    /* PNG 저장만 유지 */
    savePng.onclick = () => saveCanvas('my-logo', 'png');
}
function setTool(t) {
    currentTool = t;
    document.querySelectorAll('[data-tool]')
        .forEach(b => b.classList.toggle('active', b.dataset.tool === t));
}
function setFont(v) { if (fonts[v]) { curFontName = v; curFont = fonts[v]; } }

/* ---------- palette ---------- */
function buildPalette() {
    /* 필요하다면 localStorage.paletteColors 유지,
       아니라면 randColor()만 사용하면 됩니다. */
    const saved = JSON.parse(localStorage.paletteColors || '[]');
    palette.innerHTML = '';
    for (let i = 0; i < PALETTE_COLS; i++) {
        const col = saved[i] || randColor();
        const s = document.createElement('div');
        s.className = 'slot'; s.style.backgroundColor = col;
        if (i === 0) { s.classList.add('active'); currentColor = col; }
        s.onclick = () => {
            currentColor = col;
            document.querySelectorAll('.slot').forEach(x => x.classList.remove('active'));
            s.classList.add('active'); if (selected) selected.setColor(col);
        };
        palette.appendChild(s);
    }
}
const randColor = () => `rgb(${floor(random(255))},${floor(random(255))},${floor(random(255))})`;

/* ---------- mouse ---------- */
function mousePressed() {
    const hit = [...shapes].reverse().find(s => s.isHovered(mouseX, mouseY));
    if (hit) {
        selected = hit; activeHandle = hit.handleHit(mouseX, mouseY);
        resize = activeHandle !== null; drag = !resize; return;
    }

    if (currentTool === TOOL.SELECT) return;
    if (currentTool === TOOL.TEXT) {
        const txt = prompt('텍스트 입력:', 'Text'); if (!txt) return;
        shapes.push(new Shape(mouseX, mouseY, 0, 0, 'text', txt, currentColor, curFont, curFontSize));
    } else {
        const tp = currentTool === TOOL.CIRCLE ? 'circle' : 'rect';
        shapes.push(new Shape(mouseX, mouseY, 80, 80, tp, '', currentColor));
    }
    selected = shapes.at(-1); setTool(TOOL.SELECT);
}
function mouseDragged() {
    if (!selected) return;
    if (drag) { selected.x = mouseX; selected.y = mouseY; }
    else if (resize) { selected.resizeByHandle(activeHandle, mouseX, mouseY); }
}
function mouseReleased() { drag = resize = false; activeHandle = null; }

/* ---------- Shape (핸들·리사이즈 포함) ---------- */
class Shape {
    constructor(x, y, w, h, type, txt = '', col = '#ccc', font = null, fs = 20) {
        Object.assign(this, { x, y, w, h, type, text: txt, color: col, font, fs });
        if (type === 'text') {
            textFont(font); textSize(fs);
            this.w = textWidth(txt) + 16; this.h = fs + 12;
        }
        if (type === 'circle') this.h = this.w;
    }
    setColor(c) { this.color = c; }
    /* --- render / border / handles --- */
    display() {
        push(); fill(this.color); noStroke();
        if (this.type === 'circle') ellipse(this.x, this.y, this.w, this.h);
        else if (this.type === 'rect') { rectMode(CENTER); rect(this.x, this.y, this.w, this.h); }
        else {
            textFont(this.font); textSize(this.fs); textAlign(CENTER, CENTER);
            text(this.text, this.x, this.y);
        }
        pop();
    }
    showBorder() {
        stroke('#777'); noFill();
        if (this.type === 'circle') ellipse(this.x, this.y, this.w + 4, this.h + 4);
        else rectMode(CENTER), rect(this.x, this.y, this.w + 4, this.h + 4);
    }
    showHandles() {
        if (this.type === 'text') return;
        fill('#0af'); stroke('#047');
        for (const { x, y } of this.getHandles()) rect(x, y, HANDLE_SIZE, HANDLE_SIZE);
    }
    /* --- geom helpers --- */
    left() { return this.x - this.w / 2; } right() { return this.x + this.w / 2; }
    top() { return this.y - this.h / 2; } bottom() { return this.y + this.h / 2; }
    isHovered(mx, my) {
        if (this.type === 'circle') return dist(mx, my, this.x, this.y) < this.w / 2;
        return mx > this.left() && mx < this.right() && my > this.top() && my < this.bottom();
    }
    getHandles() {
        const l = this.left(), r = this.right(), t = this.top(), b = this.bottom(), cx = this.x, cy = this.y;
        return [{ x: l, y: t }, { x: cx, y: t }, { x: r, y: t }, { x: r, y: cy }, { x: r, y: b },
        { x: cx, y: b }, { x: l, y: b }, { x: l, y: cy }];
    }
    handleHit(mx, my) {
        if (this.type === 'text') return null;
        const i = this.getHandles().findIndex(h => abs(mx - h.x) <= HANDLE_SIZE / 2 && abs(my - h.y) <= HANDLE_SIZE / 2);
        return i === -1 ? null : i;
    }
    resizeByHandle(i, mx, my) {
        if (this.type === 'text') return;
        let l = this.left(), r = this.right(), t = this.top(), b = this.bottom();
        switch (HANDLE[i]) {
            case 'nw': l = mx; t = my; break; case 'n': t = my; break; case 'ne': r = mx; t = my; break;
            case 'e': r = mx; break; case 'se': r = mx; b = my; break; case 's': b = my; break;
            case 'sw': l = mx; b = my; break; case 'w': l = mx; break;
        }
        const MIN = 10; this.w = max(MIN, r - l); this.h = max(MIN, b - t);
        if (this.type === 'circle') { const d = max(this.w, this.h); this.w = this.h = d; }
        this.x = (l + r) / 2; this.y = (t + b) / 2;
    }
}
