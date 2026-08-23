///Copyright (C) JiangSu Boooming Co., Ltd.
///DengYunCollege JS Function Libery
///Design By Jason
///Version : 1.3.0
///Date:2019-01-09
///<Update>

///<summary>
///Namespace:ksbm
///<summary>
var ksbm = window.ksbm || {};

///<summary>
///Set Fixed Ajax URL
///Create By Jason
///<summary>
ksbm.Defaults = { Aspx: "/publicAspx/" };
ksbm.FixedAjax = function (u) {
    this.url = ksbm.Defaults.Aspx + u + ".ashx";
    this.data = {};
    this.dataType = "json";
    this.async = true;
    this.type = "GET";
    this.success = function () { };
    this.error = function () { };
    this.run = function () {
        $.ajax({
            url: this.url,
            data: this.data,
            async: this.async,
            type: this.type,
            dataType: this.dataType,
            success: this.success,
            error: this.error
        });
    }
};

///<summary>
///Set Ajax URL
///Create By Jason
///<summary>
ksbm.Ajax = function (u) {
    this.url = u;
    this.data = {};
    this.dataType = "json";
    this.type = "GET";
    this.async = true;
    this.success = function () { };
    this.error = function () { };
    this.run = function () {
        $.ajax({
            url: this.url,
            data: this.data,
            type: this.type,
            async: this.async,
            dataType: this.dataType,
            success: this.success,
            error: this.error
        });
    }
};

///<summary>
///Cookie Operation
///Create By Jason
///<summary>
ksbm.Cookie = {
    write: function (name, value) {
        var expiresDate = new Date();
        var keepTime = 24 * 3600 * 1000;
        expiresDate.setTime(expiresDate.getTime() + keepTime);
        var cookieStr = name + "=" + escape(value) + ";expires=" + expiresDate.toGMTString();
        document.cookie = cookieStr;
    },
    read: function (name) {
        var cookieStr = document.cookie;
        var cookieArr = cookieStr.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
        if (cookieArr != null) {
            return unescape(cookieArr[2]);
        }
        return null;
    },
    dele: function (name) {
        var exp = new Date();
        exp.setTime(exp.getTime() - 365 * 3600 * 1000);
        var cval = ksbm.Cookie.read(name);
        if (cval != null) {
            document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
        }
    }
};



///<summary>
///Layer
///Create By Jason
///<summary>
ksbm.layer = {
    tips: function (obj, msg) {
        layer.tips(msg, obj);
        obj.focus();
    },
    msg: function (obj, msg) {
        layer.msg(msg);
        obj.focus();
    },
    alertIcon: function (msg, icon) {
        layer.alert(msg, { icon: icon, shade: false });
    },
    alert: function (msg) {
        layer.alert(msg, { shade: false, icon: 2 });
    },
    alertHref: function (msg, url) {
        layer.alert(msg, { shade: false, icon: 1 }, function () {
            window.location.href = url;
        });
    },
    confirm: function (msg, callback) {
        layer.confirm(msg, { icon: 3, title: '提示', shade: false }, callback);
    },
    confirmYn: function (msg, callbackYes, callbackNo) {
        layer.confirm(msg, { icon: 3, title: '提示', shade: false }, callbackYes, callbackNo);
    },
    open: function (titles, srcs, width, height) {
        parent.$.layer({
            type: 2,
            shadeClose: true,
            shade: [0.5, '#000'],
            fix: false,
            title: titles,
            maxmin: false,
            iframe: { src: srcs },
            area: [width, height]
        });
    }
}

ksbm.common = {
    defaults: {
        exp: ["www", "com", "cn", "net", "la", "org", "blog"]
    },
    init: function () {
        $(".parallax_left").parallax({
            speed:20,
            ascending: false,
            delay: 0
        });

        $(".parallax_left_2").parallax({
            speed: 30,
            ascending: false,
            delay: 0
        });


        $(".parallax_right").parallax({
            speed: 20,
            ascending: false,
            delay: 0
        });

        $(".parallax_right_2").parallax({
            speed: 30,
            ascending: false,
            delay: 0
        });
        $(".parallax_right_3").parallax({
            speed: 30,
            ascending: false,
            delay: 0
        });
        $(".parallax_left_3").parallax({
            speed: 60,
            ascending: false,
            delay: 0
        });
    },
    tools: {
        isPhoneNo: function (phone) {
            var pattern = /^1[345789]\d{9}$/;
            return pattern.test(phone);
        },
        isEmailNo: function (emial) {
            var pattern = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,20}$/;
            return pattern.test(emial);
        },
        urlParamer: function (p, url) {
            var strHref = decodeURI(url);
            var strRight = strHref.replace("?", "");
            var arrTmp = strRight.split("&");
            for (var i = 0; i < arrTmp.length; i++) {
                var arrTemp = arrTmp[i].split("=");
                if (arrTemp[0].toUpperCase() == p.toUpperCase()) {
                    return arrTemp[1];
                }
            }
            return "";
        },
        userRegular: function (exp, value) {
            return exp.test(value);
        },
        filter: function (value) {
            var flags = true;
            ksbm.common.defaults.exp.forEach(function (v) {
                if (value.lastIndexOf(v) > -1) {
                    flags = false;
                    return false;
                }
            });
            return flags;
        },
        validate: function (obj) {
            var flag = true;
            var isVer = obj.attr("data-isver");
            if (isVer == "true") {
                var verClass = obj.attr("data-vercss");
                $("." + verClass + " input ," + "." + verClass + " select ," + "." + verClass + " textarea").each(function () {
                    var required = $(this).attr("data-required");
                    var empty = $(this).attr("data-empty-tip");
                    var modular = $(this).attr("data-modular");
                    var illegal = $(this).attr("data-illegal-tip");
                    var regular = $(this).attr("data-regular");
                    var filter = $(this).attr("data-filter");
                    var values = $.trim($(this).val());
                   
                    if (values == "" && required != "false") {
                        if (empty == "" || empty == undefined)
                            empty = "数据输入不能为空！";
                        ksbm.layer.msg($(this), empty);
                        flag = false;
                        return flag;
                    } else if (modular == "email" && required != "false") {
                        if (!ksbm.common.tools.isEmailNo(values)) {
                            if (illegal == "")
                                illegal = "请输入正确的邮箱地址！";
                            ksbm.layer.msg($(this), illegal);
                            flag = false;
                            return flag;
                        }
                    } else if (modular == "phone" && required != "false") {
                        if (!ksbm.common.tools.isPhoneNo(values)) {
                            if (illegal == "")
                                illegal = "请输入正确的手机号码！";
                            ksbm.layer.msg($(this), illegal);
                            flag = false;
                            return flag;
                        }
                    } else if (modular == "checkbox" && required != "false") {
                        if (!$('input[type="checkbox"]').is(':checked')) {
                            if (illegal == "")
                                illegal = "请勾选隐私政策";
                            ksbm.layer.msg($(this), illegal);
                            flag = false;
                            return flag;
                        }
                    } else if (filter == "true") {
                        if (!ksbm.common.tools.filter(values)) {
                            ksbm.layer.msg($(this), "您提交的内容可能包含非法字符：" + ksbm.common.defaults.exp);
                            flag = false;
                            return flag;
                        }
                    } else if (regular != "" && regular != undefined) {
                        try {
                            if (!(eval(regular).test(values))) {
                                ksbm.layer.msg($(this), illegal);
                                flag = false;
                                return flag;
                            }
                        } catch (e) {
                            ksbm.layer.msg($(this), "正则表达式可能不正确！");
                        }
                    } 
                });

                var isConfirm = obj.attr("data-confirm");
                if (flag) {
                    if (isConfirm == "true") {
                        ksbm.layer.confirm("确认提交信息吗？提交之后无法修改！", function () {
                            // document.form1.submit();
                            obj.submit();
                        });
                    } else {
                        // document.form1.submit();
                        obj.submit();
                    }
                } else {
                    return false;
                }
            }
        }
    }
}

$(function () {
    ksbm.common.init();
})



$.fn.parallax = function (options) {
    var parallax_element = this;
    var settings = {
        speed: '100',
        ascending: true,
        delay: '1000'
    };
    if (options) {
        $.extend(settings, options)
    }
    var ad = "+";
    if (!settings['ascending'] == true) {
        var ad = "-"
    }
    $(window).scroll(function () {
        var wScroll = $(this).scrollTop();
        // console.log(wScroll);
        // console.log(wScroll / settings['speed']+'%');
        parallax_element.css({
            "transform": "translate(0px, " + ad + wScroll / settings['speed'] + "%)",
            "transition-duration": settings['delay'] + "ms"
        })

    })
}