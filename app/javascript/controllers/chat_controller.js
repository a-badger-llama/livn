// app/javascript/controllers/chat_controller.js
import {Controller} from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "container"]

  connect() {
    this.scrollToBottom()
  }

  handleKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      this.element.requestSubmit()
    }
  }

  autoResize(event) {
    const textarea = event.target
    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  scrollToBottom() {
    if (this.hasContainerTarget) {
      this.containerTarget.scrollTop = this.containerTarget.scrollHeight
    } else {
      const messages = document.querySelector("[data-chat-target='container']")
      if (messages) messages.scrollTop = messages.scrollHeight
    }
  }
}
