const COLS = 5;
let slots = [];
function preload() {
    Logo = loadFont('./asset/logo.ttf');
    content = loadFont('./asset/content.otf');
    imgLock = loadImage('./asset/lock.png');
    imgOpen = loadImage('./asset/open.png');
}
class PaletteSlot {
    constructor(idx, w, h) {
        this.w = w;
        this.h = h;
        this.x = idx * w;
        this.y = 0;
        this.locked = false;
        this.color = this.randomColor();//class전용 함수 정의시 이렇게 쓰는듯
    }
    randomColor() {
        return color(random(255), random(255), random(255));
    }
    contains(mx, my) {
        return mx > this.x && mx < this.x + this.w &&
            my > this.y && my < this.y + this.h;
    }

    lockerToggle() {
        this.locked = !this.locked;
    }
    regenerate() {
        if (!this.locked) this.color = this.randomColor();
    }
    display() {
        fill(this.color);
        rect(this.x, this.y, this.w, this.h);
        fill(0, 0, 0, 180);
        textAlign(CENTER, BOTTOM);
        textSize(24);
        textFont(content);
        const hexString = this.color.toString('#rrggbb').substring(1).toUpperCase();
        text(hexString, this.x + this.w / 2, height - 20);

        imageMode(CENTER);
        const icon = this.locked ? imgLock : imgOpen;
        image(icon, this.x + this.w / 2, this.y + this.h / 2, 40, 40);
    }
}
function setup() {
    createCanvas(1920, 1080);
    textFont(content);
    noStroke();
    const slotW = 1600 / COLS;
    const slotH = height;

    for (let i = 0; i < COLS; i++) {
        slots.push(new PaletteSlot(i, slotW, slotH));
    }
}
function draw() {
    background(255);
    for (const s of slots) s.display();
}
function mousePressed() {
    for (const s of slots) {
        if (s.contains(mouseX, mouseY)) {
            s.lockerToggle();
            exportPalette();
            break;
        }
    }
}
function keyPressed() {
    if (keyCode === ENTER || key === ' ') {   // ← 스페이스(공백 문자)도 허용
        for (const s of slots) { s.regenerate(); exportPalette(); }
    }
}
function exportPalette() {
    // 슬롯 색상을 “#A1B2C3” 형식으로 추출
    const hexArr = slots.map(s => s.color.toString('#rrggbb').toUpperCase());
    localStorage.setItem('paletteColors', JSON.stringify(hexArr));
}
