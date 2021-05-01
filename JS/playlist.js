
window.addEventListener('load', function () {

    // 如果本地存储中有用户信息，自动登录
    let userData;
    let userId;
    if (window.localStorage.user) {
        userData = JSON.parse(window.localStorage.getItem('user'));

        // 更新头像
        loadAvatar(userData.profile.avatarUrl);

        userId = userData.profile.userId;
    }

    // 获取参数：资源id、类型
    let pid = {};
    let param = window.location.hash;// #pid=xxx&type=xxx
    pid.id = parseInt(param.substr(param.indexOf('pid=') + 4, param.indexOf('&')));
    pid.type = parseInt(param.substr(param.indexOf('type=') + 5));



    // 渲染歌曲
    let plBd = document.querySelector('.playlist_bd_song_content_wrapper');

    // 获取歌单下的所有歌曲的信息
    let playlistData;
    ajax({
        url: 'http://localhost:3000/playlist/detail',
        data: {
            id: pid.id
        },
        success: function (data) {
            // 获取用户的所有歌单信息，用于将当前歌单下的歌曲添加到用户的歌单
            getPlaylist(userId);

            // 加载歌单的基本信息
            loadInfo(data.playlist);

            // 渲染歌单的所有歌曲
            renderSongs(data.playlist, plBd);
        }
    })
    // 获取用户的所有歌单信息，用于将当前歌单下的歌曲添加到用户的歌单
    // 获取用户的所有歌单的简略信息
    function getPlaylist(uid) {
        ajax({
            url: 'http://localhost:3000/user/playlist',
            data: {
                uid: uid
            },
            success: function (data) {
                playlistData = data.playlist;
            }
        })
    }

    // 渲染歌单详情界面的基本信息
    function loadInfo(data) {
        let info = document.querySelector('.playlist_hd .w').children;
        let pic = info[0].children[0];
        pic.src = data.coverImgUrl;
        let info_right = info[1];
        info_right.children[0].innerHTML = data.name;
        info_right.children[1].innerHTML = data.creator.nickname;
        info_right.children[2].innerHTML = `标签：${data.tags.length !== 0 ? data.tags.map(value => value) : '无'}`;
        info_right.children[3].innerHTML = `播放量：${changeNum(data.playCount)}`;
        info_right.children[4].innerHTML = `收藏量：${changeNum(data.subscribedCount)}`;

        // 点击评论页面后滚动到评论区
        document.querySelector('.playlist_btn').children[2].onclick = function () {
            scroll(commentInput.parentNode.offsetTop);
        }

        // 简介
        let plInfo = document.querySelector('.playlist_bd_info');
        let more = plInfo.querySelector('.playlist_info_more')
        let content = plInfo.querySelector('.playlist_bd_info_content');
        content.innerHTML = data.description ? data.description : '暂无';
        if (content.offsetHeight > 64) {
            content.className = 'playlist_info_content_cut';
            display(more);
        }
        // 点击展开更多查看更多内容
        more.addEventListener('click', function () {
            if (this.innerHTML == '展开更多') {
                content.className = 'playlist_bd_info_content';
                this.innerHTML = '收起';
            } else {
                content.className = 'playlist_info_content_cut';
                this.innerHTML = '展开更多';
            }

        })

    }


    // 渲染歌单的歌曲
    function renderSongs(data, wrapper) {// data 是数组
        // 判断是不是用户本人的歌单
        let self = false;
        if (data.userId == userId) {
            self = true;
        }

        data = data.tracks;
        // 如果该歌单下有歌曲
        if (data.length > 0) {
            for (let i = 30; i < data.length + 30; i += 30) {
                let div = document.createElement('div');
                div.className = 'playlist_bd_song_content';
                display(div, false);
                div.innerHTML = data.map((value, index) => {
                    if (index < i && index >= i - 30) {
                        return `<div class="playlist_bd_song_content_row">
                    <a href="javascript:;" class="playlist_bd_song_content_song">
                        <p class="playlist_bd_song_text" src-songid="${value.id}">${value.name}</p>
                        <ul class="mod_list_menu">
                            <li href="javascript:;" title="播放"></li>
                            <li href="javascript:;" title="添加到歌单"></li>
                            <li href="javascript:;" title="下载"></li>
                    ${self ? `<li href="javascript:;" title="删除" class="mod_list_menu_del"></li>` : `<li href="javascript:;" title="分享" class="mod_list_menu_share"></li>`}
                        </ul>
                    </a>
                    <div class="playlist_bd_song_content_singer">
        
                    ${value.ar.map(value => {
                            return `<a href="javascript:;" src-singerid="${value.id}">${value.name}</a>`
                        }).join('&nbsp;/&nbsp;')}
        
                    </div>
                    <a href="javascript:;" class="playlist_bd_song_content_album" src-albumid="${value.al.id}">${value.al.name}</a>
                    <span class="playlist_bd_song_content_time">${getTime(value.dt)}</span>
                </div>`
                    } else {
                        return;
                    }
                }).join('');

                wrapper.appendChild(div);

            }

            // 设置整个区域最小高度
            if (data.length > 30) {
                document.querySelector('.playlist_bd .w').minHeight = '1500px';
            }
            // 去掉加载动画
            wrapper.parentNode.removeChild(wrapper.nextElementSibling);

            // 展示第一页
            display(wrapper.children[0], 'grid');

            // 为添加歌曲到歌单按钮绑定事件
            let addBtns = document.querySelectorAll('.mod_list_menu li[title="添加到歌单"]');
            for (let i = 0; i < addBtns.length; i++) {
                addBtns[i].onclick = function () {
                    // 如果未登录
                    if (!userId) {
                        //唤起登录界面
                        return;
                    }

                    clickAdd(userId, parseInt(this.parentNode.previousElementSibling.getAttribute('src-songid')), pid.id, playlistData);
                }
            }
            // 如果是用户本人的歌单，绑定删除事件
            if (self) {
                let delBtns = document.querySelectorAll('.mod_list_menu_del');
                for (let i = 0; i < delBtns.length; i++) {
                    delBtns[i].onclick = function () {
                        clickDel(pid.id, parseInt(this.parentNode.previousElementSibling.getAttribute('src-songid')), this, function (that) {

                            let row = that.parentNode.parentNode.parentNode;
                            let wrapper = row.parentNode;
                            wrapper.removeChild(row);

                            // 如果歌单中的歌都被删完了
                            if (wrapper.children.length === 0) {
                                let aside = document.createElement('aside');
                                aside.className = 'search_loading';
                                aside.innerHTML = '暂无音乐，快去发现好听的音乐吧！';
                                document.querySelector('.playlist_bd_song').appendChild(aside);
                            }

                        });
                    }
                }
            }

            // 创建分页按钮并绑定事件
            createPage(document.querySelector('.playlist_bd_page'), data.length, function () {
                if (this.className !== 'page_current') {
                    // 更换样式
                    changePage(this.index, document.querySelectorAll('.playlist_bd_page li'))

                    // 显示当前页
                    let items = plBd.children;
                    for (let i = 0; i < items.length; i++) {
                        display(items[i], false);
                    }
                    display(items[this.index], 'grid');

                    // 优化页面滚动效果
                    this.parentNode.parentNode.previousElementSibling.style.minHeight = '1500px';
                    scroll(document.querySelector('.playlist_bd_song_title').offsetTop, function () {
                        document.querySelector('.playlist_bd .w').style.minHeight = '';
                    });
                }
            }, function () {
                changePage(0, document.querySelectorAll('.playlist_bd_page li'));
            })
        } else {
            document.querySelector('.search_loading').innerHTML = '暂无音乐！快去发现好听的音乐吧！';
            document.querySelector('.playlist_bd .w').style.minHeight = '0px';

        }


    }

    // 添加或删除歌曲到歌单
    // 添加歌曲到歌单
    // function clickAdd(sid, callback) {
    //     // 显示弹窗

    //     createPlaylist(user.id, function () {
    //         let pid = parseInt(this.getAttribute('pid'));
    //         ajax({
    //             url: 'http://localhost:3000/playlist/tracks',
    //             data: {
    //                 op: 'add',
    //                 pid: pid,
    //                 tracks: sid
    //             },
    //             success: function () {
    //                 msgPop('添加成功！');
    //                 callback && callback();
    //             },
    //             error: function (data) {
    //                 console.log(data)
    //             }
    //         })
    //     });
    // }



    // // 创建"收藏到我的歌单"弹窗
    // function createPlaylist(fn) {
    //     let addSong = document.querySelector('.addsong_playlist');
    //     let addSongOl = addSong.lastElementChild;
    //     let close = addSong.querySelector('.addsong_playlist_close');
    //     // 显示我创建的所有歌单
    //     userId = user.id;
    //     playlistData.forEach(value => {
    //         // let userId = param.substr(param.indexOf('id=') + 3);
    //         // 如果是该用户创建的而不是该用户收藏的歌单且不是当前歌单
    //         if (value.creator.userId === userId && value.id !== pid.id) {

    //             let li = document.createElement('li');
    //             li.className = 'addsong_playlist_item';
    //             li.innerHTML = value.name;
    //             li.setAttribute('pid', value.id);
    //             li.addEventListener('click', fn)

    //             addSongOl.appendChild(li);
    //         }
    //     })
    //     close.addEventListener('click', function () {
    //         display(addSong, false);
    //         addSongOl.innerHTML = '';
    //     })
    //     display(addSong);
    // }



    // 评论区
    getCommentCount(pid);
    getNewComment(pid);

})