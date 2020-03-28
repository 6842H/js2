
var url_stat='https://b.edu.51cto.com/unicom/video/play/log-wejob';
var url_auth='https://b.edu.51cto.com/unicom/video/play/api-wejob';
var url_course_list='https://b.edu.51cto.com/unicom/wejob/ajax-get-wejob-course-list';
var url_course_detail='https://b.edu.51cto.com/unicom/wejob/ajax-get-wejob-course-detail';
var url_prepare='https://b.edu.51cto.com/unicom/course/wejob-video';
var r = window.navigator.userAgent;
var br=(-1 < r.indexOf("Opera") ? "Opera" : -1 < r.indexOf("Firefox") ? "FF" : -1 < r.indexOf("Chrome") ? "Chrome" : -1 < r.indexOf("Safari") ? "Safari" : -1 < r.indexOf("compatible") && -1 < r.indexOf("MSIE") && !isOpera ? "IE" : void 0);
var os=r.indexOf("Windows") ? "Windows" : "other";
var i = {
	f: null,
	m: "time",
	ref: location.href,
	os: os,
	br: br,
	fp: 0,		
	cdn: 'auto',
	def: 'auto',
	switchDef: 'auto',
	ver: 'v2.1.0-20190709',
	platform: 4,
};


function get_course_list(wejob_id){
	var course_list=[];
	parent.$.ajax({  
		async : false,  
		type : 'post',  
		url : url_course_list,  
		data : {
			'wejob_id':wejob_id
		}, 
		dataType: "json",		
		success : function(e){
			if(e.message=='success'){
				var data=e.data.data;
				for(var i=0; i<data.length; i++){
					if(data[i].study_progress_info.study_progress!=100){
						course_list.push({
							wejob_id:data[i].train_id, 
							train_course_id:data[i].train_course_id,
							lesson_num:data[i].lesson_num,
							course_name:data[i].course_name
						});
					}					
				}
			}		
		}  
	});  
	return course_list;
}

function get_course_detail(course_list){
	var course_detail=[];
	var pre_course_detail=[];
	var temp=[];
	for(var k=0;k<course_list.length; k++){
		parent.$.ajax({  
			async : false,  
			type : 'post',  
			url : url_course_detail,  
			data : {
				'wejob_id':course_list[k].wejob_id,
				'module_id':course_list[k].train_course_id,
				'page': '1',
				'page_size':course_list[k].lesson_num+2
			}, 
			dataType: "json",		
			success : function(e){
				if(e.data.data[0].hasOwnProperty('list')){
					var data=e.data.data;
					for(var i=0; i<data.length; i++){
						var list=data[i].list;
						for(var j=0; j<list.length; j++){
							if(list[j].study_progress_info.study_progress!=100){
								course_detail.push({
									chapter_id:list[j].chapter_id, 
									lesson_id:list[j].lesson_id,
									duration:list[j].duration
								});
							}					
						}				
					}
					pre_course_detail.push({
						chapter_id:list[0].chapter_id, 
						lesson_id:list[0].lesson_id,
						duration:list[0].duration
					});
				}else{
					var list=e.data.data;
					for(var i=0; i<list.length; i++){
						if(list[i].study_progress_info.study_progress!=100){
							course_detail.push({
								chapter_id:list[i].chapter_id, 
								lesson_id:list[i].lesson_id,
								duration:list[i].duration
							});
						}			
					}
					pre_course_detail.push({
						chapter_id:list[0].chapter_id, 
						lesson_id:list[0].lesson_id,
						duration:list[0].duration
					});
				}
			}  
		}); 
	}	 
	temp[0]=course_detail;
	temp[1]=pre_course_detail;
	return temp;
}

function prepare(wejob_id, lesson_id){
	var temp=null;
	parent.$.ajax({  
		async : true,  
		type : 'get',  
		url : url_prepare,  
		data : {
			'wejob_id':wejob_id,
			'lesson_id':lesson_id
		}, 				
		success : function(e){
			temp=1;	
		}  
	});  
	return temp;
}

function heart_beat3(uid, uuid, lessonId, dt, interval=20, step_now=0, step=10){
	var ht=Math.ceil(step_now/step)*dt;
	var T=(new Date).getTime()+ht*1000;
	var ext={
		id: lessonId,
		uid: uid,
		uuid: uuid,
		dt: dt,
		htime: ht,
		pt: ht,
		t: T,
		sgin: parent.fake("" + T + ht + dt + ht + "eDu_51Cto_siyuanTlw").toString()
	};
	try{
		parent.$.ajax({  
			async : 1,  
			type : 'get',  
			url : url_stat,  
			data : parent.$.extend({}, i, ext),
			success: function(e){window.steps -=1;},
			error:function(e){window.steps -=1;}
		});  
	}catch(err){
	};
	if(step_now!=step){setTimeout(function(){heart_beat3(uid, uuid, lessonId, dt, interval, step_now+1, step);}, interval);}
	else{window.clc -= 1;};
}

function get_uid(lessonId){
	var uid=null;
	parent.$.ajax({  
		async : false,  
		type : 'get',  
		url : url_auth,  
		data : {
			sign: parent.fake(lessonId + 'eDu_51Cto_siyuanTlw').toString(),
			lesson_id: lessonId
		}, 
		dataType: "json",		
		success : function(e){  
			uid=e.uid;
		}  
	});  
	return uid;
}

function check_clc(){
	if(window.clc<1){
		alert('所有请求已发出，请勿刷新页面');;
	}else{setTimeout(function(){check_clc();}, 1000);};
};

function check_steps(){
	if(window.steps<1){		
		alert('刷课完成，如仍有未结课程，请重新运行脚本');
		location.reload(true);
	}else{setTimeout(function(){check_steps();}, 1000);}
};

function get_wejob_id(){
	var src=parent.$('#mainiframe').prop('src').split('/');
	return src[src.length-2];
};

function widt3(interval=5, step=10){
	var wejob_id=get_wejob_id();
	if(!wejob_id){alert('初始化失败1');return;}
	
	var course_list=get_course_list(wejob_id);
	if(course_list.length==0){alert('无未结课程');return;};
	
	var temp=get_course_detail(course_list);
	if(temp[0].length==0 || temp[1].length==0){alert('初始化失败2');return;};
	var course_detail=temp[0];
	var pre_course_detail=temp[1];
	
	var uid=get_uid(pre_course_detail[0].lesson_id);
	if(!uid){alert('初始化失败3');return;};
	
	window.steps=step*course_detail.length;
	window.clc=course_detail.length;
	
	for(var i=0;i<pre_course_detail.length; i++){
		prepare(wejob_id, pre_course_detail[i].lesson_id);
	};
	for(var i=0;i<course_detail.length;i++){
		var uuid=parent.fake("" + (new Date).getTime() + uid + Math.random()).toString();
		heart_beat3(uid, uuid, course_detail[i].lesson_id, course_detail[i].duration, interval, 0, step);
	};
	check_clc();
	check_steps();
};widt3();
