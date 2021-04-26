
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
        info_right.children[3].innerHTML = `播放量：${data.playCount}`;
        info_right.children[4].innerHTML = `收藏量：${data.subscribedCount}`;

        // 点击评论页面后滚动到评论区
        document.querySelector('.playlist_btn').children[2].onclick = function () {
            scroll(commentInput.parentNode.offsetTop);
        }

        // 简介
        document.querySelector('.playlist_bd_info_content').innerHTML = data.description ? data.description : '暂无';
    }
    // // 获取用户的所有歌单的简略信息
    // function getPlaylist() {
    //     ajax({
    //         url: 'http://localhost:3000/user/playlist',
    //         data: {
    //             uid: user.id
    //         },
    //         success: function (data) {
    //             // playlistData = data.playlist;// 数组
    //             return data.playlist;
    //         }
    //     })
    // }
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
                            row.parentNode.removeChild(row);

                            // 如果歌单中的歌都被删完了
                            let aside = document.createElement('aside');
                            aside.className = 'search_loading';
                            aside.innerHTML = '暂无音乐，快去发现好听的音乐吧！';
                            document.querySelector('.playlist_bd_song').appendChild(aside);

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
                    id: pid.id,
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
                id: pid.id,
                type: 2,
                offset: hotPage * 10
            },
            success: function (data) {
                loadHotComment(data, document.querySelector('.comment_bd_good_wrapper'));

                hotPage++;
            }
        })
    }
    getHotComment();
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
                id: pid.id,
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
    getNewComment();

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
                    id: pid.id,
                    content: textarea.value,
                    commentId: parseInt(that.parentNode.parentNode.getAttribute('src-cid'))
                },
                success: function (data) {
                    if (data.code == 200) {
                        console.log(data)
                        msgPop('回复成功！');
                        that.parentNode.parentNode.className = 'comment_bd_item';

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
                        praise.className = 'comment_bd_praise';
                        praise.innerHTML = 0;
                        let time = li.querySelector('.comment_bd_time');
                        time.innerHTML = getYearTime(data.time);

                        ul.insertBefore(li, oldLi);

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
                id: pid.id,
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