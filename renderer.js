const {ipcRenderer} = require('electron')
const moment = require('moment');
const Timer = require('easytimer.js');
const timerInstance = new Timer();
const sendToServer = 30*60;
const projectsList = {};

setInterval(function(){
    if(online())
    {
        if($("#connection-status i").hasClass('offline')) $("#connection-status i").removeClass('offline');         
            $("#connection-status i").addClass('online')

    }
    else
    {
        if($("#connection-status i").hasClass('online')) $("#connection-status i").removeClass('online'); 
            $("#connection-status i").addClass('offline')
    }


            let sd = getLastEntryData();
                if(sd && !$.isEmptyObject(projectsList))
                {
                    sd.desc = sd.description.length > 10 ? sd.description.substring(0,10)+'...' : sd.description;
                    sd.project_name = projectsList[sd.project].length > 7 ? projectsList[sd.project].substring(0,7)+'...' : projectsList[sd.project];
                    $(".last-entry").find('.panel-body .tr').html('\
                        <div class="td" title="'+projectsList[sd.project]+'">'+sd.project_name+'</div>\
                        <div class="td">'+sd.start_time+'</div>\
                        <div class="td">'+sd.end_time+'</div>\
                        <div class="td" title="'+sd.description+'">'+sd.desc+'</div>\
                        ')


                        if($(".last-entry").hasClass("hide"))
                        {
                            $(".last-entry").removeClass('hide');
                        }
                }

},1000);

let logindata = window.localStorage.getItem('login-data');
if(logindata)
{

    loadDashboard();
}
else
{
    $("#dashboard").addClass('hide');
    $("#loading").addClass('hide');
    $("#login").removeClass('hide');
}

    $("#submit").on('click',function(){

        let email = $("#email").val();
        let password = $("#password").val();
        let txt = $(this).text();
        let that = $(this);

            $.ajax({
                type: 'POST',
                url: "https://codelogicx-crm.track-progress.com/api/auth/login",
                data: {email : email,password: password},
                dataType: "JSON",
                beforeSend: function (xhr) {
                    that.text("Signing...").attr('disabled',true);
                },
                success: function(resultData) { 
                    window.localStorage.setItem('login-data',JSON.stringify(resultData.data));
                    loadDashboard();
                 },
                error: function(e){
                    let err = '';
                    if(e.responseJSON.error_list)
                    {
                        if(e.responseJSON.error_list['email'])
                        {
                            e.responseJSON.error_list['email'].forEach(function(i){
                                err += i+"\n";
                            });
                        }

                        if(e.responseJSON.error_list['password'])
                        {
                            e.responseJSON.error_list['password'].forEach(function(i){
                                err += i+"\n";
                            });
                        }
                    }
                    else
                    {
                        err = e.responseJSON.status.message
                    }


                    $(".form-signin").notify(err, {
                        elementPosition : 'top center',
                        className : 'error'
                    });
                },
                complete : function(){
                    that.text(txt).attr('disabled',false);
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
       logout();
    })

    $("#cmn-toggle-4").change(function(){

        if($(this).is(":checked"))
        {
            $(".time").removeClass('fade-time');
            $("#data-project").val($("#project").val());
            $("#data-desc").val($("#desc").val() || "---");

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
            $.notify("Tracker On", "success")
        }
        else
        {
            $("#project").attr('disabled',false);
            $("#desc").attr('disabled',false);
            $(".time").addClass('fade-time');

            timerInstance.stop();
            $.notify("Tracker Off", "success")
        }

    });
 

    function logout()
    {
        window.localStorage.removeItem('login-data');
        timerInstance.stop();
        $("#cmn-toggle-4").prop('checked',false);
        $("#cmn-toggle-4").change();
        $("#dashboard").addClass('hide');
        $("#login").removeClass('hide');
    }

    function sendDataToServer(data,isClosing)
    {
        let timeLogs = window.localStorage.getItem('timeLogs');
        if(!timeLogs)
        {
            timeLogs = [];
            timeLogs.push(data);
            //window.localStorage.setItem('timeLogs',JSON.stringify(timeLogs));
        }
        else
        {
            timeLogs = JSON.parse(timeLogs);
            timeLogs.push(data);
        }

        if(online())
        {
            while(timeLogs.length)
            {
                //console.log(timeLogs.shift());
                let sd = timeLogs.shift();
                addWorklog(sd)
                .done(function(){
                    sd.sentAt = moment().format('YYYY-MM-DD HH:mm');
                    window.localStorage.setItem('lastEntry',JSON.stringify(sd));
                    if(isClosing === true)
                    {
                        ipcRenderer.sendSync('logout-complet', 'done');
                    }
                })
                .fail(function(e){
                    $.notify(e.responseJSON.status.message, "error")
                })
                .always(function(){
                    setTimeout(function(){
                        $("#sending-status").addClass('hide');
                    },1000);
                });
            }
            window.localStorage.removeItem('timeLogs');
        }
        else
        {
            window.localStorage.setItem('timeLogs',JSON.stringify(timeLogs));
        }
    }

    function online()
    {
        return navigator.onLine;
    }

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

    function addWorklog(d)
    {
        return $.ajax({
                    type: 'POST',
                    url: "https://codelogicx-crm.track-progress.com/api/worklogs/add",
                    data:d,
                    dataType: "JSON",
                    beforeSend: function (xhr) {
                        $("#sending-status").removeClass('hide');
                        xhr.setRequestHeader ("Authorization", "Bearer "+getLocalData().access_token);
                        ipcRenderer.send('tracker-snapshot',d);
                    }
                })
    }

    function getLocalData()
    {
        return JSON.parse(window.localStorage.getItem('login-data'))
    }

    function getLastEntryData()
    {
        let o = window.localStorage.getItem('lastEntry');
        if(!o)
        {
            return false;
        }
        return JSON.parse(o)
    }

    function loadDashboard()
    {
        getMe().then(function(res){
            let html = '';
            res.data.projects.forEach(function(item){
                html += '<option value="'+ item.id +'">'+item.name+'</option>';
                projectsList[item.id] = item.name;
            })
    
            
            $(".user-name").html(res.data.user.name);
            $("#project").html(html);
            $("#login").addClass('hide');
            $("#loading").addClass('hide');
            $("#dashboard").removeClass('hide');


            let user = getLocalData().user;
            timerInstance.addEventListener('secondsUpdated', function (e) {
                let s = timerInstance.getTimeValues().toString().split(':');
                let second = s.pop();
                $('.time').html(s.join(":"));
            
                let project = $("#project").val();

                let identifer = moment().format("YYYYMMDD")+'-'+user.id+'-'+project;
                //console.log(s);
                window.localStorage.setItem(identifer,JSON.stringify(s));

                let countVal = window.localStorage.getItem('count-'+identifer);
                if(!countVal)
                {
                    window.localStorage.setItem('count-'+identifer,1)
                }
                else
                {
                    countVal = parseInt(countVal);
                    countVal += 1;
                    if(countVal >= sendToServer)
                    {
                        sendDataToServer({
                            date : moment().format('YYYY-MM-DD'), 
                            description : $("#data-desc").val(), 
                            end_time : moment().format('HH:mm'), 
                            project : $("#data-project").val(), 
                            start_time : moment().subtract(countVal, 'seconds').format('HH:mm')
                        })
                        window.localStorage.removeItem('count-'+identifer);
                    }
                    else
                    {
                        window.localStorage.setItem('count-'+identifer,countVal);
                        $('.small-time').text(second);
                    }
                }

            });

    
        })
        .catch(function(e){
            $.notify(e.responseJSON.status.message, "error")
        });
    }


    ipcRenderer.on('closing', (event, arg) => {
        let lastentry = getLastEntryData();
        timerInstance.stop();
        $("#cmn-toggle-4").prop('checked',false);
        $("#cmn-toggle-4").change();
        $("#dashboard").addClass('hide');
        $("#login").removeClass('hide');
        if(!lastentry)
        {
            ipcRenderer.sendSync('logout-complet', 'done')
            return;
        }

        let now = moment();
        let then = moment(lastentry.sentAt);
        let diff = now.diff(then,'minutes');
        if(diff > 5)
        {
            sendDataToServer({
                date : moment().format('YYYY-MM-DD'), 
                description : $("#data-desc").val(), 
                end_time : moment().format('HH:mm'), 
                project : $("#data-project").val(), 
                start_time : lastentry.end_time
            },true)
        }

       
    })