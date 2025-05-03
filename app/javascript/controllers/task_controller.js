import {Controller} from "@hotwired/stimulus";
import {Turbo}      from "@hotwired/turbo-rails";
import debounce     from "debounce";

const CSRF_TOKEN_SELECTOR = "[name='csrf-token']";

export default class extends Controller {
  static values = {id: Number};
  static targets = ["attribute", "complete", "domId", "display", "form", "title"];

  connect() {
    this.initializeDebouncedMethods();
    this.pendingStream = null;
  }

  initializeDebouncedMethods() {
    this.hideInputs = debounce(this.hideInputs.bind(this), 200);
    this.submitForm = debounce(this.submitForm.bind(this), 500);
    this.deleteTask = debounce(this.deleteTask.bind(this), 500);
  }

  autoSave() {
    this.submitForm();
  }

  toggleCompletion() {
    this.hideSelf();
    this.submitForm();
  }

  showInputs() {
    this.displayTargets.forEach(input => input.classList.remove("hidden"));
  }

  handleKeydown(event) {
    if (event.key === "Enter") this._submitAndInsertNew(event);
    if (event.key === "Backspace") this._deleteAndRefocus(event);
  }

  _deleteAndRefocus(event) {
    if (this.titleTarget.value === "") {
      event.preventDefault();
      this.deleteTask();
    }
  }

  _submitAndInsertNew(event) {
    event.preventDefault();

    if (this._isEmpty() && this._isNew()) return;

    this.submitForm();
    this.insertTask();
  }

  hideInputs() {
    if (this._hasActiveFocus()) return;

    this.displayTargets.forEach(input => input.value === "" ? input.classList.add("hidden") : null);
  }

  hideSelf() {
    this.element.classList.add("hidden");
  }

  _createNewTask() {
    const taskTemplate = document.querySelector("[id='task-template']");
    const clone = taskTemplate.content.cloneNode(true);
    const newTask = clone.firstElementChild;
    newTask.id = `${newTask.id}_${Date.now()}`;
    return newTask;
  }

  prependTask() {
    const newTask = this._createNewTask();
    const titleInput = newTask.querySelector("#title_task");
    document.querySelector("#tasks").prepend(newTask);
    titleInput.focus();
  }

  insertTask() {
    const newTask = this._createNewTask();
    const titleInput = newTask.querySelector("#title_task");
    this.element.insertAdjacentElement("afterend", newTask);
    titleInput.focus();
  }

  async _handleResponse(response) {
    const contentType = response.headers.get("Content-Type") || "";
    if (response.ok && contentType.includes("turbo-stream")) {
      this.pendingStream = await response.text();
      this.renderSafely();
    } else {
      console.warn("Received a non-turbo-stream response");
    }
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  }

  _generateHeaders(contentType = "text/vnd.turbo-stream.html") {
    const csrfToken = document.querySelector(CSRF_TOKEN_SELECTOR)?.content || "";
    return {"X-CSRF-Token": csrfToken, Accept: contentType};
  }

  deleteTask() {
    this.hideSelf();

    if (this._isNew()) return;

    fetch(this.formTarget.action, {
      method:  "DELETE",
      headers: this._generateHeaders(),
    })
    .then(this._handleResponse.bind(this))
    .catch(error => console.error("Task deletion failed:", error));
  }

  submitForm() {
    if (this._isEmpty()) return;

    const formElement = this.formTarget;
    const formData = new FormData(formElement);
    formData.append("dom_id", this.element.id);
    fetch(formElement.action, {
      method:  formElement.method,
      headers: this._generateHeaders(),
      body:    formData,
    })
    .then(this._handleResponse.bind(this))
    .catch(error => console.error("Form submission failed:", error));
  }

  renderSafely() {
    if (this.pendingStream && !this._hasActiveFocus()) {
      Turbo.renderStreamMessage(this.pendingStream);
      this.pendingStream = null;
    }
  }

  _hasActiveFocus() {
    return this.element.contains(document.activeElement);
  }

  _shouldRemove() {
    return this._isEmpty() && this._isNew() && !this._hasActiveFocus();
  }

  _isEmpty() {
    return this.attributeTargets.every(input => input.value === "" || input.value === null);
  }

  _isNew() {
    return this.element.id.includes("new")
  }

  focusOut() {
    if (this._shouldRemove()) {
      this.element.remove();
    } else {
      this.hideInputs();
      this.renderSafely();
    }
  }
}
