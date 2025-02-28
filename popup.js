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
            let hasSelections = false;
            let hasTextareas = false;

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
                hasSelections = true;
              }
            });
            
            let textareas = document.querySelectorAll("textarea[id^='cds-react-aria']");
            
            if (textareas.length === 0) {
              let textareasSnapshot = document.evaluate(
                "//textarea[starts-with(@id, 'cds-react-aria')]",
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
              );
              textareas = [];
              for (let i = 0; i < textareasSnapshot.snapshotLength; i++) {
                textareas.push(textareasSnapshot.snapshotItem(i));
              }
            }
            
            textareas.forEach(textarea => {
              textarea.value = textToInsert;
              textarea.dispatchEvent(new Event("input", { bubbles: true }));
              textarea.dispatchEvent(new Event("change", { bubbles: true }));
              textarea.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "a" }));
              hasTextareas = true;
            });

            if (hasSelections || hasTextareas) {
              setTimeout(() => {
                let submitButtons = document.querySelectorAll(
                  "#main > div.rc-PeerItemPage.body-1-text > div.rc-SplitPeerReviewPage > div:nth-child(2) > div > div.rc-FormSubmit > div:nth-child(1) > button, " +
                  "[id^='cds-react-aria'][id$='-panel-feedback'] div.rc-FormSubmit > div:nth-child(1) > button"
                );
                
                submitButtons.forEach(button => {
                  button.click();
                  setTimeout(() => {
                    if (document.contains(button)) {
                      button.click();
                    }
                  }, 2000);
                });
              }, 500);
            }
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