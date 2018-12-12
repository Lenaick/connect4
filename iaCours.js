var Coups = {
    coups: {
        lesCoups: [],//Array(game.nbColumn).fill(),//undefined,
        nbCoups: 0//undefined,
    },
    init: function() {
        //this.coups.lesCoups = Array(game.nbColumn).fill();
        this.coups.nbCoups = 0;
        return this;
    },
    nb: function () {
        return this.coups.nbCoups;
    },
    ajouterCoup: function(col) {
        this.coups.nbCoups++;
        this.coups.lesCoups[this.coups.nbCoups] = col;
    },
    ieme: function (i) {
        if (0 < i <= this.nb()) {
            return this.coups.lesCoups[i];
        }
    }
};

function Arbre() {
    this.score = undefined;
    this.profondeur = undefined;
    this.fils = [];
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

var IA = {
    currentGame: undefined,
    obtenirCoup: function (currentGame) {
        this.currentGame = currentGame;
        var unPlateau = jQuery.extend(true, {}, currentGame.partie);
        var profondeur = currentGame.profondeur;
        var joueur = this.currentGame.joueurActif;
        var meilleurScores = this.meilleurScores(unPlateau, joueur, profondeur);
        return meilleurScores[Math.floor(Math.random() * meilleurScores.length)];
    },
    randCoupsPossible: function(unPlateau, cps) {
        var loop = [];
        for (var i=1; i <= cps.nb(); i++)
            loop.push(i);
        return shuffle(loop);
    },
    meilleurScores: function(unPlateau, joueur, profondeur) {
        var cps = this.obtenirCoupsPossibles(unPlateau),
            resultat, meilleurScore, meilleurScores = [],
            loop = this.randCoupsPossible(unPlateau, cps),
            arbreParent = new Arbre();
        loop.forEach(function(i) {
            var arbre = new Arbre();
            var score = this.scoreDUnCoup(unPlateau, cps.ieme(i), joueur, joueur, profondeur, profondeur, arbre);
            arbre.score = score;
            arbre.profondeur = profondeur;
            arbreParent.fils.push(arbre);
            if (typeof meilleurScore === "undefined" || score > meilleurScore) {
                resultat = cps.ieme(i);
                meilleurScore = score;
                meilleurScores = [resultat];
            } else if (score === meilleurScore) {
                meilleurScores.push(cps.ieme(i));
            }
        }, this);
        console.log(arbreParent);
        return meilleurScores;
    },
    obtenirCoupsPossibles: function(unPlateau) {
        var resultat = Object.create(Coups);
        resultat.coups = jQuery.extend(true, {}, resultat.coups);
        resultat.init();
        for (var i=1; i <= this.currentGame.nbColumn; i++) {
            if (!this.isset(unPlateau[i][this.currentGame.nbRow])) {
                resultat.ajouterCoup(i);
            }
        }
        return resultat;
    },
    jouerUnCoup: function(unPlateau, col, joueur) {
        var lastRow;
        if (unPlateau[col].length === 0) {
            lastRow = 1;
            unPlateau[col][1] = joueur;
        } else {
            lastRow = unPlateau[col].length;
            unPlateau[col][lastRow] = joueur;
        }
        return lastRow;
    },
    scoreDUnCoup: function(unPlateau, col, joueurRef, joueurCourant, profondeurRef, profondeurCourante, arbre) {
        var _unPlateau = jQuery.extend(true, {}, unPlateau),
            row = this.jouerUnCoup(_unPlateau, col, joueurCourant);
        //console.log('scoreDunCoup : col=' + col + ' joueurRef=' + joueurRef + ' joueurCourant=' + joueurCourant + ' profondeur=' + profondeur);
        if (game.plateauTotalementRemplit(_unPlateau) || game.coupGagnant(_unPlateau, col, row) || profondeurCourante === 0) {
            return this.evaluer(_unPlateau, joueurRef);
        }
        var autreJoueur = (joueurCourant === 'player1' ? 'player2' : 'player1');
        return this.minMax(_unPlateau, joueurRef, autreJoueur, profondeurRef, profondeurCourante-1, arbre);

    },
    minMax: function(unPlateau, joueurRef, joueurCourant, profondeurRef, profondeurCourante, arbreParent) {
        //console.log('minMax : joueurRef=' + joueurRef + ' joueurCourant=' + joueurCourant + ' profondeur=' + profondeur);
        var cps = this.obtenirCoupsPossibles(unPlateau),
            _unPlateau = jQuery.extend(true, {}, unPlateau),
            resultat, loop = this.randCoupsPossible(unPlateau, cps);
        loop.forEach(function(i, idx) {
            // if (idx === loop.length) profondeurRef = profondeurRef - 1;
            // profondeurCourante = profondeurRef;
            var arbre = new Arbre();
            var score = this.scoreDUnCoup(_unPlateau, cps.ieme(i), joueurRef, joueurCourant, profondeurRef, 0 + profondeurCourante, arbre);
            // if (index === loop.length) {
            // if (profondeurRef > 0) {
            //     profondeurRef--;
            // }
            // profondeurCourante = profondeurRef;
            arbre.score = score;
            arbre.profondeur = profondeurCourante;
            arbreParent.fils.push(arbre);
            //console.log('minMax : cps.ieme(' + i + ')=' + cps.ieme(i) + ' score=' + score);
            if (joueurCourant === joueurRef) {
                resultat = (typeof resultat === "undefined" || resultat < score ? score : resultat);
            } else {
                resultat = (typeof resultat === "undefined" || resultat < score ? resultat : score);
            }
        }, this);
        arbreParent.score = resultat;
        arbreParent.profondeur = profondeurCourante;

        // if (profondeurRef > 0) {
        //     profondeurRef--;
        // }
        // profondeurCourante = profondeurRef;
        return resultat;
    },
    evaluer: function(unPlateau, joueurRef) {
        var autreJoueur = (joueurRef === 'player1' ? 'player2' : 'player1');
        //console.log('evaluer : score(' + joueurRef + ')=' + this.score(joueurRef) + ' score(' + autreJoueur + ')=' + this.score(autreJoueur));
        return this.score(unPlateau, joueurRef) - this.score(unPlateau, autreJoueur);
    },
    scoreAlignement: function(nb) {
        if (nb === 2)
            return 5;
        else if (nb === 3)
            return 50;
        else if (nb === 4)
            return 1000;
        return nb;
    },
    score: function(unPlateau, joueurRef) {
        var resultat = 0;
        for (var col=1; col < this.currentGame.nbColumn; col++) {
            for (var row=1; row < this.currentGame.nbColumn; row++) {
                if (unPlateau[col][row] == joueurRef) {
                    resultat += this.scoreAlignement(this.nbPionsAlignesVerticalement(unPlateau, col, row));
                    resultat += this.scoreAlignement(this.nbPionsAlignesHorizontalement(unPlateau, col, row));
                    resultat += this.scoreAlignement(this.nbPionsAlignesDiagonalementGaucheADroite(unPlateau, col, row));
                    resultat += this.scoreAlignement(this.nbPionsAlignesDiagonalementDroiteAGauche(unPlateau,col, row));
                }
            }
        }
        //console.log('score : joueurRef=' + joueurRef + ' resultat=' + resultat);
        return resultat;
    },
    isset: function(o) {
        return !(null === o || typeof o === "undefined");
    },
    nbPionsAlignesVerticalement: function(unPlateau, col, row) {
        var nb = 1;
        // On vérifie que le pion du dessous est bien différent pour éviter de compter deux fois le pion
        if (this.isset(unPlateau[col]) && this.isset(unPlateau[col][row-1]) && unPlateau[col][row-1] === this.currentGame.joueurActif) {
            return 0;
        }
        // On compte les pions en dessous
        if (row !== 1) {
            for (var i=row-1; i <= 1; i--) {
                if (unPlateau[col][i] !== this.currentGame.joueurActif) break;
                nb++;
            }
        }
        // On compte les pions au dessus
        if (row !== this.currentGame.nbRow) {
            for (var i=row+1; i <= this.currentGame.nbRow; i++) {
                if (unPlateau[col][i] !== this.currentGame.joueurActif) break;
                nb++;
            }
        }
        return nb;
    },
    nbPionsAlignesHorizontalement: function(unPlateau, col, row) {
        var nb = 1;
        // On vérifie que le pion de gauche est bien différent pour éviter de compter deux fois le pion
        if (this.isset(unPlateau[col-1]) && this.isset(unPlateau[col-1][row]) && unPlateau[col-1][row] === this.currentGame.joueurActif) {
            return 0;
        }
        // On compte les pions à gauche
        if (col !== 1) {
            for (var i=col-1; col <=1; i--) {
                if (unPlateau[i][row] !== this.currentGame.joueurActif) break;
                nb++;
            }
        }
        // On compte les pions à droite
        if (col !== this.currentGame.nbColumn) {
            for (var i=col+1; i <= this.currentGame.nbColumn; i++) {
                if (unPlateau[i][row] !== this.currentGame.joueurActif) break;
                nb++;
            }
        }
        return nb;
    },
    nbPionsAlignesDiagonalementGaucheADroite: function(unPlateau, col, row) {
        var nb = 1;
        // On vérifie que le pion en bas à gauche est bien différent pour éviter de compter deux fois le pion
        if (this.isset(unPlateau[col-1]) && this.isset(unPlateau[col-1][row-1]) && unPlateau[col-1][row-1] === this.currentGame.joueurActif) {
            return 0;
        }
        // On compte les pions en diagonales gauche a droite vers le haut
        if (col !== this.currentGame.nbColumn && row !==this.currentGame.nbRow) {
            var i=col+1, j=row+1;
            while (i <= this.currentGame.nbColumn && j <= this.currentGame.nbRow) {
                if (unPlateau[i][j] !== this.currentGame.joueurActif) break;
                nb++;i++;j++;
            }
        }
        // On compte les pions en diagonales gauche a droite vers le bas
        if (col !== 1 && row !== 1) {
            var i=col-1, j=row-1;
            while (i >= 1 && j >= 1) {
                if (unPlateau[i][j] !== this.currentGame.joueurActif) break;
                nb++;i--;j--;
            }
        }
        return nb;
    },
    nbPionsAlignesDiagonalementDroiteAGauche: function(unPlateau, col, row) {
        var nb = 1;
        // On vérifie que le pion en bas à droite est bien différent pour éviter de compter deux fois le pion
        if (this.isset(unPlateau[col+1]) && this.isset(unPlateau[col+1][row-1]) && unPlateau[col+1][row-1] === this.currentGame.joueurActif) {
            return 0;
        }
        // On compte les pions en diagonales droite a gauche vers le haut
        if (col !== 1 && row !== this.currentGame.nbRow) {
            var i=col-1, j=row+1;
            while (i >= 1 && j <= this.currentGame.nbRow) {
                if (unPlateau[i][j] !== this.currentGame.joueurActif) break;
                nb++;i--;j++;
            }
        }
        // On compte les pions en diagonales droite a gauche vers le bas
        if (col !== this.currentGame.nbColumn && row !== 1) {
            var i=col+1, j=row-1;
            while (i <= this.currentGame.nbColumn && j >= 1) {
                if (unPlateau[i][j] !== this.currentGame.joueurActif) break;
                nb++;i++;j--;
            }
        }
        return nb;
    },
};