// ----------------------- CONFIG ------------------------- //

// Database Spreadsheet ID
const rosterDB = "1jt_zjy3MrKcC7R3KoxRq8z37zI70B9nCIxBUjvH_-Uk";
// Roster Sheet Name
const rosterSh = "Data";

// Training Database Spreadsheet ID
const trainingDB = "1hdrGQhYxySAdsiFk6g75nlIYnar-y5_0McCS3BNOMaE";
// Training Sheet Name
const trainingSh = "Training";
// Variables Sheet Name
const variablesSh = "Variables";

// Developer Spreadsheet ID
const developerDB = "1FT3wDZXQpn-i84JyvjlMHsNfWWvJy9xjA4fN1HaIhMk";
// Developer Members Sheet Name
const memberSh = "Members";
// Developer Credential Sheet Name
const credentialSh = "Membership";
// Developer Log Sheet
const logsSh = "Logs";

// -------------------------------------------------------- //
var url = ScriptApp.getService().getUrl();
var rosterDBv = SpreadsheetApp.openById(rosterDB);
var trainingDBv = SpreadsheetApp.openById(trainingDB);
var developerDBv = SpreadsheetApp.openById(developerDB);
var Route = {}
    Route.path = function(route, callback){Route[route] = callback;};
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function doGet(e) {
  
  Route.path("auth", loadAuth);
  Route.path("home", loadHome);
  Route.path("trainingdb", loadTrainingDB);
  Route.path("roster", loadRoster);
  Route.path("settings", loadSettings);
  Route.path("membermanagement", loadMemberManagement);
  
  if (Route[e.parameters.page]) {
    return Route[e.parameters.page]();
  } else {
    return load404();
  }
}

function load404(){
  var website = HtmlService.createTemplateFromFile("404.index");
  return website.evaluate()
                .setTitle('404 Page Not Found');
}

function loadAuth(){
  var website = HtmlService.createTemplateFromFile("auth.index");
  return website.evaluate()
                .setTitle('Authentication Panel');
}

function loadHome(){
  var website = HtmlService.createTemplateFromFile("hm.index");
  return website.evaluate()
                .setTitle('Control Panel');
}

function loadTrainingDB(){
  var website = HtmlService.createTemplateFromFile("tb.index");
  return website.evaluate()
                .setTitle('Training Database');
}

function loadRoster(){
  var website = HtmlService.createTemplateFromFile("roster.index");
  return website.evaluate()
                .setTitle('TA Roster');
}

function loadMemberManagement(){
  var website = HtmlService.createTemplateFromFile("member.index");
  return website.evaluate()
                .setTitle('Member Management');
}

function loadSettings(){
  var website = HtmlService.createTemplateFromFile("settings.index");
  var db = trainingDBv.getSheetByName(variablesSh);
  var rsrange = db.getRange(2, 15, 4, 2).getValues();
  // @ts-ignore
  website.rsRanks = rsrange.map(function(i){ return '<option value="'+i[0]+'">'+i[1]+'</option>'; });
  var tarange = db.getRange(2, 13, 7, 2).getValues();
  // @ts-ignore
  website.taRanks = tarange.map(function(i){ return '<option value="'+i[0]+'">'+i[1]+'</option>'; });
  return website.evaluate()
                .setTitle('Settings');
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function verifyCredentials(userCredentials) {
  
  var credentialSheet = developerDBv.getSheetByName(credentialSh);
  
  function getInformation(userCredentials) {
    var cache = CacheService.getUserCache();
    var data = credentialSheet.getRange("A:A").getValues();
    for(var i = 0; i < data.length; i++) {
      if (data[i] == userCredentials) {
        var badge = credentialSheet.getRange("B:B" + (i + 1)).getValue();
        var name = credentialSheet.getRange("C:C" + (i + 1)).getValue();
        var rank = credentialSheet.getRange("D:D" + (i + 1)).getValue();
        var wl = credentialSheet.getRange("F:F" + (i + 1)).getValue();
        var wlTA = credentialSheet.getRange("G:G" + (i + 1)).getValue();
        var resultst = [userCredentials, badge, name, wl, wlTA];
        cache.put("userCredentials", userCredentials, 3600);
        // @ts-ignore
        cache.put("badge", badge, 3600);
        // @ts-ignore
        cache.put("name", name, 3600);
        // @ts-ignore
        cache.put("rank", rank, 3600);
        // @ts-ignore
        cache.put("wl", wl, 3600);
        // @ts-ignore
        cache.put("wlTA", wlTA, 3600);
        return resultst;
      }
    }
    var resultsf = ["Unknown", userCredentials];
    return resultsf;
  }
  
  var information = getInformation(userCredentials);
    console.log(information)
    
  if(information[0] != "Unknown"){
    // @ts-ignore
    credentials = information[0];
    // @ts-ignore
    badge = information[1];
    name = information[2];
    wl = information[3];
    wlTA = information[4];
    
    return ["Access Granted", url];
  } else {
    throw 'Invalid Access Code.'
    return ["Access Denied", url];
  }
}

function checkRSWL(page) {
  var cache = CacheService.getUserCache();
  var credentials = cache.get("wl");
  var TAcredentials = cache.get("wlTA");
  if (page == "settings"){
    if (credentials >= PropertiesService.getScriptProperties().getProperty("WL_SETTINGS")){
      return [1, url]
    } else {
      return [0, url]
    }
  } else if (page == "tamember"){
    if (TAcredentials >= PropertiesService.getScriptProperties().getProperty("WL_TAMEMBERMANAGMENT")){
      return [1, url]
    } else {
      return [0, url]
    }
  }
}

function verifyCache() {
  
  var cache = CacheService.getUserCache();
  var credentials = cache.get("userCredentials");
  //cache.remove("userCredentials");
  if (credentials != null){
    return [1, url]
  } else {
    return [0, url]
  }
}

function moduleCheck(){
  // @ts-ignore
  CacheService.getUserCache().put("moduleCheck", 0, 3600);
  // @ts-ignore
  while (CacheService.getUserCache().get("moduleCheck") <= 2) {
    // @ts-ignore
    if (CacheService.getUserCache().get("moduleCheck") == 2) {
      CacheService.getUserCache().remove("moduleCheck");
    }
  }
}

function getWLevel() {
  return [PropertiesService.getScriptProperties().getProperty("WL_SETTINGS"), PropertiesService.getScriptProperties().getProperty("WL_SETTINGS")]
}

function badges() {
  var sheet = rosterDBv.getSheetByName(rosterSh);
  var database = sheet.getRange(3,1,sheet.getRange("A3").getDataRegion().getLastRow(), 5).getValues();
  
  var options = {};
    database.forEach(function(i){
    options[i[0]] = null;
  });
  
  CacheService.getUserCache().put("moduleCheck", CacheService.getUserCache().get("moduleCheck")+1, 3600);
  return options 
  
  //console.log(options)
}

function trainings() {

  var sheet = rosterDBv.getSheetByName(variablesSh);
  var database = sheet.getRange(2,20,sheet.getRange("P2").getDataRegion().getLastRow(), 2).getValues();
  
  var options = {};
    database.forEach(function(i){
    options[i[0]] = null;
  });
  
  CacheService.getUserCache().put("moduleCheck", CacheService.getUserCache().get("moduleCheck")+1, 3600);
  return options 
}

function getName(badge){

  var sheet = rosterDBv.getSheetByName(rosterSh);
  var database = sheet.getRange(1,1,sheet.getRange("A2").getDataRegion().getLastRow(), 5).getValues();
console.log(database)
  var badges = database.map(function(i){ return i[0]; });
  var names = database.map(function(i){ return i[1]; });
  
  var pos = badges.indexOf(parseInt(badge, 10));
  
  if (pos > -1){
    return [names[pos], badge]
  } else {
    return ['Not Available', badge]
  }
}

function getDivision(badge, type){
  if (type == false){
    var sheet = rosterDBv.getSheetByName(rosterSh);
    var database = sheet.getRange(3,1,sheet.getRange("A3").getDataRegion().getLastRow(), 5).getValues();
      
    var badges = database.map(function(i){ return i[0]; });
    var divisions = database.map(function(i){ return i[4]; });
    var pos = badges.indexOf(parseInt(badge, 10));
    
    if (pos > -1){
      return [divisions[pos], badge]
    } else {
      return ['Not Available', badge]
    }
  }
 return type
}

function getRank(badge, type){

  var sheet = rosterDBv.getSheetByName(rosterSh);
  if (type == false){
    var database = sheet.getRange(3,1,sheet.getRange("A3").getDataRegion().getLastRow(), 5).getValues();
    
    var badges = database.map(function(i){ return i[0]; });
    var ranks = database.map(function(i){ return i[2]; });
  } else {
    var database = sheet.getRange(3,1,sheet.getRange("A3").getDataRegion().getLastRow(), 1).getValues();
    var rankDB = sheet.getRange(3,31,sheet.getRange("A3").getDataRegion().getLastRow(), 1).getValues();
    
    var badges = database.map(function(i){ return i[0]; });
    var ranks = rankDB.map(function(i){ return i[0]; });
  }
  var pos = badges.indexOf(parseInt(badge, 10));
  console.log(pos)
  console.log([ranks[pos], type])
  if (pos > -1){
    return [ranks[pos], badge, type]
  } else {
    return ['Not Available', badge]
  }
}

function setData(badge, name, division, rank, training, status, esignature, type){

  if(CacheService.getUserCache().get("isOnQueue") != "true" && CacheService.getScriptCache().get("onQueue")) {
    CacheService.getScriptCache().put("onQueue", CacheService.getScriptCache().get("onQueue")+CacheService.getUserCache().get("badge")+',');
    console.log(CacheService.getScriptCache().get("onQueue"))
    CacheService.getUserCache().put("isOnQueue", "true")
    return [false]
  } else if(CacheService.getUserCache().get("isOnQueue") != "true" && !CacheService.getScriptCache().get("onQueue")) {
    CacheService.getScriptCache().put("onQueue", CacheService.getUserCache().get("badge")+',');
    console.log(CacheService.getScriptCache().get("onQueue"))
    CacheService.getUserCache().put("isOnQueue", "true")
    return [false]
  } else {
    if (CacheService.getScriptCache().get("onQueue").includes(CacheService.getUserCache().get("badge")+',') != true) {
      CacheService.getUserCache().remove("isOnQueue")
      return [false]
    }
  }

  // @ts-ignore
  if (CacheService.getScriptCache().get("onQueue").split(",", 1) == CacheService.getUserCache().get("badge")){
    var cache = CacheService.getUserCache();
    var queue = CacheService.getScriptCache().get("onQueue");
    var sheet = trainingDBv.getSheetByName(trainingSh);
      
    var range = sheet.getRange("B3:Q3");
    var values = range.getValues();
    
    var base64 = esignature.replace("data:image/png;base64,","");
    if (base64) {
      var decoded = Utilities.base64Decode(base64);
      var blob = Utilities.newBlob(decoded, 'image/png', 'signature');
    }
    
    var vsheet = rosterDBv.getSheetByName(variablesSh);
    var database = vsheet.getRange(2,20,vsheet.getRange("P2").getDataRegion().getLastRow(), 2).getValues();
  
    var longTrainings = database.map(function(i){ return i[0]; });
    var shortTrainings = database.map(function(i){ return i[1]; });
    
    var pos = longTrainings.indexOf(training);
    
    var shortTraining = shortTrainings[pos];
    // @ts-ignore
    var index = sheet.getRange("L3").getValue() + 1;
    
    values[0][0] = badge;
    values[0][1] = name;
    values[0][2] = rank;
    values[0][3] = division;
    values[0][4] = training;
    values[0][5] = Utilities.formatDate(new Date(), 'GMT-5', 'MM/dd/yyyy');
    values[0][6] = cache.get("name");
    values[0][7] = cache.get("rank");
    values[0][8] = cache.get("badge");
    values[0][9] = status;
    values[0][10] = index;
    values[0][15] = Utilities.formatDate(new Date(), 'GMT-5', 'MM/dd/yyyy');
    
    if (type == false) {
      values[0][11] = false;
      values[0][12] = badge+' | '+shortTraining;
      values[0][13] = '';
    } else {
      values[0][11] = true;
      values[0][12] = '';
      values[0][13] = badge+' | '+shortTraining;
    }
    
    sheet.insertRowBefore(3);
    range.setValues(values);
  
    var devSheet = developerDBv.getSheetByName(logsSh);
    var devRange = devSheet.getRange("A1:D1");
    var devValues = devRange.getValues();
        
    devValues[0][0] = index;
    devValues[0][1] = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
    devValues[0][2] = 'Created';
    devValues[0][3] = '['+cache.get("badge")+'] '+cache.get("name");
        
    devSheet.insertRowBefore(1);
    devRange.setValues(devValues);
      
   /* sheet.setRowHeight(3, 75).setColumnWidth(16, 180);
    sheet.insertImage(blob, 16,3)
         .setHeight(70)
         .setWidth(175);*/
    
    CacheService.getUserCache().remove("isOnQueue")
    // @ts-ignore
    CacheService.getScriptCache().put("onQueue", CacheService.getScriptCache().get("onQueue").replace(CacheService.getUserCache().get("badge")+',',''));
    return [true]
  } else {
    return [false]
  }
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function getTrainingData(){
  var sheet = trainingDBv.getSheetByName(trainingSh);
  var range = sheet.getRange(3,2,sheet.getRange("B2").getDataRegion().getLastRow()-2,sheet.getRange("B2").getDataRegion().getLastColumn()-3).getValues();
  console.log(range)
  return [range, CacheService.getUserCache().get("badge"), CacheService.getUserCache().get("wlTA")]
}

function loadData(index){
  var sheet = trainingDBv.getSheetByName(trainingSh);
  var range = sheet.getRange(3,2,sheet.getRange("B2").getDataRegion().getLastRow()-2,sheet.getRange("B2").getDataRegion().getLastColumn()).getValues();

  var badges = range.map(function(i){ return i[0]; });
  var names = range.map(function(i){ return i[1]; });
  var ranks = range.map(function(i){ return i[2]; });
  var divisions = range.map(function(i){ return i[3]; });
  var trainings = range.map(function(i){ return i[4]; });
  var dates = range.map(function(i){ return i[5]; });
  var indexes = range.map(function(i){ return i[10]; });
  var instructors = range.map(function(i){ return i[6]; });
  var instructorRanks = range.map(function(i){ return i[7]; });
  var type = range.map(function(i){ return i[11]; });
  
  var pos = indexes.indexOf(parseInt(index, 10));
  
  if (pos > -1){
    return [badges[pos], names[pos], ranks[pos], divisions[pos], trainings[pos], dates[pos], instructors[pos], instructorRanks[pos], index, type[pos]]
  } else {
    return "Training doesn't exist?"
  }
}

function loadLogsData(index){
  var sheet = developerDBv.getSheetByName(logsSh);
  var range = sheet.getRange(1,1,sheet.getRange("A1").getDataRegion().getLastRow(),sheet.getRange("A1").getDataRegion().getLastColumn()).getValues();
  
  var filteredRange = range.filter(function(item){
    if(item[0] == index){
      return true;
    } else {
      return false;
    }
  });
  
  if (filteredRange.length > 0){
    console.log([filteredRange])
    return [filteredRange]
  } else {
    return 0
  }
}

function updateData(badge, name, rank, division, training, index, type){
  var cache = CacheService.getUserCache();
  var sheet = trainingDBv.getSheetByName(trainingSh);
    
  var range = sheet.getRange(3,2,sheet.getRange("B2").getDataRegion().getLastRow()-2,sheet.getRange("B2").getDataRegion().getLastColumn());
  var values = range.getValues();
  
  var vsheet = trainingDBv.getSheetByName(variablesSh);
  var database = vsheet.getRange(2,16,vsheet.getRange("P2").getDataRegion().getLastRow(), 2).getValues();

  var longTrainings = database.map(function(i){ return i[0]; });
  var shortTrainings = database.map(function(i){ return i[1]; });
  
  var loc = longTrainings.indexOf(training);
  
  var shortTraining = shortTrainings[loc];
  
  var indexes = values.map(function(i){ return i[10]; });
  var pos = indexes.indexOf(parseInt(index, 10));
  
  console.log(pos);
  values[pos][0] = badge;
  values[pos][1] = name;
  values[pos][2] = rank;
  values[pos][3] = division;
  values[pos][4] = training;
  
  if (type == false) {
    values[0][12] = badge+' | '+shortTraining;
  } else {
    values[0][13] = badge+' | '+shortTraining;
  }
  
  range.setValues(values);
  
  var devSheet = developerDBv.getSheetByName(logsSh);
  var devRange = devSheet.getRange(1,1,devSheet.getRange("A1").getDataRegion().getLastRow(),devSheet.getRange("A1").getDataRegion().getLastColumn());
  var devValues = devRange.getValues();
  
  devValues[0][0] = index;
  devValues[0][1] = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
  devValues[0][2] = 'Updated';
  devValues[0][3] = '['+cache.get("badge")+'] '+cache.get("name");
  
  devSheet.insertRowBefore(1);
  devRange.setValues(devValues);
  
  return 'update'
}

function revokeTraining(index){
  var cache = CacheService.getUserCache();
  var sheet = trainingDBv.getSheetByName(trainingSh);
    
  var range = sheet.getRange(3,2,sheet.getRange("B2").getDataRegion().getLastRow()-2,sheet.getRange("B2").getDataRegion().getLastColumn());
  var values = range.getValues();
  
  var indexes = values.map(function(i){ return i[10]; });
  var pos = indexes.indexOf(parseInt(index, 10));
  
  
  values[pos][9] = 'Revoked';
  range.setValues(values);
  
  var devSheet = developerDBv.getSheetByName(logsSh);
  var devRange = devSheet.getRange(1,1,devSheet.getRange("A1").getDataRegion().getLastRow(),devSheet.getRange("A1").getDataRegion().getLastColumn());
  var devValues = devRange.getValues();
  
  devValues[0][0] = index;
  devValues[0][1] = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
  devValues[0][2] = 'Revoked';
  devValues[0][3] = '['+cache.get("badge")+'] '+cache.get("name");
  
  devSheet.insertRowBefore(1);
  devRange.setValues(devValues);
  
  return 'revoke'
}

function deleteRow(index){
  var cache = CacheService.getUserCache();
  var sheet = trainingDBv.getSheetByName(trainingSh);
    
  var range = sheet.getRange(3,2,sheet.getRange("B2").getDataRegion().getLastRow()-2,sheet.getRange("B2").getDataRegion().getLastColumn());
  var values = range.getValues();
  
  var indexes = values.map(function(i){ return i[10]; });
  var pos = indexes.indexOf(parseInt(index, 10));
  
  
  values[pos][9] = 'Deleted';
  range.setValues(values);
  
  var devSheet = developerDBv.getSheetByName(logsSh);
  var devRange = devSheet.getRange(1,1,devSheet.getRange("A1").getDataRegion().getLastRow(),devSheet.getRange("A1").getDataRegion().getLastColumn());
  var devValues = devRange.getValues();
  
  devValues[0][0] = index;
  devValues[0][1] = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
  devValues[0][2] = 'Deleted';
  devValues[0][3] = '['+cache.get("badge")+'] '+cache.get("name");
  
  devSheet.insertRowBefore(1);
  devRange.setValues(devValues);
  
  return 'delete'
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function submitAccess(badge){

  var sheet = developerDBv.getSheetByName(credentialSh);
  var range = sheet.getRange(2,1,sheet.getRange("A2").getDataRegion().getLastRow()-1,sheet.getRange("A2").getDataRegion().getLastColumn());
  var values = range.getValues();
 
  var accessCodes = values.map(function(i){ return i[0]; });
  var badges = values.map(function(i){ return i[1]; });
  var names = values.map(function(i){ return i[2]; });
  var emails = values.map(function(i){ return i[7]; });
  
  var pos = badges.indexOf(parseInt(badge, 10));
  
  function getNewCode() {
    function generateCode() {
      var max = 100000;
      var min = 999999;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };  
    
    var sheet = developerDBv.getSheetByName(memberSh);
    var range = sheet.getRange(2,1,sheet.getRange("A2").getDataRegion().getLastRow()-1, sheet.getRange("A2").getDataRegion().getLastColumn());
    var values = range.getValues();
  
    var badges = values.map(function(i){ return i[1]; });
    var pos = badges.indexOf(parseInt(badge, 10));
    
    var accessCode = generateCode();
    var accessPos = accessCodes.indexOf(accessCode);
    
    if (accessPos > -1) {
      async function generateNewCode(){
        const accessCode = await generateCode();
        values[pos][0] = accessCode;
        values[0][1] = '=SORT(Variables!B2:G,1,true)'; 
        range.setValues(values);
        sheet.getRange(3,2,sheet.getRange("A2").getDataRegion().getLastRow()-1, 6).clearContent();
        sheet.getRange(2,3,1,5).clearContent();
        return accessCode;
      }
     generateNewCode();
    } else if(accessPos = -1){
      values[pos][0] = accessCode;
      values[0][1] = '=SORT(Variables!B2:G,1,true)'; 
      range.setValues(values);
      sheet.getRange(3,2,sheet.getRange("A2").getDataRegion().getLastRow()-1, 6).clearContent();
      sheet.getRange(2,3,1,5).clearContent();
      return accessCode;
    }
  }
  if (pos > -1 && !accessCodes[pos] && emails[pos]){
    async function sendEmail(){
      const accessCode = await getNewCode();
      // @ts-ignore
      GmailApp.sendEmail(emails[pos], 'TA Access Code', 'Access Code:'+accessCode, {
        htmlBody: '<body style="margin: 5%; position: relative; background-color: #b71c1c;"><div id="error" class="error" style="position: sticky;padding: 0.05%;width: 100%;background-color: #f44336;color: white;"><p style="padding-left: 1%;"><strong>Do not share</strong> your Access Code with anyone, including administrative services or the command team.</p></div><div style="position: absolute;text-align: center;background-color: #b71c1c;"><div style="margin-top: 3%;"><img src ="'+PropertiesService.getScriptProperties().getProperty("LOGO")+'" style="width: 12%;" alt="KCRS Logo"/></div><div style="margin: 3%;"><p style="text-align: left; color: white;">Dear '+names[pos]+',<br>You have requested to have your access information emailed to you.<br><br>Access Code: '+accessCode+'<br><br><p></div></div></body>',
        name: 'Administrative Services'
      });
    }
    sendEmail();
  } else if (pos > -1 && accessCodes[pos] && emails[pos]){
    // @ts-ignore
    GmailApp.sendEmail(emails[pos], 'TA Access Code', 'Access Code:'+accessCodes[pos], {
      htmlBody: '<body style="margin: 5%; position: relative; background-color: #b71c1c;"><div id="error" class="error" style="position: sticky;padding: 0.05%;width: 100%;background-color: #f44336;color: white;"><p style="padding-left: 1%;"><strong>Do not share</strong> your Access Code with anyone, including administrative services or the command team.</p></div><div style="position: absolute;text-align: center;background-color: #b71c1c;"><div style="margin-top: 3%;"><img src ="'+PropertiesService.getScriptProperties().getProperty("LOGO")+'" style="width: 12%;" alt="KCRS Logo"/></div><div style="margin: 3%;"><p style="text-align: left; color: white;">Dear '+names[pos]+',<br>You have requested to have your access information emailed to you.<br><br>Access Code: '+accessCodes[pos]+'<br><br><p></div></div></body>',
      name: 'Administrative Services'
    });
  } else if (!emails[pos]) {
    throw 'Undefined email. Contact KCRS Command'
  }
}

function setEmail(badge, email) {
  var sheet = developerDBv.getSheetByName(memberSh);
  var range = sheet.getRange(2,1,sheet.getRange("A2").getDataRegion().getLastRow()-1, sheet.getRange("A2").getDataRegion().getLastColumn());
  var values = range.getValues();
  
  var badges = values.map(function(i){ return i[1]; });
  var pos = badges.indexOf(parseInt(badge, 10));
  
  values[pos][7] = email; 
  values[0][1] = '=SORT(Variables!B2:G,1,true)'; 
  range.setValues(values);
  sheet.getRange(3,2,sheet.getRange("A2").getDataRegion().getLastRow()-1, 6).clearContent();
  sheet.getRange(2,3,1,5).clearContent();
  return 'email'
}

function addMember(badge, email) {
  function sortData(){
    var TAsheet = trainingDBv.getSheetByName(variablesSh);
    var TAsortrange = TAsheet.getRange(2,1,TAsheet.getRange("A2").getDataRegion().getLastRow()+1, 5);
    
    TAsortrange.sort({column: 5, ascending: false})
  }
  function updateInstructorList() {
    /*var TAsheet = trainingDBv.getSheetByName(variablesSh);
    var form = FormApp.openById("1qzG9pUL4oztqygZyHoX8h_yydCK31wUwbkJOjxYOYoM");
    var item = form.getItemById("1436024318");
    
    var instructors = TAsheet.getRange("B:B").getValues();
    var data = TAsheet.getRange(2, 2, instructors.filter(String).length - 1, 1).getValues();
    // @ts-ignore
    item.asListItem().setChoiceValues(data).setRequired(true);*/
    throw("Disabled. This module due to unreachable Google Form. It does still add member's access.")
  };
  var TAsheet = trainingDBv.getSheetByName(variablesSh);
  var TArange = TAsheet.getRange(2,1,TAsheet.getRange("A2").getDataRegion().getLastRow()+1, 3);
  var TAvalues = TArange.getValues();
  var lastRow = TAsheet.getRange("A2").getDataRegion().getLastRow()-1;
  
  var Msheet = developerDBv.getSheetByName(memberSh);
  var Mrange = Msheet.getRange(2,1,Msheet.getRange("A2").getDataRegion().getLastRow()-1, Msheet.getRange("A2").getDataRegion().getLastColumn());
  var Mvalues = Mrange.getValues();
  
  var badges = Mvalues.map(function(i){ return i[1]; });
  var names = Mvalues.map(function(i){ return i[2]; });
  var pos = badges.indexOf(parseInt(badge, 10));
  if (pos > -1 && email && names[pos] && badge) {
    TAvalues[lastRow][0] = email;
    TAvalues[lastRow][1] = names[pos];
    TAvalues[lastRow][2] = badge;
    Mvalues[pos][7] = email; 
    Mvalues[0][1] = '=SORT(Variables!B2:G,1,true)'; 

    TArange.setValues(TAvalues);
    Mrange.setValues(Mvalues);
    Msheet.getRange(3,2,Msheet.getRange("A2").getDataRegion().getLastRow()-1, 6).clearContent();
    Msheet.getRange(2,3,1,5).clearContent();
    
    trainingDBv.addEditor(email);
    updateInstructorList();
    sortData();
    return 'add'
  } else if (pos == -1){
    throw ("Member doesn't exist?")
  } else if (!email){
    throw ("Undefined email")
  } else if (names[pos]){
    throw ("Nice Try.")
  }
}

function removeMember(badge) {
  function sortData(){
    var TAsheet = trainingDBv.getSheetByName(variablesSh);
    var TAsortrange = TAsheet.getRange(2,1,TAsheet.getRange("A2").getDataRegion().getLastRow()+1, 5);
    
    TAsortrange.sort({column: 5, ascending: false})
  }
  function updateInstructorList() {
    /*var TAsheet = trainingDBv.getSheetByName(variablesSh);
    var form = FormApp.openById("1qzG9pUL4oztqygZyHoX8h_yydCK31wUwbkJOjxYOYoM");
    var item = form.getItemById("1436024318");
    
    var instructors = TAsheet.getRange("B:B").getValues();
    var data = TAsheet.getRange(2, 2, instructors.filter(String).length - 1, 1).getValues();
    // @ts-ignore
    item.asListItem().setChoiceValues(data).setRequired(true);*/
    throw("Disabled. This module due to unreachable Google Form. It does still remove member's access.")
  };
  var TAsheet = trainingDBv.getSheetByName(variablesSh);
  var TArange = TAsheet.getRange(2,1,TAsheet.getRange("A2").getDataRegion().getLastRow()+1, 3);
  var TAvalues = TArange.getValues();
  var TAsortrange = TAsheet.getRange(2,1,TAsheet.getRange("A2").getDataRegion().getLastRow()+1, 5);
  var lastRow = TAsheet.getRange("A2").getDataRegion().getLastRow()-1;
  
  var TAnames = TAvalues.map(function(i){ return i[1]; });
  var TAbadges = TAvalues.map(function(i){ return i[2]; });
  var TApos = TAbadges.indexOf(parseInt(badge, 10))+2;
  
  var Msheet = developerDBv.getSheetByName(memberSh);
  var Mrange = Msheet.getRange(2,1,Msheet.getRange("A2").getDataRegion().getLastRow()-1, Msheet.getRange("A2").getDataRegion().getLastColumn());
  var Mvalues = Mrange.getValues();
  
  var Mbadges = Mvalues.map(function(i){ return i[1]; });
  var Mnames = Mvalues.map(function(i){ return i[2]; });
  var Memails = Mvalues.map(function(i){ return i[7]; });
  var Mpos = Mbadges.indexOf(parseInt(badge, 10));
  
  var email = Session.getEffectiveUser().getEmail();
  
  if (TApos > -1 && Memails[Mpos] && Memails[Mpos]!= email){
    TAsheet.deleteRow(TApos);
    // @ts-ignore
    trainingDBv.removeEditor(Memails[Mpos]);
    updateInstructorList();
    sortData()
    return 'remove'
  } else if (TApos == -1){
    throw ("Undefined variables")
  } else if (!Memails[Mpos]){
    throw ("Undefined email")
  } else if (Memails[Mpos] == email){
    throw ("Nice Try.")
  }
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function setLogo(value) {
  PropertiesService.getScriptProperties().setProperty("LOGO", value)
}

function setSettingWl(value) {
  PropertiesService.getScriptProperties().setProperty("WL_SETTINGS", value)
}

function setTAWlManagement(value) {
  PropertiesService.getScriptProperties().setProperty("WL_TAMEMBERMANAGMENT", value)
}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
