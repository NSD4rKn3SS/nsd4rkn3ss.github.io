function startAnimation(image) {
    pict2pix.animate({
        image: image,
        particleType: 'led-matrix',
        type: 'random',
        transitionTime: 2000,
        idleTime: 5000,
        ledSize: 4
    });
};


$(document).ready(function () {
    var image = document.getElementById('image-jh');
    startAnimation(image);
});