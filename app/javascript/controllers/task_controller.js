import {Controller} from "@hotwired/stimulus";
import debounce from "debounce";

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
    const form = this.element

    console.log("Submitting form", form.action, form.method, new FormData(form))
    // fetch(form.action, {
    //   method: form.method,
    //   headers: { "Accept": "text/vnd.turbo-stream.html" },
    //   body: new FormData(form)
    // })
  }
}
