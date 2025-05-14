import {Controller} from "@hotwired/stimulus";
import {Turbo}      from "@hotwired/turbo-rails";
import debounce     from "debounce";

const CSRF_TOKEN_SELECTOR = "[name='csrf-token']";

export default class extends Controller {
  static values = {id: Number};
  static targets = ["attribute", "complete", "domId", "display", "form", "title", "dragHandle", "description"];
  static classes = [ "hidden"]

  connect() {
    this.initializeDebouncedMethods();
    this.pendingStream = null;
    this.element.addEventListener("keydown", this.handleKeydown.bind(this));
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
    this.dragHandleTarget.classList.remove("opacity-0");
    this.element.classList.remove("drag-handle");
    this.dragHandleTarget.classList.add("drag-handle");
  }

  handleKeydown(event) {
    if (event.key === "Escape") return this.element.blur();
    if (event.key === "ArrowUp") return this._moveUp(event);
    if (event.key === "ArrowDown") return this._moveDown(event);
    // Any key from the task opens the form, other than escape or arrow up/down
    if (this._taskHasFocus()) return this._focusTitle();

    if (this._titleHasFocus()) {
      // 'Enter' from the title input submits the current form and inserts a new task
      if (event.key === "Enter") return this._submitAndInsertNew(event);
      // 'Backspace' from the title deletes the task if the title is empty, and puts focus on the previous task
      if (event.key === "Backspace") return this._deleteAndRefocus(event);
    }

    if (document.activeElement === this.descriptionTarget) {
      // from the description input, shift + enter submits the form
      if (event.key === "Enter" && event.shiftKey) return this._submitAndInsertNew(event);
    }
  }

  _taskHasFocus() {
    return document.activeElement === this.element;
  }

  _focusTitle() {
    if (this._titleHasFocus()) return;

    this.titleTarget.focus();
  }

  _titleHasFocus() {
    return document.activeElement === this.titleTarget;
  }

  _moveDown(event) {
    const next = this.element.nextElementSibling;

    if (next) next.focus();
  }

  _moveUp(event) {
    const prev = this.element.previousElementSibling

    if (prev) prev.focus();
  }

  _deleteAndRefocus(event) {
    if (this.titleTarget.value === "") {
      event.preventDefault();
      this.deleteTask();
      this._moveUp(event);
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
    this.dragHandleTarget.classList.add("opacity-0");
    this.element.classList.add("drag-handle");
    this.dragHandleTarget.classList.remove("drag-handle");
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

    requestAnimationFrame(() => {titleInput.focus()});
  }

  insertTask() {
    const newTask = this._createNewTask();
    const titleInput = newTask.querySelector("#title_task");
    this.element.insertAdjacentElement("afterend", newTask);

    requestAnimationFrame(() => {titleInput.focus()});
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
    if (this._isEmpty() || this._hasActiveFocus()) return;

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

  focusIn() {
    if (!this._hasActiveFocus()) return;

    this.element.classList.add("bg-neutral-800");
  }

  focusOut() {
    if (this._hasActiveFocus()) return;

    requestAnimationFrame(() => {
      this.element.classList.remove("bg-neutral-800");

      if (this._shouldRemove()) {
        this.element.remove();
      } else {
        this.hideInputs();
        this.renderSafely();
      }
    })
  }
}
