/**
 * 手机端二级下拉 
 */
var app = {
    // 简单的点击实现元素展开和收缩的功能
    clickToggle: function (elea, eleb) {
        $(elea).click(function () {
            if (!$(eleb).is(':visible')) {
                $(this).addClass('clicked');
                $(eleb).slideDown();
            } else {
                $(this).removeClass('clicked');
                $(eleb).slideUp();
            }
        })
    },
    //  禁止图片另存为
    forbid_save: function () {
        $(document).bind("contextmenu copy selectstart", function () {
            return false;
        });
        // 禁用Ctrl+C和Ctrl+V（所有浏览器均支持）
        $(document).keydown(function (e) {
            if (e.ctrlKey && (e.keyCode == 65 || e.keyCode == 67)) {
                return false;
            }
        });

        document.onkeydown = function () {

            if (window.event && window.event.keyCode == 123) {
                event.keyCode = 0;
                event.returnValue = false;
            }
            if (window.event && window.event.keyCode == 13) {
                window.event.keyCode = 505;
            }
            if (window.event && window.event.keyCode == 8) {
                window.event.returnValue = false;
            }

        }
        var img = $("img"); img.on("contextmenu", function () { return false; }); img.on("dragstart", function () { return false; });
    }
}
$(function () {
    $(".m-bm-nav > li .sec a").click(function () {
        $(".m-bm-navbtn").removeClass("clicked")
        $(".m-bm-menu").hide()
    })
    $(".sjj_nav .bot > li .list .left").click(function () {
        $(".sjj_nav").removeClass("nav_show")
    })
    // 汉堡包展开和收缩
    app.clickToggle('.m-bm-navbtn', '.m-bm-menu');
    //手机端导航
    $(".aniut").click(function () {
        var mSubmenuBox = $(this).siblings('.sec');
        var mSubmenuSiblingsBox = $(this).parents('li').siblings('li').find('.sec');
        var mSubmenuSiblingsJt = $(this).parents('li').siblings('li').find('.aniut');
        if (!mSubmenuBox.is(":visible")) {
            $(this).addClass('clicked');
            mSubmenuBox.slideDown();
            mSubmenuSiblingsJt.removeClass('clicked');
            mSubmenuSiblingsBox.slideUp();
            $(this).find(".iconfont").removeClass('icon-jiahao');
            $(this).find(".iconfont").addClass('icon-jianhao');
            mSubmenuSiblingsJt.find(".iconfont").removeClass('icon-jianhao');
            mSubmenuSiblingsJt.find(".iconfont").addClass('icon-jiahao');
        } else {
            $(this).removeClass('clicked');
            mSubmenuBox.slideUp();
            $(this).find(".iconfont").removeClass('icon-jianhao');
            $(this).find(".iconfont").addClass('icon-jiahao');
            // mSubmenuBox.find(".iconfont").addClass('icon-jiahao');
        }
    });
})
$(function () {
    var windoww = $(window).width();
    $('.sp_nav').click(function () {
        $('.sjj_nav').addClass('nav_show');
    });

    $('.sjj_nav ul li').click(function () {
        $(this).children('ul').slideToggle().parent().siblings().children('ul').slideUp();
        $(this).toggleClass('sjj_nav_i_se');
        $(this).siblings().find('i').removeClass('sjj_nav_i_se');
    });

    $('.sp_nav_xjb').html('<svg t="1496193951932" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="995" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"> <path d="M768.468 428.876l-84.723-84.723-170.711 170.711-170.711-170.711-84.723 84.723 170.711 170.711-0.092 0.091 84.723 84.724 0.092-0.092 0.092 0.092 84.723-84.724-0.092-0.091z" p-id="996"></path></svg>');

    $(".sjj_nav .top .close_nav").click(function () {
        $('.sjj_nav').removeClass('nav_show');
    })
});
/**
 * 点击回到顶部
 * 滑动大于800显示 小于800隐藏
 * class类名为：fixright_li_last
 */
var $window = $(window);
$window.scroll(function () {
    var scrollTop = $(document).scrollTop();
    if (scrollTop > 800) {
        $(".fixright_li_last").show(1000);

    } else {
        $(".fixright_li_last").hide(1000)
    }

    if (scrollTop > 400) {
        $("header").addClass("active");

    } else {
        $("header").removeClass("active")
    }
});
$(".fixright_li_last").click(function () {
    $("html,body").animate({
        scrollTop: 0
    }, 'slow')
});


/**
 * banner 上的下滑滚动一屏
 * 给需要滑动的元素添加类名 class="scrool"
 */
$('.scrool').click(function () {
    var heights = $(window).height();
    $('body,html').animate({
        scrollTop: heights - $("header").height()
    }, 1000);
    return false;
});


/**
 * 点击展开 
 * @author Amy
 * @param {String} par  点击目标的父元素
 * @param {String} par1 点击目标,不用传参，调用点击事件的默认值
 * @param {String} son1 需要展开的元素
 * @example subMenu(".footer_left", that, ".content")
 */
function subMenu(par, par1, son1) {
    $thisp = $(par1).parents(par);
    var chk = false;
    $(par).removeClass("active");
    var dropDown = $(par1).parents(par).find(son1);
    console.log(dropDown)
    $(son1).not(dropDown).slideUp("fast");
    dropDown.stop(false, true).slideToggle("fast", function () {
        if ($(par1).is(":hidden")) {
            $thisp.removeClass("active");
            chk = false;
        } else {
            $thisp.addClass("active");
            chk = true;
        }
    });
}

/**
 *  * 点击切换
 * @author Amy
 * @param {String} event  事件名 可选click mouseenter 等
 * @param {String} class1  hover的元素类名
 * @param {String} class2  需要切换的元素类名
 * @example changeElement("click",".index_seven .right ul li", ".index_seven .left .sum>.pr")
 */
function changeElement(event, class1, class2) {
    $(class1).bind(event, function () {
        $(this).addClass("active").siblings().removeClass("active")
        var index = $(this).index()
        $(class2).eq(index).addClass("active").siblings().removeClass("active")
    })
    $(class1).eq(0).addClass("active")
    $(class2).eq(0).addClass("active")
}


/**
 * 点击切换类名 主要用在搜索
 * @author Amy
 * @param {String} name  需要展开元素的类名
 * @param {String} sonclass 展开元素的子元素 需要切换类名的那个元素
 * @param {String} class1 默认显示的元素类名即需要移除的类名
 * @param {String} class2 需要更换的类名
 * @example {
       var flag = true;
       $(".ds").click(function (e) { 
           e.stopPropagation();
           changeClass(".searchbox", '.iconfont', 'icon-search', 'icon-guanbi')
       });
   }
 */
var flag = true;

function changeClass(name, sonclass, class1, class2) {
    if (flag) {
        $(name).slideDown();
        $(this).find(sonclass).removeClass(class1);
        $(this).find(sonclass).addClass(class2);
        flag = false;
    } else {
        $(name).slideUp();
        $(this).find(sonclass).removeClass(class2);
        $(this).find(sonclass).addClass(class1);
        flag = true;
    }
}



/**
 * animated 动画 的调用
 */
var wow = new WOW({
    boxClass: 'wow',
    animateClass: 'animated',
    offset: 0,
    mobile: true,
    live: true
});
var wow1 = new WOW({
    boxClass: 'wow1',
    animateClass: 'active',
    offset: 0,
    mobile: true,
    live: true
});
// 数字
wow.init();
wow1.init();
new WOW().init();
$(function () {
    $('.counter').countUp();
});


// 搜索验证 
$(".search_btn").click(function () {
    var ttas = $(this).siblings(".search_inp").val()
    if (ttas == '') {
        layer.msg('请输入搜索关键词！', function () {
            time: 2000
        });
        return false;
    }
});
$(".ny-news-content .serbtn1a").click(function () {
    var ttas1 = $(this).siblings(".sertexta").val()
    if (ttas1 == '') {
        layer.msg('请输入搜索关键词！', function () {
            time: 2000
        });
        return false;
    }
});
// 搜索
$(".ds1").click(function () {
    $(".search").slideDown();
});
$(".search-con").click(function () {
    $(".search").slideUp();
});

//  弹出
$('.aside_right .ul li .div3 a').on('click', function () {
    cont = $(this).parents(".list_download").siblings(".zil_down").html();
    index2 = layer.open({
        type: 1,
        title: false,
        closeBtn: 0,
        skin: 'subcontent',
        shadeClose: true, //点击遮罩关闭
        closeBtn: 2,
        content: cont
    });
})
// 关闭弹出
//  $("").click(function() {
//      index2.close()
//  })



// 禁止复制
//  // 禁用右键菜单、复制、选择
//  $(document).bind("contextmenu copy selectstart", function () {
//      return false;
//  });
//  // 禁用Ctrl+C和Ctrl+V（所有浏览器均支持）
//  $(document).keydown(function (e) {
//      if (e.ctrlKey && (e.keyCode == 65 || e.keyCode == 67)) {
//          return false;
//      }
//  });

//  document.onkeydown = function () {

//      if (window.event && window.event.keyCode == 123) {
//          event.keyCode = 0;
//          event.returnValue = false;
//      }
//      if (window.event && window.event.keyCode == 13) {
//          window.event.keyCode = 505;
//      }
//      if (window.event && window.event.keyCode == 8) {
//          window.event.returnValue = false;
//      }

//  }
//  var img = $("img");
//  img.on("contextmenu", function () {
//      return false;
//  });
//  img.on("dragstart", function () {
//      return false;
//  });


// banner视频和图片组合轮播
//  let video = document.getElementById("video");
//  var swiperBanner = new Swiper('.banner .swiper-container', {
//      loop: true,
//      autoplay: {
//          delay: 1000,
//          stopOnLastSlide: false,
//          disableOnInteraction: true,
//      },
//      pagination: {
//          el: ".banner .swiper-pagination",
//          clickable: true,
//      },
//      on: {
//          init: function () {
//              swiperAnimateCache(this); //隐藏动画元素
//              swiperAnimate(this); //初始化完成开始动画
//          },
//          slideChangeTransitionEnd: function () {
//              swiperAnimate(this); //每个slide切换结束时也运行当前slide动画
//              //this.slides.eq(this.activeIndex).find('.ani').removeClass('ani'); 动画只展现一次，去除ani类名
//          },
//          slideChangeTransitionStart: function () {
//              if (this.realIndex == 0) {
//                  console.log(video)
//                  // document.getElementById("video").play();
//                  $("#video").get(0).play()
//                  this.autoplay.stop();
//              } else {

//              }
//          }
//      }
//  })
//  video.addEventListener('ended', function (e) {
//      console.log('视频播放完了')
//      swiperBanner.autoplay.start();
//  })
//  swiperBanner.autoplay.stop(); // 初始化关闭自动轮播
//  video.play();