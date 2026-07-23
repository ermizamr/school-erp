import os
import re

dir_path = 'web/src/pages/teacher'

# 1. Update imports
def patch_file(filename):
    filepath = os.path.join(dir_path, filename)
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # skip if already using demoHelpers
    if 'demoHelpers' in content: return

    # Add import
    content = content.replace("import { supabase } from '../../supabaseClient';", "import { supabase } from '../../supabaseClient';\nimport { getTeacherIdFallback } from '../../utils/demoHelpers';")
    
    # Replace the fetch logic
    # Pattern 1:
    content = re.sub(
        r"const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\);\s*const tid = user\?\.id(?:\s*\|\|\s*DEMO_TEACHER_ID)?;\s*setTeacherId\(tid\);",
        "const tid = await getTeacherIdFallback();\n    setTeacherId(tid);",
        content
    )
    
    # Pattern 2: (TeacherAttendance)
    content = re.sub(
        r"const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\);\s*const tid = user\?\.id(?:\s*\|\|\s*DEMO_TEACHER_ID)?;",
        "const tid = await getTeacherIdFallback();",
        content
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched {filename}")

for f in ['TeacherExams.jsx', 'TeacherGradebook.jsx', 'TeacherLessonPlans.jsx', 'TeacherMaterials.jsx', 'TeacherAssignments.jsx', 'TeacherAttendance.jsx', 'TeacherReports.jsx']:
    patch_file(f)
