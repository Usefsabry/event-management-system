# 🚀 Postman Quick Testing Guide

## 📥 Import Files

### استخدم الملفات الجديدة:
- `Postman_Collection_Simple.json` ← الـ Collection
- `Postman_Environment_Simple.json` ← الـ Environment

### خطوات Import:
1. افتح Postman
2. اضغط **Import** (في الشمال فوق)
3. اختار **Upload Files**
4. اختار الملفين
5. اضغط **Import**

---

## ⚙️ Setup Environment

1. في الشمال فوق، اختار **Event Management Environment**
2. تأكد إن `baseUrl` = `http://localhost:5000`

---

## 🧪 Testing Flow (بالترتيب)

### 1️⃣ Health Check
```
GET /api/health
```
- **Expected**: 200 OK ✅
- **يتأكد السيرفر شغال**

### 2️⃣ Register User  
```
POST /api/auth/register
```
- **Body موجود جاهز**
- **Expected**: 201 Created ✅
- **هيحفظ token تلقائي**

### 3️⃣ Login (اختياري)
```
POST /api/auth/login  
```
- **Expected**: 200 OK ✅
- **هيحدث token**

### 4️⃣ Get Profile
```
GET /api/auth/profile
```  
- **Expected**: 200 OK ✅
- **يتأكد Authentication شغال**

### 5️⃣ Create Category
```
POST /api/categories
```
- **Expected**: 201 Created ✅  
- **هيحفظ categoryId تلقائي**

### 6️⃣ Get Categories
```
GET /api/categories
```
- **Expected**: 200 OK ✅

### 7️⃣ Create Event  
```
POST /api/events
```
- **Expected**: 201 Created ✅
- **هيحفظ eventId تلقائي**

### 8️⃣ Get Events
```
GET /api/events
```
- **Expected**: 200 OK ✅

### 9️⃣ Search Events
```
GET /api/events?search=react
```
- **Expected**: 200 OK ✅

### 🔟 Register for Event
```
POST /api/events/{eventId}/register
```
- **Expected**: 201 Created ✅

---

## 🎯 Quick Tests

### ✅ Success Tests
- كل الـ endpoints فوق لازم تشتغل
- Responses تبقا 200/201  
- Data ترجع صح

### ❌ Error Tests  
- جرب Get Profile **بدون token**
- جرب Register **بـ email مكرر**
- جرب Create Event **بـ invalid data**

---

## 🔍 Troubleshooting

### مشكلة: Server not running
**الحل**: 
```bash
cd backend
npm run dev
```

### مشكلة: 401 Unauthorized
**الحل**: تأكد من token في Environment

### مشكلة: Variables not saving  
**الحل**: تأكد من Environment مختار صح

---

## 📊 Expected Results

| Endpoint | Method | Status | Response |
|----------|--------|--------|----------|
| Health Check | GET | 200 | success: true |
| Register | POST | 201 | user + token |
| Login | POST | 200 | user + token |
| Profile | GET | 200 | user data |
| Create Category | POST | 201 | category data |
| Get Categories | GET | 200 | categories array |
| Create Event | POST | 201 | event data |
| Get Events | GET | 200 | events array |
| Register Event | POST | 201 | registration data |

---

## 🎉 Success!

لما كل الاختبارات تنجح، يبقا الـ API شغال 100% ✅

**الآن جاهز للـ Frontend!** 🚀