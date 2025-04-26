# app/lib/markdown_renderer/html_with_copy.rb
class Render::HTML < Redcarpet::Render::HTML
  def block_code(code, language)
    <<~HTML
      <div class="relative group">
        <button 
          type="button"
          data-controller="clipboard"
          data-clipboard-target="button"
          data-clipboard-code="#{ERB::Util.html_escape(code)}"
          class="absolute top-2 right-2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
        >
          Copy
        </button>
        <pre><code class="language-#{language}">#{ERB::Util.html_escape(code)}</code></pre>
      </div>
    HTML
  end
end
