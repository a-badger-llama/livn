class Message < ApplicationRecord
  broadcasts_refreshes_to :chat

  belongs_to :chat
  belongs_to :user

  enum :role, {
    user: "user",
    assistant: "assistant",
    system: "system"
  }

  validates :role, presence: true
end
