class Message < ApplicationRecord
  belongs_to :chat
  belongs_to :user
  has_many :children, class_name: "Message", foreign_key: "parent_id", dependent: :destroy

  broadcasts_to ->(message) { [message.chat, :messages] }, target: ->(message) { "chat_#{message.chat.id}_messages" }

  validates :content, presence: true
  validates :role, presence: true

  enum :role, {
    user:      "user",
    assistant: "assistant",
    system:    "system"
  }

  enum :status, {
    completed:   "completed",
    failed:      "failed",
    in_progress: "in_progress",
    incomplete:  "incomplete"
  }

  enum :model, {
    "gpt-3.5-turbo" => "gpt-3.5-turbo"
  }

  enum :type, {
    AIMessage: "AIMessage",
    UserMessage: "UserMessage"
  }

  validates :role, presence: true

  default_scope { order(created_at: :asc) }
end
