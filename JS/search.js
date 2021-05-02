

window.onload = function () {

    document.body.style.zoom = 1;

    // 获取参数：关键词、用户id
    let searchKey;
    let userId;
    let param = window.location.search;// #keywords=xxx  /  #userId=xxxxxx&keywords=xxx
    function makeParams(param) {
        if (param.includes('&')) {
            userId = undefined;
        } else {
            userId = parseInt(param.substr(param.indexOf('userId=') + 7, param.indexOf('&keywords=')));
        }
        searchKey = decodeURIComponent(param.substr(param.indexOf('keywords=') + 9)).replace(/[\n\r ]/g, '');
    }
    makeParams(param);
    // 登录
    if (userId) {
        console.log(userId)
        ajax({
            // async: false,
            url: 'http://localhost:3000/user/detail',
            data: {
                uid: userId
            },
            success: function (data) {
                // 加载用户基本信息
                loadUser(data.profile);
            }
        })
        function loadUser(data) {
            // 更新头像
            let headerAvatar = document.querySelector('.login_avatar');
            let loginBtn = headerAvatar.previousElementSibling;
            let userPic = document.querySelector('.user_pic img');
            let avatarUrl = data.avatarUrl;
            headerAvatar.src = avatarUrl;
            userPic.src = avatarUrl;
            display(headerAvatar);
            display(loginBtn, false);

        }
    }



    // 热门搜索
    ajax({
        url: 'http://localhost:3000/search/hot/detail',
        success(data) {
            let mainSearchHot = document.querySelectorAll('.main_search_hot_body a');

            for (let i = 0; i < mainSearchHot.length; i++) {
                mainSearchHot[i].innerHTML = data.data[i].searchWord;

                // 点击热门搜索的关键词时发起搜索
                mainSearchHot[i].addEventListener('click', function () {

                    clickSearchResult(this.innerHTML, mainSearchInput);
                })
            }

        }
    })



    // 页面滚动一定距离时搜索框置顶
    let mainSearchHd = document.querySelector('.search_hd');
    let mainSearchDetail = document.querySelector('.main_search_detail');// 搜索历史
    let mainSearchResult = document.querySelector('.main_search_result');// 搜索结果

    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 180) {
            // 加上类名，改为固定定位
            document.querySelector('.search_hd').className = 'search_hd search_hd_top';

            // 禁用搜索历史和搜索结果
            display(mainSearchDetail, false)
            display(mainSearchResult, false)
        } else {
            mainSearchHd.className = 'search_hd';

            display(mainSearchDetail)
            display(mainSearchResult)
        }
    })
    // 若页面初始化后也调用
    window.dispatchEvent(new Event('scroll'));


    // 中部搜索框搜索
    let mainSearchInput = document.querySelector('.search_input input');
    let mainSearchItems = mainSearchResult.querySelectorAll('.main_search_result_item_wrapper');

    mainSearchInput.value = decodeURIComponent(searchKey);

    mainSearchInput.addEventListener('blur', function () {
        // 记录搜索框是否得到焦点，用于判断按下回车键是否发起搜索
        mainSearchInput.isFocus = false;

        // 隐藏搜索结果
        mainSearchResult.style.maxHeight = '0';
    })
    mainSearchInput.addEventListener('focus', function () {
        // 记录搜索框是否得到焦点，用于判断按下回车键是否发起搜索
        mainSearchInput.isFocus = true;

        if (mainSearchItems[0].style.display == 'block') {
            // 展示搜索结果
            mainSearchResult.style.maxHeight = '800px';
        }
    })
    mainSearchInput.addEventListener('input', debounce(function () {
        let value = this.value.replace(/[\n\r ]/g, '');
        // 如果内容为空则返回
        if (value === '') {
            mainSearchResult.style.maxHeight = '0';
            return;
        }

        // 实时搜索
        ajax({
            type: 'get',
            url: 'http://localhost:3000/search/suggest',
            header: {
                'xhrFields': '{ withCredentials: true }'
            },
            data: {
                keywords: value
            },
            success: function (data) {
                // 渲染数据
                let song = mainSearchItems[0];
                let singer = mainSearchItems[1];
                let album = mainSearchItems[2];
                let playlist = mainSearchItems[3];

                mainSearchResult.style.maxHeight = '1000px';

                // 单曲
                if (data.result.songs) {
                    song.innerHTML = `${data.result.songs.map(value => {
                        let reg = new RegExp(mainSearchInput.value, 'gi');
                        return `<a href="javascript:;" class="main_search_result_item">
                                 <h5 class="main_search_result_info_name">
                         
                         ${reg.test(value.name) ? value.name.split(reg).join(`<span class="main_search_key">${mainSearchInput.value}</span>`) : value.name}
                         
                               
                                 </h5>
                                 <div class="main_search_result_info_singer">&nbsp;-&nbsp;
                         
                         ${reg.test(value.artists[0].name) ? value.artists[0].name.split(reg).join(`<span class="main_search_key">${mainSearchInput.value}</span>`) : value.artists[0].name}
                         
                               
                                 </div>
                             </a>`
                    }).join('')}`;
                    display(song.parentNode, 'flex');
                } else {
                    display(song.parentNode, false);
                }


                // 歌手
                if (data.result.artists) {
                    singer.innerHTML = `${data.result.artists.map(value => {

                        let reg = new RegExp(mainSearchInput.value, 'gi');
                        return `<a href="javascript:;" class="main_search_result_item">
                                 <div class="main_search_result_info_name">
    
                         ${reg.test(value.name) ? value.name.split(reg).join(`<span class="main_search_key">${mainSearchInput.value}</span>`) : value.name}
                         ${value.alias.length !== 0 && reg.test(value.alias[0]) ? `( ${value.alias[0].replaceAll(reg, `<span class="main_search_key">${value.alias[0][value.alias[0].search(reg)]}</span>`)} )` : ''}
    
                         </div>
                             </a>`
                    }).join('')}`;
                    display(singer.parentNode, 'flex');
                } else {
                    display(singer.parentNode, false);
                }


                // 专辑
                if (data.result.albums) {
                    album.innerHTML = `${data.result.albums.map((value, index) => {
                        if (index < 4) {
                            let reg = new RegExp(mainSearchInput.value, 'gi');
                            return `<a href="javascript:;" class="main_search_result_item">
                                          <div class="main_search_result_info_name">
    
                                  ${reg.test(value.name) ? value.name.split(reg).join(`<span class="main_search_key">${mainSearchInput.value}</span>`) : value.name}
         
                                        </div>
                                         <div class="main_search_result_info_singer">&nbsp;-&nbsp;
    
                                         ${reg.test(value.artist.name) ? value.artist.name.split(reg).join(`<span class="main_search_key">${mainSearchInput.value}</span>`) : value.artist.name}
                
                                        </div>
                                 </a>`
                        }
                    }).join('')}`;
                    display(album.parentNode, 'flex');
                } else {
                    display(album.parentNode, false);
                }


                // 歌单
                if (data.result.playlists) {
                    playlist.innerHTML = `${data.result.playlists.map((value, index) => {
                        if (index < 4) {
                            let reg = new RegExp(mainSearchInput.value, 'gi');
                            return `<a href="javascript:;" class="main_search_result_item" src-id=${value.id}>
                                          <div class="main_search_result_info_name">
    
                                  ${reg.test(value.name) ? value.name.split(reg).join(`<span class="main_search_key">${mainSearchInput.value}</span>`) : value.name}
         
                                        </div>
                                 </a>`
                        }
                    }).join('')}`;
                    display(playlist.parentNode, 'flex');
                } else {
                    display(playlist.parentNode, false);
                }



                // 绑定发起搜索的事件
                // 点击歌单的搜索结果进入歌单详情页面
                let plItems = playlist.children;
                for (let i = 0; i < plItems.length; i++) {
                    plItems[i].addEventListener('click', function () {
                        let id = this.getAttribute('src-id');
                        clickSearchResult(this.children[0].textContent.replace(/[\n\r ]/g, ''),
                            mainSearchInput, `file:///C:/Users/Emma/Desktop/study/MyMusic/playlist.html?pid=${id}&type=2`);
                    })
                }
                let items = document.querySelectorAll('.main_search_result_item');
                for (let i = 0; i < items.length; i++) {
                    items[i].addEventListener('click', function () {
                        if (!this.className.includes('search_result_list')) {
                            let keywords = this.children[0].textContent;
                            clickSearchResult(keywords,
                                mainSearchInput);
                        }
                    })
                }

            },
            error: function (data, xhr) {
                console.log(xhr.status)
            }
        })
    })
    )


    // 搜索历史
    // localstor.clear();
    // 如果 localstorage 中未设置存储搜索历史的数组，就设置
    if (!window.localStorage.history) {
        localstor.setItem('history', JSON.stringify([]));
    }

    // 展示搜索历史
    mainSearchInput.addEventListener('focus', function () {

        let mainHis = document.querySelector('.main_search_history_item_wrapper');
        let hisData = JSON.parse(window.localStorage.history);

        // 最多展示5条
        mainHis.innerHTML = hisData.map((value, index) => {
            if (value !== '' && index < 5) {
                return `<a class="main_search_history_item">${value}
            <em class="main_search_history_item_close"></em>
            </a>`
            }
        }).join('');

        // 点击搜索历史发起搜索
        let items = mainHis.children;
        for (let i = 0; i < items.length; i++) {
            items[i].addEventListener('click', function (e) {
                // 取消事件委派，防止点击删除按钮时也会发起搜索
                if (e.target.className !== 'main_search_history_item_close') {

                    clickSearchResult(this.textContent, mainSearchInput);

                }
            })
        }

        // 点击关闭按钮删除搜索历史
        let hisClose = mainHis.querySelectorAll('.main_search_history_item_close');
        for (let i = 0; i < hisClose.length; i++) {
            hisClose[i].onclick = function () {

                closeHis(this, mainSearchInput, hisData);
            }
        }
    })

    // 点击垃圾箱按钮删除所有搜索历史
    document.querySelector('.main_search_history_delete').onclick = function () {
        window.localStorage.history = '[]';

        mainSearchInput.focus();
    }



    // 点击搜索按钮进入搜索页，更新搜索历史
    let mainSearchBtn = document.querySelector('.search_input button')
    mainSearchBtn.onclick = function () {
        if (mainSearchInput.value.replace(/[\n\r ]/g, '') === '') {
            // 请求默认搜索关键词
            ajax({
                url: "http://localhost:3000/search/default",
                success: function (data) {
                    mainSearchInput.value = data.data.realkeyword;
                    clickSearchResult(mainSearchInput.value, mainSearchInput);
                }
            })
        } else {
            clickSearchResult(mainSearchInput.value, mainSearchInput);
        }
    }
    // 搜索框得到焦点状态下敲下回车也可以搜索
    window.addEventListener('keyup', function (e) {
        if (e.keyCode === 13 && mainSearchInput.isFocus) {

            mainSearchBtn.click();
        }
    })



    // 搜索结果
    let searchBd = document.querySelector('.search_bd_song_content');

    // 显示加载动画
    let load = ` <aside class="search_loading">
                <img src="https://y.gtimg.cn/mediastyle/yqq/img/loading.gif?max_age=2592000&v=4d882ab54383b136b0cae1f7c93ab74a"
                    alt="">
            </aside>`;
    searchBd.innerHTML = load;

    // 加载第一页数据
    ajax({
        type: 'get',
        url: 'http://localhost:3000/search',
        header: {
            'xhrFields': '{ withCredentials: true }'
        },
        data: {
            keywords: searchKey,
            limit: 30,
            offset: 0
        },
        success: function (data) {
            searchSuccess(data, true);
        }
    })

    // 若请求发送成功，渲染数据
    function searchSuccess(data, bool = false) {

        // 如果是第一次渲染搜索结果
        if (bool) {
            // 动态创建分页按钮，并绑定事件
            // 创建分页按钮并绑定事件
            createPage(document.querySelector('.search_bd_page'), data.result.songCount, function () {
                if (this.className !== 'page_current') {
                    // 更换样式
                    changePage(this.index, document.querySelectorAll('.search_bd_page li'))

                    // 展示加载动画
                    searchBd.innerHTML = load;

                    // 加载新的搜索结果
                    ajax({
                        type: 'get',
                        url: 'http://localhost:3000/search',
                        header: {
                            'xhrFields': '{ withCredentials: true }'
                        },
                        data: {
                            keywords: searchKey,
                            limit: 30,
                            offset: this.index * 30
                        },
                        success: function (data) {
                            searchSuccess(data);
                        }
                    })

                    // 优化页面滚动效果
                    document.querySelector('.search_bd_song_content').style.minHeight = '1500px';
                    scroll(document.querySelector('.search_bd_song_title').offsetTop - document.querySelector('.search_input_cover').offsetHeight, function () {
                        document.querySelector('.search_bd_song_content').style.minHeight = '';
                    });
                }

            }, function () {
                changePage(0, document.querySelectorAll('.search_bd_page li'));
            })
        }


        data = data.result.songs;

        searchBd.innerHTML = data.map(value => {
            let reg = new RegExp(searchKey, 'gi');
            return `<div class="search_bd_song_content_row">
            <a href="javascript:;" class="search_bd_song_content_song">
                <p class="search_bd_song_text" src-songid="${value.id}">

                ${reg.test(value.name) ? value.name.split(reg).join(`<span class="search_key">${searchKey}</span>`) : value.name}
                
                </p>
                <ul class="mod_list_menu">
                    <li href="javascript:;" title="播放"></li>
                    <li href="javascript:;" title="添加到歌单"></li>
                    <li href="javascript:;" title="添加到播放队列"></li>
                    <li href="javascript:;" title="分享"></li>
                </ul>
            </a>
            <div class="search_bd_song_content_singer">

            ${value.artists.map(value => {

                return `<a href="javascript:;" src-singerid="${value.id}">${reg.test(value.name) ? `${value.name.split(reg).join(`<span class="search_key">${searchKey}</span>`)}` : value.name}</a>`
            }).join('&nbsp;/&nbsp;')}

            </div>
            <a href="javascript:;" class="search_bd_song_content_album" src-albumid="${value.album.id}">

            ${reg.test(value.album.name) ? value.album.name.split(reg).join(`<span class="search_key">${searchKey}</span>`) : value.album.name}

            </a>
            <span class="search_bd_song_content_time">${getTime(value.duration)}</span>
        </div>`
        }).join('');

        if (!window.localStorage.playlist) {
            window.localStorage.playlist = JSON.stringify([]);
        }
        if (!window.localStorage.playNow) {
            window.localStorage.playNow = JSON.stringify('');
        }

        // 播放按钮
        let playBtns = document.querySelectorAll('.mod_list_menu li:nth-child(1)');
        for (let i = 0; i < playBtns.length; i++) {
            playBtns[i].addEventListener('click', function () {

                let playlists = JSON.parse(window.localStorage.playlists);
                let playlist = playlists.playlist;
                let id = this.parentNode.previousElementSibling.getAttribute('src-songid');
                let bool = false;// 表本地存储中不含该歌曲

                playlist.forEach((value, index) => {
                    if (value == id) {
                        bool = true;
                        index = playlist.length;
                    }
                })
                if (!bool) {
                    playlist.unshift(id);
                    playlists.playNow = id;
                    window.localStorage.playlists = JSON.stringify(playlists);
                    window.localStorage.setItem('newNum', 1);// 新添加的歌曲的数量
                }

                // window.localStorage.playNow = JSON.stringify(id);
            })
        }

        // 添加到播放队列按钮
        let addBtns = document.querySelectorAll('.mod_list_menu li:nth-child(3)');
        for (let i = 0; i < addBtns.length; i++) {
            addBtns[i].addEventListener('click', function () {

                let playlists = JSON.parse(window.localStorage.playlists);
                let playlist = playlists.playlist;
                let id = this.parentNode.previousElementSibling.getAttribute('src-songid');
                let bool = false;// 表本地存储中不含该歌曲

                playlist.forEach((value, index) => {
                    if (value == id) {
                        bool = true;
                        index = playlist.length;
                    }
                })
                if (!bool) {
                    playlist.unshift(id);
                    playlists.playNow = null;
                    window.localStorage.playlists = JSON.stringify(playlists);
                    window.localStorage.setItem('newNum', 1);// 新添加的歌曲的数量
                }
            })
        }
    }

}

