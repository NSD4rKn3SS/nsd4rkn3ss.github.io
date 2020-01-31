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

    //PIXI app létrehozása
    let app = new Application({
        width: 512,
        height: 512,
        antialiasing: true,
        transparent: false,
        resolution: 1
    });

    //canvas automatikus átméretezése az ablakkal
    /*
    let windowSize = function() {
        let viewPw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        let viewPh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        app.renderer.resize(viewPw, viewPh);
    };

    windowSize();
    window.addEventListener("resize", windowSize);
    */
    //PIXI hozzáadása bodyhoz
    //document.body.appendChild(app.view);
    document.getElementById('uluGame').appendChild(app.view);


    //resourceok létrehozása
    loader
        .add("img/scav/frames/scavrun.json")
        .add("img/orcrun/frames/orcrun.json")
        .add("img/ulu.png")
        .add("img/grass.png")
        .add("img/treasureHunter.json")
        .load(setup);

    //többször használatos változók definiálása
    let state, hero, ulu, scavs, chimes, exit, player, plains,
        door, healthBar, message, gameScene, gameOverScene, enemies, id;


    function setup() {

        //alap jelenet hozzáadása a stagehez
        gameScene = new Container();
        app.stage.addChild(gameScene);

        //Textúrák felparaméterezése
        id = {
            'scav' : resources["img/scav/frames/scavrun.json"].spritesheet,
            'orc' : resources["img/orcrun/frames/orcrun.json"].spritesheet,
            'ulu' : resources["img/ulu.png"].texture,
            'grass' : resources["img/grass.png"].texture,
            'orith' : resources["img/treasureHunter.json"].textures,
        };

        //Pálya alapja
        plains = new Sprite(id['grass']);
        gameScene.addChild(plains);


        //Kijárat
        door = new Sprite(id['orith']['door.png']);
        door.position.set(28, 5);
        gameScene.addChild(door);

        //Játékos karakter
        hero = new AnimatedSprite(id['orc'].animations["orcrun"]);
        hero.animationSpeed = 0.2;
        hero.x = 68;
        hero.y = gameScene.height / 2 - hero.height / 2;
        hero.vx = 0;
        hero.vy = 0;
        gameScene.addChild(hero);

        //Item
        ulu = new Sprite(id['ulu']);
        ulu.x = gameScene.width - ulu.width - 48;
        ulu.y = gameScene.height / 2 - ulu.height / 2;
        gameScene.addChild(ulu);

        //Ellenfelek létrehozása és tömb létesítése az eltárolásukhoz
        let numberOfScavs = 6,
            spacing = 48,
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
            scav.vy = speed * direction;

            //Irány megváltoztatása a következő lefutásnál
            direction *= -1;

            //Ellenfél hozzá adása a `scavs` tömbhöz
            scavs.push(scav);

            //Ellenfél hozzáadása az alap jelenethez `gameScene`
            gameScene.addChild(scav);
        }

        //Életerő vonal generálása
        healthBar = new Container();
        healthBar.position.set(app.stage.width - 170, 4)
        gameScene.addChild(healthBar);

        //Életerő sötét hátterének felparaméterezése
        let innerBar = new Graphics();
        innerBar.beginFill(0x000000);
        innerBar.drawRect(0, 0, 128, 8);
        innerBar.endFill();
        healthBar.addChild(innerBar);

        //Életerő vonal felparaméterezése
        let outerBar = new Graphics();
        outerBar.beginFill(0xFF3300);
        outerBar.drawRect(0, 0, 128, 8);
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
            fontFamily: "Futura",
            fontSize: 64,
            fill: "white"
        });
        message = new Text("The End!", style);
        message.x = 120;
        message.y = app.stage.height / 2 - 32;
        gameOverScene.addChild(message);

        //Mozgatás funkciók definiálása
        let leftStart, leftStop, rightStart, rightStop, upStart, upStop, downStart, downStop;

        //Bal oldalra mozgatás
        leftStart = function() {
            //Hős sebességének változtatása lenyomásra
            hero.vx = -5; //x tengelyen való negatív eltolás
            hero.vy = 0;  //y tengelyen nem változtatunk
            hero.play();  //Sprite animáció lejátszása
            hero.rotation = 0; //Sprite forgatásának alapra állítása
            hero.scale.x = -1; //Sprite tükrözése X tengelyen tehát vízszintesen
        };

        leftStop = function() {
            //Ha már nem nyomjuk a gombot, ÉS a jobb nyíl nincs lenyomva,
            //ÉS a hős nem mozog az Y tengelyen tehát vertikálisan:
            //Akkor megállítjuk a hőst
            if (!right.isDown && hero.vy === 0) {
                hero.vx = 0;
                hero.stop(); //Sprite animáció megállítása
            }
        };


        //Jobb oldalra mozgatás
        rightStart = function() {
            hero.vx = 5;
            hero.vy = 0;
            hero.play();
            hero.rotation = 0;
            hero.scale.x = 1;
        };
        rightStop = function() {
            if (!left.isDown && hero.vy === 0) {
                hero.vx = 0;
                hero.stop();
            }
        };

        //Felfele mozgatás
        upStart = function() {
            hero.vy = -5;
            hero.vx = 0;
            hero.play();
            hero.scale.x = 1;
            hero.rotation = 5;
        };
        upStop = function() {
            if (!down.isDown && hero.vx === 0) {
                hero.vy = 0;
                hero.stop();
            }
        };

        //Lefele mozgatás
        downStart = function() {
            hero.vy = 5;
            hero.vx = 0;
            hero.play();
            hero.scale.x = 1;
            hero.rotation = -5;
        };
        downStop = function() {
            if (!up.isDown && hero.vx === 0) {
                hero.vy = 0;
                hero.stop();
            }
        };



        //Touch irányítás
        //Bal gomb
        $('#touchLeft').bind('touchstart', function(e) {
            leftStart();
        }).bind('touchend', function(e) {
            leftStop();
        });
        //Jobb gomb
        $('#touchRight').bind('touchstart', function(e) {
            rightStart();
        }).bind('touchend', function(e) {
            rightStop();
        });
        //Fel gomb
        $('#touchUp').bind('touchstart', function(e) {
            upStart();
        }).bind('touchend', function(e) {
            upStop();
        });
        //Le gomb
        $('#touchDown').bind('touchstart', function(e) {
            downStart();
        }).bind('touchend', function(e) {
            downStop();
        });

        //Billentyű leütések figyelése
        let left = keyboard(37),
            up = keyboard(38),
            right = keyboard(39),
            down = keyboard(40);


        //Balra nyíl `press` nyomás & `release` elengedés viselkedése
        left.press =  function(){ leftStart(); };
        left.release = function(){ leftStop(); };

        //Jobbra nyíl `press` nyomás & `release` elengedés viselkedése
        right.press = function(){ rightStart(); };
        right.release = function(){ rightStop(); };

        //Felfele nyíl `press` nyomás & `release` elengedés viselkedése
        up.press = function(){ upStart(); };
        up.release = function(){ upStop(); };

        //Lefele nyíl `press` nyomás & `release` elengedés viselkedése
        down.press = function(){ downStart(); };
        down.release = function(){ downStop(); };

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
        //A hős sebességét használva, mozgatjuk a grafikáját
        hero.x += hero.vx;
        hero.y += hero.vy;

        //Hős pályaterületen tartása
        //X a játszhatő terület első vízszintes pontja
        //Y az első függőleges
        //width és height a maximális szélessége és hosszúsága a pályának
        contain(hero, {x: 28, y: 28, width: 500, height: 500});
        //contain(hero, stage);

        //Ütközés előtt beállítjuk a hős attributumát `heroHit`, `false`-ra
        let heroHit = false;

        //Végig loopoljuk az összes Sprite-ot az ellenfelek tömbjében
        scavs.forEach(function(scav) {

            //Mozgatjuk az ellenfeleket
            scav.y += scav.vy;

            //Beállítjuk az ellenfeleknél is a pálya területet
            let scavHitsWall = contain(scav, {x: 32, y: 70, width: 460, height: 480});

            //Ha egy ellenfél nekimegy a falnak, megfordítjuk a mozgás irányát majd fordítjuk őket menetirány felé
            if (scavHitsWall === "top" || scavHitsWall === "bottom") {
                scav.vy *= -1;

                if (scav.vy < 1) {
                    scav.scale.y = 1;
                } else {
                    scav.scale.y = -1;
                }
            }

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
            //Majd csökkentjük az életerő vonalát 1 pixellel
            healthBar.outer.width -= 1;
        } else {
            //Ha nem kap ütést, marad ugyan annyira látható
            hero.alpha = 1;
        }

        //Megnézzük hogy a hős megtalálta-e a kincset a pályán
        if (hitTestRectangle(hero, ulu)) {
            //Ha a kincs hozzá ér a hőshöz, ráhelyezzük a hősre
            ulu.x = hero.x + 0;
            ulu.y = hero.y + 0;
        }

        //Elég életereje van még a hősnek?
        //Ha az életerő kevesebb mint 0 akkor vége a játéknak
        //És megjelenítjük a végüzenetet
        if (healthBar.outer.width < 0) {
            state = end;
            message.text = "You lost!";
        }

        //Ha a hős elvitte a kincset az ajtóig,
        //akkor megnyerte a játékot
        if (hitTestRectangle(ulu, door)) {
            state = end;
            message.text = "You won!";
        }
    }

    //A játék végén, a játék alap jelenete nem látható
    //míg a játék végének jelenete igen
    function end() {
        gameScene.visible = false;
        gameOverScene.visible = true;
    }

    /* Segítő funkciók */

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
        r1.centerX = r1.x + r1.width / 2;	//Első sprite vízszintes kpt.-ja
        r1.centerY = r1.y + r1.height / 2;	//Első sprite függőleges kpt.-ja
        r2.centerX = r2.x + r2.width / 2;
        r2.centerY = r2.y + r2.height / 2;

        //Fél-magasság és fél-szélesség kiszámítása a Sprite-oknál
        r1.halfWidth = r1.width / 2;	//Első szélességének a fele
        r1.halfHeight = r1.height / 2;	//Első magasságának a fele
        r2.halfWidth = r2.width / 2;
        r2.halfHeight = r2.height / 2;

        //Távolság vektorok kiszámítása
        vx = r1.centerX - r2.centerX;	//vízszintes távolság vektor kiszámítása két Sprite között
        vy = r1.centerY - r2.centerY;	//függőleges távolság vektor kiszámítása két Sprite között

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

    //A `keyboard` helper funkció
    function keyboard(keyCode) {
        var key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;

        //Gomb lenyomás érzékelése `downHandler`
        key.downHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        //Gomb felengedés érzékelése `upHandler`
        key.upHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Eseményfigyelők hozzáadása
        window.addEventListener("keydown", key.downHandler.bind(key), false);
        window.addEventListener("keyup", key.upHandler.bind(key), false);
        return key;
    }
    if ('ontouchstart' in window) {
        $('#uluBtns').show();
    } else {
        $('#uluBtns').hide();
    }
});