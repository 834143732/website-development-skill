$(function () {
    index.phoneNav();
    index.scrool();
    index.click();
    index.swiper();
})
$(function () {
    var windoww = $(window).width();
    $('.sp_nav').click(function () {
        $('.sjj_nav').addClass('nav_show');
    });

    $('.sjj_nav ul li i').click(function () {
        $(this).parent().children('ul').slideToggle().parent().siblings().children('ul').slideUp();
        $(this).toggleClass('sjj_nav_i_se');
        $(this).parent().siblings().find('i').removeClass('sjj_nav_i_se');
    });

    $('.sp_nav_xjb').html('<svg t="1496193951932" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="995" xmlns:xlink="http://www.w3.org/1999/xlink" width="200" height="200"> <path d="M768.468 428.876l-84.723-84.723-170.711 170.711-170.711-170.711-84.723 84.723 170.711 170.711-0.092 0.091 84.723 84.724 0.092-0.092 0.092 0.092 84.723-84.724-0.092-0.091z" p-id="996"></path></svg>');

    $(".sjj_nav .top .fr").click(function () {
        $('.sjj_nav').removeClass('nav_show');
    })
});
$(".sjj_nav ul li ul li a").click(function () {
    $(".sjj_nav").removeClass("nav_show");
})
var index = {
    // 手机端导航
    phoneNav: function () {
        var ua = window.navigator.userAgent;
        var winW = $(window).width();
        $(document).on("click", "#header .bt-mn,#siteFunctions .bt-close", menuCtr);
        $(document).on("click", ".mobMenu > li > a", subMenu);

        function menuCtr(e) {
            e.preventDefault();

            $("#header .bt-mn,#siteFunctions .bt-close").toggleClass("open");

            $(".subDepth").slideUp(200);
            $(".mobMenu li").removeClass("active");

            if (ua.indexOf('MSIE 7') > -1 || ua.indexOf('MSIE 8') > -1) {
                $("body").toggleClass("ovf_hdn");
            } else {
                $("html, body").toggleClass("ovf_hdn");
            }

            if (!$(this).hasClass("open")) {
                $("#siteFunctions").stop().animate({
                    right: '-100%'
                }, 250);
                lm_open = false;

                if (ua.indexOf('MSIE 7') > -1 || ua.indexOf('MSIE 8') > -1) {
                    $("html").css({
                        "height": "100%"
                    });
                    $("body").css({
                        "height": "100%",
                        "overflow": "visible",
                        "position": "static"
                    });
                }
            } else {
                $("#siteFunctions").stop().animate({
                    right: 0
                }, 250);
                //$(".mbg").fadeIn(200);
                lm_open = true;

                if (ua.indexOf('MSIE 7') > -1 || ua.indexOf('MSIE 8') > -1) {
                    $("html").css({
                        "height": $(window).height() + "px"
                    });
                    $("body").css({
                        "height": $(window).height() + "px",
                        "overflow": "hidden",
                        "position": "relative"
                    });
                }
            }
        };

        function subMenu(e) {
            $thisp = $(this).parent();

            var chk = false;
            $(".mobMenu > li").removeClass("active");

            var dropDown = $(this).next(".subDepth");
            $(".subDepth").not(dropDown).slideUp("fast");
            dropDown.stop(false, true).slideToggle("fast", function () {
                if ($(this).is(":hidden")) {
                    $thisp.removeClass("active");
                    chk = false;
                } else {
                    $thisp.addClass("active");
                    chk = true;
                }
            });

            if (!chk) {
                $(this).parent().find(".mdepth3").each(function (idx) {
                    if ($(this).css("display") == "block") {
                        $(this).parent().removeClass("active");
                        $(this).parent().find(".mdepth3").hide();
                    }
                });
            }
        }
        $("#gnb > li").each(function () {
            $(this).bind({
                "mouseenter focusin": function () {
                    $("#header #gnb > li").removeClass('active');
                    $('#header .subDepth').removeClass('show_menu');
                    $('#header .subBg').stop().slideDown(200);
                    $(this).find('.subDepth').stop().slideDown(200, function () {
                        $(this).addClass('show_menu');
                    })
                }
            });
        });
        $("#gnb > li,#gnb > li.gnb5").each(function () {
            $(this).bind({
                "mouseleave focusout": function () {
                    $("#header").removeClass("on");
                    $("#header #gnb > li").removeClass('active');
                    $('#header .subBg').stop().slideUp(100);
                    $('#header .subDepth').stop().slideUp(100, function () {
                        $(this).addClass('show_menu');
                    });
                }
            });
        });
    },

    // 回到顶部
    scrool: function () {
        // 回到顶部
        var $window = $(window);
        $window.scroll(function () {
            var scrollTop = $(document).scrollTop();
            if (scrollTop > 800) {
                $(".fix_ul li:last-child").show(1000);

            } else {
                $(".fix_ul li:last-child").hide(1000)
            }
            if (scrollTop > 0) {
                $(".header_pha").addClass('active');

            } else {
                $(".header_pha").removeClass('active')
            }
        });
        $(".fix_ul li:last-child").click(function () {
            $("html,body").animate({
                scrollTop: 0
            }, 'slow')
        });
        //    鼠标下滑导航添加类
        var $window = $(window);
        $window.scroll(function () {
            var scrollTop = $(document).scrollTop();

            if (scrollTop > 0) {

            } else {}
        });

        // 
        $(window).scroll(function () {
            var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
            var eltop = $("#client-2").find(".my-kefu-ftop");
            if (scrollTop > 500) {
                eltop.show(500);
            } else {
                eltop.hide(500);
            }
        });
        $("#client-2").find(".my-kefu-ftop").click(function () {
            var scrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
            if (scrollTop > 0) {
                $("html,body").animate({
                    scrollTop: 0
                }, "slow");
            }
        });



    },
    click: function () {
        // 搜索
        var flag = true;
        $(".ds").click(function (e) {
            e.stopPropagation();
            if (flag) {
                $(".searchbox").slideDown();
                $(this).find(".iconfont").removeClass('icon-search');
                $(this).find(".iconfont").addClass('icon-guanbi');
                flag = false;
            } else {
                $(".searchbox").slideUp();
                $(this).find(".iconfont").removeClass('icon-guanbi');
                $(this).find(".iconfont").addClass('icon-search');
                flag = true;
            }
        });
        // 下滑
        $('.xiangxia').click(function () {
            var heights = $(window).height();
            $('body,html').animate({
                scrollTop: heights * 0.8
            }, 1000);
            return false;
        });
        // 搜索验证 
        $("#btt").click(function () {
            ksbm.common.tools.validate($("#formm"));
        });


        $(".section4 ul li").mouseenter(function () {
            $(this).addClass("active").siblings("li").removeClass("active");
        });
        $(".section4 ul li").eq(0).addClass("active");


        // 搜索
        $(".ds").click(function () {
            $(".search").slideDown();
        });
        $(".search-con").click(function () {
            $(".search").slideUp();
        });


        // k73('.recruit_three   ul li >.clearfix', '.recruit_three ul li .content');
        // // 第一个值是父元素第二个值是子元素
        // function k73(idParent, idSon) {
        //     let parent = $(idParent);
        //     let son = $(idSon);
        //     son.slideUp();
        //     parent.on('click', function (event) {

        //         if ($(this).siblings(".content ").is(':hidden')) {
        //             parent.siblings(".content").slideUp(300); // 关闭其他
        //             $(this).siblings(".content").slideDown(300); // 显示自己
        //             $(this).siblings(".clearfix .iconfont").removeClass("icon-jiantou").addClass("icon-jiantou-copy").parent("li").siblings("li").find(".iconfont").addClass("icon-jiantou").removeClass("icon-jiantou-copy"); // 关闭自己

        //         } else {
        //             $(this).siblings(".content").slideUp(300); // 关闭自己
        //             $(this).siblings(".clearfix .iconfont").removeClass("icon-jiantou-copy").addClass("icon-jiantou"); // 关闭自己

        //         }
        //         event.preventDefault();
        //     });
        // };
        // 视频弹出
        $('.list_rdcenter_two .img').click(function () {
            $('#spsy_tc .hall-wheel video')[0].play();
        });
        $('#spsy_tc .close,#spsy_tc').click(function () {
            $('#spsy_tc .hall-wheel video')[0].pause();
        });
        $("#f4").click(function () {
            ksbm.common.tools.validate($("#f3"));
        })

        $(document).on("click", ".list_join .bot .recruit_three ul li .clearfix", subMenu);
        $(".list_join .bot .recruit_three ul li .clearfix").click(function () {
            $(this).parent("li").addClass("active").siblings("").removeClass("active");
        })

        function subMenu(e) {
            $thisp = $(this).parents("li");
            var chk = false;
            $(".list_join .bot .recruit_three ul li").removeClass("active");
            var dropDown = $(this).parents("li").find(".content");
            $(".content").not(dropDown).slideUp("fast");
            dropDown.stop(false, true).slideToggle("fast", function () {
                if ($(this).is(":hidden")) {
                    $thisp.removeClass("active");
                    chk = false;
                } else {
                    $thisp.addClass("active");
                    chk = true;
                }
            });
        };
        $(".list_join .bot .recruit_three ul li").eq(0).addClass("active");
        $(".list_join .bot .recruit_three ul li").eq(0).find(".content").slideDown();
        $(".list_pro .left ul li").mouseenter(function () {
            var index = $(this).index();
            $(this).addClass("active").siblings().removeClass("active");
            $(".list_pro .right>div").eq(index).addClass("active").siblings().removeClass("active");
        });
        $(".list_pro .left ul li").eq(0).addClass("active");
        $(".list_pro .right>div").eq(0).addClass("active");



        $(".list_join .right ul li").click(function () {
            var index = $(this).index();
            $(this).addClass("active").siblings().removeClass("active");
            $(".recruit_three >ul").eq(index).addClass("active").siblings().removeClass("active");
        });
        $(".list_join .right ul li").eq(0).addClass("active");
        $(".recruit_three >ul").eq(0).addClass("active");

        if ($(window).width() < 767) {
            $(".list_pro .left ul li").each(function () {
                $(this).find("a").attr("href", "javascript:;")
            })
        };



        // 搜索验证 
        $("#btt").click(function () {
            ksbm.common.tools.validate($("#formm"));
        })

    },
    swiper: function () {
        var swiper = new Swiper(".banner .swiper-container", {
            navigation: {
                nextEl: ".banner  .swiper-button-next",
                prevEl: ".banner  .swiper-button-prev",
            },
            loop: true,
            autoplay: {
                delay: 5000,
                stopOnLastSlide: false,
                disableOnInteraction: true,
            },
            effect: 'fade',
            speed: 1000,
            on: {
                init: function () {
                    swiperAnimateCache(this); //隐藏动画元素 
                    swiperAnimate(this); //初始化完成开始动画
                },
                slideChangeTransitionEnd: function () {
                    swiperAnimate(this); //每个slide切换结束时也运行当前slide动画
                    //this.slides.eq(this.activeIndex).find('.ani').removeClass('ani'); 动画只展现一次，去除ani类名
                }
            },
            breakpoints: {
                767: {
                    pagination: {
                        el: ".banner .swiper-pagination",
                        clickable: true
                    },
                }
            }
        });

        var swiper = new Swiper(".index_area .swiper-container", {
            slidesPerView: 4,
            spaceBetween: 0,
            // loop: true,
            observer: true, //修改swiper自己或子元素时，自动初始化swiper
            observeParents: true,
            pagination: {
                el: ".index_area .swiper-pagination",
                clickable: true
            },
            noSwiping: true,
            breakpoints: {
                767: {
                    slidesPerView: 2,
                    noSwiping: false,
                }
            }

        });

        var swiper = new Swiper(".honor_swiper", {
            slidesPerView: 6,
            spaceBetween: 20,
            loop: true,
            freeMode: true,
            speed: 2000,
            autoplay: {
                delay: 0,
                disableOnInteraction: false,
            },
            breakpoints: {

                1440: {
                    slidesPerView: 5,
                },
                1024: {
                    slidesPerView: 5,
                },
                768: {
                    slidesPerView: 4,
                    spaceBetween: 15,
                },
                500: {
                    slidesPerView: 3,
                    spaceBetween: 15,
                }

            }
        });
        var swiper = new Swiper(".honor_swiper1", {
            slidesPerView: 4,
            breakpoints: {
                768: {
                    slidesPerView: 3,
                    spaceBetween: 15,
                },
                500: {
                    slidesPerView: 2,
                    spaceBetween: 15,
                }

            }
        });

        var swiper = new Swiper(".list_about_two .swiper-container", {
            slidesPerView: 4,
            spaceBetween: 20,

            breakpoints: {
                990: {
                    slidesPerView: 3,
                    pagination: {
                        el: ".list_about_two  .swiper-pagination",
                        clickable: true,
                    },
                },
                767: {
                    slidesPerView: 2,
                    slidesPerColumn: 1,
                    spaceBetween: 10,
                    pagination: {
                        el: ".list_about_two  .swiper-pagination",
                        clickable: true,
                    },
                }
            }
        });


        var swiper = new Swiper(".list_about_three  .swiper-container", {
            slidesPerView: 4,
            spaceBetween: 0,
            navigation: {
                nextEl: ".list_about_three .swiper-button-next",
                prevEl: ".list_about_three .swiper-button-prev",
            },
            pagination: {
                el: ".list_about_three  .swiper-pagination",
                clickable: true,
            },
            breakpoints: {
                990: {
                    slidesPerView: 2,
                },
                767: {
                    slidesPerView: 3,
                    pagination: {
                        el: ".list_about_three .swiper-pagination",
                        clickable: true
                    },
                },
                500: {
                    slidesPerView: 2,
                    pagination: {
                        el: ".list_about_three .swiper-pagination",
                        clickable: true
                    },
                }
            }
        });

        var swiper = new Swiper(".list_news_top .swiper-container", {
            spaceBetween: 10,
            navigation: {
                nextEl: ".list_news_top .swiper-button-next",
                prevEl: ".list_news_top .swiper-button-prev",
            },

            breakpoints: {
                767: {
                    pagination: {
                        el: ".list_news_top .swiper-pagination",
                        clickable: true
                    },
                }
            }
        });

        var swiper = new Swiper(".show_news .swiper-container", {
            pagination: {
                el: ".show_news  .swiper-pagination",
                clickable: true,
            },
            slidesPerView: 3,
            spaceBetween: 46,
            breakpoints: {
                990: {
                    spaceBetween: 25,
                },
                767: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                500: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                }
            }
        });

        var swiper = new Swiper(".list_tech .swiper-container", {
            slidesPerView: 5,
            spaceBetween: 0,
            breakpoints: {
                1024: {
                    slidesPerView: 3,
                    pagination: {
                        el: ".list_tech .swiper-pagination",
                        clickable: true,
                    },
                },
                767: {
                    slidesPerView: 2,
                    pagination: {
                        el: ".list_tech .swiper-pagination",
                        clickable: true,
                    },
                },
                500: {
                    slidesPerView: 1,
                    pagination: {
                        el: ".list_tech .swiper-pagination",
                        clickable: true,
                    },
                }
            }

        });
        var swiper = new Swiper(".list_tech_five .swiper-container", {
            slidesPerView: 5,
            // spaceBetween: 30, 

            breakpoints: {
                767: {
                    slidesPerView: 3,
                    pagination: {
                        el: ".list_tech_five .swiper-pagination",
                        clickable: true,
                    },
                }
            }
        });
        var swiperrd_cener = new Swiper(".list_rdcenter .swiper-container", {
            spaceBetween: 10,
            observer: true,
            observeParents: true,
            // pagination: {
            //     el: ".list_rdcenter .swiper-pagination",
            //     clickable: true,
            // },
            on: {
                slideChangeTransitionStart: function () {
                    $(".list_rdcenter .qiehuan ul li").eq(this.activeIndex).addClass("active").siblings("li").removeClass("active");
                },
            }
        });
        $(".list_rdcenter .qiehuan ul li").eq(0).addClass("active");
        $('.list_rdcenter .qiehuan ul li').click(function () {
            let i = $(this).index();
            $(this).addClass('active').siblings().removeClass('active');
            swiperrd_cener.slideTo(i);
        });

        var swiper = new Swiper(".list_about_six .swiper-container", {
            slidesPerView: 4,
            spaceBetween: 40,
            // loop: true,
            // autoplay: true,
            pagination: {
                el: ".list_about_six .swiper-pagination",
                clickable: true,
            },
            breakpoints: {
                1366: {
                    slidesPerView: 3,
                    spaceBetween: 40,
                },
                767: {
                    slidesPerView: 2,
                    spaceBetween: 15,
                }
            }
        });


        var swiper = new Swiper(".ny_ban .swiper-container", {
            pagination: {
                el: ".ny_ban .swiper-pagination",
                clickable: true
            },
            loop: true,
            autoplay: true,
        });


        // var swiper = new Swiper(".list_about_four .right .swiper-container", {
        //     direction: "vertical",
        //     slidesPerView: "auto",
        //     freeMode: true,
        //     scrollbar: {
        //         el: ".list_about_four .swiper-scrollbar",
        //     },
        //     mousewheel: true,
        // });


        var swiper = new Swiper(".section_hxcp  .swiper-container", {
            slidesPerView: 9,
            spaceBetween: 0,
            loop: true,
            autoplay: true,
            pagination: {
                el: ".section_hxcp .swiper-pagination",
                clickable: true,
            },
            breakpoints: {
                1366: {
                    slidesPerView: 7,
                },
                990: {
                    slidesPerView: 5,
                },
                767: {
                    slidesPerView: 3,
                }
            }
        });

        var swiper = new Swiper(".swiper_remuiam .swiper-container", {
            slidesPerView: 3,
            spaceBetween: 30,
            pagination: {
                el: ".swiper_remuiam .swiper-pagination",
                clickable: true,
            },
            breakpoints: {
                990: {
                    slidesPerView: 2,
                },
                767: {
                    slidesPerView: 1,
                }
            }
        });


        $(".index_make ul li").mouseenter(function () {
            var index = $(this).index()
            $(this).addClass("active").siblings().removeClass("active")
            $(".index_make .bgg .list > div").eq(index).addClass("active").siblings().removeClass("active")
        })



        
    }







};
// 动画
var wow = new WOW({
    boxClass: 'wow',
    animateClass: 'animated',
    offset: 0,
    mobile: true,
    live: true
});
// 数字
wow.init();
new WOW().init();
$(function () {
    $('.counter').countUp();
});