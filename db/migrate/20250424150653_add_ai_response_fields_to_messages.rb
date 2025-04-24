class AddAiResponseFieldsToMessages < ActiveRecord::Migration[8.0]
  def change
    add_column :messages, :model, :string
    add_column :messages, :parent_id, :string
    add_column :messages, :response_json, :jsonb
    add_column :messages, :response_id, :string
    add_column :messages, :status, :string, null: false, default: "completed"
    add_column :messages, :type, :string, null: false, default: "UserMessage"
  end
end
