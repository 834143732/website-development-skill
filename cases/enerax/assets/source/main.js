
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
  app.clickToggle('.rhgxt i','.zywena .yy-sec');
 app.tabs('.cont1 .ashx1 li','.cont1 .a1v2 .tta', 'mouseenter');
 app.tabs('.yy-a3_list2 li','.yy-a3_list1 li', 'mouseenter');
//  app.tabs('.nav_a1 .sec1 .sec-v2 .sec-a1 a','.nav_a1 .sec1 .sec-v2 .sec-a2 .ttz', 'mouseenter');
//  app.tabs('.nav_a1 .sec1 .sec-v2 .sec-a1 a','.nav_a1 .sec1 .sec-v2 .sec-a3 .ttz', 'mouseenter');
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
      // $(".pead-cont .tit").text($(this).text());
       currentDownloadUrl = $(this).data('url');
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
        $("#f2t").click(function () {          
         ksbm.common.tools.validate($("#f1t"));       
       });      
         $("#f2tk").click(function () {     
        ksbm.common.tools.xzmsg($("#f1tk"));       
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
          loopedSlides: 12,// 循环加载
          speed:1000,
          autoplay: {
              delay: 7000,
              disableOnInteraction: false,
          },
          pagination: {
                  el: '.mySwipera .pagination .inner',
                  clickable: true,
                  renderBullet: function (index, className) {
                            return '<div class="list '+className+'"><button type="button" class="dot">'+
                    '<svg viewbox="0 0 40 40" class="circular-chart"><path class="circle" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /></svg>'+
                    '</button></div>'
                        }
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
        var swiper1 = new Swiper('.mySwiper1', {
          slidesPerView: 3,
          spaceBetween: 36,
          speed: 800,
          // loop: true,
          loopedSlides: 8,
          autoplay: {
            delay: 6000,
            disableOnInteraction: false,
          },
          breakpoints: {
            768: {
              slidesPerView: 1,
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 36,
            },
            1366: {              
              spaceBetween: 20,
            },
            },
        });
      var swiper2 = new Swiper(".mySwiper2", {
        loop: true,
        slidesPerView: 3,
        spaceBetween: 48,
        loopedSlides: 12,// 循环加载
        autoplay: true,
        pagination: {
          el: ".swiper-pagination",
          type: "progressbar",
        },
        navigation: {
          nextEl: ".swiper-button-next1",
          prevEl: ".swiper-button-prev1",
        },
        breakpoints: {
          768: {
            slidesPerView: 1,spaceBetween: 15,
          },
          1024: {
            slidesPerView: 2,spaceBetween: 15,
          },
          1366: {
            spaceBetween: 20,
          },
        },
      });

      var swiper3 = new Swiper(".mySwiper3", {
        loop: true,
        loopedSlides: 12,// 循环加载
        autoplay: true,
        speed:1000,
        pagination: {
          el: '.abt-b2 .swiper-pagination1',
          clickable :true,
        },
      });
       var swiper4 = new Swiper(".mySwiper4", {
        loop: true,
        loopedSlides: 12,// 循环加载
        autoplay: true,
        speed:1000,
        pagination: {
          el: '.mySwiper4 .swiper-pagination1',
          clickable :true,
        },
      });
      var swiper5 = new Swiper(".mySwiper5", {
        // loop: true,
         autoplay: true,
        loopedSlides: 12,// 循环加载
        autoplay: true,
        speed:1000,
        pagination: {
          el: '.news-a1v1 .swiper-pagination1',
          clickable :true,
        },
      });
       var swiper6 = new Swiper(".mySwiper6", {
          slidesPerView: 1,
          loop: true,
          loopedSlides: 12,// 循环加载
          speed:1000,
          autoplay: {
              delay: 7000,
              disableOnInteraction: false,
          },
          pagination: {
                  el: '.mySwiper6 .pagination .inner',
                  clickable: true,
                  renderBullet: function (index, className) {
                            return '<div class="list '+className+'"><button type="button" class="dot">'+
                    '<svg viewbox="0 0 40 40" class="circular-chart"><path class="circle" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /></svg>'+
                    '</button></div>'
                        }
            },
        });
         var swiper7 = new Swiper(".mySwiper7", {
          loop: true,
          loopedSlides: 12,// 循环加载
          autoplay: true,
          spaceBetween: 40,
          speed:1000,
          navigation: {
            nextEl: ".pro-show-cont2 .swiper-button-next1",
            prevEl: ".pro-show-cont2 .swiper-button-prev1",
          },
         pagination: {
          el: '.pro-show-cont2 .swiper-pagination1',
          clickable :true,
        },
         breakpoints: {
          768: {
             spaceBetween: 15,
          },
          1024: {
           spaceBetween: 25,
          },
          1366: {
            spaceBetween: 30,
          },
        },
      });
       var swiper8 = new Swiper(".mySwiper8", {
        loop: true,
        slidesPerView: 4,
        spaceBetween: 40,
        loopedSlides: 12,// 循环加载
        autoplay: true,
        navigation: {
            nextEl: ".pro-show-a4v1 .swiper-button-next1",
            prevEl: ".pro-show-a4v1 .swiper-button-prev1",
          },
        breakpoints: {
          768: {
            slidesPerView: 1,spaceBetween: 15,
          },
          1024: {
            slidesPerView: 2,spaceBetween: 15,
          },
          1366: {
            spaceBetween: 20,
          },
        },
      });
          var swiper9 = new Swiper(".mySwiper9", {
        // loop: true,
        slidesPerView: 3,
         slidesPerGroup: 3,
        spaceBetween: 50,
        loopedSlides: 12,// 循环加载
        autoplay: true,
          navigation: {
            nextEl: ".yy-show-a4v1 .swiper-button-next1",
            prevEl: ".yy-show-a4v1 .swiper-button-prev1",
          },
         pagination: {
          el: '.yy-show-a4v1 .swiper-pagination1',
          clickable :true,
        },
        breakpoints: {
          768: {
            slidesPerView: 1,spaceBetween: 15, slidesPerGroup: 1,
          },
          1024: {
            slidesPerView: 2,spaceBetween: 20, slidesPerGroup: 2,
          },
          1366: {
            spaceBetween: 30,
          },
        },
      });
       
 }
}

jQuery(".picMarquee-left").slide({mainCell:".bd ul",autoPlay:true,effect:"leftMarquee",vis:10,interTime:50,trigger:"click"});
jQuery(".picMarquee-left1").slide({mainCell:".bd ul",autoPlay:true,effect:"leftMarquee",vis:10,interTime:50,trigger:"click"});
jQuery(".picMarquee-left2").slide({mainCell:".bd ul",autoPlay:true,effect:"leftMarquee",vis:10,interTime:50,trigger:"click",opp:'true'});
jQuery(".nav_a1 .icax6").slide({titCell:".sec-a1 a",mainCell:".sec-a2"});
jQuery(".nav_a1 .icax6").slide({titCell:".sec-a1 a",mainCell:".sec-a3"});
jQuery(".nav_a1 .icax6").slide({titCell:".sec1>.sec-v2>.sec-a2>.ttz>a",mainCell:".sec1 .sec-v2 .sec-a3 .ase-asx1"});

if ($.exists('.counter')){
  $('.counter').countUp();
}

if ($.exists('.cont5-b')){
   ScrollTrigger.matchMedia({
        "(min-width: 1366px)": function() {
             ScrollTrigger.create({
              trigger: '.cont5-b',
              start: 'top top',
              end: 'bottom top+=100',
              scrub: true,
              // pin: true,
              animation: gsap.timeline()
                .fromTo('.cont5-b-v1 .logo-aa', { y: '0', x: '0',scale: 1 }, { y: '36.25vw',x: '8.2rem',scale: 0.2})
            });
        },
        // Tablet: 768px - 1024px
        "(min-width: 1024px) and (max-width: 1366px)": function() {
             ScrollTrigger.create({
              trigger: '.cont5-b',
              start: 'top top',
              end: 'bottom top+=100',
              scrub: true,
              // pin: true,
              animation: gsap.timeline()
                .fromTo('.cont5-b-v1 .logo-aa', { y: '0', x: '0',scale: 1 }, { y: '43.75vw',x: '8.4rem',scale: 0.18})
            });
        },
         "(min-width: 767px) and (max-width: 1024px)": function() {
             ScrollTrigger.create({
              trigger: '.cont5-b',
              start: 'top top',
              end: 'bottom top+=100',
              scrub: true,
              // pin: true,
              animation: gsap.timeline()
                 .fromTo('.cont5-b-v1 .logo-aa', { y: '0', x: '0',scale: 1 }, { y: '45.75vw',x: '8.4rem',scale: 0.2})
            });
        },
        // Mobile: max-width 767px
        "(max-width: 767px)": function() {
           
        }
    });
}

if ($.exists('.dtss')){
      $(function () {
    $(".dtss").waypoint(
      function(direction){ 
        if(direction=="down"){
          // 向下滚动
          $(".dtss").addClass("on");
        }else{
          // 向上滚动
          $(".dtss").removeClass("on");
        }
      },//第１个参数为waypoints事件响应时所执行的代码，是一个匿名函数即可
      {
        offset:'100%'
      }//第２个参数为偏移量,本例即该div到窗口高度一半时触发
      );
   });
}


  $('.job-a3_list1 li dl').hover(function () {
            $(this).find('dd').stop().slideDown();
            $(this).addClass('on');
            $(this).siblings().find('dd').stop().slideUp();
            $(this).siblings().removeClass('on');
        })
 $('.job-a3_list1 li dl').hover(function(){
           var qiehuan2 = $(this).index();
            $(this).parents('li').find('.img img').eq(qiehuan2).stop().fadeIn().siblings().stop().hide();
        })

    if ($.exists('.yy-cont1')){
        if($(window).width()>768){
          const scrollingWrapper = document.querySelector('.mySwiper21 .wrap_x');
      const scrollEnd = scrollingWrapper.scrollWidth;
      const scrollEnda = scrollEnd - window.innerWidth/1.5;
      // console.log(scrollEnd);
      const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.yy-cont1',
                start: "top top-=20%",
                end: "bottom bottom-=100%",
                scrub: true,
                pin: true,
            }
        });
        tl.to(".mySwiper21 .wrap_x", { marginLeft: `-${scrollEnda}px` }, 'a');
        }
    }
      if($(window).width()<768){
      var swiper21 = new Swiper(".mySwiper21", {
        loop: true,
        slidesPerView: 3,
        spaceBetween: 48,
        loopedSlides: 12,// 循环加载
        autoplay: true,
        pagination: {
          el: ".swiper-pagination",
          type: "progressbar",
        },
        navigation: {
          nextEl: ".swiper-button-next1",
          prevEl: ".swiper-button-prev1",
        },
        breakpoints: {
          768: {
            slidesPerView: 1,spaceBetween: 15,
          },
          1024: {
            slidesPerView: 2,spaceBetween: 15,
          },
          1366: {
            spaceBetween: 20,
          },
        },
      });
      }
    $(document).ready(function() {
    $('.news-list2a').jobListToggle({
        triggerSelector: '.zdax', // 明确指定仅点击 .zdax 时触发
        iconOpenClass: 'icon-xiangshangjiantou',
        iconCloseClass: 'icon-xiangxiajiantou'
    });
});
      
      