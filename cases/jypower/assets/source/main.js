
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
  // 防复制代码
  antiClone: function () {
    // 防止ctrl+C
    document.onkeydown = function (e) {
        var e = e || event;
        if (e.ctrlKey == 1 && e.keyCode == 67) {
            return false;
        }
    };
    // 阻止复制
    document.body.oncopy = function (){ return false; };
    //禁止选取
    document.body.onselectstart=document.body.oncontextmenu=function(){return false;};
    // 禁止图片拖拽
    document.addEventListener('dragstart', function(e) {
      if (e.target.tagName.toLowerCase() === 'img') {
          e.preventDefault();
      }
   });
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
     $(tab_boxa).eq(0).addClass('on');
     $(tabsa).eq(0).addClass('on');
     $(tabsa).bind(_eventa,function(){
         $(this).addClass("on").siblings().removeClass("on");
         var _index = $(this).index();
         $(tab_boxa).eq(_index).addClass('on').siblings().removeClass("on");
     })
 },
 
  // 选中高亮
  tabsb: function(tabsb,_eventb) {
    $(tabsb).eq(0).addClass('active');
   $(tabsb).bind(_eventb,function(){
       $(this).addClass("active").siblings().removeClass("active");
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
  app.clickToggle('.zywena .rhgxt','.zywena .yy-sec');
 app.tabs('.fo-a3 .dbdz li','.fo-a3 .asdx-z li','mouseenter');
 app.tabsa('.ashh1-a li','.ashh2-a li','click');
 app.tabsa('.ashh1-a li','.ashh3-a li','click');
 app.tabsa('.ashh2-a li','.ashh3-a li','mouseenter');
  app.tabs('.as_lsuxt1 li','.tab-cont-zs .tta','mouseenter');
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
      $(".pead-cont .hefat .tit").text($(this).text());
      $(".pead-jsda").show();
    });
    $('a.jataxta').on('click', function(){
    $(".pead-jsda").hide();
    });
        $(document).click(function(e){
      if (!$(".zywena a.rhgxt").is(e.target) && $(".zywena a.rhgxt").has(e.target).length === 0){
          $(".yy-sec").slideUp();
      }
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
        $("#f2a").click(function () {          
         ksbm.common.tools.validate($("#f1a"));       
       });       
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
         autoplay: {
             delay: 6000,
             disableOnInteraction: false,
         },
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
        slidesPerView: 3,
        spaceBetween: 5,
        loopedSlides: 12,// 循环加载
        autoplay: true,
        pagination: {
          el: '.mySwiper1 .swiper-pagination1',
          clickable :true,
        },
        breakpoints: {
           450: {
           slidesPerView: 1,
          },
          768: {
           slidesPerView: 2,
          },
        },
      });

      var swiper2 = new Swiper(".mySwiper2", {
        // loop: true,
        slidesPerView: 4,
        // loopedSlides: 12,// 循环加载
        autoplay: true,
          navigation: {
          nextEl: ".abt-a3va1 .swiper-button-next1",
          prevEl: ".abt-a3va1 .swiper-button-prev1",
        },
        breakpoints: {
           450: {
           slidesPerView: 1, 
          },
          768: {
           slidesPerView: 2, 
          },
        },
      });         


       var swiper3 = new Swiper(".mySwiper3", {
        loop: true,
        slidesPerView: 3,
        spaceBetween: 24,
        loopedSlides: 12,// 循环加载
        autoplay: true,
        pagination: {
          el: '.mySwiper3 .swiper-pagination1',
          clickable :true,
        },
        breakpoints: {
           450: {
           slidesPerView: 1, spaceBetween: 18,
          },
          768: {
           slidesPerView: 2, spaceBetween: 20,
          },
        },
      });         

      var swiper4 = new Swiper(".mySwiper4", {
        loop: true,
        loopedSlides: 12,// 循环加载
        autoplay: true,
        navigation: {
          nextEl: ".swiper-button-next1",
          prevEl: ".swiper-button-prev1",
        },
        thumbs: {
          swiper: {
            el: '.mySwiper5',
            spaceBetween: 15,
            slidesPerView: 4,
             direction: "vertical",
            breakpoints: {
              450: {
                slidesPerView: 3,
              },
            },
          },
        }
      });
    
     var swiper6 = new Swiper(".mySwiper6", {
      loop: true,
      slidesPerView: 3,
      spaceBetween: 1,
      centeredSlides: true,
      autoplay: true,
      loopedSlides: 12,// 循环加载
      pagination: {
          el: '.mySwiper6 .swiper-pagination1',
          clickable :true,
      },
      breakpoints: {
        768: {
          slidesPerView: 1,
        },
      },
    });
    
    
         var swiper_new = new Swiper(".swiper_new", {
 slidesPerView: 1,
    speed: 800,
    spaceBetween: 40,
    parallax: true,
    direction: 'vertical',
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    slidesPerGroup: 1,
    pagination: {
      el:".idxnewShow",
      clickable: true,
    },
    });
       
 }
}

if ($.exists('.counter')){
  $('.counter').countUp();
}


if ($.exists('.pro-show-a1b2c2')){
  $(document).ready(function() {
    $('.more-axa').click(function() {
        $('.pro-show-a1b2c2').toggleClass('active');
        var pElement = $(this).find('p');
        if (pElement.text() === '显示更多') {
            pElement.text('折叠信息');
        } else {
            pElement.text('显示更多');
        }
    });
});
}

if ($.exists('.more-b-axta')){
 $('.more-b-axta').click(function() {
        $('.zjash1-ahx').toggleClass('active');
    });
}