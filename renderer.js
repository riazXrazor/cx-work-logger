// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
console.log(window.localStorage.getItem('login-data'));
let logindata = window.localStorage.getItem('login-data');
if(logindata)
{
    $("#login").addClass('hide');
    $("#dashboard").removeClass('hide');
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
                    $("#login").addClass('hide');
                    $("#dashboard").removeClass('hide');
                 },
                error: function(e){
                    alert(e.responseJSON.status.message);
                }
          })
           
        
    })

    $("#logout").click(function(){
        window.localStorage.removeItem('login-data');
        $("#dashboard").addClass('hide');
        $("#login").removeClass('hide');
    })

    $("#cmn-toggle-4").change(function(){

        if($(this).is(":checked"))
        {
            $(".time").removeClass('fade-time');
            $("#project").attr('disabled',true);
            $("#desc").attr('disabled',true);
        }
        else
        {
            $("#project").attr('disabled',false);
            $("#desc").attr('disabled',false);
            $(".time").addClass('fade-time');
        }

    });
 