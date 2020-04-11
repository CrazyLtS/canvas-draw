+(function(w){
	var draw = {};
	var ctx = null;
	var canvas = null;
	// traces 用于储存画布痕迹
	var traces = [];
	var retime = 0;
	var rejudge = false;
	draw.type = '';
	/* 启动画布和获取画布*/
	draw.getDraw = function(obj){
		if(obj.getContext){
			ctx = obj.getContext('2d');
			// alert("sdf")	
			resetSize(obj);
			function resetSize(obj){
				// console.log(obj);
				var imgData = ctx.getImageData(0,0,obj.width,obj.height);
				obj.width = obj.parentNode.clientWidth;
				obj.height = obj.parentNode.clientHeight - obj.offsetTop;
				ctx.fillStyle = '#fff'
				ctx.fillRect(0,0,obj.width,obj.height);
				// console.log(obj.width)
			}
			ctx.fillStyle = '#fff'
			ctx.fillRect(0,0,obj.width,obj.height);
			window.onresize = function(){
				resetSize(obj);
			}
		}
		canvas = obj;
	}
	
	/* 绘画函数 */
	draw.paint = function(type){
					
		/* 铅笔描绘路径函数 */
		var pencil = {
			//路径粗细
			width:2,
			//路径颜色
			color:'black',
			//路径起点
			beginAxis:null,
			// 路径坐标点集合
			points:[],
			// 画笔开始函数
			penStar:function(e){
				// 判断是否测回后重新绘画
				if(rejudge){
				traces.splice(0,retime);
				// console.log(traces.length);
				}
				rejudge = false;
				
				// 路径颜色,颜色需放在前面,否则会出现颜色重叠问题
					// 设置路径的属性
					ctx.lineWidth = this.width*3;
					ctx.lineJoin = 'round';
					ctx.lineCap = 'round';
					ctx.fillStyle = this.color;
					ctx.strokeStyle = this.color;
				// 获取鼠标按下的坐标点,作为路径的开始坐标点
					var xy = getAxis(e);
					this.points.push(xy);
					this.beginAxis = xy;
			},
			// 画笔移动函数
			penMove:function(e){
				    var xy = getAxis(e);
				    this.points.push(xy);
					//判断数组中是否已经有三个坐标点以上,绘制路径
				    if (this.points.length > 3) {
						// 获取数组最后的两个坐标,进行路径描绘
				        var lastTwoPoints = this.points.slice(-2);
						// 以最后两个坐标的第一个为控制点
				        var controlPoint = lastTwoPoints[0];
						// 以最后连个点的中间点为最后的路径坐标点
				        var endPoint = {
				            x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
				            y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
				        }
						//描绘路径
				        drawLine(this.beginAxis, controlPoint, endPoint);
				        this.beginAxis = endPoint;
				    }
			},
			// 画笔结束函数
			penEnd:function(e){
					   var xy = getAxis(e);
					   this.points.push(xy);
									// console.log('ni')
					   if (this.points.length > 3) {
					       var lastTwoPoints = this.points.slice(-2);
					       var controlPoint = lastTwoPoints[0];
					       var endPoint = lastTwoPoints[1];
					       drawLine(this.beginAxis, controlPoint, endPoint);
					   }
					   beginAxis = null;
					   this.points = [];
					   
					   // 鼠标抬起,储存画布
					   saveCanvas();
			},
		};
		
		/* 
			橡皮擦擦除路径函数 
		*/
		// 圆形橡皮擦函数,使用clip()裁剪,清除裁剪后的区域
		var arcEraser = {
			// 橡皮大小
			width:2,
			starAxis:{},
			//crtEraser创建裁剪区域,形成圆形橡皮擦
			crtEraser:function(e){
				ctx.save();
				ctx.beginPath();
				//创建一个鼠标坐标位置为圆心，的圆的裁剪区域
				ctx.arc(this.starAxis.x,this.starAxis.y,this.width*2,0,Math.PI*2);
				ctx.clip();
				// 将裁剪后的内容清除
				ctx.clearRect(0,0,canvas.width,canvas.height);
				//恢复裁剪前的画布状态，消除裁剪状态
				ctx.restore();
			},
			// 橡皮擦开始
			eraStar:function(e){
				// 判断是否测回后重新绘画
				if(rejudge){
				traces.splice(0,retime);
				// console.log(traces.length);
				}
				rejudge = false;
				
				// 记录橡皮擦开始时的坐标
				this.starAxis = getAxis(e);
				this.crtEraser(e);
			},
			// 橡皮擦进行中
			eraMove:function(e){
				//记录鼠标移动时的坐标
				var moveAxis = getAxis(e);
				this.crtEraser(e);
				// 清除因为鼠标移动过快,未能清除的矩形区域
				// 计算矩形区域的各个坐标点的位置
				var sinAxis = this.width*2*Math.sin(Math.atan((moveAxis.y - this.starAxis.y)/(moveAxis.x - this.starAxis.x)));
				var cosAxis = this.width*2*Math.cos(Math.atan((moveAxis.y - this.starAxis.y)/(moveAxis.x - this.starAxis.x)));
				var hasJudge = moveAxis.x - this.starAxis.x;
				var lbAxis = hasJudge == 0? {X:this.starAxis.x + this.width*2,Y:this.starAxis.y}:{X:this.starAxis.x + sinAxis, Y:this.starAxis.y - cosAxis};
				var rbAxis = hasJudge == 0? {X:moveAxis.x + this.width*2,Y:moveAxis.y}:{X:moveAxis.x + sinAxis, Y:moveAxis.y - cosAxis};
				var rtAxis = hasJudge == 0? {X:moveAxis.x - this.width*2,Y:moveAxis.y}:{X:moveAxis.x - sinAxis, Y:moveAxis.y + cosAxis};
				var ltAxis = hasJudge == 0? {X:this.starAxis.x - this.width*2,Y:this.starAxis.y}:{X:this.starAxis.x - sinAxis, Y:this.starAxis.y + cosAxis};
				// 将最后的坐标传递给开始的坐标,作为型区域的开始坐标
				this.starAxis = moveAxis;
				// 描绘矩形区域进行裁剪
				//保存画布状态
				ctx.save();
				ctx.beginPath();
				// 绘制裁剪区域
				ctx.moveTo(lbAxis.X,lbAxis.Y);
				ctx.lineTo(rbAxis.X,rbAxis.Y);
				ctx.lineTo(rtAxis.X,rtAxis.Y);
				ctx.lineTo(ltAxis.X,ltAxis.Y);
				ctx.closePath();
				//裁剪并清除区域中的内容
				ctx.clip();
				ctx.clearRect(0,0,canvas.width,canvas.height);
				// 恢复画布保存的状态
				ctx.restore();
			},
			// 橡皮擦结束
			eraEnd:function(e){
				//输入要处理的代码
				// 鼠标抬起,储存画布
				saveCanvas();
			},
			/*
					清屏功能 
				*/
			clrDraw : function(){
				// 防止画布有其他的裁剪,导致无法清屏
				ctx.beginPath();
				ctx.rect(0,0,canvas.width,canvas.height);
				ctx.clip();
				// 清屏
				ctx.clearRect(0,0,canvas.width,canvas.height);
				// 清除保存痕迹的数组
				traces = [];
			}
		}
		var saveCanvas = function(){
			// 获取画布内容
			var data = canvas.toDataURL();
			// 将画布内容加入到traces
			traces.unshift(data);
			// 删除最后一个画布内容
			if(traces.length>10){
				traces.length = 10;
			}
			// console.log(traces);
		}
		
		//描绘路径函数
		var drawLine = function(beginAxis, controlPoint, endPoint) {
				//beginPath()创建新路径
			    ctx.beginPath();
			    ctx.moveTo(beginAxis.x, beginAxis.y);
			    ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
			    ctx.stroke();
			    ctx.closePath();
			}
		
		
			//获取相对于画布的坐标位置
			var getAxis =function(e){
				if(document.body.ontouchstart !== undefined){
					return {
						x : e.changedTouches[0].clientX - canvas.offsetLeft,
						y : e.changedTouches[0].clientY - canvas.offsetTop
					}
				}else{
					return {
						x : e.clientX - canvas.offsetLeft,
						y : e.clientY - canvas.offsetTop
					}
				}
			}
			
			// // 描绘形状
			// draw.shape = {
			// 	// 直线开始
			// 		 lineStar:function(e){
			// 			 var starAxis = getAxis(e);
			// 			 ctx.beginPath();
			// 			 ctx.moveTo(starAxis.x,starAxis.y);
						 
			// 		 },
			// 	// 直线描绘中
			// 		lineMove:function(){
			// 			ctx.
			// 		},
			// 	// 直线结束
			// 		lineEnd:function(){
						
			// 		}
			// }
			
		//根据传入的参数,判断使用的功能,返回响应的功能对象
			// 返回参数
			switch (type){
				case 'pencil':
				return pencil;
						break;
				case 'eraser':
				return arcEraser;
						break;
				case 'shape':
				return shape;
						break;
				default:
					console.log('输入的功能类型有误,或未输入功能类型参数(type)');
					break;
			}
		}
		// 撤回
		draw.reback = function(index){
			if(index < traces.length && index > -1){
				var img = document.createElement('img');
				img.src = traces[index];
				img.onload = function(){
				// 清除画布
				ctx.clearRect(0,0,canvas.width,canvas.height);
				// 将数组中储存的canvas对象复制到画布上
				ctx.drawImage(img,0,0);
				retime = index;
				rejudge = true;
			}
			}else{
				alert("只能跳转到这里了哦!");
			}
			
		}
	/* 抛出接口 */
	w.draw = draw;
}(window))