class Chat < ApplicationRecord
  belongs_to :user, dependent: :destroy
  has_many :messages
  has_many :ai_messages, -> { where(type: "AIMessage") }
end
