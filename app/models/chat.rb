class Chat < ApplicationRecord
  broadcasts_refreshes
  belongs_to :user
end
