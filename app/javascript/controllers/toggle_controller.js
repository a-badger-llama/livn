import { Toggle } from "tailwindcss-stimulus-components"

export default class extends Toggle {
  static targets = ["toggleClass"]

  connect() {
    super.connect()
  }

  toggle(event) {
    super.toggle(event)
    this.toggleClassTargets.forEach(
      (element) => {
        element.classList.toggle(element.dataset.toggleClass)
      }
    )
  }
}
