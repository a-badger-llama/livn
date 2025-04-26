class Chat < ApplicationRecord
  belongs_to :user, dependent: :destroy
  has_many :messages
  has_many :ai_messages, -> { where(type: "AIMessage") }

  enum :model, {
    "gpt-3.5-turbo" => "gpt-3.5-turbo"
  }
end
