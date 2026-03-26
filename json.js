//asynchronus functions

let promise= new Promise((resolve, reject)=> {
    let success= true;
    if(success) {
        resolve("Data Loaded");
    }
    else{
        reject("Error Occured");
    }
});
promise.then(result => console.log(result))
.catch(error => console.log(error));

async function getData() {
    let response= await
    fetch("https://jsonplaceholder.typicode.com/posts");

    let data= await response.json();
    console.log(data);
}

fetch("https://jsonplaceholder.typicode.com/posts")
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.log(error));

try {
    let c= y+10;
}
catch(error) {
    console.log(error.message);
}


localStorage.setItem("name", "Ash");

let name1= localStorage.getItem("name");
console.log(name1);

localStorage.removeItem("name");


//"#" + Math.floor(Math.random()*16777215).toString(16);