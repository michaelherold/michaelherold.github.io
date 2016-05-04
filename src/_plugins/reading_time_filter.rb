module ReadingTimeFilter
  WORDS_PER_MINUTE = {
    :adult           => 250,
    :college_student => 300,
    :slow_reader     => 200,
  }.freeze

  # Estimates the reading time for a piece of content.
  #
  # @param [String] content The content to estimate.
  # @param [Integer] speed The average words per minute to calculate.
  # @return [String]
  def reading_time(content, speed = WORDS_PER_MINUTE[:adult])
    words = content.split.size
    minutes = (words / speed).floor

    case minutes
    when 0 then "less than one minute"
    when 1 then "about a minute"
    else "about #{minutes} minutes"
    end
  end
end

Liquid::Template.register_filter(ReadingTimeFilter)
