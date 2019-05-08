
function noop () {}

export default class Palette {
    constructor(canvas, {
        drawType = 'line',
        drawColor = 'rgba(19, 206, 102, 1)',
        lineWidth = 5,
        sides = 3,
        allowCallback,
        moveCallback
    }) {
        this.canvas = canvas;
        // canvas 宽 高
        this.width = canvas.width;
        this.height = canvas.height;
        this.paint = canvas.getContext('2d');
        this.isClickCanvas = false; // 是否点击 canvas 内部
        this.isMoveCanvas = false;  // 鼠标是否有移动
        this.imgData = [];          // 存储上一次的图像, 用于撤回
        this.index = 0;             // 记录当前显示的是第几帧
        // 鼠标按下时的 x,y 坐标
        this.x = 0;
        this.y = 0;
        this.last = [this.x, this.y]; // 鼠标按下及每次移动后的坐标
        this.drawType = drawType;     // 绘制形状
        this.drawColor = drawColor;   // 绘制颜色
        this.lineWidth = lineWidth;   // 线条宽度
        this.sides = sides;           // 多边形边数
        this.allowCallback = allowCallback || noop; // 允许操作的回调
        this.moveCallback = moveCallback || noop;   // 鼠标移动的回调
        this.bindMousemove = noop;      // 解决 eventlistener 不能bind
        this.bindMousedown = noop;      // 解决 eventlistener 不能bind
        this.bindMouseup = noop;        // 解决 eventlistener 不能bind
        this.init();
    }

    init() {
        this.paint.fillStyle = '#fff';
        this.paint.fillRect(0, 0, this.width, this.height);
        this.gatherImage(); // 采集图像
        this.bindMousemove = this.onmousemove.bind(this);
        this.bindMousedown = this.onmousedown.bind(this);
        this.bindMouseup = this.onmouseup.bind(this);
        this.canvas.addEventListener('mousedown', this.bindMousedown);
        document.addEventListener('mouseup', this.bindMouseup);
    }
    // 鼠标按下
    onmousedown(e) {
        this.isClickCanvas = true;
        this.x = e.offsetX;
        this.y = e.offsetY;
        this.last = [this.x, this.y]
        this.canvas.addEventListener('mousemove', this.bindMousemove);
    }
    // 采集图像
    gatherImage() { 
        this.imgData = this.imgData.slice(0, this.index + 1); // 每次鼠标抬起时, 将储存的 imgdata 截取至 index 处
        let imgData = this.paint.getImageData(0, 0, this.width, this.height);
        this.imgData.push(imgData);
        this.index = this.imgData.length - 1; // 储存完后将 index 重置为 imgData 最后一位
        this.allowCallback(this.index > 0, this.index < this.imgData.length - 1);
    }
    // 重置为上一帧
    reSetImage() { 
        this.paint.clearRect(0, 0, this.width, this.height);
        if (this.imgData.length >= 1) {
            this.paint.putImageData(this.imgData[this.index], 0, 0);
        }
    }
    // 鼠标移动
    onmousemove(e) {
        this.isMoveCanvas = true;
        let endx = e.offsetX;
        let endy = e.offsetY;
        let width = endx - this.x;
        let height = endy - this.y;
        let now = [endx, endy]; // 当前移动到的位置
        switch (this.drawType) {
            case 'line': {
                let params = [this.last, now, this.lineWidth, this.drawColor];
                this.moveCallback('line', ...params)
                this.line(...params);
            }
                break;
            case 'rect': {
                let params = [this.x, this.y, width, height, this.lineWidth, this.drawColor];
                this.moveCallback('rect', ...params);
                this.rect(...params);
            }
                break;
            case 'polygon': {
                let params = [this.x, this.y, this.sides, width, height, this.lineWidth, this.drawColor];
                this.moveCallback('polygon', ...params)
                this.polygon(...params);
            }
                break;
            case 'arc': {
                let params = [this.x, this.y, width, height, this.lineWidth, this.drawColor];
                this.moveCallback('arc', ...params);
                this.arc(...params);
            }
                break;
            case 'eraser': {
                let params = [endx, endy, this.width, this.height, this.lineWidth];
                this.moveCallback('eraser', ...params);
                this.eraser(...params);
            }
                break;
            default: console.log('drawType: ', this.drawType);
        }
    }
    // 鼠标抬起
    onmouseup() {
        if (this.isClickCanvas) {
            this.isClickCanvas = false;
            this.canvas.removeEventListener('mousemove', this.bindMousemove);
            if (this.isMoveCanvas) { // 鼠标没有移动不保存
                this.isMoveCanvas = false;
                this.moveCallback('gatherImage')
                this.gatherImage();
            }
        }
    }
    // 绘制线形
    line(last, now, lineWidth, drawColor) {
        this.paint.beginPath();
        this.paint.lineCap = 'round'; // 设定线条与线条间接合处的样式
        this.paint.lineJoin = 'round';
        this.paint.lineWidth = lineWidth;
        this.paint.strokeStyle = drawColor;
        this.paint.moveTo(...last);
        this.paint.lineTo(...now);
        this.paint.closePath();
        this.paint.stroke();
        this.last = now;
    }
    // 绘制矩形
    rect(x, y, width, height, lineWidth, drawColor) {
        this.reSetImage();
        this.paint.lineWidth = lineWidth;
        this.paint.strokeStyle = drawColor;
        this.paint.strokeRect(x, y, width, height);
    }
    // 绘制多边形
    polygon(x, y, sides, width, height, lineWidth, drawColor) {
        this.reSetImage();
        let n = sides;
        let ran = 360 / n;
        let rn = Math.sqrt(width ** 2, height ** 2);
        this.paint.beginPath();
        this.paint.strokeStyle = drawColor;
        this.paint.lineWidth = lineWidth;
        for (let i = 0; i < n; i++) {
            this.paint.lineTo(
                x + Math.sin((i * ran + 45) * Math.PI / 180) * rn,
                y + Math.cos((i * ran + 45) * Math.PI / 180) * rn
            );
        }
        this.paint.closePath();
        this.paint.stroke();
    }
    // 绘制圆形
    arc(x, y, width, height, lineWidth, drawColor) {
        this.reSetImage();
        this.paint.beginPath();
        this.paint.lineWidth = lineWidth;
        let r = Math.sqrt(width ** 2 + height **2);
        this.paint.arc(x, y, r, 0, Math.PI * 2, false);
        this.paint.strokeStyle = drawColor;
        this.paint.closePath();
        this.paint.stroke();
    }
    // 橡皮擦
    eraser(endx, endy, width, height, lineWidth) {
        this.paint.save();
        this.paint.beginPath();
        this.arc(endx, endy, lineWidth / 2, 0, 2 * Math.PI);
        this.paint.closePath();
        this.paint.clip();
        this.paint.clearRect(0, 0, width, height);
        this.paint.fillStyle = '#fff';
        this.paint.fillRect(0, 0, width, height);
        this.paint.restore();
    }
    // 撤回
    cancel() {
        if (--this.index < 0) {
            this.index = 0;
            return;
        }
        this.allowCallback(this.index > 0, this.index < this.imgData.length - 1);
        this.paint.putImageData(this.imgData[this.index], 0, 0);
    }
    // 前进
    go() {
        if (++this.index > this.imgData.length - 1) {
            this.index = this.imgData.length - 1;
            return;
        }
        this.allowCallback(this.index > 0, this.index < this.imgData.length - 1);
        this.paint.putImageData(this.imgData[this.index], 0, 0);
    }
    // 清屏
    clear() {
        this.imgData = [];
        this.paint.clearRect(0, 0, this.width, this.heght);
        this.paint.fillStyle = '#fff';
        this.paint.fillRect(0, 0, this.width, this.height);
        this.gatherImage();
    }
    // 绘制条件
    changeWay({type, color, lineWidth, sides}) {
        this.drawType = type !== 'color' && type || this.drawType; // 绘制形状
        this.drawColor = color || this.drawColor; // 绘制颜色
        this.lineWidth = lineWidth || this.lineWidth; // 线宽
        this.sides = sides || this.sides; // 边数
    }
    destroy() {
        this.clear();
        this.canvas.removeEventListener('mousedown', this.bindMousedown);
        document.removeEventListener('mouseup', this.bindMouseup);
        this.canvas = null;
        this.paint = null;
    }
}