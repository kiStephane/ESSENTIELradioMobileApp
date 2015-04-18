/**
 * Created by stephaneki on 16/04/15.
 */

function Favorite(id, title, artist, image){
    this.id=id;
    this.title = title;
    this.artist = artist;
    this.image = image;
}


function saveFavorite(){

    var newFavorite=new Favorite(getIdFromCounter(),
        getTitle(currentNode),
        getArtiste(currentNode),
        getImage(currentNode));

    var favorites = JSON.parse(localStorage.getItem("favorites"));
    favorites.push(newFavorite);

    localStorage.setItem("favorites", JSON.stringify(favorites));

    addToFavoriteListView(newFavorite);

    window.plugins.toast.show('Favori sauvegardé', 'long', 'center', null, null);
}

function initFavoritesList(){
    var favorites = localStorage.getItem("favorites");
    if(favorites===null || favorites===undefined){
        localStorage.setItem("favorites", JSON.stringify([]));
    }
}

function deleteFavorite(id){

    var favorites = JSON.parse(localStorage.getItem("favorites"));
    var index=-1;
    for (var i=0; i < favorites.length; i++){
        if(favorites[i].id === id){
            index=i;
            break;
        }
    }
    if(index > -1){
        favorites.splice(i, 1);
    }


    //Update favorites list
    localStorage.setItem("favorites", JSON.stringify(favorites));

    //Delete the view
    document.getElementById("favoritesList").removeChild(document.getElementById(id));

    window.plugins.toast.show('Favori supprimé', 'long', 'center', null, null);
}



function deleteRequest(id){
    navigator.notification.confirm(
        'Voulez vraiment supprimer ce favoris ?', // message
        function(buttonIndex) {
        if(buttonIndex===1){
            deleteFavorite(id);
        }
    },            // callback to invoke with index of button pressed
        'Supprimer le favori',           // title
        ['Valider','Annuler']     // buttonLabels

    );
}

function addToFavoriteListView(favorite){

    var fav = document.createElement("li");
    fav.setAttribute("data-icon","delete");
    fav.setAttribute("id", favorite.id);

    var deleteButton = document.createElement("a");
    deleteButton.setAttribute("href", "#");
    deleteButton.setAttribute("onClick", "deleteRequest("+favorite.id.toString()+")");

    var image = document.createElement("img");
    image.setAttribute("src", favorite.image);

    var title = document.createElement("h2");
    title.innerHTML=favorite.title;

    var artist = document.createElement("p");
    artist.innerHTML=favorite.artist;

    deleteButton.appendChild(image);
    deleteButton.appendChild(title);
    deleteButton.appendChild(artist);

    fav.appendChild(deleteButton);

    document.getElementById("favoritesList").appendChild(fav);

}

function initFavoritesListView(){

    var favorites = JSON.parse(localStorage.getItem("favorites"));

    favorites.forEach(function(entry){addToFavoriteListView(entry);});
}