document.addEventListener("DOMContentLoaded", function () {
  console.log("TIP Theme Ext Back-end loaded: v5");
});
console.clear();

const API = `/apps/tip/consultancy/generate`;
const method = "POST";
const treatmentId = 6257;

const getConsultancyBody = {
  treatmentId: treatmentId,
  type: "NEW",
};

function ready(fn) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(fn, 1);
    document.removeEventListener("DOMContentLoaded", fn);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

ready(function () {
  const consultancyHeader = document.getElementById("consultancy-header");
  const startConsultancy = document.getElementById("start-consultancy");
  const tipForm = document.getElementById("progress-form");
  const tipFormTab = document.getElementById("progress-form-tabs");
  const field = document.createDocumentFragment();

  const errorMessage =
    "Unfortunately, based on your responses we cannot provide your treatment!";

  const helperText =
    "If you have not had your condition diagnosed by your doctor, it is important to have regular check-ups with your GP as ED can be a symptom of other medical conditions. You don’t need to discuss your ED with your GP if you don’t want but it’s important to have a blood pressure check and blood tests yearly to monitor your overall health.";

  async function getConsultancy(url = "", data = {}) {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  (async () => {
    getConsultancy(API, getConsultancyBody)
      .then((response) => {
        setTimeout(() => {
          handleConsultancy(response?.data[0].questions);
          // console.log("Hit the API");
          // console.log(response);
        }, 2000); // An artificial delay to show the state of the submit button
      })
      .catch((error) => {
        setTimeout(() => {
          // handleError(error);
          console.log("Something went wrong with TIP API 11");
          console.log(response);
        }, 5000); // An artificial delay to show the state of the submit button
      });

    function handleConsultancy(questions) {
      consultancyHeader.style.display = "none";
      console.log(questions);
      questions.map(function (question, i) {
        let section = document.createElement("section");
        section.classList.add("pop-in");
        section.setAttribute("id", `progress-form__panel-${i + 1}`);
        section.setAttribute("role", "tabpanel");
        section.setAttribute("aria-labelledby", `progress-form__tab-${i + 1}`);
        section.setAttribute("tabindex", 0);

        if (i !== 0) {
          section.hidden = true;
        }

        tipFormTab.insertAdjacentHTML(
          "beforeend",
          `<button id="progress-form__tab-${
            i + 1
          }" class="flex-1 px-0 pt-2 progress-form__tabs-item" type="button" role="tab" aria-controls="progress-form__panel-${
            i + 1
          }" aria-selected="true">
          <span class="d-block step" aria-hidden="true">Step ${
            i + 1
          } <span class="sm:d-none">of ${question.length}</span></span>
          </button>`
        );

        if (
          question?.question_type === "yes" ||
          question?.question_type === "no" ||
          question?.question_type === "yes-no"
        ) {
          //create element and add inner html to that element
          let divButtons = document.createElement("div");
          let fieldset = document.createElement("fieldset");
          fieldset.classList.add("mt-3", "form__field", "field_wrapper");
          fieldset.setAttribute("data-question-type", question?.question_type);

          fieldset.setAttribute(
            "data-helper-text",
            question?.helper_text || helperText
          );

          fieldset.setAttribute(
            "data-error-message",
            question?.error_message || errorMessage
          );

          let legend = document.createElement("legend");
          legend.innerHTML = `${question?.question_text}`;
          divButtons.classList.add("radio-buttons");
          // legend.insertAdjacentHTML(
          //   "afterbegin",
          //   '<span class="required-mark" data-required="true" aria-hidden="true"></span>'
          // );
          // ;input.setAttribute("data-input-type", ${option});

          divButtons.insertAdjacentHTML(
            "beforeend",
            `<label class="form__choice-wrapper">
            <input data-input-type="yes" type="radio" name="${question?.question_id}" value="1" required>
            <span>Yes</span>
          </label>
          <label class="form__choice-wrapper">
            <input data-input-type="no" type="radio" name="${question?.question_id}" value="0">
            <span>No</span>
          </label>`
          );

          fieldset.appendChild(legend);
          fieldset.appendChild(divButtons);
          section.appendChild(fieldset);

          if (i === 0) {
            section.insertAdjacentHTML(
              "beforeend",
              `<div class="button-wrapper d-flex align-items-center justify-center sm:justify-end mt-4 sm:mt-5">
            <button class="button button-next button-progress" type="button" data-action="next">
              Continue
            </button>
          </div>`
            );
          } else if (i === questions.length - 1) {
            section.insertAdjacentHTML(
              "beforeend",
              `<div class="button-wrapper d-flex flex-column-reverse sm:flex-row align-items-center justify-center sm:justify-end mt-4 sm:mt-5">
                <button type="button" class="button tip-back-button mt-1 sm:mt-0 button--simple" data-action="prev">
                  Back
                </button>
                <button  class="button button-progress" type="submit">
                  Submit
                </button>
              </div>`
            );
          } else {
            section.insertAdjacentHTML(
              "beforeend",
              `<div class="button-wrapper d-flex flex-column-reverse sm:flex-row align-items-center justify-center sm:justify-end mt-4 sm:mt-5">
              <button type="button" class="button tip-back-button mt-1 sm:mt-0 button--simple button-prev" data-action="prev">
                Back
              </button>
              <button class="button button-next button-progress" type="button" data-action="next">
              Continue
            </button>
          </div>`
            );
          }

          tipForm.appendChild(section);
        } else if (question?.question_type === "multiple-selection") {
          //create element and add inner html to that element
          let divCheckboxes = document.createElement("div");
          let fieldset = document.createElement("fieldset");
          fieldset.classList.add("mt-3", "form__field", "field_wrapper");
          fieldset.setAttribute("data-question-type", "multiple-selection");
          divCheckboxes.classList.add("check-boxes");
          let legend = document.createElement("legend");
          legend.innerHTML = `${question?.question_text}`;

          question?.options?.map((option) => {
            //create element
            let label = document.createElement("label");
            let span = document.createElement("span");
            let input = document.createElement("input");

            //setting attributes to the elements
            span.innerHTML = `${option}`;
            label.classList.add("form__choice-wrapper");
            input.setAttribute("data-input-type", "multiple-selection");
            input.setAttribute("type", "checkbox");
            input.setAttribute("name", `${question?.question_id}`);
            input.setAttribute("value", `${option}`);
            //append child elements to the parents
            label.appendChild(input);
            label.appendChild(span);
            divCheckboxes.appendChild(label);

            fieldset.appendChild(legend);
            fieldset.appendChild(divCheckboxes);
            // fieldset.appendChild(label);
          });

          section.appendChild(fieldset);

          if (i === 0) {
            section.insertAdjacentHTML(
              "beforeend",
              `<div class="button-wrapper d-flex align-items-center justify-center sm:justify-end mt-4 sm:mt-5">
            <button class="next-button" type="button" data-action="next">
              Continue
            </button>
          </div>`
            );
          } else if (i === questions.length - 1) {
            section.insertAdjacentHTML(
              "beforeend",
              `<div class="button-wrapper d-flex flex-column-reverse sm:flex-row align-items-center justify-center sm:justify-end mt-4 sm:mt-5">
                <button type="button" class="button tip-back-button mt-1 sm:mt-0 button--simple" data-action="prev">
                  Back
                </button>
                <button class="button button-progress" type="submit">
                  Submit
                </button>
              </div>`
            );
          } else {
            section.insertAdjacentHTML(
              "beforeend",
              `<div class="button-wrapper d-flex flex-column-reverse sm:flex-row align-items-center justify-center sm:justify-end mt-4 sm:mt-5">
              <button type="button" class="button tip-back-button mt-1 sm:mt-0 button--simple button-prev" data-action="prev">
                Back
              </button>
              <button class="button button-next button-progress" type="button" data-action="next">
              Continue
            </button>
          </div>`
            );
          }

          tipForm.appendChild(section);
        } else if (question?.question_type === "text") {
          console.log("API has Text field");
        } else if (question?.question_type === "textarea") {
          console.log("API has Textarea field");
        } else {
          console.log("No field matches");
        }
      });

      tipForm.insertAdjacentHTML(
        "beforeend",
        `<section id="progress-form__thank-you" hidden>
        <p class="successful-submit">Consultancy data has been submitted successfully!</p>
        <p>Now you are going to tell us more about your personal and medical condition.</p>
        <button type="button" class="button" id="continue-to-next-form">Continue</button>
      </section>`
      );

      const continueToNextForm = document.getElementById(
        "continue-to-next-form"
      );

      continueToNextForm.addEventListener("click", (e) => {
        console.log("hit hit hit...");
        // window.location.href = "/pages/medical-information";
      });

      initProcessForm();
    }
  })();
});
