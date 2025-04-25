module ApplicationHelper
  include Pagy::Frontend

  def render_markdown(content)
    renderer = Redcarpet::Render::HTML.new(
      filter_html: true,
      hard_wrap: true
    )

    markdown = Redcarpet::Markdown.new(
      renderer,
      autolink: true,
      fenced_code_blocks: true,
      strikethrough: true,
      underline: true
    )

    markdown.render(content).html_safe
  end
end
