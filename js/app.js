function App(options) {
    this.el = options.el;
    this.data = options.data;
    this.init();
    this.render();
}

App.prototype = {
    init: function () {
        var repos = {};
        $.each(this.data.items, function (i, item) {
            var arr = item.repository_url.split('/').reverse(),
                title = arr[1] + '/' + arr[0];

            if (!repos[title]) {
                repos[title] = {
                    title: title,
                    owner: arr[1],
                    name: arr[0],
                    url: 'https://github.com/' + title
                };
                // TODO: add stars and forks
                // $.ajax({
                //     url: 'https://api.github.com/repos/' + title,
                //     type: 'GET',
                //     dataType: 'jsonp',
                //     data: 'json',
                //     cache: true,
                //     success: function (res) {
                //         repos[title].stars = res.data.stargazers_count;
                //         repos[title].forks = res.data.forks_count;
                //     }
                // });
            }
            if (!repos[title].pull_requests) {
                repos[title].pull_requests = [];
            }
            repos[title].pull_requests.push({
                title: item.title,
                href: item.html_url
            });
        });

        var items = [];
        for (var title in repos) {
            items.push(repos[title]);
        }
        items.sort(function (a, b) {
            return b.pull_requests.length - a.pull_requests.length;
        });
        if (this.data.items.length) {
            this.data.login = this.data.items[0].user.login;
            this.data.avatar_url = this.data.items[0].user.avatar_url;
        }
        this.data.items = items;
    },
    render: function () {
        this.vm = new Vue({
            el: this.el,
            data: this.data,
            methods: {
                onEnter: function (event) {
                    location.href = location.origin + location.pathname + '?login=' +
                        $(event.target).val();
                }
            }
        });
        Vue.nextTick(function() {
            $('#username').focus().select();
        });
    }
};

$(function () {
    var items = [];
    var getData = function (page) {
        var name = url('?login') || 'wenzhixin';
        $.ajax({
            url: 'https://api.github.com/search/issues?q=type:pr+state:closed+author:'  +
                name + '&per_page=100&page=' + page,
            type: 'GET',
            dataType: 'jsonp',
            data: 'json',
            cache: true,
            success: function (res) {
                items = items.concat(res.data.items);
                if (items.length < res.data.total_count) {
                    getData(page + 1);
                } else {
                    new App({
                        el: '#app',
                        data: {
                            login: name,
                            total: res.data.total_count,
                            items: items
                        }
                    });
                    $('.loading').hide();
                    $('#app').show();
                }
            },
            error: function (err) {
                alert(err);
            }
        });
    };
    getData(1);
});
