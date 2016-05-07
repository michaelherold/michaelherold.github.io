module ExpandedExcerptFilter
  # Strips out content except for an expanded excerpt.
  #
  # @param [String] content The post content.
  # @param [String] splitter The marker for an expanded excerpt.
  #
  # @return [String] The expanded excerpt.
  def expanded_excerpt(content, splitter = "<!-- more -->")
    split_content(content, splitter).first
  end

  # Strips an expanded exercept out of content.
  #
  # @param [String] content The post content.
  # @param [String] splitter The marker for an expanded excerpt.
  #
  # @return [String] The content without the excerpt.
  def without_excerpt(content, splitter = "<!-- more -->")
    split_content(content, splitter).last
  end

  private

  def split_content(content, splitter)
    content.split(splitter)
  end
end

Liquid::Template.register_filter(ExpandedExcerptFilter)
