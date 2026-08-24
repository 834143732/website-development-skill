// 定义 isTouchDevice 函数
window.isTouchDevice = function() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
};

// 定义 dg 类
class dg {
    constructor() {
        if (!window.isTouchDevice()) {
            this.run(document);
        }
    }

    run(e) {
        const elements = e.querySelectorAll("[data-hover-animation]");
        elements.forEach(element => {
            const target = element.querySelector("[data-hover-animation-target]");
            if (target) {
                this.setupAnimation(target, element);
            }
        });
    }

    setupAnimation(target, element) {
        gsap.set(target, {
            display: "inline-flex",
            position: "relative",
            overflow: "hidden",
            lineHeight: 1.3
        });

        if (!element.getAttribute("aria-label")) {
            element.setAttribute("aria-label", target.textContent);
        }

        const content = target.innerHTML;
        target.innerHTML = "";

        const firstSpan = this.createSpan(content, "data-hover-animation-first-el");
        const secondSpan = this.createSpan(content, "data-hover-animation-second-el");

        target.appendChild(firstSpan);
        target.appendChild(secondSpan);

        const transformValue = element.getAttribute("data-move-horizontal") ? "translateX(-150%)" : "translateY(150%)";
        gsap.set(secondSpan, {
            position: "absolute",
            top: 0,
            left: 0,
            transform: transformValue
        });

        element.addEventListener("mouseenter", () => this.hover_animation(element));
        element.addEventListener("touchstart", () => this.hover_animation(element));
    }

    createSpan(content, attribute) {
        const span = document.createElement("span");
        span.setAttribute(attribute, "");
        span.setAttribute("aria-hidden", "true");
        span.innerHTML = content;
        return span;
    }

    hover_animation(element) {
        const firstElements = element.querySelectorAll("[data-hover-animation-first-el]");
        const secondElements = element.querySelectorAll("[data-hover-animation-second-el]");

        const isHorizontal = element.getAttribute("data-move-horizontal");
        const animationProps = isHorizontal ? { x: "0%", opacity: 1 } : { y: "0%", opacity: 1 };
        const animationToProps = isHorizontal ? { x: "-105%", opacity: 0 } : { y: "-105%", opacity: 0 };
        const secondAnimationProps = isHorizontal ? { x: "105%" } : { y: "105%" };
        const secondAnimationToProps = isHorizontal ? { x: "0%" } : { y: "0%" };

        gsap.fromTo(firstElements, animationProps, {
            ...animationToProps,
            duration: 0.4,
            ease: "expo.inout"
        });

        gsap.fromTo(secondElements, secondAnimationProps, {
            ...secondAnimationToProps,
            duration: 0.4,
            ease: "linkhover"
        });
    }
}

// 实例化 dg 类
document.addEventListener("DOMContentLoaded", () => {
    new dg();
});

/* ***************
  * 检查元素是否存在
  * @param selector : 选择器
  * 如果有则返回 true
  *************** */
$.exists = function(selector) {
    return $(selector).length > 0;
}

/* Text Effect Animation */
function initTextEffectAnimation() {
    const animatedElements = document.querySelectorAll(".text-anime");

    animatedElements.forEach(element => {
        const staggerAmount = element.getAttribute("data-stagger") || 0.05;
        const translateXValue = element.getAttribute("data-translateX") || 20;
        const translateYValue = element.getAttribute("data-translateY") || false;
        const onScrollValue = element.getAttribute("data-on-scroll") || 1;
        const delayValue = element.getAttribute("data-delay") || 0.5;
        const easeType = element.getAttribute("data-ease") || "power2.out";

        const splitText = new SplitType(element, { type: "chars, words" });

        const animationProps = {
            duration: 1,
            delay: delayValue,
            autoAlpha: 0,
            stagger: staggerAmount,
            ease: easeType
        };

        if (onScrollValue == 1) {
            animationProps.scrollTrigger = { trigger: element, start: "top 85%" };
        }

        if (translateXValue && !translateYValue) {
            animationProps.x = translateXValue;
        } else if (translateYValue && !translateXValue) {
            animationProps.y = translateYValue;
        } else if (translateXValue && translateYValue) {
            animationProps.x = translateXValue;
            animationProps.y = translateYValue;
            animationProps.duration = 3;
        } else {
            animationProps.x = 50;
        }

        gsap.from(splitText.chars, animationProps);
    });
}

if ($('.text-anime').length) {
    initTextEffectAnimation();
}

if ($('.picture').length) {
    $(function () {
        const $window = $(window);
        let f = true;
        if ($window.width() > 990) {
            $window.scroll(function () {
                const scrollTop = $(document).scrollTop();
                const h = $('.picture').height() - 120;
                if (scrollTop > 0 && f) {
                    $("html, body").animate({
                        scrollTop: h
                    }, {
                        duration: 800,
                        easing: "swing"
                    });
                    f = false;
                }
            });
        }
    });
}

if ($('[text-split]').length) {
    gsap.registerPlugin(ScrollTrigger);

    window.addEventListener("DOMContentLoaded", (event) => {
    
      // Split text into spans
      let typeSplit = new SplitType("[text-split]", {
        types: "words, chars",
        tagName: "span"
      });
    
      // Link timelines to scroll position
      function createScrollTrigger(triggerElement, timeline) {
        // Reset tl when scroll out of view past bottom of screen
        ScrollTrigger.create({
          trigger: triggerElement,
          start: "top bottom",
          onLeaveBack: () => {
            timeline.progress(0);
            timeline.pause();
          }
        });
        // Play tl when scrolled into view (60% from top of screen)
        ScrollTrigger.create({
          trigger: triggerElement,
          start: "top 60%",
          onEnter: () => timeline.play()
        });
      }
      
      $("[words-slide-up]").each(function (index) {
        let tl = gsap.timeline({ paused: true });
        tl.from($(this).find(".word"), { opacity: 0, yPercent: 100, duration: 0.6, ease: "back.out(2)", stagger: { amount: 0.5 } });
        createScrollTrigger($(this), tl);
      });
      
      $("[letters-fade-in]").each(function (index) {
        let tl = gsap.timeline({ paused: true });
        tl.from($(this).find(".char"), { opacity: 0, duration: 0.5, ease: "power1.out", stagger: { amount: 0.8 } });
        createScrollTrigger($(this), tl);
      });
      
        $("[words-slide-from-right]").each(function (index) {
        let tl = gsap.timeline({ paused: true });
        tl.from($(this).find(".word"), { opacity: 0, x: "1em", duration: 0.8, ease: "power2.out", stagger: { amount: 0.2 } });
        createScrollTrigger($(this), tl);
      });
      
       $("[letters-slide-up]").each(function (index) {
        let tl = gsap.timeline({ paused: true });
        tl.from($(this).find(".char"), { opacity: 0, yPercent: 100, duration: 0.2, ease: "power1.out", stagger: { amount: 0.6 } });
        createScrollTrigger($(this), tl);
      });
      
        $("[letters-fade-in-random]").each(function (index) {
        let tl = gsap.timeline({ paused: true });
        tl.from($(this).find(".char"), { opacity: 0, duration: 0.05, ease: "power1.out", stagger: { amount: 0.4, from: "random" } });
        createScrollTrigger($(this), tl);
      });
      
        $("[scrub-each-word]").each(function (index) {
        let tl = gsap.timeline({
          scrollTrigger: {
            trigger: $(this),
            start: "top 90%",
            end: "top center",
            scrub: true
          }
        });
        tl.from($(this).find(".word"), { opacity: 0.2, duration: 0.2, ease: "power1.out", stagger: { each: 0.4 } });
      });
      // Avoid flash of unstyled content
      gsap.set("[text-split]", { opacity: 1 });
    });
}

// 手风琴切换
(function($) {
    $.fn.jobListToggle = function(options) {
        var settings = $.extend({
            parentSelector: '.dt',
            triggerSelector: '.zdax', 
            childSelector: '.wehha-job',
            activeClass: 'active',
            iconOpenClass: 'icon-jianhao',
            iconCloseClass: 'icon-jiahao',
            slideDuration: 300
        }, options);

        return this.each(function() {
            var $jobList = $(this);
            var $parent = $jobList.find(settings.parentSelector);
            var $child = $jobList.find(settings.childSelector);
            var $trigger = settings.triggerSelector ? $jobList.find(settings.triggerSelector) : $parent;

            // 默认初始化状态
            $child.slideUp();
            // $jobList.find("li").eq(0).find(settings.childSelector).slideDown(settings.slideDuration);
            //原来的
            // $jobList.find("li").eq(0).addClass(settings.activeClass).siblings().removeClass(settings.activeClass);
            //默认第一个不加active
            $jobList.find("li").eq(0).siblings().removeClass(settings.activeClass);
            // $jobList.find("li").eq(0).find(".iconfont").removeClass(settings.iconCloseClass).addClass(settings.iconOpenClass);

            $trigger.on('click', function(event) {
                // 定位到当前事件触发所在的 .dt 容器
                var $currentDt = $(this).closest(settings.parentSelector);
                var $targetChild = $currentDt.siblings(settings.childSelector);
                var $currentLi = $currentDt.parent("li");

                if ($targetChild.is(':hidden')) {
                    // 关闭其他展开项
                    $parent.siblings(settings.childSelector).slideUp(settings.slideDuration);
                    // 展开当前项
                    $targetChild.slideDown(settings.slideDuration);
                    
                    // 切换高亮 Class
                    $currentLi.addClass(settings.activeClass).siblings().removeClass(settings.activeClass);
                    
                    // 替换当前图标和其它同级图标类名
                    $currentDt.find(".iconfont").removeClass(settings.iconCloseClass).addClass(settings.iconOpenClass);
                    $currentLi.siblings("li").find(".iconfont").addClass(settings.iconCloseClass).removeClass(settings.iconOpenClass);
                } else {
                    // 收起当前项
                    $targetChild.slideUp(settings.slideDuration);
                    $currentDt.find(".iconfont").removeClass(settings.iconOpenClass).addClass(settings.iconCloseClass);
                    $currentLi.removeClass(settings.activeClass);
                }
                
                event.preventDefault();
                event.stopPropagation(); // 阻止冒泡，避免触发上层元素的点击事件
            });
        });
    };
})(jQuery);

function applyHoverEffect(targetSelector, offsetRange) {
    offsetRange = offsetRange || 10;
    $(targetSelector).on("mousemove", function (e) {
        var element = this;
        var boxW = $(element).outerWidth();
        var boxH = $(element).outerHeight();
        var x = (e.offsetX / boxW).toFixed(2) * 2 - 1; 
        var y = (e.offsetY / boxH).toFixed(2) * 2 - 1; 
        gsap.to(element, 0.4, {
            x: offsetRange * x,
            y: offsetRange * y,
            ease: "Power3.in"
        })
    });

    $(targetSelector).on("mouseleave", function (e) {
        var element = this;
        gsap.to(element, 0.4, {
            x: 0,
            y: 0,
            ease: "Power3.in"
        })
    });
} 
if ($('.more-xy').length) {
    applyHoverEffect(".more-xy");
}