class ActionText::Embed < ApplicationRecord
  include ActionText::Attachable

  # Allowed script src URLs for OEmbeds
  ALLOWED_SCRIPTS = [
    /^https:\/\/embedr.flickr.com/,
    /^\/\/s.imgur.com/,
    /^https:\/\/www.instagram.com/,
    /^https:\/\/platform.twitter.com/
  ]

  # URL patterns for Trix to detect for embedding
  PATTERNS = [
    {source: "^http:\\/\\/([^\\.]+\\.)?flickr\\.com\\/(.*?)", options: ""},
    {source: "^https:\\/\\/([^\\.]+\\.)?flickr\\.com\\/(.*?)", options: ""},
    {source: "^http:\\/\\/flic\\.kr\\/(.*?)", options: ""},
    {source: "^https:\\/\\/flic\\.kr\\/(.*?)", options: ""},
    {source: "^https:\\/\\/([^\\.]+\\.)?imgur\\.com\\/gallery\\/(.*?)", options: ""},
    {source: "^http:\\/\\/([^\\.]+\\.)?imgur\\.com\\/gallery\\/(.*?)", options: ""},
    {source: "^http:\\/\\/instagr\\.am\\/p\\/(.*?)", options: ""},
    {source: "^http:\\/\\/instagram\\.com\\/p\\/(.*?)", options: ""},
    {source: "^http:\\/\\/www\\.instagram\\.com\\/p\\/(.*?)", options: ""},
    {source: "^https:\\/\\/instagr\\.am\\/p\\/(.*?)", options: ""},
    {source: "^https:\\/\\/instagram\\.com\\/p\\/(.*?)", options: ""},
    {source: "^https:\\/\\/www\\.instagram\\.com\\/p\\/(.*?)", options: ""},
    {source: "^http:\\/\\/([^\\.]+\\.)?soundcloud\\.com\\/(.*?)", options: ""},
    {source: "^https:\\/\\/([^\\.]+\\.)?soundcloud\\.com\\/(.*?)", options: ""},
    {source: "^http:\\/\\/open\\.spotify\\.com\\/(.*?)", options: ""},
    {source: "^https:\\/\\/open\\.spotify\\.com\\/(.*?)", options: ""},
    {source: "^http:\\/\\/play\\.spotify\\.com\\/(.*?)", options: ""},
    {source: "^https:\\/\\/play\\.spotify\\.com\\/(.*?)", options: ""},
    {source: "^spotify\\:(.*?)", options: ""},
    {source: "^https:\\/\\/([^\\.]+\\.)?twitter\\.com\\/(.*?)\\/status\\/(.*?)", options: ""},
    {source: "^https:\\/\\/([^\\.]+\\.)?x\\.com\\/(.*?)\\/status\\/(.*?)", options: ""},
    {source: "^http:\\/\\/([^\\.]+\\.)?vimeo\\.com\\/(.*?)", options: ""},
    {source: "^https:\\/\\/([^\\.]+\\.)?vimeo\\.com\\/(.*?)", options: ""},
    {source: "^http:\\/\\/([^\\.]+\\.)?youtube\\.com\\/(.*?)", options: ""},
    {source: "^https:\\/\\/([^\\.]+\\.)?youtube\\.com\\/(.*?)", options: ""},
    {source: "^http:\\/\\/([^\\.]+\\.)?youtu\\.be\\/(.*?)", options: ""},
    {source: "^https:\\/\\/([^\\.]+\\.)?youtu\\.be\\/(.*?)", options: ""}
  ]

  def self.from_url(url)
    find_by!(url: url)
  rescue ActiveRecord::RecordNotFound
    resource = OEmbed::Providers.get(url)
    create(url: url, fields: resource.fields)
  end

  def self.delegate_fields(*keys)
    keys.each do |key|
      define_method(key) do
        fields[key.to_s]
      end
    end
  end

  def self.allowed_script?(node)
    src = node.attr("src")
    return false unless src
    ALLOWED_SCRIPTS.any? { |pattern| pattern.match?(src) }
  end

  delegate_fields(
    :type,
    :version,
    :title,
    :author_name,
    :author_url,
    :provider_name,
    :provider_url,
    :thumbnail_url,
    :thumbnail_width,
    :thumbnail_height,
    :height,
    :width,
    :html
  )

  %w[link photo rich video].each do |embed_type|
    define_method :"#{embed_type}?" do
      type == embed_type
    end
  end

  def to_trix_content_attachment_partial_path
    "action_text/embeds/trix_embed"
  end

  def attachable_plain_text_representation(caption = nil)
    "[#{caption || url}]"
  end
end
