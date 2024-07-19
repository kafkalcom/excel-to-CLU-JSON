$(document).ready(function () {
  var configDelimeter = $("#config-delimeter");
  var configDefaultLanguage = $("#config-default-language");

  var csvContent = $("#csv-content");
  var outputTestContent = $("#output-test-content");
  var outputTrainContent = $("#output-train-content");

  var convertBtn = $("#convert-btn");
  var downloadBtn = $(".download-btn");
  var outputFileName = $("#output-file-name");

  var utterances = {
    test: [],
    train: []
  }

  csvContent.on("keyup", function () {
    run();
  });

  convertBtn.on("click", function () {
    run();
  });

  downloadBtn.on("click", function(){
    var type = $(this).data('type')
    downloadJSON(type, utterances[type]);
  })

  function downloadJSON(type, fileData) {
    var name = outputFileName.val() || "export";
    var dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(fileData));
    var downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", name + "_" + type + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function csvToJson(data, delimiter) {
    var rows = data.trim().split(/\r?\n/);
    var headers = rows
      .shift()
      .split(delimiter)
      .map(function (header) {
        return header.trim();
      });
    var result = rows.map(function (row) {
      var values = row.split(delimiter).map(function (value) {
        return value.trim();
      });
      var obj = {};
      headers.forEach(function (header, index) {
        obj[header] = values[index];
      });
      return obj;
    });

    return result;
  }

  function run() {
    var delimeter = configDelimeter.val() === "" ? "\t" : configDelimeter.val();
    var result = csvToJson(csvContent.val(), delimeter);
    
    utterances = { test: [], train : [] }


    result.forEach(function (row) {
      row = Object.assign(row, {
        language: row.language || configDefaultLanguage.val(),
        entities: JSON.parse(row.entities || "[]")
      });

      var isTest = row.isTest ? row.isTest.toLowerCase() === "true" : false;

      delete row.isTest;

      if(isTest){
        utterances.test.push(row)
      }else{
        utterances.train.push(row)
      }

    });

    outputTestContent.val(JSON.stringify(utterances.test));
    outputTrainContent.val(JSON.stringify(utterances.train));
  }
});
