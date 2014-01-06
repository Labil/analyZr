var getWords = function(){

    var scaleMinRepeat = function(dataset){
        if(dataset > 1000) return 8;
        if(dataset > 800) return 6;
        if(dataset > 600) return 4;
        if(dataset > 400) return 2;
        if(dataset > 200) return 1;
        else return 1;
    };

    //trim() removes whitespace from both sides of string
    var words = document.getElementById("textfield").value.toLowerCase().trim().replace(/[,;.!]/g,'').split(/[\s\/]+/g).sort();
    
    var ignore = ['and', 'the', 'to', 'a', 'of', 'for', 'as', 'i', 'with', 'have', 
        'you', 'it', 'is', 'on', 'that', 'this', 'can', 'in', 'be', 'has', 'if'];
   /* var ignore = ['en', 'jeg', 'litt', 'med', 'og', 'på', 'til', 'var', 'fra', 'å', 'to', 
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

    var individualWords = [];

    var frequency = {};

    for(var i = 0; i < wordsCount; i++){
        var w = filtered[i];
        frequency[w] = frequency[w] || 0; //If current word haven't been counted yet
        frequency[w]++;    
    }

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

    var w = 800;
    var h = 600;
    var frameW = 600;
    var frameH = 500;
  
    var dataset = getWords().slice();
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
        .range([10, 80]);

    var wSpanScale = d3.scale.linear()
        .domain([1, d3.max(dataset, function(d) { return d.frequency; })])
        .range([10, 45]);

    var hSpanScale = d3.scale.linear()
        .domain([1, d3.max(dataset, function(d) { return d.frequency; })])
        .range([20, 70]);


    var nCols, nRows, wField, hField;
    var fields = [];

    var setupFields = function(){
        nCols = dataset.length;
        nRows = dataset.length;
        wField = Math.round(frameW / nCols);
        hField = Math.round(frameH / nRows);
        console.log("width per field: " + wField + ", height per field: " + hField);

        for(var i = 0; i < wField * hField; i++){
            fields.push(true);
        }
    }();

    //Looks for space in the csv to put the word
    var queryField = function(wSpan, hSpan){

        //To avoid dividing by 0 further down, plus adding border i = 1
        for(var i = 1; i < fields.length; i++){
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

    var checkSubsequentFields = function(index, wSpan, hSpan){
        for(var i = 0; i < wSpan; i++){
            if(fields[index + i] == false){
                return false;
            }
            for(var j = 1; j < hSpan; j++){
                var lul = index + i + (nRows * j);
                if(fields[lul] == false){
                    return false;
                }
            }     
        }
        console.log("Word fit here!");
        return true;
    };

    var reserveFields = function(index, wSpan, hSpan){
        console.log("Reserving field from index: " + index + " and wSpan: " + wSpan + ", hSpan: " + hSpan);
        for(var i = 0; i < wSpan; i++){
            var lu = index + i;
            fields[lu] = false;
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
    var getPosition = function(d){
        var wordspan = calcWordSpan(d);
        var fieldIndex = queryField(wordspan.w, wordspan.h);
        var pos = {};
        if(fieldIndex != -1){
            var row = Math.floor(fieldIndex/nCols);
            var col = (fieldIndex + nCols) % nCols;
            pos.x = (wField * col);
            pos.y = 50 + (hField * row) + hSpanScale(d.frequency) ;
            return pos;
        }
        else{
            return { "x" : 0, "y" : 0};
        }
    };

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
        //.attr("rotate", (Math.random() * 2) * 90);
};

var getRandomNumber = function(min, max){
    var rand = Math.floor(Math.random() * (max - min + 1) + min);
    return rand;
};

