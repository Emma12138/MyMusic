window.addEventListener('load', function () {


    // 如果本地存储中有用户信息，就赋值
    let userData;
    let userId;
    if (window.localStorage.user) {
        userData = JSON.parse(window.localStorage.getItem('user'));
        userId = userData.account.id;
        loadUser(userData.profile);
    } else {
        window.open('index.html', '_self');
    }


    // 若本地存储中用户信息发生变动，更新页面中的用户数据
    window.addEventListener('storage', function (e) {

        if (e.key == 'user') {

            userData = JSON.parse(window.localStorage.getItem('user'));
            userId = userData.account.id;

            // 如果创建的歌单数发生改变，需要重新渲染
            let newNum = userData.profile.playlistCount;
            let myPl = userNav.querySelector('.user_nav_mypl');
            let creatStr = myPl.innerHTML;
            let oldNum = creatStr.match(/\d/g).join('');
            if (newNum != oldNum) {
                if (myPl.className == 'user_nav_mypl user_nav_current') {
                    getPlaylist(false, function () {
                        renderPlaylist(document.querySelector('.user_bd_playlist_content'), true)
                    })
                } else {
                    getPlaylist(false)
                }
            }

            // 如果喜欢的音乐发生变动，重新渲染
            let oldCount = playlistData[0].trackCount;
            let newCount;
            getPlaylist(false, function () {
                newCount = playlistData[0].trackCount;
            });
            if (oldCount != newCount) {
                if (userNav.querySelector('.user_nav_mylike').className == 'user_nav_current user_nav_mylike') {
                    getPlaylist(true);
                } else {
                    getPlaylist(true, null, false);
                }
            }
            loadUser(userData.profile);

        }

    })

    let pid = {
        type: 2
    }

    // 渲染用户基本信息
    function loadUser(data) {
        console.log(data)
        if (data.playlistCount === undefined) {
            updateAccount(userId, function () {
                userData = JSON.parse(window.localStorage.user);
                loadUser(userData.profile)
            })
        }
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

    }


    // 获取歌单，包括我喜欢的音乐
    let playlistData;// 存放用户所有歌单
    function getPlaylist(bool = true, callback, displayBool = true) {
        // bool 表示是否需要渲染我喜欢的音乐
        ajax({
            url: `http://localhost:3000/user/playlist`,
            data: {
                uid: userId,
                timerstamp: +new Date()
            },
            success: function (data) {

                playlistData = data.playlist;// 数组
                pid.id = playlistData[0].id;

                if (bool) {
                    getMyLike(displayBool);

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
                        display(myLikeBd.children[0]);
                        display(document.querySelector('.user_bd_page'), 'flex');

                    })


                    // 点击"我收藏的歌单"查看我收藏的歌单
                    userNav.querySelector('.user_nav_likepl').addEventListener('click', function () {
                        // 样式
                        userNav.querySelector('.user_nav_mylike').className = 'user_nav_mylike';
                        userNav.querySelector('.user_nav_mypl').className = 'user_nav_mypl';
                        userNav.querySelector('.user_nav_likepl').className = 'user_nav_likepl user_nav_current';

                        // 渲染我收藏的歌单详情页面
                        renderPlaylist(document.querySelector('.user_bd_playlist_content'), false, function () {

                            // 隐藏我喜欢的音乐及底部按钮
                            display(document.querySelector('.user_bd_song'), false);
                            display(document.querySelector('.user_bd_page'), false);
                            // 显示我的歌单详情页面
                            display(document.querySelector('.user_bd_playlist'));
                        });

                    })

                }

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

                callback && callback();

            }
        })
    }
    getPlaylist();


    let myLikeBd = document.querySelector('.user_bd_song_content_wrapper');
    // 获取我喜欢的音乐所有歌曲
    function getMyLike(bool = true) {
        ajax({
            url: 'http://localhost:3000/playlist/detail',
            data: {
                id: pid.id,
                timerstamp: +new Date()
            },
            success: function (data) {

                // 歌曲数目
                userNav.querySelector('.user_nav_mylike').innerHTML = `我喜欢 ${data.playlist.trackCount}`;
                // 渲染到页面
                renderMyLike(data.playlist.tracks, bool);// 数组
            }
        })
    }

    // 渲染我喜欢的音乐
    function renderMyLike(data, bool = true) {// data 是数组
        if (data.length > 0) {

            let frag = document.createDocumentFragment();
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
                                <li href="javascript:;" title="添加到播放队列"></li>
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

                frag.appendChild(div);

            }


            myLikeBd.innerHTML = '';
            myLikeBd.appendChild(frag);

            if (bool) {
                // 展示第一页
                display(myLikeBd.children[0], 'grid');
            }


            // 点击跳转
            let items = myLikeBd.querySelectorAll('.user_bd_song_content_row a[class^="user_bd_song_content"]');
            for (let i = 0; i < items.length; i++) {
                let node = items[i];
                if (node.innerHTML.includes('mod_list_menu')) {
                    node = node.children[0];
                }
                node.onclick = openSearch;
            }
            let singerItems = myLikeBd.querySelectorAll('.user_bd_song_content_singer a');
            for (let i = 0; i < singerItems.length; i++) {
                singerItems[i].onclick = openSearch;
            }
            function openSearch() {
                let keyword = this.textContent;
                keyword = keyword.replace(/^\s*|\s*$/g, '');
                window.open(`search.html?keywords=${keyword}`, '_blank');
            }


            // 为添加和删除按钮绑定事件
            // 添加
            let addBtns = document.querySelectorAll('.mod_list_menu li[title="添加到歌单"]');
            for (let i = 0; i < addBtns.length; i++) {
                addBtns[i].onclick = function () {

                    clickAdd(userId, parseInt(this.parentNode.previousElementSibling.getAttribute('src-songid')), pid.id, playlistData, function () {
                        // 更新歌单
                        getPlaylist(false);
                    });
                }
            }
            // 删除
            let delBtns = document.querySelectorAll('.mod_list_menu li[title="删除"]');
            for (let i = 0; i < delBtns.length; i++) {
                delBtns[i].onclick = function () {
                    clickDel(playlistData[0].id, parseInt(this.parentNode.previousElementSibling.getAttribute('src-songid')), this, function (that) {
                        let row = that.parentNode.parentNode.parentNode;
                        row.parentNode.removeChild(row);
                        // 歌曲数目
                        let like = userNav.querySelector('.user_nav_mylike');
                        let likeStr = like.innerHTML;
                        let num = parseInt(likeStr.match(/\d/g).join(''));
                        userNav.querySelector('.user_nav_mylike').innerHTML = `我喜欢 ${num - 1}`;
                    });
                }
            }


            // 点击播放按钮
            let playBtns = document.querySelectorAll('.mod_list_menu li:nth-child(1)');
            for (let i = 0; i < playBtns.length; i++) {
                playBtns[i].addEventListener('click', function () {
                    let id = this.parentNode.previousElementSibling.getAttribute('src-songid');
                    clickPlay(id);
                })
            }

            // 添加到播放队列按钮
            let addPlayBtns = document.querySelectorAll('.mod_list_menu li:nth-child(3)');
            for (let i = 0; i < addPlayBtns.length; i++) {
                addPlayBtns[i].addEventListener('click', function () {
                    let id = this.parentNode.previousElementSibling.getAttribute('src-songid');
                    clickAddPlay(id);
                });
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
                    document.querySelector('.user_bd .w').style.maxHeight = '1610px';
                    scroll(document.querySelector('.user_bd_song_title').offsetTop, function () {
                        document.querySelector('.user_bd .w').style.maxHeight = '';
                    });
                }

            }, function () {
                changePage(0, document.querySelectorAll('.user_bd_page li'));
            })
        } else {
            document.querySelector('.search_loading').innerHTML = '暂无音乐！快去发现好听的音乐吧！';
        }

    }



    let userNav = document.querySelector('.user_nav'); // "我喜欢"、"我创建的歌单"、"我收藏的歌单"按钮
    // 渲染我的歌单页面
    function renderPlaylist(wrapper, bool, callback) {
        // bool 用于判断是渲染我创建的歌单还是我收藏的歌单

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
                window.open(`playlist.html?pid=${this.getAttribute('src-pid')}`, '_blank')
            }
        }
    }

    // 新建歌单
    let createPl = document.querySelector('.user_bd_playlist_btn').children[0];
    createPl.onclick = function () {
        newPl(userId, false);
    };


})