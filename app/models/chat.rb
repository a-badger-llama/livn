class Chat < ApplicationRecord
  broadcasts_refreshes
  belongs_to :user, dependent: :destroy
  has_many :messages
end
