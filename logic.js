;(function ($) {
    var oAddClass = $.fn.addClass;
    $.fn.addClass = function () {
        for (var i in arguments) {
            var arg = arguments[i];
            if ( !! (arg && arg.constructor && arg.call && arg.apply)) {
                setTimeout(arg.bind(this));
                delete arguments[i];
            }
        }
        return oAddClass.apply(this, arguments);
    }

})(jQuery);

var game = {
    nbColumn: 7,
    nbRow: 6,
    plateau: [],
    partie: [],
    joueurActif: 'player1',
    nbPointP1: 0,
    nbPointP2: 0,
    profondeur: 4,


    // Initialisation d'une partie
    init: function () {
        // Réinitialisation des paramètres de la partie
        game.joueurActif = 'player1';
        game.plateau = [];
        game.partie = [];

        // Réinitialisation du nombre de points
        game.setNbPoints(0,0);

        // Construction du plateau
        game.construirePlateau();

        // Enregistrement des évènements
        game.bindColumn();
    },

    bindColumn: function() {
        $('.column').click(function () {
            game.placerPiece(this);
        }).hover(
            function() {
                var position = game.getLastRowPosition(this);
                if(position.length > 0 && game.joueurActif === 'player1') position.addClass(game.joueurActif + 'Hover');
            },
            function() {
                var position = game.getLastRowPosition(this);
                if(position.length > 0 && game.joueurActif === 'player1') position.removeClass(game.joueurActif + 'Hover');

            });
    },

    setNbPoints: function(nbPointP1, nbPointP2) {
        game.nbPointP1 = nbPointP1 === undefined ? game.nbPointP1 : nbPointP1;
        game.nbPointP2 = nbPointP2 === undefined ? game.nbPointP2 : nbPointP2;
        $('#points').html('<p>' +
            '<span class="player1">Joueur 1 (' + game.nbPointP1 + ')</span> - ' +
            '<span class="player2">Joueur 2 (' + game.nbPointP2 + ')</span>' +
        '</p>');
    },

    // Construction du plateau
    construirePlateau: function () {
        var elemPlateau = $('#plateau');
        elemPlateau.empty();
        for (var col = 1; col <= game.nbColumn; col++) {
            game.plateau[col] = [];
            game.partie[col] = [];
            var elemeCol = $('<div class="column" id="' + col + '"></div>');
            for (var row = game.nbRow; row >= 1; row--) {
                var elem = $('<div class="row" id="' + col + '_' + row + '"></div>');
                elemeCol.append(elem);
                game.plateau[col][row] = elem;
            }
            elemPlateau.append(elemeCol);
        }
    },

    // Placement d'une pièce suite à un click sur une colonne
    placerPiece: function (elem) {
        var position = game.getLastRowPosition(elem);
        if (position.length > 0) {
            position.removeClass(game.joueurActif + 'Hover');
            position.addClass(game.joueurActif, function() {
                var [col, row] = game.getColRow(position);
                //On remplit le tableau de la partie
                game.partie[col][row] = game.joueurActif;
                // Vérification du cas de victoire
                if(game.verifierVictoire(game.plateau, col, row))
                    game.victoire();
                else
                    game.switchActif();
            });
        }
    },

    getLastRowPosition: function(elem) {
        var i = elem.getAttribute('id');
        return $("#" + i).find(".row:not(.player1,.player2)").last();
    },

    switchActif: function() {
        game.joueurActif = (game.joueurActif === 'player1' ? 'player2' : 'player1');
        if (game.joueurActif === 'player2') {
            var col = IA.obtenirCoup(game);
            $("#" + col).trigger("click");
        }
    },

    victoire: function () {
        $('.column').unbind();
        if (game.joueurActif === 'player1')
            game.nbPointP1++;
        else
            game.nbPointP2++;
        game.setNbPoints();
        game.confirmNouvelleManche();
    },

    confirmNouvelleManche: function () {
        if (confirm('Victoire ' + game.joueurActif + '\nCommencer une nouvelle manche ?')) {
            $('#plateau').unbind('click').find('.row.player1,.row.player2').removeClass('player1 player2');
            game.bindColumn();
            game.switchActif();
        } else {
            $('#plateau').unbind('click').click(game.confirmNouvelleManche);
        }
    },

    getColRow: function(position) {
        return position.attr('id').split('_');
    },

    verifierVictoire: function(unPlateau, col, row) {
        // Vérification ligne horizontal
        var nb = 0;
        for (var i=1; i <= game.nbColumn; i++) {
           // Si la case est selectionner par le joueur actif on augmente l'incrément
            if (this.checkSelection(unPlateau[i][row])) nb++;
            // Sinon on remet à zéro l'incrément
            else nb = 0;
            // Si on a au moins 4 case consécutives qui se suivent on met fin au parcours
            if (nb >= 4) return true;
        }

        // Vérification ligne verticale
        nb = 0;
        for (var i=1; i <= game.nbRow; i++) {
            if (this.checkSelection(unPlateau[col][i])) nb++;
            else nb = 0;
            if (nb >= 4) return true;
        }

        // Vérification diagonale vers la droite
        nb = 0;
        var delta = row - col,
            rowMin = (delta > 0 ? delta + 1 : 1),
            rowMax = (game.nbColumn + delta < game.nbRow ? game.nbColumn + delta : game.nbRow);
        for (var i=rowMin; i <= rowMax; i++) {
            if (this.checkSelection(unPlateau[i-delta][i])) nb++;
            else nb = 0;
            if (nb >= 4) return true;
        }

        // Vérification diagonale vers la gauche
        nb = 0;
        delta = parseInt(row) + parseInt(col);
        rowMin = (delta > game.nbColumn ? delta - game.nbColumn : 1);
        rowMax = (delta - 1 < game.nbRow ? delta - 1 : game.nbRow);
        for (var i=rowMin; i <= rowMax; i++) {
            if (this.checkSelection(unPlateau[delta - i][i])) nb++;
            else nb = 0;
            if (nb >= 4) return true;
        }
        return false;
    },

    checkSelection: function(o) {
        if (typeof o === "string") {
            return o === game.joueurActif;
        } else if (typeof o === "object" && o.hasClass(game.joueurActif)) {
            return true
        }
        return false;
    },

    plateauTotalementRemplit: function(unPlateau) {
        var nbColRemplit = 0;
        for (var i=1; i <= game.nbColumn; i++) {
            // Si la dernière ligne est remplit alors la colonne est remplit
            nbColRemplit += (typeof unPlateau[i][game.nbRow] !== "undefined" ? 1 : 0);
        }
        return nbColRemplit === game.nbColumn;
    },

    coupGagnant: function(unPlateau, col, row) {
        //console.log("coupGagnant : verifierVictoire (" + col + ", " + row + ")" + game.verifierVictoire(unPlateau, col, row));
        return game.verifierVictoire(unPlateau, col, row);
    }

};

$(document).ready(function () {
    game.init();
});
