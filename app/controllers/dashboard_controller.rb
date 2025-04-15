class DashboardController < ApplicationController
  def show
    @pagy, @chats = pagy(Chat.sort_by_params(params[:sort], sort_direction))
    @chat = Chat.find_by(id: params[:chat_id]) if params[:chat_id].present?
  end
end
