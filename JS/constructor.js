// 要移动元素的构造函数
function SliderObj(animateObj) {
    this.animateObj = animateObj;
}
SliderObj.prototype.animate = function (target, callback) {
    // console.log(target)
    target = Math.floor(target * 100);
    // target = (target * 100);
    // target = target.toFixed(1);
    // console.log(target)
    let obj = this.animateObj;
    // // 清除上一个动画
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        let offsetLeft = Math.round(Math.abs(obj.offsetLeft / obj.parentNode.offsetWidth) * 100);
        // let offsetLeft = parseFloat(Math.abs((obj.offsetLeft / obj.parentNode.offsetWidth) * 100).toFixed(1));
        // console.log(offsetLeft)
        // let step = parseFloat(((target - offsetLeft) / 10));
        let step = (target - offsetLeft) / 10;
        step = step > 0 ? Math.ceil(step) : Math.floor(step);
        // console.log(offsetLeft + '%')
        // console.log(step)
        // console.log(target)
        // console.log(offsetLeft + 0.9)
        if (offsetLeft == target) {
            // obj.style.left = '-' + target + '%';
            clearInterval(obj.timer);
            obj.timer = null;
            callback && callback();
        }
        obj.style.left = '-' + (offsetLeft + step) + '%';


    }, 20);
}
SliderObj.prototype.clone = function () {
    let arr = this.animateObj.children;
    let child = arr[0].cloneNode(true);
    console.log(child);
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
