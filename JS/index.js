// 轮播图代理
const ProxySlider = function () {
    let buttonNum = 0;
    let sliderNum = 0;
    let flag = true;
    return function (obj, previous, next, button, target = 1) {
        let animateObj = new SliderObj(obj);
        let switchButton = new SliderButton(button);

        animateObj.clone();

        previous.onclick = function () {
            if (flag) {
                // console.log(target)
                flag = false;
                buttonNum--;
                sliderNum--;
                buttonNum = buttonNum == -1 ? button.length - 1 : buttonNum;
                if (sliderNum == -1) {
                    obj.style.left = -(button.length) * 100 + '%';
                    sliderNum = button.length - 1;
                }
                animateObj.animate(sliderNum * target, () => {
                    flag = true;
                });
                switchButton.switch(buttonNum);
            }
        }

        next.onclick = function () {
            if (flag) {
                flag = false;
                buttonNum++;
                sliderNum++;
                buttonNum = buttonNum == button.length ? 0 : buttonNum;
                if (sliderNum == button.length + 1) {
                    obj.style.left = 0 + '%';
                    sliderNum = 1;
                }
                animateObj.animate(sliderNum * target, () => {
                    flag = true;
                });
                switchButton.switch(buttonNum);
            }

        }
    }
};


window.onload = function () {

    // 轮播

    // 歌单推荐
    let mainList = document.querySelector('.main_list');
    let listSlider = mainList.querySelector('.main_list_slider');
    ProxySlider()(
        listSlider, mainList.children[1], mainList.lastElementChild,
        listSlider.nextElementSibling.children,
        (listSlider.children[0].offsetWidth + parseInt(window.getComputedStyle(listSlider.children[0], null).marginRight)) / listSlider.offsetWidth
    );

    // 新歌首发
    let mainSong = document.querySelector('.main_song');
    let songSlider = mainSong.querySelector('.main_song_slider');
    ProxySlider()(
        songSlider, mainSong.children[1], mainSong.lastElementChild,
        songSlider.nextElementSibling.children,
        (songSlider.children[0].offsetWidth + parseInt(window.getComputedStyle(songSlider.children[0], null).marginRight)) / songSlider.offsetWidth
    );

    // 精彩推荐
    let mainRec = document.querySelector('.main_rec');
    let recSlider = mainRec.querySelector('.main_rec_slider');
    ProxySlider()(
        recSlider, mainRec.children[1], mainRec.lastElementChild,
        recSlider.nextElementSibling.children,
        (recSlider.children[0].offsetWidth + parseInt(window.getComputedStyle(recSlider.children[0], null).marginRight)) / recSlider.offsetWidth
    );

    // mv
    let mainMV = document.querySelector('.main_mv');
    let mvSlider = mainMV.querySelector('.main_mv_slider');
    ProxySlider()(
        mvSlider, mainMV.children[1], mainMV.lastElementChild,
        mvSlider.nextElementSibling.children,
        (mvSlider.children[0].offsetWidth + parseInt(window.getComputedStyle(mvSlider.children[0], null).marginRight)) / mvSlider.offsetWidth
    );

    // 返回顶部
    let topButton = document.querySelector('.sidebar_top');
    topButton.addEventListener('click', function () {
        scroll();
    })
    displayBackTop(topButton, document.querySelector('.header').offsetHeight);

    // 图片懒加载
    let imgArr = document.querySelectorAll('img');
    imgArr = [...imgArr];
    window.addEventListener('scroll', function () {
        throttle(lazyLoad(imgArr), 500)();
    })

    let ev = new Event('scroll');
    window.dispatchEvent(ev);

    // 登录
    // 点击导航栏登录按钮唤起登录界面
    let loginBtn = document.querySelector('.header_login a');
    let login = document.querySelector('.login');
    // 遮罩
    let cover = new Create('cover', document.body);
    loginBtn.onclick = function () {
        cover.init();
        // 弹窗
        login.style.display = 'block';
        // 隐藏滚动条
        document.body.style.overflowY = 'hidden';
    }
    // 关闭登录界面
    let closeBtn = document.querySelector('.login_close');
    closeBtn.onclick = function () {
        // 关闭登录界面
        login.style.display = 'none';
        // 关闭遮罩
        cover.close();
        // 显示滚动条
        document.body.style.overflowY = '';
    }


}