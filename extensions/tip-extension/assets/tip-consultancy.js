const initProcessForm = function (conditional_questions) {
  // Global Constants
  const progressForm = document.getElementById("progress-form"),
    tabItems = progressForm.querySelectorAll('[role="tab"]'),
    tabPanels = progressForm.querySelectorAll('[role="tabpanel"]'),
    formProgressBar = document.getElementById("progress-form-status-bar");

  let currentStep = 0;

  console.log("conditional_questions:", conditional_questions);
  const answers = [];

  function findVisibleTabs(answers, conditionalQuestions) {
    const visibleTabs = [];

    conditionalQuestions.forEach((cq) => {
      const matchingAnswers = answers.filter((answer) => answer.id === cq.id);

      if (matchingAnswers.length > 0) {
        const isValueMatch = matchingAnswers.some(
          (matchingAnswer) =>
            cq.value === undefined ||
            matchingAnswer.value.some((value) => cq.value.includes(value))
        );

        if (isValueMatch) {
          visibleTabs.push({ ...cq, my_tabs: cq.tabIndex });
        }
      }
    });

    return visibleTabs;
  }

  const visibleTabs = findVisibleTabs(answers, conditional_questions);
  console.log("visibleTabs:", visibleTabs);
  // Form Validation

  /*****************************************************************************
   * Expects a string.
   *
   * Returns a boolean if the provided value *reasonably* matches the pattern
   * of a US phone number. Optional extension number.
   */

  const isValidPhone = (val) => {
    const regex = new RegExp(
      /^[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?$/
    );

    return regex.test(val);
  };

  /*****************************************************************************
   * Expects a string.
   *
   * Returns a boolean if the provided value *reasonably* matches the pattern
   * of a real email address.
   *
   * NOTE: There is no such thing as a perfect regular expression for email
   *       addresses; further, the validity of an email address cannot be
   *       verified on the front end. This is the closest we can get without
   *       our own service or a service provided by a third party.
   *
   * RFC 5322 Official Standard: https://emailregex.com/
   */

  const isValidEmail = (val) => {
    const regex = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

    return regex.test(val);
  };

  /*****************************************************************************
   * Expects a Node (input[type="text"] or textarea).
   */

  const validateText = (field) => {
    const val = field.value.trim();

    if (val === "" && field.required) {
      return {
        isValid: false,
      };
    } else {
      return {
        isValid: true,
      };
    }
  };

  /*****************************************************************************
   * Expects a Node (select).
   */

  const validateSelect = (field) => {
    const val = field.value.trim();

    if (val === "" && field.required) {
      return {
        isValid: false,
        message: "Please select an option from the dropdown menu.",
      };
    } else {
      return {
        isValid: true,
      };
    }
  };

  /*****************************************************************************
   * Expects a Node (fieldset).
   */

  const validateGroup = (fieldset) => {
    const choices = fieldset.querySelectorAll(
      'input[type="radio"], input[type="checkbox"]'
    );

    let isRequired = false,
      isChecked = false;

    for (const choice of choices) {
      // console.log(choice.type === "checkbox");
      if (
        choice.required ||
        choice.type === "checkbox" ||
        choice.type === "radio"
      ) {
        isRequired = true;
      }

      if (choice.checked) {
        let questionType = fieldset.getAttribute("data-question-type");
        let inputType = choice.getAttribute("data-input-type");
        let helperText = fieldset.getAttribute("data-helper-text");
        let errorMessage = fieldset.getAttribute("data-error-message");

        if (questionType === "yes-no" && inputType === "no") {
          return {
            isValid: true, // NEED TO WORK
            message: helperText,
          };
        } else if (
          choice.type === "radio" &&
          inputType !== questionType &&
          questionType !== "yes-no"
        ) {
          isChecked = false;
          return {
            isValid: false,
            message: errorMessage,
          };
        } else isChecked = true;
      }
    }

    if (!isChecked && isRequired) {
      return {
        isValid: false,
        message: "Please make a selection.",
      };
    } else {
      return {
        isValid: true,
      };
    }
  };

  /*****************************************************************************
   * Expects a Node (input[type="radio"] or input[type="checkbox"]).
   */

  const validateChoice = (field) => {
    return validateGroup(field.closest("fieldset"));
  };

  /*****************************************************************************
   * Expects a Node (input[type="tel"]).
   */

  const validatePhone = (field) => {
    const val = field.value.trim();

    if (val === "" && field.required) {
      return {
        isValid: false,
      };
    } else if (val !== "" && !isValidPhone(val)) {
      return {
        isValid: false,
        message: "Please provide a valid US phone number.",
      };
    } else {
      return {
        isValid: true,
      };
    }
  };

  /*****************************************************************************
   * Expects a Node (input[type="email"]).
   */

  const validateEmail = (field) => {
    const val = field.value.trim();

    if (val === "" && field.required) {
      return {
        isValid: false,
      };
    } else if (val !== "" && !isValidEmail(val)) {
      return {
        isValid: false,
        message: "Please provide a valid email address.",
      };
    } else {
      return {
        isValid: true,
      };
    }
  };

  /*****************************************************************************
   * Expects a Node (field or fieldset).
   *
   * Returns an object describing the field's overall validity, as well as
   * a possible error message where additional information may be helpful for
   * the user to complete the field.
   */

  const getValidationData = (field) => {
    switch (field.type) {
      case "text":
      case "textarea":
        return validateText(field);
      case "select-one":
        return validateSelect(field);
      case "fieldset":
        return validateGroup(field);
      case "radio":
      case "checkbox":
        return validateChoice(field);
      case "tel":
        return validatePhone(field);
      case "email":
        return validateEmail(field);
      default:
        throw new Error(
          `The provided field type '${field.tagName}:${field.type}' is not supported in this form.`
        );
    }
  };

  /*****************************************************************************
   * Expects a Node (field or fieldset).
   *
   * Returns the field's overall validity based on conditions set within
   * `getValidationData()`.
   */

  const isValid = (field) => {
    return getValidationData(field).isValid;
  };

  /*****************************************************************************
   * Expects an integer.
   *
   * Returns a promise that either resolves if all fields in a given step are
   * valid, or rejects and returns invalid fields for further processing.
   */

  const validateStep = (currentStep) => {
    const fields = tabPanels[currentStep].querySelectorAll(
      'fieldset, input:not([type="radio"]):not([type="checkbox"]), select, textarea'
    );

    const invalidFields = [...fields].filter((field) => {
      return !isValid(field);
    });

    return new Promise((resolve, reject) => {
      if (invalidFields && !invalidFields.length) {
        resolve();
      } else {
        reject(invalidFields);
      }
    });
  };

  // Form Error and Success

  const FIELD_PARENT_CLASS = "form__field",
    FIELD_ERROR_CLASS = "form__error-text";

  /*****************************************************************************
   * Expects a Node (fieldset) that contains any number of radio or checkbox
   * input elements, and a string representing the group's validation status.
   */

  function updateChoice(fieldset, status, errorId = "") {
    const choices = fieldset.querySelectorAll(
      '[type="radio"], [type="checkbox"]'
    );

    const theButton = fieldset
      .closest("section")
      .querySelector(".button-progress");

    for (const choice of choices) {
      if (status) {
        theButton.disabled = true;
        choice.setAttribute("aria-invalid", "true");
        choice.setAttribute("aria-describedby", errorId);
      } else {
        theButton.disabled = false;
        choice.removeAttribute("aria-invalid");
        choice.removeAttribute("aria-describedby");
      }
    }
  }

  /*****************************************************************************
   * Expects a Node (field or fieldset) that either has the class name defined
   * by `FIELD_PARENT_CLASS`, or has a parent with that class name. Optional
   * string defines the error message.
   *
   * Builds and appends an error message to the parent element, or updates an
   * existing error message.
   *
   * https://www.davidmacd.com/blog/test-aria-describedby-errormessage-aria-live.html
   */

  function reportError(
    field,
    message = "Please complete this required field."
  ) {
    const fieldParent = field.closest(`.${FIELD_PARENT_CLASS}`);

    if (progressForm.contains(fieldParent)) {
      let fieldError = fieldParent.querySelector(`.${FIELD_ERROR_CLASS}`),
        fieldErrorId = "";

      if (!fieldParent.contains(fieldError)) {
        fieldError = document.createElement("p");

        if (field.matches("fieldset")) {
          fieldErrorId = `${field.id}__error`;

          updateChoice(field, true, fieldErrorId);
        } else if (field.matches('[type="radio"], [type="checkbox"]')) {
          fieldErrorId = `${field.closest("fieldset").id}__error`;

          updateChoice(field.closest("fieldset"), true, fieldErrorId);
        } else {
          fieldErrorId = `${field.id}__error`;

          field.setAttribute("aria-invalid", "true");
          field.setAttribute("aria-describedby", fieldErrorId);
        }

        fieldError.id = fieldErrorId;
        fieldError.classList.add(FIELD_ERROR_CLASS);

        fieldParent.appendChild(fieldError);
      }

      fieldError.textContent = message;
    }
  }

  /*****************************************************************************
   * Expects a Node (field or fieldset) that either has the class name defined
   * by `FIELD_PARENT_CLASS`, or has a parent with that class name.
   *
   * https://www.davidmacd.com/blog/test-aria-describedby-errormessage-aria-live.html
   */

  function reportSuccess(field) {
    const fieldParent = field.closest(`.${FIELD_PARENT_CLASS}`);

    if (progressForm.contains(fieldParent)) {
      const fieldError = fieldParent.querySelector(`.${FIELD_ERROR_CLASS}`);

      if (fieldParent.contains(fieldError)) {
        if (field.matches("fieldset")) {
          updateChoice(field, false);
        } else if (field.matches('[type="radio"], [type="checkbox"]')) {
          updateChoice(field.closest("fieldset"), false);
        } else {
          field.removeAttribute("aria-invalid");
          field.removeAttribute("aria-describedby");
        }

        fieldParent.removeChild(fieldError);
      }
    }
  }

  /*****************************************************************************
   * Expects a Node (field or fieldset).
   *
   * Reports the field's overall validity to the user based on conditions set
   * within `getValidationData()`.
   */

  function reportValidity(field) {
    const validation = getValidationData(field);

    if (!validation.isValid && validation.message) {
      reportError(field, validation.message);
    } else if (!validation.isValid) {
      reportError(field);
    } else {
      reportSuccess(field);
    }
  }

  // Form Progression

  /*****************************************************************************
   * Resets the state of all tabs and tab panels.
   */

  function deactivateTabs() {
    // Reset state of all tab items
    tabItems.forEach((tab) => {
      tab.setAttribute("aria-selected", "false");
      tab.setAttribute("tabindex", "-1");
    });

    // Reset state of all panels
    tabPanels.forEach((panel) => {
      panel.setAttribute("hidden", "");
    });
  }

  /*****************************************************************************
   * Expects an integer.
   *
   * Shows the desired tab and its associated tab panel, then updates the form's
   * current step to match the tab's index.
   */

  function activateTab(index) {
    const thisTab = tabItems[index],
      thisPanel = tabPanels[index];

    // Close all other tabs
    deactivateTabs();

    // Focus the activated tab for accessibility
    thisTab.focus();

    // Set the interacted tab to active
    thisTab.setAttribute("aria-selected", "true");
    thisTab.removeAttribute("tabindex");

    // Display the associated tab panel
    thisPanel.removeAttribute("hidden");

    // Update the current step with the interacted tab's index value
    currentStep = index;
  }

  /*****************************************************************************
   * Expects an event from a click listener.
   */

  function clickTab(e) {
    activateTab([...tabItems].indexOf(e.currentTarget));
  }

  /*****************************************************************************
   * Expects an event from a keydown listener.
   */

  function arrowTab(e) {
    const { keyCode, target } = e;

    /**
     * If the current tab has an enabled next/previous sibling, activate it.
     * Otherwise, activate the tab at the beginning/end of the list.
     */

    const targetPrev = target.previousElementSibling,
      targetNext = target.nextElementSibling,
      targetFirst = target.parentElement.firstElementChild,
      targetLast = target.parentElement.lastElementChild;

    const isDisabled = (node) => node.hasAttribute("aria-disabled");

    switch (keyCode) {
      case 37: // Left arrow
        if (progressForm.contains(targetPrev) && !isDisabled(targetPrev)) {
          activateTab(currentStep - 1);
        } else if (!isDisabled(targetLast)) {
          activateTab(tabItems.length - 1);
        }
        break;
      case 39: // Right arrow
        if (progressForm.contains(targetNext) && !isDisabled(targetNext)) {
          activateTab(currentStep + 1);
        } else if (!isDisabled(targetFirst)) {
          activateTab(0);
        }
        break;
    }
  }

  /*****************************************************************************
   * Expects a boolean.
   *
   * Updates the visual state of the progress bar and makes the next tab
   * available for interaction (if there is a next tab).
   */

  // Immediately attach event listeners to the first tab (happens only once)

  function initTabs() {
    tabItems[0].addEventListener("click", clickTab);
    tabItems[0].addEventListener("keydown", arrowTab);
  }

  tabItems[0].addEventListener("click", clickTab);
  tabItems[0].addEventListener("keydown", arrowTab);

  function handleProgress(isComplete) {
    const currentTab = tabItems[currentStep],
      nextTab = tabItems[currentStep + 1];

    if (isComplete) {
      currentTab.setAttribute("data-complete", "true");

      /**
       * Verify that there is, indeed, a next tab before modifying or listening
       * to it. In case we've reached the last item in the tablist.
       */

      if (progressForm.contains(nextTab)) {
        nextTab.removeAttribute("aria-disabled");

        nextTab.addEventListener("click", clickTab);
        nextTab.addEventListener("keydown", arrowTab);
      }
    } else {
      currentTab.setAttribute("data-complete", "false");
    }
  }

  // Form Interactions

  /*****************************************************************************
   * Returns a function that only executes after a delay.
   *
   * https://davidwalsh.name/javascript-debounce-function
   */

  const debounce = (fn, delay = 500) => {
    let timeoutID;

    return (...args) => {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }

      timeoutID = setTimeout(() => {
        fn.apply(null, args);
        timeoutID = null;
      }, delay);
    };
  };

  /*****************************************************************************
   * Waits 0.5s before reacting to any input events. This reduces the frequency
   * at which the listener is fired, making the errors less "noisy". Improves
   * both performance and user experience.
   */
  // function collectResponses() {
  //   answers.length = 0; // Clear existing responses
  //   questions.forEach(question => {
  //     const inputElement = document.getElementById(`answer-${question.question_id}`);
  //     if (inputElement) {
  //       const response = {
  //         id: question.question_id,
  //         value: question.question_type === "yes-no" ? [parseInt(inputElement.value, 10)] : [inputElement.value],
  //       };
  //       answers.push(response);
  //     }
  //   });
  // }

  progressForm.addEventListener(
    "input",
    debounce((e) => {
      const { target } = e;
      const isMultipleSelection = target.type === "checkbox";
      const isFreeText = target.type === "text";
      const isRadioSelection = target.type === "radio";

      const response = {
        id: parseInt(target.name, 10),
        value: isRadioSelection ? [parseInt(target.value, 10)] : [target.value],
      };

      const existingAnswerIndex = answers.findIndex(
        (answer) => answer.id === response.id
      );
      if (isMultipleSelection || existingAnswerIndex === -1) {
        answers.push(response);
      } else {
        answers[existingAnswerIndex] = response;
      }

      console.log(answers);
      let currentVisibleTabs = findVisibleTabs(answers, conditional_questions);
      console.log("currentVisibleTabs:", currentVisibleTabs);

      validateStep(currentStep)
        .then(() => {
          // Update the progress bar (step complete)
          handleProgress(true);

          // Progress to the next step
          const isLastTab = currentStep === tabItems.length - 1;
          if (!isLastTab && !isMultipleSelection && !isFreeText) {
            activateTab(currentStep + 1);
            handleFromSteps(currentStep);
          }
        })
        .catch((invalidFields) => {
          // Update the progress bar (step incomplete)
          handleProgress(false);
          // Show errors for any invalid fields
          invalidFields.forEach((field) => {
            reportValidity(field);
          });

          // Focus the first found invalid field for the user
          invalidFields[0].focus();
        });

      // Display or remove any error messages
      reportValidity(target);

      if (target.matches('[data-action="prev"]')) {
        // Revisit the previous step
        activateTab(currentStep - 1);
        handleFromSteps(currentStep);
      }
    })
  );

  /****************************************************************************/

  progressForm.addEventListener("click", (e) => {
    const { target } = e;

    if (target.matches('[data-action="next"]')) {
      validateStep(currentStep)
        .then(() => {
          // Update the progress bar (step complete)
          handleProgress(true);

          // Progress to the next step
          activateTab(currentStep + 1);
          handleFromSteps(currentStep);
        })
        .catch((invalidFields) => {
          // Update the progress bar (step incomplete)
          handleProgress(false);

          // Show errors for any invalid fields
          invalidFields.forEach((field) => {
            reportValidity(field);
          });

          // Focus the first found invalid field for the user
          invalidFields[0].focus();
        });
    }

    if (target.matches('[data-action="prev"]')) {
      // Revisit the previous step
      activateTab(currentStep - 1);
      handleFromSteps(currentStep);
    }
  });

  /****************************************************************************/
  function handleFromSteps(activeStep) {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    const currentPercentage = Math.ceil((activeStep / tabPanels.length) * 100);
    handleProgressBar(currentPercentage);
  }

  /****************************************************************************/
  function handleProgressBar(progressPercentage) {
    // console.log("currentPercentage:", progressPercentage);
    formProgressBar.style.width = progressPercentage + "%";
    formProgressBar.innerHTML = progressPercentage + "%";
  }

  // Form Submission

  /****************************************************************************/

  function disableSubmit() {
    const submitButton = progressForm.querySelector('[type="submit"]');

    if (progressForm.contains(submitButton)) {
      // Update the state of the submit button
      submitButton.setAttribute("disabled", "");
      submitButton.textContent = "Submitting...";
    }
    handleProgressBar(100);
  }

  /****************************************************************************/
  function handleSuccess(response, nextURL) {
    window.location.href = nextURL;
    console.log("HIT via Consultancy HandleSuccess");
    console.log(response);
    // window.setTimeout(function () {
    //   window.location.href = "/pages/medical-information";
    //   console.log("#sec passed!");
    // }, 3000);
  }

  /****************************************************************************/

  function handleError(error) {
    const submitButton = progressForm.querySelector('[type="submit"]');

    if (progressForm.contains(submitButton)) {
      const errorText = document.createElement("p");

      // Reset the state of the submit button
      submitButton.removeAttribute("disabled");
      submitButton.textContent = "Submit";

      // Display an error message for the user
      errorText.classList.add("m-0", "form__error-text");
      errorText.textContent = `Sorry, your submission could not be processed.
        Please try again. If the issue persists, please contact our support
        team. Error message: ${error}`;

      submitButton.parentElement.prepend(errorText);
    }
  }

  /*****************************************************************************
   * Returns the user's IP address.
   */

  async function getIP(url = "https://api.ipify.org?format=json") {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  }

  /*****************************************************************************
   * Generating UUID.
   */

  async function getUUID() {
    const uuid = self.crypto.randomUUID();
    return uuid;
  }

  /*****************************************************************************
   * POSTs to the specified endpoint.
   */

  async function postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST",
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

  /****************************************************************************/

  progressForm.addEventListener("submit", (e) => {
    // Prevent the form from submitting
    e.preventDefault();

    /*****************************************************************************
     * Get Treatment information
     */
    const current_treatment_type = localStorage.getItem("treatment_type");
    const current_condition_id = parseInt(localStorage.getItem("condition_id"));
    const current_treatment_id = parseInt(localStorage.getItem("treatment_id"));

    const currentAssessmentFormType = localStorage.getItem(
      "current_assessment_form_type"
    );
    // console.log(
    //   "#________> currentAssessmentFormType:",
    //   currentAssessmentFormType
    // );

    const hasAnotherTreatmentForm = localStorage.getItem(
      "has_another_treatment_form"
    );
    // console.log("#________> hasAnotherTreatmentForm:", hasAnotherTreatmentForm);

    const current_treatment_form_index = parseInt(
      localStorage.getItem("current_treatment_form_index")
    );
    // console.log(
    //   "#________> current_treatment_form_index:",
    //   current_treatment_form_index
    // );

    // Get the API endpoint using the form action attribute
    const form = e.currentTarget,
      API = new URL(form.action);

    validateStep(currentStep)
      .then(() => {
        // Indicate that the submission is working
        disableSubmit();

        // Prepare the data
        const formData = new FormData(form);
        formTime = new Date().toJSON();

        const updatedFormData = {};

        localStorage.setItem(
          "0_answers_data_init_form:",
          JSON.stringify(formData)
        );

        //Handle single and multiple check-box's answers..
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');

        const checkedQuestionNames = [];

        checkboxes.forEach((checkbox) => {
          if (checkbox.checked) {
            const name = checkbox.name;
            if (!checkedQuestionNames.includes(name)) {
              checkedQuestionNames.push(name);
            }
          }
        });

        for (const [name, value] of formData.entries()) {
          if (checkedQuestionNames.includes(name)) {
            if (!updatedFormData[name]) {
              updatedFormData[name] = [];
            }
            updatedFormData[name].push(value);
          } else {
            updatedFormData[name] = value;
          }
        }

        console.log(updatedFormData);
        localStorage.setItem(
          "1_answers_data_mod_checkbox:",
          JSON.stringify(updatedFormData)
        );

        // //convert object properties to integer (except the array and string with alphabetic values)
        // function convertIntObj(obj) {
        //   const result = {};
        //   for (var key in obj) {
        //     if (obj.hasOwnProperty(key)) {
        //       var value = obj[key];
        //       var integerValue = parseInt(value, 10);
        //       // Check if the value contains non-integer characters or spaces, or the value can be parsed as an integer
        //       if (/[^0-9\s]/.test(value) || isNaN(integerValue)) {
        //         // If it does, store it as an array with the original value
        //         result[key] = [value];
        //       } else {
        //         // If not,  store it as an integer
        //         result[key] = integerValue;
        //       }
        //     }
        //   }
        //   return result;
        // }
        // const consultancyDataIntObj = convertIntObj(updatedData);
        // console.log("Answers data - prop to int:", consultancyDataIntObj);
        // localStorage.setItem(
        //   "2_answers_data_prop_int:",
        //   JSON.stringify(consultancyDataIntObj)
        // );

        //convert to match TIP accepted datatype, e.g. {"90": 1, "91": 0,} into  [{"question": 90,"answer": 1},{"question": 91,"answer": 1},
        // function convertIntoTipPayload(obj) {
        //   var result = [];

        //   for (var key in obj) {
        //     if (obj.hasOwnProperty(key)) {
        //       var question = parseInt(key, 10);
        //       var answer = obj[key];
        //       result.push({ question: question, answer: answer });
        //     }
        //   }
        //   return result;
        // }

        // const consultancyFormData = convertIntoTipPayload(
        //   consultancyDataIntObj
        // );

        const consultancyFormData = Object.keys(updatedFormData).map((key) => {
          let answer = updatedFormData[key];
          if (answer === "0" || answer === "1") {
            answer = parseInt(answer);
          }
          return {
            question: parseInt(key),
            answer: answer,
          };
        });

        console.log("Answers data - final data:", consultancyFormData);
        localStorage.setItem(
          "3_answers_data_final:",
          JSON.stringify(consultancyFormData)
        );

        // Get the user's IP address (for fun)
        // Build the final data structure, including the IP
        // POST the data and handle success or error
        // getIP()
        //   .then((response) => {
        //     return {
        //       fields: consultancyFormArray,
        //       meta: {
        //         submittedAt: formTime,
        //         ipAddress: response.ip,
        //       },
        //     };
        //   })
        //   .then((data) => postData(API, data))

        // console.log(
        //   "#____1____> hasAnotherTreatmentForm:",
        //   hasAnotherTreatmentForm
        // );
        getUUID()
          .then((uuid) => {
            var setUUID;
            // console.log(
            //   "#____2____> hasAnotherTreatmentForm:",
            //   hasAnotherTreatmentForm
            // );

            if (currentAssessmentFormType === "treatment") {
              if (!!current_condition_id) {
                setUUID = localStorage.getItem("submission_uuid");
              } else {
                if (current_treatment_form_index === 1) {
                  localStorage.setItem("submission_uuid", (setUUID = uuid));
                } else {
                  setUUID = localStorage.getItem("submission_uuid");
                }
              }
            } else {
              localStorage.setItem("submission_uuid", (setUUID = uuid));
            }

            // if (currentAssessmentFormType === "condition") {
            //   localStorage.setItem("submission_uuid", (setUUID = uuid));
            // } else if (currentAssessmentFormType === "treatment") {

            //   if (
            //     (current_condition_id && hasAnotherTreatmentForm === "yes") ||
            //     (hasAnotherTreatmentForm === "no" &&!current_treatment_form_index === 1)
            //   ) {
            //     setUUID = localStorage.getItem("submission_uuid");
            //   } else {
            //     localStorage.setItem("submission_uuid", (setUUID = uuid));
            //   }
            // } else {
            //   console.log(
            //     "Unable to set UUID for, Unsupported assessment form type!"
            //   );
            // }

            // console.log(
            //   "#____3____> hasAnotherTreatmentForm:",
            //   hasAnotherTreatmentForm
            // );
            return {
              submission_uuid: setUUID,
              treatment_type: current_treatment_type,
              condition_id: current_condition_id,
              treatment_id: current_treatment_id,
              submitted_at: formTime,
              current_assessment_form_type: currentAssessmentFormType,
              has_another_treatment_form: hasAnotherTreatmentForm,
              treatment_form_index: current_treatment_form_index,
              consultancy: consultancyFormData,
            };
          })
          .then((data) => postData(API, data))
          .then((response) => {
            var setNextURL;
            // console.log(
            //   "#____4____> hasAnotherTreatmentForm:",
            //   hasAnotherTreatmentForm
            // );
            if (currentAssessmentFormType === "condition") {
              if (!current_treatment_id) {
                setNextURL = `/pages/medical-information/?treatmentType=${current_treatment_type}&conditionId=${current_condition_id}&treatmentId=${current_treatment_id}`;
              } else {
                localStorage.setItem(
                  "current_assessment_form_type",
                  "treatment"
                );
                setNextURL = `/pages/consultancy/?treatmentType=${current_treatment_type}&conditionId=${current_condition_id}&treatmentId=${current_treatment_id}`;
              }
            } else {
              if (hasAnotherTreatmentForm === "yes") {
                // console.log(
                //   "if________> hasAnotherTreatmentForm:",
                //   hasAnotherTreatmentForm
                // );
                setNextURL = `/pages/consultancy/?treatmentType=${current_treatment_type}&conditionId=${current_condition_id}&treatmentId=${current_treatment_id}`;
              } else {
                // console.log(
                //   "else________> hasAnotherTreatmentForm:",
                //   hasAnotherTreatmentForm
                // );
                setNextURL = `/pages/medical-information/?treatmentType=${current_treatment_type}&conditionId=${current_condition_id}&treatmentId=${current_treatment_id}`;
              }
            }

            // if (currentAssessmentFormType === "condition") {
            //   setNextURL = !current_treatment_id
            //     ? `/pages/medical-information/?treatmentType=${current_treatment_type}&conditionId=${current_condition_id}&treatmentId=${current_treatment_id}`
            //     : (() => {
            //         localStorage.setItem(
            //           "current_assessment_form_type",
            //           "treatment"
            //         );
            //         return `/pages/consultancy/?treatmentType=${current_treatment_type}&conditionId=${current_condition_id}&treatmentId=${current_treatment_id}`;
            //       })();
            // } else {
            //   setNextURL =
            //     hasAnotherTreatmentForm === "yes"
            //       ? `/pages/consultancy/?treatmentType=${current_treatment_type}&conditionId=${current_condition_id}&treatmentId=${current_treatment_id}`
            //       : `/pages/medical-information/?treatmentType=${current_treatment_type}&conditionId=${current_condition_id}&treatmentId=${current_treatment_id}`;
            // }

            setTimeout(() => {
              handleSuccess(response, setNextURL);
            }, 1000); // An artificial delay to show the state of the submit button
          })
          .catch((error) => {
            setTimeout(() => {
              handleError(error);
            }, 1000); // An artificial delay to show the state of the submit button
          });
      })
      .catch((invalidFields) => {
        // Show errors for any invalid fields
        console.log(invalidFields);

        invalidFields.forEach((field) => {
          reportValidity(field);
        });

        // Focus the first found invalid field for the user
        invalidFields[0].focus();
      });
  });
};
