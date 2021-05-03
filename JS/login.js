window.addEventListener('load', function () {


    // 登录

    // 如果本地存储中有用户信息，自动登录
    let userData;
    if (window.localStorage.user) {
        userData = JSON.parse(window.localStorage.getItem('user'));

        // 更新头像
        loadAvatar(userData.profile.avatarUrl);
    }

    // 点击导航栏登录按钮唤起登录界面
    let loginBtn = document.querySelector('.header_login a');
    let login = document.querySelector('.login');
    // 遮罩
    let cover = document.querySelector('.cover');

    if (!loginBtn) {
        loginBtn = document.querySelector('.user');
    }

    // 唤起登录界面
    loginBtn.addEventListener('click', function () {
        // 遮罩
        display(cover);
        // 登陆界面
        display(login)
        // 隐藏滚动条
        document.body.style.overflowY = 'hidden';

        // 获取二维码
        qrLogin();
    })

    // 关闭登录界面
    let closeBtn = document.querySelector('.login_close');
    closeBtn.onclick = function () {
        // 关闭登录界面
        display(login, false);
        // 关闭遮罩
        display(cover, false);
        // 显示滚动条
        document.body.style.overflowY = '';
    }


    let goBtn = login.querySelector('.login_body_content input[type="button"]');
    let loginPhone = login.querySelector('.login_body_content input[type="text"]');
    let loginPsw = login.querySelector('.login_body_content input[type="password"]');
    let loginMsg = login.querySelector('.login_msg');
    let loginStatus = document.querySelector('.login_status');
    let phoneBtn = document.querySelector('.login_type a:first-child');
    let loginQr = document.querySelector('.login_body_qr');

    if (!loginStatus) {
        loginStatus = document.querySelector('.aside_login_status');
    }

    // 手机号登录
    phoneBtn.addEventListener('click', function () {
        this.className = 'a_current';
        this.nextElementSibling.className = '';

        display(goBtn.parentNode, 'flex');
        display(loginQr, false);
    })

    // 点击登录按钮发起 ajax请求
    goBtn.onclick = function () {
        console.log(loginPsw.value)
        let phoneReg = /^1[3-9][0-9]{9}$/;

        let phone = loginPhone.value.replace(/[\n\r ]/g, '');
        let psw = loginPsw.value.replace(/[\n\r ]/g, '');
        // 登录验证
        if (phone == '') {
            loginMsg.innerHTML = '请输入手机号';
            display(loginMsg);
        } else if (psw == '') {
            loginMsg.innerHTML = '请输入登录密码';
            display(loginMsg);
        } else if (!phoneReg.test(phone)) {
            loginMsg.innerHTML = '请输入正确的手机号';
            display(loginMsg);
        } else {
            display(loginMsg, false);

            // 发送登录请求
            ajax({
                type: 'post',
                url: 'http://localhost:3000/login/cellphone',
                data: {
                    phone: phone,
                    password: psw
                },
                header: {
                    'Content-Type': 'application/json'
                },
                success: function (data) {
                    if (data.msg == '密码错误') {
                        loginMsg.innerHTML = '请输入正确的密码';
                        display(loginMsg);
                    } else {

                        // 登陆成功，加载用户数据
                        loadUserData(data);
                    }

                },
                error: function (data) {
                    loginMsg.innerHTML = data.msg;
                    display(loginMsg);
                }
            })
        }
    }

    // 二维码登录
    let qrBtn = document.querySelector('.login_type a:last-child');
    qrBtn.addEventListener('click', function () {
        this.previousElementSibling.className = '';
        this.className = 'a_current';

        display(loginQr);
        display(goBtn.parentNode, false);

    })

    function qrLogin() {
        // 获取二维码 key
        let key;
        ajax({
            url: 'http://localhost:3000/login/qr/key',
            data: {
                timerstamp: +new Date()
            },
            success: function (data) {
                key = data.data.unikey;
                // 生成二维码图片
                getQrUrl(key);
            }
        })

        // 每隔一段时间检测扫码状态
        let qrMsg = loginQr.children[0];
        let timer = setInterval(function () {

            ajax({
                url: 'http://localhost:3000/login/qr/check',
                data: {
                    key: key,
                    timerstamp: +new Date()
                },
                success: function (data) {
                    if (data.code == 801) {
                        qrMsg.innerHTML = '使用手机扫描下方二维码';
                    } else if (data.code == 802) {
                        qrMsg.innerHTML = '待确认...';
                    } else if (data.code == 800) {
                        qrMsg.innerHTML = '二维码已过期';
                    } else if (data.code == 803) {
                        // 登陆成功

                        clearInterval(timer);
                        timer = null;

                        qrMsg.innerHTML = '授权登录成功！';

                        // 获取用户信息
                        ajax({
                            url: 'http://localhost:3000/user/account',
                            success: function (data) {
                                // 加载用户信息
                                loadUserData(data);
                            }
                        })

                    }
                }
            })
        }, 3000);
    }

    // 生成二维码图片
    function getQrUrl(key) {
        ajax({
            url: 'http://localhost:3000/login/qr/create',
            data: {
                key: key,
                qrimg: true,
                timerstamp: +new Date()
            },
            success: function (data) {
                loginQr.children[1].src = data.data.qrimg;
            }
        })
    }

    // 登陆成功后加载用户数据
    function loadUserData(data) {
        userData = data;

        // 更新头像
        let avatar = document.querySelector('.login_avatar');
        if (!avatar) {
            avatar = document.querySelector('.aside_login_avatar');
            document.querySelector('.aside_wrapper span:first-of-type').className = 'logined';
        } else {
            display(avatar);
            display(loginBtn, false);
            display(loginStatus);
        }

        avatar.src = data.profile.avatarUrl;


        // 关闭登陆界面
        closeBtn.click();
        loginPhone.value = '';
        loginPsw.value = '';

        // 用户信息存储到 localstorage
        window.localStorage.setItem('user', JSON.stringify(data))
    }

    // 退出登录按钮
    let logoutBtn = document.querySelector('.login_menu_wrapper a:last-child');
    if (!logoutBtn) {
        logoutBtn = document.querySelector('.aside_login_menu span:last-child a');
    }

    logoutBtn.addEventListener('click', function () {
        ajax({
            url: 'http://localhost:3000/logout',
            success: function () {
                userData = null;

                // 头像
                let avatar = document.querySelector('.login_avatar');
                if (!avatar) {
                    avatar = document.querySelector('.aside_login_avatar');
                    document.querySelector('.aside_wrapper span:first-of-type').className = '';
                } else {
                    display(avatar, false);
                    display(loginBtn);
                    display(loginStatus, false);
                }
                avatar.src = '';

                // 删除本地存储中的用户信息
                window.localStorage.user = '';
            }
        })
    })



    // 点击我的音乐跳转到个人界面
    let myMusic = document.querySelector('.header_nav li:nth-child(2)');
    if (myMusic) {
        myMusic.onclick = function () {
            if (userData) {
                let userId = userData.profile.userId;
                // 跳转到用户个人页面
                window.location.href = `user.html?id=${userId}`;
            } else {
                loginBtn.click();
            }
        }
    }

})