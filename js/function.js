function checkLocalStorage() {
    if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        return true;
    } else {
        // Sorry! No Web Storage support..
        return false;
    }
}

let controller, scavMod, gameMode;

function getGameSettings() {
    controller = localStorage.getItem('ctrlScheme') ? localStorage.getItem('ctrlScheme') : $('#ctrlScheme input:checked').attr('value');
    scavMod =  localStorage.getItem('numberOfScavs') ? localStorage.getItem('numberOfScavs') : $('#numberOfScavs').val();
    gameMode =  localStorage.getItem('gameMode') ? localStorage.getItem('gameMode') : $('#gameMode input:checked').attr('value');

    $('#currSettings').empty().append(
        'Number of scavengers: <i>'+scavMod+'</i>' +
        '<br>Control scheme: <i>'+controller+'</i>' +
        '<br>Game mode: <i>'+gameMode+'</i>'
    );
}

function setGameSettings() {
    controller = $('#ctrlScheme input:checked').attr('value');
    scavMod = $('#numberOfScavs').val();
    gameMode = $('#gameMode input:checked').attr('value');

    if (checkLocalStorage() === true){
        localStorage.setItem(gameMode, gameMode);
        localStorage.setItem(ctrlScheme, controller);
        localStorage.setItem(numberOfScavs, scavMod);
    }

    $('#currSettings').empty().append(
        'Number of scavengers: <i>'+scavMod+'</i>' +
        '<br>Control scheme: <i>'+controller+'</i>' +
        '<br>Game mode: <i>'+gameMode+'</i>'
    );
}

let startGame = false;

$(document).ready(function($) {
     //PIXI aliasok definiálása
    let Application = PIXI.Application,
        Container = PIXI.Container,
        loader = PIXI.loader,
        resources = PIXI.loader.resources,
        Graphics = PIXI.Graphics,
        TextureCache = PIXI.utils.TextureCache,
        Sprite = PIXI.Sprite,
        AnimatedSprite =  PIXI.extras.AnimatedSprite,
        Text = PIXI.Text,
        TextStyle = PIXI.TextStyle;

    //canvas beltartalmának automatikus átméretezése az ablakkal
    //Különbözeti százalékszámítás funkciója
    let diff = function(a, b) {
        return  ((a * 100) / b) / 100;
    };

    startGame = function(ctrlScheme, scavMod, gameMode) {
        //többször használatos változók definiálása
        let state, hero, ulu, scavs, chimes, exit, player, plains, waters,
            door, healthBar, message, gameScene, gameOverScene, enemies, id, timerHS, playtime, hpBarSet, numberOfScavs, schemeOption, viewPw, viewPh, positionMessage, hpLeft, uluPos, currGameMode;

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

        //resourceok létrehozása
        loader
            .add("img/scav/scavrun.json")
            .add("img/orcrun/orcrun.json")
            .add("img/water/water.json")
            .add("img/ulu.png")
            .add("img/grass.png")
            .add("img/treasureHunter.json")
            .add("img/door.png")
            .load(setup);

        

        hpBarSet = function(x, y) {
            healthBar.position.set(x - 25, y - 20);
        };

        positionMessage = function() {
            message.x = (app.stage.width / app.stage.scale.x) / 2;
            message.y = (app.stage.height / 2) - 60 ;
            message.anchor.set(0.5, 0.5);
        };


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
                'door' : resources["img/door.png"].texture,
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
            door = new Sprite(id['door']);
            door.position.set(40, 430);
            gameScene.addChild(door);

            //Játékos karakter
            hero = new AnimatedSprite(id['orc'].animations["orcrun"]);
            hero.animationSpeed = 0.2;
            hero.x = 68;
            hero.y = gameScene.height / 2 - hero.height / 2;
            hero.vx = 0;
            hero.vy = 0;
            gameScene.addChild(hero);
            hero.anchor.y = 0.5;
            hero.anchor.x = 0.5;

            //Item
            ulu = new Sprite(id['ulu']);

            //ulu.x = gameScene.width - ulu.width - 48;
            //ulu.y = gameScene.height / 2 - ulu.height / 2;
            ulu.x = 450;
            ulu.y = 60;
            ulu.anchor.y = 0.5;
            ulu.anchor.x = 0.5;
            gameScene.addChild(ulu);

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
                speed = 2,
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
                scav.vy = randomInt(1, 4) * direction;

                //Beállítjuk az ellenfél vízszintes gyorsulását a játékos irányába
                scav.vx = randomInt(2, 4) * direction;

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
            let leftStart, rightStart, upStart, downStart, leftUpStart, rightUpStart, leftDownStart, rightDownStart, mvmntStop;

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
            scavs.forEach(function(scav) {

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
                                scav.vx = randomInt(1, 3) * 1;
                            } else {
                                scav.vx = randomInt(1, 3) * -1;
                            }
                        } else if (scav.vy !== 0) {
                            scav.vx = 0;
                        } else {
                            scav.vx = randomInt(1, 3) * -1;
                        }
                    }
                    scav.vy *= -1;
                }
                if (scavHitsWall === "left" || scavHitsWall === "right") {
                    if (randomInt(1, 2) === 1) {
                        if (scav.vy === 0) {
                            if (randomInt(1, 2) === 1) {
                                scav.vy = randomInt(1, 3) * 1;
                            } else {
                                scav.vy = randomInt(1, 3) * -1;
                            }
                        } else if (scav.vx !== 0) {
                            scav.vy = 0;
                        } else {
                            scav.vy = randomInt(1, 3) * -1;
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
                if(hitTestRectangle(hero, scav)) {
                    heroHit = true;
                }
            });

            //Ha a hős ütést kap...
            if(heroHit) {
                //Átlátszóbbá tesszük a hőst
                hero.alpha = 0.5;
                //Majd csökkentjük az életerő vonalát 1 pixellel azaz 2 ponttal
                healthBar.outer.width -= 1;
            } else {
                //Ha nem kap ütést, marad ugyan annyira látható
                hero.alpha = 1;
            }

            function uluSetPost(mode) {
                  if (mode === 'new') {
                      ulu.x = hero.x - 15;
                      ulu.y = hero.y + 10;
                      ulu.scale.x = -1;
                      /*
                      ulu.anchor.x = 0.5;
                      ulu.anchor.y = -1;
                      */
                      ulu.rotation = hero.rotation;
                  } else {
                      //Ha a kincs hozzá ér a hőshöz, ráhelyezzük a hősre
                      ulu.x = hero.x + 0;
                      ulu.y = hero.y + 0;
                  }
            }

            //Megnézzük hogy a hős megtalálta-e a kincset a pályán
            if (hitTestRectangle(hero, ulu)) {
                uluSetPost(currGameMode);
            }

            //Elég életereje van még a hősnek?
            //Ha az életerő kevesebb mint 0 akkor vége a játéknak
            //És megjelenítjük a végüzenetet
            if (healthBar.outer.width < 0) {
                state = end;
                //Megnézzük a végső időt, majd összevetjük a kezdéssel
                if (!timerHS['end']) {
                    timerHS['end'] = Math.floor(Date.now() / 1000);
                    playtime = timerHS['end'] - timerHS['start'];
                }

                if (hitTestRectangle(hero, ulu)) {
                    message.text = ("You've got the Ulu mulu! \n But it wasn't enough \n There were "+numberOfScavs+" Scavengers \n Survived "+playtime+" seconds");
                    positionMessage();
                } else {
                    message.text = ("Scavengers feed on your flesh! \n There were "+numberOfScavs+" Scavengers \n Survived "+playtime+" seconds");
                    positionMessage();
                }

            }

            //Ha a hős elvitte a kincset az ajtóig,
            //akkor megnyerte a játékot
            if (hitTestRectangle(ulu, door)) {
                state = end;
                //Megnézzük a végső időt, majd összevetjük a kezdéssel
                if (!timerHS['end']) {
                    timerHS['end'] = Math.floor(Date.now() / 1000);
                    playtime = timerHS['end'] - timerHS['start'];
                }
                hpLeft = Math.floor(100 - (healthBar.outer.width * 2));
                if (hpLeft === 0) {hpLeft = 'no'};
                message.text = ("You survived the hunt! \n There were "+numberOfScavs+" Scavengers \n Took you "+playtime+" seconds \n and you lost "+hpLeft+" HP");
                positionMessage();
            }
        }

        //A játék végén, a játék alap jelenete nem látható
        //míg a játék végének jelenete igen
        function end() {
            $('#uluBtns').hide();
            let pointsAquired = false;
            if (pointsAquired) {} else {
                pointsAquired = ((numberOfScavs * 10) * (100 - hpLeft)) / playtime;
                if (pointsAquired < 0) {pointsAquired = 0;}
                if (pointsAquired > 24000) {pointsAquired = 0;}
            }
            $('#scorePoints').val(pointsAquired);
            $('#endScreen').show();
            gameScene.visible = false;
            gameOverScene.visible = true;
        }

        /* Segítő funkciók */

        //Időkalkuláció
        function timeDiff(timestamp1, timestamp2) {
            let difference = timestamp1 - timestamp2;
            //let daysDifference = Math.floor(difference/1000/60/60/24);
            let secfference = Math.floor(difference/1000);

            return secDifference;
        }

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
        setGameSettings();
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
            url: localPath+"scorePost.php",
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
    xhttp.open("GET", "highscores.xml", true);
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