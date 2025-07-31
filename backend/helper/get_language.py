import re

def get_language(name):
    """
    Detects the language of a torrent based on its name.
    This is a heuristic and may not be 100% accurate.
    """
    name_lower = name.lower()
    
    # List of common language indicators
    lang_indicators = {
        "Russian": [r'\b(rus)\b'],
        "Spanish": [r'\b(spa|esp|spanish)\b'],
        "French": [r'\b(fr|french)\b'],
        "German": [r'\b(ger|german)\b'],
        "Italian": [r'\b(ita|italian)\b'],
        "Hindi": [r'\b(hindi)\b'],
        "Korean": [r'\b(kor|korean)\b'],
        "Japanese": [r'\b(jap|japanese)\b'],
        "Chinese": [r'\b(chs|cht|chinese)\b'],
        "Portuguese": [r'\b(pt|portuguese)\b'],
        "Dutch": [r'\b(nl|dutch)\b'],
        "Swedish": [r'\b(swe|swedish)\b'],
        "Norwegian": [r'\b(nor|norwegian)\b'],
        "Danish": [r'\b(dan|danish)\b'],
        "Finnish": [r'\b(fin|finnish)\b'],
    }

    for lang, patterns in lang_indicators.items():
        for pattern in patterns:
            if re.search(pattern, name_lower):
                return lang
    
    return "English"
