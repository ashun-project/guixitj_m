var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pageModule = require('./page');
var pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'ashun666',
    database: 'guixitj'
});

function getClientIP(req) {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.connection.remoteAddress || // 判断 connection 的远程 IP
        req.socket.remoteAddress || // 判断后端的 socket 的 IP
        req.connection.socket.remoteAddress;
};
var domain = {
    pc: 'http://www.guixitj.com',
    m: 'http://m.guixitj.com',//http://m.guixitj.com,
    static: 'http://static.guixitj.com'
}
// 路由拦截
router.all('*', function (req, res, next) {
    if (req.url.indexOf('.php') > -1) {
        return get404(req, res)
    }
    if (req.method.toLowerCase() == 'options') {
        res.send(200);  //让options尝试请求快速结束
    } else {
        next();
    }
})

// 首页
router.get('/', function (req, res) {
    var sql = 'SELECT * FROM data_list where type = "trade" order by id desc limit 6';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            var listObj = {
                trade: result || [],
                domain: domain,
                pageUrl: '/'
            }
            res.render('index', listObj);
            conn.release();
        })
    })
});

// 关于我们
router.get('/aboutus', function(req, res) {
    var sql = 'SELECT * FROM data_list where type = "life" order by id desc limit 4';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            var listObj = {
                pageUrl: req.url,
                domain: domain,
                life: result || []
            }
            res.render('about_us', listObj);
            conn.release();
        })
    })
})

// 常见问题
router.get('/questions', function(req, res) {
    var sql = 'SELECT * FROM data_list where type = "news" order by id desc limit 8';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            var listObj = {
                pageUrl: req.url,
                domain: domain,
                news: result || []
            }
            res.render('questions', listObj);
            conn.release();
        })
    })
})

// 站内新闻
router.get('/news', function (req, res) {
    getNewsDataList(req, res, '1');
});
router.get('/news/:page', function (req, res) {
    getNewsDataList(req, res, req.params.page);
});
function getNewsDataList(req, res, page) {
    var host = 'http://'+req.headers['host'];
    var limit = Number(page);
    var limitBefore = ((limit - 1) * 12);
    var sql = 'SELECT * FROM data_list where type = "news" order by id desc limit '+ limitBefore + ',' + 12;
    var count = 'SELECT COUNT(1) FROM data_list where type = "news"';
    var listObj = {
        pageTxt: limit > 1 ? '【第' + limit + '页】' : '',
        pageUrl: req.url,
        domain: domain,
        news: []
    };
    if (!limit) {
        get404(req, res);
        return;
    }
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                res.render(type, listObj);
                conn.release();
            } else {
                conn.query(count, function (errC, total) {
                    var resultTotal = Number(total[0]['COUNT(1)']) || 0;
                    listObj.news = result || [];
                    listObj.page = resultTotal ? pageModule(resultTotal, limit, host + '/news') : '';
                    res.render('news', listObj);
                    conn.release();
                })
            }
        })
    })
}

// 成交记录
router.get('/trade', function (req, res) {
    getTradeDataList(req, res, 'trade', '1');
});
router.get('/trade/:page', function (req, res) {
    getTradeDataList(req, res, 'trade', req.params.page);
});
function getTradeDataList(req, res, type, page) {
    var limit = Number(page);
    var limitBefore = ((limit - 1) * 12);
    var sql = 'SELECT * FROM data_list where type = "'+ type +'" order by id desc limit '+ limitBefore + ',' + 12;
    var count = 'SELECT COUNT(1) FROM data_list where type = "'+ type +'"';
    var listObj = {
        domain: domain,
        pageTxt: limit > 1 ? '【第' + limit + '页】' : '',
        pageUrl: req.url,
        trade: []
    };
    listObj[type] = [];
    if (!limit) {
        get404(req, res);
        return;
    }
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                res.render(type, listObj);
                conn.release();
            } else {
                conn.query(count, function (errC, total) {
                    var resultTotal = Number(total[0]['COUNT(1)']) || 0;
                    listObj.trade = result || [];
                    listObj.page = resultTotal ? pageModule(resultTotal, limit, domain.pc + '/' + type) : '';
                    res.render(type, listObj);
                    conn.release();
                })
            }
        })
    })
}

// 农家生活
router.get('/life', function (req, res) {
    getLifeDataList(req, res, '1');
});
router.get('/life/:page', function (req, res) {
    getLifeDataList(req, res, req.params.page);
});
function getLifeDataList(req, res, page) {
    var limit = Number(page);
    var limitBefore = ((limit - 1) * 12);
    var sql = 'SELECT * FROM data_list where type = "life" order by id desc limit ' + limitBefore + ',' + 12;
    var count = 'SELECT COUNT(1) FROM data_list where type = "life"';
    var listObj = {
        domain: domain,
        pageTxt: limit > 1 ? '【第' + limit + '页】' : '',
        pageUrl: req.url,
        life: []
    };
    if (!limit) {
        get404(req, res);
        return;
    }
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                res.render(type, listObj);
                conn.release();
            } else {
                conn.query(count, function (errC, total) {
                    var resultTotal = Number(total[0]['COUNT(1)']) || 0;
                    listObj.life = result || [];
                    listObj.page = resultTotal ? pageModule(resultTotal, limit, domain.pc + '/news') : '';
                    res.render('life', listObj);
                    conn.release();
                })
            }
        })
    })
}

// 文章详情
router.get('/detail/:id', function(req, res) {
    var listObj = {
        pageUrl: req.url,
        domain: domain,
        objData: {title: '没有找到数据', content: '数据出错'},
        typeTxt: {trade: '成交记录', news: '站内新闻', life: '农家生活'}
    }
    var sql = 'SELECT * FROM data_detail where id = "' + req.params.id +'"';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                res.render('detail', listObj);
            } else {
                listObj.objData = result[0] || {};
                res.render('detail', listObj);
            }
            conn.release();
        })
    })
})

// 404页
router.get('*', get404);
function get404(req, res) {
    var listObj = {
        host: 'http://'+req.headers['host']
    }
    res.status(404);
    res.render('404', listObj);
}

module.exports = router;