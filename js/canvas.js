		window.onload = function(){
			var canvas = document.getElementById('sen_draw');
			//开启画板
			draw.getDraw(canvas);
			// draw.pencil(canvas,'red');
			// 铅笔控件
			var pencil = document.querySelector('#draw>.nav_draw>.fn_nav:nth-child(2)');
			// 颜色空控件
			var penColor = document.querySelector('#draw>.nav_draw>.fn_nav>.color_nav');
			var colorBox = document.querySelector('#draw>.nav_draw>.fn_nav>.color_box');
			// console.log(colorBox);
			// 橡皮擦
			var eraser = document.querySelector('#draw>.nav_draw>.fn_nav:nth-child(4)');
			// console.log(eraser)
			// 路径宽度控件
			var pnwidth = document.querySelector('#draw>.nav_draw>.pnwidth');
			
			// 获取画笔对象
			var pen = draw.paint('pencil');
			// 获取橡皮对象
			var era = draw.paint('eraser');
			
			//判断此时启动的控件类型
			var typeJudge = null;
			
			// 点击启动画笔
			pencil.onclick = function(){
				typeJudge = 'pencil';
			}
			// 点击启动橡皮擦
			eraser.onclick = function(){
				typeJudge = 'eraser';
			}
			// 点击选择颜色
			penColor.onclick = function(e){
				e.stopPropagation();
				getColor();
				colorBox.classList.add('ative');
				// console.log(color);
			}
			window.onclick = function(e){
				colorBox.classList.remove('ative');
			}
			//颜色盘color_box中的li添加背景颜色
			var getColor = function(){
				var colorLi = document.querySelectorAll('#draw>.nav_draw>.fn_nav>.color_box>li');
				var colorArr = ['#ffffff','#000000','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff'];
				// var bgColor = '';
				for(var i=0; i<colorLi.length; i++){
					//设置li背景颜色
					colorLi[i].style.backgroundColor = colorArr[i];
					// 点击获取li颜色值
					colorLi[i].onclick = function(){
						var bgColor = this.style.backgroundColor;
						penColor.style.backgroundColor = bgColor;
						pnwidth.style.borderBottomColor = bgColor;
					}
				}
			}
			
			var width = 1;
			var pathWidth = 1;
			//获取路径粗细
			pnwidth.onclick = function(e){
				e.stopPropagation();
				if(pathWidth>6){
					pathWidth = 0;
					}
					pathWidth++;
					// console.log(pathWidth);
					this.innerText = pathWidth;
					this.style.borderBottom = pathWidth+3+'px solid';
					width = pathWidth;
					this.style.borderBottomColor = penColor.style.backgroundColor
				}
				
				
				let eventStar = null;
				let eventMove = null;
				let eventEnd = null;
				
				if(document.body.ontouchstart !== undefined){
					eventStar = 'touchstart';
					eventMove = 'touchmove';
					eventEnd = 'touchend';
				}else{
					eventStar = 'mousedown';
					eventMove = 'mousemove';
					eventEnd = 'mouseup';
				}
				/* 
				鼠标事件控制路径
			 */
			//鼠标按下事件
			var judge = false;
			canvas.addEventListener(eventStar,function(e){
				e.stopPropagation();
				judge = true;
				if(typeJudge == 'pencil'){
					// 执行画笔逻辑
					pen.width = width;
					// console.log(pen.width)
					pen.color = penColor.style.backgroundColor;
					pen.penStar(e);
				}else if(typeJudge == 'eraser'){
					//执行橡皮擦逻辑
					era.width = width;
					era.eraStar(e);
				}
			},false);
			//鼠标移动事件
			canvas.addEventListener(eventMove,function(e){
				e.stopPropagation();
				if(!judge) return;
				if(typeJudge == 'pencil'){
					// 执行画笔逻辑
					pen.penMove(e);
				}else if(typeJudge == 'eraser'){
					//执行橡皮擦逻辑
					era.eraMove(e);
				}
			},false);
			//鼠标抬起事件
			canvas.addEventListener(eventEnd,function(e){
				if(!judge) return;
				retime = 0;
				if(typeJudge == 'pencil'){
					// 执行画笔逻辑
					pen.penEnd(e);
				}else if(typeJudge == 'eraser'){
					//执行橡皮擦逻辑
					era.eraEnd(e);
				}
				judge = false;
			},false);
			//鼠标离开事件
			canvas.addEventListener('mouseout',function(e){
				e.stopPropagation();
				if(!judge) return;
				retime = 0;
				if(typeJudge == 'pencil'){
					// 执行画笔逻辑
					pen.penEnd(e);
				}else if(typeJudge == 'eraser'){
					//执行橡皮擦逻辑
					era.eraEnd(e);
				}
				judge = false;
			},false);
			
			var save = document.getElementById("dlimg");
			// 下载图片
			
			save.addEventListener(eventStar,function(e){
				canvas.toBlob(function(blob){
					var url = URL.createObjectURL(blob);
					var a = document.createElement('a');
					// 设置下载属性和文件名称
					a.download = 'CrazyLtS-'+(new Date()).getTime();
					// href指定为url
					a.href = url;
					a.click();
					// 下载后,提醒浏览器不需保持这个文件的引用
					URL.revokeObjectURL(url);
				})
				
			})
			// save.onclick = function(){
			// 	// console.log("nh")
			//     var imgUrl = canvas.toDataURL('image/png');
			//     var saveA = document.createElement('a');
			//     document.body.appendChild(saveA);
			//     saveA.href = imgUrl;
			//     saveA.download = 'CrazyLtS-'+(new Date).getTime();
			//     saveA.target = '_blank';
			//     saveA.click();
			// }
			
			/* 垃圾桶控件 */
			var trash = document.getElementById('trash');
			trash.onclick = function(){
				era.clrDraw();
			};
			
			/* 后一步,前一步 */
			var retime = 0;
			var reback = document.getElementById('reback');
			var forward = document.getElementById('forward');
			//后一步
			reback.onclick = function(){
				retime++;
				draw.reback(retime);
				if(retime>10){
					retime = 10;
				}
			}
			// 前一步
			forward.onclick = function(){
				retime--;
				draw.reback(retime);
				if(retime<0){
					retime = 0;
				}
			}
			// trash.onclick = function(){
			// 	retime++;
			// 	console.log(retime);
			// 	draw.reback(retime);
			// }
		}