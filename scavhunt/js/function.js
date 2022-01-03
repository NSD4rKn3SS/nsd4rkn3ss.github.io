function setCookie(name, value, daysToLive) {
    // Encode value in order to escape semicolons, commas, and whitespace
    let cookie = name + "=" + encodeURIComponent(value);

    if(typeof daysToLive === "number") {
        /* Sets the max-age attribute so that the cookie expires
        after the specified number of days */
        cookie += "; max-age=" + (daysToLive*24*60*60);

        document.cookie = cookie;
    }
}

function getCookie(name) {
    // Split cookie string and get all individual name=value pairs in an array
    let cookieArr = document.cookie.split(";");

    // Loop through the array elements
    for(var i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");

        /* Removing whitespace at the beginning of the cookie name
        and compare it with the given string */
        if(name == cookiePair[0].trim()) {
            // Decode the cookie value and return
            return decodeURIComponent(cookiePair[1]);
        }
    }

    // Return null if not found
    return null;
}

function checkCookie(name) {
    // Get cookie using our custom function
    let cookieName = getCookie(name);

    if (cookieName) { return true; } else { return false;}
}

//Időkalkuláció
function timeDiff(timestamp1, timestamp2) {
    let difference = timestamp2 - timestamp1;
    //let daysDifference = Math.floor(difference/1000/60/60/24);
    let secDifference = Math.floor(difference/1000);
    return secDifference;
}
//többször használatos változók definiálása
let state, hero, ulu, scavs, plains, waters,
    portal, healthBar, message, gameScene, gameOverScene,
    id, timerHS, playtime, hpBarSet, numberOfScavs, schemeOption,
    viewPw, viewPh, positionMessage, hpLeft, hpLost, gotUlu,
    currGameMode, controller, scavMod, gameMode, updateInfoBox, speedOfScavs, uluInitialPos, playerInitialPos, uluHitBox;
let deadScav = 0;
let testedUlu = false;

updateInfoBox = function() {
    $('#ctrlScheme input[value="'+controller+'"]').attr('checked', 'checked');
    $('#numberOfScavs').val(scavMod);
    $('#speedOfScavs').val(speedOfScavs);
    $('#multiText').html(speedOfScavs);
    $('#gameMode input[value="'+gameMode+'"]').attr('checked', 'checked');
    $('#currSettings').empty().append(
        'Control scheme: <i>'+controller+'</i>' +
        '<br>Game mode: <i>'+gameMode+'</i>' +
        '<br>Number of scavengers: <i>'+scavMod+'</i>' +
        '<br>Scavenger speed multiplier: <i>'+speedOfScavs+'</i>' +
        '<br><small>* Cookies are used to store these data</small>'
    );
};

function getGameSettings() {
    controller = checkCookie('ctrlScheme') ? getCookie('ctrlScheme') : $('#ctrlScheme input:checked').attr('value');
    scavMod =  checkCookie('numberOfScavs') ? getCookie('numberOfScavs') : $('#numberOfScavs').val();
    speedOfScavs = checkCookie('speedOfScavs') ? getCookie('speedOfScavs') : $('#speedOfScavs').val();
    gameMode =  checkCookie('gameMode') ? getCookie('gameMode') : $('#gameMode input:checked').attr('value');
    updateInfoBox();
}

function setGameSettings(from) {
    if (from === 'settings') {
        controller = $('#ctrlScheme input:checked').attr('value');
        gameMode = $('#gameMode input:checked').attr('value');
        setCookie('gameMode', gameMode, 7);
        setCookie('ctrlScheme', controller, 7);
    }
    if (from === 'mods') {
        scavMod = $('#numberOfScavs').val();
        speedOfScavs = $('#speedOfScavs').val();
        setCookie('numberOfScavs', scavMod, 7);
        setCookie('speedOfScavs', speedOfScavs, 7);
    }
    updateInfoBox();
}

let startGame = false;

$(document).ready(function($) {
    uluInitialPos = {
        x : 0,
        y : 0,
    };
    playerInitialPos = {
        x : 0,
        y : 0,
    };

     //PIXI aliasok definiálása
    let Application = PIXI.Application,
        Container = PIXI.Container,
        loader = PIXI.Loader.shared,
        resources = PIXI.Loader.shared.resources,
        Graphics = PIXI.Graphics,
        TextureCache = PIXI.utils.TextureCache,
        Sprite = PIXI.Sprite,
        AnimatedSprite =  PIXI.AnimatedSprite,
        Text = PIXI.Text,
        TextStyle = PIXI.TextStyle;

    //canvas beltartalmának automatikus átméretezése az ablakkal
    //Különbözeti százalékszámítás funkciója
    let diff = function(a, b) {
        return  ((a * 100) / b) / 100;
    };

    startGame = function(ctrlScheme, scavMod, gameMode) {

        currGameMode = gameMode;

        //PIXI app létrehozása
        let app = new Application({
            width: 512,
            height: 512,
            antialiasing: true,
            transparent: true,
            resolution: 1
        });

        let windowSize = function() {
            viewPw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            viewPh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            //megvizsgáljuk hogy kisebb-e a viewport a játék méreténél
            if (viewPw < 512 || viewPh < 512) {
                //százalékos arányba csökkentjük a játék beltartalmát
                app.stage.scale.set(diff(viewPw, 512));
                //eltolást alkalmazunk az irányítógombokra annyival amennyivel kisebb a játék beltartalma
                $('#uluBtns').css('margin-top', '-'+(512 - viewPw)+'px');
            }
        };

        windowSize();
        window.addEventListener("resize", windowSize);

        //PIXI hozzáadása bodyhoz
        //document.body.appendChild(app.view);
        document.getElementById('uluGame').appendChild(app.view);

        hpBarSet = function(x, y) {
            healthBar.position.set(x - 25, y - 20);
        };

        positionMessage = function() {
            message.x = (app.stage.width / app.stage.scale.x) / 2;
            message.y = (app.stage.height / 2) - 60 ;
            message.anchor.set(0.5, 0.5);
        };

        //resourceok létrehozása
        loader
            .add("img/scav/scavrun.json")
            .add("img/orcrun/orcrun.json")
            .add("img/water/water.json")
            .add("img/ulu.png")
            .add("img/grass.png")
            .add("img/treasureHunter.json")
            .add("img/portal.png")
            .load(setup);


        function setup() {
            //alap jelenet hozzáadása a stagehez
            gameScene = new Container();
            app.stage.addChild(gameScene);

            //Textúrák felparaméterezése
            id = {
                'scav' : resources["img/scav/scavrun.json"].spritesheet,
                'orc' : resources["img/orcrun/orcrun.json"].spritesheet,
                'water' : resources["img/water/water.json"].spritesheet,
                'ulu' : resources["img/ulu.png"].texture,
                'grass' : resources["img/grass.png"].texture,
                'portal' : resources["img/portal.png"].texture,
                'orith' : resources["img/treasureHunter.json"].textures,
            };

            //Pálya alapja
            waters = new AnimatedSprite(id['water'].animations["water"]);
            waters.wrapMode = PIXI.WRAP_MODES.REPEAT;
            waters.animationSpeed = 0.1;
            waters.play();
            plains = new Sprite(id['grass']);
            gameScene.addChild(waters);
            gameScene.addChild(plains);

            //Kijárat
            portal = new Sprite(id['portal']);
            if (currGameMode === 'new') {
                portal.position.set(randomInt(50, 430), randomInt(50, 430));
            } else {
                portal.position.set(40, 430);
            }
            gameScene.addChild(portal);

            //Játékos karakter létrehozása és elhelyezése
            hero = new AnimatedSprite(id['orc'].animations["orcrun"]);
            hero.animationSpeed = 0.2;
            if (currGameMode === 'new') {
                hero.x = randomInt(60, 450);
                hero.y = randomInt(60, 450);
            } else {
                hero.x = 68;
                hero.y = gameScene.height / 2 - hero.height / 2;
            }
            playerInitialPos.x = hero.x;
            playerInitialPos.y = hero.y;
            hero.vx = 0;
            hero.vy = 0;
            hero.anchor.y = 0.5;
            hero.anchor.x = 0.5;
            gameScene.addChild(hero);

            //Fegyver létrehozása és elhelyezése
            ulu = new Sprite(id['ulu']);

            //ulu.x = gameScene.width - ulu.width - 48;
            //ulu.y = gameScene.height / 2 - ulu.height / 2;
            if (currGameMode === 'new') {
                ulu.x = randomInt(60, 450);
                ulu.y = randomInt(60, 450);
            } else {
                ulu.x = 450;
                ulu.y = 60;
            }
            uluInitialPos.x = ulu.x;
            uluInitialPos.y = ulu.y;
            ulu.anchor.y = 0.5;
            ulu.anchor.x = 0.5;
            gameScene.addChild(ulu);

            if (currGameMode === 'new') {
                //Hitbox adása a fegyvernek
                uluHitBox = new Graphics();
                uluHitBox.beginFill(0xFFFFFF);
                uluHitBox.drawRect(0.5, 0.5, 50, 25);
                uluHitBox.position.x = ulu.x - 25;
                uluHitBox.position.y = ulu.y - 25;
                uluHitBox.endFill();
                uluHitBox.tint = 0x00FF00;
                gameScene.addChild(uluHitBox);
            }

            //Ellenfelek létrehozása és tömb létesítése az eltárolásukhoz
            if (scavMod) {
                if (scavMod == 'random') { numberOfScavs = randomInt(6,12); }
                else if (scavMod == 'insane') { numberOfScavs = 24; }
                else { numberOfScavs = scavMod }
            } else {
                numberOfScavs = randomInt(6,12);
            }
            
            let spacing = 48,
                xOffset = 150,
                direction = 1;

            scavs = [];

            //Ellenfelek létrehozása az alapján hogy mennyit adtunk meg a `numberOfScavs` változóba
            for (let i = 0; i < numberOfScavs; i++) {
                //ellenfél sprite létrehozása, animáció gyorsaságának beállítása és indítása
                let scav = new AnimatedSprite(id['scav'].animations["walk"]);
                scav.animationSpeed = 0.2;
                scav.play();

                //Vízszintesen elrendezzük őket egymástól távolabb a `spacing` érték alapján.
                //`xOffset` határozza meg a távolságot a képernyő bal oldalától ami alapján az első ellenfél hozzáadásra kerül
                let x = spacing * i + xOffset;

                //Adunk neki egy random Y pozíciót
                let y = randomInt(0, app.stage.height - scav.height);

                //Beállítjuk az éppen generált ellenfél pozícióját
                scav.x = x;
                scav.y = y;

                //Beállítjuk az ellenfelek függőleges gyorsulását.
                //Az irány avagy `direction` vagy `1` vagy `-1`.
                //`1` azt jelenti hogy lefele míg a `-1` azt hogy felfele mozognak
                //`direction` szorzása a `speed` (sebesség) -el, meghatározzás a függőleges mozgás irányt
                scav.vy = (randomInt(1, 4) * direction) * speedOfScavs;

                //Beállítjuk az ellenfél vízszintes gyorsulását a játékos irányába
                scav.vx = (randomInt(2, 4) * direction) * speedOfScavs;

                //Irány megváltoztatása a következő lefutásnál
                direction *= -1;

                //Ellenfél hozzá adása a `scavs` tömbhöz
                scavs.push(scav);

                //Ellenfél hozzáadása az alap jelenethez `gameScene`
                gameScene.addChild(scav);
            }

            //Életerő vonal generálása
            healthBar = new Container();
            healthBar.position.set(hero.x - 25, hero.y - 20);
            gameScene.addChild(healthBar);

            //Életerő sötét hátterének felparaméterezése
            let innerBar = new Graphics();
            innerBar.beginFill(0x000000);
            innerBar.drawRect(0, 0, 50, 4);
            innerBar.endFill();
            healthBar.addChild(innerBar);

            //Életerő vonal felparaméterezése
            let outerBar = new Graphics();
            outerBar.beginFill(0xFF3300);
            outerBar.drawRect(0,0, 50, 4);
            outerBar.endFill();
            healthBar.addChild(outerBar);
            //könnyebb referenciáért beállítjuk ezt a tulajdonságot
            healthBar.outer = outerBar;

            //Meghalás esetére létrehozott jelenet `gameOver` ami alapértelmezetten nem látható
            gameOverScene = new Container();
            app.stage.addChild(gameOverScene);
            gameOverScene.visible = false;

            //Szöveg sprite létrehozása és hozzá adása a halál jelenethez
            let style = new TextStyle({
                fontFamily: "GothicInGame",
                fontSize: 46,
                fontWeight: 400,
                align : 'center',
                fill: 'white'
            });
            message = new Text("You Died! \n and survived \n X seconds", style);
            positionMessage();
            gameOverScene.addChild(message);

            //Mozgatás funkciók definiálása
            let leftStart, rightStart, upStart, downStart, leftUpStart, rightUpStart, leftDownStart, rightDownStart, mvmntStop, heroAttack, heroAttackStop;

            heroAttack = function() {
                if (currGameMode === 'new') {
                    uluHitBox.tint = 0x0000FF;
                    //if (hitTestRectangle(hero, ulu)) {
                        $.each(scavs, function (i,v) {
                            if (scavs[i]._destroyed === false) {
                                if (hitTestRectangle(uluHitBox, scavs[i])) {
                                    uluHitBox.tint = 0xFF0000;
                                    deadScav += + 1;
                                    gameScene.removeChild(scavs[i]);
                                    scavs[i].destroy();
                                    scavs[i].visible = false;
                                    scavs[i].renderable = false;
                                    scavs[i].tint = 0xFF3333;
                                    //console.log(scavs[i]);
                                    //scavs.splice(i, 1);
                                    //delete(scavs[i]);
                                } else {
                                    scavs[i].tint = 0xFFFFFF;
                                }
                            }
                        });
                    //}
                }
            };

            heroAttackStop = function() {
                if (currGameMode === 'new') {
                    uluHitBox.tint = 0x00FF00;
                }
            };

            //Bal oldalra mozgatás
            leftStart = function() {
                //Hős sebességének változtatása lenyomásra
                hero.vx = -2.5; //x tengelyen való negatív eltolás
                hero.vy = 0;  //y tengelyen nem változtatunk
                hero.play();  //Sprite animáció lejátszása
                hero.rotation = 0; //Sprite forgatásának alapra állítása
                hero.scale.x = -1; //Sprite tükrözése X tengelyen tehát vízszintesen
            };

            //Jobb oldalra mozgatás
            rightStart = function() {
                hero.vx = 2.5;
                hero.vy = 0;
                hero.play();
                hero.rotation = 0;
                hero.scale.x = 1;
            };

            //Felfele mozgatás
            upStart = function() {
                hero.vy = -2.5;
                hero.vx = 0;
                hero.play();
                hero.scale.x = 1;
                hero.rotation = 5;
            };

            //Lefele mozgatás
            downStart = function() {
                hero.vy = 2.5;
                hero.vx = 0;
                hero.play();
                hero.scale.x = 1;
                hero.rotation = -5;
            };

            //Balra fel mozgatás
            leftUpStart = function() {
                hero.vx = -2.5;
                hero.vy = -2.5;
                hero.play();
                hero.rotation = -2.5;
                hero.scale.x = 1;
            };

            //Jobbra fel mozgatás
            rightUpStart = function() {
                hero.vx = 2.5;
                hero.vy = -2.5;
                hero.play();
                hero.rotation = 2.5;
                hero.scale.x = -1;
            };

            //Balra le mozgatás
            leftDownStart = function() {
                hero.vx = -2.5;
                hero.vy = 2.5;
                hero.play();
                hero.rotation = 2.5;
                hero.scale.x = 1;
            };

            //Jobbra le mozgatás
            rightDownStart = function() {
                hero.vx = 2.5;
                hero.vy = 2.5;
                hero.play();
                hero.rotation = -2.5;
                hero.scale.x = -1;
            };

            //Mozgatás megállítása
            mvmntStop = function() {
                hero.vx = 0;
                hero.vy = 0;
                hero.stop(); //Sprite animáció megállítása
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

                    let arrowBits = 0;  // the value to hold the bits
                    const KEY_BITS = [4,1,8,2]; // left up right down
                    const KEY_MASKS = [0b1011,0b1110,0b0111,0b1101]; // left up right down
                    window.onkeydown = window.onkeyup = function (e) {
                        if (e.keyCode === 17 && currGameMode === 'new' && e.type === "keydown" ) {
                            if (hitTestRectangle(hero, ulu)) {
                                heroAttack();
                            }
                        } else if (e.keyCode === 17 && e.type === 'keyup') {
                            if (hitTestRectangle(hero, ulu)) {
                                heroAttackStop();
                            }
                        }
                        if (e.keyCode >= 37 && e.keyCode <41){
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
                    joystick    = new VirtualJoystick({
                        container   : document.getElementById('uluTouch'),
                        mouseSupport    : true,
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
                    //Irányítás megjelenítése
                    $('#uluBtns').show();
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
                    //Támadás gomb
                    if (currGameMode === 'new') {
                        $('#touchAttack').bind('touchstart', function(e) { heroAttack(); }).bind('touchend', function (e) { heroAttackStop(); });
                    }
                }
            };

            schemeOption[ctrlScheme]();

            timerHS = {
                'start' : Math.floor(Date.now() / 1000),
                'current' : '',
                'end' : '',
            };

            $('#playMenu').hide();

            //Játék állapot beállítása
            state = play;

            //játék loop elindítása
            app.ticker.add(delta => gameLoop(delta));

        }

        function gameLoop(delta){

            //Jelenlegi játékállapot frissítése:
            state(delta);
        }

        function play(delta) {
            //Frissítjük az időbélyeget
            timerHS['current'] = Math.floor(Date.now() / 1000);

            //A hős sebességét használva, mozgatjuk a grafikáját
            hero.x += hero.vx;
            hero.y += hero.vy;
            hpBarSet(hero.x, hero.y);

            //Hős pályaterületen tartása
            //X a játszhatő terület első vízszintes pontja
            //Y az első függőleges
            //width és height a maximális szélessége és hosszúsága a pályának
            contain(hero, {x: 45, y: 45, width: 495, height: 510});
            //contain(hero, stage);

            //Ütközés előtt beállítjuk a hős attributumát `heroHit`, `false`-ra
            let heroHit = false;

            //Végig loopoljuk az összes Sprite-ot az ellenfelek tömbjében
            if (scavs.length > 0) {
                //console.log(scavs);
                scavs.forEach(function(scav) {
                    if (scav._destroyed === false) {
                        //Mozgatjuk az ellenfeleket
                        scav.y += scav.vy;
                        scav.x += scav.vx;

                        //Beállítjuk az ellenfeleknél is a pálya területet
                        let scavHitsWall = contain(scav, {x: 45, y: 50, width: 480, height: 500});

                        //Megnézzük az orientációját az ellenfélnek és affelé forgatjuk
                        scav.heading = Math.atan2(scav.vy, scav.vx);
                        scav.rotation = scav.heading + 1.55;

                        //Ha egy ellenfél nekimegy a falnak, megfordítjuk a mozgás irányát
                        if (scavHitsWall === "top" || scavHitsWall === "bottom") {
                            if (randomInt(1, 2) === 1) {
                                if (scav.vx === 0) {
                                    if (randomInt(1, 2) === 1) {
                                        scav.vx = (randomInt(1, 3) * 1) * speedOfScavs;
                                    } else {
                                        scav.vx = (randomInt(1, 3) * -1) * speedOfScavs;
                                    }
                                } else if (scav.vy !== 0) {
                                    scav.vx = 0;
                                } else {
                                    scav.vx = (randomInt(1, 3) * -1) * speedOfScavs;
                                }
                            }
                            scav.vy *= -1;
                        }
                        if (scavHitsWall === "left" || scavHitsWall === "right") {
                            if (randomInt(1, 2) === 1) {
                                if (scav.vy === 0) {
                                    if (randomInt(1, 2) === 1) {
                                        scav.vy = (randomInt(1, 3) * 1) * speedOfScavs;
                                    } else {
                                        scav.vy = (randomInt(1, 3) * -1) * speedOfScavs;
                                    }
                                } else if (scav.vx !== 0) {
                                    scav.vy = 0;
                                } else {
                                    scav.vy = (randomInt(1, 3) * -1) * speedOfScavs;
                                }
                            }
                            scav.vx *= -1;
                        }

                        //Megadjuk a forgatási középpontjukat
                        scav.anchor.y = 0.5;
                        scav.anchor.x = 0.5;

                        //Ellenfelek ütköztetése egymással
                        /*
                        scavs.forEach(function(otherScav) {
                            let randomScavHit = randomInt(1, 2);
                            if (hitTestRectangle(scav, otherScav)) {
                                scav.vy *= -1;
                                scav.vx *= -1;
                                otherScav.vy *= -1;
                                otherScav.vx *= -1;
                            }
                        });
                        */

                        /*
                        //Ellenfelek megszínezése sebességük alapján
                        let scavSpeed = Math.abs(scav.vx) + Math.abs(scav.vy);
                        let speedColorIndex = {
                            '0' : '0xDDFFFF',
                            '1' : '0xDDFFFF',
                            '2' : '0xFFDDFF',
                            '3' : '0xFFDDFF',
                            '4' : '0xFFFFDD',
                            '5' : '0xFFFFDD',
                            '6' : '0xDDDDFF',
                            '7' : '0xFFDDDD',
                            '8' : '0xDDFFDD',
                        };
                        //scav.alpha = 0.5;
                        scav.tint = speedColorIndex[scavSpeed];
                        scav.blendMode = PIXI.BLEND_MODES.COLOR_DODGE;
                        */


                        //Ütközést tesztelünk. Ha bármelyik ellenfél hozzáér a hőshöz,
                        //akkor átállítjuk a `heroHit` attributumot `true`-ra
                        if(hitTestRectangle(hero, scav) && (timerHS['current'] - (timerHS['start']) > 1)) {
                            heroHit = true;
                        }
                    }
                });
            } else {

            }


            //Ha a hős ütést kap...
            if(heroHit) {
                //Pirossá tesszük a hőst
                hero.tint = 0xFF3333;
                //Majd csökkentjük az életerő vonalát 1 pixellel azaz 2 ponttal
                healthBar.outer.width -= 1;
            } else {
                //Ha nem kap ütést, marad normál színű
                hero.tint = 0xFFFFFF;
            }

            //Kincs pozíciónálásának funkciója
            function uluSetPost(mode) {
                //Balra
                ulu.scale.x = hero.scale.x;
                if (hero.scale.x === -1) {
                    ulu.x = hero.x - 23;
                    ulu.scale.y = -1;
                    ulu.y = hero.y + 6;
                    if (currGameMode === 'new') {
                        uluHitBox.position.x = hero.x - 40;
                        uluHitBox.position.y = hero.y - 20;
                        uluHitBox.angle = 90;
                    }
                }
                //Jobbra
                if (hero.scale.x === 1) {
                    ulu.x = hero.x + 19;
                    ulu.scale.y = 1;
                    ulu.y = hero.y + 4;
                    if (currGameMode === 'new') {
                        uluHitBox.position.x = hero.x + 60;
                        uluHitBox.position.y = hero.y - 20;
                        uluHitBox.angle = 90;
                    }
                }
                //Le
                ulu.rotation = hero.rotation;
                if (hero.rotation === -5) {
                    ulu.scale.x = hero.scale.x;
                    ulu.scale.y = hero.scale.y;
                    ulu.x = hero.x + 4;
                    ulu.y = hero.y + 22;
                    if (currGameMode === 'new') {
                        uluHitBox.position.x = hero.x - 25;
                        uluHitBox.position.y = hero.y + 40;
                        uluHitBox.angle = 0;
                    }
                }
                //Fel
                if (hero.rotation === 5) {
                    ulu.scale.x = hero.scale.x;
                    ulu.scale.y = hero.scale.y;
                    ulu.x = hero.x + 10;
                    ulu.y = hero.y - 20;
                    if (currGameMode === 'new') {
                        uluHitBox.position.x = hero.x - 25;
                        uluHitBox.position.y = hero.y - 60;
                        uluHitBox.angle = 0;
                    }
                }

                //Balra fel mozgatás
                if (hero.rotation === -2.5 && hero.scale.x === 1) {
                    ulu.x = hero.x - 15;
                    ulu.y = hero.y - 17;
                    if (currGameMode === 'new') {
                        uluHitBox.position.x = hero.x - 60;
                        uluHitBox.position.y = hero.y - 30;
                        uluHitBox.angle = -45;
                    }
                }
                //Jobbra fel mozgatás
                if (hero.rotation === 2.5 && hero.scale.x === -1) {
                    ulu.x = hero.x + 15;
                    ulu.y = hero.y - 17;
                    if (currGameMode === 'new') {
                        uluHitBox.position.x = hero.x + 25;
                        uluHitBox.position.y = hero.y - 65;
                        uluHitBox.angle = 45;
                    }
                }
                //Balra le mozgatás
                if (hero.rotation === 2.5 && hero.scale.x === 1) {
                    ulu.x = hero.x - 15;
                    ulu.y = hero.y + 17;
                    if (currGameMode === 'new') {
                        uluHitBox.position.x = hero.x - 50;
                        uluHitBox.position.y = hero.y;
                        uluHitBox.angle = 45;
                    }
                }
                //Jobbra le mozgatás
                if (hero.rotation === -2.5 && hero.scale.x === -1) {
                    ulu.x = hero.x + 15;
                    ulu.y = hero.y + 17;
                    if (currGameMode === 'new') {
                        uluHitBox.position.x = hero.x + 10;
                        uluHitBox.position.y = hero.y + 35;
                        uluHitBox.angle = -45;
                    }
                }
                if (mode === 'new') {
                    //uluHitBox.position.x = hero.x - 25;
                    //uluHitBox.position.y = hero.y - 50;
                    //uluHitBox.angle = 0;
                } else {

                }
            }

            if (testedUlu === false) {
                //Megnézzük hogy a hős megtalálta-e a kincset a pályán
                if (hitTestRectangle(hero, ulu)) {
                    testedUlu = true;
                    //Ha a kincs hozzá ér a hőshöz, ráhelyezzük a hősre
                    uluSetPost(currGameMode);
                }
            } else {
                uluSetPost(currGameMode);
            }

            //Elég életereje van még a hősnek?
            //Ha az életerő kevesebb mint 0 akkor vége a játéknak
            //És megjelenítjük a végüzenetet
            if (healthBar.outer.width < 0) {
                hpLeft = Math.floor(healthBar.outer.width * 2);
                hpLost = 100 - hpLeft;

                //Megnézzük a végső időt, majd összevetjük a kezdéssel
                if (!timerHS['end']) {
                    timerHS['end'] = Math.floor(Date.now() / 1000);
                    playtime = timerHS['end'] - timerHS['start'];
                }

                if (hitTestRectangle(hero, ulu)) {
                    gotUlu = true;
                    message.text = ("You've got the Ulu mulu! \n But it wasn't enough \n There were "+numberOfScavs+" Scavengers \n From which you killed "+deadScav+" \n all this took you "+playtime+" seconds \n and you lost "+hpLost+" HP");
                    positionMessage();
                } else {
                    gotUlu = false;
                    message.text = ("Scavengers feed on your flesh! \n There were "+numberOfScavs+" Scavengers \n From which you killed "+deadScav+" \n all this took you "+playtime+" seconds \n and you lost "+hpLost+" HP");
                    positionMessage();
                }

                state = end;

            }

            //Ha a hős elvitte a kincset az ajtóig,
            //akkor megnyerte a játékot
            if (hitTestRectangle(ulu, portal)) {
                gotUlu = true;
                hpLeft = Math.floor(healthBar.outer.width * 2);
                hpLost = 100 - hpLeft;
                //Megnézzük a végső időt, majd összevetjük a kezdéssel
                if (!timerHS['end']) {
                    timerHS['end'] = Math.floor(Date.now() / 1000);
                    playtime = timerHS['end'] - timerHS['start'];
                }
                //if (hpLeft === 0) {hpLeft = 'no'}
                message.text = ("You survived the hunt! \n There were "+numberOfScavs+" Scavengers \n From which you killed "+deadScav+" \n all this took you "+playtime+" seconds \n and you lost "+hpLost+" HP");
                positionMessage();
                state = end;
            }
        }

        //A játék végén, a játék alap jelenete nem látható
        //míg a játék végének jelenete igen
        let pointsAquired = false;
        function end() {
            $('#uluBtns').hide();
            if (pointsAquired === false) {
                if (currGameMode === 'new' && gotUlu) {
                    pointsAquired = (((numberOfScavs * 10) + hpLost) + ((10 * deadScav) + (10 * speedOfScavs) * 2)) / playtime;
                } else if (currGameMode === 'new' && !gotUlu) {
                    pointsAquired = (((numberOfScavs * 10) + hpLost) + (10 * deadScav) + (10 * speedOfScavs)) / playtime;
                } else if (currGameMode === 'classic') {
                    pointsAquired = (((numberOfScavs * 10) + hpLost) + (10 * speedOfScavs) * 2) / playtime;
                }

                pointsAquired = Math.floor(pointsAquired);

                if (pointsAquired < 0) {pointsAquired = '0';}
                if (pointsAquired > 9999999999) {pointsAquired = '0';}
                console.log(
                    "You've found the Ulu-mulu: "+gotUlu+"\n"+
                    "Your HP is at: "+hpLeft+"\n"+
                    "HP lost: "+hpLost+"\n"+
                    "Spawned Scavengers: "+numberOfScavs+"\n"+
                    "Scavengers had a speed multiplier of: "+speedOfScavs+"\n"+
                    "Killed Scavengers: "+deadScav+"\n"+
                    "Playtime: "+playtime+"sec\n"+
                    "Your Score: "+pointsAquired +"\n"+
                    "The portal was spawned at: X = "+portal.position.x+"px and Y = "+portal.position.y+"px\n"+
                    "The player was spawned at: X = "+playerInitialPos['x']+"px and Y = "+playerInitialPos['y']+"px\n"+
                    "The ulu-mulu was spawned at: X = "+uluInitialPos['x']+"px and Y = "+uluInitialPos['y']+"px\n"
                );
            }
            message.text = (message.text +'\n Your Score: '+pointsAquired);
            $('#scorePoints').val(pointsAquired);
            $('#endScreen').show();
            gameScene.visible = false;
            gameOverScene.visible = true;
        }

        /* Segítő funkciók */
        //Ütközés a pályával `container`
        function contain(sprite, container) {

            let collision = undefined;

            //Bal
            if (sprite.x < container.x) {
                sprite.x = container.x;
                collision = "left";
            }

            //Felső
            if (sprite.y < container.y) {
                sprite.y = container.y;
                collision = "top";
            }

            //Jobb
            if (sprite.x + sprite.width > container.width) {
                sprite.x = container.width - sprite.width;
                collision = "right";
            }

            //Alsó
            if (sprite.y + sprite.height > container.height) {
                sprite.y = container.height - sprite.height;
                collision = "bottom";
            }

            //ütközés `collision` értékkel való visszatérés
            return collision;
        }

        //Az ütközéseket tesztelő funkció `hitTestRectangle`
        function hitTestRectangle(r1, r2) {

            //Változók definiálása amiket ki kell számolni
            let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

            //A `hit` határozza meg hogy történt-e ütközés
            hit = false;

            //Sprite-ok középpontjának megtalálása
            r1.centerX = r1.x + r1.width / 2;   //Első sprite vízszintes kpt.-ja
            r1.centerY = r1.y + r1.height / 2;  //Első sprite függőleges kpt.-ja
            r2.centerX = r2.x + r2.width / 2;
            r2.centerY = r2.y + r2.height / 2;

            //Fél-magasság és fél-szélesség kiszámítása a Sprite-oknál
            r1.halfWidth = r1.width / 2;    //Első szélességének a fele
            r1.halfHeight = r1.height / 2;  //Első magasságának a fele
            r2.halfWidth = r2.width / 2;
            r2.halfHeight = r2.height / 2;

            //Távolság vektorok kiszámítása
            vx = r1.centerX - r2.centerX;   //vízszintes távolság vektor kiszámítása két Sprite között
            vy = r1.centerY - r2.centerY;   //függőleges távolság vektor kiszámítása két Sprite között

            //Összegzett Fél-magasság és fél-szélesség kiszámítása
            combinedHalfWidths = r1.halfWidth + r2.halfWidth;
            combinedHalfHeights = r1.halfHeight + r2.halfHeight;

            //X tengelyen való ütközés vizsgálása
            //vízszintes vektor abszolút értéke kisebb mint az összegzett fél-szélesség
            if (Math.abs(vx) < combinedHalfWidths) {

                //Ha van ütközés akkor az Y tengelyen való ütközés vizsgálása
                //függőleges vektor abszolút értéke kisebb mint az összegzett fél-magasság
                if (Math.abs(vy) < combinedHalfHeights) {
                    //Megbizonyosodtunk az ütközésről
                    hit = true;
                } else {
                    //Nem nincs ütközés
                    hit = false;
                }
            } else {
                //Nincs ütközés az X tengelyen így nincs szükség további vizsgálatra
                hit = false;
            }
            //`hit` értékével visszatérünk ami innentől vagy `true` vagy `false`
            return hit;
        }

        //A `randomInt` helper funkció
        function randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    };

    getGameSettings();

    $('#playBtn').on('click touchstart', function (e) {
        getGameSettings();
        startGame(controller, scavMod, gameMode);
    });

    $('#playAgain').on('click touchstart', function () {
        location.reload();
    });

    // Variable to hold request
    var request;

    // Bind to the submit event of our form
    $("#highscoreForm").submit(function(event){

        // Prevent default posting of form - put here to work in case of errors
        event.preventDefault();

        // Abort any pending request
        if (request) {
            request.abort();
        }
        // setup some local variables
        var $form = $(this);

        // Let's select and cache all the fields
        var $inputs = $form.find("input, select, button, textarea");

        // Serialize the data in the form
        var serializedData = $form.serialize();

        // Let's disable the inputs for the duration of the Ajax request.
        // Note: we disable elements AFTER the form data has been serialized.
        // Disabled form elements will not be serialized.
        $inputs.prop("disabled", true);

        let localPath = location.href.replace(/[^/]*$/, '');
        // Fire off the request to /form.php
        request = $.ajax({
            //url: localPath+"scorePost.php",
            url: "https://nsd4rkn3ss.000webhostapp.com/scorePost.php",
            type: "get",
            data: serializedData
        });

        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            //console.log("Hooray, it worked!");
            location.reload();
        });

        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            //console.error(
            //    "The following error occurred: "+
            //    textStatus, errorThrown
            //);
            alert('Send failed, sorry :(');
        });

        // Callback handler that will be called regardless
        // if the request failed or succeeded
        request.always(function () {
            // Reenable the inputs
            $inputs.prop("disabled", false);
        });

    });
});

function loadXML() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            parseXML(this);
        }
    };
    //xhttp.open("GET", "highscores.xml", true);
    xhttp.open("GET", "https://nsd4rkn3ss.000webhostapp.com/highscores.xml", true);
    xhttp.send();
}

function parseXML(xml) {
    let i;
    let xmlDoc = xml.responseXML;
    let table="<tr><th>Name</th><th>Points</th></tr>";
    let x = xmlDoc.getElementsByTagName("SCORE");
    //x.sort(function(a, b){return b-a});
    let scores = [];
    for (i = 0; i < x.length; i++) {
        let name = x[i].getElementsByTagName("NAME")[0].childNodes[0].nodeValue;
        let score = x[i].getElementsByTagName("POINTS")[0].childNodes[0].nodeValue;
        scores.push({name : name, score : score});
    }
    //Rendezzük az adatokat a legnagyobb pontszám alapján
    scores.sort(function (a, b) {
        return a.score - b.score;
    }).reverse();
    //Táblázat készítése
    for (i = 0; i <scores.length; i++) {
        let name = scores[i].name;
        let score = scores[i].score;
        table += "<tr><td>" +
            name +
            "</td><td>" +
            score +
            "</td></tr>";
    }
    document.getElementById("highScore").innerHTML = table;
}