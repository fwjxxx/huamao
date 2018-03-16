
/*========================================= 加载插件 =========================================*/
require.config({
  paths: {
      jquery: '../static/jquery/jquery.min'
  }
});
require(['jquery'], function($) {
  // var httpurl = 'http://192.168.1.128:9090';
  var httpurl = 'http://192.168.1.11:7071';

  /*========================================= login登录功能 =========================================*/
  var login = {
      img_id: '',
      //加载验证码
      loginCode: function() {
          let x = 10000;
          let y = 0;
          let timestamp = (new Date()).valueOf();
          let number = parseInt(Math.random() * (x - y + 1) + y);
          login.img_id = timestamp.toString() + number.toString();
          let imgsrc = httpurl + '/sell_console/imageCode/getImageCode.do?uid=' + login.img_id;
          login.loginCodeApi(login.img_id);
          $('.login-group-code').find('img').attr("src", imgsrc);
          login.loginApi(login.img_id);

          //换一下验证码
          $('#loginCode').on('click',function(){
              let x1 = 10000;
              let y1 = 0;
              let timestamp1 = (new Date()).valueOf();
              let number1 = parseInt(Math.random() * (x1 - y1 + 1) + y1);
              login.img_id = timestamp1.toString() + number1.toString();
              let imgsrc1 = httpurl + '/sell_console/imageCode/getImageCode.do?uid=' + login.img_id;
              login.loginCodeApi(login.img_id);
              $('.login-group-code').find('img').attr("src", imgsrc1);
              login.loginApi(login.img_id);
          });
      },
      //验证码接口传参
      loginCodeApi: function(img_id) {
            $.ajax({
                type: 'get',
                dataType: 'json',
                url: httpurl + '/sell_console/imageCode/getImageCode.do',
                data: {uid: img_id},
                success: function(json) {},
                error: function() {}
            })
      },
      //验证登录是否成功
      loginApi: function(img_id) {
          // console.log('遍历数据', img_id);
          $('#loginBut').on('click',function(){
                let name = $.trim($('#userName').val());
                let password = $.trim($('#password').val());
                let code = $.trim($('#code').val());
                if (name.length == 0 || password.length == 0 || code.length == 0) {
                    $('.login-warning').find('span').show();
                    $('.login-warning').find('span').text('输入框不能为空');
                } else {
                    $.ajax({
                        type: 'post',
                        dataType: 'json',
                        url: httpurl + '/sell_console/sellUser/login.do',
                        data: { userId: name, password: password, code: code, uid: img_id},
                        success: function(json) {
                            // console.log('遍历数据', json);
                            if (json.code === 200){
                                // alert('成功登陆')
                                var token = JSON.stringify(json.obj.token); //将JSON转为字符串存到变量里 
                                localStorage.setItem("token",token);//将变量存到localStorage里 
                                let userId = JSON.stringify(json.obj.userId); //将JSON转为字符串存到变量里
                                localStorage.setItem("id",userId);//将变量存到localStorage里 
                                window.location.replace("profit-detailed.html");
                                // window.history.forward(1);
                                // location.replace('profit-detailed.html');
                            }else if (json.code === 400) {
                                console.log('错误')
                                $('.login-warning').find('span').show();
                                $('.login-warning').find('span').text(json.msg);
                            }
                        },
                        error: function() {}
                    })
                }
      
          });
      },
  };
  login.loginCode();
});