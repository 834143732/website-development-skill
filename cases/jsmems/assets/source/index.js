$(function () {
    // 搜索点击切换类名
    $(".ds").click(function (e) {
        e.stopPropagation();
        changeClass(".searchbox", '.iconfont', 'icon-search', 'icon-guanbi')
    });
    changeElement("mouseenter", ".index_one .left ul li", ".index_one .right > div")

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
            renderBullet: function (index, className) {
                return '<span class="' + className + '">' + (index + 1) + "</span>";
            },
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
    var swiper = new Swiper('.list_about_three .swiper-container', {
        slidesPerView: 4,
        pagination: {
            el: ".list_about_three .swiper-pagination",
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
    var swiper = new Swiper('.list_about_four .swiper-container', {
        slidesPerView: 5,
        pagination: {
            el: ".list_about_four .swiper-pagination",
            clickable: true,
        },
        slidesPerColumnFill: 'row',
        slidesPerColumn: 2,
        breakpoints: {
            767: {
                slidesPerView: 3,
            }
        }

    })
    var swiper = new Swiper('.index_four .swiper-container', {
        slidesPerView: 5,
        pagination: {
            el: ".index_four .swiper-pagination",
            clickable: true,
        },
        loop: true,
        autoplay: true,
        slidesPerGroup: 5,
        speed: 1000,
        breakpoints: {
            767: {
                slidesPerView: 3,
                slidesPerGroup: 3,
            }
        }
    })

    var swiper = new Swiper('.list_news_one  .swiper-container', {
        pagination: {
            el: ".list_news_one  .swiper-pagination",
            clickable: true,
        },
        spaceBetween: 20,
        slidesPerView: 1,
    })

    $(".list_bdt >div").each(function () {
        var index = $(this).index() + 1;
        if (index % 2 == 0) {
            var swiper = new Swiper('.swiper_bdt' + index, {
                pagination: {
                    el: ".swiper_pag_bdt" + index,
                    clickable: true,
                },
                spaceBetween: 20,
                slidesPerView: 1,
                breakpoints: {
                    990: {
                        slidesPerView: 2,
                    },
                    767: {
                        slidesPerView: 1,
                    }
                }
            })
        } else {
            var swiper = new Swiper('.swiper_bdt' + index, {
                pagination: {
                    el: ".swiper_pag_bdt" + index,
                    clickable: true,
                },
                spaceBetween: 20,
                slidesPerView: 3,
                slidesPerGroup: 1,
                breakpoints: {
                    990: {
                        slidesPerView: 2,
                    }, 767: {
                        slidesPerView: 1,
                    }
                }
            })

        }

    })

    var swiper = new Swiper('.list_product  .swiper-container', {
        pagination: {
            el: ".list_product  .swiper-pagination",
            clickable: true,
        },
        spaceBetween: 20,
        slidesPerView: 1,
    })
    var swiper = new Swiper('.list_service  .swiper-container', {
        pagination: {
            el: ".list_service  .swiper-pagination",
            clickable: true,
        },
        spaceBetween: 20,
        slidesPerView: 1,
    })

    var swiper = new Swiper('.list_product_two  .swiper-container', {
        pagination: {
            el: ".list_product_two  .swiper-pagination",
            clickable: true,

        },
        spaceBetween: 20,
        slidesPerView: 1,
    })


    $(".index_one .right >div").each(function () {
        var index = $(this).index() + 1;
        var swiper = new Swiper('.index_swiper_two' + index, {
            pagination: {
                el: ".index_swiper_two_pag" + index,
                type: 'custom',
                renderCustom: function (swiper, current, total) {
                    // 格式化 current，如果小于 10 则在前面拼接 '0'
                    var formattedCurrent = current < 10 ? '0' + current : current;
                    var totalCurrent = total < 10 ? '0' + total : total;
                    return '<span class="aa">' + formattedCurrent + '</span>' + ' / ' + '<span class="bb">' + totalCurrent + '</span>'
                }
            },
            navigation: {
                nextEl: ".index_swiper_two_next" + index,
                prevEl: ".index_swiper_two_prev" + index,
            },
            loop: true,
            spaceBetween: 50,
            slidesPerView: 3,
            breakpoints: {
                1280: {
                    spaceBetween: 30,
                },
                767: {
                    spaceBetween: 15,
                    slidesPerView: 1,
                }
            }
        })

    })


    $('#footer_btn').click(function () {
        ksbm.common.tools.validate($('#footer_form'));
    })
    $('.zd_erha .aat_list li:nth-child(1)').on('click', function () {
        $(".pop_up").addClass("active")
    })
    $('.pop_up .close1').on('click', function () {
        $(".pop_up").removeClass("active")
    })


})