class UserMessage < Message
  # This model inherits from Message and is used to represent messages sent by the user.
  # It can have additional validations or methods specific to user messages if needed.

  # You can add any user-specific validations or methods here.
  # For example, you might want to ensure that the content is not too long:
  # validates :content, length: { maximum: 500 }, allow_blank: true
end
