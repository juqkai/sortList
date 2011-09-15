
(function($){
	$.juqkai = $.juqkai || {varsion:'0.1'};
	
	$.juqkai.SortList = {
		conf: {
			name:""			//提交时的名字
			,isSort: true		//是否排序
			,items: {}			//要显示的数据,默认类型为{val:text,val:text},请保存val唯一
			,arrays:[]			//数据数组
			,valField:"val"		//数组模式下取那个字段的值做为'值'
			,textField:"text"	//数组模式下取那个字段的值做为'文本'
			,isAjax:false		//是否是AJAX请求数据
			,ajaxUrl: ""		//ajax请求的URL地址,参数也写在这里面
			,ajaxType: 0		//ajax返回的数据类型,0:键值对,1:数组,如果为数组,刚需要填写valField,textField属性
			,ajaxSingle: true	//ajax请求次数
			//,dest:{}			//操作对象
			,single:true		//模式选择,true为单选模式,false为多选模式
			,selectClose:true	//在单选模式下是否选中就关闭面板
			,selectItems:{}		//多选模式下,被选中的数据,键值对
			,title:"字母排序列表"				//sortList面板的title信息
			,handle:function(selectItems){}		//多选处理器,当使用多选模式,点击确定后,会将选中的项通过这个回调函数进行处理,其中selectItems为被选中的数据,键值对
			,style:{									//样式
				top:""							//top
				,left:""							//left
			}
		}
	};
	
	//渲染
	function SortRender(){
		var conf = {};
		//$.extend(this,
		var sr = {
			conf: {},
			//生成HTML
			createHtml:function(){
				var close = $('<div id="sortList_close">&times;</div>');
				var title = $('<div id="sortList_title"></div>');
				title.append("this is test");
				var main = $('<div id="sortList_panel"></div>');
				var content = $('<div id="sortList_content"></div>');
				//解决IE中不能使用min-width的BUG
				var minwidth = $('<span id="sortList_min_width"></span>');
				content.append(minwidth);
				var notsort = $('<span id="sortList_content_notsort"></span>');
				content.append(notsort);
				content.append(makeList("c_m_"));
				var menu = $('<div id="sortList_menu"></div>');
				
				var sbtn = $('<div id="sortList_btn"></div>');
				
				var sitem = $('<div id="sortList_selectItem"></div>');
				menu.append(sitem);
				menu.append(makeList("m_"));
				
				main.append(content);
				main.append(menu);
				
				var clsbtn = $('<a href="javascript:void(0);">清除</a>');
				var okbtn = $('<a href="javascript:void(0);">确定</a>');
				sbtn.append(clsbtn);
				sbtn.append(okbtn);
				var sortlist = $('<div id="sortList"></div>');
				sortlist.append(close);
				sortlist.append(title);
				sortlist.append(main);
				sortlist.append(sbtn);
				
				$("body").append(sortlist);
				
				var sort = this;
				
				sort.tag = sort.tag || {};
				sort.tag.close = close;
				sort.tag.title = title;
				sort.tag.main = main;
				sort.tag.content = content;
				sort.tag.minwidth = minwidth;
				sort.tag.notsort = notsort;
				sort.tag.menu = menu;
				sort.tag.sitem = sitem;
				sort.tag.sbtn = sbtn;
				sort.tag.clsbtn = clsbtn;
				sort.tag.okbtn = okbtn;
				sort.tag.sortlist = sortlist;
				
				sort.linkage();
				sort.bindEvent();
			},
			//绑定事件
			bindEvent: function(){
				var sort = this;
				var close = sort.tag.close;
				close.click(function(){
					sort.hideSortList();
				});
				close.mouseover(function(){
					close.css("background-color", "#D9504E");
					close.css("border", "1px solid #617087");
					close.css("color", "#fff");
				});
				close.mouseout(function(){
					close.css("background-color", "");
					close.css("border", "");
					close.css("color", "");
				});
				
				sort.tag.content.find("li:visible:even").addClass("sortList_content_hightLight");
			},
			//联动
			linkage: function(){
				var sort = this;
				var menu = sort.tag.menu;
				var sitem = sort.tag.sitem;
				var content = sort.tag.content;
				menu.find("li").mouseover(function(){
					var li = $(this);
					if(sort.selectItem != li.attr("id")){
						sort.selectItem = li.attr("id");
						sort.tag.sitem.show();
						var top = li.attr("offsetTop");
						sitem.html(li.clone(true));
						sitem.css("top",top - 4);
						
						var lio = $("#c_" + li.attr("id"));
						if(lio.css("display") == "none"){
							return;
						}
						
						var itemTop = lio.attr("offsetTop");
						content.attr("scrollTop", itemTop);
					}
				});
			},
			
			//根据
			init: function(cf){
				conf = cf;
				sort = this;
				sort.baseConfig();
				sort.restore();
				sort.fullSortList();
				var sortlist = sort.tag.sortlist; 
				sortlist.show();
				
				if(conf.single){
					this.singleModel();
				}else{
					this.multiSelect();
				}
				//隔行高亮样式
				sort.tag.content.find("li:visible:even").addClass("sortList_content_hightLight");
			},
			
			//基础配置
			baseConfig: function(){
				var sort = this;
				//表头信息
				sort.tag.title.html(conf.title);
				var sortlist = sort.tag.sortlist;
				
				var offset = conf.dest.offset();
				if(conf.style.top == ""){
					var height = conf.dest.outerHeight();
					sortlist.css("top",offset.top + height);
				} else {
					sortlist.css("top",conf.style.top);
				}
				if(conf.style.top == ""){
					sortlist.css("left",offset.left);
				} else {
					sortlist.css("left",conf.style.left);
				}
			},
			//还原成初始状态
			restore: function(){
				var sort = this;
				//删除所有li下面的数据
				sort.tag.content.find("div").remove();
				var li = sort.tag.content.find("li").removeClass("sortList_content_hightLight");
				li.hide();
				var menu = sort.tag.menu;
				menu.show();
			},
			//根据conf.items的值填充列表
			fullSortList:function(){
				var items = conf.items;
				for(var val in items){
					var text = items[val];
					if(!val || !text){
						continue;
					}
					var item = $("<div id='sort_item_"+val+"' class='sort_item'>"+text+"</div>");
					if(!conf.isSort){
						var notsort = sort.tag.notsort;
						notsort.append(item);
						notsort.show();
						var menu = sort.tag.menu;
						menu.hide();
						continue;
					}
					var py = makePy(text.charAt(0))[0];
					var li = $("#c_m_" + py);
					li.append(item);
					li.show();
				}
			},
			//隐藏
			hideSortList: function(){
				this.tag.sortlist.hide();
			},
			//单选模式
			singleModel: function(){
				var sort = this;
				var clsbtn = sort.tag.clsbtn;
				var okbtn = sort.tag.okbtn;
				clsbtn.click(function(){
					sort.clearSingleModel();
				});
				okbtn.click(function(){
					sort.hideSortList();
				});
				
				var divs = sort.tag.content.find("div");
				var dest = conf.dest;
				divs.click(function(){
					var div = $(this);
					var val = div.attr("id");
					val = val.split("sort_item_")[1];
					var text = div.html();
					sort.clearSingleModel();
					dest.val(text);
					dest.after("<input type='hidden' name='"+conf.name+"' value='"+val+"'/>");
					if(conf.selectClose){
						sort.hideSortList();
					}
					conf.selectItems = {};
					conf.selectItems[val] = text;
					conf.handle(conf.selectItems);
				});
			},
			clearSingleModel: function(){
				conf.dest.val("");
				var hid = conf.dest.next();
				if(hid.attr("type") == 'hidden'){
					hid.remove();
				}
			},
			//多选模式
			multiSelect:function(){
				var sort = this;
				var divs = sort.tag.content.find("div");
				sort.tag.okbtn.click(function(){
					sort.OkBtn();
				});
				sort.tag.clsbtn.click(function(){
					sort.clearMultiModel();
				});
				
				$.each(conf.selectItems, function(key, val){
					$("#sort_item_" + key).addClass("sortList_content_selected");
				});
				
				divs.click(function(){
					var div = $(this);
					var val = div.attr("id");
					val = val.split("sort_item_")[1];
					var text = div.html();
					
					if(div.data("select") == true){
						//点两次,就删除节点
						delete conf.selectItems[val];
						sort.clearSelectItem(div);
						return;
					}
					div.data("select",true);
					div.addClass("sortList_content_selected");
					
					conf.selectItems[val] = text;
				});
			},
			OkBtn: function(){
				var sort = this;
				conf.handle(conf.selectItems);
				sort.hideSortList();
			},
			//多选模式下的清除
			clearMultiModel: function(){
				conf.selectItems = {};
				var sort = this;
				this.tag.content.find("div").each(function(i){
					sort.clearSelectItem($(this));
				});
			},
			//清除选中项
			clearSelectItem: function(item){
				item.removeClass("sortList_content_selected");
				item.removeData("select");
			}
		};
		
		var single;
		function me(conf){
			if(!single){
				sr.createHtml();
				single = true;
			}
			sr.init(conf);
		}
		return {init:me};
	}
	
	
	//注意这个必须是单列的
	$.juqkai.sortRender = SortRender();
	
	function SortList(conf){
		var self = this;
//		conf = cf;
		if(!conf.dest){
			return;
		}
		//设置提交名 
		if(!conf.name || conf.name == ""){
			if(!conf.dest.attr("name")){
				conf.dest.after("<span>请设置控件的name属性!</span>");
				conf.dest.val("请设置控件的name属性!");
				return;
			}
			conf.name = conf.dest.attr("name");
		}
		conf.dest.attr("name", "");
		
		
		
		$.extend(self,{
			ajaxRequest:function(){
				if(conf.ajaxSingle){
					conf.isAjax = false;
				}
				var url = conf.ajaxUrl;
				var type = conf.ajaxType;
				
				$.ajax({
					url:url,
					async: false,
					dataType:"json",
					type: "get",
					success:function(e){
						//e = eval("("+e+")");
						if(conf.ajaxType == 0){
							conf.items = e; 
						}else {
							conf.arrays = e;
						}
						self.dataConver();
					}
				});
			},
			//数据转换,将数组数据转换成键值对的形式
			dataConver: function(){
				if(conf.arrays.length <= 0){
					return conf.items;
				}
				var arrays = conf.arrays;
				for(var i in arrays){
					var val = arrays[i][conf.valField];
					var text = arrays[i][conf.textField];
					conf.items[val] = text;
				}
				conf.arrays = [];
			},
			//取得数据
			fetchData : function(){
				if(conf.isAjax){
					//ajax请求
					self.ajaxRequest();
					return;
				}
				//转换数据
				self.dataConver();
			},
			//目标控件事件
			destEvent: function(){
				var dest = conf.dest; 
				dest.attr("readonly","readonly");
				dest.click(function(){
					self.fetchData();
					$.juqkai.sortRender.init(conf);
				});
			}
		});
		self.destEvent();
	}
	
	
	
	function makeList(prefix){
		var mul = $("<ul></ul>");
		for(var i = 65; i <91; i++){
//			for(var i = 97; i <122; i++){
			mul.append("<li id='"+prefix + "&#" + i+"'><p>&#"+i+"</p></li>");
		}
		return mul;
	}
	function makeListForDiv(prefix){
		var mul = $("<div></div>");
		for(var i = 65; i <91; i++){
//			for(var i = 97; i <122; i++){
			mul.append("<div id='"+prefix + "&#" + i+"'>&#"+i+"</div>");
		}
		return mul;
	}
	
	$.fn.SortList = function(conf){
		//设置属性
		var el = $(this).data("sortList");
		if(el){
			$(this).unbind("click");
			$(this).removeData("sortList");
		}
		conf = $.extend(true,{dest:$(this)}, $.juqkai.SortList.conf, conf);
		var sl = new SortList(conf);
		$(this).data("sortList", sl);
		return sl;
	};
})(jQuery);