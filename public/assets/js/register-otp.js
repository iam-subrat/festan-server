function sendOTP() {
    console.log("Entered sendOTP...")
    // Code to send an OTP

    const dispbox = document.getElementById('otpbox');
    dispbox.style.display = 'inline';
    const msgbox = document.getElementById('countdownmsg');
    const timeout = document.getElementById('timeout');
    const expireTime = Date.now()+10*1000;
    msgbox.style.display = 'inline';
    timer = setInterval(function() {
        leftTime = parseInt((expireTime - Date.now())/1000);
        timeout.innerHTML = leftTime;
        if(leftTime==0) {
            clearTimeout(timer);
            const resendbtn = document.getElementById('resend');
            resendbtn.style.display = 'inline';
            msgbox.style.display = 'none';
        }
    }, 1000);
}

function resendOTP() {
    const resendbtn = document.getElementById('resend');
    resendbtn.style.display = 'none';
    sendOTP();
}