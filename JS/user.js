window.addEventListener('load', function () {

    // 获取用户信息，用户id
    let param = window.location.hash;
    let userId = param.substr(param.indexOf('id=') + 3);
    ajax({
        // async: false,
        url: 'http://localhost:3000/user/detail',
        data: {
            uid: userId
        },
        success: function (data) {

            loadUser(data.profile);

            getPlaylist();
        }
    })

    function loadUser(data) {
        // console.log(JSON.stringify(data, null, 4));

        // 更新头像
        let headerAvatar = document.querySelector('.login_avatar');
        let loginBtn = headerAvatar.previousElementSibling;
        let userPic = document.querySelector('.user_pic img');
        let avatarUrl = data.avatarUrl;
        headerAvatar.src = avatarUrl;
        userPic.src = avatarUrl;
        display(headerAvatar);
        display(loginBtn, false);

        // 更新用户名
        let userName = document.querySelector('.user_name');
        userName.innerHTML = data.nickname;

        // 关注人数
        let follows = document.querySelector('.user_info_follow_count');
        follows.innerHTML = data.follows;

        // 粉丝人数
        let fans = document.querySelector('.user_info_fans_count');
        fans.innerHTML = data.followeds;

        // "我的歌单"数目
        userNav[2].innerHTML = `我创建的歌单 ${data.playlistCount}`;

    }

    // 获取歌单，包括我喜欢的音乐
    let playlistData;
    function getPlaylist() {
        ajax({
            url: 'http://localhost:3000/user/playlist',
            data: {
                uid: userId
            },
            success: function (data) {

                playlistData = data.playlist;// 数组
                // console.log(JSON.stringify(playlistData, null, 4));
                // loadUser(data.profile);

                // 渲染我喜欢的音乐
                getMyLike()




                // 点击"我创建的歌单"查看我创建的歌单
                userNav[2].addEventListener('click', function () {
                    for (let i = 0; i < userNav.length; i++) {
                        userNav[i].className = '';
                    }
                    userNav[2].className = 'user_nav_current';

                    renderPlaylist();
                    display(document.querySelector('.user_bd_song'), false);
                    display(document.querySelector('.user_bd_page'), false);
                    display(document.querySelector('.user_bd_playlist'));
                })




            }
        })
    }

    let userNav = document.querySelectorAll('.user_nav a');
    let myLikeBd = document.querySelector('.user_bd_song_content_wrapper');
    // 获取我喜欢的音乐所有歌曲
    function getMyLike() {
        ajax({
            url: 'http://localhost:3000/playlist/detail',
            data: {
                id: playlistData[0].id
            },
            success: function (data) {
                // loadUser(data.profile);

                // 歌曲数目
                userNav[0].innerHTML = `我喜欢 ${data.playlist.trackCount}`;

                renderMyLike(data.playlist.tracks);// 数组
            }
        })
    }

    // 渲染我喜欢的音乐
    function renderMyLike(data) {// data 是数组
        // console.log(data)
        for (let i = 30; i < data.length + 30; i += 30) {
            let div = document.createElement('div');
            div.className = 'user_bd_song_content';
            display(div, false);
            div.innerHTML = data.map((value, index) => {
                if (index < i && index >= i - 30) {
                    return `<div class="user_bd_song_content_row">
                    <a href="javascript:;" class="user_bd_song_content_song">
                        <p class="user_bd_song_text" src-songid="${value.id}">${value.name}</p>
                        <ul class="mod_list_menu">
                            <li href="javascript:;" title="播放"></li>
                            <li href="javascript:;" title="添加到歌单"></li>
                            <li href="javascript:;" title="下载"></li>
                            <li href="javascript:;" title="删除"></li>
                        </ul>
                    </a>
                    <div class="user_bd_song_content_singer">
        
                    ${value.ar.map(value => {
                        return `<a href="javascript:;" src-singerid="${value.id}">${value.name}</a>`
                    }).join('&nbsp;/&nbsp;')}
        
                    </div>
                    <a href="javascript:;" class="user_bd_song_content_album" src-albumid="${value.al.id}">${value.al.name}</a>
                    <span class="user_bd_song_content_time">${getTime(value.dt)}</span>
                </div>`
                } else {
                    return;
                }
            }).join('');

            myLikeBd.appendChild(div);

        }
        // 去掉加载动画
        myLikeBd.removeChild(myLikeBd.children[0])
        // 展示第一页
        display(myLikeBd.children[0], 'grid');

        // 为添加和删除按钮绑定事件
        let addBtns = document.querySelectorAll('.mod_list_menu li[title="添加到歌单"]');
        for (let i = 0; i < addBtns.length; i++) {
            addBtns[i].onclick = function () {

                clickAdd(parseInt(this.parentNode.previousElementSibling.getAttribute('src-songid')), function () {
                    // 关闭弹窗
                    document.querySelector('.addsong_playlist_close').click();
                });
            }
        }

        let delBtns = document.querySelectorAll('.mod_list_menu li[title="删除"]');
        for (let i = 0; i < delBtns.length; i++) {
            delBtns[i].onclick = function () {
                // let that = this;
                clickDel(playlistData[0].id, parseInt(this.parentNode.previousElementSibling.getAttribute('src-songid')), this, function (that) {
                    let row = that.parentNode.parentNode;
                    row.parentNode.removeChild(row);
                });
            }
        }
        // 创建分页按钮并绑定事件
        createPage(document.querySelector('.user_bd_page'), data.length, function () {
            // 更换样式
            changePage(this.index, document.querySelectorAll('.user_bd_page li'))

            // 显示当前页
            let items = myLikeBd.children;
            for (let i = 0; i < items.length; i++) {
                display(items[i], false);
            }
            display(items[this.index], 'grid');
        }, function () {
            changePage(0, document.querySelectorAll('.user_bd_page li'));
        })

    }

    // 判断音乐是否可用
    function musicCheck(id) {
        ajax({
            url: 'http://localhost:3000/check/music',
            data: {
                id: id
            },
            success(data) {
                console.log(data);
                return;
            },
            error(data) {
                console.log(data)
            }
        })
    }


    // 添加或删除歌曲到歌单
    // 添加歌曲到歌单
    function clickAdd(sid, callback) {
        // 显示弹窗
        // let addSong = document.querySelector('.addsong_playlist');
        createPlaylist(function () {
            let pid = parseInt(this.getAttribute('pid'));
            ajax({
                url: 'http://localhost:3000/playlist/tracks',
                data: {
                    op: 'add',
                    pid: pid,
                    tracks: sid
                },
                success: function () {
                    msgPop('添加成功！');
                    callback && callback();
                },
                error: function (data) {
                    console.log(data)
                }
            })
        });
    }
    // 创建"收藏到我的歌单"弹窗
    function createPlaylist(fn) {
        let addSong = document.querySelector('.addsong_playlist');
        let addSongOl = addSong.lastElementChild;
        let close = addSong.querySelector('.addsong_playlist_close');
        // 显示我创建的所有歌单
        userId = parseInt(userId);
        playlistData.forEach(value => {
            // let userId = param.substr(param.indexOf('id=') + 3);
            // 如果是该用户创建的而不是该用户收藏的歌单
            if (value.creator.userId === userId) {

                let li = document.createElement('li');
                li.className = 'addsong_playlist_item';
                li.innerHTML = value.name;
                li.setAttribute('pid', value.id);
                li.addEventListener('click', fn)

                addSongOl.appendChild(li);
            }
        })
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

    // // 点击"我创建的歌单"查看我创建的歌单
    // userNav[2].addEventListener('click', function () {
    //     for (let i = 0; i < userNav.length; i++) {
    //         userNav[i].className = '';
    //     }
    //     userNav[2].className = 'user_nav_current';

    //     renderPlaylist();
    //     display(document.querySelector('.user_bd_song'), false);
    //     display(document.querySelector('.user_bd_page'), false);
    //     display(document.querySelector('.user_bd_playlist'));
    // })
    // 渲染我创建的歌单
    function renderPlaylist() {
        let lists = document.querySelector('.user_bd_playlist_content');
        lists.innerHTML = playlistData.map(value => {
            if (value.creator.userId === parseInt(userId)) {
                return `<li class="user_bd_playlist_item" src-pid=${value.id}>
                    <img src="${value.coverImgUrl}" alt="">
                    <p class="user_bd_playlist_item_name">${value.name}</p>
                    <p class="user_bd_playlist_item_user">${value.creator.nickname}</p>
            </li>`
            }
        }).join('');

        // 点击后跳转到歌单详情页面
        let items = lists.children;
        console.log(items);
        for (let i = 0; i < items.length; i++) {
            items[i].onclick = function () {
                window.location.href = `file:///C:/Users/Emma/Desktop/study/MyMusic/playlist.html#id=${this.getAttribute('src-pid')}`
            }
        }
    }
})