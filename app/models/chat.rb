class Chat < ApplicationRecord
  broadcasts_refreshes
  belongs_to :user
  has_many :messages
end
