//PIXI aliasok definiálása
let Application     = PIXI.Application,
    Container       = PIXI.Container,
    loader          = PIXI.loader,
    resources       = PIXI.loader.resources,
    Graphics        = PIXI.Graphics,
    TextureCache    = PIXI.utils.TextureCache,
    Sprite          = PIXI.Sprite,
    AnimatedSprite  = PIXI.extras.AnimatedSprite,
    Text            = PIXI.Text,
    TextStyle       = PIXI.TextStyle;
let scavHunter = {};

scavHunter = {
    control : '',
    //PIXI app létrehozása
    app : new Application({
        width: 512,
        height: 512,
        antialiasing: true,
        transparent: true,
        resolution: 1,
        //appendChild: ,
    }),
    //Különbözeti százalékszámítás funkciója
    diff : function (a,b) {
        return ((a * 100) / b) / 100;
    },
    //Random szám két érték között
    randomInt : function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    //Beltartalom max méretének kikérése
    viewPw : Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    viewPh : Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
    //Canvas beltartalmának automatikus átméretezése az ablakkal
    windowSize : function() {
        //megvizsgáljuk hogy kisebb-e a viewport a játék méreténél
        if (scavHunter.viewPw < 512 || scavHunter.viewPh < 512) {
            //százalékos arányba csökkentjük a játék beltartalmát
            app.stage.scale.set(scavHunter.diff(scavHunter.viewPw, 512));
            //eltolást alkalmazunk az irányítógombokra annyival amennyivel kisebb a játék beltartalma
            $('#uluBtns').css('margin-top', '-'+(512 - scavHunter.viewPw)+'px');
        }
    },
    //többször használatos változók definiálása
    state : false, hero : false, ulu : false, scavs : false, chimes : false, exit : false, player : false, plains : false, waters : false,
    door : false, healthBar : false, message : false, gameScene : false, gameOverScene : false, enemies : false, timerHS : false, playtime : false, numberOfScavs : false, joystickTimer : false, id : {},
    hpBarSet : function(x, y) {
        scavHunter.healthBar.position.set(x - 25, y - 20);
    },
    //resourceok létrehozása
    load : function() {
        loader
            .add("img/scav/scavrun.json")
            .add("img/orcrun/orcrun.json")
            .add("img/water/water.json")
            .add("img/ulu.png")
            .add("img/grass.png")
            .add("img/treasureHunter.json")
            .add("img/door.png")
            .load(scavHunter.setup);

    },
    setup : function () {
        //Textúrák felparaméterezése
        scavHunter.id = {
            'scav'  : resources["img/scav/scavrun.json"].spritesheet,
            'orc'   : resources["img/orcrun/orcrun.json"].spritesheet,
            'water' : resources["img/water/water.json"].spritesheet,
            'ulu'   : resources["img/ulu.png"].texture,
            'grass' : resources["img/grass.png"].texture,
            'door'  : resources["img/door.png"].texture,
            'orith' : resources["img/treasureHunter.json"].textures,
        };
        //alap jelenet hozzáadása a stagehez
        scavHunter.gameScene = new Container();
        scavHunter.app.stage.addChild(scavHunter.gameScene);
        //Pálya alapja
        scavHunter.waters = new AnimatedSprite(scavHunter.id['water'].animations["water"]);
        scavHunter.waters.wrapMode = PIXI.WRAP_MODES.REPEAT;
        scavHunter.waters.animationSpeed = 0.1;
        scavHunter.waters.play();
        scavHunter.plains = new Sprite(scavHunter.id['grass']);
        scavHunter.gameScene.addChild(scavHunter.waters);
        scavHunter.gameScene.addChild(scavHunter.plains);

        //Kijárat
        scavHunter.door = new Sprite(scavHunter.id['door']);
        scavHunter.door.position.set(40, 430);
        scavHunter.gameScene.addChild(scavHunter.door);

        //Játékos karakter
        scavHunter.hero = new AnimatedSprite(scavHunter.id['orc'].animations["orcrun"]);
        scavHunter.hero.animationSpeed = 0.2;
        scavHunter.hero.x = 68;
        scavHunter.hero.y = scavHunter.gameScene.height / 2 - scavHunter.hero.height / 2;
        scavHunter.hero.vx = 0;
        scavHunter.hero.vy = 0;
        scavHunter.gameScene.addChild(scavHunter.hero);
        scavHunter.hero.anchor.y = 0.5;
        scavHunter.hero.anchor.x = 0.5;

        //Item
        scavHunter.ulu = new Sprite(scavHunter.id['ulu']);

        //ulu.x = gameScene.width - ulu.width - 48;
        //ulu.y = gameScene.height / 2 - ulu.height / 2;
        scavHunter.ulu.x = 450;
        scavHunter.ulu.y = 60;
        scavHunter.ulu.anchor.y = 0.5;
        scavHunter.ulu.anchor.x = 0.5;
        scavHunter.gameScene.addChild(scavHunter.ulu);

        //Ellenfelek létrehozása és tömb létesítése az eltárolásukhoz
        scavHunter.numberOfScavs = scavHunter.randomInt(6,12);
        let spacing = 48,
            xOffset = 150,
            speed = 2,
            direction = 1;

        scavHunter.scavs = [];

        //Ellenfelek létrehozása az alapján hogy mennyit adtunk meg a `numberOfScavs` változóba
        for (let i = 0; i < scavHunter.numberOfScavs; i++) {
            //ellenfél sprite létrehozása, animáció gyorsaságának beállítása és indítása
            let scav = new AnimatedSprite(scavHunter.id['scav'].animations["walk"]);
            scav.animationSpeed = 0.2;
            scav.play();

            //Vízszintesen elrendezzük őket egymástól távolabb a `spacing` érték alapján.
            //`xOffset` határozza meg a távolságot a képernyő bal oldalától ami alapján az első ellenfél hozzáadásra kerül
            let x = spacing * i + xOffset;

            //Adunk neki egy random Y pozíciót
            let y = scavHunter.randomInt(0, scavHunter.app.stage.height - scav.height);

            //Beállítjuk az éppen generált ellenfél pozícióját
            scav.x = x;
            scav.y = y;

            //Beállítjuk az ellenfelek függőleges gyorsulását.
            //Az irány avagy `direction` vagy `1` vagy `-1`.
            //`1` azt jelenti hogy lefele míg a `-1` azt hogy felfele mozognak
            //`direction` szorzása a `speed` (sebesség) -el, meghatározzás a függőleges mozgás irányt
            scav.vy = scavHunter.randomInt(1, 4) * direction;

            //Beállítjuk az ellenfél vízszintes gyorsulását a játékos irányába
            scav.vx = scavHunter.randomInt(2, 4) * direction;

            //Irány megváltoztatása a következő lefutásnál
            direction *= -1;

            //Ellenfél hozzá adása a `scavs` tömbhöz
            scavHunter.scavs.push(scav);

            //Ellenfél hozzáadása az alap jelenethez `gameScene`
            scavHunter.gameScene.addChild(scav);
        }

        //Életerő vonal generálása
        scavHunter.healthBar = new Container();
        scavHunter.healthBar.position.set(scavHunter.hero.x - 25, scavHunter.hero.y - 20);
        scavHunter.gameScene.addChild(scavHunter.healthBar);

        //Életerő sötét hátterének felparaméterezése
        let innerBar = new Graphics();
        innerBar.beginFill(0x000000);
        innerBar.drawRect(0, 0, 50, 4);
        innerBar.endFill();
        scavHunter.healthBar.addChild(innerBar);

        //Életerő vonal felparaméterezése
        let outerBar = new Graphics();
        outerBar.beginFill(0xFF3300);
        outerBar.drawRect(0,0, 50, 4);
        outerBar.endFill();
        scavHunter.healthBar.addChild(outerBar);
        //könnyebb referenciáért beállítjuk ezt a tulajdonságot
        scavHunter.healthBar.outer = outerBar;

        //Meghalás esetére létrehozott jelenet `gameOver` ami alapértelmezetten nem látható
        scavHunter.gameOverScene = new Container();
        scavHunter.app.stage.addChild(scavHunter.gameOverScene);
        scavHunter.gameOverScene.visible = false;

        //Szöveg sprite létrehozása és hozzá adása a halál jelenethez
        let style = new TextStyle({
            fontFamily: "GothicInGame",
            fontSize: 24,
            align : 'center',
            fill: "white"
        });
        scavHunter.message = new Text("You Died! \n and survived \n X seconds", style);
        scavHunter.message.x = scavHunter.app.stage.width / 2;
        scavHunter.message.y = scavHunter.app.stage.height / 2;
        scavHunter.message.anchor.set(0.5, 0.5);
        scavHunter.gameOverScene.addChild(scavHunter.message);

        schemeOption[scavHunter.control]();

        scavHunter.timerHS = {
            'start' : Math.floor(Date.now() / 1000),
            'current' : '',
            'end' : '',
        };

        //Játék állapot beállítása
        scavHunter.state = scavHunter.play;

        //játék loop elindítása
        scavHunter.app.ticker.add(delta => scavHunter.gameLoop(delta));

    },
    gameLoop : function(delta){
        //Jelenlegi játékállapot frissítése:
        scavHunter.state(delta);
    },
    play : function(delta) {
        //Frissítjük az időbélyeget
        scavHunter.timerHS['current'] = Math.floor(Date.now() / 1000);

        //A hős sebességét használva, mozgatjuk a grafikáját
        scavHunter.hero.x += scavHunter.hero.vx;
        scavHunter.hero.y += scavHunter.hero.vy;
        scavHunter.hpBarSet(scavHunter.hero.x, scavHunter.hero.y);

        //Hős pályaterületen tartása
        //X a játszhatő terület első vízszintes pontja
        //Y az első függőleges
        //width és height a maximális szélessége és hosszúsága a pályának
        scavHunter.contain(scavHunter.hero, {x: 45, y: 45, width: 495, height: 510});
        //scavHunter.contain(hero, stage);

        //Ütközés előtt beállítjuk a hős attributumát `heroHit`, `false`-ra
        let heroHit = false;

        //Végig loopoljuk az összes Sprite-ot az ellenfelek tömbjében
        scavHunter.scavs.forEach(function(scav) {

            //Mozgatjuk az ellenfeleket
            scav.y += scav.vy;
            scav.x += scav.vx;

            //Beállítjuk az ellenfeleknél is a pálya területet
            let scavHitsWall = scavHunter.contain(scav, {x: 45, y: 50, width: 480, height: 500});

            //Megnézzük az orientációját az ellenfélnek és affelé forgatjuk
            scav.heading = Math.atan2(scav.vy, scav.vx);
            scav.rotation = scav.heading + 1.55;

            //Ha egy ellenfél nekimegy a falnak, megfordítjuk a mozgás irányát
            if (scavHitsWall === "top" || scavHitsWall === "bottom") {
                if (scavHunter.randomInt(1, 2) === 1) {
                    if (scav.vx === 0) {
                        if (scavHunter.randomInt(1, 2) === 1) {
                            scav.vx = scavHunter.randomInt(1, 3) * 1;
                        } else {
                            scav.vx = scavHunter.randomInt(1, 3) * -1;
                        }
                    } else if (scav.vy !== 0) {
                        scav.vx = 0;
                    } else {
                        scav.vx = scavHunter.randomInt(1, 3) * -1;
                    }
                }
                scav.vy *= -1;
            }
            if (scavHitsWall === "left" || scavHitsWall === "right") {
                if (scavHunter.randomInt(1, 2) === 1) {
                    if (scav.vy === 0) {
                        if (scavHunter.randomInt(1, 2) === 1) {
                            scav.vy = scavHunter.randomInt(1, 3) * 1;
                        } else {
                            scav.vy = scavHunter.randomInt(1, 3) * -1;
                        }
                    } else if (scav.vx !== 0) {
                        scav.vy = 0;
                    } else {
                        scav.vy = scavHunter.randomInt(1, 3) * -1;
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
            if(scavHunter.hitTestRectangle(scavHunter.hero, scav)) {
                scavHunter.heroHit = true;
            }
        });

        //Ha a hős ütést kap...
        if(scavHunter.heroHit) {
            //Átlátszóbbá tesszük a hőst
            scavHunter.hero.alpha = 0.5;
            //Majd csökkentjük az életerő vonalát 1 pixellel azaz 2 ponttal
            scavHunter.healthBar.outer.width -= 1;
        } else {
            //Ha nem kap ütést, marad ugyan annyira látható
            scavHunter.hero.alpha = 1;
        }

        //Megnézzük hogy a hős megtalálta-e a kincset a pályán
        if (scavHunter.hitTestRectangle(scavHunter.hero, scavHunter.ulu)) {
            //Ha a kincs hozzá ér a hőshöz, ráhelyezzük a hősre
            scavHunter.ulu.x = scavHunter.hero.x + 0;
            scavHunter.ulu.y = scavHunter.hero.y + 0;
        }

        //Elég életereje van még a hősnek?
        //Ha az életerő kevesebb mint 0 akkor vége a játéknak
        //És megjelenítjük a végüzenetet
        if (scavHunter.healthBar.outer.width < 0) {
            scavHunter.state = scavHunter.end;
            //Megnézzük a végső időt, majd összevetjük a kezdéssel
            if (!scavHunter.timerHS['end']) {
                scavHunter.timerHS['end'] = Math.floor(Date.now() / 1000);
                scavHunter.playtime = scavHunter.timerHS['end'] - scavHunter.timerHS['start'];
            }

            if (scavHunter.hitTestRectangle(scavHunter.hero, scavHunter.ulu)) {
                scavHunter.message.text = ("You've got the Ulu-mulu! \n But it wasn't enough \n There were "+scavHunter.numberOfScavs+" Scavengers \n Survived "+scavHunter.playtime+" seconds");
            } else {
                scavHunter.message.text = ("Scavengers feed on your flesh! \n There were "+scavHunter.numberOfScavs+" Scavengers \n Survived "+scavHunter.playtime+" seconds");
            }

        }

        //Ha a hős elvitte a kincset az ajtóig,
        //akkor megnyerte a játékot
        if (scavHunter.hitTestRectangle(scavHunter.ulu, scavHunter.door)) {
            scavHunter.state = scavHunter.end;
            //Megnézzük a végső időt, majd összevetjük a kezdéssel
            if (!scavHunter.timerHS['end']) {
                scavHunter.timerHS['end'] = Math.floor(Date.now() / 1000);
                scavHunter.playtime = scavHunter.timerHS['end'] - scavHunter.timerHS['start'];
            }
            var hpLeft = Math.floor(100 - (scavHunter.healthBar.outer.width * 2));
            if (hpLeft === 0) {hpLeft = 'no'}
            scavHunter.message.text = ("You survived the hunt! \n There were "+scavHunter.numberOfScavs+" Scavengers \n Took you "+scavHunter.playtime+" seconds \n and you lost "+hpLeft+" HP");
        }
    },
    //A játék végén, a játék alap jelenete nem látható
    //míg a játék végének jelenete igen
    end : function() {
        if (scavHunter.schemeOption === 'joystick') {
            clearInterval(scavHunter.joystickTimer);
        }
        scavHunter.gameScene.visible = false;
        scavHunter.gameOverScene.visible = true;
    },
    //Időkalkuláció
    timeDiff : function(timestamp1, timestamp2) {
        var difference = timestamp1 - timestamp2;
        var daysDifference = Math.floor(difference/1000/60/60/24);
        var secDifference = Math.floor(difference/1000);
        return secDifference;
    },
    //Ütközés a pályával `container`
    contain : function(sprite, container) {
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
    },
    //Az ütközéseket tesztelő funkció `hitTestRectangle`
    hitTestRectangle : function(r1, r2) {
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
    },
    init : function() {
        //Méretezés figyelés indítása
        scavHunter.windowSize();
        window.addEventListener("resize", scavHunter.windowSize);
        //PIXI hozzáadása bodyhoz
        //document.body.appendChild(app.view);
        scavHunter.control = $('#ctrlScheme input:checked').attr('value');
        scavHunter.load();
        document.getElementById('uluGame').appendChild(scavHunter.app.view);
    }
};

$(document).ready(function($) {
    $('#playBtn').click(scavHunter.init());
});