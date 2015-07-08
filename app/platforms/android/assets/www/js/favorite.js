/**
 * Created by stephaneki on 16/04/15.
 */

function Favorite(id, title, artist, image, date){
    this.id=id;
    this.title = title;
    this.artist = artist;
    this.image = image;
    this.date=date;
}


function saveFavorite(){

    var newFavorite=new Favorite(getIdFromCounter(),
        currentNode.titre_nom,
        currentNode.artiste_nom,
        currentNode.titre_image_mini, new Date());

    var favorites = JSON.parse(localStorage.getItem("favorites"), function(k, v) {
        if(k === 'date'){
            return new Date(v);
        }
        return v;
    } );
    favorites.push(newFavorite);

    localStorage.setItem("favorites", JSON.stringify(favorites));

    addToFavoriteListView(newFavorite);

    window.plugins.toast.showShortCenter('Favori sauvegardé', null, null);
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

    window.plugins.toast.showShortCenter('Favori supprimé', null, null);

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

function timeToString(date){
    var hourString="";
    var minString="";
    if(date!==undefined && !isNaN(date)){

        var hour=date.getHours();
        hourString=(hour < 10)?"0"+hour.toString():hour.toString();

        var min=date.getMinutes();
        minString = (min < 10)?"0"+min.toString():min.toString();

        document.getElementById("heure").innerHTML = hourString+":" + minString;
    }
    if (hourString == "" && minString == ""){
        return "";
    }
    return hourString+":"+minString;
}

function dayToString(index){
    var day="";
    switch (index) {
        case 0:
            day = "Dimanche";
            break;
        case 1:
            day = "Lundi";
            break;
        case 2:
            day = "Mardi";
            break;
        case 3:
            day = "Mercredi";
            break;
        case 4:
            day = "Jeudi";
            break;
        case 5:
            day = "Vendredi";
            break;
        case 6:
            day = "Samedi";
            break;
    }

    return day;
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
    artist.innerHTML="Artiste: "+favorite.artist;

    var date = document.createElement("p");
    date.innerHTML="Enregistré "+ dayToString(favorite.date.getDay())+" à "+timeToString(favorite.date);


    deleteButton.appendChild(image);
    deleteButton.appendChild(title);
    deleteButton.appendChild(artist);
    deleteButton.appendChild(date);

    fav.appendChild(deleteButton);

    document.getElementById("favoritesList").appendChild(fav);

}

function initFavoritesListView(){

    var favorites = JSON.parse(localStorage.getItem("favorites"),function(k, v) {
        if(k === 'date'){
            return new Date(v);
        }
        return v;
    } );

    favorites.forEach(function(entry){addToFavoriteListView(entry);});
}