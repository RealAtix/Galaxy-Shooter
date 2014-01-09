var requestAnimationFrame = window.requestAnimationFrame ||        // Firefox 23 / IE 10 / Chrome / Safari 7 (incl. iOS)
							window.webkitRequestAnimationFrame ||  // Older vesions of Safari / Chrome
							window.mozRequestAnimationFrame ||     // Firefox < 23
							window.msRequestAnimationFrame ||      // IE < 10
							window.oRequestAnimationFrame ||       // Opera
							function(callback){
                            window.setTimeout(callback, 100/60);  
                        };

var imgSprite = new Image();
imgSprite.src = 'images/sprite.png'; 
imgSprite.addEventListener('load', init, false); 

var audioGame = document.createElement('audio');
var audioStart = document.createElement('audio');


var canvasMenu = document.getElementById('canvasMenu');
var ctxMenu = canvasMenu.getContext('2d');

var spelBreedte = canvasMenu.width;
var spelHoogte = canvasMenu.height;

var muisX = 0;
var muisY = 0;

var xLinks = 20;
var xRechts = 297;
var yBoven = 408;
var yOnder = 473;

function tekenMenu() {
	ctxMenu.drawImage(imgSprite, 0, 0, spelBreedte, spelHoogte, 0, 0, spelBreedte, spelHoogte);
}

function click() {
	if (xLinks <= muisX && muisX <= xRechts && yBoven <= muisY && muisY <= yOnder) {
		return true;
	}
}

function clearCtxMenu() {
	ctxMenu.clearRect(0, 0, spelBreedte, spelHoogte);
}

var canvasBg = document.getElementById('canvasBg');
var ctxBg = canvasBg.getContext('2d');


var aantalSterren = 20;
var aantalSterren2 = aantalSterren * 1.3;

var sterren = [];
var sterStart = false;
var sterkleur = "#FFFFFF";


var canvasKomeet = document.getElementById('canvasKomeet');
var ctxKomeet = canvasKomeet.getContext('2d');

var spawnInterval;
var aantalVijanden = 0;
var vijanden = new Array();  
var aanmaakSnelheid = 2000
var aanmaakHoeveelheid = 2;

var snelhVijand = 2;


var canvasSpeler = document.getElementById('canvasSpeler');
var ctxSpeler = canvasSpeler.getContext('2d');


var speler = new Speler();
var isPlaying = false;


var aantalLevens = 5;
ctxMenu.fillStyle = "hsla(0, 0%, 100%, 0.5)"; 
ctxMenu.font = "bold 20px Arial";

function updateScore() {
	clearCtxMenu();
	ctxMenu.fillText("Score: " + speler.score, 660, 30);
	ctxMenu.fillText("Levens: " + aantalLevens, 50, 30);
	ctxMenu.fillText("Level: " + speler.level, 350, 30);
	checkLevens();
}

function checkLevens() {
	if (aantalLevens == 0) {
		isPlaying = false
		stopSpel();
		ctxSpeler.fillStyle = "hsla(0, 100%, 50%, 0.8)";
		ctxSpeler.font = "bold 100px Arial";
		ctxSpeler.fillText("GAME OVER", 100, 250)
		setTimeout(function() {if(!alert('GAME OVER, U hebt een score van ' + speler.score + ' behaald op level ' + speler.level)){window.location.reload();}},1250);
	}
}


function init() { 
	tekenMenu();
	audioStart.setAttribute('src', 'ogg/start.ogg');
	audioStart.load()
	audioStart.play();
	document.addEventListener('click', muisClick, false); 
}

function startSpel() {
	maakSterren(aantalSterren);
	maakSterren2(aantalSterren2);
	startLoopSterren();
	startLoopVijand();
	updateScore();
	document.addEventListener('keydown', checkKeyDown, false); 
	document.addEventListener('keyup', checkKeyUp, false);
}

function stopSpel() {
	audioGame.pause();
	stopLoopSterren();
	stopLoopVijand();
}

function changeSteven() {
	speler.srcX = 100;
	speler.breedte = 80;
	speler.hoogte = 80;
}


function maakVijanden(n) { 
	for (var i=0; i < n; i++) {
		vijanden[aantalVijanden] = new Vijand();
		aantalVijanden++;
	}
}

function tekenVijanden() {
	clearCtxVijand();
	for (var i=0; i < vijanden.length; i++) {
		vijanden[i].draw();
	}
}

function startMaakVijand() {
	stopMaakVijand();
	spawnInterval = setInterval(function() {maakVijanden(aanmaakHoeveelheid) ;}, aanmaakSnelheid);
}

function stopMaakVijand() {
	clearInterval(spawnInterval);
}

function loopVijand() {
	if (isPlaying) {
		speler.draw();
		speler.versnel();
		tekenVijanden();
		requestAnimationFrame(loopVijand);
	}
}

function startLoopVijand() {
	isPlaying = true;
	audioGame.setAttribute('src', 'ogg/game.ogg');
	audioGame.play();
	loopVijand();
	startMaakVijand();
}

function stopLoopVijand() {
	isPlaying = false;
	audioGame.pause();
	stopMaakVijand();
}


function maakSterren(n) {
	for (var i = 0; i < n; i++) {
		sterren[sterren.length] = new Ster();
	}
}

function maakSterren2(n) {
	for (var i = 0; i < n; i++) {
		sterren[sterren.length] = new Ster2();
	}
}

function tekenSterren() {
	clearCtxBg();
	for (var i = 0; i < sterren.length; i++) {
		sterren[i].draw();
	}
}

function loopSter() {
	if (sterStart) {
		tekenSterren();
		requestAnimationFrame(loopSter);
	}
}

function startLoopSterren() {
	sterStart = true;
	loopSter();
}

function stopLoopSterren() {
	sterStart = false;
}


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

	for (var i=0; i < 20; i++) {
		this.kogels[this.kogels.length] = new Kogel()
	}
}

Speler.prototype.draw = function() {
	clearCtxSpeler();
	this.updateCoordinaten();
	this.checkKeys();
	this.checkSchieten(); 
	this.tekenKogels(); 
	ctxSpeler.drawImage(imgSprite,this.srcX,this.srcY,this.breedte,this.hoogte,this.tekenX,this.tekenY,this.breedte,this.hoogte);
};

Speler.prototype.updateCoordinaten = function() {
	this.schietpuntX = this.tekenX + 75;
	this.schietpuntY = this.tekenY + 20;
	this.xLinks = this.tekenX;
	this.xRechts = this.tekenX + this.breedte;
	this.yBoven = this.tekenY;
	this.yOnder = this.tekenY + this.hoogte;
};

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

Speler.prototype.checkSchieten = function() {
	if (this.isSpacebar  && !this.isAanHetSchieten) {
		this.isAanHetSchieten = true;
		this.kogels[this.huidigeKogel].vuur(); 
		this.huidigeKogel ++; 
		if (this.huidigeKogel >= this.kogels.length) {	
			this.huidigeKogel = 0; 
		}
		
	}
};

Speler.prototype.tekenKogels = function() {
	for (var i=0; i < this.kogels.length; i++) {
		if (this.kogels[i].tekenX >= 0) {
			this.kogels[i].draw();
		}
		if (this.kogels[i].explosie.heeftGeraakt) { 
			this.kogels[i].explosie.draw();
		}
	}
};

function clearCtxSpeler() {
	ctxSpeler.clearRect(0,0,spelBreedte,spelHoogte);
}


function Vijand() {
	this.srcX = 0;
	this.srcY = 578;
	this.tekenX = spelBreedte + Math.random() * 800; 
	this.tekenY = Math.random() * 450; 
	this.breedte = 50;
	this.hoogte = 50;
	this.snelheid = snelhVijand;
}

Vijand.prototype.draw = function() {
	this.tekenX -= this.snelheid;
	ctxKomeet.drawImage(imgSprite,this.srcX,this.srcY,this.breedte,this.hoogte,this.tekenX,this.tekenY,this.breedte,this.hoogte);
	this.checkOffScreen();
};

Vijand.prototype.checkOffScreen = function() { 
	if (this.tekenX <= -40) { 
		this.verwijderVijand();
		aantalLevens --;
		updateScore();
	}
};

Vijand.prototype.verwijderVijand = function() { 
	vijanden.splice(vijanden.indexOf(this), 1);
	aantalVijanden --;
};


function clearCtxVijand() {
	ctxKomeet.clearRect(0,0,spelBreedte,spelHoogte);
}


function Kogel() {
	this.srcX = 0;
	this.srcY = 629;
	this.tekenX = -20;
	this.tekenY = 0;
	this.breedte = 25;
	this.hoogte = 9;
	this.explosie = new Explosie(); 
}

Kogel.prototype.draw = function() {	
	this.tekenX += 4;
	ctxSpeler.drawImage(imgSprite,this.srcX,this.srcY,this.breedte,this.hoogte,this.tekenX,this.tekenY,this.breedte,this.hoogte);
	this.checkHeeftGeraakt();
	if (this.tekenX > spelBreedte) {
		this.resetKogel();
	}
};

Kogel.prototype.vuur = function() {	
	this.tekenX = speler.schietpuntX;
	this.tekenY = speler.schietpuntY;
};

Kogel.prototype.resetKogel = function() {	
	this.tekenX = -20
};

Kogel.prototype.checkHeeftGeraakt = function() {	
	for (var i=0; i < vijanden.length; i++) {
		if (this.tekenX >= vijanden[i].tekenX &&
			this.tekenX <= vijanden[i].tekenX + vijanden[i].breedte &&
			this.tekenY >= vijanden[i].tekenY &&
			this.tekenY <= vijanden[i].tekenY + vijanden[i].hoogte) {
				this.explosie.tekenX = vijanden[i].tekenX - (this.explosie.breedte / 2); 
				this.explosie.tekenY = vijanden[i].tekenY; 
				this.explosie.heeftGeraakt = true;
				this.resetKogel();
				vijanden[i].verwijderVijand();
				speler.score += speler.punten;
				updateScore();

		}
	}
};


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

Explosie.prototype.draw = function() {
	if (this.huidigeFrame <= this.totaalFrames) {
		ctxSpeler.drawImage(imgSprite,this.srcX,this.srcY,this.breedte,this.hoogte,this.tekenX,this.tekenY,this.breedte,this.hoogte);
		this.huidigeFrame ++;
	} else {
		this.heeftGeraakt = false;
		this.huidigeFrame = 0;
	}
};


function Ster() {
	this.tekenX = spelBreedte + Math.random() * 800; 
	this.tekenY = Math.random() * 500;
	this.breedte = 2;
	this.hoogte = 1.5;
	this.snelheid = 2.5;
}

function Ster2() {
	this.tekenX = spelBreedte + Math.random() * 800;
	this.tekenY = Math.random() * 500;
	this.breedte = 2.5;
	this.hoogte = 2;
	this.snelheid  = 4;
}

Ster.prototype.draw = function() {
	this.tekenX -= this.snelheid;
	ctxBg.beginPath();
	ctxBg.rect(this.tekenX, this.tekenY, this.breedte, this.hoogte);
	ctxBg.fillStyle = sterkleur;
	ctxBg.fill()
	ctxBg.stroke();
	this.checkOffScreen();
};

Ster2.prototype.draw = function() {
	this.tekenX -= this.snelheid;
	ctxBg.beginPath();
	ctxBg.rect(this.tekenX, this.tekenY, this.breedte, this.hoogte);
	ctxBg.fillStyle = sterkleur;
	ctxBg.fill()
	ctxBg.stroke();
	this.checkOffScreen();
};

Ster.prototype.checkOffScreen = function() {
	if (this.tekenX < -1200) {
		this.resetSter();
	}
};

Ster2.prototype.checkOffScreen = function() {
	if (this.tekenX < -1200) {
		this.resetSter();
	}
};

Ster.prototype.resetSter = function() {
	this.tekenX = spelBreedte + Math.random() * 800;
    this.tekenY = Math.random() * 500;
};

Ster2.prototype.resetSter = function() {
	this.tekenX = spelBreedte + Math.random() * 800;
    this.tekenY = Math.random() * 500;
};


function clearCtxBg() {
	ctxBg.clearRect(0, 0, spelBreedte, spelHoogte);
}


function muisClick(e) {
	muisX = e.pageX - canvasMenu.offsetLeft;
	muisY = e.pageY - canvasMenu.offsetTop;
	if (!isPlaying) { 
		if (click()) { 
			audioStart.pause() 
			clearCtxMenu(); 
			startSpel(); 
		}
	}
}

function checkKeyDown(e) {
	var keyID = e.keyCode || e.which;
	if (keyID === 38 || keyID === 87) { 
		speler.isUpKey = true;
		e.preventDefault(); 
	}
	if (keyID === 39 || keyID === 68) { 
		speler.isRightKey = true;
		e.preventDefault();
	}
	if (keyID === 40 || keyID === 83) { 
		speler.isDownKey = true;
		e.preventDefault();
	}
	if (keyID === 37 || keyID === 65) { 
		speler.isLeftKey = true;
		e.preventDefault();
	}
	if (keyID === 32) { 
		speler.isSpacebar = true;
		e.preventDefault();
	}
}

function checkKeyUp(e) {
	var keyID = e.keyCode || e.which;
	if (keyID === 38 || keyID === 87) { 
		speler.isUpKey = false;
		e.preventDefault();
	}
	if (keyID === 39 || keyID === 68) { 
		speler.isRightKey = false;
		e.preventDefault();
	}
	if (keyID === 40 || keyID === 83) { 
		speler.isDownKey = false;
		e.preventDefault();
	}
	if (keyID === 37 || keyID === 65) { 
		speler.isLeftKey = false;
		e.preventDefault();
	}
	if (keyID === 32) { 
		speler.isSpacebar = false;
		speler.isAanHetSchieten = false;
		e.preventDefault();
	}
}
