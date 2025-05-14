import {Controller} from "@hotwired/stimulus";
import Sortable from "sortablejs";

export default class extends Controller {
  static targets = ["task"]

  connect() {
    this.sortable = Sortable.create(this.element, {
      handle: ".drag-handle",
      animation: 150,
      onEnd: this.updatePositions.bind(this),
      onMove: this.handleMove.bind(this),
      // chosenClass: "opacity-100",
      // ghostClass: "opacity-0",
    })
    document.addEventListener("turbo:before-stream-render", this.updatePositions.bind(this))
    document.addEventListener("dragstart", this.dragStart.bind(this))
    document.addEventListener("dragend", this.dragEnd.bind(this))
  }

  updatePositions(event) {
    requestAnimationFrame(() => {
      const ids = this.taskTargets.map((task) => task.dataset.id)

      fetch("/tasks/reorder", {
        method: "POST",
        headers: {
          "X-CSRF-Token": document.querySelector("[name='csrf-token']").content,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      })
    })
  }

  handleMove(event) {
    // Remove existing underline
    document.querySelectorAll('.drop-indicator').forEach(el => el.remove());

    // Create a new underline indicator
    const dropIndicator = document.createElement("div");
    dropIndicator.className = "drop-indicator border-b-2 border-primary";

    // Insert the indicator before or after the target element based on direction
    if (event.willInsertAfter) {
      event.to.insertBefore(dropIndicator, event.related.nextSibling.nextElementSibling);
    } else {
      event.to.insertBefore(dropIndicator, event.related);
    }
  }

  dragStart(event) {
    document.activeElement.classList.add("cursor-grabbing")
    // focus the task target being moved
    this.taskTargets.forEach(task => {
      if (task.dataset.id == event.target.dataset.id) {
        task.focus()
      }
    })
  }

  dragEnd(event) {
    document.activeElement.classList.remove("cursor-grabbing")
    requestAnimationFrame(() => {
      document.querySelectorAll('.drop-indicator').forEach(el => el.remove());
      this.taskTargets.forEach(task => {
        task.blur()
      })
    })
  }
}
