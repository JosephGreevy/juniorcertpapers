function show(){
	var input = document.getElementById("password");
	var btn   = document.getElementById("showPwd");
	btn.textContent = "Hide";
	password.setAttribute('type', 'text');
}
function hide(){
	var input = document.getElementById("password");
	var btn   = document.getElementById("showPwd");
	btn.textContent = "Show";
	password.setAttribute('type', 'password');
}
var showing = 0;
document.getElementById("showPwd").addEventListener('click', function(){
	if(showing === 0){
		showing = 1;
		show();
	}else{
		showing = 0;
		hide();
	}
})