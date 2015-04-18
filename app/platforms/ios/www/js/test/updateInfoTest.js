
function stringToXml(text){
	if (window.ActiveXObject){
        var doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.async='false';
        doc.loadXML(text);
    } else {
        var parser=new DOMParser();
        var doc=parser.parseFromString(text,'text/xml');
    }
    return doc;	
}

var nodeWithoutAlbum= '<song id="NextSong1"><image>http://www.essentielradio.com/flux/images/img/ashes-remain-here-for-a-reason_60x60.jpg</image><artiste>Ashes Remain</artiste><album/><title>Here For A Reason</title><length>02:51</length><startTime>2014-09-10 19:57:08</startTime></song>';
var nodeWithAlbum= '<song id="NextSong1"><image>http://www.essentielradio.com/flux/images/img/ashes-remain-here-for-a-reason_60x60.jpg</image><artiste>Ashes Remain</artiste><album>Antirides</album><title>Here For A Reason</title><length>02:51</length><startTime>2014-09-10 19:57:08</startTime></song>';

QUnit.test( "stringToXml Tests", function( assert ) {
	var text="<note>";
		text=text+"<content>whatever</content>";
		text=text+"</note>";
	var xmlDom = stringToXml(text);

  	assert.equal(xmlDom.documentElement.nodeName, 'note', 'Document root is <note>');
  	assert.equal(xmlDom.getElementsByTagName("content").length, 1, 'Document contains only one content');
  	assert.equal(xmlDom.getElementsByTagName("content")[0].textContent, 'whatever');

});

QUnit.test( "Getter Tests", function( assert ) {
	var xmlDom = stringToXml(nodeWithoutAlbum);

  	assert.equal(xmlDom.documentElement.nodeName, 'song', 'Document root is <song>');
  	assert.equal(getImage(xmlDom), 'http://www.essentielradio.com/flux/images/img/ashes-remain-here-for-a-reason_60x60.jpg', 'getImage');
  	assert.equal(getTitle(xmlDom), 'Here For A Reason', 'getTitle');
  	assert.equal(getArtiste(xmlDom), 'Ashes Remain', 'getArtiste');

  	var length = getLength(xmlDom);
  	assert.equal(length.size, 2, 'getLength return an Map with 2 elements');
    assert.equal(length.get("minutes"), 2, 'Number of minutes correctly fetch');
    assert.equal(length.get("seconds"), 51, 'Number of seconds correctly fetch');

});

QUnit.test( "GetAlbum Tests", function( assert ) {
    assert.equal(getAlbum(stringToXml(nodeWithoutAlbum)) ,'','No album');
    assert.equal(getAlbum(stringToXml(nodeWithAlbum)), 'Antirides', 'Node with Album element');
});

QUnit.test( "GetStartTime Tests", function( assert ) {
    var xmlDom = stringToXml(nodeWithoutAlbum);

    assert.equal(getStartTime(xmlDom),'2014-09-10 19:57:08', 'Start time is correctly extract as a string');

    assert.equal(getStartTimeArray(xmlDom).length ,2, 'The StartTime is split into 2 parts');
    assert.equal(getStartTimeArray(xmlDom)[0],'2014-09-10' );
    assert.equal(getStartTimeArray(xmlDom)[1],'19:57:08' );

});

QUnit.test( "ConvertInMilliSeconds Tests", function( assert ) {
    var length=[0,2,30];
    assert.equal(convertInMillisecond(length), 2*60*1000 + 30*1000);
});

QUnit.test( "CalculateTimeDiff Tests", function( assert ) {
    var fisrt = moment('2014-09-10 19:54:00');
    var second = moment('2014-09-10 19:59:00');
    assert.equal(calculateTimeDiff(fisrt,second), 5*60*1000);
});

QUnit.test( "Convert Tests", function( assert ) {
    var fisrt = moment('2014-09-10 20:54:00');
    var second = moment.tz('2014-09-10 19:59:00', "Europe/Paris");

    var expectedFirst = moment.tz("2014-09-10 19:54:00", "Europe/Paris");
    var expectedSecond = moment.tz("2014-09-10 19:59:00", "Europe/Paris");

    //console.log(expectedFirst.format());
    //console.log(expectedSecond.format());
    console.log(typeof expectedSecond);

    assert.equal(fisrt.tz('Europe/Paris').get('hours'), expectedFirst.get('hours'));
    assert.equal(second.get('hours'), expectedSecond.get('hours'));
});



