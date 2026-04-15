import os
import re

def clean_text(text):
    # Common replacements
    text = text.replace('—', '-')
    text = text.replace('°', ' degC')
    text = text.replace('├──', '|--')
    text = text.replace('└──', '`--')
    text = text.replace('──', '--')
    text = text.replace('✅', '[OK]')
    text = text.replace('❌', '[X]')
    text = text.replace('🚀', '[START]')
    text = text.replace('🔔', '[ALERT]')
    text = text.replace('⚠️', '[WARN]')
    text = text.replace('⌛', '[WAIT]')
    text = text.replace('📁', '[FILE]')
    text = text.replace('☁️', '[CLOUD]')
    text = text.replace('🔄', '[SYNC]')
    text = text.replace('➡', '->')
    text = text.replace('–', '-') # en-dash
    
    # Replace remaining non-ASCII decorative lines (box drawing)
    # \u2500-\u257F is the box drawing range
    text = re.sub(r'[\u2500-\u257F]+', lambda m: '=' * len(m.group(0)), text)
    
    # Generic non-ASCII stripper for any leftovers
    def char_replacer(match):
        char = match.group(0)
        # If it's something we missed, just use a placeholder
        return '?'
    
    # Only keep printable ASCII
    return re.sub(r'[^\x00-\x7F]', char_replacer, text)

def process_dir(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                print(f"Cleaning: {path}")
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                cleaned = clean_text(content)
                
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(cleaned)

if __name__ == "__main__":
    process_dir('glue')
    process_dir('sentinel_core')
    # Also catch the loose ones
    for f in ['defillama_refi.py', 'test_keys.py', 'weather_fetching.py']:
        if os.path.exists(f):
            print(f"Cleaning: {f}")
            with open(f, 'r', encoding='utf-8') as file:
                content = file.read()
            cleaned = clean_text(content)
            with open(f, 'w', encoding='utf-8') as file:
                file.write(cleaned)
