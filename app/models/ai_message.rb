class AIMessage < Message
  # This model inherits from Message and is used to represent messages sent by the AI.
  # It can have additional validations or methods specific to AI messages if needed.

  # You can add any AI-specific validations or methods here.
  validates :model, presence: true
end
