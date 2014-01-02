var getWords = function(){
    //trim() removes whitespace from both sides of string
    var words = document.getElementById("textfield").value.toLowerCase().trim().replace(/[,;.!]/g,'').split(/[\s\/]+/g).sort();
    
    var ignore = ['and', 'the', 'to', 'a', 'of', 'for', 'as', 'i', 'with', 'have', 'you', 'it', 'is', 'on', 'that', 'this', 'can', 'in', 'be', 'has', 'if'];
    
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

    var jsonFreq = [];
    for(var key in frequency){
        if (!frequency.hasOwnProperty(key)) continue;

        if (frequency[key] > 1) {
            jsonFreq.push( { "word" : key, "frequency" : frequency[key] } );
        }

    }

    return jsonFreq;
};

var visualizeWords = function(){

    var w = 500;
    var h = 300;
  
    var dataset = getWords().slice();
    console.log("Dataset length: " + dataset.length);
    var svg = d3.select("body").append("svg");
    svg.attr("width", w)
        .attr("height", h);

    var fill = d3.scale.category20();

    var xScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d){
            return d.frequency;
        })])
        .range([0, w]);

    var yScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) { return d.frequency; })])
        .range([h, 0]);

    var rScale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) { return d.frequency; })])
        .range([2, 5]);

    var nCols, nRows, wField, hField;
    var fields = [];

    var setupFields = function(){
        nCols = dataset.length;
        nRows = dataset.length;
        wField = w / nCols;
        hField = h / nRows;

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
                //else
                  //  continue;
            }
        }
        console.log("No space for the word was found");
        return -1;
    
    };

    var reserveFields = function(index, wSpan, hSpan){
        for(var i = 0; i < wSpan; i++){
            console.log("Reserving field width " + index + i)
            fields[index + i] = false;      
            for(var j = 1; j < hSpan; j++){
                console.log("Reserving field height: " + (index + i + (nCols *j)) );
                fields[index + i + (nCols * j)] = false;
            }
        } 
    };

    var checkSubsequentFields = function(index, wSpan, hSpan){
        for(var i = 0; i < wSpan; i++){
            if(fields[index + i] == false){
                console.log("Word didn't fit in width.");
                return false;
            }
            for(var j = 1; j < hSpan; j++){
                if(fields[index + (nCols * j)] == false){
                    console.log("Word didn't fit in height.")
                    return false;
                }
            }      
        }
        console.log("Word fit here!");
        return true;
    };
    //In field units
    //TODO: fix size adjustment
    var calcWordSpan = function(d){
        var wordspan = {};
        wordspan.x = Math.ceil((Math.ceil(d.word.length * d.frequency * 10)) / wField); 
        wordspan.y = Math.ceil(Math.ceil(d.frequency * 10) / hField);
        console.log("Wordspan is: " + wordspan.x + "," + wordspan.y);
        return wordspan;
    };
    //In pixels
    var getPosition = function(d){
        var wordspan = calcWordSpan(d);
        console.log("Wordspan.y: " + wordspan.y);
        var fieldIndex = queryField(wordspan.x, wordspan.y);
        var pos = {};
        if(fieldIndex != -1){
            var col = fieldIndex % nCols;
            var row = Math.floor(nRows/fieldIndex);
            pos.x = Math.round((w/nCols) * col);
            pos.y = h - (Math.round((h/nRows) * row)) + (wordspan.y * hField); //trap: division by 0, see above
            return pos;
        }
        else{
            console.log("No position was found");
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
           // return getRandomNumber(0, w);
        })
        .attr("y", function(d, i){
            console.log("Saved y position at index " + i + ": " + savedYPositions[i]);
            return savedYPositions[i];
            //return getRandomNumber(0, h);
        })
        .attr("font-family", "Comic Sans MS")
        .attr("font-size", function(d){
            return d.frequency * 10;
        })
        .attr("fill", function(d, i) { return fill(i); });
        //.attr("rotate", (Math.random() * 2) * 90);
};

var getRandomNumber = function(min, max){
    var rand = Math.floor(Math.random() * (max - min + 1) + min);
    //console.log(rand);
    return rand;
};

