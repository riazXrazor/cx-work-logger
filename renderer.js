const moment = require('moment');
const Timer = require('easytimer.js');
const timerInstance = new Timer();

let logindata = window.localStorage.getItem('login-data');
if(logindata)
{
    let user = getLocalData().user;
    loadDashboard();

    $(".user-name").html(user.name);
    timerInstance.addEventListener('secondsUpdated', function (e) {
        let s = timerInstance.getTimeValues().toString().split(':');
        s.pop();
        $('.time').html(s.join(":"));
    
        let project = $("#project").val();

        let identifer = moment().format("YYYYMMDD")+'-'+user.id+'-'+project;
        console.log(s);
        window.localStorage.setItem(identifer,JSON.stringify(s));
    
    });

}
else
{
    $("#dashboard").addClass('hide');
    $("#login").removeClass('hide');
}

    $("#submit").on('click',function(){

        let email = $("#email").val();
        let password = $("#password").val();

            $.ajax({
                type: 'POST',
                url: "https://codelogicx-crm.track-progress.com/api/auth/login",
                data: {email : email,password: password},
                dataType: "JSON",
                success: function(resultData) { 
                    window.localStorage.setItem('login-data',JSON.stringify(resultData.data));
                    loadDashboard();
                 },
                error: function(e){
                    alert(e.responseJSON.status.message);
                }
            })
           
        
    });

    $("#email,#password").keyup(function(e){
        let code = e.keyCode;
        if(code == 13)
        {
            $("#submit").click();
        }
    });

    $("#logout").click(function(){
        window.localStorage.removeItem('login-data');
        timerInstance.stop();
        $("#cmn-toggle-4").prop('checked',false);
        $("#cmn-toggle-4").change();
        $("#dashboard").addClass('hide');
        $("#login").removeClass('hide');
    })

    $("#cmn-toggle-4").change(function(){

        if($(this).is(":checked"))
        {
            $(".time").removeClass('fade-time');
            $("#project").attr('disabled',true);
            $("#desc").attr('disabled',true);

            let project = $("#project").val();
            let user = getLocalData().user;
            let identifer = moment().format("YYYYMMDD")+'-'+user.id+'-'+project;
            let initaial = window.localStorage.getItem(identifer);
            if(initaial)
            {
                initaial = JSON.parse(initaial);
                initaial = parseInt(initaial[0]) * 60 * 60 + parseInt(initaial[1]) * 60
                timerInstance.start({precision : 'seconds',startValues: {seconds: initaial}});
            }
            else
            {
                timerInstance.start({precision : 'seconds'});
            }
        }
        else
        {
            $("#project").attr('disabled',false);
            $("#desc").attr('disabled',false);
            $(".time").addClass('fade-time');

            timerInstance.stop();
        }

    });
 

    function getMe()
    {
        return $.ajax({
                    type: 'GET',
                    url: "https://codelogicx-crm.track-progress.com/api/me",
                    dataType: "JSON",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader ("Authorization", "Bearer "+getLocalData().access_token);
                    }
                })
    }

    function getLocalData()
    {
        return JSON.parse(window.localStorage.getItem('login-data'))
    }

    function loadDashboard()
    {
        getMe().then(function(res){
            let html = '';
            res.data.projects.forEach(function(item){
                html += '<option value="'+ item.id +'">'+item.name+'</option>';
            })
    
            $("#project").html(html);
            $("#login").addClass('hide');
            $("#dashboard").removeClass('hide');
    
        })
        .catch(function(e){
            alert(e.responseJSON.status.message);
        });
    }
