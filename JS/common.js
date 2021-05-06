window.addEventListener('load', function () {


    // 导航栏热搜
    ajax({
        url: 'http://localhost:3000/search/hot/detail',
        success(data) {
            let searchHot = document.querySelectorAll('.search_hot a');

            for (let i = 0; i < searchHot.length; i++) {

                searchHot[i].children[1].innerHTML = data.data[i].searchWord;
                searchHot[i].children[2].innerHTML = (data.data[i].score / 10000).toFixed(1) + '万';

                searchHot[i].addEventListener('click', function () {

                    clickSearchResult(this.children[1].innerHTML, searchInput);
                })
            }
        }
    })

    // 导航栏搜索
    let searchResult = document.querySelector('.header_search_result');
    let searchInput = document.querySelector('.header_search input');
    let searchItems = searchResult.querySelectorAll('.search_result_item_wrapper');
    //
    // 如果当前在搜索结果页面
    if (window.location.href.includes('search.html')) {
        let searchKey = window.location.search.substr(10);
        searchInput.value = decodeURIComponent(searchKey).replace(/^\s*|\s*$/g, '');
    }

    searchInput.addEventListener('blur', function () {
        // 记录搜索框是否得到焦点，用于判断按下回车键是否发起搜索
        searchInput.isFocus = false;

        // searchResult.style.maxHeight = '0';
    })
    searchInput.addEventListener('focus', function () {
        // 记录搜索框是否得到焦点，用于判断按下回车键是否发起搜索
        searchInput.isFocus = true;

    })
    searchInput.addEventListener('input', debounce(function () {
        let value = this.value;
        if (value === '') {
            searchResult.style.maxHeight = '0';
            return;
        }

        ajax({
            url: 'http://localhost:3000/search/suggest',
            data: {
                keywords: value
            },
            success: function (data) {
                let song = searchItems[0];
                let singer = searchItems[1];
                let album = searchItems[2];
                let list = searchItems[3];
                let flag = false;

                // 单曲
                if (data.result.songs) {
                    song.innerHTML = `${data.result.songs.map(value => {
                        let reg = new RegExp(searchInput.value, 'gi');
                        return `<a href="#" class="search_result_item">
                             <h5 class="search_result_info_name">
                     
                     ${reg.test(value.name) ? value.name.split(reg).join(`<span class="search_key">${searchInput.value}</span>`) : value.name}
                     
                           
                             </h5>
                             <div class="search_result_info_singer">&nbsp;-&nbsp;
                     
                     ${reg.test(value.artists[0].name) ? value.artists[0].name.split(reg).join(`<span class="search_key">${searchInput.value}</span>`) : value.artists[0].name}
                     
                           
                             </div>
                         </a>`
                    }).join('')}`;
                    display(song.parentNode, 'flex');
                    flag = true;
                } else {
                    display(song.parentNode, false);
                }


                // 歌手
                if (data.result.artists) {
                    singer.innerHTML = `${data.result.artists.map(value => {

                        let reg = new RegExp(searchInput.value, 'gi');
                        return `<a href="#" class="search_result_item">
                                 <div class="search_result_info_name">
    
                         ${reg.test(value.name) ? value.name.split(reg).join(`<span class="search_key">${searchInput.value}</span>`) : value.name}
                         ${value.alias.length !== 0 && reg.test(value.alias[0]) ? `( ${value.alias[0].replaceAll(reg, `<span class="search_key">${value.alias[0][value.alias[0].search(reg)]}</span>`)} )` : ''}
    
                         </div>
                             </a>`
                    }).join('')}`;
                    display(singer.parentNode, 'flex');
                    flag = true;
                } else {
                    display(singer.parentNode, false);
                }


                // 专辑
                if (data.result.albums) {
                    album.innerHTML = `${data.result.albums.map((value, index) => {
                        if (index < 4) {
                            let reg = new RegExp(searchInput.value, 'gi');
                            return `<a href="#" class="search_result_item">
                                      <div class="search_result_info_name">

                              ${reg.test(value.name) ? value.name.split(reg).join(`<span class="search_key">${searchInput.value}</span>`) : value.name}
     
                                     </div>
                                    <div class="search_result_info_singer">&nbsp;-&nbsp;

                                    ${reg.test(value.artist.name) ? value.artist.name.split(reg).join(`<span class="search_key">${searchInput.value}</span>`) : value.artist.name}
            
                                    </div>
                             </a>`
                        }
                    }).join('')}`;
                    display(album.parentNode);
                    flag = true;
                } else {
                    display(album.parentNode, false);
                }


                // 歌单
                if (data.result.playlists) {
                    list.innerHTML = `${data.result.playlists.map((value, index) => {
                        if (index < 4) {
                            let reg = new RegExp(searchInput.value, 'gi');
                            return `<a href="javascript:;" class="search_result_item" src-id=${value.id}>
                                          <div class="search_result_info_name">
    
                                  ${reg.test(value.name) ? value.name.split(reg).join(`<span class="search_key">${searchInput.value}</span>`) : value.name}
         
                                        </div>
                                 </a>`
                        }
                    }).join('')}`;
                    display(list.parentNode, 'flex');
                    flag = true;
                } else {
                    display(list.parentNode, false);
                }

                if (flag) {
                    searchResult.style.maxHeight = '1000px';
                } else {
                    searchResult.style.maxHeight = '0';
                }

                // 跳转页面
                // 点击歌单的搜索结果进入歌单详情页面
                let plItems = list.children;
                for (let i = 0; i < plItems.length; i++) {
                    plItems[i].addEventListener('click', function () {
                        let id = this.getAttribute('src-id');
                        clickSearchResult(this.children[0].textContent,
                            searchInput, `playlist.html?pid=${id}`);
                    })
                }

                let items = document.querySelectorAll('.search_result_item');
                for (let i = 0; i < items.length; i++) {
                    // 如果不是歌单结果
                    if (!items[i].parentNode.parentNode.className.includes('list')) {
                        items[i].addEventListener('click', function () {
                            clickSearchResult(this.children[0].textContent,
                                searchInput);
                        })
                    }

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
    if (!window.localStorage) {
        localstor.setItem('history', JSON.stringify([]));
    }

    // 展示搜索历史
    let his = document.querySelector('.search_history_item_wrapper');

    searchInput.addEventListener('focus', function () {
        let hisData = JSON.parse(window.localStorage.history);

        // 最多展示5条
        his.innerHTML = hisData.map((value, index) => {
            if (value !== '' && index < 5) {
                return `<a class="search_history_item">${value}
             <em class="search_history_item_close"></em>
             </a>`
            }
        }).join('');

        // 点击搜索历史跳转
        let items = his.children;
        for (let i = 0; i < items.length; i++) {
            items[i].addEventListener('click', function (e) {
                // 取消事件委派
                if (e.target.className !== 'search_history_item_close') {

                    clickSearchResult(this.textContent, searchInput);

                }
            })
        }


        // 点击关闭按钮删除搜索历史
        let hisClose = his.querySelectorAll('.search_history_item_close');
        for (let i = 0; i < hisClose.length; i++) {

            hisClose[i].onclick = function () {
                closeHis(this, searchInput, hisData);
            }
        }
    })
    // 点击垃圾箱按钮删除所有搜索历史
    let hisDel = document.querySelector('.search_history_delete');
    hisDel.onclick = function () {
        window.localStorage.history = '[]';

        searchInput.focus();
    }

    // 点击搜索按钮进入搜索页，更新搜索历史
    let searchBtn = document.querySelector('.header_search button');
    searchBtn.onclick = function () {
        // 请求默认搜索关键词
        if (searchInput.value.replace(/^\s*|\s*$/g, '') === '') {
            ajax({
                url: "http://localhost:3000/search/default",
                success: function (data) {
                    searchInput.value = data.data.realkeyword;
                    clickSearchResult(searchInput.value, searchInput);
                }
            })
        } else {
            clickSearchResult(searchInput.value, searchInput);
        }

    }
    // 搜索框得到焦点状态下敲下回车也可以搜索
    window.addEventListener('keyup', function (e) {
        if (e.keyCode === 13 && searchInput.isFocus) {
            searchBtn.click();
        }
    })

    // 返回顶部
    let topButton = document.querySelector('.sidebar_top');
    topButton.addEventListener('click', function () {
        scroll();
    })
    displayBackTop(topButton, document.querySelector('.header').offsetHeight);


    // 点击音乐馆跳转到首页
    document.querySelector('.header_nav li:nth-child(1)').onclick = function () {

        window.location.href = `index.html`;
    }



})