import {Controller} from "@hotwired/stimulus";
import {Turbo}      from "@hotwired/turbo-rails";
import debounce     from "debounce";

const COMPLETED_TASKS_SELECTOR = "#completed-tasks";
const TASK_LIST_SELECTOR = "#tasks";
const CSRF_TOKEN_SELECTOR = "[name='csrf-token']";

export default class extends Controller {
  static values = {id: Number};
  static targets = ["attribute", "complete", "domId", "display", "form", "title"];

  connect() {
    this.initializeDebouncedMethods();
    this.pendingStream = null;
  }

  initializeDebouncedMethods() {
    this.submitForm = debounce(this.submitForm.bind(this), 500);
    this.deleteTask = debounce(this.deleteTask.bind(this), 500);
  }

  autoSave(event) {
    this.submitForm();
  }

  toggleCompletion() {
    const isComplete = this.completeTarget.checked;
    this.moveTask(this.element, isComplete ? COMPLETED_TASKS_SELECTOR : TASK_LIST_SELECTOR);
    this.submitForm();
  }

  showInputs() {
    console.log("show inputs")
    this.displayTargets.forEach(input => input.classList.remove("hidden"));
  }

  handleKeydown(event) {
    if (event.key === "Enter") this.handleEnterKey(event);
    if (event.key === "Backspace") this.handleDeleteKey(event);
  }

  handleDeleteKey(event) {
    if (this.titleTarget.value === "") {
      event.preventDefault();
      this.deleteTask();
    }
  }

  handleEnterKey(event) {
    event.preventDefault();

    if (this.isEmpty() && this.isNew()) return;

    this.submitForm();
    this.insertTask();
  }

  hideInputs() {
    this.displayTargets.forEach(input =>
                                  input.value === "" ? input.classList.add("hidden") : null
    );
  }

  insertTask() {
    const taskTemplate = document.querySelector("[id='task-template']");
    const clone = taskTemplate.content.cloneNode(true);
    const newTask = clone.firstElementChild;
    const titleInput = newTask.querySelector("#title_task");
    newTask.id = `${newTask.id}_${Date.now()}`;
    this.element.insertAdjacentElement("afterend", newTask);
    titleInput.focus();
  }

  async handleFetchResponse(response) {
    const contentType = response.headers.get("Content-Type") || "";
    if (response.ok && contentType.includes("turbo-stream")) {
      this.pendingStream = await response.text();
      this.renderSafely();
    } else {
      console.warn("Received a non-turbo-stream response");
    }
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  }

  generateHeaders(contentType = "text/vnd.turbo-stream.html") {
    const csrfToken = document.querySelector(CSRF_TOKEN_SELECTOR)?.content || "";
    return {"X-CSRF-Token": csrfToken, Accept: contentType};
  }

  deleteTask() {
    this.element.remove();
    if (!this.isNew()) {
      fetch(this.formTarget.action, {
        method:  "DELETE",
        headers: this.generateHeaders(),
      })
      .then(this.handleFetchResponse.bind(this))
      .catch(error => console.error("Task deletion failed:", error));
    }
  }

  submitForm() {
    if (this.isEmpty()) return;

    const formElement = this.formTarget;
    const formData = new FormData(formElement);
    formData.append("dom_id", this.element.id);
    fetch(formElement.action, {
      method:  formElement.method,
      headers: this.generateHeaders(),
      body:    formData,
    })
    .then(this.handleFetchResponse.bind(this))
    .catch(error => console.error("Form submission failed:", error));
  }

  renderSafely() {
    if (this.pendingStream && !this.hasActiveFocus()) {
      Turbo.renderStreamMessage(this.pendingStream);
      this.pendingStream = null;
    }
  }

  hasActiveFocus() {
    return this.element.contains(document.activeElement);
  }

  shouldRemove() {
    return this.isEmpty() && this.isNew() && !this.hasActiveFocus();
  }

  isEmpty() {
    return this.attributeTargets.every(input => input.value === "" || input.value === null);
  }

  isNew() {
    return this.element.id.includes("new")
  }

  moveTask(taskElement, targetSelector) {
    const targetContainer = document.querySelector(targetSelector);
    taskElement.remove();
    targetContainer.prepend(taskElement.cloneNode(true));
  }

  focusOut() {
    if (this.shouldRemove()) {
      this.deleteTask();
    } else {
      this.hideInputs();
      this.renderSafely();
    }
  }
}
