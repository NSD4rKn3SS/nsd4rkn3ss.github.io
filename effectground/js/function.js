
var anims = {
    1: animation1(image),
    2: animation2(image),
    3: animation3(image)
}
function animation1(image) {
    pict2pix.animate({
        image: image,
        particleType: 'led-matrix',
        type: 'random',
        transitionTime: 2000,
        idleTime: 5000,
        ledSize: 4
    });
};
function animation2(image) {
    pict2pix.animate({
        image: image,
        numberOfParticles: 800,
        horizontalSpeed: 1,
        verticalSpeed: -1,
        particleType: 'twisted-particle'
    });
};

function animation3(image) {
    pict2pix.animate({
        image: image,
        particleType: 'halftone', 
        transitionTime: 10000,
        idleTime: 4000,
        color: 'rgb(0, 60, 90)', 
        separation: 8
    });
};

function startAnimation(image) {
    var rand = Math.floor(Math.random() * 3) + 1;
    anims[rand](image);
};


$(document).ready(function () {
    var image = document.getElementById('image-jh');
    startAnimation(image);
});