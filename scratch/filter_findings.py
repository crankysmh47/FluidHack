import os
import re

def filter_findings():
    findings_file = r'C:\sem4\FluidHack\scratch\emoji_findings.txt'
    filtered_file = r'C:\sem4\FluidHack\scratch\emoji_findings_filtered.txt'
    
    with open(findings_file, 'r', encoding='utf-8') as f, open(filtered_file, 'w', encoding='utf-8') as out:
        for line in f:
            # Only look for python files and exclude out/ node_modules/ .venv/
            if '.py:' in line and not any(x in line for x in ['node_modules', '.venv', 'contracts\\out']):
                out.write(line)

if __name__ == "__main__":
    filter_findings()
