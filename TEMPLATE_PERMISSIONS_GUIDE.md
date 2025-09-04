# Template Permission Controls - Implementation Guide

## 🔒 Overview

The job template system now includes comprehensive permission controls to ensure that only template creators can modify their own templates. This prevents unauthorized access and maintains data integrity.

## ✅ What's Been Implemented

### 1. **Frontend Permission Controls**

#### Template Management Page (`/employer-dashboard/job-templates`)
- **Edit Button**: Only visible for templates created by the current user
- **Delete Button**: Only visible for templates created by the current user  
- **Toggle Public/Private Button**: Only visible for templates created by the current user
- **Copy Button**: Available for all templates (read-only operation)
- **Create Job Button**: Available for all templates

#### Visual Indicators
- **"My Template" Badge**: Blue badge with user icon for own templates
- **"Shared" Badge**: Gray badge with users icon for others' templates
- **Public/Private Badges**: Show current visibility status

#### Job Posting Page Template Dialog
- **Ownership Indicators**: Shows "My Template" vs "Shared" badges
- **Permission Message**: Explains that only creators can edit/change privacy
- **Use Template**: Available for all templates

### 2. **Backend Permission Controls**

#### API Endpoints with Ownership Checks

##### Update Template (`PUT /job-templates/:id`)
```javascript
// Only allows template creator to update
const template = await JobTemplate.findOne({
  where: {
    id,
    createdBy: req.user.id,  // ← Ownership check
    isActive: true
  }
});
```

##### Delete Template (`DELETE /job-templates/:id`)
```javascript
// Only allows template creator to delete
const template = await JobTemplate.findOne({
  where: {
    id,
    createdBy: req.user.id,  // ← Ownership check
    isActive: true
  }
});
```

##### Toggle Public/Private (`PATCH /job-templates/:id/toggle-public`)
```javascript
// Only allows template creator to toggle visibility
const template = await JobTemplate.findOne({
  where: {
    id,
    createdBy: req.user.id,  // ← Ownership check
    isActive: true
  }
});
```

#### Public Access Endpoints
- **Get Templates** (`GET /job-templates`): Returns public templates + user's own templates
- **Get Template by ID** (`GET /job-templates/:id`): Returns if public OR user's own
- **Use Template** (`POST /job-templates/:id/use`): Available for public templates + user's own
- **Create Job from Template** (`POST /job-templates/:id/create-job`): Available for public templates + user's own

### 3. **Security Features**

#### Database Level
- **Template Ownership**: Each template has a `createdBy` field linking to the user
- **Soft Delete**: Templates are marked as `isActive: false` instead of hard deletion
- **Audit Trail**: Templates track creation and modification timestamps

#### API Level
- **Authentication Required**: All modification endpoints require valid JWT token
- **Ownership Verification**: Server checks `createdBy` field before allowing modifications
- **Error Handling**: Returns appropriate 404/403 errors for unauthorized access

#### Frontend Level
- **UI Hiding**: Buttons for unauthorized actions are not rendered
- **Visual Feedback**: Clear indicators show template ownership
- **User Education**: Helpful messages explain permission restrictions

## 🎯 Permission Matrix

| Action | Own Template | Others' Public Template | Others' Private Template |
|--------|-------------|------------------------|-------------------------|
| View | ✅ | ✅ | ❌ |
| Use/Copy | ✅ | ✅ | ❌ |
| Create Job From | ✅ | ✅ | ❌ |
| Edit | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ |
| Toggle Public/Private | ✅ | ❌ | ❌ |

## 🔧 Implementation Details

### Frontend Conditional Rendering
```tsx
{/* Only show edit button for user's own templates */}
{template.createdBy === user?.id && (
  <Button onClick={() => handleEditTemplate(template)}>
    <Edit className="w-4 h-4" />
  </Button>
)}
```

### Backend Ownership Check
```javascript
const template = await JobTemplate.findOne({
  where: {
    id,
    createdBy: req.user.id,  // Ensures only creator can modify
    isActive: true
  }
});

if (!template) {
  return res.status(404).json({
    success: false,
    message: 'Template not found or access denied'
  });
}
```

### Visual Ownership Indicators
```tsx
{template.createdBy === user?.id ? (
  <Badge className="bg-blue-50 text-blue-700">
    <User className="w-3 h-3 mr-1" />
    My Template
  </Badge>
) : (
  <Badge className="bg-gray-50 text-gray-600">
    <Users className="w-3 h-3 mr-1" />
    Shared
  </Badge>
)}
```

## 🧪 Testing

### Test Scripts Available
1. **`test-template-permissions.js`**: Tests backend permission enforcement
2. **`test-template-workflow.js`**: Tests complete template-to-job workflow

### Manual Testing Steps
1. Create a template as User A
2. Login as User B
3. Verify User B cannot see edit/delete/toggle buttons
4. Verify User B can still use the template to create jobs
5. Verify User A can still modify their own template

## 🚀 Benefits

1. **Data Security**: Prevents unauthorized template modifications
2. **User Trust**: Users know their templates are protected
3. **Clear Ownership**: Visual indicators show who owns what
4. **Flexible Sharing**: Public templates can be used by anyone
5. **Audit Trail**: All changes are tracked and attributable

## 📝 Notes

- **System Templates**: Created by system user, visible to all but not editable
- **Public Templates**: Can be used by anyone but only edited by creator
- **Private Templates**: Only visible and usable by creator
- **Template Usage**: All users can use any template they have access to
- **Job Creation**: Not restricted by template ownership

The permission system ensures a secure, user-friendly experience where template creators maintain control over their content while allowing others to benefit from shared templates.
