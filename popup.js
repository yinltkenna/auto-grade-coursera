document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      try {
        const url = new URL(tabs[0].url);
        console.log("Tab URL:", url.hostname);

        if (url.hostname === "www.coursera.org") {
          document.getElementById("message").classList.add("hidden");
          document.getElementById("content").classList.remove("hidden");
          console.log(
            "Content should be visible:",
            !document.getElementById("content").classList.contains("hidden")
          );

          document.getElementById("runCode").addEventListener("click", () => {
            const inputText = document.getElementById("inputText").value;

            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (inputText) => {
                function performActions(inputText) {
                  for (let i = 1; i <= 12; i++) {
                    for (let j = 1; j <= 12; j++) {
                      for (let k = 1; k <= 12; k++) {
                        let xpathInput = `//*[@id="main"]/div[1]/div[1]/div[2]/div/div[3]/div[${i}]/div[2]/div/div[${j}]/div/div[2]/div[${k}]/label/input`;
                        let inputElement = document.evaluate(
                          xpathInput,
                          document,
                          null,
                          XPathResult.FIRST_ORDERED_NODE_TYPE,
                          null
                        ).singleNodeValue;
                        if (inputElement) {
                          inputElement.click();
                        }
                      }
                    }
                  }

                  function insertText(element, text) {
                    element.click();
                    element.focus();
                    document.execCommand("insertText", false, text);
                  }

                  let xpathTextarea = `//*[@id="main"]/div[1]/div[1]/div[2]/div/div[3]/div[1]/div[2]/div/div[8]/div/textarea`;
                  let textareaElement = document.evaluate(
                    xpathTextarea,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                  ).singleNodeValue;
                  if (textareaElement) {
                    insertText(textareaElement, inputText);
                  }

                  setTimeout(() => {
                    let xpathButton = `//*[@id="main"]/div[1]/div[1]/div[2]/div/div[5]/div[1]/button`;
                    let buttonElement = document.evaluate(
                      xpathButton,
                      document,
                      null,
                      XPathResult.FIRST_ORDERED_NODE_TYPE,
                      null
                    ).singleNodeValue;
                    if (buttonElement) {
                      buttonElement.click();
                    }
                  }, 1000);
                }

                performActions(inputText);
              },
              args: [inputText],
            });
          });
        } else {
          document.getElementById("content").classList.add("hidden");
          document.getElementById("message").classList.remove("hidden");
        }
      } catch (error) {
        console.error("Error processing URL:", error);
        document.getElementById("message").textContent =
          "An error occurred while processing the URL.";
        document.getElementById("message").classList.remove("hidden");
        document.getElementById("content").classList.add("hidden");
      }
    }
  });
});
