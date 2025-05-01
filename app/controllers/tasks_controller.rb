class TasksController < ApplicationController
  before_action :set_task, only: [:show, :edit, :update, :destroy]

  # GET /tasks
  def index
    @pagy, @tasks = pagy(Task.open.sort_by_params(params[:sort], sort_direction))
    @pagy, @completed_tasks = pagy(Task.completed.sort_by_params(params[:sort], sort_direction))
  end

  # GET /tasks/1 or /tasks/1.json
  def show
  end

  # GET /tasks/new
  def new
    @task = Task.new

    respond_to do |format|
    end
  end

  # GET /tasks/1/edit
  def edit
  end

  # POST /tasks or /tasks.json
  def create
    @task = Task.new(task_params.merge(user: current_user))

    respond_to do |format|
      if @task.save
        format.json { head :no_content }
      else
        format.json @task.errors, status: :unprocessable_entity
      end
    end
  end

  # PATCH/PUT /tasks/1 or /tasks/1.json
  def update
    respond_to do |format|
      if @task.update(task_params)
        @completed_tasks_size = Task.completed.sort_by_params(params[:sort], sort_direction).size
        format.turbo_stream
        format.json { head :no_content }
      else
        format.json @task.errors, status: :unprocessable_entity
      end
    end
  end

  # DELETE /tasks/1 or /tasks/1.json
  def destroy
    @task.destroy!
    respond_to do |format|
      format.html { redirect_to tasks_path, status: :see_other, notice: "Task was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_task
    @task = Task.find(params.expect(:id))
  rescue ActiveRecord::RecordNotFound
    redirect_to tasks_path
  end

  # Only allow a list of trusted parameters through.
  def task_params
    params.expect(task: [ :title, :description, :due_date, :due_time, :completed ])
  end
end
