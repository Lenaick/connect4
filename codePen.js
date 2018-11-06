/***

 Solution du TD http://defeo.lu/aws/tutorials/tutorial2

 Auteurs : Nicolas Gama, Luca De Feo

 **/

/* cet objet contient l'état du système et son interface.
 */
var p4 = {
    // cet tableau contient des pointeurs directs vers les cases
    // (noeuds <td> du DOM) du plateau dans la page html
    dom_plateau: [],
    // un entier: 1 ou 2 (le numéro du prochain joueur)
    turn: 1,
    /* un entier:
       0: la partie continue
       -1: la partie est nulle
       1: joueur 1 a gagné
       2: joueur 2 a gagné
     */
    game_status: 0,
    // Nombre de coups joués
    coups: 0,
    // Nombre de lignes
    n: 6,
    // Nombre de colonnes
    m: 7,

    /*
      Intialise un plateau de jeu de dimensions `lignes` × `colonnes`
      et l'ajoute dans l'élément `parent` du dom.
     */
    init: function(parent, lignes, colonnes) {
        //créer le plateau html et affecter les pointeurs directs
        //ATTENTION, la page html est écrite de haut en bas. Les indices
        //pour le jeu vont de bas en haut (compteur i de la boucle)
        if (lignes) this.n = lignes;
        if (colonnes) this.n = colonnes;

        t = document.createElement('table');
        t.id = 'plateau';

        for (var i = this.n - 1; i >= 0; i--) {
            var tr = document.createElement('tr');
            this.dom_plateau[i] = [];
            for (var j = 0; j < this.m; j++) {
                var td = document.createElement('td');
                td.dataset.column = j;
                tr.appendChild(td);
                this.dom_plateau[i][j] = td;
            }
            t.appendChild(tr);
        }
        parent.innerHTML = '';
        parent.appendChild(t);

        t.addEventListener('click', function(e) { p4.handler(e); });
    },

    // function auxiliaire d'affichage
    set: function(row, column, player) {
        // On colore la case
        this.dom_plateau[row][column].className = 'joueur' + player;
        // On compte le coup
        this.coups++;
        // On passe le tour : 3 - 2 = 1, 3 - 1 = 2
        this.turn = 3 - this.turn;
    },

    /* Cette fonction ajoute un pion dans une colonne */
    play: function(column) {
        // Vérifier si la partie est encore en cours
        if (this.game_status != 0) {
            if (window.confirm("La partie est finie!\n\nSouhaitez-vous recommencer?")) {
                this.reset();
            }
            return;
        }

        // Trouver la première case libre dans la colonne
        var row;
        for (var i = 0; i < this.n; i++) {
            if (!this.dom_plateau[i][column].className) {
                row = i;
                break;
            }
        }
        if (row === undefined) {
            window.alert("La colonne est pleine!");
            return;
        }

        // Effectuer le coup
        this.set(row, column, this.turn);

        // Vérifier s'il y a un gagnant, ou si la partie est finie
        if (this.win(row, column, 'joueur' + (3 - this.turn))) {
            this.game_status = 3 - this.turn;
        } else if (this.coups >= this.n * this.m) {
            this.game_status = -1;
        }

        //Au cours de l'affichage, pensez eventuellement, à afficher un
        //message si la partie est finie...
        switch (this.game_status) {
            case -1:
                window.alert("Partie Nulle!!");
                break;
            case 1:
                window.alert("Victoire du joueur 1");
                break;
            case 2:
                window.alert("Victoire du joueur 2");
                break;
        }
    },

    //le gestionnaire d'événements
    handler: function(event) {
        var column = event.target.dataset.column;
        console.log(column);
        //attention, les variables dans les datasets sont TOUJOURS
        //des chaînes de caractère. Si on veut être sûr de ne pas faire de bêtise,
        //il vaut mieux la convertir en entier avec parseInt
        if (column)
            this.play(parseInt(column));
    },


    /*
     Cette fonction vérifie si le coup dans la case `row`, `column` par
     le joueur `cname` est un coup gagnant.

     Renvoie :
       true  : si la partie est gagnée par le joueur `cname`
       false : si la partie continue
   */
    win: function(row, column, cname) {
        // Horizontal
        var count = 0;
        for (var j = 0; j < this.m; j++) {
            count = (this.dom_plateau[row][j].className == cname) ? count+1 : 0;
            if (count >= 4) return true;
        }
        // Vertical
        count = 0;
        for (var i = 0; i < this.n; i++) {
            count = (this.dom_plateau[i][column].className == cname) ? count+1 : 0;
            if (count >= 4) return true;
        }
        // Diagonal
        count = 0;
        var shift = row - column;
        for (var i = Math.max(shift, 0); i < Math.min(this.n, this.m + shift); i++) {
            count = (this.dom_plateau[i][i - shift].className == cname) ? count+1 : 0;
            if (count >= 4) return true;
        }
        // Anti-diagonal
        count = 0;
        shift = row + column;
        for (var i = Math.max(shift - this.m + 1, 0); i < Math.min(this.n, shift + 1); i++) {
            count = (this.dom_plateau[i][shift - i].className == cname) ? count+1 : 0;
            if (count >= 4) return true;
        }

        return false;
    },

    // Cette fonction vide le plateau et remet à zéro l'état
    reset: function() {
        for (var i = 0; i < this.n; i++) {
            for (var j = 0; j < this.m; j++) {
                this.dom_plateau[i][j].className = "";
            }
        }
        this.coups = 0;
        this.game_status = 0;
    },
}

// On initialise le plateau et on l'ajoute à l'arbre du DOM
// (dans la balise d'identifiant `jeu`).
p4.init(document.querySelector('#jeu'));
