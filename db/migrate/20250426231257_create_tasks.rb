class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description
      t.datetime :due_at
      t.boolean :has_due_time, default: false
      t.datetime :completed_at
      t.integer :position, default: 0
      t.references :user, null: false, foreign_key: true
      t.references :taskable, polymorphic: true

      t.timestamps
    end
  end
end
