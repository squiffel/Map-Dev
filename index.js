// Gives access to the functions provided in main.js
const main_remote = require('electron').remote;
const main = main_remote.require('./main.js');

var dialog = main_remote.dialog; // Access Dialog Box
var fs = main_remote.require('fs'); // Access File System
var Papa = require('papaparse'); // Add PapaParse for CSV files

//String Replace all
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

//Window responsive
onWindowResize(); //OnLoad
var win = main_remote.getCurrentWindow();
win.on('resize', function (e) { setTimeout(function(){ onWindowResize(); }, 350); });

function onWindowResize() {
	var window_w = window.innerWidth;
	var window_h = window.innerHeight;
	document.getElementById("container-main").style.width = (window_w) + "px";
	document.getElementById("container-main").style.height = (window_h) + "px";

	// Update Map
	mapOnWindowResize();
}

//=====================================================================//
//=====================================================================//
//=====================================================================//
//=========================   MAIN PROGRAM START   =========================//
//=====================================================================//
//=====================================================================//
//=====================================================================//

var loadCSV = "./named_csv.csv"

// Load editor HTML
var editorHTML;
var loadHTML = "editor.html";
var editorLocked = true; // Are the properties editable

// Create Google Map - Global Variables
var map; var marker; var markerPos; var all_markers;
var mapVisible = false;

// Create default boxes
createScrollClass("main-menu", "100%", "10%", "hidden");
createScrollClass("main-left", "20%", "90%", "auto");
createScrollClass("main-right", "80%", "90%", "visible");
createPaddingClass("main-right", "12");
setTimeout(function(){ onWindowResize(); }, 350); 

// Set temporary column paths
var addressPath = addPropertyType("list", 1, "Address");
var primaryPhotoPath =  addPropertyType("image", 1, 1);


 // Fill left side with Address Data
var loadedPropertiesObject;
readFileThenParse(loadCSV, function (data) {
	InnerHTMLById("main-left", createTableFromArray(data, createPropertyList));
	setTagNameClass("TABLE", "table table-striped");
	addOnClick(); // Jumps to HandleOnClick
	loadedPropertiesObject = data;
	});


function createPropertyList(obj, i) {
	let img = obj[i][primaryPhotoPath];
	if (img == "") { img = "properties/example/primary.jpg"; } //Add default blank image
	
	let contentAddress = "<a href='#' " + createLinkID("linkID", i) + ">" + obj[i][addressPath] + "</a>";
	let contentImage = "<img src='" + img + "' alt='Primary Photo' height='100%' width='auto'>";
	let newDiv = createDiv("property-list-shared property-list-left", contentImage) + createDiv("property-list-shared property-list-right", contentAddress);
	return newDiv;
}

// -- Event Handler onClick
function handleOnClick(linkType) {
	
	let n = linkType[1];
	let obj = loadedPropertiesObject[n];
	
	// Load Editor HTML Template
	if (editorHTML != undefined) //If editor html has been loaded
		{
		InnerHTMLById("main-right", editorHTML);
				
		//Initialize Map
		initMap('editor-map', 17); // Set Zoom
	
		//Set Map Position
		let lat = parseFloat(obj["location::1::latitude"]);
		let lng = parseFloat(obj["location::1::longitude"]);
		newLocation(lat, lng);
		
		//Add Menu Buttons
		saveCSV(n);
		
		}else{
		//If not loaded - load HTML and reload script
		readFile(loadHTML, function (data) { editorHTML = data; handleOnClick(linkType); } );
		}
	
	//Change right container content
	//Create empty content
	let listContent = "";
	let notesContent = "";
	let iconsContent = "";
	
	//Create div
	let divContainer = "<div class='text-padding'>";
	let divEnd =  "</div>";
	
	//Loop through all properties
	for (var prop in obj)
		{
		let atr = readPropertyType(prop);
		let type = atr["type"]; let name = atr["name"];
		
		if (type== "list") {
				listContent += "<tr><td style='width: 50%'>" + name + "</td><td style='text-align: right; width: 50%'>" + addValue(editorLocked, obj[prop], "list::" + name) + "</td></tr>";
			}
		if (type == "notes") { 
				notesContent += "<span>" + name + "</br>" + obj[prop] + "</span></br>";
			}
		if (type == "icon") { 
				let img = (obj[prop] != "") ? "<img class='img-icon' src='icons/icon-check.png'>":"<img class='img-icon' src='icons/icon-blank.png'>";
				iconsContent += "<td style='text-align: center;'><div>" + name + "</div><div>" + img + "</div></td>";
			}
		}
	//Update inner HTML
	InnerHTMLById("editor-list", divContainer + "<table style='width: 100%'>" + listContent + "</table>" + divEnd);
	InnerHTMLById("editor-notes", divContainer + notesContent + divEnd);
	InnerHTMLById("editor-icons", divContainer + "<table style='width: 100%;'><tr>" + iconsContent + "</tr></table>" + divEnd);
}


//=====================================================================//
//=====================================================================//
//=====================================================================//
//=========================   CREATE DOM   =========================//
//=====================================================================//
//=====================================================================//
//=====================================================================//

	

// Give element <tag> a universal class definition
function setTagNameClass(tagName, setStyle) {
	let tagElement = document.getElementsByTagName(tagName);
	for (let i = 0; i < tagElement.length; i++) {
	tagElement[i].className = setStyle;
	}
}

//	-- Add click eventlistener to all links
function addOnClick()
	{
	links = document.getElementsByTagName("a");
	for (var i=0; i<links.length; i++) 
		{
		links[i].onclick = function (){ onLinkClick(this.id, handleOnClick); }
		}
	}

// -- Launch onClick Event
function onLinkClick(myID, callback) {
	let splitID = myID.split("::");
	return callback(splitID);
}

//	-- Update inner HTML
function InnerHTMLById(id, newString) {
	var x = document.getElementById(id);
	x.innerHTML = newString;
}

function createLinkID(name, n) {
	return "id='" + name + "::" + n + "'";
}

//	-- Create table
function createTableFromArray(myObject, callback) {
	let newTable = "<table>";
	let innerTable = "";
	for (i = 0; i < myObject.length; i++)
		{
		innerTable += "<tr><td>" + callback(myObject, i) + "</td></tr>";
		}
	let endTable = "</table>";	
	return newTable + innerTable + endTable;
}

function createScrollClass(id, setWidth, setHeight, setScroll) {
	var element = document.getElementById(id);
	element.style.width = setWidth;
	element.style.height = setHeight;
	element.style.overflow = setScroll; //Scroll is "auto"
}

function createPaddingClass(id, setPadding) {
	var element = document.getElementById(id);
	element.style.padding = setPadding + "px";
}

function createDiv(classType, content) {
	return "<div class='" + classType + "'>" + content + "</div>";
}

function addValue(editor, value, reference) {
	if (editor == true) {
		return "<input style='width: 100%' type='text' value='" +value + "' name='" + reference  + "'>";
	}
	if (editor == false) {
		return value;
	}
}

// Find all input boxes
function eventByName(elementID, type, callback) {
	var inputList = document.getElementsByName(elementID);
	var i;
	for (i = 0; i < inputList.length; i++) {
		if (inputList[i].type == type) {
		callback(inputList[i])
		}
	}
}

/*
function editorUpdateInfo(obj, type, callback) {
	var updateContent;
	
	for (var prop in obj)
		{
		let headerName = prop.split("::");
		let propertyType = headerName[2];

		//Add list
		if (headerName[0] == type) {
			updateContent += callback(propertyType, obj[prop])
			}
		InnerHTMLById("editor-list", divContainer + "<table style='width: 100%'>" + listContent + "</table>" + divEnd);
		}
	}
*/


//=====================================================================//
//=====================================================================//
//=====================================================================//
//=========================   HANDLE FILES    =========================//
//=====================================================================//
//=====================================================================//
//=====================================================================//

// Sync Read Directory / File
function readDir(dirPath, callback){
	let data = fs.readdirSync(dirPath);
	return callback(data);
}

function readFile(filePath, callback) {
	let data = fs.readFileSync(filePath, 'utf-8');
	return callback(data);
}

// Async Read Directory / File
function readDirAsync(dirPath){
	fs.readdir(dirPath, function (err, data) {
		if (err)
			{
			alert("An error occured reading the directory" + err.message);
			return;
			}
		console.log(data);
	});
}

function readFileAsync(filePath){
    fs.readFile(filePath, 'utf-8', function (err, data) {
          if(err){
              alert("An error ocurred reading the file :" + err.message);
              return;
          }
          console.log("The file content is : " + data);
    });
}

function readFileThenParse(filepath, callback){
    fs.readFile(filepath, 'utf-8', function (err, filedata) {
          if(err){
              alert("An error ocurred reading the file :" + err.message);
              return;
          }
            Papa.parse(filedata, {
            header: true,
            complete: function(results) { callback(results.data); }
            });
    });
}

//Select File
function selectFile(callback) {
	dialog.showOpenDialog(function (fileNames) {
			// fileNames is an array that contains all the selected
		   if(fileNames === undefined){
				alert("No file selected");
		   }else{
				callback(fileNames[0]);
		   }
	});
}

//Select Multiple Files
function selectMultipleFiles(callback) {
	//selectMultipleFiles(function (e) { console.log(e) });
	callback(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}));
	}

//=====================================================================//
//=====================================================================//
//=====================================================================//
//=========================    GOOGLE MAPS    =========================//
//=====================================================================//
//=====================================================================//
//=====================================================================//

function initMap(elementID, zoomLevel) {
	//Create Location
	var pos = {lat: 0, lng: 0};
	
	//Create default map
	map = new google.maps.Map(document.getElementById(elementID), {
		zoom: zoomLevel,
		center: pos,
		disableDefaultUI: true // Hide UI
	});
	
	//Create Blank Building Marker
	marker = new google.maps.Marker({
	  position: pos,
	  map: map
	});
  }
  
function newLocation(newLat,newLng)
	{
	markerPos = {lat : newLat, lng : newLng};
	
	//Set Position Map / Marker
	map.setCenter( markerPos );
	marker.setPosition( markerPos );
	}
	
function mapOnWindowResize() {
	//Check if map is visible
	mapVisible = (document.getElementById('editor-map') != undefined) ? true:false;
	
	//CenterMap
	if ( mapVisible == true ) { 
		newLocation(markerPos["lat"], markerPos["lng"]);
		};
}

//=====================================================================//
//=====================================================================//
//=====================================================================//
//=========================   SAVE CSV   =========================//
//=====================================================================//
//=====================================================================//
//=====================================================================//

function saveCSV(n) {
	var x = document.getElementById("buttonSave");
	x.onclick = function (){
			let obj = loadedPropertiesObject[n];
			
			for (var prop in obj)
				{				
				let atr = readPropertyType(prop);
				let name = atr["name"];
				eventByName("list::" + name, "text", function (e) { console.log(e.value) }) ;
				}
		}
}


//=====================================================================//
//=====================================================================//
//=====================================================================//
//=========================   CREATE DATA STRUCTURE   =========================//
//=====================================================================//
//=====================================================================//
//=====================================================================//


//Add new entry
function addPropertyType(type, n, name) {
	return type + "::" + n + "::" + name;
}

//Read entry
function readPropertyType(prop) {
	let parseSections = prop.split("::");
	return {
		type: parseSections[0],
		n: parseSections[1],
		name: parseSections[2]
	}
}