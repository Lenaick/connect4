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
        var
            joueur = this.currentGame.joueurActif,
            cps = this.obtenirCoupsPossibles(unPlateau),
            resultat = cps.ieme(1),
            meilleurScore = this.scoreDUnCoup(unPlateau, resultat, joueur, joueur, this.currentGame.profondeur),
            meilleurScores = [resultat];
        // console.log('obtenirCoup : meilleurScore=' + meilleurScore);
        //console.log('obtenirCoup : cps.nb()=' + cps.nb());
        // var randomCoups = shuffle(cps.colDispos());
        // randomCoups.forEach(function(el, idx) {
        //     // console.log('obtenirCoup : i=' + i);
        //     var score = this.scoreDUnCoup(unPlateau, cps.ieme(i), joueur, joueur, this.currentGame.profondeur);
        //     // console.log('obtenirCoup : scoreDUnCoup=' + score);
        //     // Changement de meilleur score
        //     if (score > meilleurScore) {
        //         resultat = cps.ieme(i);
        //         meilleurScore = score;
        //         meilleurScores = [resultat];
        //     } else if (score === meilleurScore) {
        //         meilleurScores.push(cps.ieme(i));
        //     }
        // }, this);

        var loop = [];
        console.log(cps);
        for (var i=2; i <= cps.nb(); i++) {
            loop.push(i);
        }
        console.log(loop);
        loop = shuffle(loop);
        console.log(loop);
        loop.forEach(function(i) {
            // console.log('obtenirCoup : i=' + i);
            var score = this.scoreDUnCoup(unPlateau, cps.ieme(i), joueur, joueur, this.currentGame.profondeur);
            // console.log('obtenirCoup : scoreDUnCoup=' + score);
            // Changement de meilleur score
            if (score > meilleurScore) {
                resultat = cps.ieme(i);
                meilleurScore = score;
                meilleurScores = [resultat];
            } else if (score === meilleurScore) {
                meilleurScores.push(cps.ieme(i));
            }
        }, this);

        // for (var i=2; i <= cps.nb(); i++) {
        //     // console.log('obtenirCoup : i=' + i);
        //     var score = this.scoreDUnCoup(unPlateau, cps.ieme(i), joueur, joueur, this.currentGame.profondeur);
        //     // console.log('obtenirCoup : scoreDUnCoup=' + score);
        //     // Changement de meilleur score
        //     if (score > meilleurScore) {
        //         resultat = cps.ieme(i);
        //         meilleurScore = score;
        //         meilleurScores = [resultat];
        //     } else if (score === meilleurScore) {
        //         meilleurScores.push(cps.ieme(i));
        //     }
        // }
        return meilleurScores[Math.floor(Math.random() * meilleurScores.length)];
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
        var _unPlateau, lastRow;
        _unPlateau = jQuery.extend(true, {}, unPlateau);
        if (unPlateau[col].length === 0) {
            lastRow = 1;
            unPlateau[col][1] = joueur;
        } else {
            lastRow = unPlateau[col].length;
            unPlateau[col][lastRow] = joueur;
        }
        return [unPlateau, lastRow];
    },
    scoreDUnCoup: function(unPlateau, col, joueurRef, joueurCourant, profondeur) {
        var row;
        [unPlateau, row] = this.jouerUnCoup(unPlateau, col, joueurCourant);
        //console.log('scoreDunCoup : col=' + col + ' joueurRef=' + joueurRef + ' joueurCourant=' + joueurCourant + ' profondeur=' + profondeur);
        if (game.plateauTotalementRemplit(unPlateau) || game.coupGagnant(unPlateau, col, row) || profondeur === 0) {
            return this.evaluer(unPlateau, joueurRef);
        }
        var autreJoueur = (joueurCourant === 'player1' ? 'player2' : 'player1');
        return this.minMax(unPlateau, joueurRef, autreJoueur, profondeur-1);
    },
    minMax: function(unPlateau, joueurRef, joueurCourant, profondeur) {
        //console.log('minMax : joueurRef=' + joueurRef + ' joueurCourant=' + joueurCourant + ' profondeur=' + profondeur);
        var cps = this.obtenirCoupsPossibles(unPlateau),
            resultat = this.scoreDUnCoup(unPlateau, cps.ieme(1),joueurRef, joueurCourant, profondeur);
        //console.log('minMax : cps.ieme(1)=' + cps.ieme(1) + ' resultat=' + resultat);
        for (var i=2; i <= cps.nb(); i++) {
            var score = this.scoreDUnCoup(unPlateau, cps.ieme(i), joueurRef, joueurCourant, profondeur);
            //console.log('minMax : cps.ieme(' + i + ')=' + cps.ieme(i) + ' score=' + score);
            if (joueurCourant === joueurRef) {
                resultat = (resultat < score ? score : resultat);
            } else {
                resultat = (resultat < score ? resultat : score);
            }
        }
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