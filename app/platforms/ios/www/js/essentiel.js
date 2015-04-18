/* Décrire la fonction globale du fichier ici





*/

/* ******* Variables globales ******* */
var url_er= "http://www.essentielradio.com/app/playlist_short.php?radioOnAir=er"; // Url pour lire les infos
// de la playlist sur ER

var url_fr= "http://www.essentielradio.com/app/playlist_short.php?radioOnAir=fr"; // Url pour lire les infos
// de la playlist sur ESSENTIEL fr
var currentUrl=url_er;

var my_media = null; // Contient l'objet qui permet la lecture du flux audio

var radioOnAir= 'er'; // Indique la radio dont le flux est en cours de lecture.

var er_stream= "http://str81.streamakaci.com:80/"; // Variable contenant l'url du flux audio de er
var fr_stream= "http://essentielradioing.streamakaci.com/essentielfr.mp3"; // Variable contenant l'url du flux audio de fr

var stream=er_stream; // Variable contenant l'url du flux audio
// qui doit être lu par l'objet my_media. Il est initialisé avec l'url de er

var playing= false; // Variable qui indique si la lecture ext en mode play ou pause

/* ********************************** */

/*Initialisation*/
function init(){
    document.addEventListener("deviceready",ondeviceReady ,false);
}

/* Fonction executer lorsque le téléphone lance l'application
* Elle se charge d'initier la lecture des deux flux : audio et info sur
* les programme en cours*/
function ondeviceReady(){

    // TODO Trouver le moyen d'arrêter la notification lorsque l'application est arrêtée
    // Lance la notification au démarrage de l'application
    /*window.plugin.notification.local.add({
        id:      1,
        message: 'Vous écoutez ESSENTIEL radio!',
        ongoing:  true
    });
    window.plugin.notification.local.onclick = function (id, state, json) {
        playAudio();
    };*/
    setSongsInfo();
}

/*  */
function setSongsInfo(){
    playAudio();
	firstFetch();
	setTimer(whenTimerExpire);
	changeInfo();
}

/* Fonction qui stop ou lance la lecture du flux audio
* Si la lecture du flux est en cours alors il arrête la lecture et quand il n'y a
* pas de lecture en cours alors il lance la lecture. */
function playAudio() {
    window.plugins.spinnerDialog.show(null, null, true);
    if (!playing){
        if(my_media==null){
            my_media = new Media(stream, onSuccess, onError, mediaStatus);
        }       
        my_media.play();
        document.getElementById('im_play').setAttribute("src","img/pause-2.png" );
        changeIconToPauseOrPlayOnPodcastsPages(false);

        playing=true;        
    }else{
        my_media.stop();
        my_media.release();
        document.getElementById('im_play').setAttribute("src","img/play-2.png" );
        changeIconToPauseOrPlayOnPodcastsPages(true);
        playing=false;
    }
    //window.plugins.spinnerDialog.hide();
}

// onError Callback
function onError(error) {
    navigator.notification.alert("Impossible de lancer la radio. Relancez l'application", null);
    window.plugins.spinnerDialog.hide();
}

function onSuccess(){
}

/*
Media.MEDIA_NONE = 0;
Media.MEDIA_STARTING = 1;
Media.MEDIA_RUNNING = 2;
Media.MEDIA_PAUSED = 3;
Media.MEDIA_STOPPED = 4;
*/
function mediaStatus(status){
   window.plugins.spinnerDialog.hide();
}

/* Fonction qui met à jour le bouton play/pause sur les page où s'affichent les podcast*/
function changeIconToPauseOrPlayOnPodcastsPages(play){
    var btn = 'ui-icon-pause';
    if (play){
        btn = "ui-icon-play";
    }

    document.getElementById('btn_pause_transfo').setAttribute("class","ui-btn "+btn+" ui-btn-icon-right" );
    document.getElementById('btn_pause_jdg').setAttribute("class","ui-btn "+btn+" ui-btn-icon-right" );
    document.getElementById('btn_pause_campus').setAttribute("class","ui-btn "+btn+" ui-btn-icon-right" );

}

/* Fonction qui permet de changer la lecture du flux et lancer la lecture du flux
* d'une autre web radio.*/
function switchTo(radio){

    if(radio != radioOnAir){
        if(radio=='fr'){
                stream=fr_stream;
                currentUrl=url_fr;
                document.getElementById('current-radio').setAttribute("src","img/fr_logo.png" );               
            }else if(radio=='er'){
                stream=er_stream;
                currentUrl=url_er;
                document.getElementById('current-radio').setAttribute("src","img/logo.png" );

            }
            radioOnAir=radio;       
            my_media.release();
            my_media=null;
            playing=false;
            setSongsInfo();
    }

}


//***************SOCIAL SHARING*****************

var urlRadio= "http://www.essentielradio.com";

/* Cette fonction ouvre le menu de choix de l'application que l'on désire utiliser pour partager le message.
(Exemple: Google+ , Viber, etc)
* Le message est prérempli. Il suffit juste de confirmer l'envoi par la suite*/
function shareOtherApp(){
    var messagePart1= "J'écoute ";
    var messagePart2_bis= " sur ESSENTIEL radio! Bien plus que de la Radio. ";
    window.plugins.socialsharing.share(messagePart1+document.getElementById('titre_piste').innerHTML
        +messagePart2_bis+urlRadio);
}

/* Fonction qui permet d'ouvrir l'application facebook si elle a été installée. Ensuite elle propose à l'utilisateur
* d'entrer un message. A ce message sera attaché le liens de la page facebook de ER*/
function shareFacebook(){
    var pagefb= "https://www.facebook.com/ESSENTIELradio";
    window.plugins.socialsharing.shareViaFacebook("J'aime ESSENTIEL radio "+ pagefb, null, null, null, function(errormsg){alert(errormsg)});
}

/* Fonction qui permet d'ouvrir l'application twitter si elle a déjà été installée. Ensuite elle propose à
l'utilisateur d'envoyer un message prérempli contenant le nom du programme en cours*/
function shareTwitter(){
    var messagePart1= "J'écoute ";
    var messagePart2= " sur @ESSENTIELradio! Bien plus que de la Radio.";
    window.plugins.socialsharing.shareViaTwitter(messagePart1+document.getElementById('titre_piste').innerHTML
        +messagePart2, null, urlRadio);
}

// Pas encore utilisée
function shareWhatsapp(){
    window.plugins.socialsharing.shareViaWhatsApp(messagePart1+document.getElementById('titre_piste').innerHTML
        +messagePart2_bis + urlRadio, null, null, null, function(errormsg){alert(errormsg)});
}
//*********************************************

// Pas vraiment utilisée
function log() {
    console.log('share ok');
}

// Pas vraiment utilisée mais toujours utile
function error(errormsg){
    alert(errormsg);
}

//*************** ESSENTIEL radio sur les réseaux sociaux *****************
function essentiel_on_twitter(){
    window.open('twitter://user?screen_name=ESSENTIELradio', '_system', 'location=yes');
}

// Pas utilisée
function essentiel_on_googleplus(){
    window.open('https://plus.google.com/103788106989809001972/posts', '_system', 'location=yes');
}

function essentiel_on_pinterest(){
    window.open('https://www.pinterest.com/essentielradio/', '_system', 'location=yes');
}

function essentiel_on_facebbok(){
    window.open('http://www.facebook.com/ESSENTIELradio', '_system', 'location=yes');
}

function essentiel_on_youtube(){
    window.open('http://www.youtube.com/user/ESSENTIELradio', '_system', 'location=yes');
}

function essentiel_on_instagram(){
    window.open('http://instagram.com/essentielradio', '_system', 'location=yes');
}

function essentiel_on_soundcloud(){
    window.open('http://soundcloud.com/essentiel-radio', '_system', 'location=yes');
}

//**************************************


