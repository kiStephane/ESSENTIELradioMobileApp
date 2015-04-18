/**
 * Created by stephaneki on 31/03/15.
 */

var alarm_date=null; //
var currentDateWhenAlarmIsSpecified;

function setAlarmTime(){
    var options = {
        date: new Date(),
        mode: 'time'
    };

    datePicker.show(options, function(date){
        currentDateWhenAlarmIsSpecified=new Date();
        date.setMilliseconds(0);
        date.setSeconds(0);

        alarm_date=date;
        var hourString="";
        var minString="";

        if(date!==undefined && !isNaN(date)){

            var hour=date.getHours();
            hourString=(hour < 10)?"0"+hour.toString():hour.toString();

            var min=date.getMinutes();
            minString = (min < 10)?"0"+min.toString():min.toString();

            document.getElementById("heure").innerHTML = hourString+":" + minString;
        }

    });
}

function initAlarmIdCounterAndAlarmList(){
    var counter = localStorage.getItem("idCounter");
    if (counter===null || counter ===undefined){
        localStorage.setItem("idCounter", "0");
    }

    var alarms = localStorage.getItem("alarms");
    if(alarms===null || alarms===undefined){
        localStorage.setItem("alarms", JSON.stringify([]));
    }
}


function initAlarmListView(){

    var alarms = JSON.parse(localStorage.getItem("alarms"), function(k, v) {
        if(k === 'date'){
            return new Date(v);
        }
        return v;
    } );

    alarms.forEach(function(entry){addToAlarmListView2(entry);}); //TODO



}


function deleteAlarm(id){

    var alarms = JSON.parse(localStorage.getItem("alarms"));
    var index=-1;
    var alarmObject=null;
    for (var i=0; i < alarms.length; i++){
        if(alarms[i].id === id){
            alarmObject=alarms[i];
            index=i;
            break;
        }
    }

    //Delete the local storage
    if (index > -1){
        alarms.splice(index,1);
    }

    localStorage.setItem("alarms", JSON.stringify(alarms));

    //Delete the view
    document.getElementById("alarms_view").removeChild(document.getElementById(id));

    //Delete associated local notifications
    cordova.plugins.notification.local.cancel(alarmObject.notifIds, function() {
        //alert("done");
    });


    window.plugins.toast.show("" + alarmObject.title + " bien supprimée.", 'long', 'center', null, null);
}

function deleteResquest(id){

    navigator.notification.confirm(
        'Voulez vraiment supprimer cette alarme ?', // message
        function(buttonIndex) {
            if(buttonIndex===1){
                deleteAlarm(id);
            }
        },            // callback to invoke with index of button pressed
        "Supprimer l'alarme",           // title
        ['Valider','Annuler']     // buttonLabels

    );
}

function addToAlarmListView2(alarm){
    var alarmList = document.getElementById("alarms_view");

    var repeatDays = "";
    if (alarm.repeat){
        var len = alarm.days.length;
        for (var j=0; j < (len-1); j++){
            repeatDays += alarm.days[j]+", ";
        }
        repeatDays += alarm.days[len-1];
    }

    var newAlarm = document.createElement("div");
    newAlarm.setAttribute("data-role", "collapsible");
    newAlarm.setAttribute("id", alarm.id);
    newAlarm.setAttribute("data-enhanced","true");

    var alarmTitle = document.createElement("h4");
    alarmTitle.innerHTML = alarm.title;

    var timeView = document.createElement("h4");
    timeView.innerHTML = alarm.date.getHours().toString()+":"+alarm.date.getMinutes().toString();

    var daysView=document.createElement("p");
    daysView.innerHTML = repeatDays;

    var deleteButton = document.createElement("a");
    deleteButton.setAttribute("class", "ui-btn ui-icon-delete ui-btn-icon-right ui-corner-all");

    deleteButton.setAttribute("onClick","deleteResquest("+alarm.id.toString()+")");
    deleteButton.innerHTML = "Supprimer";


    newAlarm.appendChild(alarmTitle);
    newAlarm.appendChild(timeView);
    newAlarm.appendChild(daysView);
    newAlarm.appendChild(deleteButton);
    alarmList.appendChild(newAlarm);

}


function Alarm(id, title, date, days, repeat){
    this.id=id;
    this.title = title;
    this.date = date;
    this.repeat = repeat;
    this.days = days ;
    this.notifIds = [];
}

function verifyFields(){
    var result=true;
    // L'heure doit être définie
    if(alarm_date===null || alarm_date===undefined || isNaN(alarm_date)){
        result=false;
        window.plugins.toast.show("Choisissez une heure pour créer l'alarme", 'long', 'center', null, null);
    }
    return result;
}

function addAlarm(){
    var checkResult = verifyFields();
    if (checkResult){
        add();
        document.getElementById("lienVersListAlarm").click();
    }
}



function nextDay(date, weekDay) {
    var ret = new Date(date || new Date());
    ret.setDate(ret.getDate() + (weekDay - 1 - ret.getDay() + 7) % 7 + 1);
    return ret;
}

function getIdFromCounter(){
    var id = parseInt(localStorage.getItem("idCounter"));

    //Increment the counter
    localStorage["idCounter"]=(id+1).toString();
    return id;
}

function createLocalNotification(newAlarm) {

    if (newAlarm.repeat){
        newAlarm.days.forEach(function(value, index, array){
            var notificationDate = null;
            var notificationId=null;

            function setNotificationIdAndDate(weekDayId){
                if(newAlarm.date.getDay() === weekDayId &&
                    newAlarm.date.getTime() > currentDateWhenAlarmIsSpecified.getTime()){
                    notificationDate = newAlarm.date;
                }else{
                    notificationDate = nextDay(newAlarm.date, weekDayId);
                }
                notificationId = getIdFromCounter();
                newAlarm.notifIds.push(notificationId);
                localStorage.setItem(newAlarm.id.toString(), JSON.stringify(newAlarm));
            }

            if(value === "Dim."){
                setNotificationIdAndDate(0);
            }else if(value === "Lun."){
                setNotificationIdAndDate(1);
            }else if(value === "Mar."){
                setNotificationIdAndDate(2);
            }else  if(value === "Mer."){
                setNotificationIdAndDate(3);
            }else  if(value === "Jeu."){
                setNotificationIdAndDate(4);
            }else  if(value === "Ven."){
                setNotificationIdAndDate(5);
            }else if(value === "Sam."){
                setNotificationIdAndDate(6);
            }


            cordova.plugins.notification.local.schedule({
                id: notificationId,
                title: "ESSENTIEL radio",
                text: "Bien + que de la radio !",
                firstAt: notificationDate,
                every: "week"
            });
        });

    }else{

        if (currentDateWhenAlarmIsSpecified > newAlarm.date){
            newAlarm.date.setDate(currentDateWhenAlarmIsSpecified.getDate()+1);
        }
        var id = getIdFromCounter();
        cordova.plugins.notification.local.schedule({
            id: id,
            title: "ESSENTIEL radio",
            text: "Bien + que de la radio !",
            firstAt: newAlarm.date,
            every: "day"
        });

        newAlarm.notifIds.push(id);
        localStorage.setItem(newAlarm.id.toString(), JSON.stringify(newAlarm));
    }
}


function add(){
    var title = document.getElementById("name").value;
    var repeat = document.getElementById("repeter").checked;
    var days=null;
    if (repeat){
        days=[];
        var checkingLun = addIfChecked(days, "Lun.");
        var checkingMar = addIfChecked(days, "Mar.");
        var checkingMer = addIfChecked(days, "Mer.");
        var checkingJeu = addIfChecked(days, "Jeu.");
        var checkingVen = addIfChecked(days, "Ven.");
        var checkingSam = addIfChecked(days, "Sam.");
        var checkingDim = addIfChecked(days, "Dim.");

        if (!(checkingLun || checkingMar || checkingMer || checkingJeu || checkingVen || checkingSam || checkingDim)){
            repeat=false;
        }
    }

    var id = getIdFromCounter();

    var newAlarm = new Alarm(id, title, alarm_date, days, repeat);

    createLocalNotification(newAlarm);

    saveAlarm(newAlarm);

    title = " ";
    alarm_date = null;
    document.getElementById("heure").innerHTML = "Définir l'heure";

    addToAlarmListView2(newAlarm);

}

function saveAlarm(alarm){

    var alarms = JSON.parse(localStorage.getItem("alarms"), function(k,v){
        if( k ==="date"){
            return new Date(v);
        }
        return v;
    });

    alarms.push(alarm);
    localStorage.setItem("alarms", JSON.stringify(alarms));

    window.plugins.toast.show('Votre alarme a bien été créée', 'long', 'center', null, null);
}

function addIfChecked(days, id){
    if(document.getElementById(id).checked){
        days.push(id);
        return true;
    }else{
        return false;
    }
}
