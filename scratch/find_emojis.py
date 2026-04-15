import os
import re

def find_non_ascii():
    emoji_pattern = re.compile('[^\x00-\x7F]+')
    workspace_root = r'C:\sem4\FluidHack'
    
    output_file = os.path.join(workspace_root, 'scratch', 'emoji_findings.txt')
    
    findings_count = 0
    with open(output_file, 'w', encoding='utf-8') as out:
        for root, dirs, files in os.walk(workspace_root):
            if any(x in root for x in ['.venv', 'node_modules', '.git', '.vite', '.cache']):
                continue
                
            for file in files:
                if file.endswith(('.py', '.json', '.jsonl', '.env', '.toml', '.md')):
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            for i, line in enumerate(f, 1):
                                if emoji_pattern.search(line):
                                    # Encode to ascii representation for safe logging
                                    safe_line = line.encode('unicode_escape').decode('ascii')
                                    out.write(f"{file_path}:{i}: {safe_line}\n")
                                    findings_count += 1
                    except Exception as e:
                        pass
    
    print(f"Executed search. Found {findings_count} lines with non-ASCII characters.")
    print(f"Results written to: {output_file}")

if __name__ == "__main__":
    find_non_ascii()
