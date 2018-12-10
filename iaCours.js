var Coups = {
    coups: {
        lesCoups: [],//Array(game.nbColumn).fill(),//undefined,
        nbCoups: 0//undefined
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

var IA = {
    obtenirCoup: function (joueur) {
        var unPlateau = game.partie,
            cps = this.obtenirCoupsPossibles(unPlateau),
            resultat = cps.ieme(1),
            meilleurScore = this.scoreDUnCoup(unPlateau, resultat, joueur, joueur, game.profondeur);
        console.log('obtenirCoup : meilleurScore=' + meilleurScore);
        console.log('obtenirCoup : cps.nb()=' + cps.nb());
        for (var i=2; i <= cps.nb(); i++) {
            console.log('obtenirCoup : i=' + i);
            var score = this.scoreDUnCoup(unPlateau, cps.ieme(i), joueur, joueur, game.profondeur);
            console.log('obtenirCoup : scoreDUnCoup=' + score);
            if (score > meilleurScore) {
                resultat = cps.ieme(i);
                meilleurScore = score;
            }
        }
        return resultat;
    },
    obtenirCoupsPossibles: function(unPlateau) {
        var resultat = Coups.init();
        for (var i=1; i <= game.nbColumn; i++) {
            if (typeof unPlateau[i][game.nbRow] === "undefined") {
                resultat.ajouterCoup(i);
            }
        }
        return resultat;
    },
    jouerUnCoup: function(unPlateau, col, joueur) {
        if (unPlateau[col].length == 0) {
            unPlateau[col][1] = joueur;
        } else {
            var lastRow = unPlateau[col].length - 1;
            unPlateau[col][lastRow] = joueur;
        }
        return unPlateau;
    },
    scoreDUnCoup: function(unPlateau, col, joueurRef, joueurCourant, profondeur) {
        unPlateau = this.jouerUnCoup(unPlateau, col, joueurCourant);
        //console.log('scoreDunCoup : col=' + col + ' joueurRef=' + joueurRef + ' joueurCourant=' + joueurCourant + ' profondeur=' + profondeur);
        if (game.plateauTotalementRemplit(unPlateau) || game.coupGagnant(unPlateau, col) || profondeur === 0) {
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
        for (var col=1; col < game.nbColumn; col++) {
            for (var row=1; row < game.nbColumn; row++) {
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
    nbPionsAlignesVerticalement: function(unPlateau, col, row) {
        var nb = 1;
        // On vérifie que le pion du dessous est bien différent pour éviter de compter deux fois le pion
        if (typeof unPlateau[col] !== "undefined" && typeof unPlateau[col][row-1] !== "undefined" &&
                unPlateau[col][row-1] === game.joueurActif) {
            return 0;
        }
        // On compte les pions en dessous
        if (row !== 1) {
            for (var i=row-1; i <= 1; i--) {
                if (unPlateau[col][i] !== game.joueurActif) break;
                nb++;
            }
        }
        // On compte les pions au dessus
        if (row !== game.nbRow) {
            for (var i=row+1; i <= game.nbRow; i++) {
                if (unPlateau[col][i] !== game.joueurActif) break;
                nb++;
            }
        }
        return nb;
    },
    nbPionsAlignesHorizontalement: function(unPlateau, col, row) {
        var nb = 1;
        // On vérifie que le pion de gauche est bien différent pour éviter de compter deux fois le pion
        if (typeof unPlateau[col-1] !== "undefined" && typeof unPlateau[col-1][row] !== "undefined" && unPlateau[col-1][row] === game.joueurActif) {
            return 0;
        }
        // On compte les pions à gauche
        if (col !== 1) {
            for (var i=col-1; col <=1; i--) {
                if (unPlateau[i][row] !== game.joueurActif) break;
                nb++;
            }
        }
        // On compte les pions à droite
        if (col !== game.nbColumn) {
            for (var i=col+1; i <= game.nbColumn; i++) {
                if (game.plateau[i][row] !== game.joueurActif) break;
                nb++;
            }
        }
        return nb;
    },
    nbPionsAlignesDiagonalementGaucheADroite: function(unPlateau, col, row) {
        var nb = 1;
        // On vérifie que le pion en bas à gauche est bien différent pour éviter de compter deux fois le pion
        if (typeof unPlateau[col-1] !== "undefined" && typeof unPlateau[col-1][row-1] !== "undefined" && unPlateau[col-1][row-1] === game.joueurActif) {
            return 0;
        }
        // On compte les pions en diagonales gauche a droite vers le haut
        if (col !== game.nbColumn && row !==game.nbRow) {
            var i=col+1, j=row+1;
            while (i <= game.nbColumn && j <= game.nbRow) {
                if (game.plateau[i][j] !== game.joueurActif) break;
                nb++;i++;j++;
            }
        }
        // On compte les pions en diagonales gauche a droite vers le bas
        if (col !== 1 && row !== 1) {
            var i=col-1, j=row-1;
            while (i <= 1 && j <= 1) {
                if (game.plateau[i][j] !== game.joueurActif) break;
                nb++;i--;j--;
            }
        }
        return nb;
    },
    nbPionsAlignesDiagonalementDroiteAGauche: function(unPlateau, col, row) {
        var nb = 1;
        // On vérifie que le pion en bas à droite est bien différent pour éviter de compter deux fois le pion
        if (typeof unPlateau[col+1] !== "undefined" && typeof unPlateau[col+1][row-1] !== "undefined" && unPlateau[col+1][row-1] === game.joueurActif) {
            return 0;
        }
        // On compte les pions en diagonales droite a gauche vers le haut
        if (col !== 1 && row !== game.nbRow) {
            var i=col-1, j=row+1;
            while (i <= 1 && j <= game.nbRow) {
                if (game.plateau[i][j] !== game.joueurActif) break;
                nb++;i--;j++;
            }
        }
        // On compte les pions en diagonales droite a gauche vers le bas
        if (col !== game.nbColumn && row !== 1) {
            var i=col+1, j=row-1;
            while (i <= game.nbColumn && j <= 1) {
                if (game.plateau[i][j] !== game.joueurActif) break;
                nb++;i++;j--;
            }
        }
        return nb;
    },
};