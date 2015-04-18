/* Description du fichier ici





*/

// --- Constantes
const BASE_URL="http://www.essentielradio.com/app/playlist_short.php?radioOnAir=";
const STREAMS={"er":"http://str81.streamakaci.com:80/",
               "fr":"http://essentielradioing.streamakaci.com/essentielfr.mp3"};

const RADIO_ID={"er":"er", "fr":"fr"};
const URL_RADIO="http://www.essentielradio.com";

const PAUSE_BUTTON_IMG_SRC = "img/pause-256.png";
const PLAY_BUTTON_IMG_SRC = "img/play-256.png";

const MESSAGE_TO_SHARE = {"part1":"J'écoute ", "part2":" de ", "part3":" sur l'appli mobile d'", "part4":"... et J'AIME. "};
const TWITTER_NAME = "@ESSENTIELradio";
const DEFAULT_NAME = "ESSENTIEL radio";
const FACEBOOK_PAGE = "https://www.facebook.com/ESSENTIELradio";


// --- Variables globales
var my_media = null; // Contient l'objet qui permet la lecture du flux audio
var radioOnAir= RADIO_ID.er; // Indique la radio dont le flux est en cours de lecture.
var currentUrl = BASE_URL+radioOnAir;
var currentStream = STREAMS.er; // Variable contenant l'url du flux audio
// qui doit être lu par l'objet my_media. Il est initialisé avec l'url de er

var playing = false; // Variable qui indique si la lecture est en mode play ou pause




/*Initialisation*/
function init(){
    document.addEventListener("deviceready",onDeviceReady ,false);
}

/* Fonction executer lorsque le téléphone lance l'application
* Elle se charge d'initier la lecture des deux flux : audio et info sur
* les programme en cours*/
function onDeviceReady(){
    setSongsInfo();
    initAlarmIdCounterAndAlarmList();
    initAlarmListView();
    initFavoritesList();
    initFavoritesListView();
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
            my_media = new Media(currentStream, onSuccess, onError, mediaStatus);
        }       
        my_media.play();
        document.getElementById('im_play').setAttribute("src",PAUSE_BUTTON_IMG_SRC );
        changeIconToPauseOrPlayOnPodcastsPages(false);

        playing=true;        
    }else{
        my_media.stop();
        my_media.release();
        document.getElementById('im_play').setAttribute("src",PLAY_BUTTON_IMG_SRC );
        changeIconToPauseOrPlayOnPodcastsPages(true);
        playing=false;
    }
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
        if(radio==RADIO_ID.fr){
                currentStream=STREAMS.fr;
                currentUrl=BASE_URL+radio;
                document.getElementById('current-radio').setAttribute("src","img/fr_logo.png" );
            }else if(radio==RADIO_ID.er){
                currentStream=STREAMS.er;
                currentUrl=BASE_URL+radio;
                document.getElementById('current-radio').setAttribute("src","img/logo.png" );

            }
            radioOnAir=radio;
            my_media.release();
            my_media=null;
            playing=false;
            setSongsInfo();
    }

}


//-------- SOCIAL SHARING ------------

// J'écoute "xxx" de yyyy sur l'appli mobile d'ESSENTIEL radio ... et J'AIME !


// Cette fonction ouvre le menu de choix de l'application que l'on désire utiliser pour partager le message.
// (Exemple: Google+ , Viber, etc)
// Le message est prérempli. Il suffit juste de confirmer l'envoi par la suite
function shareOtherApp(){
    window.plugins.socialsharing.share(MESSAGE_TO_SHARE.part1 + "\"" + currentTitle + "\"" + MESSAGE_TO_SHARE.part2
    + currentArtist + MESSAGE_TO_SHARE.part3 + DEFAULT_NAME+MESSAGE_TO_SHARE.part4 + URL_RADIO);
}


// Fonction qui permet d'ouvrir l'application facebook si elle a été installée. Ensuite elle propose à l'utilisateur
// d'entrer un message. A ce message sera attaché le liens de la page facebook de ER.
function shareFacebook(){
    window.plugins.socialsharing.shareViaFacebook("J'aime ESSENTIEL radio "+ FACEBOOK_PAGE, null, null, null,
        function(errormsg){alert(errormsg)});
}


// Fonction qui permet d'ouvrir l'application twitter si elle a déjà été installée. Ensuite elle propose à
// l'utilisateur d'envoyer un message prérempli contenant le nom du programme en cours
function shareTwitter(){
    window.plugins.socialsharing.shareViaTwitter(MESSAGE_TO_SHARE.part1 + "\"" + currentTitle + "\"" + MESSAGE_TO_SHARE.part2
    + currentArtist + MESSAGE_TO_SHARE.part3 + TWITTER_NAME + MESSAGE_TO_SHARE.part4, null, URL_RADIO);
}

// Pas encore utilisée
function shareWhatsapp(){
    window.plugins.socialsharing.shareViaWhatsApp(MESSAGE_TO_SHARE.part1 + "\"" + currentTitle + "\"" + MESSAGE_TO_SHARE.part2
    + currentArtist + MESSAGE_TO_SHARE.part3 + DEFAULT_NAME+MESSAGE_TO_SHARE.part4 + URL_RADIO,
        null, null, null, function(errormsg){alert(errormsg)});
}
//---------------------------------------------

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


