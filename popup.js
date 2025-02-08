document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("inputText");
  const runCodeButton = document.getElementById("runCode");
  const messageDiv = document.getElementById("message");
  const contentDiv = document.getElementById("content");

  checkCurrentPage();

  runCodeButton.addEventListener("click", () => {
    let inputText = inputField.value.trim();
    if (!inputText) {
      inputText = "Coursera Auto Grade By Yin";
      inputField.value = inputText;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;

      try {
        const url = new URL(tabs[0].url);
        if (url.hostname !== "www.coursera.org") return;

        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          args: [inputText],
          func: (textToInsert) => {
            const formControlDivs = document.querySelectorAll(".cds-formControl-root.css-715a8f");

            formControlDivs.forEach(formControl => {
              let maxPoints = -1;
              let bestInput = null;

              const peerOptions = formControl.querySelectorAll(".peer-option-input");

              peerOptions.forEach(peerOption => {
                let span = peerOption.querySelector(".css-1rlln5c span");
                if (span) {
                  let text = span.textContent.trim();
                  let match = text.match(/^(\d+) points?$/);
                  if (match) {
                    let points = parseInt(match[1], 10);
                    if (points > maxPoints) {
                      maxPoints = points;
                      bestInput = peerOption.querySelector("input[type='radio'], input[type='checkbox']");
                    }
                  }
                }
              });

              if (bestInput) {
                bestInput.click();
              }
            });

            let textarea = document.querySelector("textarea[id^='cds-react-aria']");
            if (!textarea) {
              textarea = document.evaluate(
                "//textarea[starts-with(@id, 'cds-react-aria')]",
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue;
            }

            if (textarea) {
              textarea.value = textToInsert;
              textarea.dispatchEvent(new Event("input", { bubbles: true }));
              textarea.dispatchEvent(new Event("change", { bubbles: true }));
              textarea.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "a" }));
            }

            setTimeout(() => {
              let submitButton = document.evaluate(
                "//*[@id='main']/div[1]/div[1]/div[2]/div/div[5]/div[1]/button",
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
              ).singleNodeValue;

              if (submitButton) {
                submitButton.click();

                setTimeout(() => {
                  if (document.contains(submitButton)) {
                    submitButton.click();
                  }
                }, 2000);
              }
            }, 500);
          },
        });
      } catch (error) {
        console.error("Error processing URL:", error);
      }
    });
  });

  function checkCurrentPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs.length) return;

      try {
        const url = new URL(tabs[0].url);
        const isCoursera = url.hostname === "www.coursera.org";

        messageDiv.style.display = isCoursera ? "none" : "block";
        contentDiv.style.display = isCoursera ? "block" : "none";
      } catch (error) {
        console.error("Error checking URL:", error);
      }
    });
  }
});
