import re

def clean_concatenated_content(text):
    """
    Clean up concatenated search results content that sometimes gets returned as torrent names.
    
    Args:
        text (str): Potentially concatenated content
    
    Returns:
        str: Cleaned individual torrent name
    """
    if not text:
        return text
    
    # If text is extremely long (likely entire page content), return empty
    if len(text) > 2000:
        print(f"Warning: Extremely long text detected ({len(text)} chars), likely entire page content")
        return ""
    
    # Check if this looks like concatenated search results
    concatenation_indicators = [
        "results" in text.lower() and "from" in text.lower(),
        "torrent name size uploader age seed leech" in text.lower(),
        text.count("Posted by") > 2,  # Multiple "Posted by" indicates multiple torrents
        text.count("GB") > 3 and text.count("MB") > 3,  # Multiple file sizes
    ]
    
    if any(concatenation_indicators):
        print(f"Detected concatenated content, attempting to clean...")
        
        # Remove common search headers first
        cleaned = re.sub(r'\w+\s+results\s+\d+-\d+\s+from\s+\d+\s+torrent.*?leech\s*', '', text, flags=re.IGNORECASE)
        
        # Try to extract the first actual torrent name
        # Split by "Posted by" and take the first meaningful part
        if "Posted by" in cleaned:
            parts = cleaned.split("Posted by")
            if len(parts) > 1:
                potential_name = parts[0].strip()
                # Remove any remaining header text
                potential_name = re.sub(r'^.*?(?:seed|leech)\s+', '', potential_name, flags=re.IGNORECASE)
                potential_name = re.sub(r'^\d+\s*', '', potential_name)  # Remove leading numbers
                if potential_name and len(potential_name) > 3:
                    return potential_name.strip()
        
        # If that didn't work, try to find the first meaningful title-like text
        # Look for text that doesn't contain too many numbers/technical terms
        words = text.split()
        potential_titles = []
        current_title = []
        
        for word in words:
            if word.lower() in ['posted', 'by', 'gb', 'mb', 'kb', 'tb']:
                if current_title:
                    potential_titles.append(' '.join(current_title))
                    current_title = []
            elif not re.match(r'^\d+[\w]*$', word):  # Not just numbers
                current_title.append(word)
            
            if len(potential_titles) > 0:
                break
        
        if potential_titles:
            return potential_titles[0].strip()
    
    # If it contains single "Posted by", extract everything before it
    if "Posted by" in text and text.count("Posted by") == 1:
        return text.split("Posted by")[0].strip()
    
    return text

def condense_torrent_name(name, max_length=50):
    """
    Condense long torrent names for better display in download links.
    
    Args:
        name (str): Original torrent name
        max_length (int): Maximum allowed length (default: 50)
    
    Returns:
        str: Condensed name with ellipsis if truncated
    """
    if len(name) <= max_length:
        return name
    
    # Remove common patterns that make names too long
    condensed = name
    
    # Remove quality indicators in parentheses/brackets
    condensed = re.sub(r'\s*[\[\(][^\]\)]*(?:720p|1080p|2160p|4K|BluRay|WEB-DL|WEBRip|HDRip|BRRip|DVDRip|x264|x265|H\.264|H\.265|HEVC|AAC|AC3|DTS|MP3)[^\]\)]*[\]\)]', '', condensed, flags=re.IGNORECASE)
    
    # Remove year in parentheses at the end
    condensed = re.sub(r'\s*\(\d{4}\)\s*$', '', condensed)
    
    # Remove release group info (usually at the end after a dash)
    condensed = re.sub(r'\s*-\s*[A-Z0-9]+\s*$', '', condensed)
    
    # Remove file extension patterns
    condensed = re.sub(r'\.(mkv|mp4|avi|mov|wmv|flv|webm|m4v)$', '', condensed, flags=re.IGNORECASE)
    
    # Remove extra whitespace
    condensed = ' '.join(condensed.split())
    
    # If still too long, truncate and add ellipsis
    if len(condensed) > max_length:
        condensed = condensed[:max_length-3] + '...'
    
    return condensed.strip()

def condense_description(description, max_length=100):
    """
    Condense long descriptions for better display.
    
    Args:
        description (str): Original description
        max_length (int): Maximum allowed length (default: 100)
    
    Returns:
        str: Condensed description with ellipsis if truncated
    """
    if len(description) <= max_length:
        return description
    
    # Find a good breaking point (sentence end or comma)
    break_points = ['. ', '! ', '? ', ', ']
    best_break = 0
    
    for bp in break_points:
        pos = description.rfind(bp, 0, max_length-3)
        if pos > best_break:
            best_break = pos + len(bp)
    
    if best_break > 0:
        return description[:best_break].strip() + '...'
    else:
        return description[:max_length-3] + '...'
