require_dependency "jumpstart/application_controller"

module Jumpstart
  class UsersController < ApplicationController
    def index
      users = User.where(admin: [nil, false]).where(User.arel_table[:name].matches("%#{User.sanitize_sql_like(params[:q].to_s)}%"))
      render turbo_stream: helpers.async_combobox_options(users)
    end

    def create
      user = User.find(params[:id])
      Jumpstart.grant_system_admin! user
      render turbo_stream: turbo_stream.append("admin_users", partial: "jumpstart/users/user", locals: {user: user})
    end
  end
end
