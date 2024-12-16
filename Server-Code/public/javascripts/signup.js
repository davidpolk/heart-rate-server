// public/javasciprts/signup.js

function signup() {
    // data validation
    if ($('#email').val() === "") {
        window.alert("invalid email!");
        return;
    }
    if ($('#password').val() === "") {
        window.alert("invalid password");
        return;
    }
    if (!validatePassword($('#password').val())) {
        window.alert("Password is not strong enough. Must Contain at least: \n8 Characters\n1 Uppper Case\n1 Lower Case\n1 Number\n1 Special Character");
        return;
    }
    if ($('#deviceName').val() === "") {
        window.alert("invalid device name");
        return;
    }
    let txdata = {
        email: $('#email').val(),
        password: $('#password').val(),
        deviceName: $('#deviceName').val()
    };
    $.ajax({
        url: '/customers/signUp',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
        if (data.success) {
            // after 1 second, move to "login.html"
            setTimeout(function(){
                window.location = "login.html";
            }, 1000);
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 404) {
            $('#rxData').html("Server could not be reached!!!");    
        }
        else $('#rxData').html(JSON.stringify(jqXHR, null, 2));
    });
}

$(function () {
    $('#btnSignUp').click(signup);
});

// Function to validate password strength
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}