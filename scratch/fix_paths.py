import os
target_dir = r"c:\sem4\FluidHack\frontend_v2\src"

for root, _, files in os.walk(target_dir):
    for f in files:
        if f.endswith(".tsx"):
            filepath = os.path.join(root, f)
            with open(filepath, "r", encoding="utf-8") as file:
                content = file.read()
            
            if '"/psl_giants.png"' in content:
                # Add import at the top after React if it's there
                if "import React" in content or "import " in content:
                    lines = content.split('\n')
                    last_import = 0
                    for i, line in enumerate(lines):
                        if line.startswith("import "):
                            last_import = i
                    lines.insert(last_import + 1, "import pslLogo from '../assets/psl_giants.png';")
                    content = '\n'.join(lines)
                
                content = content.replace('"/psl_giants.png"', '{pslLogo}')
                with open(filepath, "w", encoding="utf-8") as file:
                    file.write(content)

# Fix PSLBranding specifically since it was a direct const assignment
branding = r"c:\sem4\FluidHack\frontend_v2\src\components\PSLBranding.tsx"
with open(branding, "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace('const pslLogo = {pslLogo};', '') # cleanup if we duplicated
with open(branding, "w", encoding="utf-8") as f:
    f.write(text)

print("Done replacing image paths.")
