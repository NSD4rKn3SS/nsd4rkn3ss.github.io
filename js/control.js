//Mozgatás funkciók definiálása
let leftStart, rightStart, upStart, downStart, leftUpStart, rightUpStart, leftDownStart, rightDownStart, mvmntStop, schemeOption;

//Bal oldalra mozgatás
leftStart = function() {
    //Hős sebességének változtatása lenyomásra
    scavHunter.hero.vx = -2.5; //x tengelyen való negatív eltolás
    scavHunter.hero.vy = 0;  //y tengelyen nem változtatunk
    scavHunter.hero.play();  //Sprite animáció lejátszása
    scavHunter.hero.rotation = 0; //Sprite forgatásának alapra állítása
    scavHunter.hero.scale.x = -1; //Sprite tükrözése X tengelyen tehát vízszintesen
};

//Jobb oldalra mozgatás
rightStart = function() {
    scavHunter.hero.vx = 2.5;
    scavHunter.hero.vy = 0;
    scavHunter.hero.play();
    scavHunter.hero.rotation = 0;
    scavHunter.hero.scale.x = 1;
};

//Felfele mozgatás
upStart = function() {
    scavHunter.hero.vy = -2.5;
    scavHunter.hero.vx = 0;
    scavHunter.hero.play();
    scavHunter.hero.scale.x = 1;
    scavHunter.hero.rotation = 5;
};

//Lefele mozgatás
downStart = function() {
    scavHunter.hero.vy = 2.5;
    scavHunter.hero.vx = 0;
    scavHunter.hero.play();
    scavHunter.hero.scale.x = 1;
    scavHunter.hero.rotation = -5;
};

//Balra fel mozgatás
leftUpStart = function() {
    scavHunter.hero.vx = -2.5;
    scavHunter.hero.vy = -2.5;
    scavHunter.hero.play();
    scavHunter.hero.rotation = -2.5;
    scavHunter.hero.scale.x = 1;
};

//Jobbra fel mozgatás
rightUpStart = function() {
    scavHunter.hero.vx = 2.5;
    scavHunter.hero.vy = -2.5;
    scavHunter.hero.play();
    scavHunter.hero.rotation = 2.5;
    scavHunter.hero.scale.x = -1;
};

//Balra le mozgatás
leftDownStart = function() {
    scavHunter.hero.vx = -2.5;
    scavHunter.hero.vy = 2.5;
    scavHunter.hero.play();
    scavHunter.hero.rotation = 2.5;
    scavHunter.hero.scale.x = 1;
};

//Jobbra le mozgatás
rightDownStart = function() {
    scavHunter.hero.vx = 2.5;
    scavHunter.hero.vy = 2.5;
    scavHunter.hero.play();
    scavHunter.hero.rotation = -2.5;
    scavHunter.hero.scale.x = -1;
};

//Mozgatás megállítása
mvmntStop = function() {
    scavHunter.hero.vx = 0;
    scavHunter.hero.vy = 0;
    scavHunter.hero.stop(); //Sprite animáció megállítása
};
schemeOption = {
    'keyboard' : function () {
        //Billentyű leütések figyelése
        //Új billentyű leütés érzékelés
        // postfix U,D,L,R for Up down left right
        const KEY_U = 1;
        const KEY_D = 2;
        const KEY_L = 4;
        const KEY_R = 8;
        const KEY_UL = KEY_U + KEY_L; // up left
        const KEY_UR = KEY_U + KEY_R; // up Right
        const KEY_DL = KEY_D + KEY_L; // down left
        const KEY_DR = KEY_D + KEY_R; // down right

        var arrowBits = 0;  // the value to hold the bits
        const KEY_BITS = [4,1,8,2]; // left up right down
        const KEY_MASKS = [0b1011,0b1110,0b0111,0b1101]; // left up right down
        window.onkeydown = window.onkeyup = function (e) {
            if(e.keyCode >= 37 && e.keyCode <41){
                if(e.type === "keydown"){
                    arrowBits |= KEY_BITS[e.keyCode - 37];
                }else{
                    arrowBits &= KEY_MASKS[e.keyCode - 37];
                }
            }
            if (arrowBits) {
                if (arrowBits === KEY_L) { leftStart(); }
                if (arrowBits === KEY_R) { rightStart(); }
                if (arrowBits === KEY_U) { upStart(); }
                if (arrowBits === KEY_D) { downStart(); }
                if (arrowBits === KEY_UL) { leftUpStart(); }
                if (arrowBits === KEY_DL) { leftDownStart(); }
                if (arrowBits === KEY_UR) { rightUpStart(); }
                if (arrowBits === KEY_DR) { rightDownStart(); }
            } else {
                mvmntStop();
            }
        };
    },
    'joystick' : function(){
        //Virtual Joystick
        let joystick, joystickHandler;
        //console.log("touchscreen is", VirtualJoystick.touchScreenAvailable() ? "available" : "not available");
        joystick	= new VirtualJoystick({
            container	: document.getElementById('uluTouch'),
            mouseSupport	: true,
        });
        joystickHandler = function() {
            if ((joystick.left() && !joystick.up()) || (joystick.left() && !joystick.down()))       { leftStart(); }
            if ((joystick.right() && !joystick.up()) || (joystick.right() && !joystick.down()))     { rightStart(); }
            if ((!joystick.left() && joystick.up()) || (!joystick.right() && joystick.up()))        { upStart(); }
            if ((!joystick.left() && joystick.down()) || (!joystick.right() && joystick.down()))    { downStart(); }
            if (joystick.left() && joystick.up())     { leftUpStart(); }
            if (joystick.left() && joystick.down())   { leftDownStart(); }
            if (joystick.right() && joystick.up())    { rightUpStart(); }
            if (joystick.right() && joystick.down())  { rightDownStart(); }
            if (!joystick.left() && !joystick.up() && !joystick.right() && !joystick.down()) { mvmntStop(); }
        };
        joystickTimer = setInterval(joystickHandler, 1/30 * 1000);
    },
    'pad' : function(){
        //első fajta touch irányítás
        //Bal gomb
        $('#touchLeft')     .bind('touchstart', function(e) { leftStart();})     .bind('touchend', function(e) { mvmntStop();});
        //Jobb gomb
        $('#touchRight')    .bind('touchstart', function(e) { rightStart();})    .bind('touchend', function(e) { mvmntStop();});
        //Fel gomb
        $('#touchUp')       .bind('touchstart', function(e) { upStart();})       .bind('touchend', function(e) { mvmntStop();});
        //Le gomb
        $('#touchDown')     .bind('touchstart', function(e) { downStart();})     .bind('touchend', function(e) { mvmntStop();});
        //BalFel gomb
        $('#touchLeftUp')   .bind('touchstart', function(e) { leftUpStart();})   .bind('touchend', function(e) { mvmntStop();});
        //BalLe gomb
        $('#touchLeftDown') .bind('touchstart', function(e) { leftDownStart();}) .bind('touchend', function(e) { mvmntStop();});
        //JobbFel gomb
        $('#touchRightUp')  .bind('touchstart', function(e) { rightUpStart();})  .bind('touchend', function(e) { mvmntStop();});
        //JobbLe gomb
        $('#touchRightDown').bind('touchstart', function(e) { rightDownStart();}).bind('touchend', function(e) { mvmntStop();});
        //Irányítás megjelenítése
        if ('ontouchstart' in window) { $('#uluBtns').show(); } else { $('#uluBtns').hide(); }
    }
};