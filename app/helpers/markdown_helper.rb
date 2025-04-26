module MarkdownHelper
  def render_markdown(text)
    renderer = MarkdownRenderer.new(filter_html: true, hard_wrap: true)
    options = {
      autolink: true,
      fenced_code_blocks: true,
      tables: true,
      strikethrough: true,
      lax_spacing: true,
      space_after_headers: true
    }
    markdown = Redcarpet::Markdown.new(renderer, options)
    markdown.render(text).html_safe
  end
end
