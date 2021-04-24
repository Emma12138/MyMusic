
window.addEventListener('load', function () {

    let param = window.location.hash;
    // let pid = parseInt(param.substr(param.indexOf('id=') + 3));
    let pid = {
        id: parseInt(param.substr(param.indexOf('id=') + 3)),
        type: 2
    }

    let user = {
        name: '木木耳i',
        avatarUrl: 'http://thirdqq.qlogo.cn/g?b=sdk&k=ibYX6fS9vs2PpFFicHBaOBdQ&s=140&t=1583679976',
        id: 283150068
    }

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
        // 简介
        document.querySelector('.playlist_bd_info_content').innerHTML = data.description ? data.description : '暂无';
    }
    // 渲染歌曲
    let plBd = document.querySelector('.playlist_bd_song_content_wrapper');

    // 获取歌单下的所有歌曲的信息
    function getPl() {
        // 获取用户的所有歌单信息
        getPlaylist();

        ajax({
            url: 'http://localhost:3000/playlist/detail',
            data: {
                id: pid.id
            },
            success: function (data) {
                loadInfo(data.playlist);
                // console.log(JSON.stringify(data, null, 4))
                // 渲染歌单的所有歌曲
                renderSongs(data.playlist.tracks, plBd);// 数组
            }
        })
    }
    getPl();
    // 渲染歌单的歌曲
    function renderSongs(data, wrapper) {// data 是数组
        // console.log(data)
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
                            <li href="javascript:;" title="删除"></li>
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
        // 去掉加载动画
        wrapper.removeChild(wrapper.children[0])
        // 展示第一页
        display(wrapper.children[0], 'grid');

        // 为添加按钮绑定事件
        let addBtns = document.querySelectorAll('.mod_list_menu li[title="添加到歌单"]');
        for (let i = 0; i < addBtns.length; i++) {
            addBtns[i].onclick = function () {

                clickAdd(parseInt(this.parentNode.previousElementSibling.getAttribute('src-songid')), function () {
                    // 关闭弹窗
                    document.querySelector('.addsong_playlist_close').click();
                });
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

                // console.log(document.querySelector('.playlist_bd_song_title').offsetTop)
                scroll(document.querySelector('.playlist_bd_song_title').offsetTop);
            }
        }, function () {
            changePage(0, document.querySelectorAll('.playlist_bd_page li'));
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

    let playlistData;
    function getPlaylist() {
        ajax({
            url: 'http://localhost:3000/user/playlist',
            data: {
                uid: user.id
            },
            success: function (data) {

                playlistData = data.playlist;// 数组
            }
        })
    }

    // 创建"收藏到我的歌单"弹窗
    function createPlaylist(fn) {
        let addSong = document.querySelector('.addsong_playlist');
        let addSongOl = addSong.lastElementChild;
        let close = addSong.querySelector('.addsong_playlist_close');
        // 显示我创建的所有歌单
        userId = user.id;
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





    // 评论区

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
            return `< li class= "comment_bd_item" src - cid="${value.commentId}" >
        <img src="${value.user.avatarUrl}"
            class="comment_bd_pic">
        <div class="comment_bd_info">
            <h5 class="comment_bd_name">${value.user.nickname}</h5>
            <p class="comment_bd_text">${value.beReplied.length !== 0 ? `回复 @<span class="highlight">${value.beReplied[0].user.nickname}</span>: ${value.content}` : value.content}</p>
            <p class="comment_reply">${value.beReplied.length !== 0 ? value.beReplied[0].content : ''}</p>
            <i class="comment_bd_time">${getYearTime(value.time)}</i>
            <a href="javascript:;" class="comment_bd_praise" src-t=1>${value.likedCount}</a>
            <a href="javascript:;" class="comment_bd_commentHim"></a>
            </div>
        <div class="comment_input">
            <textarea name="" id="" cols="30" rows="10" placeholder="回复@${value.user.nickname}"></textarea>
            <em class="comment_warn">剩余 <span class="highlight">300</span> 字</em>
            <a href="javascript:;" class="comment_face"></a>
            <button class="comment_post">回复</button>
            <button class="comment_cancel">取消</button>
        </div>
    </ > `
        }).join('') + `${data.hasMore ? `<a href="javascript:;" class="load_more">点击加载更多 ∨</a>` : ``}`;

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
    function loadNewComment(data, wrapper, fn) {
        // 渲染总数量
        let title = wrapper.children[0];
        title.innerHTML = `最新评论(${data.totalCount})`;

        let ul = document.createElement('ul');
        ul.className = 'comment_bd_content';
        ul.innerHTML = data.comments.map(value => {
            return `< li class= "comment_bd_item" src - cid="${value.commentId}" >
        <img src="${value.user.avatarUrl}"
            class="comment_bd_pic">
        <div class="comment_bd_info">
            <h5 class="comment_bd_name">${value.user.nickname}</h5>
            <p class="comment_bd_text">${value.beReplied ? `回复 @<span class="highlight">${value.beReplied[0].user.nickname}</span>: ${value.content}` : value.content}</p>
            <p class="comment_reply">${value.beReplied ? value.beReplied[0].content : ''}</p>
            <i class="comment_bd_time">${getYearTime(value.time)}</i>
            <a href="javascript:;" class="comment_bd_praise" src-t=1>${value.likedCount}</a>
            <a href="javascript:;" class="comment_bd_commentHim"></a>
            </div>
        <div class="comment_input">
            <textarea name="" id="" cols="30" rows="10" placeholder="回复@${value.user.nickname}"></textarea>
            <em class="comment_warn">剩余 <span class="highlight">300</span> 字</em>
            <a href="javascript:;" class="comment_face"></a>
            <button class="comment_post">回复</button>
            <button class="comment_cancel">取消</button>
        </div>
    </ > `
        }).join('') + `${data.hasMore ? `<a href="javascript:;" class="load_more">点击加载更多 ∨</a>` : ''}`;

        wrapper.appendChild(ul);

        coomentBasis(ul, getNewComment);
    }


    // 评论区所有功能
    function coomentBasis(ul, fn) {
        // 点击恢复显示输入框
        let commentItems = ul.querySelectorAll('.comment_bd_commentHim');
        for (let i = 0; i < commentItems.length; i++) {
            commentItems[i].onclick = function () {
                this.parentNode.parentNode.className = 'comment_bd_item comment_feedback';
            }
        }

        // 点击取消按钮取消评论，隐藏输入框
        let cancelBtns = ul.querySelectorAll('.comment_cancel');
        for (let i = 0; i < cancelBtns.length; i++) {
            cancelBtns[i].onclick = function () {
                this.parentNode.parentNode.className = 'comment_bd_item';
            }
        }

        // 输入时实时显示剩余可输入文字的数量
        let textItems = ul.querySelectorAll('textarea');
        for (let i = 0; i < textItems.length; i++) {
            textItems[i].oninput = function () {
                this.nextElementSibling.children[0].innerHTML = `${300 - this.value.length}`;
            }

            // 点赞/取消点赞
            let praiseBtns = ul.querySelectorAll('.comment_bd_praise');
            for (let i = 0; i < praiseBtns.length; i++) {
                praiseBtns[i].onclick = debounce(function () {
                    let t = parseInt(this.getAttribute('src-t'));
                    let that = this;
                    ajax({
                        url: 'http://localhost:3000/comment/like',
                        data: {
                            id: pid.id,
                            cid: parseInt(this.parentNode.parentNode.getAttribute('src-cid')),
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
                })
            }

            // 点击回复按钮回复评论
            let postItem = ul.querySelectorAll('.comment_post');
            for (let i = 0; i < postItem.length; i++) {
                postItem[i].onclick = function () {
                    let that = this;
                    let textarea = this.parentNode.children[0];
                    if (textarea.value.length > 0) {
                        ajax({
                            url: 'http://localhost:3000/comment',
                            data: {
                                t: 2,
                                type: pid.type,
                                id: pid.id,
                                content: textarea.value,
                                commentId: parseInt(this.parentNode.parentNode.getAttribute('src-cid'))
                            },
                            success: function (data) {
                                if (data.code == 200) {
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
                                        } `
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
                                    li.querySelector('.comment_bd_praise').onclick = oldLi.querySelector('.comment_bd_praise').onclick;
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
            }

            // 下一页接口
            ul.querySelector('.load_more').onclick = function () {
                fn();

                this.parentNode.removeChild(this);
            }
        }
    }
})