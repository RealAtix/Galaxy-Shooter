// vervanging voor setInterval, betere prestatie. Nadeel: als de tab niet openstaat, dan stop de animationframe. 
// Daarom dat als je op een andere tab gaat en iets later terugkomt, komen er opeens alle vijanden die normaal moesten spawnen, zo ziet het er dan uit: http://i.imgur.com/bcQCMWU.png

var requestAnimationFrame = window.requestAnimationFrame ||        // Firefox 23 / IE 10 / Chrome / Safari 7 (incl. iOS)
							window.webkitRequestAnimationFrame ||  // Older vesions of Safari / Chrome
							window.mozRequestAnimationFrame ||     // Firefox < 23
							window.msRequestAnimationFrame ||      // IE < 10
							window.oRequestAnimationFrame ||       // Opera
							function(callback){
                            window.setTimeout(callback, 100/60);  // 60 frames per seconde
                        };

//sprite laden
var imgSprite = new Image();
imgSprite.src = 'images/sprite.png'; 
imgSprite.addEventListener('load', init, false); // alse de afbeelding geladen is, init oproepen

//geluid laden
var audioGame = document.createElement('audio');
var audioStart = document.createElement('audio');


/////////////////////////////////////////////////// Menu ////////////////////////////////////////////////////////////////

// canvas menu
var canvasMenu = document.getElementById('canvasMenu');
var ctxMenu = canvasMenu.getContext('2d');

// spelbreedte en hoogte
var spelBreedte = canvasMenu.width;
var spelHoogte = canvasMenu.height;

// muis en startknop coordinaten
var muisX = 0;
var muisY = 0;

var xLinks = 20;
var xRechts = 297;
var yBoven = 408;
var yOnder = 473;

// tekent het menu vanuit de sprite afbeelding
function tekenMenu() {
	ctxMenu.drawImage(imgSprite, 0, 0, spelBreedte, spelHoogte, 0, 0, spelBreedte, spelHoogte);
}

// geeft een true terug als je clickt op de coordinaten in het startknop
function click() {
	if (xLinks <= muisX && muisX <= xRechts && yBoven <= muisY && muisY <= yOnder) {
		return true;
	}
}

// maakt de menu canvas leeg
function clearCtxMenu() {
	ctxMenu.clearRect(0, 0, spelBreedte, spelHoogte);
}


/////////////////////////////////////////////////// Sterren /////////////////////////////////////////////////////////////

// canvas sterren
var canvasBg = document.getElementById('canvasBg');
var ctxBg = canvasBg.getContext('2d');

//stervariabelen
var aantalSterren = 20;
var aantalSterren2 = aantalSterren * 1.3;

var sterren = [];
var sterStart = false;
var sterkleur = "#FFFFFF";


/////////////////////////////////////////////////// Kometen ////////////////////////////////////////////////////////////

//canvas vijand
var canvasKomeet = document.getElementById('canvasKomeet');
var ctxKomeet = canvasKomeet.getContext('2d');

//komeetvariabelen
var spawnInterval;
var aantalVijanden = 0;
var vijanden = new Array();  
var aanmaakSnelheid = 2000
var aanmaakHoeveelheid = 2;

var snelhVijand = 2;


/////////////////////////////////////////////////// Speler //////////////////////////////////////////////////////////////

// canvas speler
var canvasSpeler = document.getElementById('canvasSpeler');
var ctxSpeler = canvasSpeler.getContext('2d');

// nieuwe Speler
var speler = new Speler();
var isPlaying = false;


/////////////////////////////////////////////////// Score & levens //////////////////////////////////////////////////////

// aantal levens en texteigenschappen van het menu bepalen
var aantalLevens = 5;
ctxMenu.fillStyle = "hsla(0, 0%, 100%, 0.5)"; // een manier om kleur te declareren in css, Hue Saturation Lightness and alpha, HSLa
ctxMenu.font = "bold 20px Arial";

// verwijderd de vorige score en laat de nieuwe score weergeven
function updateScore() {
	clearCtxMenu();
	ctxMenu.fillText("Score: " + speler.score, 660, 30);
	ctxMenu.fillText("Levens: " + aantalLevens, 50, 30);
	ctxMenu.fillText("Level: " + speler.level, 350, 30);
	checkLevens();
}

// stopt het spel, weergeeft een rode game over en een alertbox zodra het aantal levens 0 is
function checkLevens() {
	if (aantalLevens == 0) {
		isPlaying = false
		stopSpel();
		ctxSpeler.fillStyle = "hsla(0, 100%, 50%, 0.8)";
		ctxSpeler.font = "bold 100px Arial";
		ctxSpeler.fillText("GAME OVER", 100, 250)
		//na 1.2 seconden een alertbox weergeven dat de pagina refresht als je op ok drukt
		setTimeout(function() {if(!alert('GAME OVER, U hebt een score van ' + speler.score + ' behaald op level ' + speler.level)){window.location.reload();}},1250);
	}
}


/////////////////////////////////////////////////// hoofdfuncties ///////////////////////////////////////////////////////

// wordt opgeroepen zodra de sprite afbeelding is geladen en weergeeft het menu en laat het menu geluid spelen
function init() { 
	tekenMenu();
	audioStart.setAttribute('src', 'ogg/start.ogg');
	audioStart.load()
	audioStart.play();
	document.addEventListener('click', muisClick, false); // zorgt ervoor dat als je clikt muisClick(e) opgeroepen wordt (helemaal beneden)
}

// start alle de ster en vijand en updatescore processen en zorgt ervoor dat er gedetecteerd wordt wanneer je een toets indrukt en loslaat
function startSpel() {
	maakSterren(aantalSterren);
	maakSterren2(aantalSterren2);
	startLoopSterren();
	startLoopVijand();
	updateScore();
	document.addEventListener('keydown', checkKeyDown, false); // zorgt ervoor dat als je een toets indrukt, checkKeyDown(e) opgeroepen wordt (helemaal beneden)
	document.addEventListener('keyup', checkKeyUp, false); // zorgt ervoor dat als je een toets loslaat, checkKeyUp(e) opgeroepen wordt (helemaal beneden)
}

// stopt het geluid, ster en vijand loops
function stopSpel() {
	audioGame.pause();
	stopLoopSterren();
	stopLoopVijand();
}

// een grapje, verandert het voertuig naar steven zijn hoofd (in console invoeren)
function changeSteven() {
	speler.srcX = 100;
	speler.breedte = 80;
	speler.hoogte = 80;
}


///////////////////////////////////////////////// animatie vijand ////////////////////////////////////////////////////////

// maakt x aantal vijanden als het opgeroepen wordt
function maakVijanden(n) { 
	for (var i=0; i < n; i++) {
		vijanden[aantalVijanden] = new Vijand();
		aantalVijanden++;
	}
}

// tekent alle vijanden in de array
function tekenVijanden() {
	clearCtxVijand();
	for (var i=0; i < vijanden.length; i++) {
		vijanden[i].draw();
	}
}

// roept stopMaakVijand en maakvijanden(n) op elke keer als het opgeroepen wordt naagelang de intervalsnelheid
function startMaakVijand() {
	stopMaakVijand();
	spawnInterval = setInterval(function() {maakVijanden(aanmaakHoeveelheid) ;}, aanmaakSnelheid);
}

// verwijdert de interval zodat het maar een keet opgeroepen wordt
function stopMaakVijand() {
	clearInterval(spawnInterval);
}

// een loop, als het spel aan het spelen is tekent het de speler en vijanden en roept speler.versnel() op, requestanimationframe is een soort van timer
function loopVijand() {
	if (isPlaying) {
		speler.draw();
		speler.versnel();
		tekenVijanden();
		requestAnimationFrame(loopVijand);
	}
}

// laat het gamegeluid spelen, start de loops om de speler en vijanden te maken en tekenen
function startLoopVijand() {
	isPlaying = true;
	audioGame.setAttribute('src', 'ogg/game.ogg');
	audioGame.play();
	loopVijand();
	startMaakVijand();
}

// stopt met vijanden aan te maken, zet het geluid op pause en stopt ook andere processen door isPlaying op false te zetten
function stopLoopVijand() {
	isPlaying = false;
	audioGame.pause();
	stopMaakVijand();
}

///////////////////////////////////////////////// animatie sterren ///////////////////////////////////////////////////////

// maakt nieuwe instanties van het object Ster en zet ze in een gedeelde array
function maakSterren(n) {
	for (var i = 0; i < n; i++) {
		sterren[sterren.length] = new Ster();
	}
}

// maakt nieuwe instanties van het object Ster2 en zet ze in een gedeelde array
function maakSterren2(n) {
	for (var i = 0; i < n; i++) {
		sterren[sterren.length] = new Ster2();
	}
}

// roept de tekenmethode van zowel de instanties van Ster en Ster2 die in de array zijn opgeslagen
function tekenSterren() {
	clearCtxBg();
	for (var i = 0; i < sterren.length; i++) {
		sterren[i].draw();
	}
}

// zolang sterStart true is blijft het de sterren tekenen en zichzelf herhalen door de timer requestanimationFrame
function loopSter() {
	if (sterStart) {
		tekenSterren();
		requestAnimationFrame(loopSter);
	}
}

// zorgt ervoor dat loopSter() zichzelf blijft herhalen 
function startLoopSterren() {
	sterStart = true;
	loopSter();
}

//zorgt ervoor dat loopSter() stopt met herhalen
function stopLoopSterren() {
	sterStart = false;
}

/////////////////////////////////////////// Speler & functies /////////////////////////////////////////////////////

// het object Speler en zijn instantievariabelen
function Speler() {
	this.srcX = 0; //100
	this.srcY = 500;
	this.tekenX = 80;
	this.tekenY = 200;
	this.breedte = 80; //80
	this.hoogte = 50; //80
	this.xLinks = this.tekenX;
	this.xRechts = this.tekenY + this.breedte;
	this.yBoven = this.tekenY;
	this.yOnder = this.tekenY + this.hoogte;
	this.snelheid = 4;
	this.score = 0;
	this.punten;
	this.level;
	this.isUpKey = false;
	this.isRightKey = false;
	this.isDownKey = false;
	this.isLeftKey = false;
	this.isSpacebar = false;
	this.isAanHetSchieten = false;
	this.kogels = [];
	this.huidigeKogel = 0;
	this.schietpuntX = this.tekenX + 75;
	this.schietpuntY = this.tekenY + 20;

	//laadt 20 kogels in de array
	for (var i=0; i < 20; i++) {
		this.kogels[this.kogels.length] = new Kogel()
	}
}

// de tekenmethode van het object, verwijdert de huidige tekening en roept methodes aan en tekent dan de nieuwe tekening op de gewijzigde plaats
Speler.prototype.draw = function() {
	clearCtxSpeler();
	this.updateCoordinaten();
	this.checkKeys();
	this.checkSchieten(); // laadt de coordinaten van de huidige kogel
	this.tekenKogels(); // schiet(tekent) de huidige kogel
	ctxSpeler.drawImage(imgSprite,this.srcX,this.srcY,this.breedte,this.hoogte,this.tekenX,this.tekenY,this.breedte,this.hoogte);
};

// verandert de coordinaten naar de huidige coordinaten
Speler.prototype.updateCoordinaten = function() {
	this.schietpuntX = this.tekenX + 75;
	this.schietpuntY = this.tekenY + 20;
	this.xLinks = this.tekenX;
	this.xRechts = this.tekenX + this.breedte;
	this.yBoven = this.tekenY;
	this.yOnder = this.tekenY + this.hoogte;
};

// kijkt hoeveel punten je hebt en verandert de moeilijkheidsgraad van het spel
Speler.prototype.versnel = function() {
	if (this.score > 1500) {
		this.level = 5
		snelhVijand = 10
		this.punten = 100
		this.snelheid = 8;
	} else if (this.score > 750) {
		this.level = 4
		snelhVijand = 8
		this.punten = 50
		this.snelheid = 6
	} else if (this.score > 250) {
		this.level = 3
		snelhVijand = 6
		this.punten = 25
	} else if (this.score > 100) {
		this.level = 2
		snelhVijand = 4
		this.punten = 10
	} else if (this.score < 100) {
		this.level = 1
		snelhVijand = 2
		this.punten = 5
	}
};

//zorgt verandert de coordinaten van je object naargelang op welke toets je drukt en alleen als je binnen de canvas bent
Speler.prototype.checkKeys = function() {
	if (this.isUpKey && this.yBoven > 0) {
		this.tekenY -= this.snelheid;
	}
	if (this.isRightKey && this.xRechts < spelBreedte) {
		this.tekenX += this.snelheid;
	}
	if (this.isDownKey && this.yOnder < spelHoogte) {
		this.tekenY += this.snelheid;
	}
	if (this.isLeftKey && this.xLinks > 0) {
		this.tekenX -= this.snelheid;
	}
};

// zorgt ervoor dat je maar 1 kogel kunt laden per keer dat je de spatiebalk indrukt
Speler.prototype.checkSchieten = function() {
	if (this.isSpacebar  && !this.isAanHetSchieten) {
		this.isAanHetSchieten = true;
		this.kogels[this.huidigeKogel].vuur(); // stelt de coordinaten in van de kogel die op dit moment geladen is (zodat het vuurt vanaf de huidige positie van de speler)
		this.huidigeKogel ++; 
		if (this.huidigeKogel >= this.kogels.length) {	
			this.huidigeKogel = 0; // magazijn is leeg, herladen, je begint terug aan kogel 0(array)
		}
		
	}
};

// tekent de kogel die op dit moment geladen is
Speler.prototype.tekenKogels = function() {
	for (var i=0; i < this.kogels.length; i++) {
		if (this.kogels[i].tekenX >= 0) {
			this.kogels[i].draw();
		}
		if (this.kogels[i].explosie.heeftGeraakt) { // als de kogel de een vijand heeft geraakt, roep de explosie van de kogel en komeet op
			this.kogels[i].explosie.draw();
		}
	}
};

// verwijdert alles op de canvas van de speler zodat de speler terug getekent kan worden op de volgende coordinaten
function clearCtxSpeler() {
	ctxSpeler.clearRect(0,0,spelBreedte,spelHoogte);
}


/////////////////////////////////////////// Vijand & functies ///////////////////////////////////////////////

// het object Vijand en zijn instantievariabelen
function Vijand() {
	this.srcX = 0;
	this.srcY = 578;
	this.tekenX = spelBreedte + Math.random() * 800; // wordt gemaakt op een random plaats voordat het in zicht komt op de canvas
	this.tekenY = Math.random() * 450; // zie hierboven
	this.breedte = 50;
	this.hoogte = 50;
	this.snelheid = snelhVijand;
}

// tekent de vijand op de nieuwe coordinaten
Vijand.prototype.draw = function() {
	this.tekenX -= this.snelheid;
	ctxKomeet.drawImage(imgSprite,this.srcX,this.srcY,this.breedte,this.hoogte,this.tekenX,this.tekenY,this.breedte,this.hoogte);
	this.checkOffScreen();
};

// controleert of de vijand voorbij te grens is, verwijdert de vijand en laat je dan een leven verliezen
Vijand.prototype.checkOffScreen = function() { 
	if (this.tekenX <= -40) { 
		this.verwijderVijand();
		aantalLevens --;
		updateScore();
	}
};

// verwijdert de vijand, haalt het weg uit de array
Vijand.prototype.verwijderVijand = function() { 
	vijanden.splice(vijanden.indexOf(this), 1);
	aantalVijanden --;
};


// verwijdert de vijanden op de canvas zodat ze getekent kunnen worden op de nieuwe coordinaten
function clearCtxVijand() {
	ctxKomeet.clearRect(0,0,spelBreedte,spelHoogte);
}


////////////////////////////////////////////// Kogel & functies //////////////////////////////////////////////////////

// het object Kogel en zijn instantievariabelen
function Kogel() {
	this.srcX = 0;
	this.srcY = 629;
	this.tekenX = -20;
	this.tekenY = 0;
	this.breedte = 25;
	this.hoogte = 9;
	this.explosie = new Explosie(); // elke kogel heeft een explosie die geactiveerd wordt als het een vijand raakt
}

// tekent de kogel 4 plaatsen verder op de x-as, controleert of het een vijand heeft geraakt en of het buiten de canvas is(wordt dan teruggezet op plaats x = -20 om later opnieuw gebruikt te worden)
Kogel.prototype.draw = function() {	
	this.tekenX += 4;
	ctxSpeler.drawImage(imgSprite,this.srcX,this.srcY,this.breedte,this.hoogte,this.tekenX,this.tekenY,this.breedte,this.hoogte);
	this.checkHeeftGeraakt();
	if (this.tekenX > spelBreedte) {
		this.resetKogel();
	}
};

// verandert de coordinaten van de kogel naar de schietpunt van het voertuig
Kogel.prototype.vuur = function() {	
	this.tekenX = speler.schietpuntX;
	this.tekenY = speler.schietpuntY;
};

// zet de kogel buiten de canvas zodat het later opnieuw kan worden gebruikt
Kogel.prototype.resetKogel = function() {	
	this.tekenX = -20
};

// controleert of de kogel binnen de coordinaten van een van de vijanden is, roept dan een explosie op, reset de kogel, verwijdert de geraakt vijand en updated de score
Kogel.prototype.checkHeeftGeraakt = function() {	
	for (var i=0; i < vijanden.length; i++) {
		if (this.tekenX >= vijanden[i].tekenX &&
			this.tekenX <= vijanden[i].tekenX + vijanden[i].breedte &&
			this.tekenY >= vijanden[i].tekenY &&
			this.tekenY <= vijanden[i].tekenY + vijanden[i].hoogte) {
				this.explosie.tekenX = vijanden[i].tekenX - (this.explosie.breedte / 2); // zet de coordinaten van de explosie
				this.explosie.tekenY = vijanden[i].tekenY; // zie hierboven
				this.explosie.heeftGeraakt = true;
				this.resetKogel();
				vijanden[i].verwijderVijand();
				speler.score += speler.punten;
				updateScore();

		}
	}
};


///////////////////////////////////////////////// Explosie & functies //////////////////////////////////////////////////////

// het oject Explosie en zijn instantievariabelen
function Explosie() {
	this.srcX = 0;
	this.srcY = 638;
	this.tekenX = 0;
	this.tekenY = 0;
	this.breedte = 50;
	this.hoogte = 50;
	this.heeftGeraakt = false;
	this.huidigeFrame = 0;
	this.totaalFrames = 10;
}

// zolang het niet 10 keer getekend is, tekent het de explosie op de coordinaten dat gezet worden als de kogel een vijand raakt, de explosie wort 10 keer getekend, anders zou je het amper zien
Explosie.prototype.draw = function() {
	if (this.huidigeFrame <= this.totaalFrames) {
		ctxSpeler.drawImage(imgSprite,this.srcX,this.srcY,this.breedte,this.hoogte,this.tekenX,this.tekenY,this.breedte,this.hoogte);
		this.huidigeFrame ++;
	} else {
		this.heeftGeraakt = false;
		this.huidigeFrame = 0;
	}
};


///////////////////////////////////////////////// Ster & functies //////////////////////////////////////////////////////////


// het object Ster en zijn instantievariabelen
function Ster() {
	this.tekenX = spelBreedte + Math.random() * 800; // wordt getekent voodat je het in de canvas ziet
	this.tekenY = Math.random() * 500;
	this.breedte = 2;
	this.hoogte = 1.5;
	this.snelheid = 2.5;
}

// het object Ster2 en zijn instantievariabelen
function Ster2() {
	this.tekenX = spelBreedte + Math.random() * 800;
	this.tekenY = Math.random() * 500;
	this.breedte = 2.5;
	this.hoogte = 2;
	this.snelheid  = 4;
}

// tekent de ster telkend 2.5 plaatsen naar links en roept checkOffScreen() op
Ster.prototype.draw = function() {
	this.tekenX -= this.snelheid;
	ctxBg.beginPath();
	ctxBg.rect(this.tekenX, this.tekenY, this.breedte, this.hoogte);
	ctxBg.fillStyle = sterkleur;
	ctxBg.fill()
	ctxBg.stroke();
	this.checkOffScreen();
};

// tekent de ster telkend 4 plaatsen naar links
Ster2.prototype.draw = function() {
	this.tekenX -= this.snelheid;
	ctxBg.beginPath();
	ctxBg.rect(this.tekenX, this.tekenY, this.breedte, this.hoogte);
	ctxBg.fillStyle = sterkleur;
	ctxBg.fill()
	ctxBg.stroke();
	this.checkOffScreen();
};

// controleert of de ster voorbij -1200(x) is en laat het dan resetten
Ster.prototype.checkOffScreen = function() {
	if (this.tekenX < -1200) {
		this.resetSter();
	}
};

// controleert of de ster voorbij -1200(x) is en laat het dan resetten
Ster2.prototype.checkOffScreen = function() {
	if (this.tekenX < -1200) {
		this.resetSter();
	}
};

// reset de ster naar een locatie buiten de canvas zodat je het niet midden in de canvas tevoorschijn komt
Ster.prototype.resetSter = function() {
	this.tekenX = spelBreedte + Math.random() * 800;
    this.tekenY = Math.random() * 500;
};

// reset de ster naar een locatie buiten de canvas zodat je het niet midden in de canvas tevoorschijn komt
Ster2.prototype.resetSter = function() {
	this.tekenX = spelBreedte + Math.random() * 800;
    this.tekenY = Math.random() * 500;
};


//verwijder sterren in de canvas zodat ze op niewe coonrdinaten getekent kunnen worden
function clearCtxBg() {
	ctxBg.clearRect(0, 0, spelBreedte, spelHoogte);
}



///////////////////////////////////////////////// event functies /////////////////////////////////////////////////////////

// zolang je in het menu bent en er geklikt wordt, wordt de x en y positie van de muis opgeslagen en wordt er dan gecontroleerd of de coordinaten in de startknop zijn en wordt het spel gestart
function muisClick(e) {
	muisX = e.pageX - canvasMenu.offsetLeft;
	muisY = e.pageY - canvasMenu.offsetTop;
	if (!isPlaying) { //bug: als ik op hetzelfde plek klikte tijdens het spel werd er telkens startSpel(); opgeroepen en dat zorgde dat de variabelen niet meer klopten
		if (click()) { // controleert of de klikcoordinaten binnen de startknop zijn
			audioStart.pause() // pauzeert het geluid van de menu
			clearCtxMenu(); // verwijdert het menu
			startSpel(); // start het spel
		}
	}
}

//als een van de toetsen hieronder ingedrukt wordt, wordt er een variabele op true gezet waardoor het object Speler weet naar welke richting het moet tekenen (zie Speler.checkKeys), of het object Kogel moet schieten
function checkKeyDown(e) {
	var keyID = e.keyCode || e.which;
	if (keyID === 38 || keyID === 87) { // pijltje omhoog of "w"
		speler.isUpKey = true;
		e.preventDefault(); // zorgt ervoor dat de toets zijn originele actie niet uitvoert, in dit scrollen (als je scherm te klein is voor de webpagina)
	}
	if (keyID === 39 || keyID === 68) { // pijltje naar rechts of "d"
		speler.isRightKey = true;
		e.preventDefault();
	}
	if (keyID === 40 || keyID === 83) { // pijltje omlaag of "s"
		speler.isDownKey = true;
		e.preventDefault();
	}
	if (keyID === 37 || keyID === 65) { // pijltje naar links of "a"
		speler.isLeftKey = true;
		e.preventDefault();
	}
	if (keyID === 32) { // spacebar
		speler.isSpacebar = true;
		e.preventDefault();
	}
}

// als een van de toetsen hieronder losgelaten wordt, wordt er een variabele op false gezet waardoor het object Speler weet dat het moet stoppen met tekenen naar een bepaalde richting (zie Speler.checkKeys), of het object Kogel moet stoppen
function checkKeyUp(e) {
	var keyID = e.keyCode || e.which;
	if (keyID === 38 || keyID === 87) { // pijltje omhoog of "w"
		speler.isUpKey = false;
		e.preventDefault();
	}
	if (keyID === 39 || keyID === 68) { // pijltje naar rechts of "d"
		speler.isRightKey = false;
		e.preventDefault();
	}
	if (keyID === 40 || keyID === 83) { // pijltje omlaag of "s"
		speler.isDownKey = false;
		e.preventDefault();
	}
	if (keyID === 37 || keyID === 65) { // pijltje naar links of "a"
		speler.isLeftKey = false;
		e.preventDefault();
	}
	if (keyID === 32) { // spacebar
		speler.isSpacebar = false;
		speler.isAanHetSchieten = false;
		e.preventDefault();
	}
}