window.addEventListener('load', function () {

    document.body.style.zoom = 1;


    // 如果本地存储中有用户信息
    let userData;
    let userId
    if (window.localStorage.user) {
        userData = JSON.parse(window.localStorage.getItem('user'));
        userId = userData.account.id;

        loadUser(userData.profile);

    }


    // 获取用户信息，用户id
    let param = window.location.search;
    //  = parseInt(param.substr(param.indexOf('id=') + 3));
    let pid = {
        type: 2
    }

    // 获取用户详细信息
    // ajax({
    //     // async: false,
    //     url: 'http://localhost:3000/user/detail',
    //     data: {
    //         uid: userId
    //     },
    //     success: function (data) {
    //         // 加载用户基本信息
    //         loadUser(data.profile);

    //         // 获取用户的所有歌单信息，用于将当前歌单下的歌曲添加到用户的歌单
    //         getPlaylist();
    //     }
    // })

    // 加载用户基本信息
    function loadUser(data) {
        // 更新头像
        let userPic = document.querySelector('.user_pic img');
        userPic.src = data.avatarUrl;

        // 更新用户名
        let userName = document.querySelector('.user_name');
        userName.innerHTML = data.nickname;

        // 关注人数
        let follows = document.querySelector('.user_info_follow_count');
        follows.innerHTML = data.follows;

        // 粉丝人数
        let fans = document.querySelector('.user_info_fans_count');
        fans.innerHTML = data.followeds;

        // "我创建的歌单"数目
        document.querySelector('.user_nav_mypl').innerHTML = `我创建的歌单 ${data.playlistCount}`;

        // console.log(data);
        // "我收藏的歌单"数目
        // document.querySelector('.user_nav_mypl').innerHTML = `我创建的歌单 ${data.playlistCount}`;

    }


    // 获取歌单，包括我喜欢的音乐
    let playlistData;// 存放用户所有歌单的信息
    function getPlaylist() {
        ajax({
            url: 'http://localhost:3000/user/playlist',
            data: {
                uid: userId
            },
            success: function (data) {

                playlistData = data.playlist;// 数组
                pid.id = playlistData[0].id;

                // 渲染我喜欢的音乐
                getMyLike()

                // 点击"我喜欢"查看我喜欢的音乐
                userNav.querySelector('.user_nav_mylike').addEventListener('click', function () {
                    // 样式
                    userNav.querySelector('.user_nav_likepl').className = 'user_nav_likepl';
                    userNav.querySelector('.user_nav_mypl').className = 'user_nav_mypl';
                    userNav.querySelector('.user_nav_mylike').className = 'user_nav_mylike user_nav_current';

                    // 隐藏我创建的歌单详情页面
                    display(document.querySelector('.user_bd_playlist'), false);
                    // 显示我喜欢的音乐及底部按钮
                    display(document.querySelector('.user_bd_song'));
                    display(document.querySelector('.user_bd_page'), 'flex');

                })


                // 点击"我创建的歌单"查看我创建的歌单
                userNav.querySelector('.user_nav_mypl').addEventListener('click', function () {
                    // 样式
                    userNav.querySelector('.user_nav_mylike').className = 'user_nav_mylike';
                    userNav.querySelector('.user_nav_likepl').className = 'user_nav_likepl';
                    userNav.querySelector('.user_nav_mypl').className = 'user_nav_mypl user_nav_current';

                    // 渲染我创建的歌单详情页面
                    renderPlaylist(document.querySelector('.user_bd_playlist_content'), true, function () {

                        // 隐藏我喜欢的音乐及底部按钮
                        display(document.querySelector('.user_bd_song'), false);
                        display(document.querySelector('.user_bd_page'), false);
                        // 显示我的歌单详情页面
                        display(document.querySelector('.user_bd_playlist'));
                    });

                })

                // 点击"我收藏的歌单"查看我收藏的歌单
                userNav.querySelector('.user_nav_likepl').addEventListener('click', function () {
                    // 样式
                    userNav.querySelector('.user_nav_mylike').className = 'user_nav_mylike';
                    userNav.querySelector('.user_nav_mypl').className = 'user_nav_mypl';
                    userNav.querySelector('.user_nav_likepl').className = 'user_nav_likepl user_nav_current';

                    // 渲染我创建的歌单详情页面
                    renderPlaylist(document.querySelector('.user_bd_playlist_content'), false, function () {

                        // 隐藏我喜欢的音乐及底部按钮
                        display(document.querySelector('.user_bd_song'), false);
                        display(document.querySelector('.user_bd_page'), false);
                        // 显示我的歌单详情页面
                        display(document.querySelector('.user_bd_playlist'));
                    });

                })


            }
        })
    }
    getPlaylist();


    let myLikeBd = document.querySelector('.user_bd_song_content_wrapper');
    // 获取我喜欢的音乐所有歌曲
    function getMyLike() {
        ajax({
            url: 'http://localhost:3000/playlist/detail',
            data: {
                id: pid.id
            },
            success: function (data) {

                // 歌曲数目
                userNav.querySelector('.user_nav_mylike').innerHTML = `我喜欢 ${data.playlist.trackCount}`;

                renderMyLike(data.playlist.tracks);// 数组
            }
        })
    }

    // 渲染我喜欢的音乐
    function renderMyLike(data) {// data 是数组
        if (data.length > 0) {
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

                    clickAdd(userId, parseInt(this.parentNode.previousElementSibling.getAttribute('src-songid')), pid.id, playlistData);
                }
            }

            let delBtns = document.querySelectorAll('.mod_list_menu li[title="删除"]');
            for (let i = 0; i < delBtns.length; i++) {
                delBtns[i].onclick = function () {
                    clickDel(playlistData[0].id, parseInt(this.parentNode.previousElementSibling.getAttribute('src-songid')), this, function (that) {
                        let row = that.parentNode.parentNode.parentNode;
                        row.parentNode.removeChild(row);
                    });
                }
            }

            // 创建分页按钮并绑定事件
            createPage(document.querySelector('.user_bd_page'), data.length, function () {
                if (this.className !== 'page_current') {
                    // 更换样式
                    changePage(this.index, document.querySelectorAll('.user_bd_page li'))

                    // 显示那一页
                    let items = myLikeBd.children;
                    for (let i = 0; i < items.length; i++) {
                        display(items[i], false);
                    }
                    display(items[this.index], 'grid');

                    // 优化页面滚动效果
                    document.querySelector('.user_bd .w').style.minHeight = '1610px';
                    scroll(document.querySelector('.user_bd_song_title').offsetTop, function () {
                        document.querySelector('.user_bd .w').style.minHeight = '';
                    });
                }

            }, function () {
                changePage(0, document.querySelectorAll('.user_bd_page li'));
            })
        } else {
            document.querySelector('.search_loading').innerHTML = '暂无音乐！快去发现好听的音乐吧！';
        }

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

    let userNav = document.querySelector('.user_nav'); // "我喜欢"、"我创建的歌单"、"我收藏的歌单"按钮


    // 渲染我创建的歌单页面
    function renderPlaylist(wrapper, bool, callback) {

        // 加载动画
        wrapper.innerHTML = ` <aside class="search_loading">
        <img src="https://y.gtimg.cn/mediastyle/yqq/img/loading.gif?max_age=2592000&v=4d882ab54383b136b0cae1f7c93ab74a"
            alt="">
    </aside>`;

        function create(value, frag) {
            let li = document.createElement('li');
            li.className = 'user_bd_playlist_item';
            li.setAttribute('src-pid', value.id);
            li.innerHTML = `  <img src="${value.coverImgUrl}" alt="">
            <p class="user_bd_playlist_item_name">${value.name}</p>
            <p class="user_bd_playlist_item_user">${value.creator.nickname}</p>`

            frag.appendChild(li);
        }

        let frag = document.createDocumentFragment();

        if (bool) {
            playlistData.forEach(value => {
                if (value.creator.userId == userId) {
                    create(value, frag);
                }
            });
        } else {
            playlistData.forEach(value => {
                if (value.creator.userId != userId) {
                    create(value, frag);
                }
            });
        }


        wrapper.innerHTML = '';
        wrapper.appendChild(frag);

        callback && callback();

        // 点击后跳转到歌单详情页面
        let items = wrapper.children;
        for (let i = 0; i < items.length; i++) {
            items[i].onclick = function () {
                window.location.href = `file:///C:/Users/Emma/Desktop/study/MyMusic/playlist.html?pid=${this.getAttribute('src-pid')}&type=2`;
            }
        }
    }

    // 新建歌单
    let createPl = document.querySelector('.user_bd_playlist_btn').children[0];
    createPl.onclick = newPl;

    function newPl() {
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
                            newList.querySelector('.newList_close').click();

                            // 渲染该新歌单
                            if (userNav.children[1].className == 'user_nav_mypl user_nav_current') {
                                data = data.playlist;

                                let li = document.createElement('li');
                                li.className = 'user_bd_playlist_item';
                                li.setAttribute('src-pid', data.id)
                                li.innerHTML = `  <img src="${data.coverImgUrl}" alt="">
                            <p class="user_bd_playlist_item_name">${data.name}</p>
                            <p class="user_bd_playlist_item_user">${userData.profile.nickname}</p>`;

                                let wrapper = document.querySelector('.user_bd_playlist_content');
                                if (wrapper.children.length != 0) {
                                    wrapper.insertBefore(li, wrapper.children[0]);
                                } else {
                                    wrapper.append(li);
                                }
                            }
                        }

                    }
                })
            }

        }
    }
})