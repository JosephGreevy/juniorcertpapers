
window.onload = function(){
	setLevel();
	setFeature();
}
function setLevel(){
	let btns = document.querySelectorAll('.toggle .filter-button');
	for (var i = btns.length - 1; i >= 0; i--) {
		if(btns[i].textContent.toLowerCase() == local_level){
			btns[i].classList.add("enabled");
		}else{
			btns[i].classList.remove("enabled");
		}
	}
}
function setFeature(){
	let btns = document.querySelectorAll('.feature .filter-button');
	for (var i = btns.length - 1; i >= 0; i--) {
		if(btns[i].textContent.toLowerCase() == local_feature){
			btns[i].classList.add("enabled");
		}else{
			btns[i].classList.remove("enabled");
		}
	}
}
function toggleSubjects(event){
	if(!event.target.classList.contains("select_expanded")){
		open();
	}else{
		close();
	}
	
}
function toggleLevel(event){
	local_level = event.target.textContent.toLowerCase();
	if(local_subject !== "Subject"){
		navigate();
	}else{
		setLevel();
	}
}
function toggleFeature(event){
	local_feature = event.target.textContent.toLowerCase();
	if(local_subject !== "Subject"){
		navigate();
	}else{
		setFeature();
	}
}
function open(){
    let subjects = document.querySelectorAll(".subjects-select ul li");
    // Loop through every subject
    for(let i = 0; i < subjects.length; i++){
      // If list item is not the selected one add expanded class
      if(!subjects[i].classList.contains("selected") && subjects[i].textContent.toLowerCase() !== local_subject){
        subjects[i].classList.add("expanded");
        subjects[i].addEventListener("click", function(event){
        	local_subject = event.target.innerText;
        	navigate();
        });
      }
    }
    // Otherwise add special class to top level element;
    let selected = document.querySelector(".selected");
    selected.classList.add("select_expanded");
    // Event Listener 
    document.addEventListener('click', clickOutside);
    	
    
}	
function close(){
    let subjects = document.querySelectorAll(".subjects-select ul li");
    for(let i = 0; i < subjects.length; i++){
      if(subjects[i].classList.contains("expanded")){
        subjects[i].classList.remove("expanded");
      }
    } 
    let selected = document.querySelector(".selected");
    if(selected){
      selected.classList.remove("select_expanded");
    }   
    document.removeEventListener('click', clickOutside);
}
function navigate(){
	window.location.href = "/" + local_subject.toLowerCase() + "/" + local_level + "/" + local_feature;
}
function navigateLink(str){
	str = str.toLowerCase();
	console.log(str);
	window.location.href = "/" + str + "/" + local_level + "/" + local_feature;
}
function clickOutside(event){
	let listOfSubjects = document.querySelector(".subjects-select ul");
	var clickedInside = listOfSubjects.contains(event.target);
	if(!clickedInside){
		close();
	}
}