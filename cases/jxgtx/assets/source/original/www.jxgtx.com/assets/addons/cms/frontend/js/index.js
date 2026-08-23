
$(function () {
    // 搜索点击切换类名
    $(".ds").click(function (e) {
        e.stopPropagation();
        changeClass(".searchbox", '.iconfont', 'icon-search', 'icon-guanbi')
    });
    changeElement("click", ".show_product_two .qiehuan li", ".show_product_two .left > div")

    $('.navItems').click(function (e) {
        var navto = $(this).attr('navto');
        e.preventDefault();
        if (navto != "#") {
            var $div = $('#' + navto);
            var top = $div.offset().top || 0;
            $('html,body').animate({
                'scroll-top': top - $("header").height()
            }, 500);
        } else {
            $('html,body').animate({
                'scroll-top': 0
            }, 500);
        }
    });

    $(window).scroll(function () {
        var scrollTop = $(document).scrollTop();

        $('.content_box >div').each(function (index) {
            let tops = $('.content_box >div:eq(' + index + ')').offset().top - 500;

            if (scrollTop >= tops) {
                $('.show_pro_yfcp_two ul li:eq(' + index + ')').addClass('active').siblings().removeClass('active');
                $('.nyerji_about ul li:eq(' + index + ')').addClass('active').siblings().removeClass('active');
            }
        })
    });

    var swiperBanner = new Swiper('.banner .swiper-container', {
        loop: true,
        autoplay: {
            delay: 4000,
            stopOnLastSlide: false,
            disableOnInteraction: true,
        },
        pagination: {
            el: ".banner .swiper-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: ".banner .swiper-button-next",
            prevEl: ".banner .swiper-button-prev",
        },
        on: {
            init: function () {
                swiperAnimateCache(this); //隐藏动画元素 
                swiperAnimate(this); //初始化完成开始动画
            },
            slideChangeTransitionEnd: function () {
                swiperAnimate(this); //每个slide切换结束时也运行当前slide动画
                //this.slides.eq(this.activeIndex).find('.ani').removeClass('ani'); 动画只展现一次，去除ani类名
            },

        }
    })
    var swiperIndexTwo = new Swiper('.index_two .swiper-container', {
        pagination: {
            el: ".index_two .swiper-pagination",
            clickable: true,
        },
        spaceBetween: 10,
        on: {
            slideChangeTransitionStart: function () {
                $(".index_two .content .left ul li").eq(this.activeIndex).addClass("active").siblings("li").removeClass("active");
            },
        }
    })
    $(".index_two .content .left ul li").on('mouseenter', function (e) {
        swiperIndexTwo.slideTo($(this).index());
    });
    $(".index_two .content .left ul li").eq(0).addClass("active")

    var swiper = new Swiper('.index_three .swiper-container', {
        navigation: {
            nextEl: ".index_three .swiper-button-next",
            prevEl: ".index_three .swiper-button-prev",
        },
        pagination: {
            el: ".index_three .swiper-pagination",
            clickable: true,
        },
        slidesPerColumnFill: 'row',
        slidesPerColumn: 2,
        slidesPerView: 4,
        spaceBetween: 0,
        breakpoints: {
            990: {
                slidesPerView: 3,
                spaceBetween: 25,
            },
            767: {
                slidesPerView: 2,
                spaceBetween: 15, slidesPerColumn: 1,
            }
        }
    })

    var swiper = new Swiper('.index_five .swiper-container', {
        navigation: {
            nextEl: ".index_five .swiper-button-next",
            prevEl: ".index_five .swiper-button-prev",
        },
        pagination: {
            el: ".index_five .swiper-pagination",
            clickable: true,
        },
        centeredSlides: true,
        slidesPerView: 3,
        loop: true,
        breakpoints: {
            990: {
                slidesPerView: 3,
                spaceBetween: 0,
            },
            767: {
                slidesPerView: 1.2,
                spaceBetween: 0, slidesPerColumn: 1,
            }
        }
    })
    var swiper = new Swiper('.list_news .swiper-container', {
        navigation: {
            nextEl: ".list_news .swiper-button-next",
            prevEl: ".list_news .swiper-button-prev",
        },
        pagination: {
            el: ".list_news .swiper-pagination",
            clickable: true,
        },
    })




    var swiper = new Swiper('.list_abuot_three .swiper-container', {
        navigation: {
            nextEl: ".list_abuot_three .swiper-button-next",
            prevEl: ".list_abuot_three .swiper-button-prev",
        },
        slidesPerView: 5,
        pagination: {
            el: ".list_abuot_three .swiper-pagination",
            clickable: true,
        },
        breakpoints: {
            990: {
                slidesPerView: 3,
            }, 767: {
                slidesPerView: 2,
            }
        }
    })

    var swiper = new Swiper('.list_about_five .swiper-container', {
        navigation: {
            nextEl: ".list_about_five .swiper-button-next",
            prevEl: ".list_about_five .swiper-button-prev",
        },
        slidesPerView: "auto",
        spaceBetween: 43,
        centeredSlides: true,
        loop: true,
        pagination: {
            el: ".list_about_five .swiper-pagination",
            clickable: true,
        },
        breakpoints: {
            1366: {
                spaceBetween: 23,
            }, 990: {
                spaceBetween: 20,
                slidesPerView: 2, centeredSlides: false,
            }
        }
    })

    var swiper_pro = new Swiper('.channel_product .swiper-container', {
        effect: "fade",
        loop: true,
        spaceBetween: 10,
        pagination: {
            el: ".channel_product .swiper-pagination",
            clickable: true,
        },
        speed: 2000,
        on: {
            slideChangeTransitionStart: function () {
                $(".channel_product .ul li").eq(this.activeIndex - 1).addClass("active").siblings("li").removeClass("active");
                $(".channel_product .left > div").eq(this.activeIndex - 1).addClass("active").siblings("div").removeClass("active");
            },
        },
        breakpoints: {
            990: {
                noSwiping: false,
                effect: 'fade',
                fadeEffect: {
                    crossFade: true
                },
                speed: 800,
            }
        }
    })
    $(".channel_product .ul li").on('mouseenter', function (e) {
        swiper_pro.slideTo($(this).index() + 1);
    });


    $('#f23').click(function () {
        ksbm.common.tools.validate($('#f13'));
    })





    function k73(idParent, idSon) {
        let parent = $(idParent);
        let son = $(idSon);
        parent.on('click', function (event) {
            if ($(this).siblings(".bot").is(':hidden')) {
                parent.siblings(".bot").slideUp(300); // 关闭其他
                $(this).siblings(".bot").slideDown(300); // 显示自己
                $(this).parent("li").addClass("active").siblings().removeClass("active");

            } else {
                $(this).siblings(".bot").slideUp(300); // 关闭自己

            }
            event.preventDefault();
        });
    };
    k73('.list_qa .ul > li .top', '.list_qa .ul > li .bot');
    $(".list_qa .ul > li").eq(0).addClass("active")



    var swiper_bot = new Swiper(".swiper_bot", {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesProgress: true,
        direction: "vertical"
    });
    var swiper2 = new Swiper(".swiper_top", {
        spaceBetween: 10,
        navigation: {
            nextEl: ".show_product .swiper-button-next",
            prevEl: ".show_product .swiper-button-prev",
        },
        thumbs: {
            swiper: swiper_bot,
        },
    });

    // var swiper = new Swiper('.show_product_two .swiper-container', {
    //     slidesPerView: 6,
    //     spaceBetween: 0,
    //     pagination: {
    //         el: ".show_product_two .swiper-pagination",
    //         clickable: true,
    //     },
    //     breakpoints: {
    //         990: {
    //             slidesPerView: 4,
    //         }, 767: {
    //             slidesPerView: 3,
    //         }
    //     }
    // })


    $(".more2_jump").click(function () {
        $('html, body').animate({
            scrollTop: $(".list_message").offset().top - $("header").height()
        }, 1000);
    });
    $(".more2_jump1").click(function () {
        $('html, body').animate({
            scrollTop: $(".list_message").offset().top - $("header").height() - $(".qiehuan").height()
        }, 1000);
    });


    var swiper = new Swiper(".swiper_qiehuan_swiper", {
        slidesPerView: 3,
        spaceBetween: 30,
        pagination: {
            el: ".swiper_qiehuan_pag",
            clickable: true
        },
        navigation: {
            nextEl: ".show_product_two .div1 .swiper-button-next",
            prevEl: ".show_product_two .div1 .swiper-button-prev",
        },
        breakpoints: {
            990: {
                slidesPerView: 2,
                spaceBetween: 15,
            },
            767: {
                slidesPerView: 1,
                spaceBetween: 10,
            }
        }

    });


})