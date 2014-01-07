var getWords = function(){

    var scaleMinRepeat = function(dataset){
        if(dataset > 1000) return 8;
        if(dataset > 800) return 6;
        if(dataset > 600) return 4;
        if(dataset > 400) return 2;
        if(dataset > 200) return 1;
        else return 1;
    };

    //trim() removes whitespace from both sides of string //.sort() at the end for sorting in alphabetical order
    var words = document.getElementById("textfield").value.toLowerCase().trim().replace(/[,;.!]/g,'').replace(/\d+/g,'').split(/[\s\/]+/g);
    
    var ignore = ['and', 'the', 'to', 'a', 'of', 'for', 'as', 'i', 'with', 'have', 
        'you', 'it', 'is', 'on', 'that', 'this', 'can', 'in', 'be', 'has', 'if', 'by'];

    //Norwegian ignores:
    /*var ignore = ['en', 'jeg', 'litt', 'med', 'og', 'på', 'til', 'var', 'fra', 'å', 'to', 
        'tre', 'kanskje', 'ganske', 'av', 'de', 'dro', 'fikk', 'på', 'så', 'som', 'hadde',
        'men', 'om', 'så', 'å', 'på', 'veldig', 'rundt', 'masse', 'at', 'bare', 'ble', 'det',
        'er', 'etter', 'for', 'i', 'gikk', 'ha', 'ham', 'han', 'har', 'ikke', 'kom', 'sa',
        'seg', 'meg', 'skulle', 'ville', '-', 'måtte', 'andre'];*/

    var filtered = words.filter(function(val){
        for(var i = 0; i < ignore.length; i++){
            if(ignore[i] == val) return false;
        }
        return true;
    });

    var wordsCount = filtered.length;

    var frequency = {};
    for(var i = 0; i < wordsCount; i++){
        var w = filtered[i];
        frequency[w] = frequency[w] || 0; //If current word haven't been counted yet
        frequency[w]++;    
    }

    /*var sortWordsByFrequency = function(w){
                
    };*/

    var minRepeat = scaleMinRepeat(wordsCount);
    //minRepeat = 3;

    var jsonFreq = [];
    for(var key in frequency){
        if (!frequency.hasOwnProperty(key)) continue;

        if (frequency[key] > minRepeat) {
            jsonFreq.push( { "word" : key, "frequency" : frequency[key] } );
        }

    }

    return jsonFreq;
};

var visualizeWords = function(){

    var dataset = getWords().slice();

    var w = 800;
    var h = 600;
    var frameW = 600;
    var frameH = 500;
  
    console.log("Dataset length: " + dataset.length);
    var svg = d3.select("body").append("svg");
    svg.attr("width", w)
        .attr("height", h);
    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "black");

    var fill = d3.scale.category20();

    var fontScale = d3.scale.linear()
        .domain([1, d3.max(dataset, function(d) { return d.frequency; })])
        .range([20, 80]);

    var wSpanScale = d3.scale.linear()
        .domain([1, d3.max(dataset, function(d) { return d.frequency; })])
        .range([12, 45]);

    var hSpanScale = d3.scale.linear()
        .domain([1, d3.max(dataset, function(d) { return d.frequency; })])
        .range([40, 60]);

    var topMarginSpanScale = d3.scale.linear()
        .domain([1, d3.max(dataset, function(d) { return d.frequency; })])
        .range([5, 30]);


    var nCols, nRows, wField, hField;
    var fields = [];
    var startField, startRow;
    var rowOrder = [];

    var setupFields = function(){
        nCols = Math.round(dataset.length/3);
        nRows = Math.round(dataset.length/3);
        console.log("nCols: " + nCols + ", nRows: " + nRows);
        wField = Math.round(frameW / nCols);
        hField = Math.round(frameH / nRows);
        console.log("width per field: " + wField + ", height per field: " + hField);

        for(var i = 0; i < nCols * nRows; i++){
            fields.push(true);
        }

        startField = (fields.length/2) + (nCols/2);
        console.log("Start field: " + startField);
        startRow = Math.floor(startField/nCols);
        rowOrder.push(startRow);
        console.log("Startrow: " + startRow);

        for(var i = 1; i < nRows/2; i++){
            rowOrder.push(startRow - i);
            rowOrder.push(startRow + i);
            var lul = startRow -i;
            var lal = startRow + i;
            console.log("Roworder: " + lul + "," + lal);
        }
    }();

    //Looks for space in the svg to put the word, returns fieldIndex
    var queryField = function(wSpan, hSpan){

        for(var i = 0; i < fields.length; i++){
            if(fields[i] == true){
                if(checkSubsequentFields(i, wSpan, hSpan)){
                    reserveFields(i, wSpan, hSpan);
                    return i;
                }
            }
        }
        console.log("No space for the word was found");
        return -1;
    };

    //Checks if there is enough space for the whole word to fit
    var checkSubsequentFields = function(index, wSpan, hSpan){
        for(var i = 0; i < wSpan; i++){
            if(fields[index + i] == false){
                return false;
            }
            for(var j = 1; j < hSpan; j++){
                var indx = index + i + (nRows * j);
                if(fields[indx] == false){
                    return false;
                }
            }     
        }
        return true;
    };

    //Makes the selected fields false, so no other words will fit here.
    var reserveFields = function(index, wSpan, hSpan){
        for(var i = 0; i < wSpan; i++){
            fields[index + i] = false;
            for(var j = 1; j < hSpan; j++){
                var lul = index + i + (nRows * j);
                fields[lul] = false;
            }      
        } 
    };

    //In field units
    var calcWordSpan = function(d){
        var wordspan = {};
        console.log("d.Frequency: " + d.frequency);
        var multiplierW = wSpanScale(d.frequency);
        var multiplierH = hSpanScale(d.frequency);
        wordspan.w = Math.ceil((d.word.length * multiplierW) / wField); 
        wordspan.h = Math.ceil(multiplierH / hField);
        console.log("Wordspan is: " + wordspan.w + "," + wordspan.h);
        return wordspan;
    };
    //Pos in pixels
    var margin = 40;
    var getPosition = function(d){
        var wordspan = calcWordSpan(d);
        var fieldIndex = queryField(wordspan.w, wordspan.h);
        var pos = {};
        if(fieldIndex != -1){
            var row = Math.floor(fieldIndex/nCols);
            var col = (fieldIndex + nCols) % nCols;
            pos.x = margin + (wField * col);
            pos.y = margin + (hField * row) + topMarginSpanScale(d.frequency) ;

            return pos;
        }
        else{
            //Positions the words that don't fit outside svg.. hack for the moment
            return { "x" : -100, "y" : -100};
        }
    };

    //Saves the y-positions of the words
    var savedYPositions = [];

    svg.selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .text(function(d){
            return d.word;
        })
        .attr("x", function(d){
            tempPos = getPosition(d);
            savedYPositions.push(tempPos.y);
            return tempPos.x;
        })
        .attr("y", function(d, i){
            return savedYPositions[i];
        })
        .attr("font-family", "Comic Sans MS")
        .attr("font-size", function(d){
           //console.log("Frequency: " + d.frequency + ", font-size: " + fontScale(d.frequency));
            return fontScale(d.frequency);
            //return 30;
        })
        .attr("fill", function(d, i) { return fill(i); });
};

//BAD IDEA
/*var placedWords = [];
var tempWords = [];
var placeWord = function(word, parentSpan, parentSide, fieldIndex){
    word.fieldIndex = fieldIndex;
    placedWords.push(word);
    if(tempWords >= 3){
        //Skip spawing words on right side if the parent was to the right
        if(parentSide == "right"){
            for(var i = 0; i < 3; i++){
                //spawn word on the left
                if(i == 0){
                    var newWord = tempWords[tempWords.length-1];
                    var newSpan = calcWordSpan(newWord).w;
                    placeWord(newWord, newSpan, "right", fieldIndex - newSpan)    
                }
                    
            }
            
        }
    }
};*/