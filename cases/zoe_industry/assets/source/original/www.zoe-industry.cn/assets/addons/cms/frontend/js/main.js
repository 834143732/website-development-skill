
var app={
  // 简单的点击实现元素展开和收缩的功能
 clickToggle: function(elea,eleb){
     $(elea).click(function(){
         if(!$(eleb).is(':visible')){
             $(this).addClass('clicked');
             $(eleb).slideDown();
         }else{
             $(this).removeClass('clicked');
             $(eleb).slideUp();
         }
     })
 },
  //返回顶部
  backTop: function(ele,time){
     $(ele).click(function () {
         $('html, body').animate({
             scrollTop:'0'
         },time);
     })
 },
  // tab 切换
  tabs: function(tabs, tab_box, _event) {
     $(tab_box).hide();
     $(tab_box).eq(0).show();
     $(tabs).eq(0).addClass('on');
     $(tabs).bind(_event,function(){
         $(this).addClass("on").siblings().removeClass("on");
         var _index = $(this).index();
         $(tab_box).eq(_index).show().siblings().hide();
     })
 },
 // tab 切换类名
 tabsa: function(tabsa, tab_boxa, _eventa) {
     $(tab_boxa).eq(0).addClass('a');
     $(tabsa).eq(0).addClass('on');
     $(tabsa).bind(_eventa,function(){
         $(this).addClass("on").siblings().removeClass("on");
         var _index = $(this).index();
         $(tab_boxa).eq(_index).addClass('a').siblings().removeClass("a");
     })
 },
 
  // 选中高亮
  tabsb: function(tabsb,_eventb) {
    $(tabsb).eq(0).addClass('active');
   $(tabsb).bind(_eventb,function(){
       $(this).addClass("active").siblings().removeClass("active");
   })
},
  // tab 切换2
  tabsc: function(tabsc, tab_boxc, _eventc) {
    $(tab_boxc).hide();

    // 检查默认状态下是否有元素具有"active"类
    var defaultActiveIndex = $(tabsc + '.active').index();
    if (defaultActiveIndex >= 0) {
        $(tab_boxc).eq(defaultActiveIndex).show().siblings().hide();
    } else {
        // 如果没有任何元素具有"active"类，默认显示第一个对应的元素
        $(tab_boxc).eq(0).show().siblings().hide();
    }

    $(tabsc).bind(_eventc, function(){
        $(this).addClass("active").siblings().removeClass("active");
        var _index = $(this).index();
        $(tab_boxc).eq(_index).show().siblings().hide();
    })
},

}

$(function () {
 index.scrool();
 index.click();
 index.swiper();
 app.clickToggle('.m-bm-navbtn','.m-bm-menu');
 app.clickToggle('.sska','.searchbox1');
 app.clickToggle('.sska','.sskbj');
 app.clickToggle('.search-close-btn','.searchbox1');
 app.clickToggle('.search-close-btn','.sskbj');
 app.tabsc('.pro-sort-v1 .pro-sortlist1 li','.pro-sort-v1 .pro-sortlist2 li','mouseover');
 app.tabsc('.pro-sort-v2 .pro-sortlist1 li','.pro-sort-v2 .pro-sortlist2 li','mouseover');
 app.tabs('.flly-list1 li','.a3c1 .a3d1','mouseover');
})

var index = {
 // 回到顶部
  scrool: function () {
    //    鼠标下滑导航添加类
  var $window = $(window);
  $window.scroll(function () {
      var scrollTop = $(document).scrollTop();
      if (scrollTop > 600) {
       $(".aat_list li.tops").show();
       } else {
           $(".aat_list li.tops").hide()
       }
      if (scrollTop > 0) {
       $('.head').addClass("sticky");
     } else {
         $('.head').removeClass("sticky");
     }
  });
  $('.tops>a').click(function () {
   $("html, body").animate({
     scrollTop: 0
   }, {
     duration: 1000,
     easing: "swing"
 });
 
 });
},

 click: function () {
     // 锚点
     $(".smooth").click(function(){
         var href = $(this).attr("href");
         var pos = $(href).offset().top;
         $("html,body").animate({scrollTop: pos}, 1000);	
         return false;
     });

   // 搜索框提示
   $(".serbtn").click(function () {
    var ttas = $(".sertext").val()
    if (ttas == '') {
      layer.msg('请输入搜索关键词！', function () { time: 2000 });
      return false;
    }
    });
    $(".serbtn1a").click(function () {
      var ttasa = $(".sertexta").val()
      if (ttasa == '') {
        layer.msg('请输入搜索关键词！', function () { time: 2000 });
        return false;
      }
    });
    $(".bua").click(function () {
      var ttast = $(".sertextac").val()
      if (ttast == '') {
        layer.msg('请输入查询产品名称！', function () { time: 2000 });
        return false;
      }
      });

     //导航下拉
     // $('.nav_a1 > li').hover(function(){
     //     $(this).find('.sec').stop(true).slideToggle(300);
     //   });
    
  //头部搜索按钮
  $(".ds").click(function () {
    $(".search").slideDown();
  });
  $(".search-con").click(function () {
    $(".search").slideUp();
  });

  $(function () {
    $('.msg-tc').on('click', function(){
      // $(".pead-cont .tit").text($(this).text());
      $(".pead-jsda").show();
    });
    $('a.jataxta').on('click', function(){
    $(".pead-jsda").hide();
    });
  });
     //手机端导航
     $(".aniut").click(function () {
         var mSubmenuBox = $(this).siblings('.sec');
         var mSubmenuSiblingsBox = $(this).parents('li').siblings('li').find('.sec');
         var mSubmenuSiblingsJt = $(this).parents('li').siblings('li').find('.aniut');
         if(!mSubmenuBox.is(":visible")){
             $(this).addClass('clicked');
             mSubmenuBox.slideDown();
             mSubmenuSiblingsJt.removeClass('clicked');
             mSubmenuSiblingsBox.slideUp();
             $(this).find(".iconfont").removeClass('icon-jiahao');
                     $(this).find(".iconfont").addClass('icon-jianhao');
                     mSubmenuSiblingsJt.find(".iconfont").removeClass('icon-jianhao');
                     mSubmenuSiblingsJt.find(".iconfont").addClass('icon-jiahao');
         }else {
             $(this).removeClass('clicked');
             mSubmenuBox.slideUp();
             $(this).find(".iconfont").removeClass('icon-jianhao');
                     $(this).find(".iconfont").addClass('icon-jiahao');
                     // mSubmenuBox.find(".iconfont").addClass('icon-jiahao');
         }
     });
     // 导航有锚点情况下点击关闭
     $(".m-bm-nav li a").click(function(){
      $(".m-bm-navbtn").removeClass('clicked');
      $(".m-bm-menu").hide();
    });
        // 手机端点击不跳转
        $(function () {
          if($(window).width()<990){
            $('.xw_sort1 li a').removeAttr('href');
          }    
        });
    //  锚点跳转
    $(function() {
      var WH = $(".pc-banner").height(); 
        $(".mouse").click(function(){
              $('html,body').animate({'scrollTop':WH},500);
          });   
    });

    //飞入
    var wow = new WOW({
      boxClass: 'wow',
      animateClass: 'animated',
      offset: 0,
      mobile: true,
      live: true
    });
    wow.init();
    new WOW().init();

   // 留言页面
   $(function () {
     $("#f2").click(function () {          
         ksbm.common.tools.validate($("#f1"));       
       });
       $('.counter').countUp();
 });

 $(function () {
  //输入框获得焦点的时候，提示内容消失
  $(".m_label").click(function () {
    $(this).hide();
    $(this).siblings(".m_input").focus();
  });
  $(".m_input").focus(function () {
    $(this).siblings(".m_label").hide();
  });
  $(".m_input").blur(function () {
    if ($(this).val() == '') {
      $(this).siblings(".m_label").show();
    }
  });
  $(".m_input").each(function () {
    if ($(this).val() != '') {
      $(this).siblings(".m_label").hide();
    }
  });
});


k73('.job-list li .dt', '.job-list li .wehha-job');
// 第一个值是父元素第二个值是子元素
function k73(idParent, idSon) {
    let parent = $(idParent);
    let son = $(idSon);
    son.slideUp();
    $(".job-list li").eq(0).find(".wehha-job").slideDown(300);
    $(".job-list li").eq(0).addClass("active").siblings().removeClass("active");
    $(".job-list li").eq(0).find(".iconfont").removeClass("icon-xiangxiajiantou").addClass("icon-xiangshangjiantou");
    parent.on('click', function (event) {
        if ($(this).siblings(".wehha-job ").is(':hidden')) {
            parent.siblings(".wehha-job ").slideUp(300); // 关闭其他
            $(this).siblings(".wehha-job ").slideDown(300); // 显示自己
            $(this).parent("li").addClass("active").siblings().removeClass("active");
            $(this).find(".iconfont").removeClass("icon-xiangxiajiantou").addClass("icon-xiangshangjiantou").parents("li").siblings("li").find(".iconfont").addClass("icon-xiangxiajiantou").removeClass("icon-xiangshangjiantou"); // 关闭自己

        } else {
            $(this).siblings(".wehha-job ").slideUp(300); // 关闭自己
            $(this).find(".iconfont").removeClass("icon-xiangshangjiantou").addClass("icon-xiangxiajiantou"); // 关闭自己

        }
        event.preventDefault();
    });
};

 },
 swiper: function (){
     var swiper = new Swiper(".mySwipera", {
         slidesPerView: 1,
         loop: true,
         speed:1000,
        //  autoplay: {
        //      delay: 6000,
        //      disableOnInteraction: false,
        //  },
         pagination: {
             el: '.mySwipera .swiper-pagination1',
             clickable :true,
         },
         on: {
          init: function(){
            swiperAnimateCache(this); //隐藏动画元素 
            swiperAnimate(this); //初始化完成开始动画
          }, 
            slideChangeTransitionEnd: function () {
                swiperAnimate(this); //每个slide切换结束时也运行当前slide动画
                // this.slides.eq(this.activeIndex).find('.ani').removeClass('ani'); //动画只展现一次，去除ani类名
            },
        }
       });
       var swiper1 = new Swiper(".mySwiper1", {
        loop: true,
        slidesPerView: 1,
        loopedSlides: 12,// 循环加载
        autoplay: true,
        navigation: {
          nextEl: ".swiper-button-next1",
          prevEl: ".swiper-button-prev1",
        },
      });
      var swiper2 = new Swiper(".mySwiper2", {
        slidesPerView: 5,
        spaceBetween: 39, slidesPerGroup: 3,
        loop: true,
        autoplay: true,
        loopedSlides: 12,
        pagination: {
          el: '.swiper-pagination1',
          clickable :true,
      },
        breakpoints: {
          450: {
            slidesPerView: 2,spaceBetween: 10, slidesPerGroup: 2,
          },
          768: {
           slidesPerView: 3,spaceBetween: 15,
         },
         1024: {
           slidesPerView: 4,spaceBetween: 20,
         },
         1366: {
           slidesPerView: 5,
           spaceBetween: 30,
         },
       },
      });   
      var swiper3 = new Swiper(".mySwiper3", {
        slidesPerView: 1,
        spaceBetween: 1,
        loop: true,
        autoplay: true,
        loopedSlides: 12,
        pagination: {
          el: '.swiper-pagination1',
          clickable :true,
        },
      });  
      var swiperlc = new Swiper(".mySwiper1a", {
        // loop: true,
        slidesPerView: 9,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
         768: {
          slidesPerView: 3,
        },
         1024: {
          slidesPerView: 4,
        },
        1366: {
          slidesPerView: 6,
        },
        1440: {
          slidesPerView: 7,
        },
        },
      });  
      var swiper11 = new Swiper(".mySwiper11a", {
        // loop: true,
        spaceBetween: 9,
        navigation: {
          nextEl: '.abt-cont3 .swiper-button-next1',
          prevEl: '.abt-cont3 .swiper-button-prev1',
        },
        thumbs: {
          swiper: swiperlc,
        },
      }); 
      var swiperac = new Swiper(".mySwiper3t", {
        slidesPerView: 4,
        spaceBetween: 17,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
          768: {
            slidesPerView: 4, spaceBetween: 10,
          },
          990: {
            slidesPerView: 3, spaceBetween: 10,
          },
          1024: {
            slidesPerView: 3, spaceBetween: 10,
          },
          1366: {
            slidesPerView: 3, spaceBetween: 15,
          },
        }
      });
      var swiper2t = new Swiper(".mySwiper2t", {
        // loop: true,
        slidesPerView: 1,
        spaceBetween: 1,
        autoplay: true,
        loopedSlides: 12,// 循环加载
        thumbs: {
          swiper: swiperac,
        },
        navigation: {
          nextEl: '.swiper-button-next1',
          prevEl: '.swiper-button-prev1',
        },
      });
      var swiper4 = new Swiper(".mySwiper4", {
        slidesPerView: 4,
        spaceBetween: 30, slidesPerGroup: 2,
        loop: true,
        autoplay: true,
        loopedSlides: 12,
        pagination: {
          el: '.swiper-pagination1',
          clickable :true,
      },
        breakpoints: {
          450: {
            slidesPerView: 2,spaceBetween: 10, 
          },
          768: {
           slidesPerView: 2,spaceBetween: 20,
         },
         1024: {
           slidesPerView: 3,spaceBetween: 20,
         },
         1366: {
           spaceBetween: 20,
         },
       },
      });  
      // maker
       
 }
}

$(document).ready(function(){
  // 遍历每个 .sec 块
  $('.pro-sortlist2 .seck').each(function() {
      // 获取链接并按照文本首字母排序
      var links = $(this).find('a').sort(function(a, b) {
          return $(a).text().localeCompare($(b).text());
      });

      // 清空原有内容并将排序后的链接添加回去
      $(this).empty().append(links);
  });
});
// jQuery(".pro-sort-v1").slide({mainCell:".bd ul"});
