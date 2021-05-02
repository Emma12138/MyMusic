

window.addEventListener('load', function () {

    // 获取用户id
    let userId;
    let userData;
    if (window.localStorage.user) {
        userData = JSON.parse(window.localStorage.getItem('user'));
        userId = userData.account.id;
    }

    // 监听更新播放列表
    window.addEventListener('storage', function (e) {
        console.log(e)

        let playlists = JSON.parse(window.localStorage.playlists);
        playlist = playlists.playlist;
        let playNow = playlists.playNow;

        let num = JSON.parse(window.localStorage.newNum);// 一共有 num 条新数据

        let newList = playlist.slice(0, num);
        //
        getAudioSrc(newList);

        console.log(playlist)

        if (e.key == 'playlists') {
            if (playNow != null) {
                index = 0;

                // 更新播放列表的数据
                getSongsDetail(newList, function () {
                    // 加载第一条歌曲的数据
                    renderData();
                });

                audio.src = audioArr[0];
                audio.play();
            } else {
                // 更新播放列表的数据
                getSongsDetail(newList);
            }

        }
    })



    // 获取喜欢音乐列表，用于判断某歌曲是否已喜欢
    let likelist = [];
    if (userId) {
        ajax({
            url: 'http://localhost:3000/likelist',
            data: {
                uid: userId
            },
            success: function (data) {
                likelist = data.ids;
            }
        })
    }

    // 获取用户的歌单。用于将歌曲添加到歌单
    let playlistData;
    ajax({
        url: 'http://localhost:3000/user/playlist',
        data: {
            uid: userId
        },
        success: function (data) {
            playlistData = data.playlist;
        }
    })
    // 登录
    // if (userId) {
    //     ajax({
    //         // async: false,
    //         url: 'http://localhost:3000/login/cellphone',
    //         data: {
    //             phone: 13543902389,
    //             password: 661254
    //         },
    //         success: function (data) {
    //             // 加载用户基本信息
    //             ajax({
    //                 url: 'http://localhost:3000/user/record',
    //                 data: {
    //                     uid: userId,
    //                     type: 1
    //                 },
    //                 success: function (data) {
    //                     console.log(JSON.stringify(data, null, 4));
    //                 }
    //             })
    //         }
    //     })
    // }



    // 阻止按下键盘一些键时浏览器的默认行为
    window.addEventListener('keydown', function (e) {
        e.preventDefault();
    })


    let player = document.querySelector('.player')
    let audio = document.querySelector('audio');
    let index = 0;// 当前播放歌曲的索引


    // 获取播放列表
    // window.localStorage.removeItem('playlist')
    let playlist = [];
    let audioArr = [];
    let playlistBd = document.querySelector('.playlist_body');

    // window.localStorage.removeItem('playlist')
    if (!window.localStorage.playlists) {
        let playlists = {
            playlist: [],
            playNow: null
        }
        window.localStorage.playlists = JSON.stringify(playlists);
    } else {
        playlist = JSON.parse(window.localStorage.playlists).playlist;// 存放的是歌曲id

        if (playlist.length !== 0) {
            // 获取播放列表的所有歌曲的详细信息
            getSongsDetail(playlist, function () {
                // 加载第一条歌曲的数据
                renderData();
            });

            // 获得播放列表的歌曲的url
            getAudioSrc(playlist);

            if (audioArr[0] == '404') {
                msgPop('该歌曲暂无版权，换首歌试试吧~');
                return;
            } else {
                audio.src = audioArr[0];
            }

            // getLyric(playlist[0]);
        }

    }

    // 获取播放列表的所有歌曲的详细信息
    function getSongsDetail(arr, fn) {

        let ids;
        if (arr.length == 1) {
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

    // 渲染歌曲播放时的数据
    function renderData() {

        // 获取歌词
        getLyric(playlist[index]);

        ajax({
            url: 'http://localhost:3000/song/detail',
            data: {
                ids: playlist[index]
            },
            success: function (data) {
                data = data.songs[0];

                let obj = {
                    name: data.name,
                    singer: data.ar[0].name,
                    sId: data.ar[0].id,
                    album: data.al.name,
                    aId: data.al.id,
                    avatar: data.al.picUrl,
                    mv: data.mv
                }

                baseData(obj);

            }
        })

    }
    // 渲染基本数据
    function baseData(obj) {
        // 头部
        document.querySelector('title').innerHTML = `▶&nbsp;${obj.name}`;

        // 播放列表部分
        let plName = document.querySelector('.playlist_now_name');
        plName.innerHTML = obj.name;

        let plSinger = document.querySelector('.playlist_now_singer');
        plSinger.innerHTML = obj.singer;

        // 
        let plBtn = document.querySelectorAll('.playlist_item_play');
        for (let i = 0; i < plBtn.length; i++) {
            display(plBtn[i]);
            display(plBtn[i].previousElementSibling, false);
            plBtn[i].parentNode.className = 'playlist_item';
        }
        display(plBtn[index], false);

        let plItem = document.querySelector('.playlist_body').children;
        display(plItem[index].children[1]);// 动图
        plItem[index].className = 'playlist_item playlist_item_now';

        // 封面
        let pic = document.querySelector('.song_pic');
        pic.src = obj.avatar;

        // 喜欢按钮
        let likeBtns = document.querySelector('.info_btns').children[0];
        if (likelist.includes(playlist[index])) {
            likeBtns.setAttribute('src-like', 0);// 已喜欢
            likeBtns.className = 'iconfont liked';
        } else {
            likeBtns.setAttribute('src-like', 1);// 未喜欢
        }

        // MV 按钮
        let mv = document.querySelector('.info_btns').children[2];
        mv.setAttribute('src-id', obj.mv);


        // 歌词上方信息
        let lrcSong = document.querySelector('.lyric_song');
        lrcSong.innerHTML = obj.name;

        let lrcSinger = document.querySelector('.lyric_singer a');
        lrcSinger.innerHTML = obj.singer;
        lrcSinger.setAttribute('src-id', obj.sId);

        let lrcAl = document.querySelector('.lyric_album a');
        lrcAl.innerHTML = obj.album;
        lrcAl.setAttribute('src-id', obj.aId);

        // 获取评论
        hotPage = 0;
        document.querySelector('.comment_bd_good_wrapper').innerHTML = `<h4 class="comment_bd_title">精彩评论</h4>`;
        document.querySelector('.comment_bd_new_wrapper').innerHTML = `<h4 class="comment_bd_title">最新评论</h4>`;
        getHotComment();
        getNewComment();
    }

    // 显示隐藏播放列表
    let displayPlBtn = document.querySelector('.aside_wrapper').children[2];
    displayPlBtn.addEventListener('mouseover', function () {
        display(this.children[1], 'flex');
    })
    displayPlBtn.addEventListener('mouseout', function () {
        display(this.children[1], false);
    })

    function createFrag(str) {
        return document.createRange().createContextualFragment(str);
    }
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

        if (playlistBd.children.length === 0) {
            playlistBd.innerHTML = newNode;
        } else {
            let node = createFrag(newNode);
            let frag = document.createDocumentFragment();
            frag.appendChild(node);

            playlistBd.insertBefore(frag, playlistBd.children[0]);

            let items = playlistBd.children;
            // 重新赋予 src-index
            for (let i = data.length; i < items.length; i++) {
                items[i].setAttribute('src-index', i);
            }
        }




        // 点击播放列表中的播放按钮播放对应歌曲
        let playlistBtn = document.querySelectorAll('.playlist_item_play');// 播放列表中的播放按钮
        for (let i = 0; i < playlistBtn.length; i++) {
            playlistBtn[i].addEventListener('click', function () {
                clickPlay(this);
            })
        }

        // 点击播放列表中的播放按钮播放对应歌曲
        let playlistDelBtn = document.querySelectorAll('.playlist_item_del');// 播放列表中的播放按钮
        for (let i = 0; i < playlistDelBtn.length; i++) {
            playlistDelBtn[i].addEventListener('click', function () {
                clickDel(this);
            })
        }

        callback && callback();
    }

    // 批量选择
    let choose = document.querySelector('.playlist_now_choose');
    let chooseBtns = document.querySelectorAll('.playlist_btns span');
    choose.addEventListener('click', function () {
        let checkboxes = document.querySelectorAll('.playlist_item input');

        if (this.title === '批量选择') {
            for (let i = 0; i < chooseBtns.length; i++) {
                display(chooseBtns[i]);
            }
            for (let i = 0; i < checkboxes.length; i++) {
                display(checkboxes[i]);
            }
            this.title = '取消'
        } else {
            for (let i = 0; i < chooseBtns.length; i++) {
                display(chooseBtns[i], false);
            }
            for (let i = 0; i < checkboxes.length; i++) {
                display(checkboxes[i], false);
            }
            this.title = '批量选择'
        }

        // 全选按钮
        let allBtn = choose.nextElementSibling.children[0];
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
                    clickDel(checkboxes[i].parentNode.lastElementChild);
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

        // 添加歌单
        let plBtn = chooseBtns[1];
        plBtn.addEventListener('click', function () {
            // 如果未登录，唤起登陆界面
            if (!userId) {
                //////////////////
                return;
            }

            // 获取所有id
            let tracks = [];
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    tracks.push(checkboxes[i].parentNode.getAttribute('src-id'))
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
        if (parent.children.length !== 0) {
            audio.pause();
            audio.src = '';
            audioArr = [];
            playlist = [];
            window.localStorage.playlist = JSON.stringify(playlist);
            index = 0;

            msgPop('暂无歌曲了');

            // 删除
            parent.innerHTML = '';
        }
    })

    // 喜欢按钮
    let likeBtn = document.querySelector('.info_btns').children[0];
    likeBtn.addEventListener('click', function () {
        if (!userId) {
            // 唤起登陆界面
            return;
        }
        let bool;
        if (this.getAttribute('src-like') == 1) {
            bool = true;
        }
        ajax({
            url: 'http://localhost:3000/like',
            data: {
                id: playlist[index],
                like: bool
            },
            success: function (data) {
                if (bool) {
                    msgPop('喜欢成功！');
                    likeBtn.className = 'iconfont liked';
                } else {
                    msgPop('取消成功！');
                    likeBtn.className = 'iconfont';
                }
            }
        })
    })

    // 收藏按钮
    let addBtn = document.querySelector('.info_btns').children[1];
    addBtn.addEventListener('click', function () {
        // 添加到歌单
        clickAdd(userId, playlist[index], null, playlistData);
    })

    // 评论按钮
    let comment = document.querySelector('.comment');
    let commentBtn = document.querySelector('.info_btns').children[3];
    commentBtn.addEventListener('click', function () {
        comment.style.top = '20px';
    })


    // 
    function storPlaylist(index) {
        playlist.splice(index, 1);
        let playlists = JSON.parse(window.localStorage.playlists)
        playlists.playlist = playlist;
        window.localStorage.playlists = JSON.stringify(playlists);
    }

    function getAudioSrc(arr) {

        for (let i = arr.length - 1; i >= 0; i--) {
            audioArr.unshift(`https://music.163.com/song/media/outer/url?id=${arr[i]}.mp3`);
        }

        // arr.forEach((value, index) => {
        //     audioArr.push(`https://music.163.com/song/media/outer/url?id=${value}.mp3`);

        //     判断音乐是否可用
        //     ajax({
        //         url: 'http://localhost:3000/check/music',
        //         data: {
        //             id: value
        //         },
        //         success: function () {

        //             if (index == arr.length - 1) {
        //                 check();
        //                 fn();
        //                 console.log(audioArr);
        //             }
        //         },
        //         error: function () {
        //             errorArr.push(index);
        //         }
        //     })

        // })

        // function check() {
        //     audioArr.forEach((v, index) => {
        //         if (errorArr.includes(index)) {
        //             v = '404';
        //         }
        //     })
        // }

    }

    document.querySelector('.aside_wrapper').children[1].onclick = function () {
        console.log(style);
    }


    // window.localStorage.removeItem('playlist');
    function clickDel(that) {

        // 获取所要删歌曲的索引
        let songIndex = parseInt(that.parentNode.getAttribute('src-index'));

        // 如果该歌曲正在播放，播放下一首歌曲
        if (songIndex === index) {
            // 删除src数组中对应的src
            audioArr.splice(songIndex, 1);

            // 如果删完后列表中已经没有歌曲了
            if (audioArr.length === 0) {
                msgPop('暂无歌曲了');
                audio.pause();
            } else {

                audio.src = audioArr[index];
                audio.play();

                // 删除本地存储中对应的数据
                storPlaylist(songIndex);

                renderData();

                goBack();

            }

        } else {
            // 删除src数组中对应的src
            audioArr.splice(songIndex, 1);

            // 删除本地存储中对应的数据
            storPlaylist(songIndex);
        }

        // 删除
        let parent = that.parentNode;
        parent.parentNode.removeChild(parent);

        let playItems = playlistBd.children;
        // 重新赋予 src-index
        for (let i = songIndex; i < playItems.length; i++) {
            playItems[i].setAttribute('src-index', i);
        }
    }

    function clickPlay(that) {
        index = parseInt(that.parentNode.getAttribute('src-index'));

        audio.src = audioArr[index];

        audio.play();

        renderData();

    }



    // 播放列表播放
    audio.addEventListener('ended', function () {
        // 顺序播放
        if (style === 'order') {
            audio.loop = false;
            index++;
            index = index === audioArr.length ? index = 0 : index;

            renderData();
            audio.src = audioArr[index];

            goBack();

        } else if (style === 'cycle') {
            audio.loop = true;
            audio.play();

        } else if (style === 'random') {
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


    // 缓存
    let loadBar = player.querySelector('.player_progress_buffer');
    audio.addEventListener('timeupdate', function () {
        let flag = true;
        // audio.oncanplaythrough = () => flag = false;
        let buffer = audio.buffered;
        if (flag && buffer.length !== 0) {
            // 已缓冲的时长
            let timeLoaded = buffer.end(buffer.length - 1);
            // console.log(timeLoaded)
            loadBar.style.width = (timeLoaded / audio.duration) * 100 + '%';
            // console.log(1)
        }
    })

    // 进度条
    let progress = player.querySelector('.player_progress_bar');


    // 播放功能
    audio.addEventListener('error', function () {
        msgPop('当前资源不可用，换首歌试试吧~~');
        changePlayer(true);
    })
    audio.addEventListener('canplay', function () {
        audio.play();
    })
    audio.addEventListener('pause', function () {
        changePlayer(true);
    })
    audio.addEventListener('play', function () {
        changePlayer(false);
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
    previous.addEventListener('click', function () {
        index--;
        index = index < 0 ? audioArr.length - 1 : index;

        audio.src = audioArr[index];
        audio.play();
        renderData();
        // if (audioArr[index] == '404') {
        //     msgPop('该歌曲暂无版权，换首歌试试吧~');
        // }

        // if (playerBtn.title === '播放') {
        //     playerBtn.click();
        // } else {
        //     renderData();
        //     if (audio.readyState === 2) {
        //         audio.play();
        //     } else {
        //         msgPop('出现未知错误，请稍后再试！');
        //     }

        // }


        goBack();
    })
    let next = document.querySelector('.player_next');
    next.addEventListener('click', function () {
        index++;
        index = index == audioArr.length ? 0 : index;
        audio.src = audioArr[index];
        audio.play();
        // if (audioArr[index] == '404') {
        //     msgPop('该歌曲暂无版权，换首歌试试吧~');
        // }

        // if (playerBtn.title === '播放') {
        //     playerBtn.click();
        // } else {
        //     if (audio.readyState == 2) {

        //         audio.play();
        //     } else {
        //         msgPop('出现未知错误，请稍后再试！');
        //     }
        // }

        renderData();
        goBack();
    })


    // 拖拽进度条
    let progressBar = progress.parentNode;
    let dragFlag = false;
    progress.onmousedown = function (e) {

        // 获得当前的宽度
        let width = parseInt(progress.style.width);
        // if (clickFlag = true) {
        //     return;
        // }


        // console.log(dragFlag);
        let left = progress.getBoundingClientRect().left;
        let num = null;
        document.onmousemove = function (e) {
            // if (clickFlag = true) {
            //     return;
            // }
            // if (!dragFlag) {
            console.log(1111);
            dragFlag = true;
            // 
            num = (e.clientX - left) / progressBar.offsetWidth;
            if (num > 1) {
                num = 1;
            }
            if (num < 0) {
                num = 0;
            }
            current.innerHTML = getTime(num * audio.duration * 1000);

            progress.style.width = num * 100 + "%";

            // return false;
            // }



            return false;
        };

        document.onmouseup = function () {
            // if (dragFlag) {

            dragFlag = false;
            document.onmousemove = null;
            document.onmouseup = null;

            if (clickFlag) {
                clickFlag = false;
                return;
            }


            audio.currentTime = num * audio.duration;

            console.log(1)


            // 歌词
            lyricChange(width - num * 100);

            // }
        }



    };
    let clickFlag = false;
    // 点击进度条调节进度
    progressBar.addEventListener('mouseup', function (e) {
        if (e.target === progress) {
            clickFlag = true;
        }
        if (dragFlag) {
            return;
        }
        // console.log('now')
        // clickFlag = true;
        let long = e.clientX - progress.getBoundingClientRect().left;
        let num = long / progressBar.offsetWidth;

        // 获得当前的宽度
        let width = parseInt(progress.style.width);

        progress.style.width = num * 100 + '%';
        audio.currentTime = audio.duration * num;

        // console.log(1)
        // clickFlag = false;
        // 歌词
        lyricChange(width - num * 100);
    })

    // 改变歌词位置
    function lyricChange(flag) {
        let items = lyric.children;
        let currentTime = audio.currentTime;

        if (lineNow >= items.length) {
            lineNow = items.length - 1;
        }
        // 快进情况
        if (flag < 0) {

            console.log(lineNow)
            for (let i = 0; i < items.length; i++) {
                items[i].className = '';
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
            for (let i = 0; i < lineNow; i++) {
                items[i].className = '';
            }

        } else {// 快退情况
            for (let i = lineNow; i >= 0; i--) {
                items[i].className = '';
                let time = parseFloat(items[lineNow].getAttribute('src-time'));
                if (time > currentTime) {
                    lineNow--;
                } else {
                    // lineNow++;
                    break;
                }
            }
        }

        items[lineNow].className = 'lyric_highlight';

        let height = lyric.offsetTop;
        if (lyricFlag) {
            let long = items[lineNow].getBoundingClientRect().top - lyricTop;
            if (long > 118 || long < -20) {
                lyric.style.top = height - long + 120 + 'px';
            }
        }

        lineNow++;
    }

    // 歌曲进度条
    audio.addEventListener('timeupdate', function () {
        if (!dragFlag) {
            let num = (audio.currentTime / audio.duration) * 100;
            progress.style.width = num + '%';
        }

    })
    // function updateProgress(obj) {
    //     let timer = setInterval(function () {
    //         let num = (audio.currentTime / audio.duration) * 100;
    //         obj.style.width = num + '%';

    //         // console.log(1)
    //         if (num === 100) {
    //             clearInterval(timer);
    //             timer = null;
    //         }
    //     }, 2000);
    // }

    // 按下键盘 ➡、⬅ 快进、快退
    window.addEventListener('keyup', function (e) {
        // 获得当前的宽度
        let width = parseInt(progress.style.width);
        let num;
        // 快退
        if (e.key === 'ArrowLeft') {
            // 获得比例
            num = (audio.currentTime / audio.duration) - 0.05;
            if (num < 0) {
                num = 0;
            }

            progress.style.width = num * 100 + '%';
            audio.currentTime = num * audio.duration;
        }
        // 快进
        if (e.key === 'ArrowRight') {
            // 获得比例
            num = (audio.currentTime / audio.duration) + 0.05;
            if (num > 100) {
                num = 100;
            }

            progress.style.width = num * 100 + '%';
            audio.currentTime = num * audio.duration;
        }

        // 歌词
        lyricChange(width - num * 100);
    })


    // 当前时间
    let current = player.querySelector('.player_body_now');
    audio.addEventListener('timeupdate', function () {
        current.innerHTML = getTime(audio.currentTime * 1000);
    })

    // 播放模式
    let palyerStyle = player.querySelector('.player_style');
    let style = 'order';
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
    voice.style.width = '46%';
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
        // console.log(e.key)
        // 键盘 ⬆ 键
        if (e.key === 'ArrowUp') {
            let num = audio.volume + 0.1;
            if (num > 1) {
                num = 1;
            }
            audio.volume = num;

            voice.style.width = num * 100 + '%';
        }
        // 键盘 ⬇ 键
        if (e.key === 'ArrowDown') {
            let num = audio.volume - 0.1;
            if (num < 0) {
                num = 0;
            }
            audio.volume = num;

            voice.style.width = num * 100 + '%';
        }
    })
    // 点击音量调调节音量
    let voiceBar = voice.parentNode;
    voiceBar.addEventListener('click', function (e) {
        let long = e.clientX - voiceBar.getBoundingClientRect().left;
        let num = long / voiceBar.offsetWidth;
        // console.log(num)
        voice.style.width = num * 100 + '%';
        audio.volume = num;
    })

    // 歌词
    let lyric = document.querySelector('.lyric_content');
    function getLyric(id) {
        ajax({
            url: 'http://localhost:3000/lyric',
            data: {
                id: id
            },
            success: function (data) {
                // console.log(JSON.stringify(data, null, 4))
                renderLrc(data, lyric, audio.addEventListener('timeupdate', lyricHighlight))

                lyric.style.top = 0;
            }
        })
    }
    function renderLrc(data, obj, callback) {
        // obj.innerHTML =

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
                return `<p src-time=${(min * 60 + s).toFixed(3)} src-line=${index}>${content}
                ${transIndex !== undefined ? `<br>${trans[transIndex]}` : ''}</p>`

            } else {
                return `<p src-time=${(min * 60 + s).toFixed(3)} src-line=${index}>${content}</p>`
            }

        }).join('');

        obj.innerHTML = ps;

        callback && callback();
    }
    let lineNow = 0;
    let lyricTop = lyric.parentNode.offsetTop;
    // 歌词实时高亮
    function lyricHighlight() {


        let lines = lyric.children;
        let now = parseFloat(audio.currentTime);
        if (lineNow >= lines.length) {
            return;
        }


        if (parseFloat(lines[lineNow].getAttribute('src-time')) <= now) {

            if (lineNow >= 1) {
                lines[lineNow - 1].className = '';
            }

            lines[lineNow].className = 'lyric_highlight';

            let height = lyric.offsetTop;

            if (lyricFlag) {
                let long = lines[lineNow].getBoundingClientRect().top - lyricTop;
                if (long > 118 || long < -20) {
                    lyric.style.top = height - long + 120 + 'px';
                }
            }

            lineNow++;
        }
    }

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
        if (textarea.value.replace(/[\n\r ]/g, '').length > 0) {
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
                                <a href="javascript:;" class="comment_bd_praise" src-t=1>0</a>
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
                        msgPop('出现未知错误，请稍后再试！');
                    }

                },
                error: function () {
                    msgPop('出现未知错误，请稍后再试！');
                }
            })
        } else {
            msgPop('客官请先输入内容哦！');
        }
    }



    // 获得精彩评论
    let hotPage = 0;// 当前页数-1
    function getHotComment() {
        ajax({
            url: 'http://localhost:3000/comment/hot',
            data: {
                id: playlist[index],
                type: pid.type,
                offset: hotPage * 10
            },
            success: function (data) {
                loadHotComment(data, document.querySelector('.comment_bd_good_wrapper'));

                hotPage++;
            }
        })
    }
    // getHotComment();

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
            ${value.liked ? `<a href="javascript:;" class="comment_bd_praise highlight" src-t=0>${value.likedCount}</a>` : `<a href="javascript:;" class="comment_bd_praise" src-t=1>${value.likedCount}</a>`}
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
    function getNewComment() {
        ajax({
            url: 'http://localhost:3000/comment/new',
            data: {
                id: playlist[index],
                type: pid.type,
                pageNo: newPage,
                sortType: 3,
                cursor: newCursor
            },
            success: function (data) {
                data = data.data;
                newPage++;
                newCursor = data.cursor;

                loadNewComment(data, document.querySelector('.comment_bd_new_wrapper'))
            }
        })
    }
    // getNewComment();

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
            ${value.liked ? `<a href="javascript:;" class="comment_bd_praise highlight" src-t=0>${value.likedCount}</a>` : `<a href="javascript:;" class="comment_bd_praise" src-t=1>${value.likedCount}</a>`}
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
        if (textarea.value.replace(/[\n\r ]/g, '').length > 0) {
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
                        praise.innerHTML = 0;
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
                        msgPop('出现未知错误，请稍后再试！');
                    }

                },
                error: function () {
                    msgPop('出现未知错误，请稍后再试！');
                }
            })
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
                        that.innerHTML = `${parseInt(that.innerHTML) + 1}`;
                        that.setAttribute('src-t', 0)

                        msgPop('对方已经收到你的点赞啦！');
                    } else if (t === 0) {
                        that.className = 'comment_bd_praise';
                        that.innerHTML = `${parseInt(that.innerHTML) - 1} `;
                        that.setAttribute('src-t', 1)

                        msgPop('取消成功！');
                    }
                } else {
                    msgPop('出现未知错误，请稍后再试！');
                }
            },
            error: function () {
                msgPop('出现未知错误，请稍后再试！');
            }
        })
    }
    // 评论区所有功能
    function coomentBasis(ul, fn) {
        // 点击回复显示输入框
        let commentItems = ul.querySelectorAll('.comment_bd_commentHim');
        for (let i = 0; i < commentItems.length; i++) {
            commentItems[i].onclick = function () {
                // this.parentNode.parentNode.className = 'comment_bd_item comment_feedback';
                commentReply(this);
            }
        }

        // 点击取消按钮取消评论，隐藏输入框
        let cancelBtns = ul.querySelectorAll('.comment_cancel');
        for (let i = 0; i < cancelBtns.length; i++) {
            cancelBtns[i].onclick = function () {
                // this.parentNode.parentNode.className = 'comment_bd_item';
                cancelComment(this);
            }
        }

        // 输入时实时显示剩余可输入文字的数量
        let textItems = ul.querySelectorAll('textarea');
        for (let i = 0; i < textItems.length; i++) {
            textItems[i].oninput = function () {
                // this.nextElementSibling.children[0].innerHTML = `${300 - this.value.length}`;
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
                commentPost(this);
            }
        }

        // 下一页接口
        let load = ul.querySelector('.load_more');
        if (load) {
            load.onclick = function () {
                fn();

                this.parentNode.removeChild(this);
            }
        }
    }
})