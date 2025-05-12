let offset = 0;
const STEP = 2;
const GAP_X = 240, GAP_Y = 120;
const ANGLE = Math.PI / 6;
let Logo, content;

// 버튼 위치와 크기 설정
let buttonX, buttonY, buttonW, buttonH;

function preload() {
    Logo = loadFont('./asset/logo.ttf');
    content = loadFont('./asset/content.otf');
}

function setup() {
    createCanvas(1920, 1080);
    textFont('sans-serif');
    textStyle(BOLD);
    noStroke();

    buttonW = 180;
    buttonH = 60;
    buttonX = width / 2 - buttonW / 2;
    buttonY = height * 0.65;
}

function draw() {
    background(255);

    push();
    translate(offset, offset);
    fill(100);
    textSize(64);
    for (let y = -GAP_Y * 2; y < height + GAP_Y * 2; y += GAP_Y) {
        for (let x = -GAP_X * 2; x < width + GAP_X * 2; x += GAP_X) {
            push();
            translate(x, y);
            rotate(ANGLE);
            textFont(Logo);
            text('LOGO', 0, 0);
            pop();
        }
    }
    pop();

    offset = (offset + STEP) % Math.max(GAP_X, GAP_Y);

    fill(0);
    textSize(32);
    textAlign(LEFT, TOP);
    textFont(content);
    text('\n예술적으로\n\n로고를 만들고 싶으시다면?\n\n지금 당장 시작하세요', 360, 60);

    drawButton();
}

function drawButton() {
    fill(0, 0, 0, 40);
    rect(buttonX + 4, buttonY - 150, buttonW, buttonH, 8);

    fill(120);
    rect(buttonX, buttonY - 150, buttonW, buttonH, 8);

    // 버튼 텍스트
    fill(255);
    textSize(28);
    textAlign(CENTER, CENTER);
    text('시작하기', buttonX + buttonW / 2, buttonY + buttonH / 2 - 150);
}

// 마우스 클릭 감지
function mousePressed() {
    if (
        mouseX > buttonX &&
        mouseX < buttonX + buttonW &&
        mouseY > buttonY - 150 &&
        mouseY < buttonY - 150 + buttonH
    ) {
        gotoNextPage();
    }
}

// 페이지 이동 함수
function gotoNextPage() {
    window.location.href = "coolers.html";
}
