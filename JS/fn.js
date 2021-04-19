// 防抖
function debounce(fn, delay = 500) {
    let timer;
    return function () {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn.apply(this, arguments);
            timer = null;
        }, delay);
    }
}

// 节流
function throttle(fn, delay = 500) {
    let timer;
    return function () {
        if (timer) {
            return;
        }
        timer = setTimeout(() => {
            fn.apply(this, arguments);
            timer = null;
        }, delay);
    }
}

function scroll(target = 0) {
    let obj = document.documentElement || document.body;
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        let step = obj.scrollTop / 10;
        obj.scrollTop = obj.scrollTop - step;
        if (obj.scrollTop == target) {
            clearInterval(obj.timer);
            obj.timer = null;
        }
    }, 10);
}

function displayBackTop(obj, target = 0) {
    obj.style.display = 'none';

    window.addEventListener('scroll', function () {
        if (window.pageYOffset > target) {
            obj.style.display = 'block';
        } else {
            obj.style.display = 'none';
        }
    })
}

// 负责懒加载的加载图片的操作：当自定义属性的图片加载完成后，赋给 obj
function loadImg(obj) {
    let img = new Image();
    return function () {

        let dataSrc = obj.getAttribute('data-src');
        if (dataSrc) {
            img.src = dataSrc;
        } else {
            return;
        }
        img.onload = function () {
            obj.src = img.src;
        }
    }
}

// 处理懒加载的逻辑
function lazyLoad(imgArr) {
    return function () {
        // 视口高度
        let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        for (let i = 0; i < imgArr.length; i++) {
            if (imgArr[i].getBoundingClientRect().top - 300 <= clientHeight) {
                loadImg(imgArr[i])();
                imgArr.splice(i, 1);
                i--;
            }
        }
    }
}


function close(obj, close, callback) {
    close.onclick = function () {
        obj.style.display = 'none';
        callback && callback();
    }
}