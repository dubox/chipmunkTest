var SPRITE_WIDTH = 50;
var SPRITE_HEIGHT = 50;
var DEBUG_NODE_SHOW = true;
var gravityBase = 100;//重力加速度系数


var HelloWorldLayer = cc.Layer.extend({
    sprite:null,
    ctor:function(){
        //////////////////////////////
        // 1. super init first
        this._super();
        var that = this;
        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        // add a "close" icon to exit the progress. it's an autorelease object
        var closeItem = new cc.MenuItemImage(
            res.CloseNormal_png,
            res.CloseSelected_png,
            function () {
                cc.log("Menu is clicked!");
            }, this);
        closeItem.attr({
            x: size.width - 20,
            y: 20,
            anchorX: 0.5,
            anchorY: 0.5
        });

        var menu = new cc.Menu(closeItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 1);

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38,cc.size(SPRITE_WIDTH,SPRITE_HEIGHT));
        // position the label on the center of the screen
        //helloLabel.x = size.width / 2;
        //helloLabel.y = size.height / 2;
        // add the label as a child to this layer
        //this.addChild(helloLabel, 5);

        // add "HelloWorld" splash screen"
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2,
            scale: 0.5,
            rotation: 180
        });
        //this.addChild(this.sprite, 0);

        this.sprite.runAction(
            cc.sequence(
                cc.rotateTo(2, 0),
                cc.scaleTo(2, 1, 1)
            )
        );
      
        
        this.initPhysics();
        
        
        var p = cc.p(size.width / 2,size.height / 2);
        //addNewSpriteAtPosition(location);
        //var body = new cp.Body(1, cp.momentForBox(1, SPRITE_WIDTH, SPRITE_HEIGHT)); 
        var body = new cp.Body(15, cp.momentForCircle(4, 1, 1,{x:0,y:0})); 
        body.setPos(p);    
        body.setAngVel(20);	//初始角速度
        body.setVel({x:10,y:10});	//初始线速度 
        this.space.addBody(body);                                          


        //var shape = new cp.BoxShape(body, SPRITE_WIDTH, SPRITE_HEIGHT);    
        
        
        //body  半径    body在shape中的位置
        var shape = new cp.CircleShape(body, 20, {x:0,y:0});
        shape.setElasticity(0.8);  //弹性
        shape.setFriction(33.2);  //摩擦力
        shape.setCollisionType(2);  //设置形状的碰撞类别，默认所有形状都是类别0
        this.space.addShape(shape);              

        /**
        setInterval(function(){

        	cc.log('2');
        	body.setAngVel(10);	//初始角速度（自转）
        	body.setVel({x:430*Math.random()-200,y:40});	//初始速度
        },2000);
        
        **/
        cc.inputManager.setAccelerometerEnabled(true);	//开启加速计设备
        //监听加速度事件  （当手机静止时还有重力加速度   acc的值 以重力加速度为1 即手机静止平放时 acc.z=1<理想状态>）
        cc.eventManager.addListener(cc.EventListener.create({
        	event: cc.EventListener.ACCELERATION,
        	callback: function(acc , event){
        		//这里处理逻辑
        		//trace(acc);
        		//trace(event);
        		//body.setVel({x:acc.x,y:acc.y});
        		that.space.gravity = cp.v(acc.x * gravityBase, acc.y * gravityBase);
        	}
        }),this);
        
        
        cc.log(cp);
        

        //创建物理引擎精灵对象  
        var sprite = new cc.PhysicsSprite(res.CloseNormal_png);                          
        sprite.setBody(body);                                             
        sprite.setPosition(cc.p(p.x, p.y));                                          
        this.addChild(sprite);       
        //this.addChild(sprite.clone());       
        
        //碰撞监听 
        /***
         * 	begin():该步中两个形状刚开始第一次接触。回调返回 true 则会处理正常碰撞，返回 false Chipmunk会完全忽略碰撞。如果返回false，则 preSolve() 和 postSolve() 回调将永远不会被执行，但你仍然会在形状停止重叠的时候接收到一个单独的事件。
			preSolve():该步中两个形状相互接触。回调返回 false Chipmunk在这一步会忽略碰撞，返回 true 来正常处理它。此外，你可以使用 cpArbiterSetFriction() ， cpArbiterSetElasticity() 或 cpArbiterSetSurfaceVelocity() 来提供自定义的摩擦，弹性，或表面速度值来覆盖碰撞值。更多信息请查看cpArbiter。
			postSolve():两种形状相互接触并且它们的碰撞响应已被处理。如果你想使用它来计算音量或者伤害值，这时你可以检索碰撞冲力或动能。更多信息请查看cpArbiter。
			separate():该步中两个形状刚第一次停止接触。确保 begin() / separate() 总是被成对调用，当删除接触中的形状时或者析构space时它也会被调用。
         * 
         */
        this.space.addCollisionHandler( 1, 2,
        		this.collisionEvent.Begin,
        		this.collisionEvent.PreSolve,
        		this.collisionEvent.PostSolve,
        		this.collisionEvent.Separate
        );
        
        
        
        this.scheduleUpdate();  //调用update函数
        
        return true;
    },
    collisionEvent:{
    	
    	Begin:function(arbiter, space){
    		//trace(arbiter)
    		cc.audioEngine.playEffect(res.ding);
    		//return false;
    		return true;	//在web中是必须的 否则碰撞失效（相当于默认return false） 下同
    	},
    	PreSolve:function(){return true;},
    	PostSolve:function(){return true;},
    	Separate:function(){return true;},
    	
    },
    
    initPhysics: function(){


    	var winSize = cc.winSize;  


    	this.space = new cp.Space();                                  
    	this.setupDebugNode();                                         


    	// 设置重力  
    	//this.space.gravity = cp.v(-20, 50);                                    
    	var staticBody = this.space.staticBody;                              


    	// 设置空间边界  (墙)
    	
    	var wall_bottom = new cp.SegmentShape(staticBody, cp.v(0, 0), cp.v(winSize.width, 0), 20);
    	var wall_top = new cp.SegmentShape(staticBody, cp.v(0, winSize.height), cp.v(winSize.width, winSize.height),20);
    	var wall_left = new cp.SegmentShape(staticBody, cp.v(0, 0), cp.v(0, winSize.height), 20);
    	var wall_right = new cp.SegmentShape(staticBody, cp.v(winSize.width, 0), cp.v(winSize.width, winSize.height), 20);
    	
    	var walls = [ wall_bottom,wall_top ,wall_left ,wall_right];  
    	for (var i = 0; i < walls.length; i++) {  
    		var shape = walls[i];  
    		shape.setElasticity(1);                                         
    		shape.setFriction(1);                                            
    		shape.setCollisionType(1);                                            
    		this.space.addStaticShape(shape);                            
    	}
    },
    setupDebugNode: function () {
    	this._debugNode = new cc.PhysicsDebugNode(this.space);                  
    	this._debugNode.visible = DEBUG_NODE_SHOW;                           
    	this.addChild(this._debugNode);                                     
    },
    addNewSpriteAtPosition: function(p){
    	cc.log("addNewSpriteAtPosition");
    	
    	
    	var body = new cp.Body(0.05, cp.momentForBox(2, SPRITE_WIDTH, SPRITE_HEIGHT)); 
    	body.setPos(p);
    	this.space.addBody(body);
    	
    	
    	shape = new cp.BoxShape(body, SPRITE_WIDTH, SPRITE_HEIGHT);
    	shape.setElasticity(0.5);
    	shape.setFriction(0.5);
    	this.space.addShape(shape);
    	
    	
    	
    	
    	
    	//创建物理引擎精灵对象
    	var sprite = new cc.PhysicsSprite(res.BoxA2_png);
    	sprite.setBody(body);
    	sprite.setPosition(cc.p(p.x, p.y));
    	this.addChild(sprite);
    },
    update: function(dt){
    	var timeStep = 0.09; // cc.log(timeStep)                                          
    	this.space.step(timeStep);
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function(){
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});


var trace = function(s) {
	var ss = '';
	if(typeof s == 'object' || typeof s == 'array'){


		function d(_s,tag){
			if(!tag)tag = '';
			//if(!ss)ss = '';
			for(var i in _s){
				if(typeof _s[i] == 'object' || typeof _s[i] == 'array'){
					ss += tag+(i+' : \n\r');
					d(_s[i],'-'+tag);
				}else{
					if(typeof _s[i] == 'undefined') _s[i] = 'undefined';
					ss += tag+(i+' : '+_s[i].toString()+'\n\r');
				}
			}
			//return ss;
		}
		d(s);

		ss = '\n\r'+ss;
		//cc.log(ss);
	}else{
		ss = s.toString();

	}
	cc.log(ss);

};
