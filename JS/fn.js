// 防抖
function debounce(fn, delay = 500) {
    let timer;
    let flag = true;
    return function () {
        if (flag) {
            fn.apply(this, arguments);
            flag = false;
            return;
        }
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn.apply(this, arguments);
            timer = null;
            flag = true;
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

function scroll(target = 0, callback) {
    let obj = document.documentElement || document.body;
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        let scrollTop = obj.scrollTop;
        let step = (scrollTop - target) / 15;
        step = step > 0 ? Math.ceil(step) : Math.floor(step);
        obj.scrollTop = scrollTop - step
        if (scrollTop <= target + 1 && scrollTop >= target - 1) {
            clearInterval(obj.timer);
            obj.timer = null;
            callback && callback();
        }
    }, 10);

    const cancelSCroll = function () {
        let obj = document.documentElement || document.body;
        if (obj.timer) {
            clearInterval(obj.timer);
            obj.timer = null;
            callback && callback();
            window.removeEventListener('mousewheel', cancelSCroll);
        }
    }
    window.addEventListener('mousewheel', cancelSCroll);
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

// 处理懒加载的逻辑
function lazyLoad(imgArr) {
    imgArr = [...imgArr];
    return function () {
        // 视口高度
        let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        for (let i = 0; i < imgArr.length; i++) {
            if (imgArr[i].getBoundingClientRect().top - 300 <= clientHeight) {
                loadImg(imgArr[i]);
                imgArr.splice(i, 1);
                i--;
            }
        }
    }
}


function display(obj, Bool = true) {
    if (Bool === true) {
        obj.style.display = 'block';
    } else if (Bool === false) {
        obj.style.display = 'none';
    } else {
        obj.style.display = Bool;
    }
}
function setStyle(obj, className, value) {
    obj.style[className] = value;
}

function ajax(obj) {
    let defaults = {
        type: 'get',
        async: true,
        url: '',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded',
            '1': '2'
        },
        data: {},
        success: function () { },
        error: function () { }
    }
    defaults = Object.assign(defaults, obj);

    let param = '';
    for (let attr in defaults.data) {
        param += attr + '=' + defaults.data[attr] + '&';
    }
    param = param.substr(0, param.length - 1);

    const xhr = new XMLHttpRequest();
    //
    xhr.withCredentials = true;

    if (defaults.type == 'get') {
        defaults.url += '?' + param;
    }
    xhr.open(defaults.type, defaults.url, defaults.async);

    if (defaults.type == 'post') {
        let contentType = defaults.header['Content-Type'];
        xhr.setRequestHeader('Content-Type', contentType);
        if (contentType == 'application/json') {
            xhr.send(JSON.stringify(defaults.data));
        } else {
            xhr.send(param);
        }
    } else {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send();
    }
    xhr.onload = function () {
        let response = xhr.responseText;
        let contentType = xhr.getResponseHeader('Content-Type');
        if (contentType.includes('application/json')) {
            response = JSON.parse(response);
        }
        if (xhr.status == 200) {
            defaults.success(response, xhr, param);
        } else {
            defaults.error(response, xhr);
        }
    }
}

function highLight(text, keywords) {

}

// 将时间转化为 xx:xx 形式
function getTime(num) {
    num = Math.round(num / 1000);
    let min = Math.floor(num / 60);
    min = min < 10 ? '0' + min : min;
    let s = num % 60;
    s = s < 10 ? '0' + s : s;
    let str = min + ':' + s;
    return str;
}
// 将时间转化为 年月日 形式
function getYearTime(num) {
    let time = new Date(num);
    let year = time.getFullYear();
    let mon = time.getMonth() + 1;
    mon = mon < 10 ? '0' + mon : mon;
    let day = time.getDate();
    day = day < 10 ? '0' + day : day;
    let h = time.getHours();
    h = h < 10 ? '0' + h : h;
    let min = time.getMinutes();
    min = min < 10 ? '0' + min : min;
    return `${year}年${mon}月${day}日 ${h}:${min}`;
}

// 储存搜索历史
function storHis(hisData, key) {
    let flag = true;
    hisData.forEach(value => {
        if (value === key) {
            flag = false;
            return;
        }
    })
    if (flag) {
        hisData.unshift(key);
    }
    window.localStorage.history = JSON.stringify(hisData);
}

// 删除搜索历史
function closeHis(item, input, hisData) {
    // 去掉换行符
    let keywords = item.parentNode.textContent.replace(/^\s*|\s*$/g, '');

    item.parentNode.parentNode.removeChild(item.parentNode);
    hisData.splice(hisData.indexOf(keywords), 1);
    window.localStorage.history = JSON.stringify(hisData);

    input.focus();
}

// 执行点击搜索框搜索结果后的流程
function clickSearchResult(keywords, input, url) {
    let hisData = JSON.parse(window.localStorage.history);

    keywords = decodeURIComponent(keywords);
    keywords = keywords.replace(/^\s*|\s*$/g, '');

    // 保存关键词到搜索框中
    input.value = keywords;

    // 默认 url
    if (!url) {
        url = `search.html?keywords=${keywords}`;
    }
    // 储存搜索历史
    storHis(hisData, keywords);
    // 跳转
    window.open(url, '_self');

}

// 创建分页按钮并绑定事件
function createPage(obj, data, fn, callback) {
    // 计算一共多少页
    let pageCount = Math.ceil(data / 30);// 每页30行数据

    // 如果只有一页数据，就不用创建
    if (pageCount === 1) {
        return;
    }
    for (let i = 0; i < pageCount; i++) {
        let li = document.createElement('li');
        li.index = i;
        li.innerHTML = i + 1;

        if (i == 0) {
            li.className = 'page_current';
        }

        // 点击分页按钮分页
        li.onclick = fn;

        obj.appendChild(li);
    }

    callback && callback();
}

// 修改分页按钮样式
// 保留前两个。最后两个、当前页的左边两个、右边两个按钮，其他用省略代替
function changePage(index, items) {
    // index 是当前的页数-1
    if (items.length == 0) {
        return;
    }

    for (let i = 0; i < items.length; i++) {
        items[i].innerHTML = items[i].index + 1;
        items[i].className = '';
    }

    for (let i = 3; i < items.length - 3; i++) {
        if (i < index - 2 || i > index + 2) {
            items[i].innerHTML = '.';
            items[i].className = 'page_ellipsis';
        }
    }

    items[index].className = 'page_current';

}

// 显示信息弹窗
function msgPop(text) {
    let msg = document.querySelector('.msgpop');
    msg.innerHTML = text;
    msg.style.height = '50px';
    msg.style.opacity = '1';
    let timer = setTimeout(function () {
        msg.style.opacity = '0';
        clearTimeout(timer);
        timer = null;
    }, 1500);
}



// 添加歌曲到歌单
function clickAdd(userid, sid, pid, playlistData, fn) {
    // 参数 sid 是：要添加的歌曲的 id,可以是多个
    // 参数 pid 是：如果该歌曲是从某个歌单上添加的，则pid 是该歌单的id

    // 显示弹窗
    createPlaylist(userid, playlistData, pid, function (pid) {
        // 发出添加到歌单的请求
        ajax({
            url: 'http://localhost:3000/playlist/tracks',
            data: {
                op: 'add',
                pid: pid,
                tracks: sid
            },
            success: function () {

                msgPop('添加成功！');
                updateAccount(userid);

                // 关闭弹窗
                document.querySelector('.addsong_playlist_close').click();
            },
            error: function () {
                msgPop('出错啦！');
            }
        })
    }, fn);
}

// 创建"收藏到我的歌单"弹窗
function createPlaylist(userId, playlistData, pid, fn, callback) {
    let addSong = document.querySelector('.addsong_playlist');
    let addSongOl = addSong.lastElementChild;
    let close = addSong.querySelector('.addsong_playlist_close');
    // 显示我创建的所有歌单
    playlistData.forEach(value => {

        // 如果是该用户创建的而不是该用户收藏的歌单
        if (value.creator.userId === userId && value.id !== pid) {

            let li = document.createElement('li');
            li.className = 'addsong_playlist_item';
            li.innerHTML = value.name;
            li.setAttribute('pid', value.id);
            li.addEventListener('click', function () {
                fn(value.id);
            })

            addSongOl.appendChild(li);
        }
    })

    // 关闭按钮
    close.addEventListener('click', function () {
        display(addSong, false);
        addSongOl.innerHTML = '';
    })

    // 新建歌单按钮
    let newList = addSong.querySelector('.addsong_new');
    newList.onclick = function () {
        close.click();
        newPl(userId, function () {

            callback && callback(userId);
        });
    }


    display(addSong);
}

// 新建歌单
function newPl(userId, callback) {
    let newList = document.querySelector('.newList');
    display(newList);
    // 关闭和取消按钮
    let closeBtn = newList.querySelector('.newList_close');
    closeBtn.addEventListener('click', function () {
        display(newList, false);
    })
    let cancelBtn = newList.querySelector('.newList_no');
    cancelBtn.onclick = function () {
        display(newList, false);
    }

    // 输入时实时显示剩余数量
    let input = newList.querySelector('input');
    let count = newList.querySelector('.newList_bd_count');
    input.oninput = function () {
        let value = this.value;
        count.innerHTML = 20 - value.length;
        if (value.length >= 20) {
            count.className = 'newList_bd_count newList_bd_count_overflow';
        } else {
            count.className = 'newList_bd_count';
        }
    }

    // 确定按钮
    let go = newList.querySelector('.newList_go');
    go.onclick = function () {

        if (count.className == 'newList_bd_count newList_bd_count_overflow') {
            msgPop('字数超过20个了哦~~');
        } else {
            let value = input.value;
            ajax({
                url: 'http://localhost:3000/playlist/create',
                data: {
                    name: value
                },
                success: function (data) {
                    if (data.code == 200) {
                        input.value = '';
                        msgPop('新建成功！');
                        updateAccount(userId);

                        callback && callback();


                        // "我创建的歌单"后面的数字 +1
                        let plBtn = document.querySelector('.user_nav a:nth-child(2)');
                        if (plBtn) {
                            let reg = /\d/g;
                            let plCount = parseInt(plBtn.innerHTML.match(reg).join(''));
                            plCount++;
                            plBtn.innerHTML = '我创建的歌单 ' + plCount;
                        }
                        newList.querySelector('.newList_close').click();

                        // 渲染该新歌单
                        // if (plBtn.className == 'user_nav_mypl user_nav_current') {
                        //     data = data.playlist;

                        //     let li = document.createElement('li');
                        //     li.className = 'user_bd_playlist_item';
                        //     li.setAttribute('src-pid', data.id)
                        //     li.innerHTML = `  <img src="${data.coverImgUrl}" alt="">
                        // <p class="user_bd_playlist_item_name">${data.name}</p>
                        // <p class="user_bd_playlist_item_user">${userName}</p>`;

                        //     let wrapper = document.querySelector('.user_bd_playlist_content');
                        //     if (wrapper.children.length != 0) {
                        //         wrapper.insertBefore(li, wrapper.children[0]);
                        //     } else {
                        //         wrapper.append(li);
                        //     }
                        // }
                    }

                }
            })
        }

    }
}

// 从歌单中删除歌曲
function clickDel(pid, sid, that, callback) {
    ajax({
        url: 'http://localhost:3000/playlist/tracks',
        data: {
            op: 'del',
            pid: pid,
            tracks: sid
        },
        success: function () {
            // 关闭弹窗
            msgPop('删除成功！');
            callback && callback(that);
        },
        error: function (data) {
            console.log(data)
        }
    })
}

// 让最新评论数加1
function getCommentCount(commentTitle) {
    let str = commentTitle.innerHTML.substr(5);
    let num = parseInt(str);
    num++;
    commentTitle.innerHTML = `最新评论(${num})`;
}

// 更新头像
function loadAvatar(data) {
    let avatar = document.querySelector('.login_avatar');
    if (!avatar) {
        avatar = document.querySelector('.aside_login_avatar');
        document.querySelector('.aside_wrapper span:first-of-type').className = 'logined';
    } else {
        display(avatar);
    }
    avatar.src = data;

    let loginBtn = document.querySelector('.header_login a');
    if (loginBtn) {
        display(loginBtn, false);
        display(document.querySelector('.login_status'));
    }

}

// 将大于一万的数字转换为以万为单位
function changeNum(num) {
    if (num < 10000) {
        return num;
    }
    return (num / 10000).toFixed(1) + '万';
}


// 更新用户账户信息
function updateAccount(id) {
    ajax({
        url: 'http://localhost:3000/user/detail',
        data: {
            uid: id
        },
        success: function (data) {

            let user = JSON.parse(window.localStorage.user);
            user.profile = data.profile;

            window.localStorage.user = JSON.stringify(user);
        }
    })
}


// 点击播放按钮
function clickPlay(id) {
    let playlists;
    if (window.localStorage.playlists) {
        playlists = JSON.parse(window.localStorage.playlists);
    } else {
        playlists = {
            playlist: [],
            playNow: '',
            type: false
        }
    }
    let playlist = playlists.playlist;// 播放队列
    let playNow = playlists.playNow;
    let bool = false;// 表本地存储中不含该歌曲

    // 判断音乐播放界面是否打开
    let playerTagFlag = JSON.parse(window.localStorage.playerTag);// false表已打开

    // 如果该歌曲正在播放
    if (playNow == id) {
        // 如果音乐播放界面未打开
        if (!playerTagFlag) {
            window.open('player.html', '_blank');
            return;
        } else {
            msgPop('这首歌已经在播放了哦！');
            return;
        }

    }

    playlist.forEach((value) => {
        if (value == id) {
            bool = true;
        }
    })

    // 如果播放队列中不含该歌曲
    if (!bool) {
        playlist.unshift(id);

        window.localStorage.setItem('newNum', 1);// 新添加的歌曲的数量

    } else {
        window.localStorage.setItem('newNum', 0);// 新添加的歌曲的数量为 0
    }

    playlists.playNow = id;
    playlists.type = true;
    console.log(playlists);
    console.log(JSON.stringify(playlists))
    window.localStorage.playlists = JSON.stringify(playlists);


    if (!playerTagFlag || !JSON.parse(playerTagFlag)) {
        window.open('player.html', '_blank');
    }
}





// 点击添加到播放队列按钮
function clickAddPlay(id) {
    let playlists;
    if (window.localStorage.playlists) {
        playlists = JSON.parse(window.localStorage.playlists)
    } else {
        playlists = {
            playlist: [],// 播放队列
            playNow: '', // 正在播放的歌曲的 id
            type: false  // 更新该对象数据时是从外部网页还是从当前网页更新的，false表从当前网页更新的
        }
    }
    let playlist = playlists.playlist;
    let bool = false;// 表本地存储中不含该歌曲

    playlist.forEach((value, index) => {
        if (value == id) {
            bool = true;
            index = playlist.length;
        }
    })


    // 判断音乐播放界面是否打开
    let playerTagFlag = JSON.parse(window.localStorage.playerTag);// false表已打开

    // 如果播放队列中不含该歌曲
    if (!bool) {
        msgPop('已添加到播放列表！');
        playlist.unshift(id);
        playlists.type = true;

        window.localStorage.setItem('newNum', 1);// 新添加的歌曲的数量
        window.localStorage.playlists = JSON.stringify(playlists);


        // 如果音乐播放界面未打开 
        if (!playerTagFlag || !JSON.parse(playerTagFlag)) {
            window.open('player.html', '_blank');
        }
    } else {
        // 如果音乐播放界面未打开
        if (!playerTagFlag) {
            window.open('player.html', '_blank');
        } else {
            msgPop('播放列表中已经有该歌曲了哦！');
        }



    }


}