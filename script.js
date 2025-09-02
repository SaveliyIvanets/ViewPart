"use strict";
async function getContent(path) {
  try {
    const buttonsContainer = document.getElementById("buttonsContainer");
    const errorContainer = document.getElementById("errorContainer");

    buttonsContainer.innerHTML = "<div>Загрузка данных...</div>";

    const result = await fetch(path); //http://localhost:3002/api/browse/

    if (!result.ok) {
      throw new Error(`Ошибка HTTP: ${result.status}`);
    }

    const data = await result.json();

    buttonsContainer.innerHTML = "";

    data.items.forEach((item) => {
      if (item.name) {
        const button = document.createElement("button");
        button.textContent = item.name;
        if (item.name.includes(".")) {
          if (item.name === "../") {
            button.addEventListener("click", async () => {
              getContent(`${path.split("/").slice(0, -2).join("/")}/`);
            });
          } else {
            button.addEventListener("click", async () => {
              try {
                const fileContainer = document.getElementById("fileContainer");
                fileContainer.innerHTML = "";
                const response = await fetch(
                  `${path.replace("browse", "file")}${item.name}`
                );
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const blob = await response.blob();
                const fileUrl = URL.createObjectURL(blob);
                const mimeType = blob.type;
                let element;
                if (mimeType.startsWith("image/")) {
                  element = document.createElement("img");
                  element.src = fileUrl;
                  element.style.maxWidth = "100%";
                  element.style.maxHeight = "400px";
                } else if (mimeType === "application/pdf") {
                  element = document.createElement("iframe");
                  element.src = fileUrl;
                  element.style.width = "100%";
                  element.style.height = "600px";
                } else if (mimeType === "application/json") {
                  try {
                    const text = await blob.text();
                    const jsonData = JSON.parse(text);
                    element = document.createElement("pre");
                    element.style.overflow = "auto";
                    element.style.padding = "10px";
                    element.style.backgroundColor = "#f5f5f5";
                    element.style.whiteSpace = "pre-wrap";
                    element.style.fontFamily = "monospace";
                    element.textContent = JSON.stringify(jsonData, null, 2);
                  } catch (error) {
                    element = document.createElement("div");
                    element.style.color = "red";
                    element.textContent = `Ошибка парсинга JSON: ${error.message}`;
                  }
                } else if (mimeType.startsWith("text/plain")) {
                  const text = await blob.text();
                  element = document.createElement("pre");
                  element.style.overflow = "auto";
                  element.style.padding = "10px";
                  element.style.backgroundColor = "#f5f5f5";
                  element.textContent = text;
                } else if (mimeType === "text/html") {
                  try {
                    const htmlContent = await blob.text();
                    element = document.createElement("iframe");
                    element.style.width = "100%";
                    element.style.height = "600px";
                    element.style.border = "1px solid #ccc";
                    element.sandbox = "allow-same-origin";
                    element.onload = function () {
                      try {
                        const iframeDoc =
                          element.contentDocument ||
                          element.contentWindow.document;
                        iframeDoc.open();
                        iframeDoc.write(htmlContent);
                        iframeDoc.close();
                      } catch (e) {
                        console.error("Ошибка вставки HTML в iframe:", e);
                      }
                    };
                    element.src = "about:blank";
                  } catch (error) {
                    element = document.createElement("div");
                    element.style.color = "red";
                    element.textContent = `Ошибка загрузки HTML: ${error.message}`;
                  }
                } else {
                  element = document.createElement("a");
                  element.href = fileUrl;
                  element.download = item.name;
                  element.textContent = `Скачать ${item.name}`;
                  element.style.display = "block";
                  element.style.padding = "10px";
                }

                fileContainer.appendChild(element);
              } catch (error) {
                console.error("Ошибка загрузки файла:", error);
                const errorContainer =
                  document.getElementById("errorContainer");
                errorContainer.style.display = "block";
                errorContainer.textContent = `Ошибка загрузки файла: ${error.message}`;
              }
            });
          }
        } else {
          button.addEventListener("click", async () => {
            getContent(`${path}${item.name}/`);
          });
        }

        buttonsContainer.appendChild(button);
        buttonsContainer.appendChild(document.createTextNode(" "));
      }
    });

    if (buttonsContainer.children.length === 0) {
      buttonsContainer.innerHTML = "<div>Нет данных для отображения</div>";
    }
  } catch (error) {
    console.error("Ошибка:", error);

    const buttonsContainer = document.getElementById("buttonsContainer");
    const errorContainer = document.getElementById("errorContainer");

    buttonsContainer.style.display = "none";
    errorContainer.style.display = "block";
    errorContainer.textContent = `Ошибка загрузки данных: ${error.message}`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  getContent("http://localhost:3002/api/browse/");
});
