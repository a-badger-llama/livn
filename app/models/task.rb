class Task < ApplicationRecord
  belongs_to :user
  belongs_to :taskable, polymorphic: true, optional: true

  before_validation :combine_due_date_and_time

  scope :incomplete, -> { where(completed_at: nil) }
  scope :complete, -> { where.not(completed_at: nil) }
  scope :position, -> { order(position: :asc) }
  scope :default_sort, -> { position.order(created_at: :desc) }

  def completed
    completed_at.present?
  end

  def completed=(value)
    if ActiveRecord::Type::Boolean.new.cast(value)
      self.completed_at ||= Time.current
    else
      self.completed_at = nil
    end
  end

  def completed?
    completed_at.present?
  end

  def complete!
    update(completed_at: Time.current)
  end

  def due_date
    @due_date || due_at&.to_date
  end

  def due_date=(value)
    @due_date = value&.to_date
  end

  def due_time
    @due_time || due_at&.strftime("%H:%M")
  end

  def due_time=(value)
    @due_time = value.is_a?(String) ? Time.zone.parse(value)&.strftime("%H:%M") : value&.strftime("%H:%M")
  end

  def due_at=(value)
    @due_date = value
    @due_time = value

    super
  end

  private

  def combine_due_date_and_time
    return if due_date.blank?

    time_part = due_time.presence || "00:00"

    self.due_at = Time.zone.parse("#{due_date} #{time_part}")
  end
end
