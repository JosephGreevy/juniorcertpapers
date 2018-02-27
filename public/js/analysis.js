let category;
let subset;
let displaying = [];
function changeCat(cat){
	let cats         = document.querySelectorAll(".categories ul li");
	let questionList = document.querySelector("ul.questions");
	let details      = document.querySelector("div.details");
	for (var i = 0; i < cats.length; i++) {
		if(cats[i].innerText == cat){
			cats[i].classList.add("selected-category");
		}else if(cats[i].classList.contains("selected-category")){
			cats[i].classList.remove("selected-category");
		}
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
ffunction formatDate(date) {
  var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}