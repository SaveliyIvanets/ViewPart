"use strict";
const button = document.querySelector('button[type="button"]');
const sumbit = document.querySelector('input[type="submit"]');
const input = document.querySelector('input[type="text"]');

button.addEventListener("click", async () => {
  button.disabled = true;
  const result = await fetch("http://localhost:3001/");
  const data = await result.json();
  const div = document.createElement("div");
  let output = `path : ${data.path}`;
  output = `${output}<h1>------</h1>`;
  for (let dataInfo of data.items) {
    output = `${output} <h2></h2>`;
    output = `${output} name : ${dataInfo.name}`;
    output = `${output}<h2></h2> type : ${dataInfo.type}`;
    output = `${output}<h2></h2>url : ${dataInfo.url}<h1>------</h1>`;
  }
  div.innerHTML = output;
  document.body.appendChild(div);
});
sumbit.addEventListener("click", async () => {});
