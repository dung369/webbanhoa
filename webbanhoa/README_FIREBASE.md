Hướng dẫn kết nối Next.js với Firebase

Tổng quan

- File khởi tạo: `lib/firebase.ts` (SDK modular v9+)
- Thao tác: Auth, Firestore, Storage

1. Cài đặt
   Sử dụng npm hoặc yarn (project này dùng npm by default):

npm install firebase

Hoặc với yarn:

yarn add firebase

2. Thiết lập biến môi trường

- Sao chép `.env.local.example` thành `.env.local` và điền giá trị từ Firebase Console -> Project settings -> Your apps
- Lưu ý: `NEXT_PUBLIC_` tiền tố cho phép truy cập từ client

3. Sử dụng trong Next.js

- `lib/firebase.ts` xuất ra `firebase`, `auth`, `firestore`, `storage`.
- Ví dụ dùng trong một component client (React):

import { useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function Example() {
useEffect(() => {
const unsub = onAuthStateChanged(auth, user => {
console.log('user', user)
})
return () => unsub()
}, [])

return <div>Check console for auth state</div>
}

4. Ví dụ Firestore (client hoặc server)
   import { firestore } from '@/lib/firebase'
   import { collection, addDoc, getDocs } from 'firebase/firestore'

// add document
await addDoc(collection(firestore, 'orders'), { total: 12.5, createdAt: new Date() })

// get documents
const snap = await getDocs(collection(firestore, 'orders'))
const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))

5. Storage upload (client)
   import { storage } from '@/lib/firebase'
   import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const fileRef = ref(storage, `uploads/${file.name}`)
await uploadBytes(fileRef, file)
const url = await getDownloadURL(fileRef)

6. Server-side / Admin

- Nếu bạn cần quyền cao hơn (service account), dùng Firebase Admin SDK on server only.
- Không commit service account keys to repo. Store them in environment variables or secret manager.

7. Lưu ý

- `lib/firebase.ts` kiểm tra `getApps()` để tránh khởi tạo nhiều lần trong hot-reload.
- Nếu gặp lỗi `Missing required Firebase env vars`, kiểm tra `.env.local` và next.config / runtime env.

Nếu bạn muốn, tôi có thể:

- Cài `firebase` vào dự án (npm install) và chạy dev để kiểm tra.
- Thêm helper hooks cho Auth (useUser) hoặc mẫu API route để tạo user / token.
