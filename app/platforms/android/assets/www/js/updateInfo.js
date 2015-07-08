/* *** Variables globales *** */

// --- Constantes
const tz= "Europe/Paris"; // Représente le timezone où se situe le serveur qui répond à notre requête. Cela
// permet de gérer la synchronisation.

const imER="img/logo.png";
const imFR="img/fr_logo52x49.png";


// --- Variables globales
var currentNode; // Variable qui contient les infos de la piste courante, dans un noeud xml qu'il faut donc parser
var nextNode; // Varibale qui contient les infos de la piste à venir, dans un noeud xml qu'il faut donc parser
var nextNode1;
var nextNode2; // Variable qui contient les onfos sur la piste à venir après la piste à venir, toujours
// dans un noeud xml

var fetchFlag= false; // Variable qui est mise à true lorsqu'on vient de question le serveur pour récupérer es info
// sur les playlists

//TODO comment the use of these varibales
var currentTitle=null;
var currentArtist=null;



// Fonction qui crée et retourne un objet qui permet d'exécuter une requête Http.
// Cet objet c'est XMLHttpRequest
function getXMLHttpRequest() {
    var xhr = null;
    
    if (window.XMLHttpRequest || window.ActiveXObject) {
        if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch(e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        } else {
            xhr = new XMLHttpRequest(); 
        }
    } else {
        //alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
        return null;
    }
    return xhr;
}


// Envoie la requette Http et récupère la réponse. Cette réponse est ensuite passée à la function
// callback qui va se charger de la parser et de lire les informations.
function request(callback, sync){
	// The request must be synchronized	
	var xhr = getXMLHttpRequest();
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
            callback(JSON.parse(xhr.responseText));
        }
    };
    
    xhr.open("GET", currentUrl, sync); // This request is synchronized or not depending on the variable sync
    xhr.send(null); // TODO We are not sending data so --> Delete this line ?
}

// Fonction exécutée lorsqu'on lance la requete pour la première fois.
function firstFetch(){
	request(readData, true);
}

// Fonction qui permet de parser les informations contenues dans la réponse du serveur.
// Cette réponse est au format XML. L'arbre DOM a déjà été généré lors de la récupération de la réponse dans la méthode
// request.
function readData(sData){
    navigator.notification.alert(currentUrl+JSON.stringify(sData.songOnAir.artiste_nom), function(){});
    if (sData != null) {
        currentNode = sData.songOnAir;
        nextNode1 = sData.nextSong1;
        nextNode = nextNode1;
        nextNode2 = sData.nextSong2;
        fetchFlag = true;
        changeInfo();
    } else {

        window.plugins.toast.show('Erreur dans la lecture du flux', 'long', 'center',
            function(a){console.log('toast success: ' + a)}, function(b){alert('toast error: ' + b)});

        // Si la lecture du flux des images échoue on affiche le logo de la radio concernée.
        if (currentUrl==BASE_URL+'er'){
            changeCurrentImage(imER);
            changeCurrentTitle("ESSENTIEL radio");
        }else{
            changeCurrentImage(imFR);
            changeCurrentTitle("ESSENTIEL fr");
        }
        currentNode=null;
        nextNode=null;

    }
}

// Fonction qui utilise les infos contenues dans currentNode pour mettre à jours
// les informations sur l'interface.
function changeInfo(){
	// Use currentNode pour mettre à jour les info
    currentTitle=currentNode.titre_nom;
    currentArtist=currentNode.artiste_nom;

    if(currentNode.titre_image_mini){
        changeCurrentImage(currentNode.titre_image_mini);
    }else{
        changeCurrentImage(currentNode.titre_image);
    }


    changeCurrentTitle(currentTitle+" | "+currentArtist);
    changeLyrics(currentTitle,currentArtist,"ESSENTIEL radio vous fournit aussi les paroles !!!");
    if(currentNode==nextNode2){
        changeComingSoon("");
    }else{
        var next="";
        if (nextNode!=null){
              next=nextNode.titre_nom+" | "+ nextNode.artiste_nom;
        }
        changeComingSoon(next);

    }
}

// Fonction qui est appelé lorsque le timer expire.
function whenTimerExpire(){
	currentNode = nextNode;
	nextNode = nextNode2;
	/*if (currentNode==nextNode2){
		request(readData, true); // This request should be assynchronized
	}*/
    request(readData, true);
    changeInfo();
	setTimer(whenTimerExpire);
}
var tim;
var counter;
var duration;

var hours;
var minutes;
var seconds;

function setTimer(callback){
	var milliseconds;
	if(fetchFlag){
		fetchFlag = false;
		milliseconds = calculateTimeDiff(moment().tz(tz),moment.tz(getStartTime(nextNode),tz));
	}else{
		if(currentNode == nextNode2){
            milliseconds = getLengthInMilli(currentNode);
        }else{
            milliseconds = calculateTimeDiff(moment.tz(getStartTime(currentNode),tz), moment.tz(getStartTime(nextNode),tz));
        }
	}
	window.setTimeout(callback, milliseconds);
    duration=Math.floor(milliseconds/1000);
    convert(duration);
    counter=seconds;
    stopCounter();
    runCounter();
}

function runCounter(){
    tim = setInterval(function(){
        if(counter<=0){
            --minutes;
            counter=60;
            }
        if (minutes<0){
            clearInterval(tim);
            document.getElementById('audio_duration').innerHTML = "0 sec";
            return;
        }
        document.getElementById('audio_duration').innerHTML = minutes + " min "+ (counter--) + " sec";
    },1000);
}

function convert(totalSeconds){
    hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    minutes = Math.floor(totalSeconds / 60);
    seconds = totalSeconds % 60;
}

function stopCounter(){
    clearInterval(tim);
}

function resetCounter(){
    clearInterval(tim);
    runCounter();

}
//====================================================================

function calculateTimeDiff(firstValue, secondValue){
    //startTime is a <moment>
    //today is a <moment>
    // Both must be in the same timezone
    return secondValue.diff(firstValue);
}

function convertInMillisecond(length){
    return ((length[0]*60+length[1])*60+length[2])*1000;
}

//=======================================================================

function changeCurrentImage(imageUrl){
    var element=document.getElementById("current-radio");

    element.src=imageUrl;
    if (imageUrl == imER || imageUrl == imFR){
        //do nothing
    }else{
        element.style ="max-width:100%;height:auto;";
    }

}

function changeCurrentTitle(newTitle){
    document.getElementById('titre_piste').innerHTML=newTitle;

    document.getElementById('btn_pause_transfo').innerHTML=newTitle;
    document.getElementById('btn_pause_jdg').innerHTML=newTitle;
    document.getElementById('btn_pause_campus').innerHTML=newTitle;
}

function changeLyrics(title, auther, content){
    document.getElementById("title_paroles").innerHTML="Titre: "+title;
    document.getElementById("auteur_paroles").innerHTML="Auteur: "+auther;
    document.getElementById("contenu_paroles").innerHTML=content;
}

function changeComingSoon(coming){
    document.getElementById('coming_soon').innerHTML="Coming soon: "+coming;
}


function getLength(songNode){
    var data = songNode.titre_duree.split(":");
    var result = new Map();
    result.set('minutes',parseInt(data[0]));
    result.set('seconds',parseInt(data[1]));
    return result; 
}

function getLengthInMilli(songNode){
    var data = songNode.titre_duree.split(":");
    return parseInt(data[0])*60*1000 + parseInt(data[1]*1000);
}

function getStartTimeArray(songNode){
	return getStartTime(songNode).split(" ");
}

function getStartTime(songNode) {
	//var startTimeElement= songNode.getElementsByTagName("startTime")[0];
	return songNode.titre_diffusion_date;
}



