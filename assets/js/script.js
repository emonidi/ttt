// 0 - empty, 1 - cross, 2 - circle

var vBoard = function(){



	this.setFigure = function(field,figure){
        var figureDigit;
        if(figure === 'cross'){
            figureDigit = 1;
        }else if(figure === 'circle'){
            figureDigit = 4;
        }

        $("#"+field).addClass(figure).data("figure",figureDigit);

	}

    this.removeDataFigures = function(){
        $(".cell").data("figure","0");
    }

    this.scanConfiguration = function(){
        var state = '';
        for(var i =  1; i<10; i++){
           var value = $("#"+i).data('figure');
           state = state+value;
        }

        return state;
    }

    this.removeDataActive=function(field){
        $("#"+field).removeClass("active");

    }

    this.resetDataActive = function(){
       for(var i = 1; i<10; i++){
           $("#"+i).addClass("active");
        }
    }

    this.clearBoard = function(){
        $(".cell").removeClass("cross").removeClass("circle");
    }

}


var addQ = function(field,figure){
    vb.setFigure(field,figure);
    var conf =  vb.scanConfiguration();
    a1.addQValue(conf);
}

var vb = new vBoard();


var agent = function(figure){
    var Super = this;
    this.figure = figure;
    this.reward = 0;
    var history = [];
    this.q = {

    };


    this.addToHistory = function(qKey,position){

        history.push({qKey:qKey,position:position});
    }

    this.updateHistory = function(){

        for(var i in history){

            var move = history[i];

            var maxNextStateValue = Super.getMaxQValue(move["qKey"]);

            Super.q[move["qKey"]][move["position"]] = Super.reward +(0.5*maxNextStateValue);

        }

        history = [];

    }

    this.addQValue =function(qKey){


           if(!Super.q[qKey]){
               Super.q[qKey] = {};
               var positions = Super.getQPosition(qKey);

               for(var i = 0; i<positions.length; i++){
                   Super.q[qKey][positions[i]] = 1.1;
               }

               return 1;

           }else{
               return 0;
           }


    };


    this.evaluateQ = function(qKey){
        var key = Super.q[qKey];
        var max;
        var r;
         var arr = [];


        for (var i in key){
            arr.push(key[i]);
        }
        var max = Math.max.apply(Math,arr);
        for(var i in key){
            if(key[i] === max){
                 r = i;
            }

        }
//        console.log(r);
        return r;
    }


    this.getMaxQValue = function(qKey){
        var key = Super.q[qKey];
        var arr = new Array();
        for(var i in key){
            arr.push(key[i]);
        }
        max = Math.max.apply(Math,arr);

        return max;
    }



    this.getRandom = function(){
       var rand = Math.ceil(Math.random()*9);

       return rand;
    }

    this.getQPosition = function(qKey){
        var self = this;

        self.freePositions = [];

        function search(){
            var pos = qKey.search(0);
            if(pos >= 0){
                self.freePositions.push(pos+1);
                qKey=qKey.replace("0","q");

                search();
            }else{


            }
        }

        search();
        return self.freePositions;
    }

    this.setPosition=function(qKey,positiion,value){
        if(Super.q[qKey]){
            Super.q[qKey].push({position:value});
        };
    }


    this.makeTurn = function(){
        //CHECK FOR WINNER
        var win = game.checkWin();
        if(win){
            game.resetGame(win);
            return false;
        }

        //CHECK FOR TIE
        var tie = game.checkTie();
        if(tie){
            game.resetGame(0);
            return false;
        }

        var position = 1;
        function getRandom(callback){
           if(callback){
               callback = callback;
           }else{
               callback = null;
           }

           var random = Super.getRandom();

           if($("#"+position).hasClass("active")){
            //    position = random;

                callback(position);

           }else{
               position++;
               getRandom(callback);
           }

        }


//          getRandom(function(random){
//
//              var conf = vb.scanConfiguration();
//              Super.addQValue(conf);
//              vb.removeDataActive(random);
//              vb.setFigure(random,Super.figure);
//          });

        var conf = vb.scanConfiguration();
        var q = Super.addQValue(conf);
        if(q === 1){
           getRandom(function(position){
             //  console.log("random");
               move(position);
           });
        }else{

           var eval = Super.evaluateQ(conf);
          //  console.log(eval);
           move(eval);
        }



        function move(position){
           vb.removeDataActive(position);
           vb.setFigure(position,Super.figure);
           Super.addToHistory(conf,position);

        }

    }

}

var game = function(){
    var Super = this;
    this.episode = 0;
    this.activePlayer = 1;
    this.lines = [
        [1,2,3],
        [4,5,6],
        [7,8,9],
        [1,4,7],
        [2,5,8],
        [3,6,9],
        [1,5,9],
        [3,5,7]
    ];

    this.addPoint = function(player){
          var digit = $(".digit."+player).text();

          $(".digit."+player).text(parseInt(digit)+1);
    }

    this.changePlayer = function(){
        if(Super.activePlayer === 1){
            Super.activePlayer = 2;
        }else{
            Super.activePlayer = 1;
        }
        return Super.activePlayer;

    }

    this.checkTie = function(){
        var tie = true;
        for(var i = 0; i<9; i++){
            if($("#"+i).hasClass("active")){
                tie = false;
            }
        }

        return tie;
    }

    this.checkWin = function(){
       var lines = Super.lines;
       var winner = false;
       for(var i = 0; i < lines.length; i++){
           var line = lines[i];
           var val1 = $("#"+line[0]).data("figure");
           var val2 = $("#"+line[1]).data("figure");
           var val3 = $("#"+line[2]).data("figure");
           var valSum = val1+val2+val3;
           if(valSum === 12){
               winner = 2;
               break
           }else if(valSum === 3){
               winner = 1;
               break;
           }
       }

       return winner;
    }



    this.resetGame = function(winner){
        if(winner === 1){
            agents[1].reward = 1;
            agents[2].reward = -1;
        }else if(winner === 2){
            agents[1].reward = -1;
            agents[2].reward = 1;
        }else if(winner === 0){
            agents[1].reward = 0;
            agents[2].reward = 0;
        }
        for(var i in agents){
            agents[i].updateHistory();
        }
        Super.addPoint(winner);
        Super.changePlayer();
       //    alert("Agent " + winner + " wins");
        vb.resetDataActive();
        vb.removeDataFigures();
        vb.clearBoard();
        game.episode++;
        for(var i in agents){
            agents[i].updateHistory();
        }

    }
}

var game = new game();

var agents = {
    1:new agent('cross'),
    2:new agent('circle')
}

var  oneGame = function(){

    agents[game.activePlayer].makeTurn();
    game.changePlayer();

}
$(document).ready(function(){
    var interval;



    $(".learn").click(function(){
         interval =    setInterval(function(){
             agents[game.activePlayer].makeTurn();
             game.changePlayer();
         });
    });

    $(".stop").click(function(){
        clearInterval(interval);
    })

      $(".cell").click(function(){
          var id = $(this).attr('id');

          if($(this).hasClass('active')){
              vb.removeDataActive(id);
              vb.setFigure(id,"cross");
              agents[2].makeTurn();
          };
      });

 })


