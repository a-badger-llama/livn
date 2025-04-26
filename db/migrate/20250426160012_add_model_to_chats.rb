class AddModelToChats < ActiveRecord::Migration[8.0]
  def change
    add_column :chats, :model, :string, null: false, default: "gpt-3.5-turbo"
  end
end
