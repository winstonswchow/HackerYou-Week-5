var iotdApp = {};
    iotdApp.API_ID = "2401dbdd";
    iotdApp.API_key = "f35323739ff5dba5395e9571841e7bab";
    iotdApp.instant;
    iotdApp.fast;
    iotdApp.medium;
    iotdApp.slow;
    iotdApp.bgimages = ["avomango.jpg", "beans.jpg", "chips.jpg", "medley.jpg", "raspberries.jpg"];

iotdApp.init = function() {
  $(".prompt").css({'background-image': 'url(assets/images/' + iotdApp.bgimages[Math.floor(Math.random() * iotdApp.bgimages.length)] + ')'});
  var ingredient;
  iotdApp.instant = [];
  iotdApp.fast = [];
  iotdApp.medium = [];
  iotdApp.slow = [];
  $( ".userInput" ).on("submit", function(e){
    e.preventDefault();
    ingredient = $( "#ingredient" ).val();
    iotdApp.getRecipes(ingredient);
    $(".prompt").removeClass("display").one("transitionend", function(){
      $(".recipeList").addClass("display");
    });
  });
}

iotdApp.getRecipes = function(givenIngredient){
	$.ajax({
		url : "http://api.yummly.com/v1/api/recipes",
    type : "GET",
    dataType : "JSONP",
    data : {
      _app_id : iotdApp.API_ID,
      _app_key : iotdApp.API_key,
      requirePictures: true,
      allowedIngredient : givenIngredient,
      maxResult: 60,
      excludedCourse : "course^course-Condiments and Sauces"
    },
    success : function(data) {
      iotdApp.filterResults(data.matches);
      iotdApp.displayResults();
		} 
	}); // end ajax
}

iotdApp.filterResults = function(givenData) {
  var tempArray = [];
  for (var i = 0; i < givenData.length; i++) {
    if (givenData[i].attributes.course && givenData[i].attributes.course.length > 0 && givenData[i].totalTimeInSeconds) {
      tempArray.push(givenData[i]);
    }
  }
  tempArray.sort(function(a,b) {
    return a.totalTimeInSeconds - b.totalTimeInSeconds;
  });
  iotdApp.categorizeTime(tempArray);
}

iotdApp.categorizeTime = function(iotdResults) {
  for (var i = 0; i < iotdResults.length; i++) {
    if (iotdResults[i].totalTimeInSeconds <= 900) {
      iotdApp.instant.push(iotdResults[i]);
    }
    else if (iotdResults[i].totalTimeInSeconds <= 1800) {
      iotdApp.fast.push(iotdResults[i]);
    }
    else if (iotdResults[i].totalTimeInSeconds <= 3600) {
      iotdApp.medium.push(iotdResults[i]);
    }
    else {
      iotdApp.slow.push(iotdResults[i]);
    }
  }
}

iotdApp.displayResults = function(){
  $(".instantRecipes").append(iotdApp.plot(iotdApp.instant));
  $(".fastRecipes").append(iotdApp.plot(iotdApp.fast));
  $(".mediumRecipes").append(iotdApp.plot(iotdApp.medium));
  $(".slowRecipes").append(iotdApp.plot(iotdApp.slow));
}

iotdApp.plot = function(givenArray) {
  var listAppend = "";
  var recipeType = "";
  var recipeImage = "";
  var recipeTime = "";
  for (var i = 0; i < givenArray.length; i++) {
    recipeType = iotdApp.extractCourse(givenArray[i]);
    recipeImage = givenArray[i].smallImageUrls[0].replace(/s90/g, 's250');
    recipeTime = iotdApp.getTime(givenArray[i].totalTimeInSeconds);
    listAppend += "<li><a target='_blank' href ='http://www.yummly.com/recipe/" + givenArray[i].id + "'><img src='" + recipeImage + "'><p>Prep Time: " + recipeTime + "</p><h4>" + givenArray[i].recipeName + "</h4></a></li>";
  }
  return listAppend;
}

iotdApp.extractCourse = function(givenRecipe) {
  var courses = "";
  var tempString = "";
  for (var i = 0; i < givenRecipe.attributes.course.length; i++) {
    tempString = givenRecipe.attributes.course[i].replace(/\s/g, '-');
    courses += tempString.toLowerCase() + " ";
  }
  return courses.substring(0, courses.length - 1);
}

iotdApp.getTime = function (givenSeconds) {
  var outputString =""
  var hours = 0;
  if (givenSeconds < 60) {
    outputString = "Less than a minute";
  }
  else if (givenSeconds === 60) {
    outputString = "1 minute"
  }
  else if (givenSeconds <= 3600) {
    outputString = Math.floor(givenSeconds/60) + " minutes";
  }
  else {
    if (givenSeconds > 3600 && givenSeconds < 7200) {
      hours++;
      outputString = "1 hour";
    }
    else {
      hours = Math.floor(givenSeconds/3600);
      outputString = hours + " hours";
    }
    // console.log(givenSeconds - hours*3600);
    if (givenSeconds - hours*3600 !== 0) {
      outputString += ", " + Math.floor((givenSeconds - (hours*3600))/60) + " minutes";
    }
  }
  return outputString;
}

$(function() {
	iotdApp.init();
});
