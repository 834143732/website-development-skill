/**
 * Determine if the site is stopped
 * @returns {undefined}
 */
function closeWeb() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/Cn/Common/closeWeb.html", true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (xmlhttp.responseText == 2) {
                // /Public/ErrorTpl/404.html
                location.href = '/404.html';
            }
        }
    }
}
/**
 * Determine the IP  language jump
 * @returns {undefined}
 */
// 使用这个方法的时候请注意，把他拿到首页去，不要留在这里，因为判断现在只判断首页，放在这里就是判断全站了，这不对
function judgeWeb() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/Cn/Verifyip/judgeWeb.html", true);
    xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xmlhttp.send("referrer="+document.referrer);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var judObj = JSON.parse(xmlhttp.responseText);
            if(judObj.code == 1){
                window.location.href=judObj.url;
            }
        }
    }
}

function dataStatistics(url){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function () {
    }
}





(function () {
    closeWeb();
    // judgeWeb();
})();

//// 锚点定位
//function yxtop(tp) {
//    setTimeout(function () {
//        $("html,body").animate({scrollTop: $('[yxdatop-pag="' + tp + '"]').offset().top - 72}, 700);
//    }, 800);
//}

//写cookies，一个小时过期 
function setCookie(name, value) {
    var exp = new Date();
    exp.setTime(exp.getTime() + 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
}
//读取cookies 
function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}
//删除cookies 
function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 60 * 60 * 1000);
    var cval = getCookie(name);
    if (cval != null)
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=/";
}

// 搜索的方法
queryData = {
    query: function (url, wd) {
        var base = new this.Base64();
        if (wd) {
            location.href = url + "/wd/" + base.encode(wd);
        } else {
            location.href = url;
        }
    },
    Base64: function Base64() {

        // public method for encoding
        this.encode = function (input) {
            /**
             * / 替换成 %^%
             * \ 替换成 %$%
             * @type @exp;input@call;replace|@exp;input@call;replace
             */
//            var oInput = input.replace('/', '%^%');
//            oInput = oInput.replace('\\', '%$%');
            var oInput = getSpecifiedStr(input, '/', '%^%');
            oInput = getSpecifiedStr(oInput, '\\', '%$%');
            return encodeURIComponent(oInput);
        }
    }
}
// 检索的字符串替换特殊字符的方法
function getSpecifiedStr(str, find, spec) {
    var newStr = str.replace(find, spec);
    var len = newStr.indexOf(find);
    if (len != -1) {
        newStr = getSpecifiedStr(newStr, find, spec);
    }
    return newStr;
}

