const io = require("socket.io-client");
const axios = require("axios");
const ipcr = require("electron").ipcRenderer;
const socket = io.connect("https://wassuppro.herokuapp.com",{ "sync disconnect on unload":true });
const allchatsloader = document.getElementById("allchatsloader");
const loader1 = document.getElementById("loader1");
const chatlist = document.getElementById("chatlist");
const messages = document.querySelector(".messages");
const titlepre = document.querySelector(".usertitle pre");
const addbutton = document.querySelector(".addbutton");
const endbutton = document.querySelector(".endbutton");
const videocamera = document.querySelector(".videocamera");
const p = document.querySelector(".callingto");
const p1 = document.querySelector(".callfrom");
const callermodal = document.getElementById("callermodal");
const receivermodal = document.getElementById("receivermodal");
const receivebutton = document.querySelector(".receivebutton");
const cutbutton = document.querySelector(".cutbutton");
const callui = document.querySelector(".callui");
const topdiv = document.querySelector(".top");
const bottomdiv = document.querySelector(".bottom");
const mute = document.querySelector(".mute");
const videomute = document.querySelector(".videomute");
const close = document.querySelector(".close");
const minimize = document.querySelector(".minimize");
const closeapp = document.querySelector(".closeapp");
var isitnew = "false";
var noofnewmsgs;
var lastemail = "";
var mainmsg = "";
var newcount = -1;
var oldcount = 0;
var t;
var maintime;
var browser = "";
var mainvalue = null;
var msginputcount = 0;
var othermsgcount = 0;
var sent = "";
var name = "";
var loggedinemail = "";
var loggedinname = "";
var chatroomtitlename = "";
var chatroomemail = "";
var randomvar = "";
var audiodisabled = "false";
var videodisabled = "false";
var videocaller = "";
var videoreceiver = "";
var peerid = "";
var call,peer;
var ourstream = null;
var randomdiv = null;
var seendiv = null;
var constraints = {
    video: true,
    audio: true
}
var pubkey = "BEcF57uMF5LyK9boqYxf-9q21GdcWX707xxPz-MWieIhCI4lwBCgP9xtxWeYq632HaR0b9mwI9GW1dxs6r2zoV0";
const loginform = document.getElementById("login");
const signupform = document.getElementById("signup");
const loginmain = document.querySelector(".loginmain");
const mainlogo = document.querySelector(".mainlogo");
const title = document.getElementById("title");
const signuptitle = document.getElementById("signuptitle");
const loader = document.querySelector(".loader");
const loggedinmain = document.querySelector(".loggedinmain");
var text = title.innerText;
var emailid = "";
var otpcheck = null;
const signupbutton = document.getElementById("gotosignup");
const loginbutton = document.getElementById("gotologin");
const login = document.querySelector(".login");
const signup = document.querySelector(".signup");

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const updatetitle = document.querySelector(".update p");
const updater = document.querySelector(".updater");
const updateloader = document.querySelector(".updateloader");
const restartbutton = document.querySelector(".restart");
restartbutton.addEventListener("click",() => {
    ipcr.send("restart_app");
});
setTimeout(() => {
    updatetitle.innerText = "Update done. Restart now";
    updateloader.classList.add("none");
    restartbutton.classList.remove("none");
},5000);
ipcr.on("update_available",() => {
    ipcr.removeAllListeners('update_available');
    updater.classList.remove("none");
});

ipcr.on("update_downloaded",() => {
    ipcr.removeAllListeners('update_downloaded');
    updatetitle.innerText = "Update done. Restart now";
    updateloader.classList.add("none");
    restartbutton.classList.remove("none");
});

setInterval(() => {
    console.log("navigator.onLine ",navigator.onLine);
},5000);

setTimeout(() => {
    mainlogo.style.top = "45%";
    loader.style.opacity = 1;
},2000);

minimize.addEventListener("click",() => {
    ipcr.send("minimize");
});
closeapp.addEventListener("click",() => {
    ipcr.send("close");
});


var initialcheck = () => {
    if(localStorage.getItem("token") == null || localStorage.getItem("token") == ""){
        console.log("not found");
        setTimeout(() => {
            loader.style.opacity = 0;
            setTimeout(() => {
                mainlogo.style.left = "50%";
                login.style.animation = "initialleft 1s ease-in-out 0s 1 normal forwards";
            },1000);
        },4000);
    }
    else{
        allchatsloader.classList.remove("none");
        axios.post("https://wassuppro.herokuapp.com/getusercred/desktop",{
            data: localStorage.getItem("token")
        }).then(result => {
            if(result.data.email != "not matching"){
                loggedinname = result.data.name;
                loggedinemail = result.data.email;
                socket.emit("initial",{
                    email: loggedinemail
                });
                console.log("matching");
                getallchats(1);
                // setTimeout(() => {
                    // loginmain.style.top = "-100%";
                    // otpcheck = null;
                // },2000);
            }
            else{
                console.log("not matching");
                allchatsloader.classList.add("none");
                // const div = document.createElement("div");
                // div.setAttribute("class","nodata");
                // div.textContent = "You're logged in on another device";
                // chatlist.appendChild(div);
                // addbutton.style.display = "none";
                setTimeout(() => {
                    loader.style.opacity = 0;
                    setTimeout(() => {
                        mainlogo.style.left = "50%";
                        login.style.animation = "initialleft 1s ease-in-out 0s 1 normal forwards";
                    },1000);
                },2000);
            }
            socket.emit("setstream",{
                email: loggedinemail
            });
            checkbrowser();
            chatroomemail = "";
            chatroomtitlename = "";
            if("serviceWorker" in navigator){
                navigator.serviceWorker.register("./sw.js").then(sw => {
                    sw.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(pubkey)
                    }).then(subs => {
                        if(Notification.permission == "granted"){
                            axios.post("https://wassuppro.herokuapp.com/subscribe",{
                                data: JSON.stringify(subs),
                                email: loggedinemail
                            }).then(data => {});
                        }
                    });
                });
            }
        });
    }
}


signupbutton.addEventListener("click",() => {
    login.style.animation = "moveright 0.3s ease-in-out 0s 1 normal forwards";
    signup.style.animation = "moveleft 0.3s ease-in-out 0.3s 1 normal forwards";
    signuptitle.innerText = "Sign Up";
    signupform.reset();
});

loginbutton.addEventListener("click",() => {
    signup.style.animation = "moveright 0.3s ease-in-out 0s 1 normal forwards";
    login.style.animation = "moveleft 0.3s ease-in-out 0.3s 1 normal forwards";
    title.innerText = "Login";
    loginform.reset();
});

initialcheck();

loginform.addEventListener("submit",(e) => {
    e.preventDefault();
    if(loginform.otp.disabled){
        // loader.classList.remove("none");
        emailid = loginform.email.value;
        axios.post("https://wassuppro.herokuapp.com/login",{
            email: loginform.email.value
        }).then((result) => {
            // loader.classList.add("none");
            loginform.reset();
            if(result.data == "otp"){
                loginform.otp.disabled = false;
                loginform.email.disabled = true;
                title.innerText = "OTP sent";
            }
            else{
                title.innerText = "user not found";
                setTimeout(() => {
                    title.innerText = text;
                },2000);
            }
        });
    }
    else{
        // loader.classList.remove("none");
        axios.post("https://wassuppro.herokuapp.com/otp/desktop",{
            otp: loginform.otp.value,
            email: emailid
        }).then((result) => {
            // loader.classList.add("none");
            if(result.data.msg == "success"){
                localStorage.setItem("token",result.data.token);
                // otpcheck = loginform.otp.value;
                login.style.animation = "moveright 1s ease-in-out 0s 1 normal forwards";
                // mainlogo.style.animation = "center 1s ease-in-out 0s 1 normal forwards";
                mainlogo.style.left = "100%";
                // loader.style.animation = "design 2s linear 0s infinite normal forwards,reapp 1.5s ease-in-out 1s 1 normal forwards";
                setTimeout(() => {
                    loader.style.opacity = 1;
                    loginform.email.disabled = false;
                    loginform.otp.disabled = true;
                    title.innerText = "Login";
                    initialcheck();
                    // setTimeout(() => {
                    //     loginmain.style.top = "-100%";
                    // },4000);
                },800);
                // loginmain.style.animation = "moveup 0.5s ease-in-out 4s 1 normal forwards";
                // setTimeout(() => {
                    // loggedinmain.classList.remove("none");
                // },5000);
                // window.location = "./index.html";
            }
            else{
                title.innerText = "Invalid OTP";
                setTimeout(() => {
                    title.innerText = "Enter OTP";
                },2000);
            }
        });
    }
});


signupform.addEventListener("submit",(e) => {
    e.preventDefault();
    if(signupform.otp.hasAttribute("disabled")){
        // loader.classList.remove("none");
        emailid = signupform.email.value;
        axios.post("https://wassuppro.herokuapp.com/signup",{
            username: signupform.username.value,
            email: signupform.email.value
        }).then((result) => {
            // loader.classList.add("none");
            signupform.reset();
            if(result.data == "otp"){
                signupform.username.disabled = true;
                signupform.email.disabled = true;
                signupform.otp.removeAttribute("disabled");
                signuptitle.innerText = "OTP sent";
            }
            else{
                signuptitle.innerText = "User Exists";
                setTimeout(() => {
                    signuptitle.innerText = "Sign Up";
                    // window.location = "./login.html";
                    signup.style.animation = "moveright 0.3s ease-in-out 0s 1 normal forwards";
                    login.style.animation = "moveleft 0.3s ease-in-out 0.3s 1 normal forwards";
                },2000);
            }
        });
    }
    else{
        // loader.classList.remove("none");
        axios.post("https://wassuppro.herokuapp.com/otp/desktop",{
            otp: signupform.otp.value,
            email: emailid
        }).then((res) => {
            // loader.classList.add("none");
            signupform.reset();
            if(res.data == "success"){
                signuptitle.innerText = "User Created";
                setTimeout(() => {
                    signuptitle.innerText = "Sign Up";
                    // window.location = "./login.html";
                    signup.style.animation = "moveright 0.3s ease-in-out 0s 1 normal forwards";
                    login.style.animation = "moveleft 0.3s ease-in-out 0.3s 1 normal forwards";
                },2000);
            }
            else{
                signuptitle.innerText = "Invalid OTP";
            }
        });
    }
});









checkbrowser = () => {
    if(navigator.vendor == "Google Inc."){
        browser == "Chrome";
    }
}


var textareaheightfunc = (scrollval) => {
    messages.scrollTop = messages.scrollHeight;
    // textarea.style.height = "auto";
    var h = 70;
    if(scrollval > 43){
        messageinput.style.height = `${h + (scrollval - 42)}px`;
        messages.style.bottom = messageinput.style.height;
        messages.scrollTop = messages.scrollHeight;
    }
    else{
        messageinput.style.height = h + "px";
        messages.style.bottom = messageinput.style.height;
        messages.scrollTop = messages.scrollHeight;
        textarea.style.height = "42px";
    }
}

var getallchats = (numeric) => {
    axios.post("https://wassuppro.herokuapp.com/trial",{
        data: loggedinemail
    }).then(result => {
        allchatsloader.classList.add("none");
        chatlist.innerText = "";
        if(result.data.length > 0){
            result.data.sort(compare);
            result.data.forEach(element => {
                if(element.val == 1){
                    const ul = document.createElement("ul");
                    const li1 = document.createElement("li");
                    const li2 = document.createElement("li");
                    const div = document.createElement("div");
                    li1.textContent = element.name;
                    li2.textContent = element.email;
                    div.textContent = element.len;
                    ul.appendChild(li1);
                    ul.appendChild(li2);
                    ul.appendChild(div);
                    chatlist.appendChild(ul);
                    ul.addEventListener("click",(e) => {
                        chatroomtitlename = e.currentTarget.children[0].innerText;
                        chatroomemail = e.currentTarget.children[1].innerText;
                        usertitle.innerText = chatroomtitlename;
                        // main.classList.add("none");
                        chatroom.classList.remove("none");
                        isitnew = "true";
                        loader1.classList.remove("none");
                        socket.emit("seen",{
                            from: chatroomemail,
                            to: loggedinemail
                        });
                        axios.post("https://wassuppro.herokuapp.com/shownewmsgs",{
                            from: chatroomemail,
                            to: loggedinemail
                        }).then(result => {
                            retrievechats(loggedinemail,chatroomemail,result.data.length);
                        });
                        chatlist.removeChild(e.currentTarget);
                        textarea.focus();
                    });
                }
            });
            result.data.forEach(element => {
                if(element.val == -1){
                    const ul = document.createElement("ul");
                    const li1 = document.createElement("li");
                    const li2 = document.createElement("li");
                    li1.textContent = element.name;
                    li2.textContent = element.email;
                    ul.appendChild(li1);
                    ul.appendChild(li2);
                    chatlist.appendChild(ul);
                    ul.addEventListener("click",(e) => {
                        chatroomtitlename = e.currentTarget.children[0].innerText;
                        chatroomemail = e.currentTarget.children[1].innerText;
                        usertitle.innerText = chatroomtitlename;
                        // main.classList.add("none");
                        chatroom.classList.remove("none");
                        textarea.style.height = "42px";
                        isitnew = "false";
                        loader1.classList.remove("none");
                        retrievechats(loggedinemail,chatroomemail,0);
                        textarea.focus();
                    });
                }
            });
        }
        else{
            const div = document.createElement("div");
            div.setAttribute("class","nodata");
            div.textContent = "No chats";
            chatlist.appendChild(div);
        }
        chatlist.scrollTop = 0;
        if(numeric){
            setTimeout(() => {
                loginmain.style.top = "-100%";
                loader.style.opacity = 0;
                mainlogo.style.top = "50%";
            },3000);
        }
    });
}

socket.on("cleared",data => {
    getallchats(0);
});

socket.on("seen",data => {
    if(seendiv == null){
    if(data.seen = "true" && chatroomemail == data.to && lastemail == loggedinemail && randomdiv == null){
        seendiv = document.createElement("div");
        seendiv.setAttribute("class","eachright");
        seendiv.textContent = "seen";
        messages.appendChild(seendiv);
        messages.scrollTop = messages.scrollHeight;
    }}
});

var compare = (a,b) => {
    var one = a.name.toLowerCase();
    var two = b.name.toLowerCase();
    if(one > two){
        return 1;
    }
    else{
        return -1;
    }
}


var getonlinestatus = (other) => {
    socket.emit("statusreq",{
        email: other
    });
}

var retrievechats = (sender,receiver,noofnewmsgs) => {
    messages.innerHTML = "";
    msginputcount = 0;
    othermsgcount = 0;
    axios.post("https://wassuppro.herokuapp.com/retrievechats",{
        sender: sender,
        receiver: receiver
    }).then(result => {
        seendiv = null;
        loader1.classList.add("none");
        if(result.data.chats != "no chats"){
            lastemail = result.data.chats[(result.data.chats.length - 1)].email;
            for(var i=0;i<result.data.chats.length;i++){
                const div1 = document.createElement("div");
                div1.setAttribute("class","eachmsg");
                const div2 = document.createElement("div");
                div2.textContent = result.data.chats[i].msg;
                if(i>0){
                    if(result.data.chats[i-1].email != result.data.chats[i].email){
                        if(sender == result.data.chats[i].email){
                            div2.setAttribute("class","msg right");
                            if(i < result.data.chats.length - noofnewmsgs){
                                div2.style.marginTop = "15px";
                            }
                        }
                        else{
                            div2.setAttribute("class","msg left");
                            if(i < result.data.chats.length - noofnewmsgs){
                                div2.style.marginTop = "15px";
                            }
                        }
                        if(noofnewmsgs != 0){
                            if(i == (result.data.chats.length - noofnewmsgs)){
                                randomdiv = document.createElement("div");
                                randomdiv.setAttribute("class","eachleft");
                                if(noofnewmsgs == 1){
                                    randomdiv.textContent = "new message";    
                                }
                                else{
                                    randomdiv.textContent = "new messages";
                                }
                                messages.appendChild(randomdiv);
                            }
                        }
                        div1.appendChild(div2);
                        messages.appendChild(div1);
                    }
                    else{
                        const div1 = document.createElement("div");
                        div1.setAttribute("class","eachmsg");
                        const div2 = document.createElement("div");
                        div2.textContent = result.data.chats[i].msg;
                        if(sender == result.data.chats[i].email){
                            div2.setAttribute("class","msg right");
                        }
                        else{
                            div2.setAttribute("class","msg left");
                        }
                        if(noofnewmsgs != 0){
                            if(i == (result.data.chats.length - noofnewmsgs)){
                                randomdiv = document.createElement("div");
                                randomdiv.setAttribute("class","eachleft");
                                if(noofnewmsgs == 1){
                                    randomdiv.textContent = "new message";    
                                }
                                else{
                                    randomdiv.textContent = "new messages";
                                }
                                messages.appendChild(randomdiv);
                            }
                        }
                        div1.appendChild(div2);
                        messages.appendChild(div1);
                    }
                }
                else{
                    const div1 = document.createElement("div");
                    div1.setAttribute("class","eachmsg");
                    const div2 = document.createElement("div");
                    div2.textContent = result.data.chats[i].msg;
                    if(sender == result.data.chats[i].email){
                        div2.setAttribute("class","msg right");
                    }
                    else{
                        div2.setAttribute("class","msg left");
                    }
                    if(noofnewmsgs != 0){
                        if(i == (result.data.chats.length - noofnewmsgs)){
                            randomdiv = document.createElement("div");
                            randomdiv.setAttribute("class","eachleft");
                            if(noofnewmsgs == 1){
                                randomdiv.textContent = "new message";    
                            }
                            else{
                                randomdiv.textContent = "new messages";
                            }
                            messages.appendChild(randomdiv);
                        }
                    }
                    div1.appendChild(div2);
                    messages.appendChild(div1);
                }
                messages.scrollTop = messages.scrollHeight;
                var timer,inner,impval = 0;
                div2.addEventListener("touchstart",() => {
                    timer = setTimeout(() => {
                        impval = 1;
                        div2.style.marginLeft = "30px";
                        console.log("moved left")
                        inner = setTimeout(() => {
                            div2.style.marginLeft = "10px";
                            console.log("moved right")
                        },1000);
                    },1000);
                });
                div2.addEventListener("touchend",() => {
                    if(impval == 0 && div2.style.marginLeft == "10px"){
                        clearTimeout(timer);
                        clearTimeout(inner);
                        console.log("cleared both")
                    }
                    else{
                        impval = 0;
                    }
                });
            };
            if(isitnew == "true"){
                socket.emit("clear",{
                    to: loggedinemail,
                    from: chatroomemail
                });
            }
            socket.emit("isseen",{
                from: loggedinemail,
                to: chatroomemail
            });
        }
    });
    getonlinestatus(receiver);
}

const paymentbutton = document.querySelector(".paymentbutton");
const sendbutton = document.querySelector(".sendbutton");
const logoutbutton = document.querySelector(".logoutbutton");
const usertitle = document.querySelector(".usertitle p");
const cancelbutton = document.querySelector(".cancelbutton");
const backbutton = document.querySelector(".backbutton");
const main = document.querySelector(".main");
const chatroom = document.querySelector(".chatroom");
const addscreen = document.querySelector(".addscreen");
const textarea = document.querySelector("textarea");
const searchinput = document.getElementById("searchinput");
const resultlist = document.getElementById("resultlist");
const msginput = document.getElementById("msginput");
const messageinput = document.querySelector(".messageinput");


function movefunction(){
    close.style.top = "30px";
    mute.style.bottom = "30px";
    videomute.style.bottom = "30px";
    if(newcount > oldcount){
        oldcount = newcount;
        clearTimeout(t);
        movefunction(newcount);
    }
    else{
        t = setTimeout(() => {
            close.style.top = "-100px";
            mute.style.bottom = "-100px";
            videomute.style.bottom = "-100px";
            newcount = -1;
            oldcount = 0;
        },5000);
    }
}

closefunc = () => {
    topdiv.innerHTML = "";
    bottomdiv.innerHTML = "";
    callui.classList.add("none");
}


topdiv.addEventListener("click",() => {
    newcount +=1;
    movefunction(newcount);
});
bottomdiv.addEventListener("click",() => {
    newcount += 1;
    movefunction(newcount);
});
addbutton.addEventListener("click",(e) => {
    main.classList.add("none");
    addscreen.classList.remove("none");
    searchinput.value = "";
    searchinput.focus();
    resultlist.innerHTML = "";
});
cancelbutton.addEventListener("click",(e) => {
    main.classList.remove("none");
    addscreen.classList.add("none");
});
backbutton.addEventListener("click",(e) => {
    // main.classList.remove("none");
    chatroom.classList.add("none");
    chatroomtitlename = "";
    messages.innerHTML = "";
    chatroomemail = "";
    msginputcount = 0;
    titlepre.innerText = "";
    randomdiv = null;
    // getallchats();
});
logoutbutton.addEventListener("click",(e) => {
    socket.emit("delete",{
        email: loggedinemail
    });
    localStorage.clear();
    loginmain.style.top = 0;
    setTimeout(() => {
        mainlogo.style.top = "45%";
        loader.style.opacity = 1;
        setTimeout(() => {
            loader.style.opacity = 0;
            setTimeout(() => {
                mainlogo.style.left = "50%";
                login.style.animation = "initialleft 1s ease-in-out 0s 1 normal forwards";
            },1000);
        },3000);
    },1000);
});
videocamera.addEventListener("click",() => {
    callermodal.classList.remove("none");
    p.children[0].innerText = "calling....";
    p.children[1].innerText = chatroomtitlename;
    socket.emit("interrupt",{
        receiver: chatroomemail,
        sender: loggedinemail,
        sendername: loggedinname
    });
});
endbutton.addEventListener("click",() => {
    p.children[1].innerText = "";
    callermodal.classList.add("none");
    socket.emit("callreq",{
        req: 0,
        caller: loggedinemail,
        callername: loggedinname,
        receiver: chatroomemail
    });
    socket.emit("videocall",{
        call: 0,
        email: loggedinemail
    });
});
cutbutton.addEventListener("click",() => {
    clearTimeout(maintime);
    p1.children[1].innerText = "";
    receivermodal.classList.add("none");
    socket.emit("callres",{
        res: 0,
        caller: randomvar,
        receiver: loggedinemail
    });
    socket.emit("videocall",{
        call: 0,
        email: loggedinemail
    });
    sent = "sent";
});
mute.addEventListener("click",() => {
    newcount +=1;
    movefunction(newcount);
    if(audiodisabled == "false"){
        mute.style.backgroundColor = "red";
        audiodisabled = "true";
        try{
            ourstream.getAudioTracks()[0].enabled = false;
        }catch{
            mute.style.backgroundColor = "#18171f";
            audiodisabled = "false";
        }
    }
    else{
        mute.style.backgroundColor = "#18171f";
        audiodisabled = "false";
        try{
            ourstream.getAudioTracks()[0].enabled = true;
        }catch{
            mute.style.backgroundColor = "red";
            audiodisabled = "true";
        }
    }
});
videomute.addEventListener("click",() => {
    newcount +=1;
    movefunction(newcount);
    if(videodisabled == "false"){
        videomute.style.backgroundColor = "red";
        videodisabled = "true";
        try{
            ourstream.getVideoTracks()[0].enabled = false;
        }catch{
            videomute.style.backgroundColor = "#18171f";
            videodisabled = "false";
        }
    }
    else{
        videomute.style.backgroundColor = "#18171f";
        videodisabled = "false";
        try{
            ourstream.getVideoTracks()[0].enabled = true;
        }catch{
            videomute.style.backgroundColor = "red";
            videodisabled = "true";
        }
    }
});
receivebutton.addEventListener("click",() => {
    if(browser == "Chrome"){
        navigator.wakeLock.request("screen").then(lock => {
            mainvalue = lock;
        });
    }
    clearTimeout(maintime);
    p1.children[1].innerText = "";
    receivermodal.classList.add("none");
    peer = new Peer({host:'peerjs-server.herokuapp.com', secure:true, port:443});
    peer.on("open",id => {
        peerid = id;
        socket.emit("callres",{
            res: 1,
            peerid: peerid,
            caller: randomvar,
            callername: name,
            receiver: loggedinemail
        });
        sent = "sent";
        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            const video = document.createElement("video");
            ourstream = stream;
            video.srcObject = stream;
            video.muted = true;
            video.onloadedmetadata = () => {
                video.play();
            }
            bottomdiv.append(video);
        });
        peer.on("call",call => {
            call.answer(ourstream);
            const videotop = document.createElement("video");
            call.on("stream",stream2 => {
                videotop.srcObject = stream2;
                videotop.onloadedmetadata = () => {
                    videotop.play();
                }
                topdiv.append(videotop);
            });
            call.on("close",() => {
                if(browser == "Chrome"){
                    mainvalue.release();
                    mainvalue = null;
                }
                if(ourstream != null){
                    ourstream.getTracks().forEach(track => {
                        track.stop();
                    });
                    ourstream = null;
                }
                socket.emit("left",{
                    left: "receiver",
                    caller: videocaller,
                    receiver: videoreceiver
                });
                socket.emit("videocall",{
                    call: 0,
                    email: loggedinemail
                });
            });
        });
        close.addEventListener("click",() => {
            ourstream.getTracks().forEach(track => {
                track.stop();
            });
            ourstream = null;
            peer.destroy();
            closefunc();
            socket.emit("left",{
                left: "caller",
                caller: videocaller,
                receiver: videoreceiver
            });
        });
    });
    videodisabled = "false";
    audiodisabled = "false";
    mute.style.backgroundColor = "#18171f";
    videomute.style.backgroundColor = "#18171f";
    callui.classList.remove("none");
});
window.onresize = function(){
    textareaheightfunc(42);
}
paymentbutton.addEventListener("click",() => {
    console.log("do nothing");
});
textarea.addEventListener("input",(e) => {
    if(textarea.value != ""){
        textarea.style.width = "78%";
        paymentbutton.style.width = "0px";
        paymentbutton.style.height = "0px";
    }
    else{
        textarea.style.width = "68%";
        paymentbutton.style.width = "45px";
        paymentbutton.style.height = "45px";
    }
    e.currentTarget.style.height = "auto";
    e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
    textareaheightfunc(e.currentTarget.scrollHeight);
});
searchinput.addEventListener("keyup",(e) => {
    if(searchinput.value.match(/^[0-9a-zA-Z]+$/)){
        allchatsloader.classList.remove("none");
        axios.post("https://wassuppro.herokuapp.com/searchuser",{
            data: searchinput.value,
            token: localStorage.getItem("token")
        }).then(result => {
            allchatsloader.classList.add("none");
            if(result.data.arr != "not found"){
                var account = result.data.arr;
                resultlist.innerHTML = "";
                for(var i=0;i<account.length;i++){
                    const ul = document.createElement("ul");
                    const li1 = document.createElement("li");
                    const li2 = document.createElement("li");
                    li1.textContent = account[i].name;
                    li2.textContent = account[i].email;
                    ul.appendChild(li1);
                    ul.appendChild(li2);
                    resultlist.appendChild(ul);
                    ul.addEventListener("click",(e) => {
                        chatroomtitlename = e.currentTarget.children[0].innerText;
                        chatroomemail = e.currentTarget.children[1].innerText;
                        usertitle.innerText = chatroomtitlename;
                        addscreen.classList.add("none");
                        main.classList.remove("none");
                        chatroom.classList.remove("none");
                        loader1.classList.remove("none");
                        retrievechats(loggedinemail,chatroomemail,0);
                    }); 
                };
            }
            else{
                resultlist.innerHTML = "";
                const div = document.createElement("div");
                div.setAttribute("class","nodata");
                div.textContent = "No results";
                resultlist.appendChild(div);
            }
        });
    }
    else{
        resultlist.innerHTML = "";
    }
});
msginput.addEventListener("keyup",(e) => {
    if(e.target.value != ""){
        socket.emit("typing?",{
            sender: loggedinemail,
            receiver: chatroomemail,
            val: "typing"
        });
    }
    else{
        socket.emit("typing?",{
            sender: loggedinemail,
            receiver: chatroomemail,
            val: "stopped"
        });
    }
});
sendbutton.addEventListener("click",(e) => {
    var msg = msginput.value;
    mainmsg = msg;
    if(msg.match(/^[\s]*$/)){
        msginput.value = "";
        textareaheightfunc(textarea.scrollHeight);
    }
    else{
        var trimmsg = msg.trim();
        if(randomdiv != null){
            messages.removeChild(randomdiv);
        }
        if(seendiv != null){
            messages.removeChild(seendiv);
        }
        randomdiv = null;
        seendiv = null;
        const divmain = document.createElement("div");
        const divin = document.createElement("div");
        divmain.setAttribute("class","eachmsg");
        divin.setAttribute("class","msg right");
        divin.textContent = msg;
        divmain.appendChild(divin);
        if(msginputcount == 0 && lastemail == chatroomemail){
            divin.style.marginTop = "15px";
        }
        lastemail = loggedinemail;
        msginputcount += 1;
        othermsgcount = 0;
        messages.appendChild(divmain);
        messages.scrollTop = messages.scrollHeight;
        msginput.value = "";
        textarea.style.height = "auto";
        textareaheightfunc(textarea.scrollHeight);
        socket.emit("sendmsg",{
            sender: loggedinemail,
            receiver: chatroomemail,
            message: trimmsg
        });
        socket.emit("typing?",{
            sender: loggedinemail,
            receiver: chatroomemail,
            val: "stopped"
        });
    }
    textarea.focus();
    textarea.style.width = "65%";
    paymentbutton.style.width = "45px";
    paymentbutton.style.height = "45px";
});


socket.on("livemsg",data => {
    if(chatroomemail == data.sender){
        const div1 = document.createElement("div");
        div1.setAttribute("class","eachmsg");
        const div2 = document.createElement("div");
        div2.textContent = data.msg;
        div2.setAttribute("class","msg left");
        div1.appendChild(div2);
        if(othermsgcount == 0 && lastemail == loggedinemail){
            div2.style.marginTop = "15px";
        }
        lastemail = chatroomemail;
        othermsgcount += 1;
        msginputcount = 0;
        if(randomdiv != null){
            randomdiv.textContent = "new messages";
        }
        if(seendiv != null){
            messages.removeChild(seendiv);
            seendiv = null;
        }
        socket.emit("seen",{
            from: chatroomemail,
            to: loggedinemail
        });
        messages.appendChild(div1);
        messages.scrollTop = messages.scrollHeight;
    }
    else{
        socket.emit("addingnewmsg",{
            from: data.sender,
            to: loggedinemail,
            msg: data.msg
        });
    }
});

socket.on("statusres",data => {
    if(chatroomemail == data.email){
        if(data.status == "online"){
            titlepre.innerText = "online";
        }
        else{
            titlepre.innerText = "";
        }
    }
});

socket.on("typingyes",val => {
    if(chatroomemail == val.sender){
        if(val.data == "yes"){
            titlepre.innerText = "typing";
        }
        else{
            titlepre.innerText = "online";
        }
    }
});

socket.on("confirm",data => {
    if(data.val == "receiver's" && data.no == 0){
        getallchats(0);
    }
    else{
        socket.emit("notify",{
            sender: loggedinemail,
            receiver: chatroomemail,
            sendername: loggedinname,
            message: mainmsg
        });
        mainmsg = "";
    }
});

socket.on("callrequest",data => {
    if(data.req == -1){  
        p.children[0].innerText = "offline";
        socket.emit("videocall",{
            call: 0,
            email: loggedinemail
        });
        setTimeout(() => {
            callermodal.classList.add("none");
        },2000);
    }
});

socket.on("callreq",data => {
    if(data.req == 0){
        p1.children[0].innerText = "caller left";
        videocaller = "";
        videoreceiver = "";
        socket.emit("videocall",{
            call: 0,
            email: loggedinemail
        });
        setTimeout(() => {
            p.children[0].innerText = "";
            receivermodal.classList.add("none");
        },1000);
    }
    else{
        randomvar = data.caller;
        name = data.callername;
        receivermodal.classList.remove("none");
        sent = "";
        p1.children[0].innerText = "incoming video call from";
        p1.children[1].innerText = data.callername;
        videocaller = data.caller;
        videoreceiver = data.receiver;
        socket.emit("videocall",{
            call: 1,
            email: loggedinemail
        });
        maintime = setTimeout(() => {
            socket.emit("callres",{
                res: -1,
                caller: randomvar,
                receiver: loggedinemail
            });
            socket.emit("videocall",{
                call: 0,
                email: loggedinemail
            });
            receivermodal.classList.add("none");
        },30000);
    }
});

socket.on("callres",data => {
    if(data.res == 0){
        p.children[0].innerText = "call declined";
        socket.emit("videocall",{
            call: 0,
            email: loggedinemail
        });
        setTimeout(() => {
            p.children[0].innerText = "";
            callermodal.classList.add("none");
        },1000);
    }
    else if(data.res == -1){
        p.children[0].innerText = "no response";
        socket.emit("videocall",{
            call: 0,
            email: loggedinemail
        });
        setTimeout(() => {
            p.children[0].innerText = "";
            callermodal.classList.add("none");
        },2000);
    }
    else{
        videocaller = data.caller;
        videoreceiver = data.receiver;
        name = chatroomtitlename;
        callermodal.classList.add("none");
        videodisabled = "false";
        audiodisabled = "false";
        mute.style.backgroundColor = "#18171f";
        videomute.style.backgroundColor = "#18171f";
        callui.classList.remove("none");
        peer = new Peer({host:'peerjs-server.herokuapp.com', secure:true, port:443});
        peer.on("open",id => {
            peerid = id;
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {
                const video = document.createElement("video");
                ourstream = stream;
                video.srcObject = stream;
                video.muted = true;
                video.onloadedmetadata = () => {
                    video.play();
                }
                bottomdiv.append(video);
                const videotop = document.createElement("video");
                var call1 = peer.call(data.peerid,stream);
                socket.emit("videocall",{
                    call: 1,
                    email: loggedinemail
                });
                if(browser == "Chrome"){
                    navigator.wakeLock.request("screen").then(lock => {
                        mainvalue = lock;
                    });
                }
                call1.on("stream",stream2 => {
                    videotop.srcObject = stream2;
                    videotop.onloadedmetadata = () => {
                        videotop.play();
                    }
                    topdiv.append(videotop);
                });
                call1.on("close",() => {
                    if(browser == "Chrome"){
                        mainvalue.release();
                        mainvalue = null;
                    }
                    if(ourstream != null){
                        ourstream.getTracks().forEach(track => {
                            track.stop();
                        });
                        ourstream = null;
                    }
                    socket.emit("videocall",{
                        call: 0,
                        email: loggedinemail
                    });
                });
            });
            close.addEventListener("click",() => {
                ourstream.getTracks().forEach(track => {
                    track.stop();
                });
                ourstream = null;
                peer.destroy();
                closefunc();
                socket.emit("left",{
                    left: "caller",
                    caller: videocaller,
                    receiver: videoreceiver
                });
            });
        });
    }
});

socket.on("left",() => {
    topdiv.innerHTML = "";
    const newdiv = document.createElement("div");
    const newp = document.createElement("p");
    newp.textContent = `${name} left`;
    newdiv.appendChild(newp);
    topdiv.appendChild(newdiv);
    setTimeout(() => {
        peer.destroy();
        closefunc();
        topdiv.innerHTML = "";
    },2000);
});

document.addEventListener("visibilitychange",() => {
    if(document.visibilityState == "hidden"){
        if(ourstream != null){
            peer.destroy();
            closefunc();
            socket.emit("left",{
                left: "caller",
                caller: videocaller,
                receiver: videoreceiver
            });
        }
        socket.disconnect();
    }
    else{
        socket.connect();
        socket.emit("onconnect",{
            email: loggedinemail
        });
        if(chatroomemail != ""){
            loader1.classList.remove("none");
            axios.post("https://wassuppro.herokuapp.com/shownewmsgs",{
                from: chatroomemail,
                to: loggedinemail
            }).then(result => {
                socket.emit("seen",{
                    from: chatroomemail,
                    to: loggedinemail
                });
                retrievechats(loggedinemail,chatroomemail,result.data.length);
                socket.emit("clear",{
                    from: chatroomemail,
                    to: loggedinemail
                });
            });
            // retrievechats(loggedinemail,chatroomemail);
            // socket.emit("clear",{
            //     from: chatroomemail,
            //     to: loggedinemail
            // });
        }
        else{
            getallchats(0);
        }
    }
});

socket.on("interruptres",data => {
    if(data.res == "go ahead"){
        socket.emit("callreq",{
            req: 1,
            caller: loggedinemail,
            callername: loggedinname,
            receiver: chatroomemail
        });
        socket.emit("videocall",{
            call: 1,
            email: loggedinemail
        });
    }
    else{
        p.children[0].innerText = "busy";
        setTimeout(() => {
            p.children[0].innerText = "";
            callermodal.classList.add("none");
        },2000);
    }
});

// window.addEventListener("hashchange",e => {
//     e.preventDefault();
//     if(!addscreen.classList.contains("none")){
//         cancelbutton.click();
//     }
//     else if(!chatroom.classList.contains("none")){
//         backbutton.click();
//     }
//     else if(!callui.classList.contains("none")){
//         close.click();
//     }
//     else{}
// });

// history.pushState(null, null, location.href);
// window.onpopstate = function () {
//     if(!addscreen.classList.contains("none")){
//         cancelbutton.click();
//     }
//     else if(!chatroom.classList.contains("none")){
//         backbutton.click();
//     }
//     else if(!callui.classList.contains("none")){
//         close.click();
//     }
//     else{}
// };
history.pushState(null, null, window.top.location.pathname + window.top.location.search);
window.addEventListener('popstate', (e) => {
    e.preventDefault();
    if(!addscreen.classList.contains("none")){
        cancelbutton.click();
    }
    else if(!chatroom.classList.contains("none")){
        backbutton.click();
    }
    else if(!callui.classList.contains("none")){
        close.click();
    }
    else{}
    history.pushState(null, null, window.top.location.pathname + window.top.location.search);
});

textarea.addEventListener("keyup",e => { 
    if(e.keyCode == 13){
        sendbutton.click();
    }
});