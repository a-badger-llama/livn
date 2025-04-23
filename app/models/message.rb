class Message < ApplicationRecord
  belongs_to :chat
  belongs_to :user

  broadcasts_to ->(message) { [message.chat, :messages] }, target: ->(message) { "chat_#{message.chat.id}_messages" }

  validates :content, presence: true
  validates :role, presence: true

  enum :role, {
    user: "user",
    assistant: "assistant",
    system: "system"
  }

  validates :role, presence: true
end
