
function animation(rand, image) {

    let anims = [
        pict2pix.animate({
            image: image,
            particleType: 'led-matrix',
            type: 'random',
            transitionTime: 2000,
            idleTime: 5000,
            ledSize: 4
        }),

        pict2pix.animate({
            image: image,
            numberOfParticles: 800,
            horizontalSpeed: 1,
            verticalSpeed: -1,
            particleType: 'twisted-particle'
        }),

        pict2pix.animate({
            image: image,
            particleType: 'halftone', 
            transitionTime: 10000,
            idleTime: 4000,
            color: 'rgb(0, 60, 90)', 
            separation: 8
        })
    ];
    
    anims[rand];
};

function startAnimation(image) {
    var rand = Math.floor(Math.random() * 3) + 1;
    animation(rand, image);
};


$(document).ready(function () {
    var image = document.getElementById('image-jh');
    startAnimation(image);
});