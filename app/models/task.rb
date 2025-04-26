class Task < ApplicationRecord
  belongs_to :user
  belongs_to :taskable, polymorphic: true, optional: true
end
