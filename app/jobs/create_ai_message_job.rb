class CreateAIMessageJob < ApplicationJob
  queue_as :critical

  def perform(user_message_id:)
    user_message = Message.find(user_message_id)

    CreateAIMessages.new(message: user_message).call
  end
end
