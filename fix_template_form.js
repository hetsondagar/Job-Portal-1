const fs = require('fs');

// Read the file
let content = fs.readFileSync('client/app/employer-dashboard/job-templates/page.tsx', 'utf8');

// Remove the category field from the create form (around line 657-669)
content = content.replace(
  /          <div>\n            <Label htmlFor="category">Category \*<\/Label>\n            <Select value={formData\.category} onValueChange=\{\(value\) => setFormData\(prev => \(\{ \.\.\.prev, category: value \}\)\)\}>\n              <SelectTrigger>\n                <SelectValue placeholder="Select category" \/>\n              <\/SelectTrigger>\n              <SelectContent>\n                <SelectItem value="technical">Technical<\/SelectItem>\n                <SelectItem value="non-technical">Non-Technical<\/SelectItem>\n                <SelectItem value="management">Management<\/SelectItem>\n              <\/SelectContent>\n            <\/Select>\n          <\/div>/g,
  ''
);

// Also remove the grid wrapper and make it a single column
content = content.replace(
  /        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">\n          <div>\n            <Label htmlFor="name">Template Name \*<\/Label>\n            <Input\n              id="name"\n              value={formData\.name}\n              onChange=\{\(e\) => setFormData\(prev => \(\{ \.\.\.prev, name: e\.target\.value \}\)\)\}\n              placeholder="e\.g\., Senior Software Engineer"\n              required\n            \/>\n          <\/div>\n        <\/div>/g,
  '        <div>\n          <Label htmlFor="name">Template Name *</Label>\n          <Input\n            id="name"\n            value={formData.name}\n            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}\n            placeholder="e.g., Senior Software Engineer"\n            required\n          />\n        </div>'
);

// Write the file back
fs.writeFileSync('client/app/employer-dashboard/job-templates/page.tsx', content);

console.log('✅ Removed category field from create template form');

