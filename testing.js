function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function start() {
    while (true) {
        if (document.getElementsByClassName("btn-default")[0].innerHTML == "leave") {
            if (Math.random() < 0.75) {
                document.getElementsByTagName("input")[0].value = "你好";
                document.getElementsByTagName("input")[0].dispatchEvent(new Event('input'));
                document.getElementsByClassName("btn-default")[1].click();
            } else {
                document.getElementsByClassName("btn-default")[0].click();
            }
        } else {
            document.getElementsByClassName("btn-default")[0].click();
        }
        var msgs = document.getElementsByClassName("message-box")[0].childNodes;
        await sleep(1000);
        if (msgs[msgs.length - 1] != null && msgs[msgs.length - 1].innerHTML.includes('Partner has left the room')) {
            document.getElementsByClassName("btn-default")[0].click();
        }
        await sleep(2000);
    }
}

alert = function() {};

start();
