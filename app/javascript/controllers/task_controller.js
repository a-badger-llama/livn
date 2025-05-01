import {Controller} from "@hotwired/stimulus";
import debounce from "debounce";
import { Turbo } from "@hotwired/turbo-rails";

export default class extends Controller {
  static values = { id: Number };
  static targets = [
    "display",
    "form",
    "title",
    "titleInput",
  ];

  connect() {
    this.submitForm = debounce(this.submitForm.bind(this), 500);
  }

  autoSave() {
    this.submitForm()
  }

  display() {
    this.displayTargets.forEach(input => input.classList.remove("hidden"));
  }

  hide() {
    this.displayTargets.forEach(input => input.value === "" ? input.classList.add("hidden") : null);
  }

  submitForm() {
    const formElement = this.element;

    const CSRF_TOKEN_SELECTOR = "[name='csrf-token']";
    const TURBO_STREAM_HEADER = "text/vnd.turbo-stream.html";

    const csrfToken = document.querySelector(CSRF_TOKEN_SELECTOR)?.content || "";

    const fetchOptions = {
      method: formElement.method,
      headers: {
        "Accept": TURBO_STREAM_HEADER,
        "X-CSRF-Token": csrfToken,
      },
      body: new FormData(formElement),
    };

    const handleResponse = async (response) => {
      const contentType = response.headers.get("Content-Type") || "";

      if (response.ok && contentType.includes("turbo-stream")) {
        const turboStreamHTML = await response.text();
        Turbo.renderStreamMessage(turboStreamHTML);
      } else {
        console.warn("Received a non-turbo-stream response");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    };

    fetch(formElement.action, fetchOptions)
    .then(handleResponse)
    .catch((error) => console.error("Autosave failed:", error));
  }
}
