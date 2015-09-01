// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

var defaultSetting = {
  "regions": "",
  "namePrefix": "",
  "name": "",
  "path": "./"
};

main();

function main() {
  if (!app.activeDocument.saved && !confirm("源文件未保存，是否保存并开始处理")) {
    return;
  }
  var startRulerUnits = app.preferences.rulerUnits;
  var startTypeUnits = app.preferences.typeUnits;
  var startDisplayDialogs = app.displayDialogs;
  
  app.preferences.rulerUnits = Units.PIXELS;
  app.preferences.typeUnits = TypeUnits.PIXELS;
  app.displayDialogs = DialogModes.NO;
    
  var userSetting = readConfig(app.activeDocument.path + "./divide.json");
  var setting = mergeSetting(defaultSetting, userSetting);

  var coordinates = getCoordinatesFromGuides(app.activeDocument.guides);
  var regions = getRegionsFromCoordinates(coordinates, setting.regions);

  saveRegions(regions, app.activeDocument.path+setting.path, setting.namePrefix, setting.name);

  app.preferences.rulerUnits = startRulerUnits;
  app.preferences.typeUnits = startTypeUnits;
  app.displayDialogs = startDisplayDialogs;
  
  if (confirm("分隔完成，是否关闭当前源文件")) {
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
  }
}

function mergeSetting(setting1, setting2) {
  var result;
  if (setting2.regions) {
    setting1.regions = setting2.regions;
  }
  if (setting2.namePrefix) {
    setting1.namePrefix = setting2.namePrefix;
  }
  if (setting2.name) {
    setting1.name = setting2.name;
  }
  if (setting2.path) {
    setting1.path = setting2.path;
  }
  result = setting1;
  return result;
}

function readConfig(configFilePath) {
    var result = '';
    
    var configFile = new File(configFilePath);
    configFile.open('r');

    var configStr = "";
    while (!configFile.eof) {
        configStr += configFile.readln();
    }
    configFile.close();
    configStr = configStr.replace(/(^\s*)|(\s*$)/g,"");
    if (configStr) {
        result = eval('('+configStr+')');
    } else {
        result = {  "regions": "", "name": "", "path": "./"};
    }
    return result;
}


function getCoordinatesFromGuides(guides) {
  var result = [];

  var horizontalGuides = getGuides(Direction.HORIZONTAL, true, guides);
  var verticalGuides = getGuides(Direction.VERTICAL, true, guides);

  for (var i=0; i<horizontalGuides.length; i++) {
    var currentHorizontalCoordinates = [];
    for (var j=0; j<verticalGuides.length; j++) {
      var curentCoordinateArray = [verticalGuides[j], horizontalGuides[i]];
      currentHorizontalCoordinates.push(curentCoordinateArray);
    }
    result.push(currentHorizontalCoordinates);
  }

  return result;
}

function getRegionsFromCoordinates(coordinates, needSavedRegions) {
  var result = [];
  var allRegions = [];
  for (var i=0; i<coordinates.length-1; i++) {
    var currentLineCoordinates = coordinates[i];
    var nextLineCoordinates = coordinates[i+1];
    for (var j=0; j<currentLineCoordinates.length-1; j++) {
      allRegions.push([currentLineCoordinates[j], currentLineCoordinates[j+1],
                  nextLineCoordinates[j+1], nextLineCoordinates[j]]);
    }
  }

  if (needSavedRegions === "" || needSavedRegions.length >= allRegions.length) {
    result = allRegions;
  } else {
    for (var k = 0; k < needSavedRegions.length; k++) {
      result.push(allRegions[needSavedRegions[k]]);
    }
  }
  return result;
}

function saveRegions(regions, path, fileNamesPrefix, fileNames) {
  var docRef = app.activeDocument;
  for (var i = 0; i < regions.length; i++) {
    var state = docRef.activeHistoryState;
    try{ docRef.mergeVisibleLayers(); } catch(e){}

    var fileName = "";
    if (fileNames !== "") {
      fileName = fileNames[i];
    } else {
      fileName = i;
    }

    fileName = fileNamesPrefix + fileName;

    try {
        saveRegion4Web(docRef.selection, regions[i], path + fileName + ".jpg");
    } catch(e){}

    app.activeDocument = docRef;
    docRef.activeHistoryState = state;
  }
}

function saveRegion4Web(selectionRef, region, filePath) {
  var fileDirpath = getDirpath4File(filePath);
  if (!Folder(fileDirpath).exists) {
    new Folder(fileDirpath).create();
  }
  var file = new File(filePath);
  var regionWidth = region[1][0] - region[0][0];
  var regionHeight = region[2][1] - region[1][1];
  selectionRef.select(region);
  selectionRef.copy();

  var tmpDoc = app.documents.add(regionWidth, regionHeight, 72, "tmp", NewDocumentMode.RGB);
  tmpDoc.paste();
  exportDocument(tmpDoc, file, SaveDocumentType.JPEG);

  tmpDoc.close(SaveOptions.DONOTSAVECHANGES);
}

function getDirpath4File(filePath) {
  return filePath.substring(0,filePath.lastIndexOf("\/")+1);
}

function exportDocument(doc, savefile, saveformat) {
  var saveOptions = new ExportOptionsSaveForWeb();
  saveOptions.format = saveformat;
  saveOptions.includeProfile = false;
  saveOptions.interlaced = 0;
  saveOptions.optimized = true;
  saveOptions.quality = 60;
  doc.exportDocument(savefile, ExportType.SAVEFORWEB, saveOptions);
}

function getGuides(direction, isResultSort, guides) {
  var result = [];
  for (var i=0; i<guides.length; i++) {
    if (guides[i].direction == direction) {
      result.push(guides[i].coordinate);
    }
  }

  if (isResultSort) {
    result = result.sort(function(a, b) {
      return a.value - b.value ;
    });
  }
  return result;
}
