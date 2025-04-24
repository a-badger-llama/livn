class MessagesController < ApplicationController
  before_action :set_message, only: [:show, :edit, :update, :destroy]

  # GET /messages
  def index
    @pagy, @messages = pagy(Message.sort_by_params(:updated_at, sort_direction))
  end

  # GET /messages/1 or /messages/1.json
  def show
  end

  # GET /messages/new
  def new
    @message = Message.new
  end

  # GET /messages/1/edit
  def edit
  end

  # POST /messages or /messages.json
  def create
    @chat    = Chat.find(params[:chat_id])
    @message = Message.new(message_params.merge(user_id: current_user.id, role: "user", chat_id: params[:chat_id]))

    respond_to do |format|
      if @message.save
        format.turbo_stream
        format.html { redirect_to @message, notice: "Message was successfully created." }
        format.json { render :show, status: :created, location: @message }

        get_ai_response(@message)
      else
        format.turbo_stream { render turbo_stream: turbo_stream.replace("message_form", partial: "messages/form", locals: { message: @message }), status: :unprocessable_entity }
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @message.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /messages/1 or /messages/1.json
  def update
    respond_to do |format|
      if @message.update(message_params)
        format.html { redirect_to @message, notice: "Message was successfully updated." }
        format.json { render :show, status: :ok, location: @message }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @message.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /messages/1 or /messages/1.json
  def destroy
    @message.destroy!
    respond_to do |format|
      format.html { redirect_to messages_path, status: :see_other, notice: "Message was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_message
    @message = Message.find(params.expect(:id))
  rescue ActiveRecord::RecordNotFound
    redirect_to messages_path
  end

  # Only allow a list of trusted parameters through.
  def message_params
    params.expect(message: [:content])
  end

  def get_ai_response(message)
    client = OpenAI::Client.new
    response = client.responses.create(parameters: {
                              model: "gpt-3.5-turbo",
                              input: message.content,
                              previous_response_id: @chat.ai_messages.last&.response_id
                            })
    Message.create!(
      content: response["output"].first["content"].first["text"],
      chat_id: message.chat_id,
      user_id: message.user_id,
      role: "assistant",
      model: "gpt-3.5-turbo",
      parent_id: message.id,
      response_id: response["id"],
      response_json: response,
      status: response["status"],
      type: AIMessage.name,
    )
  end
end
