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
    // 去掉空格换行符
    let keywords = item.parentNode.textContent.replace(/[\n\r ]/g, '')

    item.parentNode.parentNode.removeChild(item.parentNode);
    hisData.splice(hisData.indexOf(keywords), 1);
    window.localStorage.history = JSON.stringify(hisData);

    input.focus();
}

// 执行点击搜索框搜索结果后的流程
function clickSearchResult(keywords, input, url) {
    let hisData = JSON.parse(window.localStorage.history);

    keywords = decodeURIComponent(keywords);
    keywords = keywords.replace(/[\r\n ]/g, '');

    // 保存关键词到搜索框中
    input.value = keywords;

    if (!url) {
        url = `file:///C:/Users/Emma/Desktop/study/MyMusic/search.html?keywords=${keywords}`;
    }
    // 储存搜索历史
    storHis(hisData, keywords);
    // 跳转
    window.open(url, '_self');
    // window.location.reload(true);
    // if (bool) {

    // }

    // return false;

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
function clickAdd(userid, sid, pid, playlistData) {
    // 显示弹窗
    createPlaylist(userid, playlistData, pid, function () {

        let pid = parseInt(this.getAttribute('pid'));// 要存放的歌单的id
        ajax({
            url: 'http://localhost:3000/playlist/tracks',
            data: {
                op: 'add',
                pid: pid,
                tracks: sid
            },
            success: function (data) {
                // console.
                msgPop('添加成功！');
                // callback && callback();
                // 关闭弹窗
                document.querySelector('.addsong_playlist_close').click();
            },
            error: function (data) {
                console.log(data)
            }
        })
    });
}

// 创建"收藏到我的歌单"弹窗
function createPlaylist(userId, playlistData, pid, fn) {
    let addSong = document.querySelector('.addsong_playlist');
    let addSongOl = addSong.lastElementChild;
    let close = addSong.querySelector('.addsong_playlist_close');
    // 显示我创建的所有歌单
    playlistData.forEach(value => {
        // let userId = param.substr(param.indexOf('id=') + 3);
        // 如果是该用户创建的而不是该用户收藏的歌单
        if (value.creator.userId === userId && value.id !== pid) {

            let li = document.createElement('li');
            li.className = 'addsong_playlist_item';
            li.innerHTML = value.name;
            li.setAttribute('pid', value.id);
            li.addEventListener('click', fn)

            addSongOl.appendChild(li);
        }
    })
    // 关闭按钮
    close.addEventListener('click', function () {
        display(addSong, false);
        addSongOl.innerHTML = '';
    })
    display(addSong);
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
    let loginBtn = document.querySelector('.header_login a');
    avatar.src = data;
    display(avatar);
    display(loginBtn, false);
    display(document.querySelector('.login_status'));
}

// 将大于一万的数字转换为以万为单位
function changeNum(num) {
    if (num < 10000) {
        return;
    }
    return (num / 10000).toFixed(1) + '万';
}




// 评论区

