

require.config({
    paths: {
        jquery: '../static/jquery/jquery.min',
        pagination: '../static/page//jquery.pagination',
        upload: '../static/upload'
    },
    shim: {
      bootstrap: {
        deps: ['jquery']
      },
      pagination: {
        deps: ['jquery']
      },
      upload: {
        deps: ['jquery']
      }
    }
});
require(['jquery','pagination','upload'], function($) {
    //导航栏功能
    $('.hm-nav .nav-list').each(function(i) {
        $(this).on('click', function() {
            $('.nav-close').removeClass('nav-open');
            $('.nav-close i').removeClass('icon-top');
            $('.nav-close i').addClass('icon-bottom');
            $(this).find(".nav-close").addClass('nav-open');
            $(this).find(".nav-close i").addClass('icon-top');
        });
    });

    $('.hm-order-list #order-goods').each(function(i) {
        $(this).on('click', function() {
            $('.order-mask').removeClass('order-close');
        });
    });

    $('.hm-order-list #order-change-goods').each(function(i) {
        $(this).on('click', function() {
            $('.order-mask').removeClass('order-close');
        });
    });

    $('#order-cancel').on('click', function() {
        $('.order-mask').addClass('order-close');
    });

    $('.express-title-choice').on('click', function() {
        $('.express-title-list').toggle();
    });

    $('.express-title-list li').each(function(i) {
        $(this).on('click', function() {
            var name = $(this).text();
            console.log(name);
            $(this).parent().parent().find('#express-company').text(name);
        });
    });

    //选择上架下架功能
    $('.hm-shop-list tbody tr').each(function(i) {
        $(this).find('.slider-select').on('click', function() {
            if($(this).hasClass('slider-open')) {
                $(this).removeClass('slider-open');
                $(this).addClass('slider-close');
            } else {
                $(this).removeClass('slider-close');
                $(this).addClass('slider-open');
            }
        });
    });

    $('.state-select').on('click', function() {
        $('#state-list').toggle();
    });

    $('#state-list li').each(function(i) {
        $(this).on('click', function() {
            var name = $(this).text();
            console.log(name);
            $(this).parent().parent().find('#state-text').text(name);
        });
    });

    $('.balance-opt a').each(function(i) {
        $(this).on('click', function() {
            $('.balance-opt a').removeClass('active')
            $(this).addClass('active');
            var num = $('.balance-opt a').index(this);
            $('.balance-list .balance-table').removeClass('balance-open');
            $('.balance-list .balance-table').addClass('balance-close');
            $('.balance-list .balance-table').eq(num).removeClass('balance-close');
            $('.balance-list .balance-table').eq(num).addClass('balance-open');
        });
    });

    //添加快递公司
    $('#expressAdd').on('click', function(){
        let title = $('#expressName').val();
        let str = '<li><label><input type="checkbox" name="expressItem"><span>'+ title +'</span></label></li>'
        $('#expressName').val('');
        $('.express-list ul').append(str)
        $('.express-list li').each(function(){
            $(this).on('click', function(){
                if ($(this).find('input').attr("checked") == 'checked') {
                    $(this).find('input').attr("checked", false);
                    $(this).find('input').prop("checked", false);
                } else {
                    $(this).find('input').attr("checked", true);
                    $(this).find('input').prop("checked", true);
                }
            });
        });
    });
    //删除快递公司
    $('#expressDel').on('click', function(){
        if ($('.express-list li').find("[name = expressItem]:checked").length > 0) {
            // setTimeout(function(){
                console.log($('.express-list li').length);
                $('.express-list li').each(function(i) {
                    // alert(3)
                    if ($(this).find("[name = expressItem]:checkbox").attr("checked") == 'checked') {
                        console.log($(this).find("span").text());
                        $(this).remove('li');
                    }
                });
            // },100);
        } else {
            alert('请选择删除快递公司');
        }
    });
    //page分页功能
    $('.page-list').pagination({
        pageCount: 50,
        jump: true,
        coping: true,
        homePage: 1,
        endPage: 50,
        prevContent: '上页',
        nextContent: '下页',
        callback: function (api) {
            var pagenum = api.getCurrent();
            console.log(pagenum)
        }
    });
    //上传图片
    $("#js_uploadBtn").ajaxImageUpload({
        url: 'http://192.168.1.128:7071/lb_console/file/upload.do', //上传的服务器地址
        // before: function () {
        //     alert('上传前回调函数');
        // },
        success:function(data){
            // alert('上传成功回调函数');
            console.log(data.url);
        },
        error:function (e) {
            alert(1)
            alert('上传失败回调函数');
            // console.log(e);
        }
    });
    // $('.page-list') 
    // $('.company-title').mouseenter(function() {
    //     $('.link-nav').show();
    // }).mouseleave(function() {
    //     $('.link-nav').hide();
    // });
    // $('.link-tg').mouseenter(function() {
    //     $('.link-nav-tg').show();
    // }).mouseleave(function() {
    //     $('.link-nav-tg').hide();
    // });
    // $('.hm-strategy li').each(function(i) {
    //     $(this).mouseenter(function() {
    //         $(this).find("img").addClass('wow swing');
    //         $(this).find("h3").addClass('wow flipInY');
    //         $(this).find("p").addClass('wow flipInY');
    //         new WOW().init();
    //     }).mouseleave(function() {
    //         $(this).find("img").removeClass('wow swing');
    //         $(this).find("h3").removeClass('wow flipInY');
    //         $(this).find("p").removeClass('wow flipInY');
    //     });
    // });
    // $('#character li').each(function(i) {
    //     $(this).find("button").on('click', function() {
    //         $(this).parent().find(".hm-labour").show();
    //     });
    //     $(this).find("i").on('click', function() {
    //         $(this).parent().parent().find(".hm-labour").hide();
    //     });
    // });
    // $(".weixin").mouseenter(function() {
    //     $('#hm-weixin').show();
    // }).mouseleave(function() {
    //     $('#hm-weixin').hide();
    // });
    // $(".app-down").mouseenter(function() {
    //     $('#hm-app').show();
    // }).mouseleave(function() {
    //     $('#hm-app').hide();
    // });
    // $(".picture-transparent").mouseenter(function() {
    //     $(this).stop().animate({ opacity: 1 }, 500);
    // }).mouseleave(function() {
    //     $(this).stop().animate({ opacity: 0.1 }, 500);
    // });
    // $('.business-picture .business-picture-info').each(function(i) {
    //     var j = 0;
    //     if (i == 1) {
    //         j = 2;
    //     } else if (i == 2) {
    //         j = 1;
    //     } else {
    //         j = 0;
    //     }
    //     $(this).mouseenter(function() {
    //         $('.picture-transparent').eq(j).stop().animate({ opacity: 1 }, 500);
    //     }).mouseleave(function() {
    //         $('.picture-transparent').eq(j).stop().animate({ opacity: 0.1 }, 500);
    //     });
    // });
});