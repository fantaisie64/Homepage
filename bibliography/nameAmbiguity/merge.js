//var d3;
var jsonData;

// var fuzzLnameSimilarities,
//     fuzzFnameSimilarities,
//     fuzzNameSimilarities;
    //collaborationOverlaps;

// var fuzzLnameSimilarities = [];
var fuzzFnameSimilarities = [];
var fuzzNameSimilarities = [];

var overallThreshold,
    lnameSimilarityThreshold,
    fnameSimilarityThreshold,
    nameSimilarityThreshold,
    collaborationOverlapThreshold;

var matchLname,
    thresholdMode,
    nameSimilarityChecked,
    collaborationOverlapChecked;

var originalNodeCount,
    stepCount,
    nodeCount,
    mergedNodeCount,
    linkCount,
    mergedLinkCount;

//for mode
function Enum(){
    for( var i = 0; i < arguments.length; ++i ){
        this[arguments[i]] = i;
    }
    return this;
}
var thresholdModeEnum = new Enum("OverAll", "MatchSpecific");

// function init(){
//   // d3.csv("nameSimilarity/fuzzLnameSimilarity.csv", function(lnameS){
//   d3.csv("nameSimilarity/fuzzFnameSimilarity.csv", function(fnameS){
//   d3.csv("nameSimilarity/fuzzNameSimilarity.csv", function(nameS){
//     // fuzzLnameSimilarities = lnameS;
//     fuzznameSimilarities = fnameS;
//     fuzzNameSimilarities = nameS;
//   });
//   });
// }

function merge(mergeAllData){
  var deleted = [];
  var replaced = [];
  computeMerge(deleted, replaced);
  sendMessageData(deleted, replaced);
}


function computeMerge(deleted, replaced){
  sendMessageMessage("Computing Merge...");
  var i, j, k, a, b;
  //check similarity
  // firstReplaced = new Array();
  // firstDeleted = new Array();
  var mapped = {};
  var reverseMapped = {};

  //initial for Collaboration Overlaps
  var collaborationEdges = [];
  for(i=0;i<jsonData.links.length;i++){
    if (collaborationEdges[jsonData.links[i].source.index] == undefined){
      collaborationEdge = [];
      collaborationEdge.push(jsonData.links[i].target.index);
      collaborationEdges[jsonData.links[i].source.index] = collaborationEdge;
    }else{
      collaborationEdges[jsonData.links[i].source.index].push(jsonData.links[i].target.index);
    }
      
    if (collaborationEdges[jsonData.links[i].target.index] == undefined){
      collaborationEdge = [];
      collaborationEdge.push(jsonData.links[i].source.index);
      collaborationEdges[jsonData.links[i].target.index] = collaborationEdge;
    }else{
      collaborationEdges[jsonData.links[i].target.index].push(jsonData.links[i].source.index);
    }
  }

  //first: scan and find root *******************************************
  //static
  /*
  for(var i=0;i<fuzzNameSimilarities.length;i++){
    for(var j=i+1;j<fuzzNameSimilarities.length;j++){
      if(parseFloat(fuzzNameSimilarities[i][j]) >= nameSimilarityThreshold){
  */
  //dynamic
  for(i=0;i<jsonData.nodes.length;i++){
    for(j=i+1;j<jsonData.nodes.length;j++){
      var nameSimilarityScore = 0.0;
      var collaborationOverlapScore = 0.0;

      //Name Similarity
      //real indices in similarities matrix
      iNodeIndicesArray = jsonData.nodes[i].indices;
      jNodeIndicesArray = jsonData.nodes[j].indices;
      iNodeNamesArray = jsonData.nodes[i].names;
      jNodeNamesArray = jsonData.nodes[j].names;
      //console.log(iNodeArray);
      //console.log(jNodeArray);

      totalCount = 0.0;
      totalAmount = 0.0;

      if(matchLname){
        //must just do once
        var lName1 = iNodeNamesArray[0].split(",");
        var lName2 = jNodeNamesArray[0].split(",");
        //console.log("lName1[0] = " + lName1[0] + ", lName2[0] = " + lName2[0]);
        //break;
        if(lName1[0] != lName2[0]){
          nameSimilarityScore = 0.0;
          //break; //make every author need to match last name
        }else{
          for(a=0;a<iNodeIndicesArray.length;a++){
            for(b=0;b<jNodeIndicesArray.length;b++){
              totalAmount += parseFloat(fuzzFnameSimilarities[iNodeIndicesArray[a]][jNodeIndicesArray[b]]);
              totalCount += 1.0;
            }
          }
          nameSimilarityScore = totalAmount / totalCount;
        }
      }else{
        for(a=0;a<iNodeIndicesArray.length;a++){
          for(b=0;b<jNodeIndicesArray.length;b++){
            totalAmount += parseFloat(fuzzNameSimilarities[iNodeIndicesArray[a]][jNodeIndicesArray[b]]);
            totalCount += 1.0;
          }
        }
        nameSimilarityScore = totalAmount / totalCount;
      }


      //Collaboration Overlaps
      if(collaborationEdges[i]!=undefined){
        if(collaborationEdges[j]!=undefined){
          //compute overlap ratio
          match_1 = 0;
          amount_1 = collaborationEdges[i].length;
          ratio_1 = 0.0;
          for(k1=0;k1<collaborationEdges[i].length;k1++){
            for(k2=0;k2<collaborationEdges[j].length;k2++){
              if(collaborationEdges[i][k1] == collaborationEdges[j][k2]){
                match_1 += 1;
                break;
              }
            }
          }
          ratio_1 = match_1.toFixed(2) / amount_1.toFixed(2);
          
          match_2 = 0;
          amount_2 = collaborationEdges[j].length;
          ratio_2 = 0.0;
          for(k1=0;k1<collaborationEdges[j].length;k1++){
            for(k2=0;k2<collaborationEdges[i].length;k2++){
              if(collaborationEdges[j][k1] == collaborationEdges[i][k2]){
                match_2 += 1;
                break;
              }
            }
          }
          ratio_2 = match_2.toFixed(2) / amount_2.toFixed(2);

          collaborationOverlapScore = Math.max(ratio_1, ratio_2) * 100.0;

          // accumulatedValue = parseFloat(nameSimilarity) * nameSimilarityThreshold / 100.0 + ratio * collaborationOverlapThreshold;
          // if(accumulatedValue >= overallThreshold){
          //   replaced.push(i);
          //     deleted.push(j);
          // }
        }
      }


      //handle node replacement and deletion
      //handle different mode
      var overallBoolean = false;
      if(thresholdMode == thresholdModeEnum.OverAll){
        var nameSimilarityScoreValue = parseFloat(nameSimilarityScore) * nameSimilarityThreshold / 100.0;
        var collaborationOverlapScoreValue = collaborationOverlapScore * collaborationOverlapThreshold / 100.0;
        var accumulatedValue = 0.0;
        if(nameSimilarityChecked)
          accumulatedValue += nameSimilarityScoreValue;
        if(collaborationOverlapChecked)
          accumulatedValue += collaborationOverlapScoreValue;
        if(accumulatedValue >= overallThreshold){
          overallBoolean = true;
        }
      }else if(thresholdMode == thresholdModeEnum.MatchSpecific){
      var nameSimilarityBoolean = nameSimilarityChecked ? nameSimilarityScore >= nameSimilarityThreshold : true;
      var collaborationOverlapBoolean = collaborationOverlapChecked ? collaborationOverlapScore >= collaborationOverlapThreshold : true;
        overallBoolean = nameSimilarityBoolean & collaborationOverlapBoolean;
      }

      if(overallBoolean){
        //console.log(parseFloat(fuzzNameSimilarities[i][j]))

        //map nodes for later merging
        if(mapped[i]!=undefined){
          if(mapped[j]==undefined){
            //firstReplaced.push(mapped[i]);
            //firstDeleted.push(j);
            mapped[j] = mapped[i];
            if(reverseMapped[mapped[i]]==undefined){
              var tempArray = [];
              tempArray.push(j);
              reverseMapped[mapped[i]] = tempArray;
            }else{
              reverseMapped[mapped[i]].push(j);
            }
          }
          // else{
          //   replaced.push(mapped[j]);
          //   deleted.push(i);
          //   mapped[i] = mapped[j];
          // }
        }else{
          if(mapped[j]==undefined){
            //firstReplaced.push(i);
            //firstDeleted.push(j);
            mapped[j] = i;
            if(reverseMapped[i]==undefined){
              var tempArray = [];
              tempArray.push(j);
              reverseMapped[i] = tempArray;
            }else{
              reverseMapped[i].push(j);
            }
          }else{
            //firstReplaced.push(mapped[j]);
            //firstDeleted.push(i);
            mapped[i] = mapped[j];
            
            //important!!! update old nodes with new root
            if(reverseMapped[i]!=undefined){
              for(var ii=0;ii<reverseMapped[i].length;ii++){
                mapped[reverseMapped[i][ii]] = mapped[j];
              }
              reverseMapped[i] = undefined;
            }
          }
        }


      }
    }
  }


  //second: go over merging edges *******************************************
  for(k=0;k<jsonData.nodes.length;k++){
    if(mapped[k]!=undefined){
      replaced.push(mapped[k]);
      deleted.push(k);
    }
  }
  // console.log(replaced);
  // console.log(deleted);
}


self.onmessage = function(e) {
  originalMessage = JSON.parse(e.data);
  if(originalMessage.message == "init"){
    // var url = originalMessage.data.href;
    // var index = url.indexOf('index.html');
    // if (index != -1) {
    //   url = url.substring(0, index);
    // }
    fuzzFnameSimilarities = originalMessage.data.fuzzFnameSimilarities;
    fuzzNameSimilarities = originalMessage.data.fuzzNameSimilarities;
    sendMessageMessage("Done Initialization");
    //init();
  }
  else if(originalMessage.message == "initMerge"){
    sendMessageMessage("Initializing Merge...");
    //get all data
    var mergeAllData = JSON.parse(e.data);

    var mergeData = mergeAllData.mergeData;
    var mergeRelation = mergeAllData.mergeRelation;
    var mergeThreshold = mergeAllData.mergeThreshold;
    var mergeMode = mergeAllData.mergeMode;
    var mergeCount = mergeAllData.mergeCount;

    jsonData = mergeData.jsonData;

    // fuzzLnameSimilarities = mergeRelation.fuzzLnameSimilarities;
    // fuzzFnameSimilarities = mergeRelation.fuzzFnameSimilarities;
    // fuzzNameSimilarities = mergeRelation.fuzzNameSimilarities;
    // collaborationOverlaps = mergeRelation.collaborationOverlaps;

    overallThreshold = mergeThreshold.overallThreshold;
    lnameSimilarityThreshold = mergeThreshold.lnameSimilarityThreshold;
    fnameSimilarityThreshold = mergeThreshold.fnameSimilarityThreshold;
    nameSimilarityThreshold = mergeThreshold.nameSimilarityThreshold;
    collaborationOverlapThreshold = mergeThreshold.collaborationOverlapThreshold;

    matchLname = mergeMode.matchLname;
    thresholdMode = mergeMode.thresholdMode;
    nameSimilarityChecked = mergeMode.nameSimilarityChecked;
    collaborationOverlapChecked = mergeMode.collaborationOverlapChecked;

    originalNodeCount = mergeCount.originalNodeCount;
    stepCount = mergeCount.stepCount;
    nodeCount = mergeCount.nodeCount;
    mergedNodeCount = mergeCount.mergedNodeCount;
    linkCount = mergeCount.linkCount;
    mergedLinkCount = mergeCount.mergedLinkCount;

    merge();
  }
};

function sendMessageMessage(message){
  self.postMessage(JSON.stringify({message:message}));
}

function sendMessageData(deleted, replaced){
  sendMessageMessage("Retrieving Merge Data...");
  //merge all data
  var mergeAllData = {deleted:deleted, replaced:replaced};

  self.postMessage(JSON.stringify({message:"doneMerge", data:mergeAllData}));
}