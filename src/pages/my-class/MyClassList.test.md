# Manual Test Plan for MyClassList Page

## 1. Test Environment
- Browser: Chrome, Firefox, Edge
- Device: Desktop, Tablet, Mobile
- Screen Resolution: 1920x1080, 1366x768, 375x667

## 2. Test Cases

### 2.1. Search Functionality
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC-001 | Search with empty input | 1. Navigate to MyClassList page<br>2. Leave search box empty<br>3. Wait for 500ms | All classes should be displayed |
| TC-002 | Search with valid text | 1. Navigate to MyClassList page<br>2. Enter "Math" in search box<br>3. Wait for 500ms | Only classes containing "Math" should be displayed |
| TC-003 | Search with non-existent text | 1. Navigate to MyClassList page<br>2. Enter "XYZ123" in search box<br>3. Wait for 500ms | No classes should be displayed |

### 2.2. Create New Class
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC-004 | Create class with valid data | 1. Click "+" button<br>2. Enter title "Test Class"<br>3. Enter description "Test Description"<br>4. Click "Add" button | 1. Modal should close<br>2. New class should appear in list<br>3. Success toast should show |
| TC-005 | Create class with empty fields | 1. Click "+" button<br>2. Leave fields empty<br>3. Click "Add" button | 1. Form should show validation errors<br>2. Modal should not close |
| TC-006 | Cancel class creation | 1. Click "+" button<br>2. Enter some data<br>3. Click "Cancel" button | 1. Modal should close<br>2. No new class should be created |

### 2.3. Share Class
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC-007 | Share class code | 1. Click share icon on a class<br>2. Check share code<br>3. Click "Copy" button | 1. Share modal should open<br>2. Code should be displayed<br>3. Success toast should show |
| TC-008 | Accept join request | 1. Open share modal<br>2. Click "Accept" on a pending request | 1. Request should be marked as accepted<br>2. Success toast should show |
| TC-009 | Reject join request | 1. Open share modal<br>2. Click "Reject" on a pending request | 1. Request should be marked as rejected<br>2. Success toast should show |

### 2.4. Join Class
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC-010 | Join with valid code | 1. Enter valid class code<br>2. Click "Join Class" button | 1. Success toast should show<br>2. Class should appear in joined classes |
| TC-011 | Join with invalid code | 1. Enter invalid class code<br>2. Click "Join Class" button | Error toast should show |
| TC-012 | Join with empty code | 1. Leave code field empty<br>2. Click "Join Class" button | Error toast should show |

### 2.5. Delete Class
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC-013 | Delete class confirmation | 1. Click delete icon on a class<br>2. Check confirmation modal | 1. Delete confirmation modal should open<br>2. Class name should be displayed |
| TC-014 | Confirm delete | 1. Open delete modal<br>2. Click "Delete" button | 1. Class should be removed from list<br>2. Success toast should show |
| TC-015 | Cancel delete | 1. Open delete modal<br>2. Click "Cancel" button | 1. Modal should close<br>2. Class should remain in list |

### 2.6. Navigation
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC-016 | Navigate to class folder | 1. Click on a class card | Should navigate to class folder page |
| TC-017 | Navigate to joined class | 1. Click on a joined class card | Should navigate to joined class folder page |

### 2.7. Responsive Design
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC-018 | Desktop view | 1. View on 1920x1080 screen | 3 columns of classes should be displayed |
| TC-019 | Tablet view | 1. View on 768x1024 screen | 2 columns of classes should be displayed |
| TC-020 | Mobile view | 1. View on 375x667 screen | 1 column of classes should be displayed |

## 3. Error Handling
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC-021 | Network error | 1. Disable network<br>2. Try to load page | Error message should be displayed |
| TC-022 | API error | 1. Force API error<br>2. Try to create class | Error toast should show |

## 4. Performance
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC-023 | Load time | 1. Measure page load time | Should load within 3 seconds |
| TC-024 | Search performance | 1. Enter search term<br>2. Measure response time | Should respond within 500ms |

## 5. Security
| Test Case ID | Description | Steps | Expected Result |
|--------------|-------------|-------|-----------------|
| TC-025 | Unauthorized access | 1. Try to access without login | Should redirect to login page |
| TC-026 | XSS prevention | 1. Try to inject script in class title | Script should be escaped |

## 6. Test Results Template
| Test Case ID | Status | Notes |
|--------------|--------|-------|
| TC-001 | | |
| TC-002 | | |
| ... | | |

## 7. Notes
- All test cases should be executed in all supported browsers
- Test data should be prepared before testing
- Screenshots should be taken for any issues found
- Test results should be documented in the template above 