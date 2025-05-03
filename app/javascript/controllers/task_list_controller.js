import {Controller} from "@hotwired/stimulus";
import Sortable from "sortablejs";

export default class extends Controller {
  static targets = ["task"]

  connect() {
    this.sortable = Sortable.create(this.element, {
      handle: ".drag-handle",
      animation: 150,
      onEnd: this.updatePositions.bind(this),
    })
  }

  updatePositions(event) {
    const ids = this.taskTargets.map((task) => task.dataset.id)

    fetch("/tasks/reorder", {
      method: "POST",
      headers: {
        "X-CSRF-Token": document.querySelector("[name='csrf-token']").content,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    })
  }
}
