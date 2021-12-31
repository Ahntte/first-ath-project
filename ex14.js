// 동기와 비동기
let fs = require("fs");
console.log("A");
let result = fs.readFileSync("/sample.txt", "utf8");
console.log(result);
console.log("C");
