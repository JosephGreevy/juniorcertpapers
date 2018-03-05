let category;
let subset;
let displaying = [];
function changeCat(cat){
	let cats         = document.querySelectorAll(".categories ul li");
	let questionList = document.querySelector("ul.questions");
	let details      = document.querySelector("div.details");
	var selectedCategoryText = document.querySelector(".selectedCategory span");
	for (var i = 0; i < cats.length; i++) {
		if(cats[i].innerText == cat){
			cats[i].classList.add("selected-category");
			selectedCategoryText.innerText = cat;
		}else if(cats[i].classList.contains("selected-category")){
			cats[i].classList.remove("selected-category");
		}
	}
	if(window.innerWidth < 800){
			toggle();
	}
	let displaying   = [];
	if(questionList){
		questionList.innerHTML = "";
	}
	details.classList.add("invisible");
	for (var i = 0; i < questions.length; i++) {
		if(isInArray(cat, questions[i].tags)){
			let item = document.createElement("li");
			let template = 
					"<div class='banner'>" +
						"<h2>" + questions[i].name + "</h2>" +
						"<button onclick='toggleDisplay(event)'>Marking Scheme</button>" +
					"</div>" +
					"<img class='display'  src=" + questions[i].src + ">" +
					"<img class='display' style='display:none'  src=" + questions[i].ms + ">";
			if(questions[i].hasOwnProperty("audio")){
				let extra =
					"<audio controls>" +
						"<source src='" + questions[i].audio + "' type='audio/mpeg'>" +
						"Your browser doesn't support audio" +
					"</audio>"
				template += extra; 
			}
			item.innerHTML = template;
			questionList.appendChild(item);
			displaying[i] = true;
		}
	}
}
function isInArray(value, array) {
  return array.indexOf(value) > -1;
}
function toggleDisplay(event){
	let target = event.target;
	if(target.innerText == "Marking Scheme"){
		target.innerText = "Question";
	}else{
		target.innerText = "Marking Scheme"
	}
	
	let listItem = target.parentNode.parentNode;
	let imgs = listItem.querySelectorAll('img');
	for (var i = 0; i < imgs.length; i++) {
		console.log(imgs[i].style.display);
		if(imgs[i].style.display !== 'none'){
			imgs[i].style.display = 'none'
		}else{
			imgs[i].style.display = 'block';
		}
	}
}

document.querySelector(".selectedCategory").addEventListener('click', toggle());
function myFunction(x) {
	var items = document.querySelectorAll(".categories ul li:not(.selectedCategory)");
    if (x.matches) { // If media query matches
        for (var i = items.length - 1; 	i >= 0; i--) {
			items[i].style.display = "block";
		}
    }
}

var x = window.matchMedia("(min-width: 800px)")
myFunction(x) // Call listener function at run time
x.addListener(myFunction) // Attach listener function on state changes
function toggle(){
	var caret = document.querySelector(".selectedCategory .cat-caret");
	var items = document.querySelectorAll(".categories ul li:not(.selectedCategory)");
	for (var i = items.length - 1; 	i >= 0; i--) {
		if(items[i].style.display !== "block"){
			items[i].style.display = "block";
			caret.classList.remove("fa-caret-down");
			caret.classList.add("fa-caret-up");
		}else{
			items[i].style.display = "none";
			caret.classList.remove("fa-caret-up");
			caret.classList.add("fa-caret-down");
		}
	}
}