
window.addEventListener('load', function () {

    // 将音乐播放界面已打开的信息存储到本地存储中
    window.localStorage.playerTag = true;

    // 音乐播放界面关闭后修改该信息
    window.onunload = function () {
        window.localStorage.playerTag = false;
    }



    // 获取用户id
    let userId = null;
    let userData = null;
    // 如果本地存储中有用户数据，则赋值
    if (window.localStorage.user) {
        userData = JSON.parse(window.localStorage.getItem('user'));
        userId = userData.account.id;
    }

    // 监听更新播放列表
    window.addEventListener('storage', function (e) {

        if (e.key == 'playlists') {
            let oldId = playlist[index];

            let playlists = JSON.parse(window.localStorage.playlists);
            // 如果是从外部网页改变本地存储的数据的
            if (playlists.type) {

                playlist = playlists.playlist;// 播放队列
                let playNowId = playlists.playNow;// 要立即播放的歌曲的 id

                let num = JSON.parse(window.localStorage.newNum);// 一共有 num 条新数据
                let newList = playlist.slice(0, num);// 新添加的歌曲
                //
                getAudioSrc(newList);

                index = playlist.indexOf(playNowId);

                if (playNowId != oldId) {

                    // 更新播放列表的数据 
                    getSongsDetail(newList, function () {
                        // 加载该歌曲的数据
                        renderData();

                        if (choose.title == '取消') {
                            choose.click();
                        }
                    });

                    audio.src = audioArr[index];
                    lineNow = 0;
                    audio.play();

                } else {
                    // 更新播放列表的数据
                    getSongsDetail(newList, function () {
                        if (choose.title == '取消') {
                            choose.click();
                        }
                    });
                }

            }


        }
    })


    let player = document.querySelector('.player')
    let audio = document.querySelector('audio');
    let index = 0;// 当前播放歌曲的索引

    let playlist = [];// 播放列表，存放歌曲 id
    let audioArr = [];// 播放列表的歌曲的 src
    let playlistBd = document.querySelector('.playlist_body');

    // 获取喜欢音乐列表，用于判断某歌曲是否已喜欢
    let likelist = [];
    // 如果已登录，就获取喜欢音乐列表；如果没有，则直接渲染页面数据
    if (userId) {
        ajax({
            url: 'http://localhost:3000/likelist',
            data: {
                uid: userId,
                timerstamp: +new Date()
            },
            success: function (data) {
                likelist = data.ids;
                getPlayData();

            }
        })
    } else {
        getPlayData();
    }

    // 如果用户退出登录，则清空 likelist
    window.addEventListener('storage', function (e) {
        if (e.key == 'user') {
            if (window.localStorage.user == '') {
                likelist = [];
            }
        }
    })




    // 获取用户的歌单。用于将歌曲添加到歌单
    let playlistData;
    ajax({
        url: 'http://localhost:3000/user/playlist',
        data: {
            uid: userId,
            timerstamp: +new Date()
        },
        success: function (data) {
            playlistData = data.playlist;
        }
    })


    // 阻止按下键盘一些键时浏览器的默认行为
    window.addEventListener('keydown', function (e) {
        if (e.key == ' ' || e.key == 'ArrowLeft' || e.key == 'ArrowRight' || e.key == 'ArrowUp' || e.key == 'ArrowDown') {
            e.preventDefault();
        }
    })



    // 获取本地存储中的播放数据：播放列表、正在播放的歌曲
    function getPlayData() {
        // 如果本地存储中没有这些数据，就先创建一个对象
        if (!window.localStorage.playlists) {
            let playlists = {
                playlist: [],// 播放队列
                playNow: '', // 正在播放的歌曲的 id
                type: false  // 更新该对象数据时是从外部网页还是从当前网页更新的，false表示从当前网页更新的
            }
            window.localStorage.playlists = JSON.stringify(playlists);
        } else {
            let playlists = JSON.parse(window.localStorage.playlists);
            playlist = playlists.playlist;// 存放歌曲id
            let playNow = playlists.playNow;// 正在播放的歌曲的 id

            if (playlist.length !== 0) {
                // 获取播放列表的所有歌曲的详细信息，获取后把这些歌曲的详细信息渲染到页面中的播放列表中
                getSongsDetail(playlist, function () {
                    // 渲染正在播放的歌曲的数据
                    renderData();
                });

                // 获得播放列表的歌曲的url
                getAudioSrc(playlist);

                // 如果本地存储中有历史播放记录，就播放那首歌
                if (playNow) {
                    index = playlist.indexOf(playNow);
                }
                audio.src = audioArr[index];

            }

        }
    }


    // 获取传进来的数组里所有歌曲的详细信息，获取后把这些歌曲的详细信息渲染到页面中的播放列表中
    function getSongsDetail(arr, fn) {

        let ids;
        if (arr.length == 0) {
            fn();
            return;
        } else if (arr.length == 1) {
            ids = arr[0];
        } else {
            ids = arr.join(',');
        }

        ajax({
            url: 'http://localhost:3000/song/detail',
            data: {
                ids: ids
            },
            success: function (data) {
                // 成功后渲染到播放列表
                renderPlaylist(data.songs, fn);
            }
        })
    }

    // 渲染正在播放的歌曲的数据
    function renderData() {

        // 获取歌词
        getLyric(playlist[index]);

        // 获取基本信息：歌名、歌手名等
        ajax({
            url: 'http://localhost:3000/song/detail',
            data: {
                ids: playlist[index]
            },
            success: function (data) {
                data = data.songs[0];

                let obj = {
                    name: data.name,
                    singer: data.ar.map(value => value.name),
                    sId: data.ar.map(value => value.id),
                    album: data.al.name,
                    aId: data.al.id,
                    avatar: data.al.picUrl,
                    mv: data.mv
                }
                // 渲染这些基本数据
                baseData(obj);

            }
        })

    }
    // 渲染基本数据
    function baseData(obj) {
        // 页面标题
        document.querySelector('title').innerHTML = `▶&nbsp;${obj.name}`;

        // 播放列表部分
        // 歌名
        let plName = document.querySelector('.playlist_now_name');
        plName.innerHTML = obj.name;
        // 歌手名
        let plSinger = document.querySelector('.playlist_now_singer');
        plSinger.innerHTML = obj.singer;

        // 歌名左侧的播放按钮
        let plBtn = document.querySelectorAll('.playlist_item_play');
        for (let i = 0; i < plBtn.length; i++) {
            // display(plBtn[i]);
            // display(plBtn[i].previousElementSibling, false);
            plBtn[i].parentNode.className = 'playlist_item';
        }
        // display(plBtn[index], false);

        let plItem = document.querySelector('.playlist_body').children;
        // display(plItem[index].children[1]);// 动图
        plItem[index].className = 'playlist_item playlist_item_now';

        // 封面
        let pic = document.querySelector('.song_pic');
        pic.src = obj.avatar;

        // 喜欢按钮
        let likeBtns = document.querySelector('.info_btns').children[0];
        // 判断该歌曲是否在用户喜欢歌曲列表中
        if (likelist.includes(parseInt(playlist[index]))) {
            likeBtns.setAttribute('src-like', 0);// 已喜欢
            likeBtns.className = 'iconfont liked';
        } else {
            likeBtns.setAttribute('src-like', 1);// 未喜欢
            likeBtns.className = 'iconfont';
        }

        // MV 按钮
        let mv = document.querySelector('.info_btns').children[2];
        mv.setAttribute('src-id', obj.mv);
        // 如果该歌曲无 mv，禁用 mv 按钮
        if (obj.mv == 0) {
            mv.style.cssText = 'color: #999; cursor: default;';
        } else {
            mv.style.cssText = '';
        }


        // 歌词上方信息
        let lrcSong = document.querySelector('.lyric_song');
        lrcSong.innerHTML = obj.name;// 歌名
        // 歌手名
        let lrcSinger = document.querySelector('.lyric_singer');
        lrcSinger.innerHTML = obj.singer.map((value, index) => {
            return `<a href="javascript:;" title="${value}" src-id="${obj.sId[index]}">${value}</a>`
        }).join('&nbsp;/&nbsp;');
        let singers = lrcSinger.querySelectorAll('a');
        // 点击歌手名搜索该歌手
        for (let i = 0; i < singers.length; i++) {
            singers[i].onclick = function () {
                let keyword = this.innerHTML;
                window.open(`search.html?keywords=${keyword}`, '_blank');
            }
        }
        // 专辑名
        let lrcAl = document.querySelector('.lyric_album a');
        lrcAl.innerHTML = obj.album;
        lrcAl.title = obj.album;
        lrcAl.setAttribute('src-id', obj.aId);
        // 点击专辑名搜索该专辑
        lrcAl.onclick = function () {
            let keyword = this.innerHTML;
            window.open(`search.html?keywords=${keyword}`, '_blank');
        }

        // 获取评论
        hotPage = 0;
        document.querySelector('.comment_bd_good_wrapper').innerHTML = `<h4 class="comment_bd_title">精彩评论</h4>`;
        document.querySelector('.comment_bd_new_wrapper').innerHTML = `<h4 class="comment_bd_title">最新评论</h4>`;
        getHotComment(pid);
        getNewComment(pid);
    }

    // 显示隐藏播放列表
    let displayPlBtn = document.querySelector('.aside_wrapper').children[2];
    displayPlBtn.addEventListener('mouseover', function () {
        this.children[1].style.maxHeight = '500px';
    })
    displayPlBtn.addEventListener('mouseout', function () {
        this.children[1].style.maxHeight = '0';
    })

    // 渲染播放列表数据
    function renderPlaylist(data, callback) {
        let newNode = data.map((value, index) => {
            return `<li class="playlist_item" src-id=${value.id} src-index=${index}>
            <input type="checkbox" name="" id="">
            <img src="https://y.gtimg.cn/mediastyle/yqq/img/wave.gif?max_age=2592000&v=78979d47cc7dc55cab5d36b4c96168d5">
            <a href="javascript:;" class="playlist_item_play iconfont">&#xe610;</a>
            <div class="playlist_item_info">
                <i class="playlist_item_name">${value.alia.length === 0 ? value.name : `${value.name}&nbsp;(${value.alia[0]})`}</i><br>
                <i class="playlist_item_singer">
                    ${value.ar.length === 1 ? `<a href="javascript:;" src-id=${value.ar[0].id}>${value.ar[0].name}</a>` : value.ar.map(value => {
                return `<a href="javascript:;" src-id=${value.id}>${value.name}</a>`
            }).join(`&nbsp;/&nbsp;`)}
                </i>
            </div>
            <em class="playlist_item_time">${getTime(value.dt)}</em>
            <a href="javascript:;" class="playlist_item_del iconfont">&#xe62f;</a>
        </li>`
        }).join('');

        // 如果播放列表当前为空，则直接渲染上去
        if (playlistBd.children.length === 0) {
            playlistBd.innerHTML = newNode;
        } else {
            // 将上面的模板字符串转换为文档对象，然后放进文档碎片中
            let node = document.createRange().createContextualFragment(newNode);
            let frag = document.createDocumentFragment();
            frag.appendChild(node);

            playlistBd.insertBefore(frag, playlistBd.children[0]);

            let items = playlistBd.children;
            // 渲染后由于播放列表已发生变动，需要重新赋予每首歌曲在播放列表中的序列 src-index
            for (let i = data.length; i < items.length; i++) {
                items[i].setAttribute('src-index', i);
            }
        }


        // 点击播放列表中歌名左侧的播放按钮播放对应歌曲
        let playlistBtn = document.querySelectorAll('.playlist_item_play');// 播放列表中的播放按钮
        for (let i = 0; i < playlistBtn.length; i++) {
            playlistBtn[i].addEventListener('click', function () {
                clicktoPlay(this);
            })
        }

        // 点击播放列表中歌名右侧的删除按钮删除该歌曲
        let playlistDelBtn = document.querySelectorAll('.playlist_item_del');// 播放列表中的播放按钮
        for (let i = 0; i < playlistDelBtn.length; i++) {
            playlistDelBtn[i].addEventListener('click', function () {
                clickDel(this);
            })
        }

        callback && callback();
    }


    // 播放列表的批量选择
    let choose = document.querySelector('.playlist_now_choose');
    let chooseBtns = document.querySelectorAll('.playlist_btns span');
    choose.addEventListener('click', function () {
        let checkboxes = document.querySelectorAll('.playlist_item input');// 单选框
        let allBtn = choose.nextElementSibling.children[0];

        if (this.title === '批量选择') {
            // 显示批量选择的几个功能：添加到歌单、删除
            for (let i = 0; i < chooseBtns.length; i++) {
                display(chooseBtns[i]);
            }
            // 显示单选框
            for (let i = 0; i < checkboxes.length; i++) {
                // 显示单选框
                display(checkboxes[i]);
            }
            // 隐藏正在播放的歌曲旁边的动图
            display(document.querySelector('.playlist_item_now img'), false);
            this.title = '取消';
        } else {
            for (let i = 0; i < chooseBtns.length; i++) {
                display(chooseBtns[i], false);
            }
            for (let i = 0; i < checkboxes.length; i++) {
                display(checkboxes[i], false);
            }
            // 显示正在播放的歌曲旁边的动图
            display(document.querySelector('.playlist_item_now img'));
            // 如果全选按钮被选中了，就取消选中
            if (allBtn.checked) {
                allBtn.click();
            }
            // 取消单选框的选中
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = false;
            }
            // 隐藏动图
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].nextElementSibling.style.display == 'block') {
                    checkboxes[i].nextElementSibling.style.display = 'none';
                }
            }
            this.title = '批量选择'
        }

        // 全选按钮
        allBtn.addEventListener('click', function () {
            if (allBtn.checked) {
                // 全选
                for (let i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].checked = true;
                }
            } else {// 全不选
                for (let i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].checked = false;
                }
            }

        })

        // 批量选择的删除
        chooseBtns[2].addEventListener('click', function () {
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    clickDel(checkboxes[i]);
                }
            }
            if (allBtn.checked) {
                allBtn.checked = false;
            }
        })

        // 选择单选框时控制全选框的状态
        for (let i = 0; i < checkboxes.length; i++) {
            checkboxes[i].addEventListener('click', function () {
                for (let i = 0; i < checkboxes.length; i++) {
                    if (checkboxes[i].checked) {
                        allBtn.checked = true;
                    } else {
                        allBtn.checked = false;;
                        break;
                    }
                }
            })
        }

        // 批量添加歌单
        let plBtn = chooseBtns[1];
        plBtn.addEventListener('click', function () {
            // 如果未登录，唤起登陆界面
            let user = window.localStorage.user;
            if (!user) {
                displayLogin();
                return;
            }

            // 获取所有id
            let tracks = [];
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    tracks.push(checkboxes[i].parentNode.getAttribute('src-id'));
                }
            }
            // 添加到歌单
            clickAdd(userId, tracks.join(','), null, playlistData);

        })
    })



    // 删除全部
    let delAll = document.querySelector('.playlist_now_del');
    delAll.addEventListener('click', function () {
        let parent = document.querySelector('.playlist_body');
        if (parent.children.length != 0) {
            audio.pause();
            audio.src = '';
            audioArr = [];
            playlist = [];
            window.localStorage.playlists = '';
            index = 0;

            msgPop('列表中没有歌曲了，快去添加感兴趣的音乐吧！');

            // 删除
            parent.innerHTML = '快去添加感兴趣的音乐吧！';
        }
    })

    // 喜欢按钮
    let likeBtn = document.querySelector('.info_btns').children[0];
    likeBtn.addEventListener('click', function () {
        let user = window.localStorage.user;
        // 如果未登录
        if (!user) {
            // 唤起登陆界面
            displayLogin();
            return;
        }
        let bool = false;// 判断该歌曲用户是否已喜欢
        if (this.getAttribute('src-like') == 1) {
            bool = true;
        }
        ajax({
            url: 'http://localhost:3000/like',
            data: {
                id: playlist[index],
                like: bool
            },
            success: function () {
                if (bool) {
                    msgPop('喜欢成功！');
                    likeBtn.className = 'iconfont liked';
                    likeBtn.setAttribute('src-like', 0);
                } else {
                    msgPop('取消成功！');
                    likeBtn.className = 'iconfont';
                    likeBtn.setAttribute('src-like', 1);
                }
            }
        })
    })

    // 收藏按钮
    let addBtn = document.querySelector('.info_btns').children[1];
    addBtn.addEventListener('click', function () {
        let user = window.localStorage.user;
        if (!user) {
            // 唤起登陆界面
            displayLogin();
            return;
        }
        // 添加到歌单
        clickAdd(userId, playlist[index], null, playlistData);
    })

    // mv 按钮
    let mvBtn = document.querySelector('.info_btns').children[2];
    mvBtn.addEventListener('click', function () {
        let id = this.getAttribute('src-id');
        if (id == 0) {
            return;
        }
        window.open(`mv.html?id=${id}`, '_blank');
    })

    // 评论按钮
    let comment = document.querySelector('.comment');
    let commentBtn = document.querySelector('.info_btns').children[3];
    commentBtn.addEventListener('click', function () {
        comment.style.top = '20px';
    })


    // 将经过改动的数据存储到本地存储中
    function storPlaylist(index) {
        playlist.splice(index, 1);
        let playlists = JSON.parse(window.localStorage.playlists)
        playlists.playlist = playlist;

        if (audioArr.length == 0) {
            playlists.playNow = '';
        }
        window.localStorage.playlists = JSON.stringify(playlists);
    }

    // 将歌曲 url添加到 audioArr数组中
    function getAudioSrc(arr) {

        for (let i = arr.length - 1; i >= 0; i--) {
            audioArr.unshift(`https://music.163.com/song/media/outer/url?id=${arr[i]}.mp3`);
        }

    }

    // 点击歌曲的删除按钮删除该歌曲
    function clickDel(that) {

        // 获取所要删歌曲的索引
        let songIndex = parseInt(that.parentNode.getAttribute('src-index'));

        // 如果该歌曲正在播放，播放下一首歌曲
        if (songIndex == index) {
            // 删除src数组中对应的src
            audioArr.splice(songIndex, 1);
            // 如果删完后列表中已经没有歌曲了
            if (audioArr.length == 0) {
                msgPop('列表中没有歌曲了，快去添加感兴趣的音乐吧！');
                document.querySelector('.playlist_body').innerHTML = '快去添加感兴趣的音乐吧！'
                audio.pause();
                goBack();
                storPlaylist(songIndex);
            } else {
                if (index == audioArr.length) {
                    index = 0;
                }
                audio.src = audioArr[index];
                audio.play();

                // 删除播放列表和本地存储中对应的数据
                storPlaylist(songIndex);

                // 播放下一首歌曲的准备工作
                renderData();
                goBack();

            }

        } else {
            // 删除src数组中对应的src
            audioArr.splice(songIndex, 1);

            // 删除播放列表和本地存储中对应的数据
            storPlaylist(songIndex);
        }

        // 在播放列表中删除该歌曲
        let parent = that.parentNode;
        parent.parentNode.removeChild(parent);

        let playItems = playlistBd.children;
        // 重新赋予 src-index
        for (let i = songIndex; i < playItems.length; i++) {
            playItems[i].setAttribute('src-index', i);
        }
    }

    // 点击歌曲的播放按钮播放该歌曲
    function clicktoPlay(that) {
        index = parseInt(that.parentNode.getAttribute('src-index'));
        lyric.style.top = 0;
        lineNow = 0;
        progress.style.width = '0%';
        audio.src = audioArr[index];
        audio.play();
        // 渲染这首歌曲的数据
        renderData();

    }



    // 歌曲播放完后的切换
    audio.addEventListener('ended', function () {
        // 顺序播放
        if (style === 'order') {
            audio.loop = false;
            index++;
            index = index === audioArr.length ? index = 0 : index;

            renderData();
            audio.src = audioArr[index];

            goBack();

        } else if (style === 'cycle') {// 单曲循环
            lyric.style.top = 0;
            lineNow = 0;
            progress.style.width = '0%';

            audio.loop = true;
            audio.play();

        } else if (style === 'random') {// 随机播放
            audio.loop = false;
            let num = index;
            while (num === index) {
                num = Math.round(Math.random() * (audioArr.length - 1));
            }
            index = num;

            renderData();

            audio.src = audioArr[index];

            goBack();
        }
    })


    // 缓存条
    let loadBar = player.querySelector('.player_progress_buffer');
    audio.addEventListener('timeupdate', function () {
        let buffer = audio.buffered;
        if (buffer.length != 0) {
            // 已缓冲的时长
            let timeLoaded = buffer.end(buffer.length - 1);
            loadBar.style.width = (timeLoaded / audio.duration) * 100 + '%';
        }
    })

    // 进度条
    let progress = player.querySelector('.player_progress_bar');

    // 播放功能
    audio.addEventListener('error', function () {
        if (!audio.src.includes('html')) {
            msgPop('当前资源不可用，换首歌试试吧~~');
            changePlayer(true);
        }

    })
    audio.addEventListener('canplay', function () {
        audio.play();
    })
    audio.addEventListener('pause', function () {
        changePlayer(true);
    })
    audio.addEventListener('play', function () {
        changePlayer(false);
        let playlists = JSON.parse(window.localStorage.playlists);
        playlists.playNow = playlist[index];
        playlists.type = false;
        window.localStorage.playlists = JSON.stringify(playlists);

    })

    // 改变播放按钮
    function changePlayer(bool) {
        if (bool) {
            playerBtn.innerHTML = '&#xe60f;';
            playerBtn.title = '播放';
            return;
        }
        playerBtn.innerHTML = '&#xe638;';
        playerBtn.title = '暂停';
    }

    // 点击播放按钮
    let playerBtn = player.querySelector('.player_stop');
    playerBtn.addEventListener('click', function () {
        if (this.title === '播放') {
            audio.play();
        } else {
            audio.pause();
        }
    })

    // 按空格键也能控制播放暂停
    window.addEventListener('keyup', function (e) {
        if (e.key === ' ') {
            playerBtn.click();
        }
    })

    // 上一首、下一首
    let previous = document.querySelector('.player_previous');
    // 上一首
    previous.addEventListener('click', function () {

        index--;
        index = index < 0 ? audioArr.length - 1 : index;

        audio.src = audioArr[index];
        audio.play();
        renderData();

        goBack();
    })
    let next = document.querySelector('.player_next');
    // 下一首
    next.addEventListener('click', function () {
        // 如果是单曲循环或顺序播放，就播放下一首
        if (style == 'order' || style == 'cycle') {
            index++;
            index = index == audioArr.length ? 0 : index;
        } else if (style == 'random') {// 如果是随机播放，则随机播放一首
            let num = index;
            while (num === index) {
                num = Math.round(Math.random() * (audioArr.length - 1));
            }
            index = num;
        }

        audio.src = audioArr[index];
        audio.play();

        renderData();
        goBack();
    })


    // 拖拽进度条
    let progressBar = progress.parentNode;
    let dragFlag = false;// 判断当前进度条是否被拖动
    progress.onmousedown = function (e) {

        // 获得进度条当前的宽度
        let width = parseInt(progress.style.width);

        // 到视口左端的距离
        let left = progress.getBoundingClientRect().left;
        let num = null;
        document.onmousemove = function (e) {

            dragFlag = true;
            // 
            num = (e.clientX - left) / progressBar.offsetWidth;
            if (num > 1) {
                num = 1;
            }
            if (num < 0) {
                num = 0;
            }
            // 时间也跟着改变
            current.innerHTML = getTime(num * audio.duration * 1000);

            progress.style.width = num * 100 + "%";


            return false;
        };

        document.onmouseup = function () {

            dragFlag = false;
            document.onmousemove = null;
            document.onmouseup = null;

            audio.currentTime = num * audio.duration;


            // 歌词位置跟着改变
            lyricChange(width - num * 100);

        }

    };



    // 点击进度条调节进度
    progressBar.addEventListener('click', function (e) {

        let long = e.clientX - progress.getBoundingClientRect().left;
        let num = long / progressBar.offsetWidth;

        // 获得当前的宽度
        let width = parseInt(progress.style.width);

        progress.style.width = num * 100 + '%';
        audio.currentTime = audio.duration * num;

        // 歌词
        lyricChange(width - num * 100);
    })

    // 改变歌词位置
    function lyricChange(flag) {

        let items = lyric.children;// 含歌词的伪数组
        // 如果当前歌曲是纯音乐，返回
        if (items.length <= 1) {
            return;
        }

        let currentTime = audio.currentTime;

        if (lineNow >= items.length) {
            lineNow = items.length - 1;
        }
        // 快进情况
        if (flag < 0) {

            for (let i = lineNow - 1; i < items.length; i++) {
                items[i].className = '';// 取消高亮
                let time = parseFloat(items[lineNow].getAttribute('src-time'));
                if (time < currentTime) {
                    lineNow++;
                    if (lineNow >= items.length) {
                        lineNow = items.length - 1;
                    }
                } else {
                    lineNow--;
                    break;
                }
            }

        } else {// 快退情况
            for (let i = lineNow; i >= 0; i--) {
                items[i].className = '';
                let time = parseFloat(items[i].getAttribute('src-time'));
                if (time < currentTime) {
                    lineNow = i;
                    break;
                }
            }
        }

        items[lineNow].className = 'lyric_highlight';

        // 歌词滚动
        let height = lyric.offsetTop;
        if (lyricFlag) {
            // 当前句距离歌词顶部的距离
            let long = items[lineNow].getBoundingClientRect().top - lyricTop;
            if (long > 125 || (long < -20 && lineNow > 0)) {
                lyric.style.top = height - long + 120 + 'px';
            }
        }

        lineNow++;
    }

    // 歌曲进度条
    audio.addEventListener('timeupdate', function () {
        // 如果当前进度条未被拖动
        if (!dragFlag) {
            let num = (audio.currentTime / audio.duration) * 100;
            progress.style.width = num + '%';
        }

    })

    // 按下键盘 ➡、⬅ 快进、快退
    window.addEventListener('keyup', function (e) {
        // 获得当前的宽度
        let width = parseInt(progress.style.width);
        let num;
        // 快退
        if (e.key == 'ArrowLeft') {
            // 获得比例
            num = (audio.currentTime / audio.duration) - 0.05;
            if (num < 0) {
                num = 0;
            }

            progress.style.width = num * 100 + '%';
            audio.currentTime = num * audio.duration;

            // 歌词
            lyricChange(width - num * 100);
        }
        // 快进
        if (e.key == 'ArrowRight') {
            // 获得比例
            num = (audio.currentTime / audio.duration) + 0.05;
            if (num > 100) {
                num = 100;
            }

            progress.style.width = num * 100 + '%';
            audio.currentTime = num * audio.duration;

            // 歌词
            lyricChange(width - num * 100);
        }
    })


    // 当前时间
    let current = player.querySelector('.player_body_now');
    audio.addEventListener('timeupdate', function () {
        console.log('lineNow:' + lineNow)

        current.innerHTML = getTime(audio.currentTime * 1000);
    })

    // 播放模式
    let palyerStyle = player.querySelector('.player_style');
    let style = 'order';// 初始模式为顺序播放
    // 顺序播放 单曲循环 随机播放
    palyerStyle.addEventListener('click', function () {
        if (this.title === '顺序播放') {
            this.innerHTML = '&#xe6a2;';
            this.title = '单曲循环';
            style = 'cycle';
        } else if (this.title === '单曲循环') {
            this.innerHTML = '&#xe6a0;';
            this.title = '随机播放';
            style = 'random';
        } else if (this.title === '随机播放') {
            this.innerHTML = '&#xe658;';
            this.title = '顺序播放';
            style = 'order';
        }
    })

    // 音频长度
    let all = player.querySelector('.player_body_all');
    audio.oncanplay = function () {
        all.innerHTML = getTime(audio.duration * 1000);
    }

    // 设置初始音量
    audio.volume = 0.46;
    // 静音功能
    let muted = player.querySelector('.player_voice a');
    muted.addEventListener('click', function () {
        // 如果静音了，就开启声音
        if (audio.muted) {
            audio.muted = false;
            this.innerHTML = '&#xe80c;';
            this.title = '静音';
        } else {
            audio.muted = true;
            this.innerHTML = '&#xe621;';
            this.title = '开启声音';
        }
    })

    // 拖动音量条调节声音
    let voice = player.querySelector('.player_voice_progress');
    voice.style.width = '46%';// 初始宽
    voice.onmousedown = function () {
        let left = voice.getBoundingClientRect().left;

        document.onmousemove = function (e) {
            let num = (e.clientX - left) / voice.parentNode.offsetWidth;
            if (num > 1) {
                num = 1;
            }
            if (num < 0) {
                num = 0;
            }

            voice.style.width = num * 100 + "%";

            audio.volume = num;

            return false;
        };

        document.onmouseup = function () {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };

    // 按键盘 ⬆、⬇键调节音量
    window.addEventListener('keyup', function (e) {
        // 键盘 ⬆ 键
        if (e.key === 'ArrowUp') {
            // 如果当前已静音，返回
            if (audio.muted) {
                return;
            }
            let num = audio.volume + 0.1;
            if (num > 1) {
                num = 1;
            }
            audio.volume = num;

            voice.style.width = num * 100 + '%';
        }
        // 键盘 ⬇ 键
        if (e.key === 'ArrowDown') {
            // 如果当前已静音，返回
            if (audio.muted) {
                return;
            }
            let num = audio.volume - 0.1;
            if (num < 0) {
                num = 0;
            }
            audio.volume = num;

            voice.style.width = num * 100 + '%';
        }
    })
    // 点击音量条调节音量
    let voiceBar = voice.parentNode;
    voiceBar.addEventListener('click', function (e) {
        let long = e.clientX - voiceBar.getBoundingClientRect().left;
        let num = long / voiceBar.offsetWidth;
        voice.style.width = num * 100 + '%';
        audio.volume = num;
    })

    // 歌词
    let lyric = document.querySelector('.lyric_content');
    // 获取歌词
    function getLyric(id) {
        ajax({
            url: 'http://localhost:3000/lyric',
            data: {
                id: id
            },
            success: function (data) {
                // 渲染歌词到页面中
                renderLrc(data, lyric, audio.addEventListener('timeupdate', function () {
                    lyricHighlight();
                }))

                lyric.style.top = 0;
                lineNow = 0;
            }
        })
    }
    // 渲染歌词到页面中
    function renderLrc(data, obj, callback) {
        // 如果是纯音乐
        if (!data.lrc) {
            obj.innerHTML = '<p>该歌曲为纯音乐</p>';
            return;
        }

        // 翻译
        let trans = [];
        let transArr = [];
        if (data.tlyric.lyric.length !== 0) {
            transArr = data.tlyric.lyric.split('\n');
            trans = transArr.map(value => {
                let content = value.substr(value.indexOf(']') + 1);

                let str = content.substr(0, 1);
                if (str.includes(' ')) {
                    content = content.replace(/ /, '');// 去掉前面空格
                }


                return `<span>${content}</span>`
            });
        }

        // 正式歌词
        let arr = data.lrc.lyric.split('\n');
        arr.pop();

        ps = arr.map((value, index) => {
            let min = parseFloat(value.substr(value.indexOf('[') + 1, value.indexOf(':') - 1));
            let s = parseFloat(value.substr(value.indexOf(':') + 1, value.indexOf(']') - 1));
            let content = value.substr(value.indexOf(']') + 1);

            let str = content.substr(0, 1);
            if (str.includes(' ')) {
                content = content.replace(/ /, '');// 去掉前面空格
            }

            // 如果有翻译
            if (transArr.length !== 0) {
                let time = value.substr(value.indexOf('['), value.indexOf(']') - 1);
                let transIndex;
                transArr.forEach((value, index) => {
                    if (value.includes(time)) {
                        transIndex = index;
                        index = transArr.length;
                    }
                })
                return `<p src-time=${(min * 60 + s).toFixed(3)}>${content}
                ${transIndex !== undefined ? `<br>${trans[transIndex]}` : ''}</p>`

            } else {
                return `<p src-time=${(min * 60 + s).toFixed(3)}>${content}</p>`
            }

        }).join('');

        let node = document.createRange().createContextualFragment(ps);
        obj.innerHTML = '';
        obj.appendChild(node);

        callback && callback();
    }

    let lineNow = 0;// 当前歌词是第几行
    const lyricTop = lyric.parentNode.getBoundingClientRect().top;

    // 歌词实时高亮
    function lyricHighlight() {

        let lines = lyric.children;// 所有歌词
        let now = parseFloat(audio.currentTime);

        if (lineNow >= lines.length || lines.length <= 1) {
            return;
        }

        if (parseFloat(lines[lineNow].getAttribute('src-time')) <= now) {

            if (lineNow >= 1) {
                lines[lineNow - 1].className = '';
            }

            lines[lineNow].className = 'lyric_highlight';
            // 歌词滚动
            let height = lyric.offsetTop;
            if (lyricFlag) {
                // 当前句距离歌词顶部的距离
                let long = lines[lineNow].getBoundingClientRect().top - lyricTop;
                if (long > 125 || (long < -20 && lineNow > 0)) {
                    lyric.style.top = height - long + 120 + 'px';
                }
            }

            lineNow++;
        }
    }

    // 歌曲播放前的准备工作
    function goBack() {
        getLyric(playlist[index]);
        lyric.style.top = 0;
        lineNow = 0;
        progress.style.width = '0%';
    }

    // 拖拽歌词
    let lyricFlag = true;// 判断歌词是否在滚动
    let lyricTimer;
    lyric.addEventListener('mousedown', function (e) {
        if (lyric.children.length <= 1) {
            return;
        }

        if (lyricTimer) {
            clearInterval(lyricTimer);
        }

        lyric.style.transition = 'top 0s';

        let long = e.clientY - lyric.offsetTop;
        document.onmousemove = function (e) {
            lyricFlag = false;
            let top = e.clientY - long;
            lyric.style.top = top + "px";
            return false;
        };
        document.onmouseup = function () {
            lyricTimer = setInterval(() => {
                lyric.style.transition = 'top .6s';
                lyricFlag = true;
                clearInterval(lyricTimer);
                lyricTimer = null;
            }, 1000)
            document.onmousemove = null;
            document.onmouseup = null;
        };
        return false;
    })



    // 评论区
    let pid = {
        type: 0
    };


    // 关闭评论
    let commentClose = document.querySelector('.comment_close');
    commentClose.addEventListener('click', function () {
        comment.style.top = '100%';
    })

    // 发表评论
    // 输入时实时显示剩余可输入文字的数量
    let commentInput = document.querySelector('.comment_input');
    let textarea = commentInput.querySelector('textarea');
    textarea.oninput = function () {
        this.nextElementSibling.children[0].innerHTML = `${300 - this.value.length}`;
    }
    // 点击发表按钮发表评论
    let post = commentInput.querySelector('.comment_post');
    post.onclick = function () {
        // 如果未登录
        let user = window.localStorage.user;
        if (!user) {
            //唤起登录界面
            displayLogin();
            return;
        }
        let regValue = textarea.value.replace(/^\s*|\s*$/g, '');
        if (regValue.length > 0 && regValue.length <= 300) {
            ajax({
                url: 'http://localhost:3000/comment',
                data: {
                    t: 1,
                    type: pid.type,
                    id: playlist[index],
                    content: textarea.value
                },
                success: function (data) {
                    if (data.code == 200) {
                        msgPop('发表成功！');
                        // 让最新评论数加1
                        getCommentCount(document.querySelector('.comment_bd_new_wrapper .comment_bd_title'));

                        data = data.comment;
                        let ul = document.createElement('ul');
                        ul.className = 'comment_bd_content';
                        ul.innerHTML = `<li class="comment_bd_item" src-cid="${data.commentId}">
                        <img class="comment_bd_pic" src=${data.user.avatarUrl}>
                        <div class="comment_bd_info">
                            <h5 class="comment_bd_name">${data.user.nickname}</h5>
                            <p class="comment_bd_text">${data.content}</p>
                            <p class="comment_reply"></p>
                            <i class="comment_bd_time">${getYearTime(data.time)}</i>
                            <a href="javascript:;" class="comment_bd_praise" src-t=1><i class="iconfont">${'&#xe613;'}</i>0</a>
                            <a href="javascript:;" class="comment_bd_commentHim"></a>
                        </div>
                        <div class="comment_input">
                            <textarea name="" id="" cols="30" rows="10" placeholder="回复@${data.user.nickname}."></textarea>
                            <em class="comment_warn">剩余 <span class="highlight">300</span> 字</em>
                            <a href="javascript:;" class="comment_face"></a>
                            <button class="comment_post">回复</button>
                            <button class="comment_cancel">取消</button>
                        </div>
                    </li>`
                        textarea.value = '';

                        let commentContent = document.querySelector('.comment_bd_new_wrapper').children;
                        commentContent.length === 1 ? commentContent[0].parentNode.appendChild(ul) : commentContent[0].parentNode.insertBefore(ul, commentContent[1]);

                        let li = ul.children[0];
                        li.querySelector('.comment_bd_commentHim').onclick = function () {
                            commentReply(this);
                        }
                        li.querySelector('.comment_post').onclick = function () {
                            commentPost(this);
                        }
                        li.querySelector('.comment_cancel').onclick = function () {
                            cancelComment(this);
                        }
                        let praiseComment = debounce(praiseFn);
                        li.querySelector('.comment_bd_praise').onclick = function () {
                            praiseComment(this);
                        }
                        li.querySelector('textarea').oninput = function () {
                            commentonInput(this);
                        }

                    } else {
                        if (data.code == 250 && data.dialog.subtitle) {
                            msgPop(data.dialog.subtitle);
                        } else {
                            msgPop('出现错误，稍等一下再试试吧~');
                        }
                    }

                },
                error: function (data) {
                    if (data.code == 250 && data.dialog.subtitle) {
                        msgPop(data.dialog.subtitle);
                    } else {
                        msgPop('出现错误，稍等一下再试试吧~');
                    }
                }
            })
        } else if (regValue.length > 300) {
            msgPop('字数超出了哦！');
        } else {
            msgPop('客官请先输入内容哦！');
        }
    }



    // 获得精彩评论
    let hotPage = 0;// 当前页数-1
    function getHotComment(pid) {
        ajax({
            url: 'http://localhost:3000/comment/hot',
            data: {
                id: playlist[index],
                type: pid.type,
                offset: hotPage * 10,
                timerstamp: +new Date()
            },
            success: function (data) {
                loadHotComment(data, document.querySelector('.comment_bd_good_wrapper'));

                hotPage++;
            }
        })
    }

    // 渲染精彩评论
    function loadHotComment(data, wrapper, fn) {
        // 渲染总数量
        let title = wrapper.children[0];
        title.innerHTML = `精彩评论(${data.total})`;

        let ul = document.createElement('ul');
        ul.className = 'comment_bd_content';
        ul.innerHTML = data.hotComments.map(value => {
            return `<li class= "comment_bd_item" src-cid="${value.commentId}" >
    <img src="${value.user.avatarUrl}"
        class="comment_bd_pic">
    <div class="comment_bd_info">
        <h5 class="comment_bd_name">${value.user.nickname}</h5>
        <p class="comment_bd_text">${value.beReplied.length !== 0 ? `回复 @<span class="highlight">${value.beReplied[0].user.nickname}</span>: ${value.content}` : value.content}</p>
        <p class="comment_reply">${value.beReplied.length !== 0 ? value.beReplied[0].content : ''}</p>
        <i class="comment_bd_time">${getYearTime(value.time)}</i>
        ${value.liked ? `<a href="javascript:;" class="comment_bd_praise highlight" src-t=0><i class="iconfont">${'&#xe613;'}</i>${value.likedCount}</a>` : `<a href="javascript:;" class="comment_bd_praise" src-t=1><i class="iconfont">${'&#xe613;'}</i>${value.likedCount}</a>`}
        <a href="javascript:;" class="comment_bd_commentHim"></a>
        </div>
    <div class="comment_input">
        <textarea name="" id="" cols="30" rows="10" placeholder="回复@${value.user.nickname}"></textarea>
        <em class="comment_warn">剩余 <span class="highlight">300</span> 字</em>
        <a href="javascript:;" class="comment_face"></a>
        <button class="comment_post">回复</button>
        <button class="comment_cancel">取消</button>
    </div>
</li>`}).join('') + `${data.hasMore ? `<a href="javascript:;" class="load_more">点击加载更多 ∨</a>` : ``}`;

        wrapper.appendChild(ul);

        coomentBasis(ul, getHotComment);
    }

    // 获取最新评论
    let newPage = 1;// 当前页数
    let newCursor = null;// 上一页的 time
    function getNewComment(pid) {
        ajax({
            url: 'http://localhost:3000/comment/new',
            data: {
                id: playlist[index],
                type: pid.type,
                pageNo: newPage,
                sortType: 3,
                cursor: newCursor,
                timerstamp: +new Date()
            },
            success: function (data) {
                data = data.data;
                newPage++;
                newCursor = data.cursor;

                loadNewComment(data, document.querySelector('.comment_bd_new_wrapper'))
            }
        })
    }

    // 渲染最新评论
    function loadNewComment(data, wrapper) {
        // 渲染总数量
        let title = wrapper.children[0];
        title.innerHTML = `最新评论(${data.totalCount})`;

        let ul = document.createElement('ul');
        ul.className = 'comment_bd_content';
        ul.innerHTML = data.comments.map(value => {

            return `<li class="comment_bd_item" src-cid="${value.commentId}">
    <img src="${value.user.avatarUrl}"
        class="comment_bd_pic">
    <div class="comment_bd_info">
        <h5 class="comment_bd_name">${value.user.nickname}</h5>
        <p class="comment_bd_text">${value.beReplied ? `回复 @<span class="highlight">${value.beReplied[0].user.nickname}</span>: ${value.content}` : value.content}</p>
        <p class="comment_reply">${value.beReplied ? value.beReplied[0].content : ''}</p>
        <i class="comment_bd_time">${getYearTime(value.time)}</i>
        ${value.liked ? `<a href="javascript:;" class="comment_bd_praise highlight" src-t=0><i class="iconfont">${'&#xe613;'}</i>${value.likedCount}</a>` : `<a href="javascript:;" class="comment_bd_praise" src-t=1><i class="iconfont">${'&#xe613;'}</i>${value.likedCount}</a>`}
        <a href="javascript:;" class="comment_bd_commentHim"></a>
        </div>
    <div class="comment_input">
        <textarea name="" id="" cols="30" rows="10" placeholder="回复@${value.user.nickname}"></textarea>
        <em class="comment_warn">剩余 <span class="highlight">300</span> 字</em>
        <a href="javascript:;" class="comment_face"></a>
        <button class="comment_post">回复</button>
        <button class="comment_cancel">取消</button>
    </div>
</li> `
        }).join('') + `${data.hasMore ? `<a href="javascript:;" class="load_more">点击加载更多 ∨</a>` : ''}`;

        wrapper.appendChild(ul);

        coomentBasis(ul, getNewComment);
    }



    // 点击回复显示输入框
    function commentReply(that) {
        that.parentNode.parentNode.className = 'comment_bd_item comment_feedback';
    }
    // 点击取消按钮取消评论，隐藏输入框
    function cancelComment(that) {
        that.parentNode.children[0].value = '';
        that.parentNode.parentNode.className = 'comment_bd_item';
    }
    // 点击回复按钮回复评论
    function commentPost(that) {
        let textarea = that.parentNode.children[0];
        let replyedContent = that.parentNode.parentNode.querySelector('.comment_bd_text').innerHTML;
        let regValue = textarea.value.replace(/^\s*|\s*$/g, '');
        if (regValue.length > 0 && regValue.length <= 300) {
            ajax({
                url: 'http://localhost:3000/comment',
                data: {
                    t: 2,
                    type: pid.type,
                    id: playlist[index],
                    content: textarea.value,
                    commentId: parseInt(that.parentNode.parentNode.getAttribute('src-cid'))
                },
                success: function (data) {
                    if (data.code == 200) {
                        msgPop('回复成功！');
                        that.parentNode.parentNode.className = 'comment_bd_item';
                        that.parentNode.children[0].value = '';

                        data = data.comment;
                        let ul = document.querySelector('.comment_bd_new_wrapper ul');
                        let oldLi = ul.children[0];
                        let li = ul.children[0].cloneNode(true);

                        li.srcCid = data.commentId;
                        let name = li.querySelector('.comment_bd_name');
                        name.innerHTML = data.user.nickname;
                        let avatar = li.querySelector('.comment_bd_pic');
                        avatar.src = data.user.avatarUrl;
                        let text = li.querySelector('.comment_bd_text');
                        text.innerHTML = `${data.beRepliedUser.nickname ? `回复 @<span class="highlight">${data.beRepliedUser.nickname}</span>: ${data.content}` : `${data.content}`
                            } `;
                        let reply = li.querySelector('.comment_reply');
                        reply.innerHTML = replyedContent;
                        let textarea = li.querySelector('textarea');
                        textarea.value = '';
                        let praise = li.querySelector('.comment_bd_praise');
                        praise.setAttribute('src-t', 1);
                        praise.className = 'comment_bd_praise';
                        praise.innerHTML = `<i class="iconfont">${'&#xe613;'}</i>0`;
                        let time = li.querySelector('.comment_bd_time');
                        time.innerHTML = getYearTime(data.time);

                        ul.insertBefore(li, oldLi);

                        // 事件
                        li.querySelector('.comment_bd_commentHim').onclick = oldLi.querySelector('.comment_bd_commentHim').onclick;
                        li.querySelector('.comment_post').onclick = oldLi.querySelector('.comment_post').onclick;
                        li.querySelector('.comment_cancel').onclick = oldLi.querySelector('.comment_cancel').onclick;
                        let praiseComment = debounce(praiseFn);
                        li.querySelector('.comment_bd_praise').onclick = function () {
                            praiseComment(this);
                        }
                        li.querySelector('textarea').oninput = oldLi.querySelector('textarea').oninput;


                    } else {
                        if (data.code == 250 && data.dialog.subtitle) {
                            msgPop(data.dialog.subtitle);
                        } else {
                            msgPop('出现错误，稍等一下再试试吧~');
                        }

                    }

                },
                error: function () {
                    msgPop('出现错误，稍等一下再试试吧~');
                }
            })
        } else if (regValue.length > 300) {
            msgPop('字数超出了哦！');
        } else {
            msgPop('客官请先输入内容哦！');
        }
    }
    // 输入时实时显示剩余可输入文字的数量
    function commentonInput(that) {
        that.nextElementSibling.children[0].innerHTML = `${300 - that.value.length}`;
    }
    // 点赞/取消点赞
    function praiseFn(that) {
        // 如果未登录
        let user = window.localStorage.user;
        if (!user) {
            //唤起登录界面
            displayLogin();
            return;
        }
        let t = parseInt(that.getAttribute('src-t'));
        ajax({
            url: 'http://localhost:3000/comment/like',
            data: {
                id: playlist[index],
                cid: parseInt(that.parentNode.parentNode.getAttribute('src-cid')),
                t: t,
                type: pid.type
            },
            success: function (data) {
                if (data.code == 200) {
                    if (t == 1) {
                        that.className = 'comment_bd_praise highlight';
                        that.innerHTML = `<i class="iconfont">${'&#xe613;'}</i>${parseInt(that.textContent.match(/\d/g).join('')) + 1}`;
                        that.setAttribute('src-t', 0)

                        msgPop('对方已经收到你的点赞啦！');
                    } else if (t === 0) {
                        that.className = 'comment_bd_praise';
                        that.innerHTML = `<i class="iconfont">${'&#xe613;'}</i>${parseInt(that.textContent.match(/\d/g).join('')) - 1}`;
                        that.setAttribute('src-t', 1)

                        msgPop('取消成功！');
                    }
                } else {
                    if (data.code == 250 && data.dialog.subtitle) {
                        msgPop(data.dialog.subtitle);
                    } else {
                        msgPop('出现错误，稍等一下再试试吧~');
                    }
                }
            },
            error: function (data) {
                if (data.code == 250 && data.dialog.subtitle) {
                    msgPop(data.dialog.subtitle);
                } else {
                    msgPop('出现错误，稍等一下再试试吧~');
                }
            }
        })
    }
    // 评论区所有功能
    function coomentBasis(ul, fn) {
        // 点击回复显示输入框
        let commentItems = ul.querySelectorAll('.comment_bd_commentHim');
        for (let i = 0; i < commentItems.length; i++) {
            commentItems[i].onclick = function () {
                commentReply(this);
            }
        }

        // 点击取消按钮取消评论，隐藏输入框
        let cancelBtns = ul.querySelectorAll('.comment_cancel');
        for (let i = 0; i < cancelBtns.length; i++) {
            cancelBtns[i].onclick = function () {
                cancelComment(this);
            }
        }

        // 输入时实时显示剩余可输入文字的数量
        let textItems = ul.querySelectorAll('textarea');
        for (let i = 0; i < textItems.length; i++) {
            textItems[i].oninput = function () {
                commentonInput(this);
            }
        }

        // 点赞/取消点赞
        let praiseBtns = ul.querySelectorAll('.comment_bd_praise');
        let praiseComment = debounce(praiseFn);
        for (let i = 0; i < praiseBtns.length; i++) {
            praiseBtns[i].onclick = function () {
                praiseComment(this);
            }
        }

        // 点击回复按钮回复评论
        let postItem = ul.querySelectorAll('.comment_post');
        for (let i = 0; i < postItem.length; i++) {
            postItem[i].onclick = function () {
                // 如果未登录
                let user = window.localStorage.user;
                if (!user) {
                    //唤起登录界面
                    displayLogin();
                    return;
                }
                commentPost(this);
            }
        }

        // 下一页接口
        let load = ul.querySelector('.load_more');
        if (load) {
            load.onclick = function () {
                fn(pid);

                this.parentNode.removeChild(this);
            }
        }
    }



})