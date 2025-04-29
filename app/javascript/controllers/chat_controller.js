import {Controller} from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "messages"]

  connect() {
    this.clearInput()
    this.scrollToBottom() // Scroll to the bottom when the controller connects. Also need to setupscroll to bottom for turbo streams
    this.setupScrollToBottom()
  }

  handleKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()

      const form = this.hasInputTarget ? this.inputTarget.closest("form") : null
      if (form) {
        form.requestSubmit()
      }
    }
  }

  autoResize(event) {
    const textarea = event.target
    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  scrollToBottom() {
    if (this.hasMessagesTarget) {
      requestAnimationFrame(() => {
        this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight
      })
    }
  }

  setupScrollToBottom() {
    if (this.hasMessagesTarget) {
      document.addEventListener("turbo:before-stream-render", () => {
        frames.requestAnimationFrame(() => {
          if (this.shouldAutoScroll()) {
            this.scrollToBottom()
          }
        })
      })
    }
  }

  shouldAutoScroll() {
    const el = this.messagesTarget
    const buffer = 50 // px
    return el.scrollHeight - el.scrollTop - el.clientHeight < buffer
  }


  clearInput() {
    if (this.hasInputTarget) {
      this.inputTarget.value = ""
    }
  }
}
