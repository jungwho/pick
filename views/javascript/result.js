// loading

var showPage = function() {
    var loader = document.getElementById("loader");
    var container = document.getElementById("container");
    loader.style.display = "none";
    container.style.display = "block";
};

setTimeout(() => {
    showPage();
    console.log("finish")
}, 1000);

// regenerate

const top1 = ["../../image/top1.jpg", "../../image/top2.jpg"]
const top2 = ["../../image/top3.jpg", "../../image/top4.jpg"]
const top3 = ["../../image/top5.jpg", "../../image/top6.jpg"]
const topImg = [top1, top2, top3]

const bot1 = ["../../image/bot1.jpg", "../../image/bot2.jpg"]
const bot2 = ["../../image/bot3.jpg", "../../image/bot4.jpg"]
const bot3 = ["../../image/bot5.jpg", "../../image/bot6.jpg"]
const botImg = [bot1, bot2, bot3]

var img1 = document.getElementById("img1");
var img2 = document.getElementById("img2");

var img3 = document.getElementById("img3");
var img4 = document.getElementById("img4");

var i = 0

function topChange1() {
    i--
    if(i === -1){i = 2}
    img1.src = topImg[i][0];
    img2.src = topImg[i][1];
}

function topChange2() {
    i++
    if(i === 3){i = 0}
    img1.src = topImg[i][0];
    img2.src = topImg[i][1];
}

function botChange1() {
    i--
    if(i === -1){i = 2}
    img3.src = botImg[i][0];
    img4.src = botImg[i][1];
}

function botChange2() {
    i++
    if(i === 3){i = 0}
    img3.src = botImg[i][0];
    img4.src = botImg[i][1];
}