json.extract! task, :id, :title, :description, :due_at, :user_id, :taskable_id, :taskable_type, :created_at, :updated_at
json.url task_url(task, format: :json)
