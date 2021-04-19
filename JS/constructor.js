// 要移动元素的构造函数
function SliderObj(animateObj) {
    this.animateObj = animateObj;
}
SliderObj.prototype.animate = function (target, callback) {
    target = Math.round(target * 100);
    // target = target.toFixed(2) * 100;
    // console.log(target)
    let obj = this.animateObj;
    // 清除上一个动画
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        let offsetLeft = Math.round(Math.abs(obj.offsetLeft / obj.parentNode.offsetWidth) * 100);
        let step = (target - offsetLeft) / 10;
        step = step > 0 ? Math.ceil(step) : Math.floor(step);
        // console.log(offsetLeft + '%')
        // console.log(step)
        // console.log(target)
        if (offsetLeft == target) {
            clearInterval(obj.timer);
            obj.timer = null;
            callback && callback();
        }
        obj.style.left = '-' + (offsetLeft + step) + '%';
    }, 20);
}
SliderObj.prototype.clone = function () {
    let arr = this.animateObj.children;
    arr = Array.from(arr);
    let child = arr[0].cloneNode(true);
    this.animateObj.appendChild(child);
}

// 底部按钮
function SliderButton(buttonArr) {
    this.buttonArr = buttonArr;
}
SliderButton.prototype.switch = function (index) {
    let arr = this.buttonArr;
    for (let i = 0; i < arr.length; i++) {
        arr[i].className = '';
    }
    arr[index].className = 'main_slider_switch_current';
}

// 遮罩
// function Create(className) {
//     this.className = className;
// }
// Create.prototype.create = function () {
//     let div = document.createElement('div');
//     div.className = this.className;
//     document.body.appendChild(div);
// }
// Create.prototype.close = function () {
//     thisstyle.display = 'none';
// }

// 建立新元素，返回的对象中含有操作该新元素的方法
function Create(className, parent) {
    this.parent = parent;
    this.className = className;
}
Create.prototype.init = function () {
    let div = document.createElement('div');
    div.className = this.className;
    this.node = div;
    this.parent.appendChild(div);
}
Create.prototype.close = function () {
    this.node.parentNode.removeChild(this.node);
}