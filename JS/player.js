window.addEventListener('load', function () {

    // 阻止按下键盘一些键时浏览器的默认行为
    window.addEventListener('keydown', function (e) {
        e.preventDefault();
    })


    let player = document.querySelector('.player')
    let audio = document.querySelector('audio');

    // 缓存
    let loadBar = player.querySelector('.player_progress_buffer');
    audio.addEventListener('timeupdate', function () {
        let flag = true;
        audio.oncanplaythrough = () => flag = false;
        let buffer = audio.buffered;
        if (flag) {
            // 已缓冲的时长
            let timeLoaded = buffer.end(buffer.length - 1);
            console.log(timeLoaded)
            loadBar.style.width = (timeLoaded / audio.duration) * 100 + '%';
            console.log(1)
        }
        // // 已缓冲的时长
        // let timeLoaded = buffer.end(buffer.length - 1);
        // console.log(timeLoaded)
        // loadBar.style.width = (timeLoaded / audio.duration) * 100 + '%';
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
                updateProgress(progress);
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
            audio.currentTime = num * audio.duration;

            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
    // 歌曲进度条
    function updateProgress(obj) {
        let timer = setInterval(function () {
            let num = (audio.currentTime / audio.duration) * 100;
            obj.style.width = num + '%';

            // console.log(1)
            if (num === 100) {
                clearInterval(timer);
                timer = null;
            }
        }, 2000);
    }
    // 按下键盘 ➡、⬅ 快进、快退
    window.addEventListener('keyup', function (e) {
        // 快退
        if (e.key === 'ArrowLeft') {
            // 获得比例
            let num = (audio.currentTime / audio.duration) - 0.05;
            if (num < 0) {
                num = 0;
            }

            progress.style.width = num * 100 + '%';
            audio.currentTime = num * audio.duration;
        }
        // 快进
        if (e.key === 'ArrowRight') {
            // 获得比例
            let num = (audio.currentTime / audio.duration) + 0.05;
            if (num > 100) {
                num = 100;
            }

            progress.style.width = num * 100 + '%';
            audio.currentTime = num * audio.duration;
        }
    })
    // 点击进度条调节进度
    progressBar.addEventListener('click', function (e) {
        let long = e.clientX - progress.getBoundingClientRect().left;
        let num = long / progressBar.offsetWidth;

        progress.style.width = num * 100 + '%';
        audio.currentTime = audio.duration * num;
    })

    // 当前时间
    let current = player.querySelector('.player_body_now');
    audio.addEventListener('timeupdate', function () {
        current.innerHTML = getTime(audio.currentTime * 1000);
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

})