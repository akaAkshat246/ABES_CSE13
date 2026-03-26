let heading= document.getElementById("heading");
let input= document.getElementById("input");

document.getElementById("changeText").addEventListener("click", 
    function() {
        if(input.value !== "") {
            heading.innerHTML= input.value;
        }
    }
);