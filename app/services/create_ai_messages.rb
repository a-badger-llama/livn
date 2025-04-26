# frozen_string_literal: true

class CreateAIMessages
  attr_accessor :chat, :client, :message, :response

  def initialize(message:)
    @client  = OpenAI::Client.new
    @chat    = message.chat
    @message = message
  end

  def call
    get_ai_response
  end

  private

  def call_api
    @response = client.responses.create(parameters: {
      model:                chat.model_before_type_cast,
      input:                message.content,
      previous_response_id: chat.ai_messages.last&.response_id
    })
  end

  def create_ai_message
    AIMessage.create!(
      chat_id:       chat.id,
      content:       response["output"].first["content"].first["text"],
      model:         chat.model,
      parent_id:     message.id,
      role:          "assistant",
      response_id:   response["id"],
      response_json: response,
      status:        response["status"],
      user_id:       chat.user_id
    )
  end

  def get_ai_response
    call_api
    create_ai_message
  end
end
