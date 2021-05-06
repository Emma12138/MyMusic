// 轮播图代理
const ProxySlider = function () {
    let buttonNum = 0;
    let sliderNum = 0;
    let flag = true;// 节流阀
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

        return function () {
            console.log(buttonNum)
            buttonNum = 0;
            sliderNum = 0;
            flag = true;
            obj.style.left = '0';
            switchButton.switch(0);
            animateObj.clone();
        }
        // {
        //     init: function () {
        //         console.log(buttonNum)
        //         buttonNum = 0;
        //         sliderNum = 0;
        //         flag = true;
        //         obj.style.left = '0';
        //         switchButton.switch(0);
        //     },
        //     clone: obj.clone
        // }
    }
};

window.onload = function () {

    // 歌单推荐
    let listArr = ['摇滚', '粤语', '轻音乐', '电子', '说唱'];
    let list = document.querySelector('.main_list_slider');
    let listSlider;
    //
    getList(list, 0, true, function () {
        // 轮播
        let mainList = document.querySelector('.main_list');
        listSlider = ProxySlider()(
            list, mainList.children[1], mainList.lastElementChild,
            list.nextElementSibling.children,
            (list.children[0].offsetWidth + parseInt(window.getComputedStyle(list.children[0], null).marginRight)) / list.clientWidth
        );


        let lazyloadFn = lazyLoad(list.querySelectorAll('img'));
        window.addEventListener('scroll', function () {
            throttle(lazyloadFn, 500)();
        })
        let ev = new Event('scroll');
        window.dispatchEvent(ev);

    });

    // 点击加载新图片
    let listBtns = list.previousElementSibling.children;
    for (let i = 0; i < listBtns.length; i++) {
        listBtns[i].addEventListener('click', function () {

            for (let i = 0; i < listBtns.length; i++) {
                listBtns[i].className = '';
            }
            this.className = 'main_nav_current';

            getList(list, i, true, function () {

                // 轮播

                listSlider()
                lazyLoad(list.querySelectorAll('img'))();
            });


        })
    }
    // 请求数据
    function getList(wrapper, index, lazyFlag, callback) {
        ajax({
            url: 'http://localhost:3000/top/playlist/highquality',
            data: {
                cat: listArr[index],
                limit: 10
            },
            success: function (data) {

                renderList(data.playlists, 2, lazyFlag, wrapper);
                callback && callback();
            }
        })
    }
    // 渲染数据
    function renderList(data, num, lazyFlag, wrapper) {

        let frag = document.createDocumentFragment();
        for (let i = 0; i < num; i++) {
            let ul = document.createElement('ul');
            ul.className = 'main_list_slider_list';

            for (let j = 5 * i; j < 5 * i + 5; j++) {
                let li = document.createElement('li');
                li.setAttribute('src-id', data[j].id);

                li.innerHTML = `<a href="javascript:;">

                ${lazyFlag ? `<img src="https://y.gtimg.cn/mediastyle/global/img/album_300.png?max_age=31536000"
                data-src=${data[j].coverImgUrl} class="main_list_pic">` : `<img src=${data[j].coverImgUrl} class="main_list_pic">`}

            </a>
            <h5 class="main_list_title">
                <a href="javascript:;">${data[j].name}</a>
            </h5>
            <span class="main_list_info">播放量：${data[j].playCount >= 10000 ? changeNum(data[j].playCount) : data[j].playCount}</span>`;

                ul.append(li);

                li.onclick = function () {
                    let id = this.getAttribute('src-id');
                    window.open('playlist.html?pid=' + id, '_self');
                }
            }

            frag.appendChild(ul);
        }

        wrapper.innerHTML = '';
        wrapper.appendChild(frag);

    }




    // 新歌首发
    let songArr = ['0', '7', '96', '16', '8'];
    let song = document.querySelector('.main_song_slider');
    let songSlider;
    //
    getSong(song, 0, true, function () {
        // 轮播
        let mainSong = document.querySelector('.main_song');
        songSlider = ProxySlider()(
            song, mainSong.children[1], mainSong.lastElementChild,
            song.nextElementSibling.children,
            (song.children[0].offsetWidth + parseInt(window.getComputedStyle(song.children[0], null).marginRight)) / song.offsetWidth
        );


        let lazyloadFn = lazyLoad(song.querySelectorAll('img'));
        window.addEventListener('scroll', function () {
            throttle(lazyloadFn, 500)();
        })


    });

    // 点击加载新图片
    let songBtns = song.previousElementSibling.children;
    for (let i = 1; i < songBtns.length; i++) {
        songBtns[i].addEventListener('click', function () {

            for (let i = 1; i < songBtns.length; i++) {
                songBtns[i].className = '';
            }
            this.className = 'main_nav_current';

            getSong(song, i - 1, true, function () {

                // 轮播
                songSlider();


                lazyLoad(song.querySelectorAll('img'))();


            });
        })
    }
    // 请求数据
    function getSong(wrapper, index, lazyFlag, callback) {
        ajax({
            url: 'http://localhost:3000/top/song',
            data: {
                type: songArr[index]
            },
            success: function (data) {

                renderSong(data.data, 3, lazyFlag, wrapper);
                callback && callback();
            }
        })
    }
    // 渲染数据
    function renderSong(data, num, lazyFlag, wrapper) {
        let frag = document.createDocumentFragment();
        for (let i = 0; i < num; i++) {
            let ul = document.createElement('ul');
            ul.className = 'main_song_slider_list';

            for (let j = 9 * i; j < 9 * i + 9; j++) {
                let li = document.createElement('li');
                li.setAttribute('src-id', data[j].id);

                li.innerHTML = ` <a href="javascript:;" class="main_song_pic">
                ${lazyFlag ? `<img src="https://y.gtimg.cn/mediastyle/global/img/album_300.png?max_age=31536000"
                data-src=${data[j].album.picUrl}>` : `<img src=${data[j].album.picUrl}>`}
                                </a>
                                <div class="main_song_info">
                                    <a href="javascript:;" class="main_song_title">${data[j].name}</a>
                                    <span class="main_song_singer">

                                    ${data[j].artists.map(value => {
                    return `<a href="javascript:; src-id=${value.id}">${value.name}</a>`
                }).join('&nbsp;/&nbsp;')}

                                </span>
                                </div>
                                <div href="javascript:;" class="main_song_time">${getTime(data[j].duration)}</div>`;

                ul.append(li);

                li.children[0].onclick = function () {
                    let id = this.parentNode.getAttribute('src-id');
                    clickPlay(id);
                }

                li.querySelector('.main_song_title').onclick = function () {
                    let id = this.parentNode.parentNode.getAttribute('src-id');
                    clickPlay(id);
                }

                let singers = li.querySelectorAll('.main_song_singer a');
                for (let i = 0; i < singers.length; i++) {
                    singers[i].onclick = function () {
                        let keyword = this.innerHTML;
                        window.open(`search.html?keywords=${keyword}`, '_self');
                    }
                }
            }

            frag.appendChild(ul);
        }

        wrapper.innerHTML = '';
        wrapper.appendChild(frag);

    }


    // 精彩推荐
    let rec = document.querySelector('.main_rec_slider');

    getRec(rec, true, function () {

        // 轮播
        let mainRec = document.querySelector('.main_rec');
        ProxySlider()(rec, mainRec.children[1], mainRec.lastElementChild, rec.nextElementSibling.children, 1220 / 1200);

        // 懒加载
        let lazyloadFn = lazyLoad(rec.querySelectorAll('img'));
        window.addEventListener('scroll', function () {
            throttle(lazyloadFn, 500)();
        })

    });
    // 获取数据
    function getRec(wrapper, lazyFlag, callback) {
        ajax({
            url: 'http://localhost:3000/banner',
            data: {
                type: 0
            },
            success: function (data) {
                renderRec(data.banners, lazyFlag, wrapper);
                callback && callback();

            }
        })
    }
    // 渲染数据
    function renderRec(data, lazyFlag, wrapper) {

        let items = wrapper.children
        for (let i = 0; i < items.length; i++) {
            let frag = document.createDocumentFragment();
            for (let j = i * 2; j < i * 2 + 2; j++) {
                let a = document.createElement('a');
                a.href = 'javascript:;';
                a.setAttribute('src-id', data[j].targetId);

                a.innerHTML = `
                    ${lazyFlag ? `<img src="http://p1.music.126.net/MC02WAEJIgkzoeD1X2mrvQ==/109951165945638507.jpg" data-src=${data[j].imageUrl} alt="" class="main_rec_slider_pic">` : `<img src="${data[i].imageUrl}" data-id=${data[i].targetId} alt="" class="main_rec_slider_pic">`}`

                frag.appendChild(a);
            }

            items[i].append(frag);

        }
    }



    // 新碟首发
    let newArr = ['ZH', 'EA', 'KR', 'JP', 'ALL'];
    let album = document.querySelector('.main_album_slider');

    getNew(0, true, function () {
        let lazyloadFn = lazyLoad(album.querySelectorAll('img'));
        window.addEventListener('scroll', function () {
            throttle(lazyloadFn, 500)();
        })
    });

    // 点击加载新图片
    let newBtns = album.previousElementSibling.children;
    for (let i = 0; i < newBtns.length - 1; i++) {
        newBtns[i].addEventListener('click', function () {

            let index = this.getAttribute('src-index');
            for (let i = 0; i < newBtns.length - 1; i++) {
                newBtns[i].className = '';
            }
            this.className = 'main_nav_current';

            getNew(index, true, function () {
                lazyLoad(album.querySelectorAll('img'))()
            });
        })
    }
    // 获取数据
    function getNew(index, lazyFlag, callback) {
        ajax({
            url: 'http://localhost:3000/top/album',
            data: {
                limit: 10,
                area: newArr[index]
            },
            success: function (data) {

                renderNew(data.monthData, 10, lazyFlag, document.querySelector('.main_album_slider_list'));
                callback && callback();
            }
        })
    }
    // 渲染数据
    function renderNew(data, num, lazyFlag, wrapper) {
        let frag = document.createDocumentFragment();

        data.forEach((value, index) => {
            if (index < num) {
                let li = document.createElement('li');
                li.setAttribute('src-id', value.id);
                li.innerHTML = `
                    <a href="javascript:;">
                    
                    ${lazyFlag ? `<img src="https://y.gtimg.cn/mediastyle/global/img/album_300.png?max_age=31536000" data-src=${value.blurPicUrl} alt="" class="main_album_pic">` : `<img src="${value.blurPicUrl}" data-src=${value.blurPicUrl} alt="" class="main_album_pic">`}
                    
                    </a>
                    <h5 class="main_album_title"><a href="javascript:;">${value.name}</a></h5>
                    <span class="main_album_singer">
                    
                    ${value.artists.map(value => {
                    return `<a href="javascript:;" src-id=${value.id}>${value.name}</a>`
                }).join('&nbsp;/&nbsp;')}
                    
                    </span>`;

                frag.appendChild(li);

                li.querySelector('.main_album_title a').onclick = function () {
                    let keyword = this.innerHTML;
                    window.open(`search.html?keywords=${keyword}`, '_self');
                }

                let singers = li.querySelectorAll('.main_album_singer a');
                for (let i = 0; i < singers.length; i++) {
                    singers[i].onclick = function () {
                        let keyword = this.innerHTML;
                        window.open(`search.html?keywords=${keyword}`, '_self');
                    }
                }
            }
        })

        wrapper.innerHTML = '';
        wrapper.appendChild(frag);

    }



    // 排行榜
    let topItems = document.querySelectorAll('.main_top_content li');
    for (let i = 0; i < topItems.length; i++) {
        let id = topItems[i].getAttribute('src-id');
        getTop(id, topItems[i].querySelector('.main_top_item_list'));
    }
    // 获取数据
    function getTop(id, wrapper) {
        ajax({
            url: 'http://localhost:3000/playlist/detail',
            data: {
                id: id
            },
            success: function (data) {

                renderTop(data.playlist.tracks, 3, wrapper);
            }
        })
    }
    // 渲染数据
    function renderTop(data, num, wrapper) {
        let frag = document.createDocumentFragment();

        for (let i = 0; i < num; i++) {
            let div = document.createElement('div');
            div.className = 'main_top_item_list_info';

            div.innerHTML = `<span>${i + 1}</span>
            <div class="main_top_item_list_content">
                <a href="javascript:;" class="main_top_item_content_name" src-id=${data[i].id}>${data[i].name}</a>
                <span class="main_top_item_content_singer">

                ${data[i].ar.map(value => {
                return `<a href="javascript:;" src-id="${value.id}">${value.name}</a>`
            }).join('&nbsp;/&nbsp;')}
                </span>
            </div>`

            frag.appendChild(div);

            div.querySelector('.main_top_item_content_name').onclick = function () {
                let id = this.getAttribute('src-id');
                clickPlay(id);
            }

            let singers = div.querySelectorAll('.main_top_item_content_singer a');
            for (let i = 0; i < singers.length; i++) {
                singers[i].onclick = function () {
                    let keyword = this.innerHTML;
                    window.open(`search.html?keywords=${keyword}`, '_self');
                }
            }

        }

        wrapper.appendChild(frag);

    }




    // MV
    let mvArr = ['全部', '内地', '韩国', '港台', '欧美', '日本'];
    let mv = document.querySelector('.main_mv_slider');
    let mvSlider;
    //
    getMV(mv, 0, true, function () {
        // 轮播
        let mainMV = document.querySelector('.main_mv');
        mvSlider = ProxySlider()(
            mv, mainMV.children[1], mainMV.lastElementChild,
            mv.nextElementSibling.children,
            (mv.children[0].offsetWidth + parseInt(window.getComputedStyle(mv.children[0], null).marginRight)) / mv.offsetWidth
        );


        let lazyloadFn = lazyLoad(mv.querySelectorAll('img'));
        window.addEventListener('scroll', function () {
            throttle(lazyloadFn, 500)();
        })

    });

    // 点击加载新图片
    let mvBtns = mv.previousElementSibling.children;
    for (let i = 0; i < mvBtns.length; i++) {
        mvBtns[i].addEventListener('click', function () {

            for (let i = 0; i < mvBtns.length; i++) {
                mvBtns[i].className = '';
            }
            this.className = 'main_nav_current';

            getMV(mv, i, true, function () {

                // 轮播
                mvSlider();


                lazyLoad(mv.querySelectorAll('img'))();


            });
        })
    }
    // 请求数据
    function getMV(wrapper, index, lazyFlag, callback) {
        ajax({
            url: 'http://localhost:3000/mv/all',
            data: {
                area: mvArr[index],
                limit: 40
            },
            success: function (data) {
                renderMV(data.data, 4, lazyFlag, wrapper);
                callback && callback();
            }
        })
    }
    // 渲染数据
    function renderMV(data, num, lazyFlag, wrapper) {

        let frag = document.createDocumentFragment();
        for (let i = 0; i < num; i++) {
            let ul = document.createElement('ul');
            ul.className = 'main_mv_slider_list';

            for (let j = 10 * i; j < 10 * i + 10; j++) {
                let li = document.createElement('li');
                li.setAttribute('src-id', data[j].id);

                li.innerHTML = `
                <a href="javascript:;">
                ${lazyFlag ? `<img src="https://y.gtimg.cn/mediastyle/global/img/album_300.png?max_age=31536000"
                data-src=${data[j].cover} class="main_mv_pic">` : `<img src=${data[j].cover} class="main_mv_pic">`}
            </a>
            <h5 class="main_mv_title"><a href="javascript:;">${data[j].name}</a></h5>
            <span class="main_mv_singer">
            ${data[j].artists.map(value => {
                    return `<a href="javascript:;" src-id="${value.id}">${value.name}</a>`
                }).join('&nbsp;/&nbsp;')}
            </span>
            <div class="main_mv_count">${data[j].playCount >= 10000 ? changeNum(data[j].playCount) : data[j].playCount}</div>`;

                ul.append(li);


                li.onclick = function () {
                    let id = this.getAttribute('src-id');
                    window.open(`mv.html?id=${id}`, '_blank');
                }

                let singers = li.querySelectorAll('.main_mv_singer a');
                for (let i = 0; i < singers.length; i++) {
                    singers[i].onclick = function () {
                        let keyword = this.innerHTML;
                        window.open(`search.html?keywords=${keyword}`, '_self');
                    }
                }
            }

            frag.appendChild(ul);
        }

        wrapper.innerHTML = '';
        wrapper.appendChild(frag);

    }


}