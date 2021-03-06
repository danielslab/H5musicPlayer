// JavaScript Document
var input = document.getElementById('files');  
var songlist = document.getElementById('songlist');  
var song = songlist.innerHTML;  

var myAuto = document.getElementById('myaudio');  

input.onchange = function(e) {  
	var files = e.target.files; // FileList  
	var count = 0;  

	for (var i = 0, f; f = files[i]; ++i) {  
		//file  have .name   

	 var path = f.name  || f.webkitRelativePath ;    

		if (/.*\.mp3$/.test(path)) {  
			var url;  
			if (window.createObjectURL) {  
				url = window.createObjectURL(files[i])  
			} else if (window.createBlobURL) {  
				url = window.createBlobURL(files[i])  
			} else if (window.URL && window.URL.createObjectURL) {  
				url = window.URL.createObjectURL(files[i])  
			} else if (window.webkitURL  
					&& window.webkitURL.createObjectURL) {  
				url = window.webkitURL.createObjectURL(files[i])  
			}  

			if (count % 2 === 0) {  

				song += '<li class="song odd" ondblclick="changeSrc(event);setTitle(this);getComments()" ><input  type="hidden" value="'+url+'"/>'  
						+ path + '<div class="songTools"><img src="img/add.png" title="添加到" onclick="addSongToSheet(this)" /><img src="img/close.png" title="删除歌曲" onclick="deleteSong(this)" /></div></li>';  
			} else {  
				song += '<li class="song even" ondblclick="changeSrc(event);setTitle(this);getComments()" ><input  type="hidden"  value="'+url+'"/>'  
						+ path + '<div class="songTools"><img src="img/add.png" title="添加到" onclick="addSongToSheet(this)" /><img src="img/close.png" title="删除歌曲" onclick="deleteSong(this)" /></div></li>';  
			}  
			count++;
		}  
	}  
	songlist.innerHTML = song;  

} 

function selectMP3() {
	input.click();
}  
function changeSrc(event) {  

	event = event ? event : window.event;  
	var obj = event.srcElement ? event.srcElement : event.target;  
	$(obj).addClass("cur").siblings().removeClass("cur");  
	myAuto.src = obj.firstChild.value;  
	myAuto.play();  
	if(myAuto.muted){
		myAuto.muted = false;
		$('#volumeLogo').attr('src','img/SOUND PLUS.png');
	}

}  
function setTitle(e){
	var title = $(e).text();
	$("#songName").text(title);
}

//controller
var audio = document.getElementById("myaudio");

$('#audioPlayer').click(function () {
    if (audio.paused) {
        // 开始播放当前点击的音频
        audio.play();
        $('#audioPlayer').attr('src', 'img/pause.png');
    } else {
        audio.pause();
        $('#audioPlayer').attr('src', 'img/play.png');
    }
});

function getDuration(){
	$('#audioDuration').html(transTime(audio.duration));
	$('#audioPlayer').attr('src', 'img/pause.png');
}

// 监听音频播放时间并更新进度条
audio.addEventListener('timeupdate', function () {
    updateProgress(audio);
}, false);

/**
 * 更新进度条与当前播放时间
 * @param {object} audio - audio对象
 */
function updateProgress(audio) {
    var value = audio.currentTime / audio.duration;
    $('#progressBar').css('width', value * 100 + '%');
    $('#progressDot').css('left', value * 100 + '%');
    $('#audioCurTime').html(transTime(audio.currentTime));
}

function updateVolumeProgress(audio){
	var value = audio.volume;
    $('#progressBar_volume').css('width', value * 100 + '%');
    $('#progressDot_volume').css('left', value * 100 + '%');
}

/**
 * 音频播放时间换算
 * @param {number} value - 音频当前播放时间，单位秒
 */
function transTime(value) {
    var time = "";
    var h = parseInt(value / 3600);
    value %= 3600;
    var m = parseInt(value / 60);
    var s = parseInt(value % 60);
    if (h > 0) {
        time = formatTime(h + ":" + m + ":" + s);
    } else {
        time = formatTime(m + ":" + s);
    }

    return time;
}

/**
 * 格式化时间显示，补零对齐
 * eg：2:4  -->  02:04
 * @param {string} value - 形如 h:m:s 的字符串 
 */
function formatTime(value) {
    var time = "";
    var s = value.split(':');
    var i = 0;
    for (; i < s.length - 1; i++) {
        time += s[i].length == 1 ? ("0" + s[i]) : s[i];
        time += ":";
    }
    time += s[i].length == 1 ? ("0" + s[i]) : s[i];

    return time;
}

//定义三种播放方式的bool值
var playStyle1 = true;//顺序播放（默认）
var playStyle2 = false;//随机播放
var playStyle3 = false;//单曲循环

// 监听播放完成事件
audio.addEventListener('ended', function () {
    audioEnded();
	if(playStyle1){
		autoPlay();
	}else if(playStyle2){
		randomPlay();
	}else{
		repeatSong();
	}
}, false);

/**
 * 播放完成时把进度调回开始的位置
 */
function audioEnded() {
    $('#progressBar').css('width', 0);
    $('#progressDot').css('left', 0);
    $('#audioPlayer').attr('src', 'img/play.png');
}


// 点击进度条跳到指定点播放
// PS：此处不要用click，否则下面的拖动进度点事件有可能在此处触发，此时e.offsetX的值非常小，会导致进度条弹回开始处（简直不能忍！！）
$('#progressBarBg').on('mousedown', function (e) {
	// 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
	if (!audio.paused || audio.currentTime != 0) {
		var pgsWidth = $('.progress-bar-bg').width();
		var rate = e.offsetX / pgsWidth;
		audio.currentTime = audio.duration * rate;
		updateProgress(audio);
	}
});


var dot = document.getElementById('progressDot');

// 鼠标拖动进度点时可以调节进度
// 只有音乐开始播放后才可以调节，已经播放过但暂停了的也可以
// 鼠标按下时
dot.onmousedown = function (e) {
    if (!audio.paused || audio.currentTime != 0) {
        var oriLeft = dot.offsetLeft;
        var mouseX = e.clientX;
        var maxLeft = oriLeft; // 向左最大可拖动距离
        var maxRight = document.getElementById('progressBarBg').offsetWidth - oriLeft; // 向右最大可拖动距离

        // 禁止默认的选中事件（避免鼠标拖拽进度点的时候选中文字）
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }

        // 禁止事件冒泡
        if (e && e.stopPropagation) {
            e.stopPropagation();
        } else {
            window.event.cancelBubble = true;
        }
		
		var rate;
        // 开始拖动
        document.onmousemove = function (e) {
            var length = e.clientX - mouseX;
            if (length > maxRight) {
                length = maxRight;
            } else if (length < -maxLeft) {
                length = -maxLeft;
            }
            var pgsWidth = $('.progress-bar-bg').width();
            rate = (oriLeft + length) / pgsWidth;
			//这边不使用updateProgress函数 否则在拖动时会播放拖动所在位置的音频信息 声音引起不适
            $('#progressBar').css('width', rate * 100 + '%');
    		$('#progressDot').css('left', rate * 100 + '%');
            $('#audioCurTime').html(transTime(audio.duration*rate));
        };

        // 拖动结束
        document.onmouseup = function () {
			audio.currentTime = audio.duration * rate;
            document.onmousemove = null;
            document.onmouseup = null;
        };
    }
};
$('#volumeLogo').click(function(){
	if(audio.muted){
		$('#volumeLogo').attr('src','img/SOUND PLUS.png');
		audio.muted = false;
	}else{
		$('#volumeLogo').attr('src','img/SOUND MINUS.png');
		audio.muted = true;
	}
})
//初始化音量
function initVolume(){
	audio.volume = 0.5;
	updateVolumeProgress(audio);
}

initVolume();
//点击跳到对应音量
$('#progressBarBg_volume').on('mousedown', function (e) {
	var pgsWidth = $('#progressBarBg_volume').width();
	var rate = e.offsetX / pgsWidth;
	audio.volume = rate;
	//console.log(audio.volume);
	updateVolumeProgress(audio);
});
var dotVolume = document.getElementById('progressDot_volume');

//滑动调节音量
dotVolume.onmousedown = function (e) {
	var oriLeft = dotVolume.offsetLeft;
	var mouseX = e.clientX;
	var maxLeft = oriLeft; // 向左最大可拖动距离
	var maxRight = document.getElementById('progressBarBg_volume').offsetWidth - oriLeft; // 向右最大可拖动距离

	// 禁止默认的选中事件（避免鼠标拖拽进度点的时候选中文字）
	if (e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}

	// 禁止事件冒泡
	if (e && e.stopPropagation) {
		e.stopPropagation();
	} else {
		window.event.cancelBubble = true;
	}

	// 开始拖动
	document.onmousemove = function (e) {
		var length = e.clientX - mouseX;
		if (length > maxRight) {
			length = maxRight;
		} else if (length < -maxLeft) {
			length = -maxLeft;
		}
		var pgsWidth = $('#progressBarBg_volume').width();
		var rate = (oriLeft + length) / pgsWidth;
		audio.volume = rate;
		updateVolumeProgress(audio);
	};

	// 拖动结束
	document.onmouseup = function () {
		document.onmousemove = null;
		document.onmouseup = null;
	};
};

function randomNum(num,length){
	var temp = Math.ceil(Math.random()*length)-1;
	if(temp != num){
		return temp;	
	}else{
		return randomNum(num,length);
	}
}


//播放模式的实现

//1.顺序播放 同时也是顺序播放的下一首按钮的函数
function autoPlay() {
	if($('.cur').next().length != 0){
		var next = $('.cur').next();
	}else{
		var next = $('.cur').prevAll("li:first-child");
	}
	next.addClass("cur").siblings().removeClass("cur"); 
	var cur = $(".cur");
	cur.dblclick();
}

function autoPlayPre(){
	if($('.cur').prev().length != 0){
		var next = $('.cur').prev();
	}else{
		var next = $('.cur').nextAll("li:last-child");
	}
	next.addClass("cur").siblings().removeClass("cur"); 
	var cur = $(".cur");
	cur.dblclick();
}

//2.随机播放 同时也是随机播放上或者下一首的按钮函数
function randomPlay(){
	var index = $('.cur').index();
	var childrenLength = $('.cur').parent().children().length;
	if(childrenLength != 1){
		var next = $('.cur').parent().children('li').eq(randomNum(index,childrenLength));
		next.addClass("cur").siblings().removeClass("cur"); 
	}
	var cur = $(".cur");
	cur.dblclick();
}

//3.单曲循环
function repeatSong(){
	var cur = $('.cur');
	cur.dblclick();
}

//点击顺序播放图片按钮
function switchToRandom(e){
	$(e).css("display","none");
	$(e).next().css("display","block");
	playStyle1 = false;
	playStyle2 = true;
	playStyle3 = false;
}
//点击随机播放图片按钮
function switchToReapt(e){
	$(e).css("display","none");
	$(e).next().css("display","block");
	playStyle1 = false;
	playStyle2 = false;
	playStyle3 = true;
}
//点击单曲循环图片按钮
function switchToAuto(e){
	$(e).css("display","none");
	$(e).prevAll("img:first-child").css("display","block");
	playStyle1 = true;
	playStyle2 = false;
	playStyle3 = false;
}



//上一首 下一首 的 实现
function prevSong(){
	if(playStyle1){
		autoPlayPre();
	}else if(playStyle2){
		randomPlay();
	}else{
		repeatSong();
	}
}
function nextSong(){
	if(playStyle1){
		autoPlay();
	}else if(playStyle2){
		randomPlay();
	}else{
		repeatSong();
	}
}
//以上 播放功能实现结束

//评论提交实现(包含本地存储功能代码)
function commentSubmit(){
	var commentList = document.getElementById("commentList");
	var comments = commentList.innerHTML;
	var val = $('#commentFiled').val();
	var myDate = new Date();
	if($("#songName").text()!="点击右上角按钮搜索歌曲" && isLogin){
		if(val!=""){
			comments += "<li ondblclick='deleteComments(this)'>"+ myDate.toLocaleDateString() + myDate.toLocaleTimeString() + "</br>" + val +"</li>";
			
			
		}else{
			alert("没有输入文字。");
		}
	}else{
		alert("登陆并选择歌曲后才可评论");
	}
	commentList.innerHTML = comments;
	
	$('#commentFiled').val("");
	
	commentsToLocal();
	
}

//将评论通过数组的形式保存在本地
function commentsToLocal(){
	var commentsArray = new Array();
	var commentsNum = $('#commentList>li').length;
	for(var i=0;i<commentsNum;i++){
		var targetLi = $('#commentList').children('li').eq(i);
		commentsArray.push(targetLi.html());
	}
	if($("#songName").text()!="点击右上角按钮搜索歌曲"){
	   localStorage.setItem($("#songName").text(),JSON.stringify(commentsArray));
	}
}

//当运行歌曲时查询并获得本地存储的评论
function getComments(){
	var commentList = document.getElementById("commentList");
	commentList.innerHTML = "";
	var comments = commentList.innerHTML;
	var songName = $("#songName").text();
	//console.log(localStorage.getItem(songName));
	if(localStorage.getItem(songName)!=null){
		var commentsArray = JSON.parse(localStorage.getItem(songName));
		console.log(commentsArray.length);
		for(var i=0;i<commentsArray.length;i++){
			comments += "<li ondblclick='deleteComments(this)'>"+ commentsArray[i] +"</li>";
		}
		commentList.innerHTML = comments;
	}
}
//删除评论功能
function deleteComments(e){
	if(isLogin){
		if(confirm("确定删除本条评论？")){
			$(e).remove();
			commentsToLocal();
		}
	}else{
		alert("登陆后才能执行删除操作");
	}
}


//点击加号按钮跳出创建歌单的框
function addSheet(){
	$("#floatNav").css("display","block");
	$("#songSheetInput").focus();
}

//取消 创建歌单
function cancelCreateSheet(){
	$("#floatNav").css("display","none");
	$("#songSheetInput").val("");
}

//创建 创建歌单
function createSheet(){
	var songSheetName = $("#songSheetInput").val();
	if(songSheetName!=""){
		$("#songSheetTabs").append("<h1 onclick='selectTab(this)'>"+songSheetName+"</h1>");
		$("#songListTabs").append("<ul class='musicList hidden' id='songlist1'><div class='navInSheet'><p onclick='deleteSheet(this)'>删除本歌单</p></div></ul>");
		$("#songSheetInput").val("");
		$("#floatNav").css("display","none");
	}else{
		alert("歌单名不能为空！");
	}
}

//选择相应歌单的TAB
function selectTab(e){
	$(e).addClass("selected");
	$(e).siblings().removeClass("selected");
	var index = $(e).index();
	var targetUl = $("#songListTabs").children().eq(index);
	targetUl.removeClass("hidden");
	targetUl.siblings().addClass("hidden");
}

//歌单中添加歌曲按钮点击函数
var songLiValue = "";
function addSongToSheet(e){
	var length = $("#songSheetTabs").children().length;
	if(length==1){
		alert("请先新建歌单！");
	}else{
		$("#floatNav1").css("display","block");
		songLiValue = "";
		songLiValue = $(e).parent().parent().prop("outerHTML");
		//console.log(songLiValue);
		for(var i=1;i<length;i++){
			var sheetName = $("#songSheetTabs").children().eq(i).html();
			$("#sheetList").append("<li onclick='clickSheet(this)'>"+sheetName+"</li>");
		}
	}
}
//关闭选择歌单的浮层
function closeFloat(){
	$("#floatNav1").css("display","none");
	$("#sheetList").html("");
}
//用户点击要添加的歌单
function clickSheet(e){
	var index = $(e).index() + 1;
	var targetUl = $("#songListTabs").children().eq(index);
	targetUl.append(songLiValue);
	songLiValue = "";
	$("#floatNav1").css("display","none");
	$("#sheetList").html("");
}

//删除歌单按钮
function deleteSheet(e){
	if(confirm("确定删除此歌单?")){
		var index = $(e).parent().parent().index();
		$(e).parent().parent().remove();
		$("#songSheetTabs").children().eq(index).remove();

		$("#songSheetTabs").children().eq(0).addClass("selected");
		$("#songSheetTabs").children().eq(0).siblings().removeClass("selected");
		$("#songListTabs").children().eq(0).removeClass("hidden");
		$("#songListTabs").children().eq(0).siblings().addClass("hidden");
	}
}
//删除歌曲
function deleteSong(e){
	if(confirm("确定删除此歌曲?")){
		var nowPlaying = $(e).parent().parent().text();
		if(nowPlaying == $("#songName").text()){
			nextSong();
		}
		$(e).parent().parent().remove();
	}
}

//点击登陆/注册按钮
function signinLoginin(){
	$("#loginDiv").removeClass("hidden");
}
//关闭浮层
function closeFloat(e){
	$(e).parent().addClass("hidden");
}

function loginToSignin(){
	$("#loginDiv").addClass("hidden");
	$("#signinDiv").removeClass("hidden");
}
function signinToLogin(){
	$("#signinDiv").addClass("hidden");
	$("#loginDiv").removeClass("hidden");
}

//获取用户注册时输入的账号和密码 保存到本地
function signinButton(){
	var account = $("#signinAccount").val();
	var password = $("#signinPassword").val();
	if(account!="" && password!=""){
		localStorage.setItem("h5playerAccount",account);
		localStorage.setItem("h5playerPassword",password);
		$("#signinDiv").addClass("hidden");
		alert("注册成功");
	}else{
		alert("请输入账号和密码！");
	}
}
//判断登陆
var isLogin = false;
function loginButton(){
	var account = $("#loginAccount").val();
	var password = $("#loginPassword").val();
	if(account!="" && password!=""){
		if(localStorage.getItem("h5playerAccount")!=null){
			if(account==localStorage.getItem("h5playerAccount") && password==localStorage.getItem("h5playerPassword")){
				//登陆成功
				isLogin = true;
				alert("登陆成功");
				$("#loginDiv").addClass("hidden");
				$("#personalCenter").removeClass("hidden");
				$("#loginButton").addClass("hidden");
			}else{
				alert("账号密码错误。");
			}
		}else{
			alert("账号密码错误。");
		}
	}else{
		alert("请输入账号和密码！");
	}
}

//点击个人中心
function personalCenter(){
	$("#personalCenterDiv").removeClass("hidden");
}

//清理歌曲评论的缓存
function clearCache(){
	if(confirm("这将删除浏览器中的所有缓存(包括当前已经注册的账号和所有歌曲评论)！确定操作？")){
		localStorage.clear();
		alert("清理成功");
	}
}

//退出登陆
function logout(){
	if(confirm("确定退出登陆吗？")){
		isLogin = false;
		alert("账号已退出登陆");
		$("#personalCenter").addClass("hidden");
		$("#loginButton").removeClass("hidden");
		$("#personalCenterDiv").addClass("hidden");
	}
}