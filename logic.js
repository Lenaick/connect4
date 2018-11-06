var game = {
    nbColumn: 7,
    nbRow: 6,
    plateau: [],
    partie: [],
    joueurActif: 'player1',
    nbPointP1: 0,
    nbPointP2: 0,


    // Initialisation d'une partie
    init: function () {
        // Réinitialisation des paramètres de la partie
        game.joueurActif = 'player1';
        game.plateau = [];
        game.partie = [];

        // Réinitialisation du nombre de points
        $('#points').text('Joueur 1 (' + game.nbPointP1 + ') - Joueur 2 (' + game.nbPointP2 + ')');

        // Construction du plateau
        game.construirePlateau();

        // Enregistrement des évènements
        $('.column').click(function () {
            game.placerPiece(this);
        })
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
                game.partie[col][row] = 0;
            }
            elemPlateau.append(elemeCol);
        }
    },

    // Placement d'une pièce suite à un click sur une colonne
    placerPiece: function (elem) {
        var i = elem.getAttribute('id');
        var position = $("#" + i).find(".row:not(.player1,.player2)").last();
        position.addClass(game.joueurActif);
        if(game.verifierVictoire(position)) {
            alert('Victoire ' + game.joueurActif);
        }
        game.joueurActif = (game.joueurActif === 'player1' ? 'player2' : 'player1');
    },

    verifierVictoire: function(position) {
        var id = position.attr('id'),
            col = id.split('_')[0],
            row = id.split('_')[1];

        // Vérification ligne horizontal
        var nb = 0;
        for (var i=1; i <= game.nbColumn; i++) {
            // Si la case est selectionner par le joueur actif on augmente l'incrément
            if (game.plateau[i][row].hasClass(game.joueurActif)) nb++;
            // Sinon on remet à zéro l'incrément
            else nb = 0;
            // Si on a au moins 4 case consécutives qui se suivent on met fin au parcours
            if (nb >= 4) return true;
        }

        // Vérification ligne verticale
        nb = 0;
        for (var i=1; i <= game.nbRow; i++) {
            if (game.plateau[col][i].hasClass(game.joueurActif)) nb++;
            else nb = 0;
            if (nb >= 4) return true;
        }

        // Vérification diagonale vers la droite
        nb = 0;
        var delta = row - col,
            rowMin = (delta > 0 ? delta + 1 : 1),
            rowMax = (game.nbColumn + delta < game.nbRow ? game.nbColumn + delta : game.nbRow);
        for (var i=rowMin; i <= rowMax; i++) {
            if (game.plateau[i - delta][i].hasClass(game.joueurActif)) nb++;
            else nb = 0;
            if (nb >= 4) return true;
        }

        // Vérification diagonale vers la gauche
        nb = 0;
        delta = parseInt(row) + parseInt(col);
        rowMin = (delta > game.nbColumn ? delta - game.nbColumn : 1);
        rowMax = (delta - 1 < game.nbRow ? delta - 1 : game.nbRow);
        for (var i=rowMin; i <= rowMax; i++) {
            if (game.plateau[delta - i][i].hasClass(game.joueurActif)) nb++;
            else nb = 0;
            if (nb >= 4) return true;
        }
        return false;
    }

};

$(document).ready(function () {
    game.init();
});
