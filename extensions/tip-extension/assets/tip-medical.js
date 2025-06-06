console.clear();

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
  // Global Constants

  const progressForm = document.getElementById("progress-form");

  const tabItems = progressForm.querySelectorAll('[role="tab"]'),
    tabPanels = progressForm.querySelectorAll('[role="tabpanel"]');

  let currentStep = 0;

  /*****************************************************************************
   * Get Treatment information
   */
  const current_treatment_type = localStorage.getItem("treatment_type");
  const current_condition_id = localStorage.getItem("condition_id");
  const current_treatment_id = localStorage.getItem("treatment_id");

  const current_submission_uuid = localStorage.getItem("submission_uuid");
  const current_targeted_product_url = localStorage.getItem(
    "targeted_product_url"
  );

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
    const isDateField = ["day", "month", "year"].includes(field.name);

    if (val === "") {
      if (field.required && !isDateField) {
        return {
          isValid: false,
          message: "Please select an option from the dropdown menu.",
        };
      } else if (isDateField) {
        return {
          isValid: false,
          message: "Please select a valid date.",
        };
      }
    }

    return { isValid: true };
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
      if (choice.required) {
        isRequired = true;
      }

      if (choice.checked) {
        isChecked = true;
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
      case "date":
      case "number":
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
        // console.log("Nop nop");
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

    for (const choice of choices) {
      if (status) {
        choice.setAttribute("aria-invalid", "true");
        choice.setAttribute("aria-describedby", errorId);
      } else {
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

  progressForm.addEventListener(
    "input",
    debounce((e) => {
      const { target } = e;

      validateStep(currentStep)
        .then(() => {
          // Update the progress bar (step complete)
          handleProgress(true);
        })
        .catch(() => {
          // Update the progress bar (step incomplete)
          handleProgress(false);
        });

      // Display or remove any error messages
      reportValidity(target);
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
    }
  });

  // Form Submission

  /****************************************************************************/

  function disableSubmit() {
    const submitButton = progressForm.querySelector('[type="submit"]');

    if (progressForm.contains(submitButton)) {
      // Update the state of the submit button
      submitButton.setAttribute("disabled", "");
      submitButton.textContent = "Submitting...";
    }
  }

  /****************************************************************************/
  function handleSuccess(response) {
    localStorage.setItem(
      "tip_unique_form_number",
      "Done-" +
        current_submission_uuid +
        current_condition_id +
        current_treatment_id
    );
    localStorage.setItem("current_assessment_form_type", "medical");
    window.location.href = current_targeted_product_url;
    console.log("HIT via Medical HandleSuccess");
    console.log(response);

    // const thankYou = progressForm.querySelector("#progress-form__thank-you");

    // // Clear all HTML Nodes that are not the thank you panel
    // while (progressForm.firstElementChild !== thankYou) {
    //   progressForm.removeChild(progressForm.firstElementChild);
    // }

    // thankYou.removeAttribute("hidden");

    // // Logging the response from httpbin for quick verification
    // console.log(response);
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
   * Generating UUID.
   */

  async function getUUID() {
    return current_submission_uuid;
  }

  /*****************************************************************************
   *
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
   * POSTs to the specified endpoint.
   */

  async function postData(url = "", data = {}) {
    // console.log("postData:url", url, "data:", data);

    try {
      // Force string url and include a dummy method for safety
      const safeUrl = String(url);
      const options = {
        method: "POST", // important for the wrapper
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };

      // Defensive: set fetch input to something that won’t break the override
      const response = await fetch(safeUrl, options);

      // console.log("response", response);
      // console.log("response.ok", response.ok);

      const responseData = await response.json();
      // console.log("responseData", responseData);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return responseData;
    } catch (error) {
      console.error("Error in postData:", error);
      throw error;
    }
  }

  /****************************************************************************/

  progressForm.addEventListener("submit", (e) => {
    // Prevent the form from submitting
    e.preventDefault();

    // Get the API endpoint using the form action attribute
    const form = e.currentTarget,
      API = new URL(form.action);

    validateStep(currentStep)
      .then(() => {
        // Prepare the data
        const formData = new FormData(form);
        const formTime = new Date().toJSON();

        // Extract only the required fields
        let medicalFormObj = {
          phone: formData.get("phone"),
          dob: formData.get("dob"), // Initial dob (before confirmation)
          gender: formData.get("gender"),
        };

        console.log("Form Data Before Confirmation:", medicalFormObj);

        // Convert `yyyy-mm-dd` to `dd/mm/yyyy` format for display
        let [year, month, day] = medicalFormObj.dob.split("-");
        let displayDob = `${day}/${month}/${year}`;

        // Show the confirmation popup with selected DOB
        document.getElementById(
          "dob-display"
        ).innerText = `You selected: ${displayDob}`;
        document.getElementById("confirmation-popup").style.display = "flex";

        // Store form reference to submit later
        window.pendingFormSubmission = {
          form: form,
          api: API,
          formTime: formTime,
          medicalFormObj: medicalFormObj, // Store for modification
        };
      })
      .catch((invalidFields) => {
        // Show errors for any invalid fields
        invalidFields.forEach((field) => {
          reportValidity(field);
        });

        // Focus the first found invalid field for the user
        invalidFields[0].focus();
      });
  });

  // Confirm button: Update `medicalFormObj.dob` and submit
  document.getElementById("confirm-btn").addEventListener("click", function () {
    document.getElementById("confirmation-popup").style.display = "none"; // Hide popup

    if (window.pendingFormSubmission) {
      let { form, api, formTime, medicalFormObj } =
        window.pendingFormSubmission;

      // Update the dob with confirmed value
      medicalFormObj.dob = document.getElementById("dob").value;

      console.log("Confirmed DOB:", medicalFormObj.dob);
      console.log("Updated Form Data Before Submission:", medicalFormObj);

      // Indicate that the submission is working
      disableSubmit();

      getUUID()
        .then((uuid) => {
          return {
            submission_uuid: uuid,
            treatment_type: current_treatment_type,
            condition_id: parseInt(current_condition_id),
            treatment_id: parseInt(current_treatment_id),
            submitted_at: formTime,
            medical: medicalFormObj, // Now has the updated DOB
          };
        })
        .then((data) => postData(api, data))
        .then((response) => {
          setTimeout(() => {
            handleSuccess(response);
          }, 3000); // An artificial delay to show the state of the submit button
        })
        .catch((error) => {
          setTimeout(() => {
            handleError(error);
          }, 3000); // An artificial delay to show the state of the submit button
        });

      // Clear pending submission object
      window.pendingFormSubmission = null;
    }
  });

  // Modify button: Close popup without submitting
  document.getElementById("modify-btn").addEventListener("click", function () {
    document.getElementById("confirmation-popup").style.display = "none"; // Close popup
    window.pendingFormSubmission = null; // Clear stored form submission
  });
});
