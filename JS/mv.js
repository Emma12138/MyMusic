window.addEventListener('load', function () {

    let mvid = window.location.search.substr(4);
    let pid = {
        type: 1,
        id: mvid
    }


    let mvData = null;
    // 获取 mv 信息
    ajax({
        url: 'http://localhost:3000/mv/detail',
        data: {
            mvid: pid.id
        },
        success: function (data) {
            mvData = data.data;

            loadInfo();
        }
    })

    function loadInfo() {
        // 视频封面
        video.poster = mvData.cover;

        // mv 名字和歌手
        let name = document.querySelector('.mv_info_name');
        name.innerHTML = mvData.name;
        let singer = document.querySelector('.mv_info_singer');
        singer.innerHTML = mvData.artistName;
        singer.setAttribute('src-id', mvData.artistId);
        singer.onclick = function () {
            let keyword = this.innerHTML;
            window.open(`search.html?keywords=${keyword}`, '_blank');
        }


        // 播放量、评论数、时间
        let count = document.querySelector('.mv_info_count');
        let playCount = mvData.playCount;
        playCount = playCount >= 10000 ? changeNum(playCount) : playCount;
        count.innerHTML = `${playCount}播放`;
        let comment = document.querySelector('.mv_info_comment');
        comment.innerHTML = `${mvData.commentCount}条评论`;
        let time = document.querySelector('.mv_info_time');
        time.innerHTML = mvData.publishTime;

        // 简介
        let desc = document.querySelector('.mv_desc_content');
        desc.innerHTML = mvData.desc;
        // 若简介过长，省略
        getDesc(desc);

    }

    // 若简介过长，省略，点击更多查看更多内容
    function getDesc() {
        let desc = document.querySelector('.mv_desc_content');
        let more = document.querySelector('.mv_desc_more');
        if (desc.offsetHeight > 42) {
            desc.className = 'mv_desc_content_cut';
            display(more);
        }
        // 点击展开更多查看更多内容
        more.addEventListener('click', function () {
            if (this.innerHTML == '展开更多') {
                desc.className = 'mv_desc_content';
                this.innerHTML = '收起';
            } else {
                desc.className = 'mv_desc_content_cut';
                this.innerHTML = '展开更多';
            }

        })
    }


    // 获取 mv 的 url
    ajax({
        url: 'http://localhost:3000/mv/url',
        data: {
            id: pid.id
        },
        success: function (data) {

            video.src = data.data.url;
        }
    })


    // 阻止按下键盘一些键时浏览器的默认行为
    window.addEventListener('keydown', function (e) {

        if (e.key == ' ' || e.key == 'ArrowLeft' || e.key == 'ArrowRight' || e.key == 'ArrowUp' || e.key == 'ArrowDown' || e.key == 'Escape') {
            e.preventDefault();
        }
    })



    let video = document.querySelector('video');

    // 视频封面


    let player = document.querySelector('.player');

    // 缓存
    let loadBar = player.querySelector('.player_progress_buffer');
    video.addEventListener('timeupdate', function () {

        let buffer = video.buffered;
        if (buffer.length !== 0) {
            // 已缓冲的时长
            let timeLoaded = buffer.end(buffer.length - 1);
            loadBar.style.width = (timeLoaded / video.duration) * 100 + '%';

        }
    })

    // 进度条
    let progress = player.querySelector('.player_progress_bar');


    // 播放功能
    video.addEventListener('error', function () {
        msgPop('当前资源不可用，试试别的吧~~');
        changePlayer(true);
    })
    video.addEventListener('canplay', function () {
        video.play();
    })
    video.addEventListener('pause', function () {
        changePlayer(true);
    })
    video.addEventListener('play', function () {
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
    let playerBtn = player.querySelector('.player_controll');
    playerBtn.addEventListener('click', function () {
        if (this.title === '播放') {
            video.play();

        } else {
            video.pause();
        }
    })

    // 按空格键也能控制播放暂停
    window.addEventListener('keyup', function (e) {
        if (e.key == ' ') {
            playerBtn.click();
        }
    })
    // 点击视频也可控制播放暂停
    let clickTimer = null;// 解决单击与双击事件冲突的问题
    video.addEventListener('click', function () {
        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
            return;
        }
        clickTimer = setTimeout(function () {
            playerBtn.click();
            clearTimeout(clickTimer);
            clickTimer = null;
        }, 200);

    })


    // 时长提示
    let progressBar = progress.parentNode;
    let progressTime = player.querySelector('.player_progress_time');
    progressBar.addEventListener('mousemove', function (e) {
        let long = progressBar.getBoundingClientRect().left;
        let num = (e.clientX - long) / progressBar.offsetWidth;
        num = num < 0 ? 0 : num;

        progressTime.style.left = num * 100 + '%';
        progressTime.innerHTML = getTime(num * video.duration * 1000);
    })

    // 拖拽进度条
    let dragFlag = false;
    progress.onmousedown = function () {

        let left = progress.getBoundingClientRect().left;
        let num = null;

        document.onmousemove = function (e) {
            let current = player.querySelector('.player_progress_time');

            dragFlag = true;

            num = (e.clientX - left) / progressBar.offsetWidth;
            if (num > 1) {
                num = 1;
            }
            if (num < 0) {
                num = 0;
            }
            current.innerHTML = getTime(num * video.duration * 1000);

            progress.style.width = num * 100 + "%";

            return false;
        };

        document.onmouseup = function () {

            dragFlag = false;
            document.onmousemove = null;
            document.onmouseup = null;

            video.currentTime = num * video.duration;


            return false;
        }

        return false;

    };

    // 点击进度条调节进度
    progressBar.addEventListener('click', function (e) {

        let long = e.clientX - progress.getBoundingClientRect().left;
        let num = long / progressBar.offsetWidth;

        progress.style.width = num * 100 + '%';
        video.currentTime = video.duration * num;

    })



    // 进度条
    video.addEventListener('timeupdate', function () {
        if (!dragFlag) {
            let num = (video.currentTime / video.duration) * 100;
            progress.style.width = num + '%';
            document.querySelector('.player>.player_progress .player_progress_bar').style.width = num + '%';
        }

    })

    // 按下键盘 ➡、⬅ 快进、快退
    window.addEventListener('keyup', function (e) {
        let num;
        // 快退
        if (e.key === 'ArrowLeft') {
            // 获得比例
            num = (video.currentTime / video.duration) - 0.05;
            if (num < 0) {
                num = 0;
            }

            progress.style.width = num * 100 + '%';
            video.currentTime = num * video.duration;
        }
        // 快进
        if (e.key === 'ArrowRight') {
            // 获得比例
            num = (video.currentTime / video.duration) + 0.05;
            if (num > 100) {
                num = 100;
            }

            progress.style.width = num * 100 + '%';
            video.currentTime = num * video.duration;
        }

    })


    // 当前时间
    let current = player.querySelector('.player_body_now');
    video.addEventListener('timeupdate', function () {
        current.innerHTML = getTime(video.currentTime * 1000);
    })

    // 视频长度
    let all = player.querySelector('.player_body_all');
    video.oncanplay = function () {
        all.innerHTML = getTime(video.duration * 1000);
    }

    // 设置初始音量
    video.volume = 0.3;
    // 静音功能
    let muted = player.querySelector('.player_voice a i');
    muted.addEventListener('click', function () {
        // 如果静音了，就开启声音
        if (video.muted) {
            video.muted = false;
            this.innerHTML = '&#xe80c;';
            this.title = '静音';
            voice.style.height = video.volume * 100 + '%';
        } else {
            video.muted = true;
            this.innerHTML = '&#xe621;';
            this.title = '开启声音';
            voice.style.height = '0%';
        }
    })

    // 拖动音量条调节声音
    let voice = player.querySelector('.player_voice_progress');
    voice.style.height = '30%';
    voice.onmousedown = function () {

        let long = voice.getBoundingClientRect().bottom;

        document.onmousemove = function (e) {
            let num = (long - e.clientY) / voice.parentNode.offsetHeight;
            if (num > 1) {
                num = 1;
            }
            if (num < 0) {
                num = 0;
            }

            voice.style.height = num * 100 + "%";

            video.volume = num;

            return false;
        };

        document.onmouseup = function () {
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };

    // 按键盘 ⬆、⬇键调节音量
    let voiceMsg = document.querySelector('.video_wrapper_msg');
    let VoiceTimer = null;
    window.addEventListener('keyup', function (e) {
        let num;

        // 键盘 ⬆ 键
        if (e.key === 'ArrowUp') {
            if (video.muted) {
                return;
            }
            num = video.volume + 0.1;
            if (num > 1) {
                num = 1;
            }
            video.volume = num;

            voice.style.height = num * 100 + '%';
        }

        // 键盘 ⬇ 键
        if (e.key === 'ArrowDown') {
            if (video.muted) {
                return;
            }
            num = video.volume - 0.1;
            if (num < 0) {
                num = 0;
            }
            video.volume = num;

            voice.style.height = num * 100 + '%';
        }

        if (num != undefined) {
            voiceMsg.innerHTML = parseInt(num * 100) + '%';

            if (VoiceTimer) {
                clearInterval(VoiceTimer);
            }
            voiceMsg.style.opacity = 1;
            VoiceTimer = setInterval(function () {
                voiceMsg.style.opacity = 0;
                clearInterval(VoiceTimer);
                VoiceTimer = null;
            }, 1000);
        }

    })

    // 点击音量条调节音量
    let voiceBar = voice.parentNode;
    voiceBar.addEventListener('click', function (e) {
        let long = voice.getBoundingClientRect().bottom;
        let num = (long - e.clientY) / voice.parentNode.offsetHeight;

        voice.style.height = num * 100 + '%';
        video.volume = num;
    })


    // 隐藏控件
    let videoWrapper = document.querySelector('.video_wrapper');
    let displayTimer = null;
    let outerProgress = document.querySelector('.player>.player_progress');
    videoWrapper.addEventListener('mouseover', function () {

        if (displayTimer) {
            clearTimeout(displayTimer);
            displayTimer = null;
        }

        displayTimer = setTimeout(function () {
            player.style.bottom = '-10%';
            display(outerProgress);
        }, 5000);

        videoWrapper.onmousemove = function () {
            player.style.bottom = '0';
            display(outerProgress, false);
        }
    })



    // 全屏
    let fullBtn = player.querySelector('.player_full');
    let fullFlag = false;// 不是全屏
    fullBtn.onclick = function () {
        // 如果当前是全屏
        if (fullFlag) {

            document.exitFullscreen();
        } else {

            document.documentElement.requestFullscreen();
        }

    }

    document.onfullscreenchange = function () {
        // 如果当前是全屏
        if (!fullFlag) {
            fullFlag = true;

            fullBtn.title = '退出全屏';

            videoWrapper.className = 'video_wrapper full';
            document.body.style.overflowY = 'hidden';

        } else {
            fullFlag = false;

            fullBtn.title = '全屏';

            videoWrapper.className = 'video_wrapper';
            document.body.style.overflowY = 'auto';

        }
    }

    // 双击全屏
    video.ondblclick = function () {
        fullBtn.click();
    }


    // 弹幕
    let bullet = document.querySelector('.bullet');
    let bulletNum = 0;
    let bulletFlag = false;
    let bulletContent = bullet.children[0];

    let BulletTime = null;
    let BulletPage = 1;

    // 弹幕开关
    let bulletBtn = document.querySelector('.bullet_open');
    bulletBtn.onclick = function () {
        if (this.title == '关闭弹幕') {
            display(bullet, false);
            this.title = '开启弹幕';
            this.innerHTML = '&#xe696;';
            bulletFlag = false;
        } else {
            display(bullet);
            this.title = '关闭弹幕';
            this.innerHTML = '&#xe697;';
            bulletFlag = true;
        }
    }


    // 获取评论，渲染成弹幕
    function getBullet(callback) {

        ajax({
            url: 'http://localhost:3000/comment/new',
            data: {
                id: pid.id,
                type: pid.type,
                pageNo: BulletPage,
                sortType: 3,
                cursor: BulletTime
            },
            success: function (data) {
                data = data.data;
                BulletPage++;
                BulletTime = data.cursor;

                loadBullet(data.comments);
                callback && callback();
            }
        })
    }
    function loadBullet(data) {

        let frag = document.createDocumentFragment();

        data.forEach(value => {
            let p = document.createElement('p');
            p.innerHTML = value.content;
            frag.appendChild(p);
        })

        bulletContent.appendChild(frag);
    }

    getBullet(function () {
        bulletFlag = true;
    });
    video.addEventListener('timeupdate', function () {
        if (bulletFlag) {
            let long = bulletContent.lastElementChild.getBoundingClientRect().right;
            let BulletLong = video.getBoundingClientRect().right;

            if (long < BulletLong && long > BulletLong - 30) {
                getBullet();
            }
            bulletContent.style.left = -bulletNum + 'px';
            bulletNum += 20;
        } else {
        }
    })




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
                id: pid.id,
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
    function getNewComment(pid) {
        ajax({
            url: 'http://localhost:3000/comment/new',
            data: {
                id: pid.id,
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

                loadNewComment(data, document.querySelector('.comment_bd_new_wrapper'));
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
        let regValue = textarea.value.replace(/^\s*|\s*$/g, '');
        if (regValue.length > 0 && regValue.length <= 300) {
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

    getHotComment(pid);
    getNewComment(pid);

})