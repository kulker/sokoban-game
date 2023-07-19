var _global={};
 

game.module(
    "game.main"
).require("plugin.essentials").body(function() {
    
    var gameOptions = {
        tileSize: 50,
        animationSpeed: 200,
		areaX:5,
		areaY:5
		
    }
    
    var level = [];
	
		var nLevel=[];
    
   var startT;
    var EMPTY = 0;
    var WALL = 1; //block
    var SPOT = 2;// kutunun konulacagı yer
    var CRATE = 3;//kutu
    var PLAYER = 4;
	var SPACE=8;
	var isUndo=false;
	
	var _evlCmd='';
	
    game.addAsset("texture2.png","tiles");
    game.addAsset("player-sheet0.png");
	game.addAsset("cright--sheet0.png","button_r");
	game.addAsset("cleft--sheet0.png","button_l");
	game.addAsset("cup-sheet0.png","button_u");
	game.addAsset("cdown-sheet0.png","button_d");
	
	game.addAsset("btnundo-sheet0.png","button_undo");
	game.addAsset("btnrestart-sheet0.png","button_restart");
	game.addAsset("btnmenu-sheet0.png","level_menu");
	
	game.addAsset("touch_pad_left.png","touch_pad_left");
	game.addAsset("touch_pad_right.png","touch_pad_right");
	//game.addAsset("btns_setting-sheet0.png","button_setting");	
	
	game.addAsset("btns_blank-40px.png","button_back");
	game.addAsset("audioOn.png","icon_sound_on");
	game.addAsset("audioOff.png","icon_sound_off");	
	game.addAsset("setting.png","icon_setting");	
	
	
		
	game.addAsset('font.fnt');
	game.addAsset('font2.fnt');


	game.addAsset("font_normal.fnt");
	
	  
    game.createScene("Main", {
         backgroundColor: '#6D8284', //"#383838", // "#87aeb9", // "#86a7b0",
		 levelNo:0,
		 _l_mode:3, /* 1 reload curr level, 2 get next level , 3 start new*/
		 levelCurrHistory:[],
		 _solutionHistoryStr:'',
        init: function() {
			
		    this.undoArray = [];		 
		    this.cratesGroup = [];	
			this.player=null;
			this.gameArea= new game.Container();
			this.gameArea.position.set(50,50);
			this.gameArea.zIndex=5;
			this.gameArea.addTo(this.stage);
   			
				 
            this.canMove = true;
			console.log(this.input);		 
			this.tapTime = 0;		 
		
			this.sheet_player=new game.SpriteSheet("player-sheet0.png", 64, 64);
		 
            this.getL();			
		
        },
		isDrawControlPanel:0,
		init2:function() {
		//	console.log(level);
			this.levelCurrHistory=[];
			this.histIndex=0; 
			this.drawLevel(false);
			this._solutionHistoryStr='';
			this.levelCrateCnt=0;
			_global.tileSize=gameOptions.tileSize;
			
			this.levelTxt=null;
			this.stepCnt=0;
			this.stepTxt=null;
			this.timeTxt=null;
			this.isStartTimer=false;
			
			game.Timer.add(1000, this.setTimer, true);
		
			this.touchPad=null;
			//if (!this.isDrawControlPanel) {
				this.isDrawControlPanel=1;
				this.drawControlPanel();
				
			//}
			game.scene.stage.children.sort(this.depthCompare);
			setTimeout(function () {			
				 _evlCmd='if (game.device.mobile) this.showTouchPad("l");';
			},100);
			
		},
		
		
		
		drawControlPanel: function () {
		// = Level :  <- -> (U) (R)	
		/* Puan= (MaxDakika*60) -  */
		var marginX=20;
		var marginY=23;
		
		 var box = new game.Graphics();
        box.fillColor = '#5D7A7D';
        box.fillAlpha = 1;
        box.drawRect(0, 0, game.width, 50);
		box.zIndex=0;
        box.addTo(this.stage);
		

		var t, t2 ;
		  var txtY=(this.gameArea.y /2)-14;
	 
        var tb = new game.Button("level_menu", marginX,  marginY, function() {
			console.log("Button clicked 2");
		//	_evlCmd='this._l_mode=2;this.startHistory();';
		    _el('#level_panel').classList.toggle('show');
			 
				
			});		
			 tb.zIndex=0;
			 tb.addTo(this.stage);
			 
		var e = new game.Text("Level");e.x=marginX+35;e.zIndex=0;e.setFont('Normal');
		e.y=txtY;
		e.addTo(this.stage);
		e.scale.set(0.7);
		
		this.levelTxt=new game.Text(this.levelNo);this.levelTxt.x=e.x+e.width+3;this.levelTxt.y=txtY;
		this.levelTxt.addTo(this.stage);
		this.levelTxt.zIndex=0;
		this.levelTxt.setFont('Normal')
		this.levelTxt.scale.set(0.7);
		
			 
	  
		
		t2 = new game.Button("button_undo", game.width-70,  marginY,  function() {
				console.log("Button clicked 4");
				_evlCmd='this.gUndo();';
			} );
			t2.zIndex=0;		 
			 t2.addTo(this.stage);	
			 
			 
			 		
		t2 = new game.Button("button_restart", game.width-25, marginY, function() {
				console.log("Button clicked 3");
				if (confirm('Emin misiniz?'))
					_evlCmd='this._l_mode=1;this.stage.removeAll();this.init();';//TODO test sonrası _l_mode aç

			});			 
			 t2.addTo(this.stage);	
			 
		     
			 
			 this.btnSetting=new game.IconButton("button_back","icon_setting", game.width-117, marginY, function(t) {
				 
				 switch(game.scene.btnSetting.icon.texture.baseTexture._id) {
					 case 'media/setting.png':
					 game.scene.btnSetting.setIcon('touch_pad_left');
					  _evlCmd="this.showTouchPad('l');";
					 break;
					 
					  case 'media/touch_pad_left.png':
					 game.scene.btnSetting.setIcon('touch_pad_right');
					 _evlCmd="this.showTouchPad('r');";
					 break;
					 
					  case 'media/touch_pad_right.png':
					 game.scene.btnSetting.setIcon('icon_setting');
					 	_evlCmd='this.touchPad.visible=false;';
					 break;
				 }
				 
				 
			 } );
			 this.btnSetting.addTo(this.stage);
			 
			 
			 
			 
			 
			var txtInfoStartX= ((game.width*0.8)/2) ; //this.levelTxt.x+(this.levelTxt.width*4)+20;   ;
			var e2 = new game.Text("STEP:");e2.x=txtInfoStartX;e2.zIndex=0;
			e2.y=txtY;
			e2.setFont('Arial');
		 	e2.scale.set(0.5);
			e2.addTo(this.stage);
			
			this.stepTxt= new game.Text(this.stepCnt);this.stepTxt.x=e2.x+e2.width+3;
			this.stepTxt.zIndex=0;this.stepTxt.addTo(this.stage);
			this.stepTxt.setFont('Arial');this.stepTxt.y=txtY;
			this.stepTxt.scale.set(0.5);
		
	    	var e_t = new game.Text("TIME:");e_t.x=(this.stepTxt.x+this.stepTxt.width)+30;
			e_t.zIndex=0;
			e_t.setFont('Arial');
			e_t.y=txtY;
		 	e_t.scale.set(0.5);
			e_t.addTo(this.stage);
			
			this.timeTxt= new game.Text('00:00');
			this.timeTxt.x=e_t.x+e_t.width+3;
			this.timeTxt.y=txtY;
			this.timeTxt.zIndex=0;
			this.timeTxt.setFont('Arial');
			this.timeTxt.scale.set(0.5);
			this.timeTxt.addTo(this.stage);
			
			this.drawTouchPad();
			
		},
		showTouchPad: function (loc) {
		
		     if (loc=='l') {
					this.btnSetting.setIcon('touch_pad_left');
				   this.touchPad.position.set(gameOptions.areaX+50,(game.height-160)); 
			 }
			 
			 if (loc=='r') {
				   this.touchPad.position.set((game.width-this.touchPad.width),(game.height-160)); 
			 }
			 
			 	this.touchPad.visible=true;
				
		},
		drawTouchPad: function () {
		 var butonSize=65;
		 
		 this.touchPad=	new game.Container();
		 this.touchPad.visible=true;
		 this.touchPad.position.set(gameOptions.areaX+50,(game.height-120)); 
		 this.touchPad.zIndex=8;
		 this.touchPad.addTo(this.stage);
		 this.touchPad.scale.set(0.9);
		 this.touchPad.alpha=0.4;
		 
		 var  t2 = new game.Button("button_l", 0,  butonSize, function() {
				console.log("Button left");
				 _evlCmd='this.checkMove(-1, 0);';
			});
			 t2.zIndex=0;					 
		var cScale=(butonSize/t2.width);			
	//		t2.scaleAmount=cScale;			 
			 t2.addTo(this.touchPad); 
			 
			 
			 t2 = new game.Button("button_r", butonSize*2,  butonSize, function() {
				console.log("Button right");
				_evlCmd='this.checkMove(1, 0);';
			});
			 t2.zIndex=0;
			 t2.addTo(this.touchPad); 
			 
			  t2 = new game.Button("button_u", butonSize,  0, function() {
				console.log("Button up");
				 _evlCmd='this.checkMove(0, -1);';
			});
			 t2.zIndex=0;
			 t2.addTo(this.touchPad); 
			 
			t2 = new game.Button("button_d", butonSize,   butonSize*2, function() {
				console.log("Button down");
				 _evlCmd='this.checkMove(0, 1);';
			});
			 t2.zIndex=0;
			 t2.addTo(this.touchPad); 
			 setTimeout(resize,800);
			
		},
        
        drawLevel: function(doingUndo){
		//	console.log(this.sheet_player);
            this.sheet = new game.SpriteSheet("tiles", gameOptions.tileSize, gameOptions.tileSize);
            this.crates = [];
			 var cratesPlaced = 0;
            //this.crates.length = 0;
			_global.levelCols=level[0].length;
			_global.levelRows=level.length;
            for (var i = 0; i < level.length; i++) {
                this.crates[i] = [];
                for (var j = 0; j < level[i].length; j++) {
                    this.crates[i][j] = null;
                    var item = level[i][j];
                    switch(item){
                        case PLAYER:
                        case PLAYER + SPOT:
						
						   if(!doingUndo){
							   
                            this.player = this.sheet.frame(4);
                            this.player.position.set(gameOptions.areaX+ (j * gameOptions.tileSize),gameOptions.areaY+ ( i * gameOptions.tileSize));
                            this.player.addTo(this.gameArea);
                            this.player.zIndex = 8;
                           
                            var tile = this.sheet.frame( (item==PLAYER) ? 0:2 );
                            tile.position.set(gameOptions.areaY+ ( j * gameOptions.tileSize), gameOptions.areaY+ (i * gameOptions.tileSize));
                            tile.addTo(this.gameArea);
                            tile.zIndex = 1;							 
							
							
						   } else {
							 this.player.x = gameOptions.areaX+ ( gameOptions.tileSize * j);
                             this.player.y = gameOptions.areaY+ ( gameOptions.tileSize * i);
							  
							   //   this.player.position.set(gameOptions.areaX+ (j * gameOptions.tileSize),gameOptions.areaY+ ( i * gameOptions.tileSize));
								  
                           //  this.player.setFrame(level[i][j]);
							   
						   }
							 this.player.posX = j;
                            this.player.posY = i;
							
                            break;
                        case CRATE:
                        case CRATE + SPOT:
						
						   if(!doingUndo){
                            this.crates[i][j] = this.sheet.frame(item);
                            this.crates[i][j].position.set(gameOptions.areaX+ ( j * gameOptions.tileSize), gameOptions.areaY+ ( i * gameOptions.tileSize));
                            this.crates[i][j].addTo(this.gameArea);
                            this.crates[i][j].zIndex = 2;
                            var tile = this.sheet.frame(item - CRATE);
                            tile.position.set(gameOptions.areaX+ ( j * gameOptions.tileSize), gameOptions.areaY+( i * gameOptions.tileSize));
                            tile.addTo(this.gameArea);
                            tile.zIndex = 1;
							    this.cratesGroup.push(this.crates[i][j]);
								//if (item==CRATE)
								this.levelCrateCnt++;
						   } else {
							    this.crates[i][j] = this.cratesGroup[cratesPlaced];
                            this.crates[i][j].x = gameOptions.areaX+ ( gameOptions.tileSize * j);
                            this.crates[i][j].y = gameOptions.areaY+ ( gameOptions.tileSize * i);
                           // this.crates[i][j].setFrame(level[i][j]);
                            cratesPlaced ++;
							   
						   }
                            break;
						case SPACE:
						  var tile = this.sheet.frame(6);
                            tile.position.set(gameOptions.areaX+ ( j * gameOptions.tileSize), gameOptions.areaY+ ( i * gameOptions.tileSize));
                            tile.addTo(this.gameArea);
                            tile.zIndex = 1;
						  break;	
                        default:
                            var tile = this.sheet.frame(item);
                            tile.position.set(gameOptions.areaX+ ( j * gameOptions.tileSize), gameOptions.areaY+ ( i * gameOptions.tileSize));
                            tile.addTo(this.gameArea);
                            tile.zIndex = 1;
                            
                    }
                }
            }
			this.gameArea.children.sort(this.depthCompare);
            game.scene.stage.children.sort(this.depthCompare);
        },
        
	
		
        swipe: function(d){
			
			console.log('swipe',d);
            switch(d){
                case "RIGHT":
                    this.checkMove(1, 0);
                    break;
                case "LEFT":
                    this.checkMove(-1, 0);
                    break;
                case "UP":
                    this.checkMove(0, -1);
                    break;
                case "DOWN":
                    this.checkMove(0, 1);
                    break;
            }
        },
        
        checkMove: function(deltaX, deltaY){
		console.log('checkMove',deltaX, deltaY,this.canMove,level);        
		if(this.canMove){
				isUndo=false;
                if(this.isWalkable(this.player.posX + deltaX, this.player.posY + deltaY)){
					
					
					this.undoArray.push(this.copyArray(level));
                    this.movePlayer(deltaX, deltaY, false);
					this.stepCnt++;
					this.startTimer();
                    return;
                }
                if(this.isCrate(this.player.posX + deltaX, this.player.posY + deltaY)){
                    if(this.isWalkable(this.player.posX + 2 * deltaX, this.player.posY + 2 * deltaY)){
						this.undoArray.push(this.copyArray(level));
                        this.movePlayer(deltaX, deltaY, true);
						this.stepCnt++;
						this.startTimer();
                        return;
                    }
                }    
            }
        },
        
        isWalkable: function(posX, posY){
            return level[posY][posX] == EMPTY || level[posY][posX] == SPOT;
        },
        
        isCrate: function(posX, posY){
            return level[posY][posX] == CRATE || level[posY][posX] == CRATE + SPOT;
        },
		_deltaToDirection: function (deltaX, deltaY) {
			if (deltaX ===1 && deltaY===0) return 'r';
			if (deltaX ===-1 && deltaY===0) return 'l';
			if (deltaX ===0 && deltaY===-1) return 'u';
			if (deltaX ===0 && deltaY===1) return 'd';
			
		},
        
        movePlayer: function(deltaX, deltaY, pushCrate){
			console.log(pushCrate);
            this.canMove = false;
            var playerTween = new game.Tween(this.player.position);
            playerTween.to({
                x: this.player.x + deltaX * gameOptions.tileSize,
                y: this.player.y + deltaY * gameOptions.tileSize
            }, gameOptions.animationSpeed);
            playerTween.start();
			this.levelCurrHistory.push(this._deltaToDirection(deltaX, deltaY));
            playerTween.onComplete(function() {
                level[this.player.posY][this.player.posX] -= PLAYER;
                this.player.posX += deltaX;
                this.player.posY += deltaY;
                level[this.player.posY][this.player.posX] += PLAYER;
                if(pushCrate){
                    this.crates[this.player.posY + deltaY][this.player.posX + deltaX] = this.crates[this.player.posY][this.player.posX];
                    this.crates[this.player.posY][this.player.posX] = null;
                    level[this.player.posY][this.player.posX] -= CRATE;
                    level[this.player.posY + deltaY][this.player.posX + deltaX] += CRATE;
                    this.crates[this.player.posY + deltaY][this.player.posX + deltaX].texture = this.sheet.textures[level[this.player.posY + deltaY][this.player.posX + deltaX]];
                }
				
               // this.player.texture = this.sheet_player.textures[level[this.player.posY][this.player.posX]];
                this.canMove = true;
            }.bind(this));
			
            if(pushCrate){
                var crateTween = new game.Tween(this.crates[this.player.posY + deltaY][this.player.posX + deltaX].position);
                crateTween.to({
                    x: this.crates[this.player.posY + deltaY][this.player.posX + deltaX].x + deltaX * gameOptions.tileSize,
                    y: this.crates[this.player.posY + deltaY][this.player.posX + deltaX].y + deltaY * gameOptions.tileSize
                }, gameOptions.animationSpeed);
                crateTween.start();    
            }
			
			//if (this.checkCratePlaced(true)) this.levelComplete();
    	},
        
       
	   startTimer: function () {
		   if (!this.isStartTimer) {
			   this.isStartTimer=true;
			   startT = Date.now();
		   }
	   },
	   
	checkCratePlaced: function (debug) {
			var placedCnt=0;
			 for (var i = 0; i < level.length; i++) {              
                for (var j = 0; j < level[i].length; j++) {
					if (level[i][j]==CRATE+SPOT) placedCnt++;
					
					if (this.cratesGroup.length==placedCnt && placedCnt>0) {						
						return true;
					}
				}
			 }
			 
			// if (debug) 				 console.log(level,placedCnt,this.levelCrateCnt,this.cratesGroup.length);
			 return false;
			
		},
		
		levelComplete: function () {
			if (this.histIndex===0) {
				this.isStartTimer=false;			
				alert('Level completed.\nCongratulations!');
				this._l_mode=2;this.levelNo++;
				this.stage.removeAll();this.init();
			} else {
				// çözüm oynatılmışsa var olan leveli yeniden yükle 
				   this.histIndex=0;
				   this.historyArr=[];
				alert('Completed');
				this._l_mode=1;this.stage.removeAll();this.init();
				
			}
		},
		
	   depthCompare: function (a, b){
            if (a.zIndex < b.zIndex) return -1;
            if (a.zIndex > b.zIndex) return 1;
            return 0;
        },
        
        update: function() {
			
            if (game.keyboard.down("LEFT")){
                this.checkMove(-1, 0);
            }
			
			 if (game.keyboard.down("U")){
                this.gUndo();
			   // this.addObject(this.touchPad);
            }
			
				
			 if (game.keyboard.down("C")){
				 //test için
                this.levelComplete();
            }
			
			 if (game.keyboard.down("S")){
				 //test için                 
				 this.playHistory();
				//TODO 72_6 da problem
            }
			
            if (game.keyboard.down("RIGHT")){
                this.checkMove(1, 0);
            }
            if (game.keyboard.down("UP")){
                this.checkMove(0, -1);
            }
            if (game.keyboard.down("DOWN")){
                this.checkMove(0, 1);
            }
			if (_evlCmd!='') {
				try{
				eval(_evlCmd);
				 
				}
				catch(e) {
					console.log('err',e);
				}
				finally {
				_evlCmd='';
				}
			}
			if (this.stepTxt)
			 this.stepTxt.setText(this.stepCnt.toString());
		 
		 if (this.checkCratePlaced(true)) this.levelComplete();
			 
			
        },
		
		setTimer:function () {
		//	console.log(game.scene.timeTxt);
			 if (game.scene.isStartTimer) {
				 
				 var time,minutes, seconds;				 
				 time= Math.floor((Date.now()-startT)/1000);				 
				 minutes = parseInt(time / 60, 10);
				 seconds = parseInt(time % 60, 10);
				 minutes = minutes < 10 ? "0" + minutes : minutes;
				 seconds = seconds < 10 ? "0" + seconds : seconds;				 
				game.scene.timeTxt.setText( minutes + ":" + seconds);
			 }
		},
		
		gUndo: function(){        
		 
            if(!isUndo && this.undoArray.length>0){
				console.log(this.undoArray);
				var undoLevel = this.undoArray.pop();
				var undoHist=this.levelCurrHistory.pop();
     			level = [];
     			level = this.copyArray(undoLevel);
     			this.drawLevel(true);
				isUndo=true;
				// console.log(level);
				this.stepCnt++;
				setTimeout(function() { isUndo=false;},500);
			}
         
        
    },

	loadlevel: function (levelMap) {
		//TODO level yükleme foreach ile değil for ile yapılacak
		level=null;
		level=[];
		console.log(level);
		if (levelMap!='') {
			var rows=levelMap.toString().split("!");
			
			for ( var r=0;r<rows.length;r++) {
				var cols= rows[r].toString().split('');
				level[r]=[];
				for (var c=0; c<cols.length;c++) {
					var col=cols[c];
					 switch(col) {
						 case 'x':
						  level[r].push(SPACE);						 
						 break;
						 case '#':
						 level[r].push(WALL);						 
						 break;
						 case '$':
						 level[r].push(CRATE);						 
						 break;
						 case '.':
						 level[r].push(SPOT);						 
						 break;
					
						 case '@':
						 level[r].push(PLAYER);	
						console.log(level[r].length-1,r,col);						 
						 break;
					     case '+':
						  level[r].push(PLAYER+SPOT);		 
						 break;
						 case '*':
						 level[r].push(CRATE + SPOT);						 
						 break;	
						 case ' ':
						 level[r].push(EMPTY);						 
						 break;
						 
						 
					 }
				}
				
			}
			
			 
			
		/*	level = [];
			console.log(level,nLevel); 
			level= this.copyArray(nLevel);
			*/
			console.log(level,nLevel);
		}
		//return nLevel;
		
	},
		
		copyArray: function(a){
        var newArray = a.slice(0);
        for(var i = newArray.length; i > 0; i--){
            if(newArray[i] instanceof Array){
                newArray[i] = this.copyArray(newArray[i]);
            }
        }
        return newArray;
	},
	
	levelID:0,
	userID:0,
	selLevelId:0,
	
	getSelLevel: function (levelId) {
		this.selLevelId=levelId;
		this._l_mode=5;
		this.stage.removeAll();this.init();
	},
	getL:function () {
		console.log(this._l_mode);

		if (this._l_mode==1) {
 			if (this._levelBackup) 
				level=this.copyArray(this._levelBackup);
			 
			this.init2();
			
		}  else {
		 
			  var t= new Date();
			 // curr history import yap gönder
			 var currLevelHistoryStr='';
			 if (this.levelCurrHistory.length>0) currLevelHistoryStr=this.levelCurrHistory.join('');
			 			  //TODO level ve sürede gidecek
			  
			  atomic.post("_l_l.php","uid="+btoa(this.userID)+"&_l_mode="+this._l_mode+"&l="+this.levelNo+"&sel_level_id="+this.selLevelId+"&com_level_id="+this.levelID+"&sc="+this.stepCnt+"&clh="+currLevelHistoryStr+"&t="+btoa((t.getYear()*1)+(t.getMonth*2)+(t.getDay()*3)+(t.getMinutes()*4) )).success(function (data) {
					
				 
					var prm=data;					 			
					console.log(prm);
					
					_evlCmd='this.levelID='+prm.id+';this.levelNo="'+prm.num+'";this.loadlevel("'+prm.LevelMap+'");this._levelBackup=this.copyArray(level);this._l_mode=1;this.init2();';
					
					if (prm.SolHist && prm.SolHist!="")
						_evlCmd +="this._solutionHistoryStr='"+prm.SolHist+"';";
					 _el('#level_panel').classList.remove('show');
					
				})
				.error(function (data) {

				});
		  
		}
	},
	setL: function () {
		
	},
	historyArr:[],//cozumden gelen hsitory
	histIndex:0,
	loadHistory: function(his){
		this.historyArr=his.toString().split('');
		this.histIndex=0;
	},
	
	startHistory: function () {
		if (this._solutionHistoryStr!='') {
			this.loadHistory(this._solutionHistoryStr);
			this.playHistory();
		}
		
	},
	playHistory:function () {
		//TODO interval yerine panda nın kendi timer i kullanılabilir
		
		if (this.historyArr && this.historyArr.length>0 && this.histIndex<this.historyArr.length) {			 
			
				var l=this.historyArr[this.histIndex];
				console.log('his',l,this.histIndex);
				this.histIndex++;
				switch(l.toLowerCase()) {
					case 'u':
					this.checkMove(0, -1);
					break;
					
					case 'r':
					this.checkMove(1, 0);
					break;
					
					case 'l':
					this.checkMove(-1, 0);
					break;
					
					case 'd':
					this.checkMove(0, 1);
					break;
					
				}
				setTimeout(function () {
					_evlCmd='this.playHistory();';
				
				},500);
				
			 
		} else {			
		   
			   if (this.histIndex>0 &&  this.historyArr.length) {
				   this.histIndex=0;
				   this.historyArr=[];
			   }
		    
		}
		
	}
        
    });

});

window.onload = function(){    
	
     window.addEventListener("resize", resize, false);
	//disableScroll();	

		getLevels();
		document.querySelector('#btn_level_preview').addEventListener('click',function() {
			this.classList.toggle('user_level_prev_up_w');
			toggleClass('#level_panel_cont ul','show');
		},false);
		
		document.getElementById('level_range').onchange=function() { 
			getLevels();
		
		}
	
};

function getLevels() {
		atomic.get('_l_list.php?range='+document.getElementById('level_range').value)
		.success(function (data) {
				document.getElementById('level_panel_cont').innerHTML=data;
					document.querySelectorAll('#level_panel_cont .user_level_prev_down').forEach(function(el){el.addEventListener('click',function() {
						
						this.classList.toggle('user_level_prev_up');
						this.parentNode.parentNode.children[1].classList.toggle('show');
					},false);});
					
					document.querySelectorAll('.level_select').forEach(function(el){el.addEventListener('click',function() {
					  var level_id=this.getAttribute('level-id')*1;	
					 	
						if (level_id>0) 
							game.scene.getSelLevel(level_id);
					},false);});
		
		})
		.error(function (data) {

		});
}

var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}


var supportsPassive = false;
try {
  window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
    get: function () { supportsPassive = true; } 
  }));
} catch(e) {}

var wheelOpt = supportsPassive ? { passive: false } : false;
var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

// call this to Disable
function disableScroll() {
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}




function _el(selector) {
	 return document.querySelector(selector);
}


function resize() {

    var canvas = document.querySelector("canvas");
//https://www.html5gamedevs.com/topic/42391-hiresratio-question/
    var windowWidth = window.innerWidth-40;
    var windowHeight = window.innerHeight-50;
    var windowRatio = windowWidth / windowHeight;
	var gameW=game.scene.gameArea.width;
	var gameH=game.scene.gameArea.height;
	
	
	if (gameW>windowWidth || gameH>windowHeight) {
		var zoom=0.99;
		console.log(gameW,windowWidth);
		while ( (game.scene.gameArea.width>windowWidth) || (game.scene.gameArea.height>windowHeight) )  {
			game.scene.gameArea.scale.set(zoom);
			zoom=zoom-0.01;
			//console.log(zoom);
		}
		 
		
		
	}
	
		
	 
}

function toggleClass(selector,className) {
	   var elements = document.querySelectorAll(selector);
		Array.prototype.forEach.call(elements, function(el, i){
		el.classList.toggle(className);
	});
}	

