
function animation(image) {

    let anims = [
        1 = pict2pix.animate({
            image: image,
            particleType: 'led-matrix',
            type: 'random',
            transitionTime: 2000,
            idleTime: 5000,
            ledSize: 4
        }),

        2 = pict2pix.animate({
            image: image,
            numberOfParticles: 800,
            horizontalSpeed: 1,
            verticalSpeed: -1,
            particleType: 'twisted-particle'
        }),

        3 = pict2pix.animate({
            image: image,
            particleType: 'halftone', 
            transitionTime: 10000,
            idleTime: 4000,
            color: 'rgb(0, 60, 90)', 
            separation: 8
        })
    ];
    
};

function startAnimation(image) {
    var rand = Math.floor(Math.random() * 3) + 1;
    animation(image);
};


$(document).ready(function () {
    var image = document.getElementById('image-jh');
    startAnimation(image);
});