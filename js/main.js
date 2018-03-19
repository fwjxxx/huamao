
/*========================================= 加载插件 =========================================*/
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

/*========================================= 内部功能开始 =========================================*/
require(['jquery','pagination','upload'], function($) {
    // var httpurl = 'http://192.168.1.128:9090';
    var httpurl = 'http://192.168.1.11:7071';
    //获得token,userId
    var token = JSON.parse(localStorage.getItem("token"));
    var userId = JSON.parse(localStorage.getItem("id"));

    /*========================================= 取到链接串后面的参数 =========================================*/
    $.getUrlParam = function(name)
    {
        var reg = new RegExp("(^|&)"+name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r!=null) return unescape(r[2]); return null;
    }

    /*========================================= page分页功能 =========================================*/
    //page分页功能
    var pageModule = {
        pagenum: 0,
        pageInit:function (pagesum,pagenum,type,typeClass,datestr) {
            // console.log('fff'+pagesum+'ggg'+pagenum+"hhh"+type+"ttt"+typeClass+"nnn"+datestr);
            $('.page-list').pagination({
                pageCount: pagesum,
                current: pagenum,
                jump: true,
                coping: true,
                homePage: 1,
                endPage: pagesum,
                prevContent: '上页',
                nextContent: '下页',
                callback: function (api) {
                    pageModule.pagenum = api.getCurrent();
                    // console.log(typeClass);
                    if (typeClass === 'withdrawAuditing') {
                        cashManagement.withdrawAuditing(pageModule.pagenum,type);
                    } else if (typeClass === 'assetBalance') {
                        assetManagement.assetBalance(pageModule.pagenum,type,datestr);
                    } else if (typeClass === 'assetFlowLatinos') {
                        assetManagement.assetFlowLatinos(pageModule.pagenum,type,datestr);
                    } else if (typeClass === 'profitDetailsList') {
                        profitDetails.profitDetailsList(pageModule.pagenum);
                    } else if (typeClass === 'orderInfoList') {
                        orderinfo.orderInfoList(pageModule.pagenum,type,datestr);
                    }
                }
            });
            // pageModule.pagesum = 0;
        }
    };

    /*========================================= token信息查询 =========================================*/
    //获取token
    var tokenInfo = {
        //根据token获取用户信息，否则没有回到登录页面
        tokenVerification: function() {
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/sellUser/getSellUserInfo.do',
                data: {token: token},
                success: function(json) {
                    // console.log('遍历数据11', json);
                    if (json.code === 200) {
                        if (json.obj.userName === null) {
                            $('.user-admin').find('b').text('无名氏')
                        } else {
                            $('.user-admin').find('b').text(json.obj.userName)
                        }
                    } else if (json.code === 400) {
                        // alert(1)
                        localStorage.clear();
                        window.location.replace("login.html");
                    }
                },
                error: function() {}
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.info("网络出错1");
                // localStorage.clear();
                // window.location.replace("login.html");
            });
        },
        //退出登录
        loginOut: function() {
            $('#loginOut').on('click',function(){
                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: httpurl + '/sell_console/sellUser/loginOut.do',
                    data: {token: token},
                    success: function(json) {
                        // console.log('遍历数据', json);
                        if (json.code === 200) {
                            localStorage.clear();
                            window.location.replace("login.html");
                        }
                    },
                    error: function() {}
                });
            });
        },
        //token初始化
        tokenInit: function() {
            tokenInfo.tokenVerification();
            tokenInfo.loginOut();
        }
    };
    tokenInfo.tokenInit();


    /*========================================= 设置-更改密码 =========================================*/
    var passwordInfo = {
        //提示密码填写错误
        passwordRewrite: function() {
            $('#oldPassword').find('input').focus(function(){
                $('#oldPassword').find('b').text('')
            });
            $('#newPassword').find('input').focus(function(){
                $('#newPassword').find('b').text('')
            });
            $('#confirmPassword').find('input').focus(function(){
                $('#confirmPassword').find('b').text('')
            });
        },
        //密码更改
        passwordUpdata: function() {
            $('#passwordUpdata').on('click',function(){
                let oldPassword = $.trim($('#oldPassword').find('input').val());
                let newPassword = $.trim($('#newPassword').find('input').val());
                let confirmPassword = $.trim($('#confirmPassword').find('input').val());
                if (oldPassword.length == 0) {
                    $('#oldPassword').find('b').text('不能为空');
                } else if (newPassword.length == 0) {
                    $('#newPassword').find('b').text('不能为空');
                } else if (confirmPassword.length == 0) {
                    $('#confirmPassword').find('b').text('不能为空');
                } else if (newPassword != confirmPassword) {
                    $('#confirmPassword').find('b').text('两次不一致，请重新输入')
                } else {
                    $.ajax({
                        type: 'post',
                        dataType: 'json',
                        url: httpurl + '/sell_console/sellUser/updPwd.do',
                        data: {userId: userId, password: oldPassword, pwd: newPassword, token: token},
                        success: function(json) {
                            console.log('遍历数据', json);
                            if (json.code === 400) {
                                $('#oldPassword').find('b').text(json.msg)
                            } else if (json.code === 200) {
                                localStorage.clear();
                                window.location.replace("login.html");
                            } else if (json.code === 510) {
                                localStorage.clear();
                                window.location.replace("login.html");
                            }
                        },
                        error: function() {}
                    });
                }
            });
        },
        //密码更新初始化
        passwordInit: function() {
            passwordInfo.passwordRewrite();
            passwordInfo.passwordUpdata();
        }
    };
    passwordInfo.passwordInit();


    /*========================================= 店铺信息 =========================================*/
    //获取本地存储的id信息
    var essentialInfo = {
        imgUrl: '',
        //初始化基本信息
        basicInfo: function() {
            // console.log($('#shop-write-info').length)
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/shopInfo/showShop.do',
                data: {userId: userId, token: token},
                success: function(json) {
                    // console.log('遍历数据', json);
                    if (json.code === 200) {
                        if ($('.shop-write-info').length > 0) {
                            $('#shopName').val(json.obj.shopName);
                            $('#shopIntroduce').val(json.obj.shopDerive);
                            $('#shopTelephone').val(json.obj.phone);
                            $('#shopWechat').val(json.obj.shopWx);
                        };
                        $('#shop-name').text(json.obj.shopName);
                        $('#shop-desc').text(json.obj.shopDerive);
                        $('#followAttention').text(json.obj.attention);
                        if (json.obj.headImgUrl == null) {
                            $('.shop-img').find('img').attr('src','img/hm-pic/hm-01-cdf351ad8c.jpg');
                            $('#shop-picture').find('img').attr('src','img/hm-pic/hm-01-cdf351ad8c.jpg');
                        } else {
                            $('.shop-img').find('img').attr('src',json.obj.headImgUrl);
                            $('#shop-picture').find('img').attr('src',json.obj.headImgUrl);
                        }
                        essentialInfo.basicInfoModify();
                    }
                },
                error: function() {}
            });
        },
        //解除店铺信息可修改
        basicInfoModify: function() {
            $('#shop-info-modify').on('click',function(){
                //解除对文本框禁止输入
                $('.shop-write-info input').attr('disabled',false);
                $('.shop-write-info input').eq(0).focus();
                $('.shop-write-info input').addClass('shop-info-color');
                //解除对上传图片的禁止
                $('#js_uploadBtn').attr('disabled',false);
                $('.shop-img').find('p').text('现在可修改图片')
                //修改按钮禁止，提交按钮可用
                $('#shop-info-preserve').attr('disabled',false);
                $('#shop-info-preserve').removeClass('hold-info-but');
                $('#shop-info-modify').addClass('hold-info-but');
                $('#shop-info-modify').attr('disabled',true);
            });
            essentialInfo.imgUploadApi();
            essentialInfo.basicInfoSubmit();
        },
        //上传图片API
        imgUploadApi: function() {
            $("#js_uploadBtn").ajaxImageUpload({
                url: httpurl + '/sell_console/file/upload.do', //上传的服务器地址
                data: {userId: userId},
                success:function(data){
                    // console.log(data.url);
                    essentialInfo.imgUrl = data.url;
                    $('.shop-img').find('img').attr('src', data.url);
                },
                error:function (e) {
                    alert('上传失败回调函数');
                }
            });
        },
        //保存店铺信息
        basicInfoSubmit: function() {
            $('#shop-info-preserve').on('click',function(i){
                let shopName = $.trim($('#shopName').val());
                let shopIntroduce = $.trim($('#shopIntroduce').val());
                let shopTelephone = $.trim($('#shopTelephone').val());
                let shopWechat = $.trim($('#shopWechat').val());
                if (shopName.length == 0) {
                    $('.shop-info-form').find('b').eq(0).text('必填');
                } else if (shopTelephone.length == 0) {
                    $('.shop-info-form').find('b').eq(1).text('必填');
                } else {
                    // console.log(shopName+'--'+shopIntroduce+'--'+shopTelephone+'--'+shopWechat+'--'+userId+'--'+essentialInfo.imgUrl)
                    $.ajax({
                        type: 'post',
                        dataType: 'json',
                        url: httpurl + '/sell_console/shopInfo/updShop.do',
                        data: {userId: userId, shopName: shopName, shopDerive: shopIntroduce, phone: shopTelephone, shopWx: shopWechat, headImgUrl: essentialInfo.imgUrl, token: token},
                        success: function(json) {
                            // console.log('遍历数据', json);
                            if (json.code === 200) {
                                //修改按钮可用，提交按钮禁止
                                $('#shop-info-preserve').attr('disabled',true);
                                $('#shop-info-preserve').addClass('hold-info-but');
                                $('#shop-info-modify').removeClass('hold-info-but');
                                $('#shop-info-modify').attr('disabled',false);
                                //文本框禁止输入
                                $('.shop-write-info input').attr('disabled',true);
                                $('.shop-write-info input').removeClass('shop-info-color');
                                //上传图片的禁止
                                $('#js_uploadBtn').attr('disabled',true);
                                $('.shop-img').find('p').text('点击修改图片才可更换');
                                essentialInfo.basicInfo();
                            }
                        },
                        error: function() {}
                    });
                }
            });
        }
    };
    essentialInfo.basicInfo();

    
    /*========================================= 提现管理 =========================================*/
    var cashManagement = {
        sum: 0,
        rows: 10,
        type: 0,
        //提现申请，审核中，已通过，未通过
        cashNav: function() {
            $('.auditing-choice a').each(function(i) {
                $(this).on('click', function() {
                    $('.auditing-choice a').removeClass('active')
                    $(this).addClass('active');
                    let num = $('.auditing-choice a').index(this);
                    // console.log(num);
                    $('#cashAuditing #cashAuditing-box').removeClass('presell-open');
                    $('#cashAuditing #cashAuditing-box').addClass('presell-close');
                    $('#cashAuditing #cashAuditing-box').eq(num).removeClass('presell-close');
                    $('#cashAuditing #cashAuditing-box').eq(num).addClass('presell-open');
                    let page = 1;
                    if(num == 1){
                        cashManagement.type = 1
                        cashManagement.withdrawAuditing(page,cashManagement.type);
                    }else if(num == 2) {
                        cashManagement.type = 3
                        cashManagement.withdrawAuditing(page,cashManagement.type);
                    }else if(num == 3) {
                        cashManagement.type = 4
                        cashManagement.withdrawAuditing(page,cashManagement.type);
                    }
                });
            });
        },
        //提现信息提交
        withdrawCash:function () {
            //
            $('#withdrawBankCard').find('input').focus(function(){
                $('#withdrawBankCard').find('p').text('')
            });
            $('#withdrawUserName').find('input').focus(function(){
                $('#withdrawUserName').find('p').text('')
            });
            $('#withdrawMoney').find('input').focus(function(){
                $('#withdrawMoney').find('p').text('')
            });
            $('#withdrawSubmit').on('click',function(){
                let bankCard = $.trim($('#withdrawBankCard').find('input').val());
                let userName = $.trim($('#withdrawUserName').find('input').val());
                let money = $.trim($('#withdrawMoney').find('input').val());
                if (bankCard.length == 0) {
                    $('#withdrawBankCard').find('p').text('银行卡号不能为空');
                } else if (userName.length == 0 ) {
                    $('#withdrawUserName').find('p').text('姓名不能为空');
                } else if (money.length == 0) {
                    $('#withdrawMoney').find('p').text('金额不能为空');
                } else {
                    // alert(bankCard+'--'+userName+'--'+money)
                    $.ajax({
                        type: 'post',
                        dataType: 'json',
                        url: httpurl + '/sell_console/assetsOrder/AddOrder.do',
                        data: {userId: userId, token: token, userName: userName, bankNum: bankCard, moneyNum: money},
                        success: function(json) {
                            console.log('遍历数据', json);
                            if (json.code === 200) {
                                $('.withdrawals-write').find('p').text('')
                                $('#withdrawBankCard').find('input').val('')
                                $('#withdrawUserName').find('input').val('')
                                $('#withdrawMoney').find('input').val('')
                                alert(json.msg)
                            }
                        },
                        error: function() {}
                    });
                }
            });
        },
        //提现信息审核
        withdrawAuditing: function (pagenum,type) {
            let uid = '= '+userId;
            let typestr = '= '+type;
            let timestr = '';
            let link = "";
            let link1 = "";
            let link2 = "";
            let assetsType = "= 1";
            let orderType = "= 2";
            let creTime = 'order % creTime desc'
            let typeClass = 'withdrawAuditing';
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/assetsOrder/showOrder.do',
                data: {userId: uid, token: token, page: pagenum, rows: cashManagement.rows, type: typestr,assetsType: assetsType,orderType: orderType,creTime: creTime},
                success: function(json) {
                    // console.log('遍历数据', json);
                    cashManagement.sum = json.pages
                    $.each(json.rows, function(i, item) {
                        timestr = item.creTime.split(' ');
                        if (type === 1) {
                            link += '<tr><td>'+timestr[0]+'</td><td>'+item.userName+'</td><td>'+item.bankNum+'</td><td>'+item.moneyNum+'</td><td>'+item.orderPoundage+'</td></tr>';
                        } else if (type === 3) {
                            link += '<tr><td>'+item.id+'</td><td>'+timestr[0]+'</td><td>'+item.userName+'</td><td>'+item.bankNum+'</td><td>'+item.moneyNum+'</td><td>'+item.orderPoundage+'</td></tr>';
                        } else if (type === 4) {
                            link += '<tr><td>'+timestr[0]+'</td><td>'+item.userName+'</td><td>'+item.bankNum+'</td><td>'+item.moneyNum+'</td><td>'+item.orderPoundage+'</td><td>'+item.rejectReason+'</td></tr>';
                        }
                    });
                    if (type === 1) {
                        $('#cashAudit').html(link);
                    } else if (type === 3) {
                        $('#cashPassed').html(link);
                    } else if (type === 4) {
                        $('#notThrough').html(link);
                    }
                    pageModule.pageInit(cashManagement.sum,pagenum,type,typeClass);
                },
                error: function() {}
            });
        },
        //
        cashInit: function() {
            cashManagement.cashNav();
            cashManagement.withdrawCash();
        }
    };
    cashManagement.cashInit();

    
    /*========================================= 资产管理 =========================================*/
    var assetManagement = {
        sum: 0,
        rows: 5,
        type: '',
        assetId: 0,
        //余额转入 余额转出 权益增加 权益减少
        assetNav: function() {
            if ($('.balance-list').length > 0) {
                let page = 1;
                //余额转入,余额转出,权益增加,权益减少
                $('.balance-opt a').each(function(i) {
                    $(this).on('click', function() {
                        $('.balance-opt a').removeClass('active')
                        $(this).addClass('active');
                        var num = $('.balance-opt a').index(this);
                        // console.log(num)
                        $('.balance-list .balance-table').removeClass('balance-open');
                        $('.balance-list .balance-table').addClass('balance-close');
                        $('.balance-list .balance-table').eq(num).removeClass('balance-close');
                        $('.balance-list .balance-table').eq(num).addClass('balance-open');
                        if(num == 0){
                            assetManagement.type = 1;
                            assetManagement.assetBalance(page,assetManagement.type);
                        }else if(num == 1) {
                            assetManagement.type = 2;
                            assetManagement.assetBalance(page,assetManagement.type);
                        }else if(num == 2) {
                            assetManagement.type = '1,3';
                            assetManagement.assetFlowLatinos(page,assetManagement.type);
                        }else if(num == 3) {
                            assetManagement.type = '0,3';
                            assetManagement.assetFlowLatinos(page,assetManagement.type);
                        }else if(num == 4) {
                            assetManagement.type = '1,2';
                            assetManagement.assetFlowLatinos(page,assetManagement.type);
                        }else if(num == 5) {
                            assetManagement.type = '0,2';
                            assetManagement.assetFlowLatinos(page,assetManagement.type);
                        }
                    });
                });
                assetManagement.type = 1;
                assetManagement.assetBalance(page,assetManagement.type) 
            }
        },
        //可转余额,权益资产,流动资产
        assetMoney: function() {
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/assetsMoney/showAssets.do',
                data: {userId: userId, token: token},
                success: function(json) {
                    // console.log('遍历数据', json);
                    if (json.code === 200) {
                        assetManagement.assetId = json.obj.id;
                        $('#balanceOut').find('p').text(json.obj.availableMoney);
                        $('#equityAssets').find('p').text(json.obj.totleDmo);
                        $('#currentAssets').find('p').text(json.obj.totleFmo);
                        $('.withdrawals-text').find('p').text(json.obj.totleFmo);
                    }
                },
                error: function() {}
            });
        },
        //按时间查询余额转入 余额转出 权益增加 权益减少
        assetQuery:function() {
            $('#assetQueryBut').on('click',function(){
                let startDate = $("#startDate").val();
                let endDate = $("#endDate").val();
                let startNum = parseInt(startDate.replace(/-/g,''),10); 
                let endNum = parseInt(endDate.replace(/-/g,''),10); 
                if (startDate.length == 0) {
                    alert("开始时间不能为空！");
                    startDate.focus();
                } else if (endDate.length == 0) {
                    alert("结束时间不能为空！");
                    endDate.focus();
                } else if (startNum > endNum){ 
                    $("#startDate").val('');
                    $("#endDate").val('');
                    alert("结束时间不能在开始时间之前！"); 
                } else {
                    let num = '';
                    $('.balance-opt a').each(function(i) {
                        if ($(this).hasClass("active")){
                            num = $(this).attr('name');
                        }
                    });
                    let datestr = 'tewn '+startDate+','+endDate;
                    let page = 1;
                    if(num == 1){
                        assetManagement.type = 1;
                        assetManagement.assetBalance(page,assetManagement.type,datestr);
                    }else if(num == 2) {
                        assetManagement.type = 2;
                        assetManagement.assetBalance(page,assetManagement.type,datestr);
                    }else if(num == 3) {
                        assetManagement.type = '1,3';
                        assetManagement.assetFlowLatinos(page,assetManagement.type,datestr);
                    }else if(num == 4) {
                        assetManagement.type = '0,3';
                        assetManagement.assetFlowLatinos(page,assetManagement.type,datestr);
                    }else if(num == 5) {
                        assetManagement.type = '1,2';
                        assetManagement.assetFlowLatinos(page,assetManagement.type,datestr);
                    }else if(num == 6) {
                        assetManagement.type = '0,2';
                        assetManagement.assetFlowLatinos(page,assetManagement.type,datestr);
                    }
                    $("#startDate").val('');
                    $("#endDate").val('');
                }
            });
        },
        //余额转入，转出列表
        assetBalance:function(pagenum,type,datestr) {
            let uid = '= '+userId;
            let typestr = "= "+type;
            let timestr = '';
            let link = '';
            let operationType = '';
            // console.log('fff'+datestr)
            if (datestr == undefined) {
                datestr = 'order % happenTime desc';
            }
            let happenTime = datestr;
            let typeClass = 'assetBalance';
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/HmShopBalanceLog/shopBalance.do',
                data: {userId: uid, token: token, page: pagenum, type: typestr,happenTime: happenTime, rows: assetManagement.rows},
                success: function(json) {
                    // console.log('遍历数据', json);
                    assetManagement.sum = json.pages;
                    $.each(json.rows, function(i, item) {
                        if (item.operationType == 1) {
                            operationType = '回馈加款';
                        } else if (item.operationType == 2) {
                            operationType = '支出';
                        } else if (item.operationType == 3) {
                            operationType = '充值';
                        } else if (item.operationType == 4) {
                            operationType = '提现';
                        } else if (item.operationType == 5) {
                            operationType = '支付退款';
                        } else if (item.operationType == 6) {
                            operationType = '提现退款';
                        }
                        timestr = item.happenTime.split(' ');
                        link += '<tr><td>'+timestr[0]+'</td><td>'+item.amount+'</td><td>'+operationType+'</td></tr>';
                        // console.log('link='+link)
                    });
                    // console.log('link='+link)
                    // console.log('type='+type)
                    if (type === 1) {
                        $('#balanceInto').html(link)
                    } else if (type === 2) {
                        $('#balanceTurnOut').html(link)
                    }
                    pageModule.pageInit(assetManagement.sum,pagenum,type,typeClass,datestr);
                },
                error: function() {}
            });
        },
        //权益增加 权益减少 流动增加 流动减少
        assetFlowLatinos: function(pagenum,type,datestr) {
            let moneyId = '= '+assetManagement.assetId
            let typenum = type.split(',');
            let uid = '= '+userId;
            let flowStates = "= "+typenum[0];
            let typestr = "= "+typenum[1];
            let timestr = '';
            let businessType = '';
            // console.log('flowStates='+flowStates+'typestr='+typestr+'moneyId='+moneyId+'type='+type);
            let link = '';
            if (datestr == undefined) {
                datestr = 'order % updTime desc';
            }
            let updTime = datestr;
            let typeClass = 'assetFlowLatinos';
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/assetsTransactionRecord/AddProperty.do',
                data: {token: token, page: pagenum, flowStates: flowStates, type: typestr, rows: assetManagement.rows, moneyId: moneyId, updTime: updTime},
                success: function(json) {
                    // console.log('遍历数据', json);
                    assetManagement.sum = json.pages;
                    $.each(json.rows, function(i, item) {
                        timestr = item.updTime.split(' ');
                        if (item.businessType === 1111) {
                            businessType = '买入收益';
                        } else if (item.businessType === 2222) {
                            businessType = '返利收益';
                        } else if (item.businessType === 3333) {
                            businessType = '违约扣除';
                        } else if (item.businessType === 4444) {
                            businessType = '销售商品';
                        }
                        if (type === '1,3' || type === '0,3') {
                            link += '<tr><td>'+timestr[0]+'</td><td>'+item.flowDmo+'</td><td>'+businessType+'</td></tr>';
                        } else if (type === '1,2' || type === '0,2') {
                            link += '<tr><td>'+timestr[0]+'</td><td>'+item.flowFmo+'</td><td>'+businessType+'</td></tr>';
                        }
                    });
                    if (type === '1,3') {
                        $('#balanceIntoList').html(link)
                    } else if (type === '0,3') {
                        $('#balanceOutList').html(link);
                    } else if (type === '1,2') {
                        $('#flowIntoList').html(link);
                    } else if (type === '0,2') {
                        $('#flowOutList').html(link);
                    }
                    pageModule.pageInit(assetManagement.sum,pagenum,type,typeClass,datestr);
                },
                error: function() {}
            });
        },
        //
        assetInit: function() {
            assetManagement.assetNav();
            assetManagement.assetMoney();
            assetManagement.assetQuery();
        }
    };
    assetManagement.assetInit();


    /*========================================= 收益明细 =========================================*/
    var profitDetails = {
        rows: 10,
        sum: 0,
        price: 0,
        //收益明细列表
        profitDetailsList: function(pagenum) {
            let link = '';
            let rmb = 0;
            let type = '';
            let typeClass = 'profitDetailsList';
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/hmProductOrderItem/ShowOrderItem.do',
                data: {userId: userId, token: token, page: pagenum, rows: profitDetails.rows},
                success: function(json) {
                    // console.log('遍历数据', json);
                    profitDetails.sum = json.pages;
                    $.each(json.rows, function(i, item) {
                        rmb = item.totalprice - item.discountAmount;
                        profitDetails.price = Math.floor(item.totalprice * 0.1);
                        link += '<tr><td class="checkbox-lr"><input name="chkItem" type="checkbox" value='+item.orderId+'></td><td>'+item.orderId+'</td><td>'+item.quantitySum+'</td><td>'+item.finishTime+'</td><td>'+item.totalprice.toFixed(2)+'</td><td>'+item.discountAmount+'</td><td>'+rmb.toFixed(2)+'</td><td>'+profitDetails.price+'</td><td><a href="profit-detailed-1.html?id='+item.orderId+'" target="_blank">查看详情</a></td></tr>';
                    });

                    $('#profitDetailedList').html(link);

                    //选择单击收益明细
                    $('.hm-profit-detailed tbody input').each(function(i){
                        $(this).on('click',function(i){
                            if($(this).attr('checked') === 'checked'){
                                $(this).attr("checked", false);
                                $(this).prop("checked", false);
                            }else{
                                $(this).attr("checked", true);
                                $(this).prop("checked", true);
                            }
                        })
                    });
                    profitDetails.profitDetailsDel();
                    pageModule.pageInit(profitDetails.sum,pagenum,type,typeClass);
                },
                error: function() {}
            });
        },
        //收益明细详情内容
        profitDetailsShow: function() {
            let orderId = $.getUrlParam('id');
            if (orderId !== null){
                let orderinfo = '';
                let state = '';
                let consignee = '';
                let itemjson;
                let link = '';
                let type = '';
                let typeClass = 'profitDetailsList';
                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: httpurl + '/sell_console/hmProductOrderInfo/ShowOrderItemInfo.do',
                    data: {orderId: orderId, token: token},
                    success: function(json) {
                        // console.log('遍历数据', json);
                        if (json.code === 200) {
                            if (json.obj.payStatus == 1) {
                                state = '待付款';
                            } else if (json.obj.payStatus == 2) {
                                state = '已付款';
                            } else if (json.obj.payStatus == 3) {
                                state = '已发货';
                            } else if (json.obj.payStatus == 4) {
                                state = '已完成';
                            } else if (json.obj.payStatus == 0) {
                                state = '已取消';
                            }
                            orderinfo = '<li><span>订单编号：</span><strong>'+json.obj.orderId+'</strong></li><li><span>订单状态：</span><strong>'+state+'</strong></li><li><span>购买用户：</span><strong>'+json.obj.buyUserId+'</strong></li><li><span>支付时间：</span><strong>'+json.obj.create_time+'</strong></li><li><span>支付方式：</span><strong>'+json.obj.payment_id+'</strong></li><li><span>发货时间：</span><strong>'+json.obj.deliveryTime+'</strong></li><li><span>快递方式：</span><strong>'+json.obj.logisticsName+'</strong></li><li><span>快递单号：</span><strong>'+json.obj.logisticsId+'</strong></li><li><span>完成时间：</span><strong>'+json.obj.payfinishTime+'</strong></li>';

                            consignee = '<h4>收货人信息：</h4><p>姓名：<span>'+json.obj.consigneeName+'</span></p><p>手机号码：<span>'+json.obj.consigneePhone+'</span></p><p>详细地址：<span>'+json.obj.consigneeAddress+'</span></p>';
                            itemjson = JSON.parse(json.obj.itemjson)
                            // console.log(itemjson)
                            $.each(itemjson, function(i, item) {
                                link += '<tr><td>'+item.productName+'</td><td>'+item.productId+'</td><td>'+item.productModel+'</td><td>'+item.unitPrice+'</td><td>'+item.quantity+'</td><td>'+item.itemTotalPrice+'</td></tr>';
                            });

                            $('.order-info').html(orderinfo);
                            $('.buyers-message').find('p').text(json.obj.buyerRemark);
                            $('.buyers-address').html(consignee);
                            $('#shopInfoList').html(link);
                            $('.commodity-sum').find('b').text(json.obj.quantitySum);
                            $('.commodity-sum').find('strong').text(json.obj.totalprice.toFixed(2));
                            $('.commodity-assets').find('b').text(Math.floor(json.obj.totalprice * 0.1));

                        };
                    },
                    error: function() {}
                });
            }
        },
        //选择全部收益明细
        profitDetailsSelect: function() {
            $('#profitChoiceAll').on('click',function(i){
                if($('#profitChoiceAll').attr('checked') === 'checked'){
                    $('#profitChoiceAll').attr("checked", false);
                    $('.hm-profit-detailed tbody input').attr("checked", false);
                    $('.hm-profit-detailed tbody input').prop("checked", false);
                }else{
                    $('#profitChoiceAll').attr("checked", true);
                    $('.hm-profit-detailed tbody input').attr("checked", true);
                    $('.hm-profit-detailed tbody input').prop("checked", true);
                }
            });
        },
        //删除收益明细
        profitDetailsDel: function() {
            let selected = '';
            let str = [];
            $('#profitDetailedDel').on('click',function(){
                if ($('#profitDetailedList tr').find("[name = chkItem]:checked").length > 0) {
                    $('#profitDetailedList input').each(function(){
                        if($(this).attr('checked') === 'checked'){
                            selected += $(this).val()+',';
                            // str.push(selected)
                        }
                    });
                    selected = selected.substring(0, selected.length - 1);
                    // str = selected.split(",");
                    str.push(selected)
                    // console.log(str)
                    $.ajax({
                        type: 'post',
                        dataType: 'json',
                        url: httpurl + '/sell_console/hmProductOrderInfo/delOrderInfoAndItem.do',
                        data: {ids: str, token: token},
                        success: function(json) {
                            // console.log('数组',str)
                            // console.log('遍历数据', json);
                            if (json.code === 200) {
                                $('#profitDetailedList input').each(function(){
                                    if($(this).attr('checked') === 'checked'){
                                        $(this).parent().parent().remove();
                                    }
                                });
                                alert('删除成功')
                            } else {
                                alert('删除失败')
                            }
                        },
                        error: function() {}
                    });
                } else {
                    alert('请选择删除的收益明细')
                }
                str = [];
            });
        },
        //
        profitDetailsInit: function() {
            if ($('.hm-profit-detailed').length > 0) {
                let page = 1;
                profitDetails.profitDetailsList(page);
            }
            profitDetails.profitDetailsSelect();
            profitDetails.profitDetailsShow();
        }
    };
    profitDetails.profitDetailsInit();

    
    /*========================================= 快递公司 =========================================*/
    var expressBox = {
        //合作快递列表
        expressList: function() {
            let link = '';
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/hmShopLogistics/showLogistics.do',
                data: {userId: userId, token: token},
                success: function(json) {
                    // console.log('遍历数据', json);
                    if (json.code === 200) {
                        $.each(json.obj, function(i, item) {
                            link += '<li><label><input type="checkbox" value="'+item.id+'" name="expressItem"><span>'+item.logisticsName+'</span></label></li>';
                        });
                        $('#expressList').html(link);
                        expressBox.expressChoice();
                    }
                },
                error: function() {}
            });
        },
        //选择删除快递
        expressChoice: function(){
            //选择要删除的快递公司
            $('.express-list li').each(function(){
                $(this).unbind('click').bind('click', function(){
                    // alert(1)
                    if ($(this).find('input').attr("checked") === 'checked') {
                        // alert(1)
                        $(this).find('input').attr("checked", false);
                        $(this).find('input').prop("checked", false);
                    } else {
                        // alert(3)
                        $(this).find('input').attr("checked", true);
                        $(this).find('input').prop("checked", true);
                    }
                });
            });
        },
        //添加快递
        expressAdd: function() {
            //添加快递公司
            $('#expressAdd').on('click', function(event){
                let link = '';
                let title = $('#expressName').val();
                console.log(title)
                $.ajax({
                    type: 'post',
                    dataType: 'json',
                    url: httpurl + '/sell_console/hmShopLogistics/insertLogistics.do',
                    data: {shopItemId: userId, token: token, logisticsName: title},
                    success: function(json) {
                        // console.log('遍历数据', json);
                        if (json.code === 200) {
                            link = '<li><label><input type="checkbox" value="'+json.obj.id+'" name="expressItem"><span>'+json.obj.logisticsName+'</span></label></li>';
                            $('#expressName').val('');
                            $('.express-list ul').append(link);
                            alert('添加成功');
                            expressBox.expressChoice();
                        }
                    },
                    error: function() {}
                });
            });
        },
        //删除快递
        expressDel: function() {
            //删除快递公司
            $('#expressDel').on('click', function(){
                let delstr = '';
                let ids = [];
                if ($('.express-list li').find("[name = expressItem]:checked").length > 0) {
                    $('.express-list li').each(function(i) {
                        if ($(this).find("[name = expressItem]:checkbox").attr("checked") == 'checked') {
                            delstr +=  $(this).find("[name = expressItem]:checkbox").attr("value")+',';
                        }
                    });
                    delstr = delstr.substring(0, delstr.length - 1);
                    // str = selected.split(",");
                    ids.push(delstr);
                    // console.log(ids)
                    $.ajax({
                        type: 'post',
                        dataType: 'json',
                        url: httpurl + '/sell_console/hmShopLogistics/delLogistics.do',
                        data: {ids: ids, token: token},
                        success: function(json) {
                            // console.log('遍历数据', json);
                            if (json.code === 200) {
                                alert('删除成功');
                                expressBox.expressList();
                            } else {
                                alert('删除失败');
                            }
                        },
                        error: function() {}
                    });
                } else {
                    alert('请选择删除快递公司');
                }
            });
        },
        //
        expressInit: function() {
            expressBox.expressList();
            expressBox.expressAdd();
            expressBox.expressDel();
        }
    };
    expressBox.expressInit();

    
    /*========================================= 订单货品 =========================================*/
    var orderinfo = {
        rows: 5,
        //渲染订单列表API
        orderInfoList: function(pagenum,type,datestr) {
            let ordernum = '';
            let orderconsignee = '';
            let itemjson;
            let shop = '';
            let link = '';
            let statusstr = '';
            let buyerRemark = '';
            let typeClass = 'orderInfoList';
            let but = '';
            let str = [];
            let str1 = '';
            let str2 = '';
            let isvalid = '= 1';
            if (datestr !== undefined) {
                str = datestr.split(",");
                if (str[0].toString() == '')
                {
                    str1 = ''
                } else {
                    str1 = '= '+str[0].toString()
                    // console.log('orderId= '+str1)
                }
                if (str[1].toString() == '')
                {
                    str2 = ''
                } else {
                    str2 = '= '+str[1].toString()
                    // console.log('consigneeName= '+str2)
                }
            }
            
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/hmProductOrderInfo/ShowOrderInfo.do',
                data: {shopItemId: userId, isvalid: isvalid, token: token, page: pagenum, rows: orderinfo.rows, status: type, orderId: str1, consigneeName: str2},
                success: function(json) {
                    // console.log('遍历数据', json);
                    orderinfo.sum = json.pages;

                    $.each(json.rows, function(i, item) {
                        if (item.status === 0) {
                            statusstr = '已取消';
                        } else if (item.status === 1) {
                            statusstr = '待付款';
                        } else if (item.status === 2) {
                            statusstr = '已付款';
                        } else if (item.status === 3) {
                            statusstr = '已发货';
                        } else if (item.status === 4) {
                            statusstr = '已完成';
                        }

                        if (item.buyerRemark === null || item.buyerRemark === '') {
                            buyerRemark = '暂无留言';
                        } else {
                            buyerRemark = item.buyerRemark;
                        }

                        if (type === '') {
                            but = '';
                        } else if (type === '= 2') {
                            but = '<button id="order-goods" title='+item.orderId+'>发货</button>';
                        } else if (type === '= 3') {
                            but = '<button id="order-change-goods" title='+item.orderId+'>更改</button>';
                        } else if (type === '= 4') {
                            but = '';
                        }

                        ordernum = '<div class="order-list-box clear"><div class="order-top clear"><div class="order-number"><input type="checkbox" name="chkItem" value='+item.orderId+'><span>订单号：'+item.orderId+'</span></div><div class="order-but-group"><a href="order-details.html?id='+item.orderId+'" target="_blank">订单详情</a>'+but+'</div></div><div class="order-content clear">';
                        itemjson = JSON.parse(item.itemjson)
                        // console.log(itemjson)
                        $.each(itemjson, function(j, shopitem) {
                            shop += '<div class="orderlist clear"><div class="order-img"><img src="'+shopitem.picture+'" alt=""></div><div class="order-shop-info"><h2>'+shopitem.productName+'</h2><ul><li><p>商品编号：<span>'+shopitem.productId+'</span></p></li><li><p>规格型号：<span>'+shopitem.productColor+shopitem.productModel+'</span></p></li></ul></div><div class="order-message"><h4>数量：'+shopitem.quantity+'</h4></div><div class="order-buyers-info"><h4>价格：'+shopitem.unitTotalPrice+'</h4></div></div>';
                        });
                        orderconsignee = '<div class="orderconsignee"><div class="order-total"><span>状态：'+statusstr+'</span></div><div class="order-pay-time"><p><span>总价：'+item.totalprice.toFixed(2)+'</span><span>支付时间：'+item.payfinishTime+'</span></p></div><ul><li><p>收货人：<span>'+item.consigneeName+'</span></p></li><li><p>联系方式：<span>'+item.consigneePhone+'</span></p></li><li><p>详细地址：<span>'+item.consigneeAddress+'</span></p></li></ul><div class="order-buyers-message"><p>留言：'+buyerRemark+'</p></div></div></div></div>';
                        link += ordernum+shop+orderconsignee
                        shop = '';
                    });
                    $('.order-list').html(link);
                    orderinfo.orderDel();
                    orderinfo.orderSend();
                    pageModule.pageInit(orderinfo.sum,pagenum,type,typeClass,datestr);
                },
                error: function() {}
            });
        },
        //订单列表详情API
        orderDetails: function() {
            let orderId = $.getUrlParam('id');
            let consignee = '';
            let orderinfo = '';
            let itemjson;
            let link = '';
            let goodsSum = '';
            let assetsSum = '';
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/hmProductOrderInfo/ShowOrderItemInfo.do',
                data: {orderId: orderId, token: token},
                success: function(json) {
                    console.log('遍历数据', json.obj);
                    if (json.code === 200) {
                        // console.log('遍历数据', json.obj);
                        consignee = '<li><span>姓名：'+json.obj.consigneeName+'</span></li><li><span>电话：'+json.obj.consigneePhone+'</span></li><li><span>地址：'+json.obj.consigneeAddress+'</span></li>';

                        orderinfo = '<ul><li><span>订单编号：'+json.obj.orderId+'</span></li><li><span>订单状态：'+json.obj.payStatus+'</span></li><li><span>购买用户：'+json.obj.buyUserId+'</span></li><li><span>支付时间：'+json.obj.create_time+'</span></li><li><span>支付方式：'+json.obj.payment_id+'</span></li></ul><ul><li><span>发货时间：'+json.obj.deliveryTime+'</span></li><li><span>快递方式：'+json.obj.logisticsName+'</span></li><li><span>快递单号：'+json.obj.logisticsId+'</span></li><li><span>完成时间：'+json.obj.payfinishTime+'</span></li></ul>';

                        itemjson = JSON.parse(json.obj.itemjson)
                        // console.log(itemjson)
                        $.each(itemjson, function(i, item) {
                            link += '<tr><td>'+item.productName+'</td><td>'+item.productId+'</td><td>'+item.productModel+'</td><td>'+item.unitPrice+'</td><td>'+item.quantity+'</td><td>'+item.itemTotalPrice+'</td></tr>';
                        });

                        goodsSum = '<span>商品共计：'+json.obj.quantitySum+'</span><span>商品总价：'+json.obj.totalprice.toFixed(2)+'</span>';
                        assetsSum = '<span>权益类资产：'+Math.floor(json.obj.totalprice * 0.1)+'个</span>'

                        $('#orderDetailsConsignee').html(consignee)
                        $('.info-content').html(orderinfo);
                        $('.buyers-message').find('p').text(json.obj.buyerRemark);
                        $('#orderShopInfo').html(link);
                        $('#orderGoodsSum').html(goodsSum);
                        $('#orderAssetsSum').html(assetsSum);
                        link = '';
                    };
                },
                error: function() {}
            });
        },
        //查询订单列表选项
        orderQuery:function() {
            $('#orderSearchBut').on('click',function(){
                let seachOrderId = $("#seachOrderId").val();
                let seachOrderName = $("#seachOrderName").val();
                let datestr = '';
                let page = 1;
                let type = $.getUrlParam('status');
                if (seachOrderId.length == 0 && seachOrderName.length == 0) {
                    alert('请最少填写一个搜索内容');
                } else {
                    datestr = seachOrderId +','+seachOrderName
                    orderinfo.orderInfoList(page,type,datestr);
                    $("#seachOrderId").val('');
                    $("#seachOrderName").val('');
                }
            });
        },
        //弹出框样式，居中
        orderScroll:function() {
            var top = ($(window).height() - $('.order-pop-box').height())/2;  
            var left = ($(window).width() - $('.order-pop-box').width())/2; 
            // console.log('top='+$(document).scrollTop())  
            // console.log('left='+$(document).scrollLeft()) 
            var scrollTop = $(document).scrollTop();  
            var scrollLeft = $(document).scrollLeft();  
            $('.order-pop-box').css( { position : 'absolute', 'top' : top + scrollTop, left : left + scrollLeft } ).show();
        },
        //订单列表发货，更改
        orderSend:function() {
            let orderId = '';
            let expressName = '';
            let expressId = '';

            //订单列表 添加发货订单
            $('.hm-order-list #order-goods').each(function(i) {
                $(this).on('click', function() {
                    orderinfo.orderScroll();
                    $('.order-mask').removeClass('order-close');
                    // console.log($(this).attr('title'));
                    orderId = $(this).attr('title')
                });
            });

            //订单列表 更改发货订单 
            $('.hm-order-list #order-change-goods').each(function(i) {
                $(this).on('click', function() {
                    orderinfo.orderScroll();
                    $('.order-mask').removeClass('order-close');
                    orderId = $(this).attr('title')
                    // console.log(orderId);
                    orderinfo.orderExpressInfo(orderId);
                });
            });

            //选择发货快递列表
            $('.express-title-choice').on('click', function() {
                $('.express-title-list').toggle();
                orderinfo.orderExpress();
            });

            //订单列表 关闭发货订单
            $('#order-cancel').on('click', function() {
                $('.order-mask').addClass('order-close');
                $('#express-company').html('');
                $('#orderShopExpressId').val('');
            });

            $('#orderShopAddConfirm').on('click',function(){
                expressName = $('#express-company').text()
                expressId = $('#orderShopExpressId').val();
                if (expressName == '' || expressId.length == 0) {
                    alert('发货快递和发货单号必填');
                } else {
                    // console.log('id='+orderId+'邮政公司='+expressName+'邮政编号='+expressId)
                    orderinfo.orderAddGoods(orderId,expressName,expressId)
                }
            });
            $('#orderShopUpdateConfirm').on('click',function(){
                expressName = $('#express-company').text()
                expressId = $('#orderShopExpressId').val();
                if (expressName == '' || expressId.length == 0) {
                    alert('发货快递和发货单号必填');
                } else {
                    // console.log('id1='+orderId+'邮政公司1='+expressName+'邮政编号1='+expressId)
                    orderinfo.orderUpdataGoods(orderId,expressName,expressId)
                }
            });
        },
        //订单发货快递公司，快递单号API
        orderExpressInfo:function(orderId) {
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/hmProductOrderInfo/ShowOrderItemInfo.do',
                data: {orderId: orderId, token: token},
                success: function(json) {
                    // console.log('遍历数据', json);
                    if (json.code === 200) {
                        $('#express-company').html(json.obj.logisticsName);
                        $('#orderShopExpressId').val(json.obj.logisticsId);
                    }
                },
                error: function() {}
            });
        },
        //订单发货选择发货快递公司API
        orderExpress:function() {
            let link = ''
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/hmShopLogistics/showLogistics.do',
                data: {userId: userId, token: token},
                success: function(json) {
                    // console.log('遍历数据', json);
                    if (json.code === 200) {
                        $.each(json.obj, function(i, item) {
                            link += '<li>'+item.logisticsName+'</li>';
                        });
                        $('.express-title-list').html(link);
                        orderinfo.orderChoice();
                    }
                },
                error: function() {}
            });
        },
        //添加快递API
        orderAddGoods:function(orderId,expressName,expressId) {
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/hmProductOrderInfo/updOrderInfo.do',
                data: {orderId: orderId, logisticsName: expressName, logisticsId: expressId, token: token},
                success: function(json) {
                    // console.log('遍历数据', json);
                    if (json.code === 200) {
                        $('.order-list input').each(function(){
                            if($(this).val() === orderId){
                                $(this).parent().parent().parent().remove();
                            }
                        });
                        $('.order-mask').addClass('order-close');
                    } else {
                        alert('添加失败');
                    }
                },
                error: function() {}
            });
        },
        //修改快递API
        orderUpdataGoods:function(orderId,expressName,expressId) {
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/hmProductOrderInfo/updOrderInfo.do',
                data: {orderId: orderId, logisticsName: expressName, logisticsId: expressId, token: token},
                success: function(json) {
                    // console.log('遍历数据', json);
                    if (json.code === 200) {
                        $('.order-mask').addClass('order-close');
                    } else {
                        alert('添加失败');
                    }
                },
                error: function() {}
            });
        },
        //删除订单API
        orderDel:function() {
            let selected = '';
            let str = [];

            //选择单击订单
            $('.order-list input').each(function(i){
                $(this).on('click',function(i){
                    if($(this).attr('checked') === 'checked'){
                        $(this).attr("checked", false);
                        $(this).prop("checked", false);
                    }else{
                        $(this).attr("checked", true);
                        $(this).prop("checked", true);
                    }
                })
            });

            //删除订单
            $('#orderListDel').on('click',function(){
                if ($('.order-list .order-list-box').find("[name = chkItem]:checked").length > 0) {
                    $('.order-list input').each(function(){
                        if($(this).attr('checked') === 'checked'){
                            selected += $(this).val()+',';
                        }
                    });
                    selected = selected.substring(0, selected.length - 1);
                    // str = selected.split(",");
                    str.push(selected)
                    console.log(str)
                    selected = '';
                    
                    $.ajax({
                        type: 'post',
                        dataType: 'json',
                        url: httpurl + '/sell_console/hmProductOrderInfo/delOrderInfoAndItem.do',
                        data: {ids: str, token: token},
                        success: function(json) {
                            // console.log('数组',str)
                            // console.log('遍历数据', json);
                            if (json.code === 200) {
                                $('.order-list input').each(function(){
                                    if($(this).attr('checked') === 'checked'){
                                        $(this).parent().parent().parent().remove();
                                    }
                                });
                                alert('删除成功')
                            } else {
                                alert('删除失败')
                            }
                        },
                        error: function() {}
                    });
                } else {
                    alert('请选择删除的收益明细')
                }
                str = [];

            });
        },
        //选择要删除的订单
        orderChoice:function () {
            $('.express-title-list li').each(function(i) {
                $(this).on('click', function() {
                    var name = $(this).text();
                    // console.log(name);
                    $(this).parent().parent().find('#express-company').text(name);
                });
            });
        },
        //订单初始化
        orderInfoInit: function() {
            if ($('.hm-order-list').length > 0) {
                let page = 1;
                let type = $.getUrlParam('status');
                // console.log(type)
                orderinfo.orderInfoList(page,type);
            };
            if ($('.essential-buyer-info').length > 0) {
                orderinfo.orderDetails();
            };
            orderinfo.orderQuery();
        }

    };
    orderinfo.orderInfoInit();

    
    /*========================================= 预售品管理 =========================================*/

    var presellInfo = {
        rows: 10,
        presellAdminShow:function (pagenum,type) {
            let link = '';
            let typeClass = 'orderInfoList';
            let isvalid = '= '+type;
            
            $.ajax({
                type: 'post',
                dataType: 'json',
                url: httpurl + '/sell_console/hmPresellInfo/showPresellInfo.do',
                data: {shopItemId: userId, bookType: isvalid, token: token, page: pagenum, rows: presellInfo.rows},
                success: function(json) {
                    console.log('遍历数据', json);

                    // orderinfo.sum = json.pages;

                    // $.each(json.rows, function(i, item) {
                    //     if (item.status === 0) {
                    //         statusstr = '已取消';
                    //     } else if (item.status === 1) {
                    //         statusstr = '待付款';
                    //     } else if (item.status === 2) {
                    //         statusstr = '已付款';
                    //     } else if (item.status === 3) {
                    //         statusstr = '已发货';
                    //     } else if (item.status === 4) {
                    //         statusstr = '已完成';
                    //     }

                    //     if (item.buyerRemark === null || item.buyerRemark === '') {
                    //         buyerRemark = '暂无留言';
                    //     } else {
                    //         buyerRemark = item.buyerRemark;
                    //     }

                    //     if (type === '') {
                    //         but = '';
                    //     } else if (type === '= 2') {
                    //         but = '<button id="order-goods" title='+item.orderId+'>发货</button>';
                    //     } else if (type === '= 3') {
                    //         but = '<button id="order-change-goods" title='+item.orderId+'>更改</button>';
                    //     } else if (type === '= 4') {
                    //         but = '';
                    //     }

                    //     ordernum = '<div class="order-list-box clear"><div class="order-top clear"><div class="order-number"><input type="checkbox" name="chkItem" value='+item.orderId+'><span>订单号：'+item.orderId+'</span></div><div class="order-but-group"><a href="order-details.html?id='+item.orderId+'" target="_blank">订单详情</a>'+but+'</div></div><div class="order-content clear">';
                    //     itemjson = JSON.parse(item.itemjson)
                    //     // console.log(itemjson)
                    //     $.each(itemjson, function(j, shopitem) {
                    //         shop += '<div class="orderlist clear"><div class="order-img"><img src="'+shopitem.picture+'" alt=""></div><div class="order-shop-info"><h2>'+shopitem.productName+'</h2><ul><li><p>商品编号：<span>'+shopitem.productId+'</span></p></li><li><p>规格型号：<span>'+shopitem.productColor+shopitem.productModel+'</span></p></li></ul></div><div class="order-message"><h4>数量：'+shopitem.quantity+'</h4></div><div class="order-buyers-info"><h4>价格：'+shopitem.unitTotalPrice+'</h4></div></div>';
                    //     });
                    //     orderconsignee = '<div class="orderconsignee"><div class="order-total"><span>状态：'+statusstr+'</span></div><div class="order-pay-time"><p><span>总价：'+item.totalprice.toFixed(2)+'</span><span>支付时间：'+item.payfinishTime+'</span></p></div><ul><li><p>收货人：<span>'+item.consigneeName+'</span></p></li><li><p>联系方式：<span>'+item.consigneePhone+'</span></p></li><li><p>详细地址：<span>'+item.consigneeAddress+'</span></p></li></ul><div class="order-buyers-message"><p>留言：'+buyerRemark+'</p></div></div></div></div>';
                    //     link += ordernum+shop+orderconsignee
                    //     shop = '';
                    // });
                    // $('.order-list').html(link);
                    // orderinfo.orderDel();
                    // orderinfo.orderSend();
                    // pageModule.pageInit(orderinfo.sum,pagenum,type,typeClass,datestr);
                },
                error: function() {}
            });
        },
        presellInit:function() {
            let page = 1;
            let type = 1;
            presellInfo.presellAdminShow(page,type);
        }
    };
    presellInfo.presellInit();

    $('#presell-profits-input').keyup(function() {
        var tmptxt = $(this).val();
        var reg = /^90$|^([1-3]\d)$|^\d?$/;
        if( !reg.test(tmptxt)){
            $(this).val('');
            $('#presell-num').text('请输入0-90的数字');
        } else{
            $('#presell-num').text('');
        }
    })

    //弹出框样式，居中
    var presellScroll = function() {
        var top = ($(window).height() - $('.order-pop-box').height())/2;  
        var left = ($(window).width() - $('.order-pop-box').width())/2; 
        // console.log('top='+$(document).scrollTop())  
        // console.log('left='+$(document).scrollLeft()) 
        var scrollTop = $(document).scrollTop();  
        var scrollLeft = $(document).scrollLeft();  
        $('.order-pop-box').css( { position : 'absolute', 'top' : top + scrollTop, left : left + scrollLeft } ).show();
        $('.presell-pop-box').css( { position : 'absolute', 'top' : top + scrollTop, left : left + scrollLeft } ).show();
    }

    presellScroll();
    //订单列表 添加发货订单
    $('.hm-presell-purchaser #feedback-goods').each(function(i) {
        $(this).on('click', function() {
            orderinfo.orderScroll();
            $('.order-mask').removeClass('order-close');
            // console.log($(this).attr('title'));
            orderId = $(this).attr('title')
        });
    });

    //订单列表 更改发货订单 
    $('.hm-presell-purchaser #feedback-liquidation').each(function(i) {
        $(this).on('click', function() {
            orderinfo.orderScroll();
            $('.presell-mask').removeClass('order-close');
            orderId = $(this).attr('title')
            // console.log(orderId);
            // orderinfo.orderExpressInfo(orderId);
        });
    });

    //选择发货快递列表
    $('.express-title-choice').on('click', function() {
        $('.express-title-list').toggle();
        // orderinfo.orderExpress();
    });

    //订单列表 关闭发货订单
    $('#order-cancel').on('click', function() {
        $('.order-mask').addClass('order-close');
        // $('#express-company').html('');
        // $('#orderShopExpressId').val('');
    });

    //订单列表 关闭发货订单
    $('#presell-cancel').on('click', function() {
        $('.presell-mask').addClass('order-close');
        // $('#express-company').html('');
        // $('#orderShopExpressId').val('');
    });

    //回馈列表
    $('.purchaser-balance-list').on('click',function(){
        $('#purchaser-list-version').toggle();
        $('#purchaser-list-version li').each(function(){
            $(this).on('click',function(){
                $('.purchaser-balance-list span').text($(this).text());
                console.log($(this).text())
            });
        });
    });
    //预售品数量
    $('.presell-num-list').on('click',function(){
        $('#presell-list-version').toggle();
        $('#presell-list-version li').each(function(){
            $(this).on('click',function(){
                $('.presell-num-list span').text($(this).text());
            });
        });
    });
    //预售品平台让利
    $('#presell-profits-input').keyup(function() {
        // $('#presell-profits-input').val('');
        if ($(this).val() === '') {
            $('.presell-profits b').text('10');
        } else {
            let a = parseInt($(this).val()) + 10;
            $('.presell-profits b').text(a);
        }
    });
    //审核中 预售中 待回馈 回馈中 已结束 未通过
    $('.auditing-choice a').each(function(i) {
        $(this).on('click', function() {
            $('.auditing-choice a').removeClass('active')
            $(this).addClass('active');
            var num = $('.auditing-choice a').index(this);
            $('.hm-presell-list .presell-table').removeClass('presell-open');
            $('.hm-presell-list .presell-table').addClass('presell-close');
            $('.hm-presell-list .presell-table').eq(num).removeClass('presell-close');
            $('.hm-presell-list .presell-table').eq(num).addClass('presell-open');
        });
    });

    
    /*========================================= 导航栏功能 =========================================*/
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

    
    /*========================================= 商品管理 =========================================*/
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
    //商品管理 选择状态 上下架
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
    //全部选择商品
    $('#shopChoiceAll').on('click',function(i){
        if($('#shopChoiceAll').attr('checked') === 'checked'){
            $('#shopChoiceAll').attr("checked", false);
            $('.hm-shop-list tbody input').attr("checked", false);
            $('.hm-shop-list tbody input').prop("checked", false);
        }else{
            $('#shopChoiceAll').attr("checked", true);
            $('.hm-shop-list tbody input').attr("checked", true);
            $('.hm-shop-list tbody input').prop("checked", true);
        }
    });
    //单击选择商品
    $('.hm-shop-list tbody input').each(function(i){
        $(this).on('click',function(i){
            if($(this).attr('checked') === 'checked'){
                $(this).attr("checked", false);
                $(this).prop("checked", false);
            }else{
                $(this).attr("checked", true);
                $(this).prop("checked", true);
            }
        })
    });


    /*========================================= 添加商品 =========================================*/
    //添加商品规格
    $('#shopSpecAdd').on('click',function(i){
        let str = '<tr><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td><td><button>删除</button></td></tr>';
        $('.shop-spec-right tbody').append(str);
        shopSpecDel();
    });
    //删除商品规格
    var shopSpecDel = function(){
        $('.shop-spec-right tbody tr').each(function(i){
            $(this).find("button").on('click',function(){
                $(this).parent().parent().remove('.shop-spec-right tbody tr');
            });
        });
    };
    shopSpecDel();

});