/* ----------------- constants ----------------- */
const TOOL = { SELECT: 'select', CIRCLE: 'circle', RECT: 'rect', TEXT: 'text' };
const PALETTE_COLS = 5;

/* ----------------- state ----------------- */
let currentTool = TOOL.SELECT;
let shapes = [];
let selectedShape = null;
let currentColor = '#007bff';

let fonts = {}, currentFontName = '1', currentFontSize = 20, currentFont;

/* ----------------- preload fonts ----------------- */
function preload() {
    for (let i = 1; i <= 6; i++) fonts[i] = loadFont(`fonts/${i}.ttf`);
}

/* ----------------- setup ----------------- */
function setup() {
    const w = windowWidth - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--toolbar-w'));
    createCanvas(w, windowHeight).parent('canvas-container');
    currentFont = fonts[currentFontName];
    initToolbar();
    buildPalette();
}
function windowResized() {
    const w = windowWidth - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--toolbar-w'));
    resizeCanvas(w, windowHeight);
}

/* ----------------- drawing loop ----------------- */
function draw() {
    background(255);
    shapes.forEach(s => s.display());
    if (selectedShape) selectedShape.showBorder();
}

/* ----------------- toolbar logic ----------------- */
function initToolbar() {
    document.querySelectorAll('#toolbar .btn[data-tool]').forEach(btn => {
        btn.onclick = () => setTool(btn.dataset.tool);
    });
    document.getElementById('fontSelect').onchange = e => setFont(e.target.value);
    document.getElementById('fontSize').oninput = e => currentFontSize = +e.target.value || 20;
}
function setTool(t) {
    currentTool = t;
    document.querySelectorAll('#toolbar .btn[data-tool]')
        .forEach(b => b.classList.toggle('active', b.dataset.tool === t));
}
function setFont(name) { if (fonts[name]) { currentFontName = name; currentFont = fonts[name]; } }

/* ----------------- palette ----------------- */
function buildPalette() {
    const saved = JSON.parse(localStorage.getItem('paletteColors') || '[]');
    const pallet = document.getElementById('palette'); pallet.innerHTML = '';
    for (let i = 0; i < PALETTE_COLS; i++) {
        const col = saved[i] || randomColor();
        const slot = document.createElement('div');
        slot.className = 'slot'; slot.style.backgroundColor = col;
        if (i === 0) { slot.classList.add('active'); currentColor = col; }
        slot.onclick = () => {
            currentColor = col;
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('active'));
            slot.classList.add('active');
            if (selectedShape) selectedShape.setColor(col);
        };
        pallet.appendChild(slot);
    }
}
const randomColor = () => `rgb(${floor(random(255))},${floor(random(255))},${floor(random(255))})`;

/* ----------------- mouse ----------------- */
function mousePressed() {
    const hit = [...shapes].reverse().find(s => s.isHovered(mouseX, mouseY));
    if (hit) { selectedShape = hit; return; }
    if (currentTool === TOOL.SELECT) return;

    if (currentTool === TOOL.TEXT) {
        const txt = prompt('텍스트 입력:', 'Text'); if (!txt) return;
        shapes.push(new Shape(mouseX, mouseY, 0, 0, 'text', txt, currentColor, currentFont, currentFontSize));
    } else {
        shapes.push(new Shape(mouseX, mouseY, 80, 80, currentTool, '', currentColor));
    }
}
function mouseDragged() { if (selectedShape) { selectedShape.x = mouseX; selectedShape.y = mouseY; } }

/* ----------------- shape ----------------- */
class Shape {
    constructor(x, y, w, h, type, txt = '', col = '#000', font = null, fsize = 20) {
        this.x = x; this.y = y; this.type = type; this.text = txt; this.color = col; this.font = font; this.fsize = fsize;
        if (type === 'text') {
            textFont(this.font); textSize(this.fsize);
            this.w = textWidth(this.text) + 16; this.h = this.fsize + 12;
        } else {
            this.w = this.h = w || 80;
        }
    }
    setColor(c) { this.color = c; }
    display() {
        push(); fill(this.color); noStroke();
        if (this.type === 'circle') ellipse(this.x, this.y, this.w, this.h);
        else if (this.type === 'rect') { rectMode(CENTER); rect(this.x, this.y, this.w, this.h); }
        else { textFont(this.font); textSize(this.fsize); textAlign(CENTER, CENTER); text(this.text, this.x, this.y); }
        pop();
    }
    showBorder() { stroke('#495057'); noFill(); rectMode(CENTER); rect(this.x, this.y, this.w + 4, this.h + 4); }
    isHovered(mx, my) {
        if (this.type === 'circle') return dist(mx, my, this.x, this.y) < this.w / 2;
        if (this.type === 'rect') return mx > this.x - this.w / 2 && mx < this.x + this.w / 2 && my > this.y - this.h / 2 && my < this.y + this.h / 2;
        return dist(mx, my, this.x, this.y) < max(this.w, this.h);
    }
}
