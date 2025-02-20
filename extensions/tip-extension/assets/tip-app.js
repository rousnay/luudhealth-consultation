// const { CURSOR_FLAGS } = require("mongodb");
// console.clear();

const API = `/apps/tip/consultancy/generate`;
const method = "POST";

const treatmentType = localStorage.getItem("treatment_type");
console.log("treatmentType:", treatmentType);

const conditionId = parseInt(localStorage.getItem("condition_id"));
console.log("conditionId:", conditionId);

const treatmentId = parseInt(localStorage.getItem("treatment_id"));
console.log("treatmentId:", treatmentId);

const currentAssessmentFormType = localStorage.getItem(
  "current_assessment_form_type"
);
console.log("currentAssessmentFormType:", currentAssessmentFormType);

const currentTreatmentFormIndex = parseInt(
  localStorage.getItem("current_treatment_form_index")
);
console.log("currentTreatmentFormIndex:", currentTreatmentFormIndex);

const hasConditionId = !!conditionId;
const hasTreatmentId = !!treatmentId;

console.log("hasConditionId:", hasConditionId);
console.log("hasTreatmentId:", hasTreatmentId);

const getConsultancyBody = {};
console.log("getConsultancyBody:", getConsultancyBody);

var targetedQuestionsSet = 0;

if (currentAssessmentFormType === "condition") {
  getConsultancyBody.conditionId = conditionId;
  getConsultancyBody.type = "CONDITION";
} else {
  getConsultancyBody.treatmentId = treatmentId;
  getConsultancyBody.type = "NEW";

  targetedQuestionsSet = currentTreatmentFormIndex || 0;
}

console.log("current targetedQuestionsSet:", targetedQuestionsSet);

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
  const formProgressStatusContainer = document.getElementById(
    "progress-form-status-container"
  );
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
          handleConsultancy(response?.data[targetedQuestionsSet].questions);

          if (currentAssessmentFormType === "treatment") {
            const totalQuestionsSet = response?.data.length;
            console.log("totalQuestionsSet:", totalQuestionsSet);

            if (
              totalQuestionsSet === 1 ||
              totalQuestionsSet === targetedQuestionsSet + 1
            ) {
              localStorage.setItem("has_another_treatment_form", "no");
              console.log("totalQuestionsSet:", totalQuestionsSet);
            } else {
              localStorage.setItem("has_another_treatment_form", "yes");
              console.log(
                "next treatment_form_index:",
                targetedQuestionsSet + 1
              );
            }
            localStorage.setItem(
              "current_treatment_form_index",
              targetedQuestionsSet + 1
            );
          }
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
      formProgressStatusContainer.style.display = "block";
      console.log("question set:", questions);

      const conditional_questions = questions.map((question, index) => {
        const { conditional } = question;
        // const tabIndex = index + 1;
        // const unconditional = 1;

        // Check if 'conditional' is an array
        if (Array.isArray(conditional)) {
          // add "unconditional": true and the 'index' property
          return { unconditional: true, tabIndex: index };
        } else if (typeof conditional === "object" && conditional !== null) {
          // If 'conditional' is an object Copy 'conditional' and add the 'index' property
          return { ...conditional, tabIndex: index };
        } else {
          // If 'conditional' is neither an object nor an array, set it to null
          return null;
        }
      });

      questions.map(function (question, i) {
        let section = document.createElement("section");
        section.classList.add("pop-in");
        section.setAttribute("id", `progress-form__panel-${i}`);
        section.setAttribute("role", "tabpanel");
        section.setAttribute("aria-labelledby", `progress-form__tab-${i}`);
        section.setAttribute("tabindex", i);

        if (i !== 0) {
          section.hidden = true;
        }

        // Array.isArray(question?.conditional)
        if (!Array.isArray(question?.conditional)) {
          // section.hidden = true;
          section.classList.add(`is-conditional-question`);
          section.classList.add(`cq-id-${question?.conditional?.id}`);
          // section.classList.add(`cq-value-${question?.conditional?.value}`);
          // console.log("Conditional:", question?.conditional);
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

          let q_description = document.createElement("div");
          q_description.classList.add("question-description");
          q_description.innerHTML = `${question?.question_description}`;

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
          fieldset.appendChild(q_description);
          fieldset.appendChild(divButtons);

          if (
            question?.question_type === "yes-no" &&
            question?.more_detail_trigger !== null
          ) {
            // Create a text input for additional details
            let moreDetailInput = document.createElement("input");
            moreDetailInput.setAttribute("type", "text");
            moreDetailInput.setAttribute("name", "more_detail");
            moreDetailInput.setAttribute("placeholder", "Enter more details");
            moreDetailInput.setAttribute("data-input-type", "more-detail");
            // section.appendChild(moreDetailInput);

            fieldset.appendChild(moreDetailInput);

            // Handle showing/hiding based on user's selection
            const radioInputs = section.querySelectorAll(
              `input[name="${question?.question_id}"]`
            );
            radioInputs.forEach((input) => {
              input.addEventListener("change", function () {
                const isYesSelected = input.value === "1";
                if (isYesSelected) {
                  moreDetailInput.style.display = "block";
                } else {
                  moreDetailInput.style.display = "none";
                }
              });
            });
          }

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

          let q_description = document.createElement("div");
          q_description.classList.add("question-description");
          q_description.innerHTML = `${question?.question_description}`;

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
            fieldset.appendChild(q_description);
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
        } else if (question?.question_type === "radio") {
          let divRadioButtons = document.createElement("div");
          let fieldset = document.createElement("fieldset");
          fieldset.classList.add("mt-3", "form__field", "field_wrapper");
          fieldset.setAttribute("data-question-type", "radio");

          fieldset.setAttribute(
            "data-helper-text",
            question?.helper_text || helperText
          );

          fieldset.setAttribute(
            "data-error-message",
            question?.error_message || errorMessage
          );

          divRadioButtons.classList.add("radio-buttons");
          let legend = document.createElement("legend");
          legend.innerHTML = `${question?.question_text}`;

          let q_description = document.createElement("div");
          q_description.classList.add("question-description");
          q_description.innerHTML = `${question?.question_description}`;

          question?.options?.map((option) => {
            //create element
            let label = document.createElement("label");
            let span = document.createElement("span");
            let input = document.createElement("input");

            //setting attributes to the elements
            span.innerHTML = `${option}`;
            label.classList.add("form__choice-wrapper");

            input.setAttribute("data-input-type", "radio");
            input.setAttribute("type", "radio");
            input.setAttribute("name", `${question?.question_id}`);
            input.setAttribute("value", `${option}`);

            //append child elements to the parents
            label.appendChild(input);
            label.appendChild(span);
            divRadioButtons.appendChild(label);
            fieldset.appendChild(legend);
            fieldset.appendChild(q_description);
            fieldset.appendChild(divRadioButtons);
            // fieldset.appendChild(label);
          });

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
        } else if (question?.question_type === "free-text") {
          //create element and add inner html to that element
          let divFreeText = document.createElement("div");
          let fieldset = document.createElement("fieldset");
          fieldset.classList.add("mt-3", "form__field", "field_wrapper");
          fieldset.setAttribute("data-question-type", "free-text");
          divFreeText.classList.add("free-text");
          let legend = document.createElement("legend");
          legend.innerHTML = `${question?.question_text}`;

          let q_description = document.createElement("div");
          q_description.classList.add("question-description");
          q_description.innerHTML = `${question?.question_description}`;

          //create element
          let label = document.createElement("label");
          let span = document.createElement("span");
          let input = document.createElement("input");

          //setting attributes to the elements
          span.innerHTML = `${question?.helper_text}`;
          label.classList.add("form__choice-wrapper");
          input.setAttribute("data-input-type", "free-text");
          input.setAttribute("type", "text");
          input.setAttribute("name", `${question?.question_id}`);
          input.setAttribute("placeholder", `${question?.helper_text}`);
          // input.setAttribute("value", `${option}`);
          //append child elements to the parents
          label.appendChild(input);
          label.appendChild(span);
          divFreeText.appendChild(label);

          fieldset.appendChild(legend);
          fieldset.appendChild(q_description);
          fieldset.appendChild(divFreeText);
          // fieldset.appendChild(label);

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
        } else if (question?.question_type === "date") {
          //create element and add inner html to that element
          let divDate = document.createElement("div");
          let fieldset = document.createElement("fieldset");
          fieldset.classList.add("mt-3", "form__field", "field_wrapper");
          fieldset.setAttribute("data-question-type", "date");
          divDate.classList.add("date");
          let legend = document.createElement("legend");
          legend.innerHTML = `${question?.question_text}`;

          let q_description = document.createElement("div");
          q_description.classList.add("question-description");
          q_description.innerHTML = `${question?.question_description}`;

          //create element
          let label = document.createElement("label");
          let span = document.createElement("span");
          let input = document.createElement("input");

          //setting attributes to the elements
          span.innerHTML = `${question?.helper_text}`;
          label.classList.add("form__choice-wrapper");
          input.setAttribute("data-input-type", "date");
          input.setAttribute("type", "date");
          input.setAttribute("name", `${question?.question_id}`);
          input.setAttribute("placeholder", `${question?.helper_text}`);
          // input.setAttribute("value", `${option}`);
          //append child elements to the parents
          label.appendChild(input);
          label.appendChild(span);
          divDate.appendChild(label);

          fieldset.appendChild(legend);
          fieldset.appendChild(q_description);
          fieldset.appendChild(divDate);
          // fieldset.appendChild(label);

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
        } else {
          console.log("Unknown field exist!");
        }
      });

      // tipForm.insertAdjacentHTML(
      //   "beforeend",
      //   `<section id="progress-form__thank-you" hidden>
      //   <p class="successful-submit">Consultancy data has been submitted successfully!</p>
      //   <p>Now you are going to tell us more about your personal and medical condition.</p>
      //   <button type="button" class="button" id="continue-to-next-form">Continue</button>
      // </section>`
      // );

      // const continueToNextForm = document.getElementById(
      //   "continue-to-next-form"
      // );
      // continueToNextForm.addEventListener("click", (e) => {
      //   console.log("HIT via continue button");
      //   window.location.href = "/pages/medical-information";
      // });

      initProcessForm(conditional_questions);
    }
  })();
});
