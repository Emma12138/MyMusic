window.addEventListener('load', function () {

    // 获取用户id
    let userId;
    let userData;
    if (window.localStorage.user) {
        userData = JSON.parse(window.localStorage.getItem('user'));
        userId = userData.account.id;
    }


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

    let index = 0;

    // 更新播放列表
    window.addEventListener('message', function (e) {
        console.log(e);
    })

    // 获取播放列表
    // window.localStorage.removeItem('playlist')
    let playlist;
    let audioArr = [];

    let playlistBd = document.querySelector('.playlist_body');


    if (!window.localStorage.playlist) {
        window.localStorage.setItem('playlist', JSON.stringify(['1463165983', '417859631', '32507038', '27955653', '415792881', '1392089153']));
    } else {
        playlist = JSON.parse(window.localStorage.playlist);// 存放的是歌曲id

        // 获取歌曲详情
        getSongsDetail();

        // 获得播放列表的歌曲的url
        getAudioSrc();

        audio.src = audioArr[0];

        getLyric(playlist[0]);
    }

    // 获取播放列表的所有歌曲的详细信息
    function getSongsDetail() {
        ajax({
            url: 'http://localhost:3000/song/detail',
            data: {
                ids: playlist.join(',')
            },
            success: function (data) {
                // 成功后渲染到播放列表
                renderPlaylist(data.songs);
            }
        })
    }

    // 渲染播放列表数据的函数
    function renderPlaylist(data) {
        playlistBd.innerHTML = data.map((value, index) => {
            return `<li class="playlist_item" src-id=${value.id} src-index=${index}>
            <a href="javascript:;" class="playlist_item_play iconfont">&#xe610;</a>
            <div class="playlist_item_info">
                <span class="playlist_item_name">${value.alia.length === 0 ? value.name : `${value.name}&nbsp;(${value.alia[0]})`}</span><br>
                <span class="playlist_item_singer">
                    ${value.ar.length === 1 ? `<a href="javascript:;" src-id=${value.ar[0].id}>${value.ar[0].name}</a>` : value.ar.map(value => {
                return `<a href="javascript:;" src-id=${value.id}>${value.name}</a>`
            }).join(`&nbsp;/$nbsp;`)}
                </span>
            </div>
            <em class="playlist_item_time">${getTime(value.dt)}</em>
            <a href="javascript:;" class="playlist_item_del iconfont">&#xe62f;</a>
        </li>`
        }).join('');


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

    }

    function storPlaylist(index) {
        playlist.splice(index, 1);
        window.localStorage.playlist = JSON.stringify(playlist);
    }

    function getAudioSrc() {
        audioArr = playlist.map(value => {
            return `https://music.163.com/song/media/outer/url?id=${value}.mp3`
        })
    }

    // window.localStorage.removeItem('playlist');
    function clickDel(that) {
        // 获取所要删歌曲的索引
        let songIndex = parseInt(that.parentNode.getAttribute('src-index'));

        // 如果该歌曲正在播放，播放下一首歌曲
        if (songIndex === index) {
            // 删除src数组中对应的src
            audioArr.splice(songIndex, 1);

            if (index === audioArr.length) {
                index--;
            }

            // 如果删完后列表中已经没有歌曲了
            if (audioArr.length === 0) {
                msgPop('暂无歌曲了');
                audio.pause();
            } else {
                audio.src = audioArr[index];
                audio.play();

                goBack();
            }

        } else {
            // 删除src数组中对应的src
            audioArr.splice(songIndex, 1);
        }

        // 删除
        let parent = that.parentNode;
        parent.parentNode.removeChild(parent);

        // 删除本地存储中对应的数据
        storPlaylist(songIndex);

        let playItems = playlistBd.children;
        // 重新赋予 src-index
        for (let i = songIndex; i < playItems.length; i++) {
            playItems[i].setAttribute('src-index', i);
        }
    }

    function clickPlay(that) {
        index = parseInt(that.parentNode.getAttribute('src-index'));

        // 更新播放列表(正在播放模块)
        updateNow();

        audio.src = audioArr[index];

        if (playerBtn.title === '播放') {
            playerBtn.click();

            goBack();
        } else {
            audio.play();

            goBack();
        }


    }


    // let style = 'order';// 播放模式
    // 播放列表播放
    audio.addEventListener('ended', function () {
        // 顺序播放
        if (style === 'order') {
            index++;
            index = index === audioArr.length ? index = 0 : index;

            audio.src = audioArr[index];
            audio.play();

            goBack();
        } else if (style === 'cycle') {
            audio.loop = true;
            audio.play();
        } else if (style === 'random') {
            let num = index;
            while (num === index) {
                num = Math.round(Math.random() * (audioArr.length - 1));
            }
            console.log(num)
            index = num;

            audio.src = audioArr[index];
            audio.play();

            goBack();
        }
    })

    // 更新播放列表
    function updateNow() {

    }


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
    let playerBtn = player.querySelector('.player_stop');
    playerBtn.addEventListener('click', function () {
        if (this.title === '播放') {
            audio.play();
            this.innerHTML = '&#xe638;';
            this.title = '暂停';

            if (!audio.notFirstPlay) {
                // 进度条
                // updateProgress(progress);
            }
            audio.notFirstPlay = true;

        } else {
            audio.pause();
            this.innerHTML = '&#xe60f;';
            this.title = '播放';
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

        goBack();
    })
    let next = document.querySelector('.player_next');
    next.addEventListener('click', function () {
        index++;
        index = index == audioArr.length ? 0 : index;
        audio.src = audioArr[index];
        audio.play();

        goBack();
    })


    // 拖拽进度条
    let progressBar = progress.parentNode;
    progress.onmousedown = function () {
        let left = progress.getBoundingClientRect().left;
        let num = null;
        document.onmousemove = function (e) {
            num = (e.clientX - left) / progressBar.offsetWidth;
            if (num > 1) {
                num = 1;
            }
            if (num < 0) {
                num = 0;
            }
            current.innerHTML = getTime(num * audio.duration * 1000);

            progress.style.width = num * 100 + "%";

            return false;
        };

        document.onmouseup = function () {
            // 获得当前的宽度
            let width = parseInt(progress.style.width);

            audio.currentTime = num * audio.duration;

            // 歌词
            lyricChange(width - num * 100);

            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
    // 歌曲进度条
    audio.addEventListener('timeupdate', function () {
        let num = (audio.currentTime / audio.duration) * 100;
        progress.style.width = num + '%';
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
        let items = lyric.children;
        if (flag < 0) {
            for (let i = 0; i < items.length; i++) {
                items[i].className = '';
                let time = parseFloat(items[i].getAttribute('src-time'));
                if (time < audio.currentTime) {
                    lineNow++;
                    if (lineNow >= items.length) {
                        lineNow = items.length - 1;
                    }
                    // if (parseFloat(items[lineNow].getAttribute('src-time')) > audio.currentTime || lineNow === items.length) {
                    //     lineNow--;
                    // }
                }
            }
        } else {
            if (lineNow >= items.length) {
                lineNow = items.length - 1;
            }
            for (let i = lineNow; i >= 0; i--) {
                items[i].className = '';
                let time = parseFloat(items[i].getAttribute('src-time'));
                if (time > audio.currentTime) {
                    lineNow--;
                }
            }
        }

        items[lineNow].className = 'lyric_highlight';

        lyric.style.top = -(lineNow) * 40 + 'px';

        lineNow++;
    }

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
    let lyric = document.querySelector('.lyric_wrapper');
    function getLyric(id) {
        ajax({
            url: 'http://localhost:3000/lyric',
            data: {
                id: id
            },
            success: function (data) {
                console.log(JSON.stringify(data, null, 4))
                renderLrc(data.lrc.lyric, lyric, audio.addEventListener('timeupdate', lyricHighlight))
            }
        })
    }
    function renderLrc(data, obj, callback) {
        let arr = data.split('\n');
        arr.pop();

        obj.innerHTML = arr.map((value, index) => {
            let min = parseFloat(value.substr(value.indexOf('[') + 1, value.indexOf(':') - 1));
            let s = parseFloat(value.substr(value.indexOf(':') + 1, value.indexOf(']') - 1));
            let content = value.substr(value.indexOf(']') + 1);

            let str = content.substr(0, 1);
            if (str.includes(' ')) {
                content = content.replace(/ /, '');// 去掉前面空格
            }

            return `<p src-time=${(min * 60 + s).toFixed(3)} src-line=${index}>${content}</p>`
        }).join('');

        callback && callback();
    }
    let lineNow = 0;
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

            if (lyricFlag) {
                lyric.style.top = -(lineNow) * 40 + 'px';
            }

            lineNow++;
        }
    }

    function goBack() {
        getLyric(playlist[index]);
        lyric.style.top = 0;
        lineNow = 0;
    }

    // 拖拽歌词
    let lyricFlag = false;// 判断歌词是否在滚动
    lyric.addEventListener('mousedown', function (e) {
        lyric.style.transition = 'top 0s';

        let ot = e.clientY - lyric.offsetTop;
        document.onmousemove = function (e) {
            lyricFlag = true;
            let top = e.clientY - ot;
            lyric.style.top = top + "px";
            return false;
        };
        document.onmouseup = function () {
            let timer = setInterval(() => {
                lyric.style.transition = 'top .6s';
                lyricFlag = true;
                clearInterval(timer);
                timer = null;
            }, 2000)
            document.onmousemove = null;
            document.onmouseup = null;
        };
        return false;
    })
})